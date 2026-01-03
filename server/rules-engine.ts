import { 
  type TripInput, 
  type TravelRule, 
  type TripResult, 
  type StructuredRequirement,
  type Source,
  type AssessInput,
  tripInputSchema, 
  travelRuleSchema,
  assessInputSchema
} from "@shared/schema";
import rulesData from "./rules.json";
import { z } from "zod";
import { checkVisaRequirements, mapTravelBuddyToEntryType } from "./lib/travelBuddyClient";

// Schema for the full rules collection
const rulesCollectionSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  cartaPolicy: z.object({
    bookingGuidance: z.string(),
    approvalWorkflow: z.string(),
    expensePolicy: z.string(),
    travelInsurance: z.string(),
    flightPolicy: z.string().optional(),
    mealAllowance: z.string().optional(),
    groundTransportation: z.string().optional(),
    visaAndPassport: z.string().optional(),
    invitationLetterGuidance: z.string().optional(),
  }),
  rules: z.array(travelRuleSchema),
});

type RulesCollection = z.infer<typeof rulesCollectionSchema>;
type CartaPolicy = RulesCollection["cartaPolicy"];

// Validate and parse rules at startup
const validatedRules = rulesCollectionSchema.parse(rulesData);

export function getRules(): RulesCollection {
  return validatedRules;
}

export function getCartaPolicy(): CartaPolicy {
  return validatedRules.cartaPolicy;
}

export function resolveTrip(input: TripInput): TripResult {
  const parsedInput = tripInputSchema.parse(input);
  
  // Find matching rule
  const matchedRule = findMatchingRule(parsedInput);
  
  // Get Carta policy
  const cartaPolicy = getCartaPolicy();
  
  // Build requirements list from matched rule
  let requirements: StructuredRequirement[] = [];
  let letterEligible = false;
  let letterTemplate: string | undefined;
  let sources: Source[] = [];
  
  if (matchedRule) {
    requirements = buildRequirementsFromRule(matchedRule);
    letterTemplate = matchedRule.outputs.invitation_letter?.template_id ?? undefined;
    letterEligible = matchedRule.outputs.invitation_letter?.available === true && parsedInput.needsInvitationLetter;
    sources = matchedRule.sources;
  } else {
    // Fallback generic requirements when no rule matches
    requirements = getGenericRequirements();
  }
  
  // Add Carta policy as requirements
  requirements.push({
    id: "carta-policy-booking",
    type: "policy",
    title: "Travel Booking",
    description: cartaPolicy.bookingGuidance,
    severity: "required",
  });
  
  requirements.push({
    id: "carta-policy-approval",
    type: "policy",
    title: "Approval Process",
    description: cartaPolicy.approvalWorkflow,
    severity: "required",
  });
  
  requirements.push({
    id: "carta-policy-expense",
    type: "policy",
    title: "Expense Policy",
    description: cartaPolicy.expensePolicy,
    severity: "info",
  });
  
  requirements.push({
    id: "carta-policy-insurance",
    type: "policy",
    title: "Travel Insurance",
    description: cartaPolicy.travelInsurance,
    severity: "info",
  });
  
  // Add additional Carta policy sections if available
  if (cartaPolicy.flightPolicy) {
    requirements.push({
      id: "carta-policy-flight",
      type: "policy",
      title: "Flight Policy",
      description: cartaPolicy.flightPolicy,
      severity: "info",
    });
  }
  
  if (cartaPolicy.mealAllowance) {
    requirements.push({
      id: "carta-policy-meals",
      type: "policy",
      title: "Meal Allowance",
      description: cartaPolicy.mealAllowance,
      severity: "info",
    });
  }
  
  if (cartaPolicy.groundTransportation) {
    requirements.push({
      id: "carta-policy-transport",
      type: "policy",
      title: "Ground Transportation",
      description: cartaPolicy.groundTransportation,
      severity: "info",
    });
  }
  
  if (cartaPolicy.visaAndPassport) {
    requirements.push({
      id: "carta-policy-visa",
      type: "policy",
      title: "Visa & Passport",
      description: cartaPolicy.visaAndPassport,
      severity: "info",
    });
  }
  
  if (cartaPolicy.invitationLetterGuidance) {
    requirements.push({
      id: "carta-policy-letter",
      type: "policy",
      title: "Invitation Letter",
      description: cartaPolicy.invitationLetterGuidance,
      severity: "info",
    });
  }
  
  return {
    matched: matchedRule !== null,
    matchedRule: matchedRule ?? undefined,
    requirements,
    letterEligible,
    letterTemplate,
    sources: sources.length > 0 ? sources : undefined,
    governance: matchedRule?.governance,
  };
}

