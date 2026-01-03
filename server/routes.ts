import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { resolveTrip, getAvailableCountries, getCartaPolicy, assess, assessWithApi } from "./rules-engine";
import { generateLetter, generateLetterBuffer, generateDocxLetter, generateLetterDocx, requestToMergeData } from "./letter-generator";
import { tripInputSchema, letterRequestSchema, assessInputSchema, insertNotificationSchema } from "@shared/schema";

// ISO2 to ISO3 country code mapping
const iso2ToIso3: Record<string, string> = {
  US: "USA", GB: "GBR", DE: "DEU", FR: "FRA", CA: "CAN", AU: "AUS",
  JP: "JPN", CN: "CHN", IN: "IND", BR: "BRA", MX: "MEX", IT: "ITA",
  ES: "ESP", NL: "NLD", CH: "CHE", SE: "SWE", NO: "NOR", DK: "DNK",
  FI: "FIN", BE: "BEL", AT: "AUT", IE: "IRL", PT: "PRT", PL: "POL",
  CZ: "CZE", HU: "HUN", RO: "ROU", BG: "BGR", HR: "HRV", SK: "SVK",
  SI: "SVN", EE: "EST", LV: "LVA", LT: "LTU", GR: "GRC", CY: "CYP",
  MT: "MLT", LU: "LUX", IS: "ISL", NZ: "NZL", SG: "SGP", HK: "HKG",
  KR: "KOR", TW: "TWN", MY: "MYS", TH: "THA", VN: "VNM", PH: "PHL",
  ID: "IDN", AE: "ARE", SA: "SAU", IL: "ISR", TR: "TUR", ZA: "ZAF",
  EG: "EGY", NG: "NGA", KE: "KEN", MA: "MAR", AR: "ARG", CL: "CHL",
  CO: "COL", PE: "PER", VE: "VEN", RU: "RUS", UA: "UKR", QA: "QAT",
  KW: "KWT", BH: "BHR", OM: "OMN", JO: "JOR", LB: "LBN", PK: "PAK",
  BD: "BGD", LK: "LKA", NP: "NPL", MM: "MMR", KH: "KHM", LA: "LAO",
};

// Cache for map data (expires after 10 minutes)
type MapColor = "green" | "yellow" | "orange" | "red" | "gray";

// Static visa requirement data for US passport holders (most common use case)
// This avoids rate-limiting issues with the Travel Buddy API for map coloring
const usPassportVisaData: Record<string, MapColor> = {
  // Visa-free (green)
  CA: "green", MX: "green", // North America
  GB: "yellow", // UK now requires ETA
  FR: "green", DE: "green", IT: "green", ES: "green", NL: "green", BE: "green", // EU Schengen
  AT: "green", CH: "green", PT: "green", GR: "green", PL: "green", CZ: "green", // More EU
  HU: "green", SE: "green", NO: "green", DK: "green", FI: "green", IE: "green", // Nordic + IE
  JP: "green", KR: "green", SG: "green", HK: "green", TW: "green", // Asia visa-free
  AU: "yellow", NZ: "yellow", // Oceania (ETA required)
  BR: "green", AR: "green", CL: "green", PE: "green", CO: "green", // South America
  IL: "green", // Israel
  AE: "green", QA: "green", // Gulf (visa on arrival/visa-free)
  ZA: "green", MA: "green", // Africa visa-free
  TR: "yellow", // Turkey eVisa
  TH: "green", MY: "green", PH: "green", // Southeast Asia visa-free
  // eVisa available (orange)
  IN: "orange", VN: "orange", KE: "orange", EG: "orange", // eVisa countries
  // Visa required (red)
  CN: "red", RU: "red", SA: "red", NG: "red", // Visa required
};

// Generic visa requirements for other passports (simplified)
const genericVisaData: Record<string, MapColor> = {
  // Most countries require visas for most passports by default
  // This is a fallback
};

function getVisaColorForPassport(passport: string, destination: string): MapColor {
  if (passport === "US") {
    return usPassportVisaData[destination] || "gray";
  }
  // For other passports, use the local rules engine or return gray
  return "gray";
}

const wsClients = new Set<WebSocket>();

