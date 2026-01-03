import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Country schema
export const countrySchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  region: z.string(),
  flagEmoji: z.string(),
  imageUrl: z.string().optional(),
  visaRequired: z.boolean(),
  visaOnArrival: z.boolean(),
  eVisaAvailable: z.boolean(),
  maxStayDays: z.number().optional(),
  processingTime: z.string().optional(),
  lastUpdated: z.string(),
});

export type Country = z.infer<typeof countrySchema>;

// Requirement types
export const requirementTypeSchema = z.enum([
  "entry",
  "document",
  "health",
  "customs",
  "stay",
]);

export type RequirementType = z.infer<typeof requirementTypeSchema>;

// Requirement severity
export const requirementSeveritySchema = z.enum([
  "required",
  "recommended",
  "optional",
]);

export type RequirementSeverity = z.infer<typeof requirementSeveritySchema>;

// Individual requirement
export const requirementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: requirementTypeSchema,
  severity: requirementSeveritySchema,
  details: z.array(z.string()).optional(),
});

export type Requirement = z.infer<typeof requirementSchema>;

// Country details with requirements
export const countryDetailsSchema = countrySchema.extend({
  requirements: z.array(requirementSchema),
  tips: z.array(z.string()).optional(),
  emergencyContacts: z.object({
    police: z.string().optional(),
    ambulance: z.string().optional(),
    embassy: z.string().optional(),
  }).optional(),
});

export type CountryDetails = z.infer<typeof countryDetailsSchema>;

// Search params
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  region: z.string().optional(),
  visaRequired: z.boolean().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
