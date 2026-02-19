import { UserInput, TravelPlan, Source } from "../types";

const RAW_API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.trim() || "";

const normalizeApiBaseUrl = (value: string): string => value.replace(/\/+$/, "");

const isLocalhostUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname);
  } catch {
    return false;
  }
};

const getPreferredApiBaseUrl = (): string => {
  if (!RAW_API_BASE_URL) return "";

  // In production, ignore localhost targets because they break deployed clients.
  if (import.meta.env.PROD && isLocalhostUrl(RAW_API_BASE_URL)) return "";

  return normalizeApiBaseUrl(RAW_API_BASE_URL);
};

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

const normalizeUrl = (url: unknown): string | undefined => {
  if (typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.href;
  } catch {
    return undefined;
  }
};

const dedupeStrings = (items: unknown[]): string[] => {
  const out: string[] = [];
  const seen = new Set<string>();

  items.forEach((item) => {
    const value = typeof item === "string" ? item.trim() : "";
    if (!value) return;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(value);
  });

  return out;
};

const fallbackDayActivities = (day: number): string[] => [
  `Explore key neighborhoods and landmarks for Day ${day}`,
  "Try a well-rated local cafe or restaurant",
  "Leave buffer time for commute and rest",
];

const normalizePlan = (raw: any, input: UserInput, sources?: Source[]): TravelPlan => {
  const travelOptionsRaw =
    raw.travelOptions || raw.transport || raw.transportOptions || [];
  let travelOptions = (Array.isArray(travelOptionsRaw) ? travelOptionsRaw : [])
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
        estimatedCost: Math.max(0, toNumber(opt.estimatedCost || opt.cost || opt.price)),
        description: opt.description || opt.details || "",
      };
    })
    .filter((opt) => opt.mode || opt.description);

  if (travelOptions.length === 0) {
    travelOptions = [{
      mode: input.transportPreference,
      type: "Recommended",
      estimatedCost: 0,
      description: "Transport recommendation is based on your preferred travel style and budget.",
    }];
  }

  const accommodationRaw = raw.accommodation || raw.stays || raw.accommodations || {};
  const optionsRaw =
    accommodationRaw.options || accommodationRaw.stays || raw.accommodationOptions || [];
  let accommodationOptions = (Array.isArray(optionsRaw) ? optionsRaw : []).map((opt: any) => ({
    name: opt.name || opt.title || "Stay Option",
    type: opt.type || opt.category || "Accommodation",
    price: Math.max(0, toNumber(opt.price || opt.cost || opt.rate)),
    rating: toNumber(opt.rating),
    reviewCount: opt.reviewCount || opt.reviews || "",
    highlight: opt.highlight || opt.note || "",
    bookingUrl: normalizeUrl(opt.bookingUrl || opt.url),
  }));

  if (accommodationOptions.length === 0) {
    accommodationOptions = [{
      name: `Recommended stay in ${input.toCity}`,
      type: "Hotel / Homestay",
      price: 0,
      rating: 0,
      reviewCount: "",
      highlight: "Compare top-rated options near your preferred area.",
      bookingUrl: undefined,
    }];
  }

  const itineraryRaw = raw.itinerary || raw.dayByDay || raw.dailyPlan || [];
  const itineraryCandidate = (Array.isArray(itineraryRaw) ? itineraryRaw : []).map((day: any, idx: number) => {
    if (typeof day === "string") {
      return {
        day: idx + 1,
        title: `Day ${idx + 1}`,
        activities: dedupeStrings([day]),
        estimatedCost: 0,
      };
    }

    const activities = Array.isArray(day.activities) ? day.activities : (day.plan ? [day.plan] : []);
    return {
      day: toNumber(day.day) || idx + 1,
      title: day.title || day.theme || `Day ${idx + 1}`,
      activities: dedupeStrings(activities),
      estimatedCost: Math.max(0, toNumber(day.estimatedCost || day.cost)),
    };
  });

  const itinerary: TravelPlan["itinerary"] = [];
  const targetDays = Math.max(1, input.duration);

  for (let i = 0; i < targetDays; i += 1) {
    const existing = itineraryCandidate[i];
    itinerary.push({
      day: i + 1,
      title: existing?.title || `Day ${i + 1}`,
      activities: (existing?.activities && existing.activities.length > 0)
        ? existing.activities.slice(0, 8)
        : fallbackDayActivities(i + 1),
      estimatedCost: Math.max(0, existing?.estimatedCost || 0),
    });
  }

  const costRaw = raw.costBreakdown || raw.budgetBreakdown || raw.costs || {};
  const costBreakdown = {
    travel: Math.max(0, toNumber(costRaw.travel)),
    stay: Math.max(0, toNumber(costRaw.stay || costRaw.accommodation)),
    food: Math.max(0, toNumber(costRaw.food)),
    activities: Math.max(0, toNumber(costRaw.activities)),
    total: Math.max(0, toNumber(costRaw.total)),
  };

  if (!costBreakdown.total) {
    costBreakdown.total =
      costBreakdown.travel + costBreakdown.stay + costBreakdown.food + costBreakdown.activities;
  }

  if (!costBreakdown.total) {
    costBreakdown.total = input.budget;
    costBreakdown.travel = Math.round(input.budget * 0.25);
    costBreakdown.stay = Math.round(input.budget * 0.35);
    costBreakdown.food = Math.round(input.budget * 0.2);
    costBreakdown.activities = Math.round(input.budget * 0.2);
  }

  const defaultDailyCost = Math.max(0, Math.round(costBreakdown.total / targetDays));
  const normalizedItinerary = itinerary.map((day) => ({
    ...day,
    estimatedCost: day.estimatedCost || defaultDailyCost,
  }));

  const localTipsRaw = raw.localTips || raw.tips || raw.insiderTips || [];
  let localTips = (Array.isArray(localTipsRaw) ? localTipsRaw : []).map((tip: any) => {
    if (typeof tip === "string") {
      return { category: "Tip", text: tip };
    }
    return { category: tip.category || "Tip", text: tip.text || tip.tip || "" };
  }).filter((tip) => tip.text);

  if (localTips.length === 0) {
    localTips = [{
      category: "Planning",
      text: "Book transport and stays in advance to secure better rates.",
    }];
  }

  const suggestedPlaces = dedupeStrings(
    Array.isArray(raw.suggestedPlaces || raw.places || raw.mustVisit || [])
      ? (raw.suggestedPlaces || raw.places || raw.mustVisit || [])
      : [],
  );

  return {
    travelOptions,
    accommodation: {
      area: accommodationRaw.area || accommodationRaw.location || accommodationRaw.neighborhood || input.toCity,
      whyThisArea: accommodationRaw.whyThisArea || accommodationRaw.reason || "",
      options: accommodationOptions,
    },
    suggestedPlaces,
    itinerary: normalizedItinerary,
    costBreakdown,
    localTips,
    summary: raw.summary || raw.overview || raw.vibe || `A curated ${input.duration}-day plan for ${input.toCity}.`,
    sources,
  };
};

