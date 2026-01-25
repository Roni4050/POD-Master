
import { Market, ApiResponse, ProviderConfig, ProviderType } from "../types";

const SYSTEM_INSTRUCTION = `You are a world-class Print-on-Demand (POD) SEO expert and computer vision specialist.
Your goal is to generate high-performance, conversion-optimized metadata for Spreadshirt, TeePublic, and Zazzle.

FRONTIER VISION CAPABILITIES (Mistral Large 3 / Pixtral Large Preview):
- Perform deep visual analysis of artistic medium, texture, and text.
- Identify specific sub-culture symbols and niche aesthetics.
- Generate SEO-rich titles and descriptions that drive clicks.
- Accurate detection of visual elements even in complex or abstract designs.

CORE RULES:
1. NO CLOTHING WORDS: Never use "T-shirt", "Shirt", "Hoodie", "Apparel", or "Clothing".
2. SPREADSHIRT: Title (max 50 chars), Description (max 200 chars), exactly 25 tags.
3. TEEPUBLIC: 1 Main Tag (Core Anchor), 25 Secondary Tags.
4. ZAZZLE: Title (max 100 chars), Description (max 500 chars), 10-25 tags focusing on events and occasions.
5. ANTI-CANNIBALIZATION: Main Tag must not appear in secondary tags (TeePublic).
6. VISUAL STORYTELLING: Write evocative, narrative descriptions.
7. SEO: Use high-volume keywords related to the visual subject, artistic style, and potential gift recipient.`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const parseError = async (response: Response, provider: string): Promise<{ 
  message: string; 
  isRateLimit: boolean; 
  isAccessDenied: boolean; 
  isOverloaded: boolean;
  isRetryable: boolean;
}> => {
  const status = response.status;
  let message = "";
  const isRateLimit = status === 429;
  const isAccessDenied = status === 403;
  const isOverloaded = status >= 500;
  const isRetryable = isRateLimit || isOverloaded;

  if (status === 401) message = `${provider}: Invalid API Key. Please check your credentials.`;
  else if (status === 403) message = `${provider}: Access Denied. Your Mistral Tier might not support frontier/preview models.`;
  else if (status === 429) message = `${provider}: Transient rate limit. Retrying...`;
  else if (status >= 500) message = `${provider}: Server temporary overload. Retrying...`;
  else {
    try {
      const errorData = await response.json();
      message = `${provider}: ${errorData.error?.message || response.statusText}`;
    } catch {
      message = `${provider}: Unexpected error (${status})`;
    }
  }

  return { message, isRateLimit, isAccessDenied, isOverloaded, isRetryable };
};

export const validateMistralKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const response = await fetch("https://api.mistral.ai/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    return response.ok;
  } catch (err) {
    console.error("Validation error:", err);
    return false;
  }
};

export const generateMetadata = async (
  base64Image: string,
  mimeType: string,
  market: Market,
  configs: ProviderConfig,
  updateStatus: (provider: ProviderType, status: 'active' | 'rate-limited' | 'error' | 'disabled') => void
): Promise<ApiResponse> => {
  
  const providers: ProviderType[] = ['mistral', 'groq'];
  let lastErrorMsg = "No active AI provider available.";
  const MAX_RETRIES = 3; 

  for (const providerId of providers) {
    const config = configs[providerId];

    if (!config.isActive || !config.apiKey || config.status === 'rate-limited') {
      continue;
    }

    // Updated model list to include explicit preview/latest IDs for Mistral Large Multimodal
    const modelsToTry = providerId === 'mistral' 
      ? ["pixtral-large-latest", "pixtral-large-2411"] 
      : ["llama-3.2-11b-vision-preview"];

    for (const model of modelsToTry) {
      const endpoint = providerId === 'mistral' 
        ? "https://api.mistral.ai/v1/chat/completions" 
        : "https://api.groq.com/openai/v1/chat/completions";

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            const jitter = Math.random() * 1000;
            await sleep(attempt * 3000 + jitter); 
          }

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: SYSTEM_INSTRUCTION },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Perform deep Frontier Visual Analysis for ${market}. Identify medium, sub-culture symbols, text content, and trending keywords. Return JSON: { "title": "...", "description": "...", "tags": [], "mainTag": "..." }`
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
            updateStatus(providerId, 'active');
            return finalizeResult(result, market);
          } else {
            const errInfo = await parseError(response, providerId === 'mistral' ? `Mistral (${model})` : "Groq");
            
            if (errInfo.isRetryable && attempt < MAX_RETRIES) {
              console.warn(`${errInfo.message} (Attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
              continue;
            }

            // If it's a model-not-found error for a specific ID, try the next one in modelsToTry
            if (response.status === 404) {
              console.warn(`Model ${model} not found, trying next available...`);
              break; 
            }

            if (errInfo.isRateLimit) updateStatus(providerId, 'rate-limited');
            else updateStatus(providerId, 'error');
            
            lastErrorMsg = errInfo.message;
            break; 
          }
        } catch (err: any) {
          if (attempt === MAX_RETRIES) {
            console.error(`Final attempt failed for ${providerId}:`, err.message);
            updateStatus(providerId, 'error');
            lastErrorMsg = `${providerId.toUpperCase()} Connection Error: ${err.message}`;
          } else {
            continue;
          }
        }
      }
    }
  }

  throw new Error(lastErrorMsg);
};

function finalizeResult(result: ApiResponse, market: Market): ApiResponse {
  if (!Array.isArray(result.tags)) result.tags = [];

  if (market === Market.SPREADSHIRT) {
    result.title = result.title.substring(0, 50).trim();
    result.description = result.description.substring(0, 200).trim();
    
    const placeholders = [
      "gift idea", "custom design", "graphic art", "trending style", "unique art", 
      "creative gift", "aesthetic", "vibrant colors", "detailed illustration", "statement art",
      "premium print", "retro style", "modern design", "gift for him", "gift for her"
    ];
    
    let cleanTags = Array.from(new Set(result.tags.map(t => t.toLowerCase().trim()))).filter(t => t.length > 0);
    
    while (cleanTags.length < 25) {
      const p = placeholders[cleanTags.length % placeholders.length];
      const newTag = cleanTags.includes(p) ? `${p} print` : p;
      cleanTags.push(newTag);
    }
    result.tags = cleanTags.slice(0, 25);
  } else if (market === Market.ZAZZLE) {
    result.title = result.title.substring(0, 100).trim();
    result.description = result.description.substring(0, 500).trim();
    result.tags = Array.from(new Set(result.tags)).slice(0, 25);
  } else {
    result.tags = Array.from(new Set(result.tags)).slice(0, 26); 
  }
  
  return result;
}
