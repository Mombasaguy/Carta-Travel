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
import { checkVisaRequirementsV2, formatVisaRulesDisplay, type VisaCheckV2Response } from "./lib/travelBuddyClient";
import { getVisaApplicationUrl, getVisaLink } from "./data/visaLinks";

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

// Map v2 API color to entry type
function mapV2ColorToEntryType(color: string): "VISA" | "ETA" | "EVISA" | "NONE" | "UNKNOWN" {
  switch (color.toLowerCase()) {
    case "green":
      return "NONE"; // Visa-free
    case "yellow":
      return "ETA"; // ETA/Registration required
    case "blue":
      return "EVISA"; // Visa on arrival/eVisa
    case "red":
      return "VISA"; // Visa required
    default:
      return "UNKNOWN";
  }
}

// V2 API enhanced data structure
export interface V2VisaData {
  destination: {
    name: string;
    continent: string;
    capital: string;
    currency: string;
    passportValidity: string;
    timezone: string;
    embassyUrl?: string;
  };
  mandatoryRegistration: {
    name: string;
    color: string;
    link?: string;
  } | null;
  visaRules: {
    primaryRule: {
      name: string;
      duration?: string;
      color: string;
      link?: string;
    };
    secondaryRule: {
      name: string;
      duration?: string;
      color: string;
      link?: string;
    } | null;
    exceptionRule: {
      name: string;
      exceptionTypeName?: string;
      fullText?: string;
      countryCodes?: string[];
      link?: string;
    } | null;
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
  processingTime: string | null;
  isUSEmployerSponsored: boolean;
  governance: { status: string; owner: string; reviewDueAt: string } | null;
  sources: { sourceId: string; title: string; verifiedAt: string }[] | null;
  actions: { label: string; url: string }[] | null;
  letterAvailable: boolean;
  letterTemplate: string | null;
  dataSource: "policy" | "api" | "curated" | "unknown";
  v2Data?: V2VisaData;
}

export function assess(input: AssessInput): AssessResult {
  const parsedInput = assessInputSchema.parse(input);
  
  // Find matching rule using simplified input
  const matchedRule = findMatchingRuleForAssess(parsedInput);
  
  // Get visa link data for processing time and fee info
  const visaLink = getVisaLink(parsedInput.destination);
  
  if (!matchedRule) {
    return {
      entryType: "UNKNOWN",
      required: true,
      headline: "Requirements unknown for this destination",
      details: "Please contact the travel team for guidance on travel to this destination.",
      reason: null,
      maxStayDays: 0,
      fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : null,
      processingTime: visaLink?.processingTime ?? null,
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
  
  // Use fee from rule if available, otherwise fall back to visa link data
  const fee = entry.fee ? {
    amount: entry.fee.amount,
    currency: entry.fee.currency,
    reimbursable: entry.fee.reimbursable,
  } : (visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : null);
  
  return {
    entryType: entry.type,
    required: entry.required,
    headline: entry.headline,
    details: entry.details ?? null,
    reason,
    maxStayDays: matchedRule.max_duration_days,
    fee,
    processingTime: visaLink?.processingTime ?? null,
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
    })) ?? (entry.application_url ? [{ label: "Apply for e-Visa", url: entry.application_url }] : null),
    letterAvailable: matchedRule.outputs.invitation_letter?.available ?? false,
    letterTemplate: matchedRule.outputs.invitation_letter?.template_id ?? null,
    dataSource: "policy",
  };
}

