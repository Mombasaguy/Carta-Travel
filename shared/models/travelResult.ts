import { z } from "zod";
import type { TripResult, StructuredRequirement, Source, TravelRule } from "../schema";

export type EntryType = "VISA" | "ETA" | "EVISA" | "NONE" | "UNKNOWN";

export type DataSource = "policy" | "api" | "unknown";

export interface NormalizedResult {
  entryType: EntryType;
  headline: string;
  details: string | null;
  validity: string | null;
  fee: {
    amount: number;
    currency: string;
    reimbursable: boolean;
  } | null;
  actions: Array<{ label: string; url: string }>;
  requiredDocuments: string[];
  recommendedDocuments: string[];
  notes: string[];
  passportRule: string | null;
  letterEligible: boolean;
  letterTemplateId: string | null;
  sources: Source[];
  governance: {
    owner: string;
    reviewDueAt: string;
    status: "VERIFIED" | "NEEDS_REVIEW";
  } | null;
  dataSource: DataSource;
  reason?: string;
}

export interface AssessmentResult {
  matched: boolean;
  normalized: NormalizedResult;
  raw?: TravelRule;
  apiResponse?: unknown;
}

export interface TravelSummary {
  reason: string;
  nextSteps: string[];
  warnings: string[];
}

export interface EnhancedTripResult extends TripResult {
  dataSource: DataSource;
  reason?: string;
  summary?: TravelSummary;
}

export const normalizedResultSchema = z.object({
  entryType: z.enum(["VISA", "ETA", "EVISA", "NONE", "UNKNOWN"]),
  headline: z.string(),
  details: z.string().nullable(),
  validity: z.string().nullable(),
  fee: z.object({
    amount: z.number(),
    currency: z.string(),
    reimbursable: z.boolean(),
  }).nullable(),
  actions: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })),
  requiredDocuments: z.array(z.string()),
  recommendedDocuments: z.array(z.string()),
  notes: z.array(z.string()),
  passportRule: z.string().nullable(),
  letterEligible: z.boolean(),
  letterTemplateId: z.string().nullable(),
  sources: z.array(z.object({
    source_id: z.string(),
    title: z.string(),
    verified_at: z.string(),
  })),
  governance: z.object({
    owner: z.string(),
    reviewDueAt: z.string(),
    status: z.enum(["VERIFIED", "NEEDS_REVIEW"]),
  }).nullable(),
  dataSource: z.enum(["policy", "api", "unknown"]),
  reason: z.string().optional(),
});

export const assessmentResultSchema = z.object({
  matched: z.boolean(),
  normalized: normalizedResultSchema,
  raw: z.unknown().optional(),
  apiResponse: z.unknown().optional(),
});

export const travelSummarySchema = z.object({
  reason: z.string(),
  nextSteps: z.array(z.string()),
  warnings: z.array(z.string()),
});

export function createEmptyNormalizedResult(): NormalizedResult {
  return {
    entryType: "UNKNOWN",
    headline: "Requirements Unknown",
    details: null,
    validity: null,
    fee: null,
    actions: [],
    requiredDocuments: [],
    recommendedDocuments: [],
    notes: [],
    passportRule: null,
    letterEligible: false,
    letterTemplateId: null,
    sources: [],
    governance: null,
    dataSource: "unknown",
  };
}

export function normalizeFromRule(rule: TravelRule): NormalizedResult {
  const { outputs, sources, governance } = rule;
  const { entry_authorization, passport_validity, invitation_letter } = outputs;

  return {
    entryType: entry_authorization.type,
    headline: entry_authorization.headline,
    details: entry_authorization.details ?? null,
    validity: entry_authorization.validity ?? null,
    fee: entry_authorization.fee ?? null,
    actions: entry_authorization.actions ?? [],
    requiredDocuments: outputs.required_documents,
    recommendedDocuments: outputs.recommended_documents,
    notes: outputs.notes,
    passportRule: passport_validity.rule,
    letterEligible: invitation_letter.available,
    letterTemplateId: invitation_letter.template_id ?? null,
    sources,
    governance: {
      owner: governance.owner,
      reviewDueAt: governance.review_due_at,
      status: governance.status,
    },
    dataSource: "policy",
  };
}

export type { TripResult, StructuredRequirement, Source, TravelRule };
