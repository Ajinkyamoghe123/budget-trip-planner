import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "nodejs",
};

const getApiKey = (): string | undefined => {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
};

const normalizeListText = (value: unknown): string => {
  if (!value || typeof value !== "string") return "None";
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : "None";
};

const buildPrompt = (input: any): string => {
  const budgetPerPerson = Math.floor((input.budget || 0) / Math.max(1, input.numberOfPeople || 1));

  return `You are Chalo Planner, a professional Indian travel planning assistant.

CONTEXT:
From: ${input.fromCity}
To: ${input.toCity}
Trip type: ${input.tripType}
Travel month: ${input.travelMonth}
Travelers: ${input.numberOfPeople}
Total budget: ₹${input.budget}
Budget per traveler: ₹${budgetPerPerson}
Duration: ${input.duration} days
Interests: ${(input.interests || []).join(", ")}
Preferred transport: ${input.transportPreference}
Pace: ${input.pace}
Must-do preferences: ${normalizeListText(input.mustDo)}
Avoid preferences: ${normalizeListText(input.mustAvoid)}

RESPONSE RULES:
1. Keep recommendations realistic for time and budget.
2. Use specific places and practical transport suggestions.
3. Prefer reliable booking links and avoid placeholders.
4. Keep tone clear, concise, and trustworthy.
5. Ensure day count matches duration.

Output MUST be valid JSON only (no markdown, no extra text) with this exact shape:
{
  "travelOptions": [{"mode": "...", "type": "...", "estimatedCost": 1234, "description": "..."}],
  "accommodation": {
    "area": "...",
    "whyThisArea": "...",
    "options": [{"name": "...", "type": "...", "price": 1234, "rating": 4.2, "reviewCount": "1,234 reviews", "highlight": "...", "bookingUrl": "https://..."}]
  },
  "suggestedPlaces": ["..."],
  "itinerary": [{"day": 1, "title": "...", "activities": ["...", "..."], "estimatedCost": 1234}],
  "costBreakdown": {"travel": 1234, "stay": 1234, "food": 1234, "activities": 1234, "total": 4936},
  "localTips": [{"category": "...", "text": "..."}],
  "summary": "..."
}`;
};

const send = (res: any, status: number, payload: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(JSON.stringify(payload));
};

const readRawBody = (req: any): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    send(res, 500, { error: "Server missing GEMINI_API_KEY environment variable." });
    return;
  }

  try {
    let input = req.body;
    if (!input) {
      const raw = await readRawBody(req);
      input = raw ? JSON.parse(raw) : {};
    } else if (typeof input === "string") {
      input = JSON.parse(input || "{}");
    }

    if (!input.fromCity || !input.toCity) {
      send(res, 400, { error: "fromCity and toCity are required." });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(input);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: Array<{ title: string; uri: string }> = [];
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && !sources.find((source) => source.uri === chunk.web.uri)) {
        sources.push({
          title: chunk.web.title || "Travel Source",
          uri: chunk.web.uri,
        });
      }
    });

    send(res, 200, { responseText, sources });
  } catch (error: any) {
    send(res, 500, {
      error: "Unable to generate travel plan.",
      details: error?.message || "Unknown error",
    });
  }
}
