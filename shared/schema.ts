import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const countries = pgTable("countries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  region: text("region").notNull(),
  flagEmoji: text("flag_emoji").notNull(),
  visaRequired: boolean("visa_required").notNull(),
  visaOnArrival: boolean("visa_on_arrival").notNull(),
  eVisaAvailable: boolean("e_visa_available").notNull(),
  maxStayDays: integer("max_stay_days"),
  processingTime: text("processing_time"),
  requirements: json("requirements").$type<Requirement[]>(),
  healthReqs: json("health_reqs").$type<HealthRequirement[]>(),
  customsInfo: json("customs_info").$type<CustomsInfo>(),
  lastUpdated: text("last_updated"),
});

export const insertCountrySchema = createInsertSchema(countries).omit({ id: true });
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

export interface Requirement {
  title: string;
  description: string;
  required: boolean;
}

export interface HealthRequirement {
  name: string;
  required: boolean;
  details: string;
}

export interface CustomsInfo {
  currency: { limit: string; declaration: boolean };
  prohibited: string[];
  restricted: string[];
}

// ============= TRIP FLOW SCHEMAS =============

export const tripPurposeEnum = z.enum(["business", "conference", "client_meeting", "internal", "relocation"]);
export type TripPurpose = z.infer<typeof tripPurposeEnum>;

export const tripInputSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  employeeEmail: z.string().email("Valid email is required"),
  employeeTitle: z.string().optional(),
  destinationCountry: z.string().min(2, "Destination country is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().min(1, "Return date is required"),
  purpose: tripPurposeEnum,
  citizenship: z.string().min(2, "Citizenship is required"),
  needsInvitationLetter: z.boolean().default(false),
});
export type TripInput = z.infer<typeof tripInputSchema>;

// Enhanced Rule Schema
export const actionSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});

export const feeSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  reimbursable: z.boolean().optional(),
});

export const entryAuthorizationSchema = z.object({
  type: z.string(),
  required: z.boolean(),
  headline: z.string(),
  details: z.string(),
  validity: z.string().optional(),
  fee: feeSchema.optional(),
  actions: z.array(actionSchema).optional(),
});

export const passportValiditySchema = z.object({
  rule: z.string(),
});

export const invitationLetterSchema = z.object({
  available: z.boolean(),
  template_id: z.string().optional(),
});

export const ruleOutputsSchema = z.object({
  entry_authorization: entryAuthorizationSchema,
  passport_validity: passportValiditySchema.optional(),
  required_documents: z.array(z.string()),
  recommended_documents: z.array(z.string()).optional(),
  invitation_letter: invitationLetterSchema.optional(),
  notes: z.array(z.string()).optional(),
});

export const sourceSchema = z.object({
  source_id: z.string(),
  title: z.string(),
  verified_at: z.string(),
});
export type Source = z.infer<typeof sourceSchema>;

export const governanceSchema = z.object({
  owner: z.string(),
  review_due_at: z.string(),
  status: z.enum(["VERIFIED", "PENDING_REVIEW", "EXPIRED"]),
});

export const travelRuleSchema = z.object({
  rule_id: z.string(),
  from_citizenship_group: z.array(z.string()),
  to_country: z.string(),
  purpose: z.string(),
  max_duration_days: z.number(),
  effective_start: z.string(),
  effective_end: z.string().nullable(),
  outputs: ruleOutputsSchema,
  sources: z.array(sourceSchema),
  governance: governanceSchema,
});
export type TravelRule = z.infer<typeof travelRuleSchema>;

// Severity for requirements display
export const requirementSeverityEnum = z.enum(["required", "recommended", "info", "warning"]);
export type RequirementSeverity = z.infer<typeof requirementSeverityEnum>;

// Requirement types for grouping
export const requirementTypeEnum = z.enum(["entry", "document", "health", "customs", "stay", "policy"]);
export type RequirementType = z.infer<typeof requirementTypeEnum>;

// Structured requirement for display
export const structuredRequirementSchema = z.object({
  id: z.string(),
  type: requirementTypeEnum,
  title: z.string(),
  description: z.string(),
  severity: requirementSeverityEnum,
  actions: z.array(actionSchema).optional(),
  fee: feeSchema.optional(),
});
export type StructuredRequirement = z.infer<typeof structuredRequirementSchema>;

// Trip result from rules engine
export const tripResultSchema = z.object({
  matched: z.boolean(),
  matchedRule: travelRuleSchema.optional(),
  requirements: z.array(structuredRequirementSchema),
  letterEligible: z.boolean(),
  letterTemplate: z.string().optional(),
  sources: z.array(sourceSchema).optional(),
  governance: governanceSchema.optional(),
});
export type TripResult = z.infer<typeof tripResultSchema>;

// Letter request schema for generating invitation letters
export const letterRequestSchema = z.object({
  employeeName: z.string(),
  employeeEmail: z.string().email(),
  employeeTitle: z.string().optional(),
  destinationCountry: z.string(),
  departureDate: z.string(),
  returnDate: z.string(),
  purpose: z.string(),
  template: z.string(),
});
export type LetterRequest = z.infer<typeof letterRequestSchema>;