// Simplified assess function matching Next.js API pattern
export interface AssessResult {
  entryType: "VISA" | "ETA" | "EVISA" | "NONE" | "UNKNOWN";
  required: boolean;
  headline: string;
  details: string | null;
  reason: string | null;
  maxStayDays: number;
  fee: { amount: number; currency: string; reimbursable: boolean } | null;
  isUSEmployerSponsored: boolean;
  governance: { status: string; owner: string; reviewDueAt: string } | null;
  sources: { sourceId: string; title: string; verifiedAt: string }[] | null;
  actions: { label: string; url: string }[] | null;
  letterAvailable: boolean;
  letterTemplate: string | null;
  dataSource: "policy" | "api" | "unknown";
}

export function assess(input: AssessInput): AssessResult {
  const parsedInput = assessInputSchema.parse(input);
  
  // Find matching rule using simplified input
  const matchedRule = findMatchingRuleForAssess(parsedInput);
  
  if (!matchedRule) {
    return {
      entryType: "UNKNOWN",
      required: true,
      headline: "Requirements unknown for this destination",
      details: "Please contact the travel team for guidance on travel to this destination.",
      reason: null,
      maxStayDays: 0,
      fee: null,
      isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
      governance: null,
      sources: null,
      actions: null,
      letterAvailable: false,
      letterTemplate: null,
      dataSource: "unknown",
    };
  }
  
  const entry = matchedRule.outputs.entry_authorization;
  const reason = generateReason(parsedInput, matchedRule);
  
  return {
    entryType: entry.type,
    required: entry.required,
    headline: entry.headline,
    details: entry.details ?? null,
    reason,
    maxStayDays: matchedRule.max_duration_days,
    fee: entry.fee ? {
      amount: entry.fee.amount,
      currency: entry.fee.currency,
      reimbursable: entry.fee.reimbursable,
    } : null,
    isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
    governance: {
      status: matchedRule.governance.status,
      owner: matchedRule.governance.owner,
      reviewDueAt: matchedRule.governance.review_due_at,
    },
    sources: matchedRule.sources.map(s => ({
      sourceId: s.source_id,
      title: s.title,
      verifiedAt: s.verified_at,
    })),
    actions: entry.actions?.map(a => ({
      label: a.label,
      url: a.url,
    })) ?? null,
    letterAvailable: matchedRule.outputs.invitation_letter?.available ?? false,
    letterTemplate: matchedRule.outputs.invitation_letter?.template_id ?? null,
    dataSource: "policy",
  };
}

// Async assess with Travel Buddy API fallback
export async function assessWithApi(input: AssessInput): Promise<AssessResult> {
  const parsedInput = assessInputSchema.parse(input);
  
  // First try local policy rules
  const matchedRule = findMatchingRuleForAssess(parsedInput);
  
  if (matchedRule) {
    const entry = matchedRule.outputs.entry_authorization;
    const reason = generateReason(parsedInput, matchedRule);
    return {
      entryType: entry.type,
      required: entry.required,
      headline: entry.headline,
      details: entry.details ?? null,
      reason,
      maxStayDays: matchedRule.max_duration_days,
      fee: entry.fee ? {
        amount: entry.fee.amount,
        currency: entry.fee.currency,
        reimbursable: entry.fee.reimbursable,
      } : null,
      isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
      governance: {
        status: matchedRule.governance.status,
        owner: matchedRule.governance.owner,
        reviewDueAt: matchedRule.governance.review_due_at,
      },
      sources: matchedRule.sources.map(s => ({
        sourceId: s.source_id,
        title: s.title,
        verifiedAt: s.verified_at,
      })),
      actions: entry.actions?.map(a => ({
        label: a.label,
        url: a.url,
      })) ?? null,
      letterAvailable: matchedRule.outputs.invitation_letter?.available ?? false,
      letterTemplate: matchedRule.outputs.invitation_letter?.template_id ?? null,
      dataSource: "policy",
    };
  }
  
  // Fallback to Travel Buddy API for live visa intelligence
  if (process.env.TRAVEL_BUDDY_API_KEY) {
    try {
      const apiResult = await checkVisaRequirements({
        nationality: parsedInput.citizenship,
        destination: parsedInput.destination,
        travelDate: parsedInput.travelDate,
      });
      
      const primaryRule = apiResult.primary_rule;
      const entryType = mapTravelBuddyToEntryType(primaryRule?.category);
      const isRequired = entryType !== "NONE";
      const apiReason = generateApiReason(parsedInput, entryType);
      
      return {
        entryType,
        required: isRequired,
        headline: primaryRule?.category ?? "Visa requirements found",
        details: primaryRule?.notes ?? 
          (primaryRule?.duration ? `Stay up to ${primaryRule.duration}` : null),
        reason: apiReason,
        maxStayDays: parseDuration(primaryRule?.duration),
        fee: null,
        isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
        governance: null,
        sources: [{
          sourceId: "travel-buddy-api",
          title: "Travel Buddy AI",
          verifiedAt: new Date().toISOString().split("T")[0],
        }],
        actions: primaryRule?.link ? [{
          label: "Official Application",
          url: primaryRule.link,
        }] : null,
        letterAvailable: false,
        letterTemplate: null,
        dataSource: "api",
      };
    } catch (error) {
      console.error("Travel Buddy API error:", error);
    }
  }
  
  // No rule and no API - return unknown
  return {
    entryType: "UNKNOWN",
    required: true,
    headline: "Requirements unknown for this destination",
    details: "Please contact the travel team for guidance on travel to this destination.",
    reason: null,
    maxStayDays: 0,
    fee: null,
    isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
    governance: null,
    sources: null,
    actions: null,
    letterAvailable: false,
    letterTemplate: null,
    dataSource: "unknown",
  };
}