// Async assess with Travel Buddy API fallback
export async function assessWithApi(input: AssessInput): Promise<AssessResult> {
  const parsedInput = assessInputSchema.parse(input);
  
  // Get visa link data for processing time and fee info
  const visaLink = getVisaLink(parsedInput.destination);
  
  // First try local policy rules
  const matchedRule = findMatchingRuleForAssess(parsedInput);
  
  if (matchedRule) {
    const entry = matchedRule.outputs.entry_authorization;
    const reason = generateReason(parsedInput, matchedRule);
    const fee = entry.fee ? {
      amount: entry.fee.amount,
      currency: entry.fee.currency,
      reimbursable: entry.fee.reimbursable,
    } : (visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : null);
    return {
      entryType: entry.type,
      required: entry.required,
      headline: entry.headline,
      details: entry.details ?? null,
      reason,
      maxStayDays: matchedRule.max_duration_days,
      fee,
      processingTime: visaLink?.processingTime ?? null,
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
      })) ?? (entry.application_url ? [{ label: "Apply for e-Visa", url: entry.application_url }] : null),
      letterAvailable: matchedRule.outputs.invitation_letter?.available ?? false,
      letterTemplate: matchedRule.outputs.invitation_letter?.template_id ?? null,
      dataSource: "policy",
    };
  }
  
  // Fallback to Travel Buddy v2 API for live visa intelligence
  if (process.env.TRAVEL_BUDDY_API_KEY) {
    try {
      const apiResult = await checkVisaRequirementsV2(
        parsedInput.citizenship,
        parsedInput.destination
      );
      
      if (apiResult?.data?.visa_rules) {
        const { visa_rules, mandatory_registration, destination } = apiResult.data;
        const primaryRule = visa_rules.primary_rule;
        const secondaryRule = visa_rules.secondary_rule;
        const exceptionRule = visa_rules.exception_rule;
        
        // Map v2 API color to entry type
        const entryType = mapV2ColorToEntryType(primaryRule.color);
        // Only red (visa required before travel) means "required = true"
        // Green = visa-free, yellow = ETA/registration, blue = visa on arrival/eVisa
        const isRequired = primaryRule.color.toLowerCase() === "red";
        
        // Build headline from rules display format
        const rulesDisplay = formatVisaRulesDisplay(visa_rules);
        
        // Build details including mandatory registration and exception info
        let detailsParts: string[] = [];
        if (mandatory_registration) {
          detailsParts.push(`Mandatory: ${mandatory_registration.name}`);
        }
        if (destination.passport_validity) {
          detailsParts.push(`Passport validity: ${destination.passport_validity}`);
        }
        if (exceptionRule?.full_text) {
          detailsParts.push(`Exception: ${exceptionRule.full_text}`);
        }
        
        const apiReason = generateApiReason(parsedInput, entryType);
        
        // Collect action links
        const actions: { label: string; url: string }[] = [];
        if (primaryRule.link) {
          actions.push({ label: primaryRule.name, url: primaryRule.link });
        }
        if (secondaryRule?.link) {
          actions.push({ label: secondaryRule.name, url: secondaryRule.link });
        }
        if (mandatory_registration?.link) {
          actions.push({ label: `Complete ${mandatory_registration.name}`, url: mandatory_registration.link });
        }
        if (exceptionRule?.link) {
          actions.push({ label: "Exception Details", url: exceptionRule.link });
        }
        
        return {
          entryType,
          required: isRequired,
          headline: rulesDisplay,
          details: detailsParts.length > 0 ? detailsParts.join(". ") : null,
          reason: apiReason,
          maxStayDays: parseDuration(primaryRule.duration || secondaryRule?.duration),
          fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : null,
          processingTime: visaLink?.processingTime ?? null,
          isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
          governance: null,
          sources: [{
            sourceId: "travel-buddy-v2-api",
            title: "Travel Buddy Visa API v2",
            verifiedAt: new Date().toISOString().split("T")[0],
          }],
          actions: actions.length > 0 ? actions : getFallbackActions(parsedInput.destination, entryType),
          letterAvailable: false,
          letterTemplate: null,
          dataSource: "api",
          // Enhanced v2 data
          v2Data: {
            destination: {
              name: destination.name,
              continent: destination.continent,
              capital: destination.capital,
              currency: destination.currency,
              passportValidity: destination.passport_validity,
              timezone: destination.timezone,
              embassyUrl: destination.embassy_url,
            },
            mandatoryRegistration: mandatory_registration ? {
              name: mandatory_registration.name,
              color: mandatory_registration.color,
              link: mandatory_registration.link,
            } : null,
            visaRules: {
              primaryRule: {
                name: primaryRule.name,
                duration: primaryRule.duration,
                color: primaryRule.color,
                link: primaryRule.link,
              },
              secondaryRule: secondaryRule ? {
                name: secondaryRule.name,
                duration: secondaryRule.duration,
                color: secondaryRule.color,
                link: secondaryRule.link,
              } : null,
              exceptionRule: exceptionRule ? {
                name: exceptionRule.name,
                exceptionTypeName: exceptionRule.exception_type_name,
                fullText: exceptionRule.full_text,
                countryCodes: exceptionRule.country_codes,
                link: exceptionRule.link,
              } : null,
            },
          },
        };
      }
    } catch (error) {
      console.error("Travel Buddy v2 API error:", error);
    }
  }
  
  // Fallback to curated visa data for common passport/destination combinations
  const curatedResult = getCuratedVisaData(parsedInput.citizenship, parsedInput.destination);
  if (curatedResult) {
    return {
      ...curatedResult,
      isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
    };
  }
  
  // No rule and no API - return unknown
  return {
    entryType: "UNKNOWN",
    required: true,
    headline: "Requirements unknown for this destination",
    details: "Please contact the travel team for guidance on travel to this destination.",
    reason: null,
    maxStayDays: 0,
    fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : null,
    processingTime: visaLink?.processingTime ?? null,
    isUSEmployerSponsored: parsedInput.isUSEmployerSponsored,
    governance: null,
    sources: null,
    actions: null,
    letterAvailable: false,
    letterTemplate: null,
    dataSource: "unknown",
  };
}

