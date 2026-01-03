import { z } from "zod";

const TRAVEL_BUDDY_BASE_URL = "https://visa-requirement.p.rapidapi.com";

const VisaCheckRequestSchema = z.object({
  passport: z.string().length(2),
  destination: z.string().length(2),
});

const VisaRuleSchema = z.object({
  category: z.string().optional(),
  color: z.string().optional(),
  duration: z.string().optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
}).passthrough();

const CountryInfoSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  continent: z.string().optional(),
  capital: z.string().optional(),
  currency: z.string().optional(),
  phone_code: z.string().optional(),
  time_zone: z.string().optional(),
}).passthrough();

const VisaCheckResponseSchema = z.object({
  passport: CountryInfoSchema.optional(),
  destination: CountryInfoSchema.optional(),
  primary_rule: VisaRuleSchema.optional(),
  secondary_rule: VisaRuleSchema.optional(),
  exceptions: z.array(z.string()).optional(),
  mandatory_registration: z.object({
    required: z.boolean().optional(),
    type: z.string().optional(),
    link: z.string().optional(),
  }).optional(),
}).passthrough();

export type VisaCheckRequest = z.infer<typeof VisaCheckRequestSchema>;
export type VisaCheckResponse = z.infer<typeof VisaCheckResponseSchema>;

export class TravelBuddyClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.TRAVEL_BUDDY_API_KEY;
    if (!key) {
      throw new Error("TRAVEL_BUDDY_API_KEY is required");
    }
    this.apiKey = key;
  }

  async checkVisaRequirement(
    passport: string,
    destination: string
  ): Promise<VisaCheckResponse> {
    const request = VisaCheckRequestSchema.parse({
      passport: passport.toUpperCase(),
      destination: destination.toUpperCase(),
    });

    const response = await fetch(`${TRAVEL_BUDDY_BASE_URL}/v2/visa/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": this.apiKey,
        "X-RapidAPI-Host": "visa-requirement.p.rapidapi.com",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Travel Buddy API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return VisaCheckResponseSchema.parse(data);
  }

  async getVisaMap(passport: string): Promise<{
    passport: string;
    colors: Record<string, string>;
  }> {
    const response = await fetch(`${TRAVEL_BUDDY_BASE_URL}/v2/visa/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": this.apiKey,
        "X-RapidAPI-Host": "visa-requirement.p.rapidapi.com",
      },
      body: JSON.stringify({ passport: passport.toUpperCase() }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Travel Buddy API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }
}

let clientInstance: TravelBuddyClient | null = null;

export function getTravelBuddyClient(): TravelBuddyClient {
  if (!clientInstance) {
    clientInstance = new TravelBuddyClient();
  }
  return clientInstance;
}

export function mapTravelBuddyToEntryType(
  category: string | undefined
): "VISA" | "ETA" | "EVISA" | "NONE" | "UNKNOWN" {
  if (!category) return "UNKNOWN";
  
  const normalized = category.toLowerCase();
  
  if (normalized.includes("visa-free") || normalized.includes("visa not required")) {
    return "NONE";
  }
  if (normalized.includes("eta") || normalized.includes("electronic travel")) {
    return "ETA";
  }
  if (normalized.includes("evisa") || normalized.includes("e-visa")) {
    return "EVISA";
  }
  if (normalized.includes("visa on arrival")) {
    return "EVISA";
  }
  if (normalized.includes("visa required")) {
    return "VISA";
  }
  if (normalized.includes("freedom of movement")) {
    return "NONE";
  }
  
  return "UNKNOWN";
}