function parseDuration(duration: string | undefined): number {
  if (!duration) return 0;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  JP: "Japan",
  BR: "Brazil",
  CN: "China",
  IN: "India",
  AU: "Australia",
  FR: "France",
  MX: "Mexico",
  IT: "Italy",
  ES: "Spain",
};

function getCountryName(code: string): string {
  return countryNames[code.toUpperCase()] || code;
}

function generateReason(input: AssessInput, rule: TravelRule): string {
  const citizenship = getCountryName(input.citizenship);
  const destination = getCountryName(input.destination);
  const entryType = rule.outputs.entry_authorization.type;
  
  const parts: string[] = [];
  
  if (entryType === "NONE") {
    parts.push(`As a ${citizenship} citizen, you can enter ${destination} without a visa for business trips up to ${rule.max_duration_days} days.`);
  } else if (entryType === "ETA") {
    parts.push(`${citizenship} citizens require an Electronic Travel Authorization (ETA) to enter ${destination}.`);
  } else if (entryType === "EVISA") {
    parts.push(`${citizenship} citizens can apply for an e-Visa online before traveling to ${destination}.`);
  } else if (entryType === "VISA") {
    parts.push(`${citizenship} citizens require a visa to enter ${destination} for business purposes.`);
  }
  
  if (input.durationDays > 0) {
    parts.push(`Your ${input.durationDays}-day trip is within the ${rule.max_duration_days}-day limit.`);
  }
  
  if (input.isUSEmployerSponsored) {
    parts.push(`Carta will provide an invitation letter to support your entry.`);
  }
  
  return parts.join(" ");
}

function generateApiReason(input: AssessInput, entryType: string): string {
  const citizenship = getCountryName(input.citizenship);
  const destination = getCountryName(input.destination);
  
  if (entryType === "NONE") {
    return `As a ${citizenship} citizen, you can enter ${destination} without a visa for short business trips.`;
  } else if (entryType === "ETA") {
    return `${citizenship} citizens require an Electronic Travel Authorization (ETA) to enter ${destination}. Apply online before your trip.`;
  } else if (entryType === "EVISA") {
    return `${citizenship} citizens can apply for an e-Visa online before traveling to ${destination}.`;
  } else if (entryType === "VISA") {
    return `${citizenship} citizens require a visa to enter ${destination}. Contact the travel team for guidance on the application process.`;
  }
  
  return `Requirements for ${citizenship} citizens traveling to ${destination} have been retrieved from live visa intelligence.`;
}

function findMatchingRuleForAssess(input: AssessInput): TravelRule | null {
  const rules = validatedRules.rules;
  const normalizedCitizenship = input.citizenship.toUpperCase();
  
  const matched = rules.find(rule => {
    // Match destination country
    if (rule.to_country.toLowerCase() !== input.destination.toLowerCase()) {
      return false;
    }
    
    // Match purpose
    if (rule.purpose !== input.purpose) {
      return false;
    }
    
    // Match citizenship group
    if (!rule.from_citizenship_group.includes(normalizedCitizenship)) {
      return false;
    }
    
    // Check duration within max allowed
    if (input.durationDays > rule.max_duration_days) {
      return false;
    }
    
    // Check if rule is currently effective
    const travelDate = new Date(input.travelDate);
    const effectiveStart = new Date(rule.effective_start);
    if (travelDate < effectiveStart) {
      return false;
    }
    
    if (rule.effective_end) {
      const effectiveEnd = new Date(rule.effective_end);
      if (travelDate > effectiveEnd) {
        return false;
      }
    }
    
    return true;
  });
  
  return matched ?? null;
}