// Curated visa data for common passport holders
function getCuratedVisaData(citizenship: string, destination: string): Omit<AssessResult, 'isUSEmployerSponsored'> | null {
  const countryNameMap: Record<string, string> = {
    US: "United States", GB: "United Kingdom", CA: "Canada", DE: "Germany",
    JP: "Japan", BR: "Brazil", FR: "France", IT: "Italy", ES: "Spain",
    AU: "Australia", NZ: "New Zealand", IN: "India", CN: "China",
    AE: "United Arab Emirates", SG: "Singapore", CH: "Switzerland",
    NL: "Netherlands", SE: "Sweden", NO: "Norway", DK: "Denmark",
    FI: "Finland", IE: "Ireland", AT: "Austria", BE: "Belgium",
    PT: "Portugal", GR: "Greece", PL: "Poland", MX: "Mexico",
  };
  
  const destName = countryNameMap[destination] || destination;
  const citizenName = countryNameMap[citizenship] || citizenship;
  const visaLink = getVisaLink(destination);
  
  if (citizenship === "US") {
    // US passport holder visa requirements
    const usVisaFreeCountries = ["CA", "MX", "FR", "DE", "IT", "ES", "NL", "BE", "AT", "CH", "PT", "GR", "PL", "CZ", "HU", "SE", "NO", "DK", "FI", "IE", "JP", "KR", "SG", "HK", "TW", "AR", "CL", "PE", "CO", "IL", "QA", "ZA", "MA", "TH", "MY", "PH"];
    const usEtaCountries = ["GB", "AU", "NZ", "TR"];
    const usEvisaCountries = ["IN", "VN", "KE", "EG", "BR"];
    const usVisaRequiredCountries = ["CN", "RU", "SA", "NG"];
    
    if (usVisaFreeCountries.includes(destination)) {
      return {
        entryType: "NONE",
        required: false,
        headline: `Visa-free entry to ${destName}`,
        details: `US passport holders can enter ${destName} without a visa for tourism and business purposes. Typical stay is 90 days within a 180-day period for Schengen countries, or as specified by destination.`,
        reason: `As a ${citizenName} citizen, you qualify for visa-free entry to ${destName}.`,
        maxStayDays: 90,
        fee: null,
        processingTime: visaLink?.processingTime ?? null,
        governance: null,
        sources: [{ sourceId: "curated-data", title: "Carta Travel Policy", verifiedAt: "2026-01-01" }],
        actions: getFallbackActions(destination, "NONE"),
        letterAvailable: true,
        letterTemplate: destination === "FR" ? "FR" : (destination === "DE" ? "DE" : null),
        dataSource: "curated",
      };
    }
    
    if (usEtaCountries.includes(destination)) {
      const etaNames: Record<string, string> = { GB: "UK ETA", AU: "ETA", NZ: "NZeTA", TR: "e-Visa" };
      return {
        entryType: "ETA",
        required: true,
        headline: `${etaNames[destination] || "ETA"} required for ${destName}`,
        details: `US passport holders must obtain an ${etaNames[destination] || "Electronic Travel Authorization"} before traveling to ${destName}. This is a quick online application.`,
        reason: `As a ${citizenName} citizen, you need to register online before traveling to ${destName}.`,
        maxStayDays: destination === "GB" ? 180 : 90,
        fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : { amount: destination === "GB" ? 10 : 20, currency: destination === "GB" ? "GBP" : "USD", reimbursable: true },
        processingTime: visaLink?.processingTime ?? null,
        governance: null,
        sources: [{ sourceId: "curated-data", title: "Carta Travel Policy", verifiedAt: "2026-01-01" }],
        actions: [{ label: "Apply Online", url: destination === "GB" ? "https://www.gov.uk/apply-electronic-travel-authorisation-eta" : "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601" }],
        letterAvailable: true,
        letterTemplate: destination === "GB" ? "UK" : null,
        dataSource: "curated",
      };
    }
    
    if (usEvisaCountries.includes(destination)) {
      const evisaFees: Record<string, number> = { IN: 25, VN: 50, KE: 51, EG: 25, BR: 81 };
      const evisaStays: Record<string, number> = { IN: 30, VN: 30, KE: 90, EG: 30, BR: 90 };
      const evisaDetails: Record<string, string> = {
        BR: `US passport holders must obtain an e-Visa before traveling to Brazil. Apply online at brazil.vfsevisa.com. Processing time is approximately 5 business days. Fee is approximately $81 USD.`,
        IN: `US passport holders can apply for an e-Visa online before traveling to India. Processing time is typically 2-5 business days.`,
        VN: `US passport holders can apply for an e-Visa online before traveling to Vietnam. Processing time is typically 3-5 business days.`,
        KE: `US passport holders must obtain an e-Visa before traveling to Kenya. Apply online through the eCitizen portal.`,
        EG: `US passport holders can apply for an e-Visa online before traveling to Egypt. Processing time is typically 5-7 business days.`,
      };
      return {
        entryType: "EVISA",
        required: true,
        headline: `e-Visa required for ${destName}`,
        details: evisaDetails[destination] || `US passport holders can apply for an e-Visa online before traveling to ${destName}. Processing time is typically 2-5 business days.`,
        reason: `As a ${citizenName} citizen, you must apply for an e-Visa to ${destName} before travel.`,
        maxStayDays: evisaStays[destination] || 30,
        fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : { amount: evisaFees[destination] || 50, currency: "USD", reimbursable: true },
        processingTime: visaLink?.processingTime ?? null,
        governance: null,
        sources: destination === "BR" 
          ? [{ sourceId: "brazil-evisa-2025", title: "Brazil e-Visa Requirements (April 2025)", verifiedAt: "2025-04-10" }]
          : [{ sourceId: "curated-data", title: "Carta Travel Policy", verifiedAt: "2026-01-01" }],
        actions: destination === "BR" 
          ? [{ label: "Apply for e-Visa", url: "https://brazil.vfsevisa.com/" }]
          : getFallbackActions(destination, "EVISA"),
        letterAvailable: true,
        letterTemplate: destination === "BR" ? "BR" : null,
        dataSource: "curated",
      };
    }
    
    if (usVisaRequiredCountries.includes(destination)) {
      return {
        entryType: "VISA",
        required: true,
        headline: `Visa required for ${destName}`,
        details: `US passport holders must obtain a visa from the ${destName} embassy or consulate before traveling. Allow 2-4 weeks for processing.`,
        reason: `As a ${citizenName} citizen, you must apply for a visa at the ${destName} embassy.`,
        maxStayDays: 30,
        fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : { amount: 160, currency: "USD", reimbursable: true },
        processingTime: visaLink?.processingTime ?? null,
        governance: null,
        sources: [{ sourceId: "curated-data", title: "Carta Travel Policy", verifiedAt: "2026-01-01" }],
        actions: getFallbackActions(destination, "VISA"),
        letterAvailable: true,
        letterTemplate: null,
        dataSource: "curated",
      };
    }
    
    // UAE special case - visa on arrival
    if (destination === "AE") {
      return {
        entryType: "NONE",
        required: false,
        headline: `Visa-free entry to ${destName}`,
        details: `US passport holders receive a visa on arrival for up to 30 days, which can be extended. No advance application required.`,
        reason: `As a ${citizenName} citizen, you qualify for visa-free entry to ${destName}.`,
        maxStayDays: 30,
        fee: null,
        processingTime: visaLink?.processingTime ?? null,
        governance: null,
        sources: [{ sourceId: "curated-data", title: "Carta Travel Policy", verifiedAt: "2026-01-01" }],
        actions: getFallbackActions(destination, "NONE"),
        letterAvailable: true,
        letterTemplate: null,
        dataSource: "curated",
      };
    }
  }
  
  // Canadian citizens
  if (citizenship === "CA") {
    // Brazil requires eVisa for Canadians as of April 2025
    if (destination === "BR") {
      return {
        entryType: "EVISA",
        required: true,
        headline: `e-Visa required for ${destName}`,
        details: `Canadian passport holders must obtain an e-Visa before traveling to Brazil. Apply online at brazil.vfsevisa.com. Processing time is approximately 5 business days. Fee is approximately $80 USD.`,
        reason: `As a ${citizenName} citizen, you must apply for an e-Visa to ${destName} before travel.`,
        maxStayDays: 90,
        fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : { amount: 81, currency: "USD", reimbursable: true },
        processingTime: visaLink?.processingTime ?? "5 business days",
        governance: null,
        sources: [{ sourceId: "brazil-evisa-2025", title: "Brazil e-Visa Requirements (April 2025)", verifiedAt: "2025-04-10" }],
        actions: [{ label: "Apply for e-Visa", url: "https://brazil.vfsevisa.com/" }],
        letterAvailable: true,
        letterTemplate: "BR",
        dataSource: "curated",
      };
    }
  }
  
  // Australian citizens
  if (citizenship === "AU") {
    // Brazil requires eVisa for Australians as of April 2025
    if (destination === "BR") {
      return {
        entryType: "EVISA",
        required: true,
        headline: `e-Visa required for ${destName}`,
        details: `Australian passport holders must obtain an e-Visa before traveling to Brazil. Apply online at brazil.vfsevisa.com. Processing time is approximately 5 business days. Fee is approximately $80 USD.`,
        reason: `As an ${citizenName} citizen, you must apply for an e-Visa to ${destName} before travel.`,
        maxStayDays: 90,
        fee: visaLink?.fee ? { ...visaLink.fee, reimbursable: true } : { amount: 81, currency: "USD", reimbursable: true },
        processingTime: visaLink?.processingTime ?? "5 business days",
        governance: null,
        sources: [{ sourceId: "brazil-evisa-2025", title: "Brazil e-Visa Requirements (April 2025)", verifiedAt: "2025-04-10" }],
        actions: [{ label: "Apply for e-Visa", url: "https://brazil.vfsevisa.com/" }],
        letterAvailable: true,
        letterTemplate: "BR",
        dataSource: "curated",
      };
    }
  }
  
  return null;
}

