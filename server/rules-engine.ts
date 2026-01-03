import { type TripInput, type Rule, type RulesCollection, type TripResult, type CartaPolicy, type Requirement, tripInputSchema, rulesCollectionSchema } from "@shared/schema";
import rulesData from "./rules.json";

// Validate and parse rules at startup
const validatedRules = rulesCollectionSchema.parse(rulesData);

export function getRules(): RulesCollection {
  return validatedRules;
}

export function getCartaPolicy(): CartaPolicy {
  return (rulesData as any).cartaPolicy;
}

export function resolveTrip(input: TripInput): TripResult {
  const parsedInput = tripInputSchema.parse(input);
  
  // Find matching rule
  const matchedRule = findMatchingRule(parsedInput);
  
  // Get Carta policy
  const cartaPolicy = getCartaPolicy();
  
  // Build requirements list from matched rule
  let requirements: Requirement[] = [];
  let letterEligible = false;
  let letterTemplate: "US" | "UK" | "CA" | "BR" | null = null;
  
  if (matchedRule) {
    requirements = matchedRule.requirements;
    letterTemplate = matchedRule.output.letterTemplate ?? null;
    letterEligible = letterTemplate !== null && parsedInput.needsInvitationLetter;
  } else {
    // Fallback generic requirements when no rule matches
    requirements = getGenericRequirements();
  }
  
  // Add Carta policy as a requirement
  requirements = [
    ...requirements,
    {
      id: "carta-policy-booking",
      title: "Carta Travel Policy",
      description: cartaPolicy.bookingGuidance,
      type: "policy" as const,
      severity: "required" as const,
      details: [
        cartaPolicy.approvalWorkflow,
        cartaPolicy.expensePolicy,
        cartaPolicy.travelInsurance
      ]
    }
  ];
  
  return {
    input: parsedInput,
    matchedRule,
    requirements,
    cartaPolicy,
    letterEligible,
    letterTemplate,
    resolvedAt: new Date().toISOString()
  };
}

function findMatchingRule(input: TripInput): Rule | null {
  const rules = validatedRules.rules;
  
  // Find rule matching country and purpose
  const matched = rules.find(rule => {
    // Match country code
    if (rule.countryCode.toLowerCase() !== input.destinationCountry.toLowerCase()) {
      return false;
    }
    
    // Match purpose
    if (!rule.purposes.includes(input.purpose)) {
      return false;
    }
    
    // Match citizenship if specified
    if (rule.citizenships && rule.citizenships.length > 0) {
      if (!rule.citizenships.includes(input.citizenship)) {
        return false;
      }
    }
    
    return true;
  });
  
  return matched ?? null;
}

function getGenericRequirements(): Requirement[] {
  return [
    {
      id: "generic-passport",
      title: "Valid Passport",
      description: "Ensure your passport is valid for at least 6 months beyond your travel dates.",
      type: "document",
      severity: "required",
      details: [
        "Check passport expiration date",
        "Ensure at least 2 blank pages",
        "Verify passport is in good condition"
      ]
    },
    {
      id: "generic-visa-check",
      title: "Visa Requirements",
      description: "Check specific visa requirements for your destination and citizenship.",
      type: "entry",
      severity: "required",
      details: [
        "Requirements vary by citizenship",
        "Apply for visas well in advance",
        "Consult destination embassy if unsure"
      ]
    },
    {
      id: "generic-insurance",
      title: "Travel Insurance",
      description: "Ensure you have adequate travel and health insurance coverage.",
      type: "health",
      severity: "recommended",
      details: [
        "Carta provides corporate travel insurance",
        "Verify coverage for your destination",
        "Carry insurance card while traveling"
      ]
    }
  ];
}

// Get all available countries from rules
export function getAvailableCountries(): Array<{ code: string; name: string }> {
  const countriesMap = new Map<string, string>();
  
  validatedRules.rules.forEach(rule => {
    if (!countriesMap.has(rule.countryCode)) {
      countriesMap.set(rule.countryCode, rule.countryName);
    }
  });
  
  return Array.from(countriesMap.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
