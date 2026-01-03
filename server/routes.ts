import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { resolveTrip, getAvailableCountries, getCartaPolicy, assess } from "./rules-engine";
import { generateLetter, generateLetterBuffer, generateDocxLetter, generateLetterDocx, requestToMergeData } from "./letter-generator";
import { tripInputSchema, letterRequestSchema, assessInputSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
  app.post("/api/assess", (req, res) => {
    try {
      const parsed = assessInputSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid assess request",
          details: parsed.error.flatten()
        });
      }
      
      const result = assess(parsed.data);
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
