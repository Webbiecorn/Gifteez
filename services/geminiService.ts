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
  // 1) Try calling serverless API (keeps key secret in production)
  try {
    const resp = await fetch('/api/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, budget, occasion, interests }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data)) return data as Gift[];
      // if API returns shape with data
      if (Array.isArray((data as any)?.gifts)) return (data as any).gifts as Gift[];
      // else fallthrough to client if unexpected
    } else if (resp.status === 404) {
      // No serverless function present in this environment, fallback to client
    } else {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error || `Serverfout (${resp.status})`);
    }
  } catch (e) {
    // In local dev without serverless, continue to client method
  }

  // 2) Client-side fallback (demo/local only)
  if ((import.meta as any)?.env?.PROD) {
    throw new Error('Server-API is niet beschikbaar. Probeer het later opnieuw.');
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Geen server-API en geen API-sleutel gevonden. Stel Vercel API in of voeg tijdelijk een key toe.");
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