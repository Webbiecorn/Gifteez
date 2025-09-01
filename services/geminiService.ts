
import { GoogleGenAI, Type } from "@google/genai";
import { Gift } from '../types';

const giftSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      productName: {
        type: Type.STRING,
        description: 'The name of the gift product.',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, appealing description of the gift, max 30 words.',
      },
      priceRange: {
        type: Type.STRING,
        description: 'An estimated price range for the gift, e.g., "€25 - €50".',
      },
      retailers: {
        type: Type.ARRAY,
        description: 'A list of 1 to 3 Dutch webshops selling the product.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the webshop, e.g., "Bol.com" or "Coolblue".' },
            affiliateLink: { type: Type.STRING, description: 'A plausible affiliate search link for that webshop.' },
          },
          required: ['name', 'affiliateLink'],
        },
      },
      imageUrl: {
        type: Type.STRING,
        description: 'A placeholder image URL from `https://picsum.photos/300/300`'
      }
    },
    required: ['productName', 'description', 'priceRange', 'retailers', 'imageUrl'],
  },
};

export const findGifts = async (recipient: string, budget: number, occasion: string, interests?: string): Promise<Gift[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const interestsPrompt = interests ? `- Hobbies/Interests: ${interests}` : '';

  const prompt = `
    Find 3 to 5 perfect gift ideas for the following criteria:
    - Recipient: ${recipient}
    - Budget: Up to ${budget} euros
    - Occasion: ${occasion}
    ${interestsPrompt}

    Provide modern, popular, and thoughtful gift suggestions available in the Netherlands.
    For each gift, provide:
    1. A product name.
    2. A short, compelling description (max 30 words).
    3. An estimated price range in euros (e.g., "€25 - €50").
    4. A list of 1 to 3 major Dutch online retailers (specifically from Bol.com, Coolblue, or Amazon.nl). For each retailer, provide their name and a direct, functional search URL for the product on their respective Dutch (.nl) website (e.g., for Amazon, use Amazon.nl, not Amazon.com).
    5. A placeholder image URL from picsum.photos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: giftSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        console.error("Gemini API returned an empty response.");
        throw new Error("Received an empty response from the AI. Please try again.");
    }

    try {
        const gifts: Gift[] = JSON.parse(jsonText);
        return gifts;
    } catch (jsonError) {
        console.error("Error parsing JSON from Gemini API:", jsonError);
        console.error("Raw response text:", jsonText);
        throw new Error("The AI returned an unexpected format. Please try again.");
    }

  } catch (error)
 {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
         throw new Error("The configured API Key is not valid. Please check the server configuration.");
    }
    throw new Error("Sorry, we couldn't find gifts at the moment. Please try again later.");
  }
};