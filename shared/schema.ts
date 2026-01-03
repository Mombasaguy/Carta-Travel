import { z } from "zod";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// User table for authentication (kept from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Trip Input Schema
export const tripPurposeSchema = z.enum([
  "business_meeting",
  "conference",
  "client_visit",
  "training",
  "relocation",
  "personal"
]);

export const citizenshipSchema = z.enum([
  "US", "UK", "CA", "BR", "DE", "FR", "JP", "IN", "AU", "MX", "OTHER"
]);

export const tripInputSchema = z.object({
  destinationCountry: z.string().min(2, "Please select a destination"),
  departureDate: z.string().min(1, "Please enter departure date"),
  returnDate: z.string().min(1, "Please enter return date"),
  purpose: tripPurposeSchema,
  citizenship: citizenshipSchema,
  employeeName: z.string().min(2, "Please enter your name"),
  employeeEmail: z.string().email("Please enter a valid email"),
  needsInvitationLetter: z.boolean().default(false),
});

export type TripInput = z.infer<typeof tripInputSchema>;

// Rule Severity
export const severitySchema = z.enum(["required", "recommended", "optional"]);
export type Severity = z.infer<typeof severitySchema>;

// Visa Types
export const visaTypeSchema = z.enum([
  "visa_free",
  "visa_required",
  "visa_on_arrival",
  "e_visa",
  "eta"
]);
export type VisaType = z.infer<typeof visaTypeSchema>;

// Requirement Schema
export const requirementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["entry", "document", "health", "customs", "stay", "policy"]),
  severity: severitySchema,
  details: z.array(z.string()).optional(),
});

export type Requirement = z.infer<typeof requirementSchema>;

// Rule Output Schema
export const ruleOutputSchema = z.object({
  visaType: visaTypeSchema,
  maxStayDays: z.number(),
  processingTime: z.string().optional(),
  documents: z.array(z.string()),
  entryNotes: z.array(z.string()),
  letterTemplate: z.enum(["US", "UK", "CA", "BR"]).optional(),
});

export type RuleOutput = z.infer<typeof ruleOutputSchema>;

// Rule Schema (for rules.json)
export const ruleSchema = z.object({
  id: z.string(),
  countryCode: z.string(),
  countryName: z.string(),
  purposes: z.array(tripPurposeSchema),
  citizenships: z.array(citizenshipSchema).optional(), // if undefined, applies to all
  requirements: z.array(requirementSchema),
  output: ruleOutputSchema,
  lastUpdated: z.string(),
});

export type Rule = z.infer<typeof ruleSchema>;

// Rules Collection Schema
export const rulesCollectionSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  rules: z.array(ruleSchema),
});

export type RulesCollection = z.infer<typeof rulesCollectionSchema>;

// Carta Policy Guidance (static)
export const cartaPolicySchema = z.object({
  bookingGuidance: z.string(),
  approvalWorkflow: z.string(),
  expensePolicy: z.string(),
  travelInsurance: z.string(),
});

export type CartaPolicy = z.infer<typeof cartaPolicySchema>;

// Resolved Trip Result
export const tripResultSchema = z.object({
  input: tripInputSchema,
  matchedRule: ruleSchema.nullable(),
  requirements: z.array(requirementSchema),
  cartaPolicy: cartaPolicySchema,
  letterEligible: z.boolean(),
  letterTemplate: z.enum(["US", "UK", "CA", "BR"]).nullable(),
  resolvedAt: z.string(),
});

export type TripResult = z.infer<typeof tripResultSchema>;

// Letter Generation Request
export const letterRequestSchema = z.object({
  employeeName: z.string(),
  employeeEmail: z.string(),
  destinationCountry: z.string(),
  departureDate: z.string(),
  returnDate: z.string(),
  purpose: tripPurposeSchema,
  template: z.enum(["US", "UK", "CA", "BR"]),
});

export type LetterRequest = z.infer<typeof letterRequestSchema>;

// Country for display
export interface Country {
  id: string;
  name: string;
  code: string;
  region: string;
  flagEmoji: string;
  visaRequired: boolean;
  visaOnArrival: boolean;
  eVisaAvailable: boolean;
  maxStayDays: number;
  processingTime: string;
  lastUpdated: string;
}

export interface CountryDetails extends Country {
  requirements: Requirement[];
  tips: string[];
  emergencyContacts: {
    police: string;
    ambulance: string;
    embassy: string;
  };
}
