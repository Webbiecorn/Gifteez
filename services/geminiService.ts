import { GoogleGenAI, Type } from "@google/genai";
import { Gift } from "../types";

const giftSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      description: { type: Type.STRING },
      priceRange: { type: Type.STRING },
      retailers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            affiliateLink: { type: Type.STRING },
          },
          required: ["name", "affiliateLink"],
        },
      },
      imageUrl: { type: Type.STRING },
    },
    required: ["productName", "description", "priceRange", "retailers", "imageUrl"],
  },
};

// Prefer env var from Vite define; fall back to localStorage for demo usage
const getApiKey = (): string | undefined => {
  // 1) Vite env (preferred for builds)
  try {
    const viteKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
    if (typeof viteKey === "string" && viteKey.trim()) return viteKey.trim();
  } catch {}

  // 2) process.env (if defined during build)
  try {
    const nodeKey = (typeof process !== "undefined" ? (process as any)?.env?.GEMINI_API_KEY : undefined) as
      | string
      | undefined;
    if (typeof nodeKey === "string" && nodeKey.trim()) return nodeKey.trim();
  } catch {}

  // 3) Local fallback for demos (client-side)
  try {
    const key =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("GEMINI_API_KEY") || localStorage.getItem("API_KEY"))) ||
      undefined;
    return key || undefined;
  } catch {
    return undefined;
  }
};

export const findGifts = async (
  recipient: string,
  budget: number,
  occasion: string,
  interests?: string
): Promise<Gift[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Er is geen Gemini API-sleutel ingesteld. Voeg je API key toe of stel GEMINI_API_KEY in."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const interestsPrompt = interests ? `- Hobbies/Interests: ${interests}` : "";
  const prompt = `Find 3 to 5 perfect gift ideas for the following criteria:\n- Recipient: ${recipient}\n- Budget: Up to ${budget} euros\n- Occasion: ${occasion}\n${interestsPrompt}\n\nProvide modern, popular, and thoughtful gift suggestions available in the Netherlands. For each gift, provide: 1) product name, 2) short description (max 30 words), 3) price range in euros (e.g., "€25 - €50"), 4) 1-3 Dutch retailers (Bol.com, Coolblue, or Amazon.nl) with search URL, 5) a placeholder image URL from picsum.photos.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: giftSchema,
      },
    });

  const textGetter = (response as any).text;
  const jsonText = typeof textGetter === "function" ? textGetter() : String(textGetter || "");
    if (!jsonText || !jsonText.trim()) {
      throw new Error("De AI gaf een lege reactie. Probeer het opnieuw.");
    }

    try {
      const gifts: Gift[] = JSON.parse(jsonText);
      return gifts;
    } catch (jsonError) {
      console.error("Error parsing JSON from Gemini API:", jsonError);
      console.error("Raw response text:", jsonText);
      throw new Error("De AI retourneerde een onverwacht formaat. Probeer het opnieuw.");
    }
  } catch (error: any) {
    const msg = typeof error?.message === "string" ? error.message : "";
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
      throw new Error("Je API-sleutel is ongeldig. Controleer deze en probeer opnieuw.");
    }
    throw new Error("Sorry, we konden nu geen cadeaus vinden. Probeer het later opnieuw.");
  }
};