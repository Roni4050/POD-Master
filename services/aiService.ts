
import { Market, ApiResponse, KeyPool } from "../types";

const SYSTEM_INSTRUCTION = `You are a world-class SEO specialist for Print-on-Demand (POD) platforms like Spreadshirt and TeePublic. 
Your primary goal is to generate metadata that maximizes search visibility. 
Strictly adhere to platform constraints. Return ONLY valid JSON.

CRITICAL: NEVER include the words 'T-Shirt', 'Shirt', 'Hoodie', or any other garment/product names in the title, description, or tags. The platform adds these automatically. Focus exclusively on the design subject, style, and niche.

Spreadshirt: Title max 50 chars, Desc max 200 chars, exactly 25 highly relevant SEO keywords in an array.
TeePublic: Catchy title, detailed desc, one mainTag, and exactly 25 secondary tags.`;

let currentGroqIndex = 0;
let currentMistralIndex = 0;

const getPool = (): KeyPool => {
  try {
    const pool = JSON.parse(localStorage.getItem('POD_MASTER_KEY_POOL') || '{}');
    return {
      gemini: [], // Permanently disabled
      mistral: pool.mistral || [],
      groq: pool.groq || []
    };
  } catch (e) {
    return { gemini: [], mistral: [], groq: [] };
  }
};

export const generateMetadata = async (
  base64Image: string, 
  mimeType: string, 
  market: Market
): Promise<ApiResponse> => {
  const pool = getPool();
  const hasGroq = pool.groq.length > 0;
  const hasMistral = pool.mistral.length > 0;

  if (!hasGroq && !hasMistral) {
    throw new Error("No API keys found for Groq or Mistral. Please add keys in Settings to process designs.");
  }

  // Determine provider: Default to Groq for speed, fallback to Mistral
  const provider = hasGroq ? 'groq' : 'mistral';
  const keys = provider === 'groq' ? pool.groq : pool.mistral;
  
  const attemptRequest = async (retriesLeft: number): Promise<ApiResponse> => {
    const index = provider === 'groq' ? currentGroqIndex : currentMistralIndex;
    const apiKey = keys[index % keys.length];

    const prompt = market === Market.SPREADSHIRT 
      ? `Analyze this artwork and provide optimized SEO metadata for Spreadshirt:
         - title: catchy title, max 50 characters
         - description: engaging sales pitch, max 200 characters
         - tags: exactly 25 niche-specific keywords in an array
         Return as JSON.`
      : `Analyze this artwork and provide optimized SEO metadata for TeePublic:
         - title: creative searchable title
         - description: detailed product description
         - mainTag: the single most important niche keyword
         - tags: exactly 25 secondary keywords in an array
         Return as JSON.`;

    const url = provider === 'groq' 
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.mistral.ai/v1/chat/completions";

    const model = provider === 'groq'
      ? "llama-3.2-11b-vision-preview"
      : "pixtral-large-latest"; // Using the large analysis model as requested

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content) as ApiResponse;

    } catch (error: any) {
      console.warn(`${provider} request failed:`, error.message);

      const isRateLimit = error.message.includes('429') || error.message.toLowerCase().includes('rate');
      if (isRateLimit && retriesLeft > 1) {
        if (provider === 'groq') currentGroqIndex++;
        else currentMistralIndex++;
        return attemptRequest(retriesLeft - 1);
      }
      throw error;
    }
  };

  return attemptRequest(keys.length);
};