function getFallbackActions(destination: string, entryType: string): { label: string; url: string }[] | null {
  const visaLink = getVisaLink(destination);
  if (!visaLink) return null;
  
  const actions: { label: string; url: string }[] = [];
  
  // Add appropriate link based on entry type
  if (entryType === "ETA" && visaLink.etaUrl) {
    actions.push({ label: "Apply for ETA", url: visaLink.etaUrl });
  } else if (entryType === "EVISA" && visaLink.eVisaUrl) {
    actions.push({ label: "Apply for e-Visa", url: visaLink.eVisaUrl });
  } else if (entryType === "VISA") {
    actions.push({ label: "Visa Information", url: visaLink.officialVisaUrl });
  }
  
  // Always add official visa info as secondary link if not already added
  if (actions.length === 0 || (actions[0].url !== visaLink.officialVisaUrl)) {
    actions.push({ label: "Official Visa Info", url: visaLink.officialVisaUrl });
  }
  
  return actions.length > 0 ? actions : null;
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

// Get all available countries for map and travel queries
export function getAvailableCountries(): Array<{ code: string; name: string }> {
  // Comprehensive list of common business travel destinations
  const countryNames: Record<string, string> = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    DE: "Germany",
    JP: "Japan",
    BR: "Brazil",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    AU: "Australia",
    NZ: "New Zealand",
    IN: "India",
    CN: "China",
    KR: "South Korea",
    SG: "Singapore",
    HK: "Hong Kong",
    TW: "Taiwan",
    TH: "Thailand",
    MY: "Malaysia",
    ID: "Indonesia",
    PH: "Philippines",
    VN: "Vietnam",
    AE: "United Arab Emirates",
    SA: "Saudi Arabia",
    QA: "Qatar",
    IL: "Israel",
    TR: "Turkey",
    ZA: "South Africa",
    EG: "Egypt",
    NG: "Nigeria",
    KE: "Kenya",
    MA: "Morocco",
    MX: "Mexico",
    AR: "Argentina",
    CL: "Chile",
    CO: "Colombia",
    PE: "Peru",
    NL: "Netherlands",
    CH: "Switzerland",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    IE: "Ireland",
    AT: "Austria",
    BE: "Belgium",
    PT: "Portugal",
    GR: "Greece",
    PL: "Poland",
    CZ: "Czech Republic",
    HU: "Hungary",
    RO: "Romania",
    RU: "Russia",
    UA: "Ukraine",
  };
  
  return Object.entries(countryNames)
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
