/**
 * Parse pipe-delimited visa check input string into structured format.
 * Format: nationality|destination|travelDate|secondaryVisaCountry|secondaryVisaType
 * 
 * Required fields: nationality, destination
 * Optional fields: travelDate, secondaryVisaCountry, secondaryVisaType
 * 
 * Examples:
 *   "US|GB|2026-01-15||" -> { nationality: "US", destination: "GB", travelDate: "2026-01-15" }
 *   "IN|US||US|B1/B2" -> { nationality: "IN", destination: "US", secondaryVisaCountry: "US", secondaryVisaType: "B1/B2" }
 *   "DE|JP" -> { nationality: "DE", destination: "JP" }
 */

export interface ParsedVisaInput {
  nationality: string;
  destination: string;
  travelDate?: string;
  secondaryVisaCountry?: string;
  secondaryVisaType?: string;
}

export interface ParseResult {
  success: boolean;
  data?: ParsedVisaInput;
  error?: string;
}

export function parseVisaInput(input: string): ParseResult {
  if (!input || typeof input !== "string") {
    return { success: false, error: "Input must be a non-empty string" };
  }

  const parts = input.split("|");

  const nationality = parts[0]?.trim() || "";
  const destination = parts[1]?.trim() || "";
  const travelDate = parts[2]?.trim() || undefined;
  const secondaryVisaCountry = parts[3]?.trim() || undefined;
  const secondaryVisaType = parts[4]?.trim() || undefined;

  if (!nationality) {
    return { success: false, error: "Missing required field: nationality" };
  }

  if (!destination) {
    return { success: false, error: "Missing required field: destination" };
  }

  const data: ParsedVisaInput = {
    nationality,
    destination,
  };

  if (travelDate) {
    data.travelDate = travelDate;
  }

  if (secondaryVisaCountry) {
    data.secondaryVisaCountry = secondaryVisaCountry;
  }

  if (secondaryVisaType) {
    data.secondaryVisaType = secondaryVisaType;
  }

  return { success: true, data };
}

/**
 * Parse multiple pipe-delimited inputs (one per line).
 * Skips empty lines and lines starting with #.
 */
export function parseBatchVisaInput(input: string): ParseResult[] {
  const lines = input.split("\n");
  const results: ParseResult[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    results.push(parseVisaInput(trimmed));
  }

  return results;
}

/**
 * Convert ParsedVisaInput back to pipe-delimited string.
 */
export function toVisaInputString(data: ParsedVisaInput): string {
  return [
    data.nationality,
    data.destination,
    data.travelDate ?? "",
    data.secondaryVisaCountry ?? "",
    data.secondaryVisaType ?? "",
  ].join("|");
}
