
import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, TravelPlan, Source } from "../types";

export const generateTravelPlan = async (input: UserInput): Promise<TravelPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  Be soulful, expert, and hyper-local. Format as STRICT JSON.`;

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
              area: { type: Type.STRING },
              whyThisArea: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    rating: { type: Type.NUMBER },
                    reviewCount: { type: Type.STRING },
                    highlight: { type: Type.STRING },
                    bookingUrl: { type: Type.STRING }
                  },
                  required: ["name", "type", "price", "rating", "reviewCount", "highlight"]
                }
              }
            },
            required: ["area", "whyThisArea", "options"]
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
          localTips: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["category", "text"]
            } 
          }
        },
        required: ["summary", "travelOptions", "accommodation", "suggestedPlaces", "itinerary", "costBreakdown", "localTips"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  let plan: TravelPlan = JSON.parse(text);

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
