
import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, TravelPlan, Source } from "../types";

export const generateTravelPlan = async (input: UserInput): Promise<TravelPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are "Chalo AI", a pro-grade Indian travel concierge.
  
  TASK: Create a REAL, bookable itinerary for:
  From: ${input.fromCity}
  To: ${input.toCity}
  Persona: ${input.tripType}
  Budget: ₹${input.budget}
  Duration: ${input.duration} days
  Interests: ${input.interests.join(", ")}

  STRICT ACCURACY & INSIDER KNOWLEDGE:
  1. SEARCH: Find top-rated, specific hostels/hotels in ${input.toCity}.
  2. BOOKING: Provide real booking URLs (e.g., Zostel, Booking.com).
  3. LOGISTICS: Find real train/bus numbers and current fare estimates.
  4. INSIDER WISDOM: Provide 4-6 categorized tips. DO NOT give generic advice like "stay hydrated". Instead, give specific hacks:
     - Which specific local app to use (e.g., "Use Rapido for cheaper bikes in ${input.toCity}").
     - A specific hidden food stall name.
     - A specific cultural "must-do" that tourists miss.
     - A budget hack specific to this route.

  Format as STRICT JSON.`;

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
