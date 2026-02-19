import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const loadDotEnv = () => {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf-8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) return;

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
};

loadDotEnv();

const PORT = Number(process.env.PORT || 8787);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

let ai = null;
if (!GEMINI_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn("Gemini API key is not set. Set GEMINI_API_KEY (or VITE_GEMINI_API_KEY) in .env.");
} else {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(payload));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const buildPrompt = (input) => {
  const budgetPerPerson = Math.floor(input.budget / Math.max(1, input.numberOfPeople));

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

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, jsonHeaders);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { ok: true, service: "chalo-proxy" });
    return;
  }

  if (req.method === "POST" && req.url === "/api/generate-plan") {
    if (!ai) {
      sendJson(res, 500, { error: "Server not configured: GEMINI_API_KEY missing." });
      return;
    }

    try {
      const rawBody = await readBody(req);
      const input = JSON.parse(rawBody || "{}");

      if (!input.fromCity || !input.toCity) {
        sendJson(res, 400, { error: "fromCity and toCity are required." });
        return;
      }

      const prompt = buildPrompt(input);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      const sources = [];
      groundingChunks.forEach((chunk) => {
        if (chunk.web?.uri && !sources.find((source) => source.uri === chunk.web.uri)) {
          sources.push({
            title: chunk.web.title || "Travel Source",
            uri: chunk.web.uri,
          });
        }
      });

      sendJson(res, 200, {
        responseText,
        sources,
      });
    } catch (error) {
      sendJson(res, 500, {
        error: "Unable to generate travel plan.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chalo backend proxy running on http://localhost:${PORT}`);
});
