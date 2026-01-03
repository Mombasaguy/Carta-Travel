import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all countries
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  // Get country by ID
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

  // Search countries
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const countries = await storage.searchCountries(query);
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  return httpServer;
}