export function broadcastNotification(notification: any) {
  const message = JSON.stringify({ type: "notification", data: notification });
  Array.from(wsClients).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  
  wss.on("connection", (ws) => {
    wsClients.add(ws);
    ws.on("close", () => {
      wsClients.delete(ws);
    });
    ws.on("error", () => {
      wsClients.delete(ws);
    });
  });

  // Notification endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    try {
      await storage.markAllNotificationsRead();
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const parsed = insertNotificationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid notification data", details: parsed.error.errors });
      }
      const notification = await storage.createNotification(parsed.data);
      broadcastNotification(notification);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // Mapbox token endpoint for frontend
  app.get("/api/config/mapbox", (req, res) => {
    const token = process.env.MAPBOX_PUBLIC_KEY;
    if (!token) {
      return res.status(404).json({ error: "Mapbox token not configured" });
    }
    res.json({ token });
  });

  // Map of visa requirements for all destinations for a given passport
  // Uses Travel Buddy Visa Map API for comprehensive 210+ country coverage
  // Falls back to curated data if API unavailable
  app.get("/api/map", async (req, res) => {
    const passport = (req.query.passport as string)?.toUpperCase();
    
    if (!passport || passport.length < 2) {
      return res.status(400).json({ error: "Missing or invalid passport query parameter" });
    }

    const colorsByIso3: Record<string, MapColor> = {};
    let dataSource = "curated";
    
    // Try the Visa Map API first for comprehensive coverage
    const { fetchVisaMap } = await import("./lib/travelBuddyClient");
    const apiResult = await fetchVisaMap(passport);
    
    if (apiResult?.data?.colors) {
      dataSource = "api";
      const { colors } = apiResult.data;
      
      // Parse comma-separated country codes from API response
      // API colors: red (visa required), green (visa-free), blue (visa on arrival/eVisa), yellow (ETA)
      if (colors.green) {
        for (const code of colors.green.split(",")) {
          const iso3 = iso2ToIso3[code.trim()] || code.trim();
          colorsByIso3[iso3] = "green";
        }
      }
      if (colors.yellow) {
        for (const code of colors.yellow.split(",")) {
          const iso3 = iso2ToIso3[code.trim()] || code.trim();
          colorsByIso3[iso3] = "yellow";
        }
      }
      if (colors.blue) {
        for (const code of colors.blue.split(",")) {
          const iso3 = iso2ToIso3[code.trim()] || code.trim();
          colorsByIso3[iso3] = "orange"; // Map blue (visa on arrival/eVisa) to orange
        }
      }
      if (colors.red) {
        for (const code of colors.red.split(",")) {
          const iso3 = iso2ToIso3[code.trim()] || code.trim();
          colorsByIso3[iso3] = "red";
        }
      }
    } else {
      // Fallback to curated visa data
      const destinations = getAvailableCountries();
      const today = new Date().toISOString().split("T")[0];
      
      for (const dest of destinations) {
        const iso3 = iso2ToIso3[dest.code] || dest.code;
        
        // First check curated visa data for common passport holders
        const curatedColor = getVisaColorForPassport(passport, dest.code);
        if (curatedColor !== "gray") {
          colorsByIso3[iso3] = curatedColor;
          continue;
        }
        
        // Fallback to local rules engine
        try {
          const assessment = assess({
            citizenship: passport,
            destination: dest.code,
            purpose: "BUSINESS",
            durationDays: 14,
            travelDate: today,
            isUSEmployerSponsored: false,
          });

          const entryType = assessment.entryType;
          let color: MapColor = "gray";
          
          if (entryType === "NONE") {
            color = "green";
          } else if (entryType === "ETA" || entryType === "EVISA") {
            color = "yellow";
          } else if (entryType === "VISA") {
            color = "red";
          }

          colorsByIso3[iso3] = color;
        } catch (e) {
          colorsByIso3[iso3] = "gray";
        }
      }
    }

    res.json({
      passport,
      generatedAt: new Date().toISOString(),
      dataSource,
      colorsByIso3,
      legend: {
        green: "Visa-free",
        yellow: "ETA/Registration required",
        orange: "Visa on arrival/eVisa",
        red: "Visa required",
        gray: "Unknown",
      },
    });
  });

  // Health check for visa/travel requirements system
  app.get("/api/visa-health", async (req, res) => {
    const health: {
      status: "healthy" | "degraded" | "unhealthy";
      rulesEngine: { status: string; countriesCount: number };
      travelBuddyApi: { status: string; message?: string };
      timestamp: string;
    } = {
      status: "healthy",
      rulesEngine: { status: "ok", countriesCount: 0 },
      travelBuddyApi: { status: "unknown", message: undefined },
      timestamp: new Date().toISOString(),
    };

    try {
      const countries = getAvailableCountries();
      health.rulesEngine = { status: "ok", countriesCount: countries.length };
    } catch (e) {
      health.rulesEngine = { status: "error", countriesCount: 0 };
      health.status = "degraded";
    }

    const apiKey = process.env.TRAVEL_BUDDY_API_KEY;
    if (!apiKey) {
      health.travelBuddyApi = { status: "not_configured", message: "API key not set" };
    } else {
      health.travelBuddyApi = { status: "configured" };
    }

    res.json(health);
  });

  // Get all countries (from storage - original functionality)
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  // Get country by ID (original functionality)
  app.get("/api/countries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const country = await storage.getCountryById(id);
      
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }
      
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch country details" });
    }
  });

  // Search countries (original functionality)
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const countries = await storage.searchCountries(query);
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // === NEW: Trip Resolution API ===
  
  // Get available countries for the trip form
  app.get("/api/trip/countries", (req, res) => {
    try {
      const countries = getAvailableCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  // Get Carta policy
  app.get("/api/trip/policy", (req, res) => {
    try {
      const policy = getCartaPolicy();
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch policy" });
    }
  });

  // Resolve trip - match inputs to rules
  app.post("/api/trip/resolve", (req, res) => {
    try {
      const parsed = tripInputSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid trip input",
          details: parsed.error.flatten()
        });
      }
      
      const result = resolveTrip(parsed.data);
      res.json(result);
    } catch (error) {
      console.error("Trip resolution error:", error);
      res.status(500).json({ error: "Failed to resolve trip requirements" });
    }
  });

  // Generate invitation letter
  app.post("/api/letters/generate", (req, res) => {
    try {
      const parsed = letterRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid letter request",
          details: parsed.error.flatten()
        });
      }
      
      const letterContent = generateLetter(parsed.data);
      
      res.json({
        success: true,
        content: letterContent,
        template: parsed.data.template
      });
    } catch (error) {
      console.error("Letter generation error:", error);
      res.status(500).json({ error: "Failed to generate letter" });
    }
  });

  // Download invitation letter as text file
  app.post("/api/letters/download", (req, res) => {
    try {
      const parsed = letterRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid letter request",
          details: parsed.error.flatten()
        });
      }
      
      const buffer = generateLetterBuffer(parsed.data);
      const filename = `invitation_letter_${parsed.data.template}_${Date.now()}.txt`;
      
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Letter download error:", error);
      res.status(500).json({ error: "Failed to download letter" });
    }
  });

  // Assess endpoint - simplified API matching Next.js pattern
  // Uses async assessWithApi for live visa intelligence fallback
  app.post("/api/assess", async (req, res) => {
    try {
      const parsed = assessInputSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid assess request",
          details: parsed.error.flatten()
        });
      }
      
      const result = await assessWithApi(parsed.data);
      res.json(result);
    } catch (error) {
      console.error("Assess error:", error);
      res.status(500).json({ error: "Failed to assess trip requirements" });
    }
  });

  // DOCX letter generation endpoint - matches Next.js pattern
  app.post("/api/letters/docx", (req, res) => {
    try {
      const { templateId, merge } = req.body;
      
      if (!templateId || typeof templateId !== "string") {
        return res.status(400).json({ error: "templateId is required" });
      }
      
      if (!merge || typeof merge !== "object") {
        return res.status(400).json({ error: "merge object is required" });
      }
      
      try {
        const result = generateDocxLetter(templateId, merge);
        res.setHeader("Content-Type", result.contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
        res.send(result.buffer);
      } catch (templateError: any) {
        if (templateError.message?.includes("Template not found")) {
          return res.status(404).json({ error: "Template not found" });
        }
        return res.status(400).json({ 
          error: "Template render failed", 
          details: templateError.message 
        });
      }
    } catch (error) {
      console.error("DOCX generation error:", error);
      res.status(500).json({ error: "Failed to generate DOCX letter" });
    }
  });

  return httpServer;
}
