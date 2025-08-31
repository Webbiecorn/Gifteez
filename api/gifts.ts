// Vercel Serverless Function: POST /api/gifts
// Expects JSON body: { recipient: string, budget: number, occasion: string, interests?: string }
// Returns: Gift[] JSON

import { GoogleGenAI, Type } from '@google/genai';

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
          required: ['name', 'affiliateLink'],
        },
      },
      imageUrl: { type: Type.STRING },
    },
    required: ['productName', 'description', 'priceRange', 'retailers', 'imageUrl'],
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY missing' });
  }

  try {
    const { recipient, budget, occasion, interests } = req.body || {};
    if (!recipient || !budget || !occasion) {
      return res.status(400).json({ error: 'Missing required fields: recipient, budget, occasion' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const interestsPrompt = interests ? `- Hobbies/Interests: ${interests}` : '';
    const prompt = `Find 3 to 5 perfect gift ideas for the following criteria:\n- Recipient: ${recipient}\n- Budget: Up to ${budget} euros\n- Occasion: ${occasion}\n${interestsPrompt}\n\nProvide modern, popular, and thoughtful gift suggestions available in the Netherlands. For each gift, provide: 1) product name, 2) short description (max 30 words), 3) price range in euros (e.g., "€25 - €50"), 4) 1-3 Dutch retailers (Bol.com, Coolblue, or Amazon.nl) with search URL, 5) a placeholder image URL from picsum.photos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: giftSchema,
      },
    });

    const textGetter = (response as any).text;
    const jsonText = typeof textGetter === 'function' ? textGetter() : String(textGetter || '');
    if (!jsonText || !jsonText.trim()) {
      return res.status(502).json({ error: 'Empty response from Gemini' });
    }

    try {
      const gifts = JSON.parse(jsonText);
      return res.status(200).json(gifts);
    } catch (e) {
      return res.status(502).json({ error: 'Invalid JSON from Gemini', raw: jsonText });
    }
  } catch (error: any) {
    const msg = typeof error?.message === 'string' ? error.message : 'Unknown error';
    const status = msg.includes('API key not valid') || msg.includes('API_KEY_INVALID') ? 401 : 500;
    return res.status(status).json({ error: msg });
  }
}

export const config = {
  runtime: 'nodejs',
};
