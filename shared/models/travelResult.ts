import { z } from "zod";
import type { TripResult, StructuredRequirement, Source, TravelRule } from "../schema";

export type NormalizedTravelResult = {
  entry: {
    status: "visa_required" | "visa_not_required" | "unknown";
    type?: "visa" | "evisa" | "eta" | "etias" | "esta" | "none";
    reason?: string;
  };
  registration?: {
    required: boolean;
    type?: string;
    link?: string;
    notes?: string;
  };
  passport?: {
    validityRule?: string;
    blankPages?: string;
    notes?: string;
  };
  docs: {
    required: string[];
    recommended: string[];
  };
  allowedStay?: string;
  sources: { title: string; url?: string; date?: string }[];
  carta: {
    policyNotes: string[];
    navan: { required: boolean; reimbursementNotes: string[] };
  };
};

export type DataSource = "policy" | "api" | "unknown";

export interface AssessmentResult {
  matched: boolean;
  normalized: NormalizedTravelResult;
  dataSource: DataSource;
  raw?: TravelRule;
  apiResponse?: unknown;
}

export interface TravelSummary {
  reason: string;
  nextSteps: string[];
  warnings: string[];
}

export const normalizedTravelResultSchema = z.object({
  entry: z.object({
    status: z.enum(["visa_required", "visa_not_required", "unknown"]),
    type: z.enum(["visa", "evisa", "eta", "etias", "esta", "none"]).optional(),
    reason: z.string().optional(),
  }),
  registration: z.object({
    required: z.boolean(),
    type: z.string().optional(),
    link: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  passport: z.object({
    validityRule: z.string().optional(),
    blankPages: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  docs: z.object({
    required: z.array(z.string()),
    recommended: z.array(z.string()),
  }),
  allowedStay: z.string().optional(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
    date: z.string().optional(),
  })),
  carta: z.object({
    policyNotes: z.array(z.string()),
    navan: z.object({
      required: z.boolean(),
      reimbursementNotes: z.array(z.string()),
    }),
  }),
});

export const assessmentResultSchema = z.object({
  matched: z.boolean(),
  normalized: normalizedTravelResultSchema,
  dataSource: z.enum(["policy", "api", "unknown"]),
  raw: z.unknown().optional(),
  apiResponse: z.unknown().optional(),
});

export const travelSummarySchema = z.object({
  reason: z.string(),
  nextSteps: z.array(z.string()),
  warnings: z.array(z.string()),
});

export function createEmptyNormalizedResult(): NormalizedTravelResult {
  return {
    entry: {
      status: "unknown",
    },
    docs: {
      required: [],
      recommended: [],
    },
    sources: [],
    carta: {
      policyNotes: [],
      navan: {
        required: true,
        reimbursementNotes: [],
      },
    },
  };
}

export function normalizeFromRule(rule: TravelRule): NormalizedTravelResult {
  const { outputs, sources, governance } = rule;
  const { entry_authorization, passport_validity, invitation_letter } = outputs;

  const entryTypeMap: Record<string, NormalizedTravelResult["entry"]["type"]> = {
    "VISA": "visa",
    "EVISA": "evisa",
    "ETA": "eta",
    "NONE": "none",
  };

  return {
    entry: {
      status: entry_authorization.required ? "visa_required" : "visa_not_required",
      type: entryTypeMap[entry_authorization.type] || undefined,
      reason: entry_authorization.details ?? undefined,
    },
    passport: passport_validity.rule ? {
      validityRule: passport_validity.rule,
    } : undefined,
    docs: {
      required: outputs.required_documents,
      recommended: outputs.recommended_documents,
    },
    allowedStay: entry_authorization.validity ?? undefined,
    sources: sources.map(s => ({
      title: s.title,
      date: s.verified_at,
    })),
    carta: {
      policyNotes: outputs.notes,
      navan: {
        required: true,
        reimbursementNotes: entry_authorization.fee?.reimbursable 
          ? [`Visa fee of ${entry_authorization.fee.currency} ${entry_authorization.fee.amount} is reimbursable`]
          : [],
      },
    },
  };
}

export type { TripResult, StructuredRequirement, Source, TravelRule };
