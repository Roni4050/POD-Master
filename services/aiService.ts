
import { Market, ApiResponse, ProviderConfig, ProviderType } from "../types";

const SYSTEM_INSTRUCTION = `You are a world-class Print-on-Demand (POD) SEO expert.
Your goal is to generate highly optimized metadata for Spreadshirt and TeePublic.

CORE RULES:
1. NO CLOTHING WORDS: Never use "T-shirt", "Shirt", "Hoodie", "Apparel", or "Clothing".
2. SPREADSHIRT: Title (max 50 chars), Description (max 200 chars), exactly 25 tags.
3. TEEPUBLIC: 1 Main Tag (Core Anchor), 25 Secondary Tags.
4. ANTI-CANNIBALIZATION: Main Tag must not appear in secondary tags.
5. VISUAL STORYTELLING: Write evocative, narrative descriptions.`;

export const generateMetadata = async (
  base64Image: string,
  mimeType: string,
  market: Market,
  configs: ProviderConfig,
  updateStatus: (provider: ProviderType, status: 'active' | 'rate-limited' | 'error' | 'disabled') => void
): Promise<ApiResponse> => {
  
  // Try Mistral first
  if (configs.mistral.isActive && configs.mistral.apiKey) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${configs.mistral.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "pixtral-large-latest",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this design for ${market}. 
                  IMPORTANT: Refine your analysis to identify unique artistic styles (e.g., risograph, charcoal, vector minimalism, synthwave) and specific medium/texture keywords (e.g., rough grain, watercolor bleeds, half-tone dots, distressed ink). 
                  Use these insights to generate 25 highly descriptive tags.
                  Return JSON: { "title": "...", "description": "...", "tags": ["...", "..."], "mainTag": "..." }`
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content) as ApiResponse;
        updateStatus('mistral', 'active');
        return finalizeResult(result, market);
      } else {
        throw new Error(`Mistral API error: ${response.status}`);
      }
    } catch (err) {
      console.warn("Mistral failed, falling back to Groq...", err);
      updateStatus('mistral', 'error');
    }
  }

  // Fallback to Groq
  if (configs.groq.isActive && configs.groq.apiKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${configs.groq.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze for ${market}. Identify style and subjects. Return JSON: { "title": "...", "description": "...", "tags": [], "mainTag": "..." }`
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${base64Image}` }
                }
              ]
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content) as ApiResponse;
        updateStatus('groq', 'active');
        return finalizeResult(result, market);
      } else {
        throw new Error(`Groq API error: ${response.status}`);
      }
    } catch (err) {
      updateStatus('groq', 'error');
      throw err;
    }
  }

  throw new Error("No active AI provider with valid API key found.");
};

function finalizeResult(result: ApiResponse, market: Market): ApiResponse {
  if (market === Market.SPREADSHIRT) {
    result.title = result.title.substring(0, 50).trim();
    result.description = result.description.substring(0, 200).trim();
  }
  result.tags = Array.from(new Set(result.tags)).slice(0, 25);
  return result;
}
