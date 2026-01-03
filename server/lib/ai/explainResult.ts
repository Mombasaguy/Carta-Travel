import OpenAI from "openai";
import type { AssessResult } from "../../rules-engine";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface ExplainContext {
  citizenship: string;
  destination: string;
  travelDate: string;
  durationDays: number;
  isUSEmployerSponsored: boolean;
}

export async function explainResult(
  result: AssessResult,
  context: ExplainContext
): Promise<string> {
  const systemPrompt = `You are a concise, professional travel advisor for Carta employees. 
Explain visa and entry requirements in clear, confident language. 
Keep responses to 2-3 sentences maximum.
Use professional tone matching Carta's brand voice.
Focus on what the employee needs to know and do.
Do not use emojis or overly casual language.`;

  const userPrompt = `Explain why these travel requirements apply:

Employee citizenship: ${context.citizenship}
Destination: ${context.destination}
Travel date: ${context.travelDate}
Trip duration: ${context.durationDays} days
US employer sponsored: ${context.isUSEmployerSponsored ? "Yes" : "No"}

Entry type: ${result.entryType}
Headline: ${result.headline}
${result.details ? `Details: ${result.details}` : ""}
Max stay allowed: ${result.maxStayDays} days
${result.fee ? `Fee: ${result.fee.amount} ${result.fee.currency}` : ""}
${result.letterAvailable ? "Business invitation letter available" : ""}

Write a brief, professional explanation of why these requirements apply to this specific trip.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || result.reason || "";
  } catch (error) {
    console.error("AI explanation error:", error);
    return result.reason || "";
  }
}

export async function generateTravelSummary(
  result: AssessResult,
  context: ExplainContext
): Promise<{
  reason: string;
  nextSteps: string[];
  warnings: string[];
}> {
  const systemPrompt = `You are Carta's travel advisor. Generate structured travel guidance.
Return valid JSON with: reason (string), nextSteps (string array), warnings (string array).
Keep all text concise and professional. No emojis.`;

  const userPrompt = `Generate travel summary for:

Citizenship: ${context.citizenship}
Destination: ${context.destination}
Travel: ${context.travelDate} for ${context.durationDays} days
Entry type: ${result.entryType}
Headline: ${result.headline}
Letter available: ${result.letterAvailable}

Return JSON with reason, nextSteps, and warnings arrays.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("AI summary generation error:", error);
  }

  return {
    reason: result.reason || "",
    nextSteps: [],
    warnings: [],
  };
}