function findMatchingRule(input: TripInput): TravelRule | null {
  const rules = validatedRules.rules;
  
  // Normalize citizenship to uppercase for matching
  const normalizedCitizenship = input.citizenship.toUpperCase();
  
  // Find rule matching country, purpose, and citizenship
  const matched = rules.find(rule => {
    // Match destination country
    if (rule.to_country.toLowerCase() !== input.destinationCountry.toLowerCase()) {
      return false;
    }
    
    // Match purpose
    if (rule.purpose.toLowerCase() !== input.purpose.toLowerCase()) {
      return false;
    }
    
    // Match citizenship group
    if (!rule.from_citizenship_group.includes(normalizedCitizenship)) {
      return false;
    }
    
    // Check if rule is currently effective
    const today = new Date();
    const effectiveStart = new Date(rule.effective_start);
    if (today < effectiveStart) {
      return false;
    }
    
    if (rule.effective_end) {
      const effectiveEnd = new Date(rule.effective_end);
      if (today > effectiveEnd) {
        return false;
      }
    }
    
    return true;
  });
  
  return matched ?? null;
}

function buildRequirementsFromRule(rule: TravelRule): StructuredRequirement[] {
  const requirements: StructuredRequirement[] = [];
  const outputs = rule.outputs;
  
  // Entry authorization requirement
  requirements.push({
    id: `${rule.rule_id}-entry`,
    type: "entry",
    title: outputs.entry_authorization.type.replace(/_/g, " "),
    description: outputs.entry_authorization.headline,
    severity: outputs.entry_authorization.required ? "required" : "info",
    actions: outputs.entry_authorization.actions,
    fee: outputs.entry_authorization.fee,
  });
  
  // Passport validity
  if (outputs.passport_validity && outputs.passport_validity.rule) {
    requirements.push({
      id: `${rule.rule_id}-passport`,
      type: "document",
      title: "Passport Validity",
      description: outputs.passport_validity.rule,
      severity: "required",
    });
  }
  
  // Required documents
  outputs.required_documents.forEach((doc, index) => {
    requirements.push({
      id: `${rule.rule_id}-doc-req-${index}`,
      type: "document",
      title: doc,
      description: `Required: ${doc}`,
      severity: "required",
    });
  });
  
  // Recommended documents
  outputs.recommended_documents?.forEach((doc, index) => {
    requirements.push({
      id: `${rule.rule_id}-doc-rec-${index}`,
      type: "document",
      title: doc,
      description: `Recommended: ${doc}`,
      severity: "recommended",
    });
  });
  
  // Notes as info requirements
  outputs.notes?.forEach((note, index) => {
    requirements.push({
      id: `${rule.rule_id}-note-${index}`,
      type: "stay",
      title: "Important Note",
      description: note,
      severity: "info",
    });
  });
  
  return requirements;
}

function getGenericRequirements(): StructuredRequirement[] {
  return [
    {
      id: "generic-passport",
      type: "document",
      title: "Valid Passport",
      description: "Ensure your passport is valid for at least 6 months beyond your travel dates.",
      severity: "required",
    },
    {
      id: "generic-visa-check",
      type: "entry",
      title: "Visa Requirements",
      description: "Check specific visa requirements for your destination and citizenship.",
      severity: "required",
    },
    {
      id: "generic-insurance",
      type: "health",
      title: "Travel Insurance",
      description: "Ensure you have adequate travel and health insurance coverage.",
      severity: "recommended",
    }
  ];
}

// Get all available countries from rules
export function getAvailableCountries(): Array<{ code: string; name: string }> {
  const countriesMap = new Map<string, string>();
  
  // Map country codes to names
  const countryNames: Record<string, string> = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    DE: "Germany",
    JP: "Japan",
    BR: "Brazil",
  };
  
  validatedRules.rules.forEach(rule => {
    if (!countriesMap.has(rule.to_country)) {
      countriesMap.set(rule.to_country, countryNames[rule.to_country] || rule.to_country);
    }
  });
  
  return Array.from(countriesMap.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Get available citizenships from rules
export function getAvailableCitizenships(): string[] {
  const citizenships = new Set<string>();
  
  validatedRules.rules.forEach(rule => {
    rule.from_citizenship_group.forEach(c => citizenships.add(c));
  });
  
  return Array.from(citizenships).sort();
}