interface GenerationResponse {
  responseText?: string;
  sources?: Source[];
  error?: string;
  details?: string;
}

const callGenerationApi = async (input: UserInput): Promise<GenerationResponse> => {
  const preferredBaseUrl = getPreferredApiBaseUrl();
  const candidateEndpoints = [
    preferredBaseUrl ? `${preferredBaseUrl}/api/generate-plan` : "",
    "/api/generate-plan",
  ].filter(Boolean);
  const uniqueEndpoints = [...new Set(candidateEndpoints)];

  let lastError: unknown;

  for (const endpoint of uniqueEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = payload?.error || "Unable to generate itinerary at the moment.";
        const details = payload?.details ? ` (${payload.details})` : "";
        throw new Error(`${msg}${details}`);
      }

      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to generate itinerary at the moment.");
};

export const generateTravelPlan = async (input: UserInput): Promise<TravelPlan> => {
  const result = await callGenerationApi(input);
  const responseText = result.responseText;
  if (!responseText) throw new Error("No itinerary content was returned.");

  const cleanJson = extractJsonBlock(responseText);

  try {
    const parsed = JSON.parse(cleanJson.trim());
    const normalized = normalizePlan(parsed, input, result.sources);

    if (!normalized.itinerary.length || !normalized.accommodation?.options?.length) {
      throw new Error("Incomplete itinerary details returned.");
    }

    return normalized;
  } catch (error) {
    console.error("Plan parsing failed:", error);
    throw new Error("Received an invalid itinerary format. Please try again.");
  }
};
