import { 
  type TripInput, 
  type TravelRule, 
  type TripResult, 
  type StructuredRequirement,
  type Source,
  tripInputSchema, 
  travelRuleSchema 
} from "@shared/schema";
import rulesData from "./rules.json";
import { z } from "zod";

// Schema for the full rules collection
const rulesCollectionSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  cartaPolicy: z.object({
    bookingGuidance: z.string(),
    approvalWorkflow: z.string(),
    expensePolicy: z.string(),
    travelInsurance: z.string(),
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
