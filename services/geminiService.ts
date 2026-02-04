import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, TravelPlan, Source } from "../types";

const extractJsonBlock = (text: string): string => {
  const fencedMatch =
    text.match(/```json\s*([\s\S]*?)\s*```/i) ||
    text.match(/```\s*([\s\S]*?)\s*```/);
  if (fencedMatch) return fencedMatch[1].trim();

  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) return text.trim();

  let depth = 0;
  for (let i = firstBrace; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) {
      return text.slice(firstBrace, i + 1).trim();
    }
  }

  return text.trim();
};

const toNumber = (val: unknown): number => {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d.]/g, "");
    const num = Number(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }
  return 0;
};

const normalizePlan = (raw: any): TravelPlan => {
  const travelOptionsRaw =
    raw.travelOptions || raw.transport || raw.transportOptions || [];
  const travelOptions = (Array.isArray(travelOptionsRaw) ? travelOptionsRaw : [])
    .map((opt: any) => {
      if (typeof opt === "string") {
        return {
          mode: opt,
          type: "",
          estimatedCost: 0,
          description: opt,
        };
      }
      return {
        mode: opt.mode || opt.type || opt.name || "Transport",
        type: opt.type || "",
        estimatedCost: toNumber(opt.estimatedCost || opt.cost || opt.price),
        description: opt.description || opt.details || "",
      };
    });

  const accommodationRaw = raw.accommodation || raw.stays || raw.accommodations || {};
  const optionsRaw =
    accommodationRaw.options || accommodationRaw.stays || raw.accommodationOptions || [];
  const accommodation = {
    area: accommodationRaw.area || accommodationRaw.location || accommodationRaw.neighborhood || "",
    whyThisArea: accommodationRaw.whyThisArea || accommodationRaw.reason || "",
    options: (Array.isArray(optionsRaw) ? optionsRaw : []).map((opt: any) => ({
      name: opt.name || opt.title || "Stay Option",
      type: opt.type || opt.category || "Accommodation",
      price: toNumber(opt.price || opt.cost || opt.rate),
      rating: toNumber(opt.rating),
      reviewCount: opt.reviewCount || opt.reviews || "",
      highlight: opt.highlight || opt.note || "",
      bookingUrl: opt.bookingUrl || opt.url,
    })),
  };

  const itineraryRaw = raw.itinerary || raw.dayByDay || raw.dailyPlan || [];
  const itinerary = (Array.isArray(itineraryRaw) ? itineraryRaw : []).map((day: any, idx: number) => {
    if (typeof day === "string") {
      return {
        day: idx + 1,
        title: `Day ${idx + 1}`,
        activities: [day],
        estimatedCost: 0,
      };
    }
    return {
      day: toNumber(day.day) || idx + 1,
      title: day.title || day.theme || `Day ${idx + 1}`,
      activities: Array.isArray(day.activities) ? day.activities : (day.plan ? [day.plan] : []),
      estimatedCost: toNumber(day.estimatedCost || day.cost),
    };
  });

  const costRaw = raw.costBreakdown || raw.budgetBreakdown || raw.costs || {};
  const costBreakdown = {
    travel: toNumber(costRaw.travel),
    stay: toNumber(costRaw.stay || costRaw.accommodation),
    food: toNumber(costRaw.food),
    activities: toNumber(costRaw.activities),
    total: toNumber(costRaw.total),
  };
  if (!costBreakdown.total) {
    costBreakdown.total =
      costBreakdown.travel + costBreakdown.stay + costBreakdown.food + costBreakdown.activities;
  }

  const localTipsRaw = raw.localTips || raw.tips || raw.insiderTips || [];
  const localTips = (Array.isArray(localTipsRaw) ? localTipsRaw : []).map((tip: any) => {
    if (typeof tip === "string") {
      return { category: "Tip", text: tip };
    }
    return { category: tip.category || "Tip", text: tip.text || tip.tip || "" };
  });

  const suggestedPlaces =
    raw.suggestedPlaces || raw.places || raw.mustVisit || [];

  return {
    travelOptions,
    accommodation,
    suggestedPlaces: Array.isArray(suggestedPlaces) ? suggestedPlaces : [],
    itinerary,
    costBreakdown,
    localTips,
    summary: raw.summary || raw.overview || raw.vibe || "",
    sources: raw.sources,
  };
};

export const generateTravelPlan = async (input: UserInput): Promise<TravelPlan> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const prompt = `You are "Chalo AI", the ultimate Indian travel buddy. You don't give boring tourist advice; you give the "real deal" (the jugaad).
  
  CONTEXT:
  From: ${input.fromCity}
  To: ${input.toCity}
  Vibe: ${input.tripType} (Family/Solo/Friends etc.)
  Budget: ₹${input.budget} total
  Duration: ${input.duration} days
  Interests: ${input.interests.join(", ")}

  YOUR MISSION:
  1. ACCOMMODATION: Find 2-3 specific, high-vibe stays (Hostels like Zostel, Boutique homestays, or iconic hotels). Provide real names and estimated prices.
  2. ITINERARY: Create a soulful day-by-day plan. Include "hidden gems" (e.g., a specific sunset point, a famous local bakery, or a secret trail).
  3. TRANSPORT: Suggest the best way to travel (e.g., "Take the sleeper bus for the experience" or "Book a pre-paid taxi from the stand to avoid overpaying").
  4. PRO JUGAAD (Insider Tips): Give 4-6 specific tips. Examples: "Use Namma Yatri app here," "Avoid the main market on Sundays," "This specific cafe has the best Maggi," "Bargain starting at 40%."

  Be soulful, expert, and hyper-local.

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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const responseText = response.text;
  console.log("=== RAW AI RESPONSE ===");
  console.log(responseText);
  console.log("======================");

  if (!responseText) throw new Error("No response from AI");

  const cleanJson = extractJsonBlock(responseText);

  console.log("=== EXTRACTED JSON ===");
  console.log(cleanJson);
  console.log("=====================");

  let plan: TravelPlan;
  try {
    const parsed = JSON.parse(cleanJson.trim());
    plan = normalizePlan(parsed);
    console.log("=== PARSED PLAN ===");
    console.log(JSON.stringify(plan, null, 2));
    console.log("==================");
  } catch (e) {
    console.error("=== JSON PARSE ERROR ===");
    console.error("Error:", e);
    console.error("Attempted to parse:", cleanJson);
    console.error("=======================");
    throw new Error("Invalid itinerary format received from AI. Please try again.");
  }

  // Validate required fields
  if (!plan.accommodation || !plan.itinerary || !plan.costBreakdown) {
    console.error("=== VALIDATION ERROR ===");
    console.error("Missing required fields in plan:", plan);
    console.error("=======================");
    throw new Error("Incomplete itinerary received. Please try again.");
  }

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    const sources: Source[] = [];
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        if (!sources.find(s => s.uri === chunk.web.uri)) {
          sources.push({
            title: chunk.web.title || "Travel Source",
            uri: chunk.web.uri
          });
        }
      }
    });
    plan.sources = sources;
  }

  return plan;
};
