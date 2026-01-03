import { z } from "zod";

const VISA_CHECK_API_URL = "https://visa-requirement.p.rapidapi.com/v2/visa/check";
const VISA_MAP_API_URL = "https://visa-requirement.p.rapidapi.com/v2/visa/map";

export const visaCheckInputSchema = z.object({
  passport: z.string().min(2).max(2),
  destination: z.string().min(2).max(2),
});

export type VisaCheckInput = z.infer<typeof visaCheckInputSchema>;

// V2 API Response Types
export interface VisaCheckV2Response {
  data: {
    passport: {
      code: string;
      name: string;
      currency_code: string;
    };
    destination: {
      code: string;
      name: string;
      continent: string;
      capital: string;
      currency_code: string;
      currency: string;
      exchange: string;
      passport_validity: string;
      phone_code: string;
      timezone: string;
      population: number;
      area_km2: number;
      embassy_url?: string;
    };
    mandatory_registration?: {
      name: string;
      color: string;
      link?: string;
    };
    visa_rules: {
      primary_rule: {
        name: string;
        duration?: string;
        color: string;
        link?: string;
      };
      secondary_rule?: {
        name: string;
        duration?: string;
        color: string;
        link?: string;
      };
      exception_rule?: {
        name: string;
        exception_type_name?: string;
        full_text?: string;
        country_codes?: string[];
        link?: string;
      };
    };
  };
  meta: {
    version: string;
    language: string;
    generated_at: string;
  };
}

export async function checkVisaRequirementsV2(passport: string, destination: string): Promise<VisaCheckV2Response | null> {
  if (!process.env.TRAVEL_BUDDY_API_KEY) {
    console.log("No TRAVEL_BUDDY_API_KEY configured");
    return null;
  }

  try {
    const res = await fetch(VISA_CHECK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.TRAVEL_BUDDY_API_KEY,
        "X-RapidAPI-Host": "visa-requirement.p.rapidapi.com",
      },
      body: JSON.stringify({
        passport: passport.toUpperCase(),
        destination: destination.toUpperCase(),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Visa Check v2 API error for ${passport} -> ${destination}: ${res.status} ${text}`);
      return null;
    }

    const result = await res.json();
    console.log(`Visa Check v2 result for ${passport} -> ${destination}:`, 
      result.data?.visa_rules?.primary_rule?.name || "no data");
    return result as VisaCheckV2Response;
  } catch (error) {
    console.error("Visa Check v2 API error:", error);
    return null;
  }
}

// Helper to format visa rules for display
export function formatVisaRulesDisplay(visaRules: VisaCheckV2Response["data"]["visa_rules"]): string {
  const { primary_rule, secondary_rule } = visaRules;
  
  let display = primary_rule.name;
  if (secondary_rule) {
    display += ` / ${secondary_rule.name}`;
  }
  
  // Determine duration to show
  const duration = primary_rule.duration || secondary_rule?.duration;
  if (duration) {
    display += ` - ${duration}`;
  }
  
  return display;
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

// Visa Map API response type
export interface VisaMapResponse {
  data: {
    passport: string;
    colors: {
      red?: string;
      green?: string;
      blue?: string;
      yellow?: string;
    };
  };
  meta: {
    version: string;
    language: string;
    generated_at: string;
  };
}

// Fetch visa map data for all destinations at once
export async function fetchVisaMap(passport: string): Promise<VisaMapResponse | null> {
  if (!process.env.TRAVEL_BUDDY_API_KEY) {
    console.log("No TRAVEL_BUDDY_API_KEY configured");
    return null;
  }

  try {
    const res = await fetch(VISA_MAP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.TRAVEL_BUDDY_API_KEY,
        "X-RapidAPI-Host": "visa-requirement.p.rapidapi.com",
      },
      body: JSON.stringify({ passport: passport.toUpperCase() }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Visa Map API error for ${passport}: ${res.status} ${text}`);
      return null;
    }

    const result = await res.json();
    console.log(`Visa Map API result for ${passport}:`, result.data?.colors ? "colors received" : "no colors");
    return result as VisaMapResponse;
  } catch (error) {
    console.error("Visa Map API error:", error);
    return null;
  }
}
