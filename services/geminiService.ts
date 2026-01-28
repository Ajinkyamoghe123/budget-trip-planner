
import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, TravelPlan, Source } from "../types";

export const generateTravelPlan = async (input: UserInput): Promise<TravelPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are "Chalo AI", a modern, trend-aware Indian travel consultant. 
  Your goal is to search the live web for the most accurate and recent information for this trip:
  From: ${input.fromCity}
  To: ${input.toCity}
  Persona: ${input.tripType}
  Budget: ₹${input.budget}
  Duration: ${input.duration} days
  Interests: ${input.interests.join(", ")}

  IMPORTANT:
  1. Use Google Search to find REAL current train/bus prices and popular hostels/hotels.
  2. For low budgets (5k-15k), prioritize sleeper trains, state volvos, and shared dorms.
  3. For mid budgets (15k-40k), suggest 3AC/flights and private rooms.
  4. Ensure the cost breakdown adds up exactly to the total budget provided.
  5. Provide "Real India" hacks (e.g., Rapido, local mess prices).
  
  Format your response as a STRICT JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          travelOptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING },
                type: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["mode", "type", "estimatedCost", "description"]
            }
          },
          accommodation: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              area: { type: Type.STRING },
              avgNightlyRate: { type: Type.NUMBER },
              benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["type", "area", "avgNightlyRate", "benefits"]
          },
          suggestedPlaces: { type: Type.ARRAY, items: { type: Type.STRING } },
          itinerary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedCost: { type: Type.NUMBER }
              },
              required: ["day", "title", "activities", "estimatedCost"]
            }
          },
          costBreakdown: {
            type: Type.OBJECT,
            properties: {
              travel: { type: Type.NUMBER },
              stay: { type: Type.NUMBER },
              food: { type: Type.NUMBER },
              activities: { type: Type.NUMBER },
              total: { type: Type.NUMBER }
            },
            required: ["travel", "stay", "food", "activities", "total"]
          },
          localTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "travelOptions", "accommodation", "suggestedPlaces", "itinerary", "costBreakdown", "localTips"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  let plan: TravelPlan = JSON.parse(text);

  // Extract grounding sources
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    const sources: Source[] = [];
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        // Avoid duplicate URIs
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
