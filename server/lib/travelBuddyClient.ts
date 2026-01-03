import { z } from "zod";

const TRAVEL_BUDDY_API_URL = "https://travel-buddy-ai.p.rapidapi.com/v2/visa/check";

export const visaCheckInputSchema = z.object({
  nationality: z.string().min(2),
  destination: z.string().min(2),
  travelDate: z.string().optional(),
  secondaryVisaCountry: z.string().optional(),
  secondaryVisaType: z.string().optional(),
});

export type VisaCheckInput = z.infer<typeof visaCheckInputSchema>;

// Country name mapping for API (some APIs prefer full names)
const countryCodeToName: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", DE: "Germany",
  JP: "Japan", BR: "Brazil", FR: "France", IT: "Italy", ES: "Spain",
  AU: "Australia", NZ: "New Zealand", IN: "India", CN: "China",
  KR: "South Korea", SG: "Singapore", HK: "Hong Kong", TW: "Taiwan",
  TH: "Thailand", MY: "Malaysia", ID: "Indonesia", PH: "Philippines",
  VN: "Vietnam", AE: "United Arab Emirates", SA: "Saudi Arabia",
  QA: "Qatar", IL: "Israel", TR: "Turkey", ZA: "South Africa",
  EG: "Egypt", NG: "Nigeria", KE: "Kenya", MA: "Morocco", MX: "Mexico",
  AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
  NL: "Netherlands", CH: "Switzerland", SE: "Sweden", NO: "Norway",
  DK: "Denmark", FI: "Finland", IE: "Ireland", AT: "Austria",
  BE: "Belgium", PT: "Portugal", GR: "Greece", PL: "Poland",
  CZ: "Czech Republic", HU: "Hungary", RO: "Romania", RU: "Russia", UA: "Ukraine",
};

export async function checkVisaRequirements(input: VisaCheckInput) {
  const { nationality, destination, travelDate, secondaryVisaCountry, secondaryVisaType } = input;

  const secondaryVisa = secondaryVisaCountry && secondaryVisaType
    ? { country: secondaryVisaCountry, type: secondaryVisaType }
    : undefined;

  // Use full country names for the API
  const passportName = countryCodeToName[nationality.toUpperCase()] || nationality;
  const destinationName = countryCodeToName[destination.toUpperCase()] || destination;

  const res = await fetch(TRAVEL_BUDDY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.TRAVEL_BUDDY_API_KEY!,
      "X-RapidAPI-Host": "travel-buddy-ai.p.rapidapi.com",
    },
    body: JSON.stringify({
      passport: passportName,
      destination: destinationName,
      travel_date: travelDate,
      secondary_visa: secondaryVisa,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`Travel Buddy API error for ${passportName} -> ${destinationName}: ${res.status} ${text}`);
    throw new Error(`Travel Buddy API request failed: ${res.status}`);
  }

  const result = await res.json();
  console.log(`Travel Buddy result for ${passportName} -> ${destinationName}:`, result.category || result);
  return result;
}

export function mapTravelBuddyToEntryStatus(
  category: string | undefined
): "visa_required" | "visa_not_required" | "unknown" {
  if (!category) return "unknown";
  
  const normalized = category.toLowerCase();
  
  if (
    normalized.includes("visa-free") ||
    normalized.includes("visa not required") ||
    normalized.includes("freedom of movement")
  ) {
    return "visa_not_required";
  }
  
  if (
    normalized.includes("visa required") ||
    normalized.includes("eta") ||
    normalized.includes("evisa") ||
    normalized.includes("e-visa") ||
    normalized.includes("visa on arrival")
  ) {
    return "visa_required";
  }
  
  return "unknown";
}

export function mapTravelBuddyToEntryType(
  category: string | undefined
): "visa" | "evisa" | "eta" | "etias" | "esta" | "none" | undefined {
  if (!category) return undefined;
  
  const normalized = category.toLowerCase();
  
  if (normalized.includes("visa-free") || normalized.includes("visa not required")) {
    return "none";
  }
  if (normalized.includes("etias")) {
    return "etias";
  }
  if (normalized.includes("esta")) {
    return "esta";
  }
  if (normalized.includes("eta") || normalized.includes("electronic travel")) {
    return "eta";
  }
  if (normalized.includes("evisa") || normalized.includes("e-visa") || normalized.includes("visa on arrival")) {
    return "evisa";
  }
  if (normalized.includes("visa required")) {
    return "visa";
  }
  if (normalized.includes("freedom of movement")) {
    return "none";
  }
  
  return undefined;
}
