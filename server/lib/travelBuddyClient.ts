const TRAVEL_BUDDY_API_URL = "https://travel-buddy-ai.p.rapidapi.com/v2/visa/check";

export async function checkVisaRequirements({
  nationality,
  destination,
  travelDate,
  secondaryVisa,
}: {
  nationality: string;
  destination: string;
  travelDate?: string;
  secondaryVisa?: {
    country: string;
    type: string;
  };
}) {
  const res = await fetch(TRAVEL_BUDDY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.TRAVEL_BUDDY_API_KEY!,
      "X-RapidAPI-Host": "travel-buddy-ai.p.rapidapi.com",
    },
    body: JSON.stringify({
      passport: nationality,
      destination,
      travel_date: travelDate,
      secondary_visa: secondaryVisa ?? undefined,
    }),
  });

  if (!res.ok) {
    throw new Error("Travel Buddy API request failed");
  }

  return res.json();
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
