
import { GoogleGenAI, Type } from "@google/genai";
import { Market, ApiResponse } from "../types";

const SYSTEM_INSTRUCTION = `You are a world-class SEO specialist for Print-on-Demand (POD) platforms like Spreadshirt and TeePublic. 
Your primary goal is to generate metadata that maximizes search visibility while strictly adhering to platform constraints. 
Maintain a professional, creative tone that appeals to niche buyers.`;

// Track current key index for rotation across calls
let currentKeyIndex = 0;

const getValidPool = (): string[] => {
  try {
    const pool = JSON.parse(localStorage.getItem('GEMINI_API_POOL') || '[]');
    if (Array.isArray(pool) && pool.length > 0) {
      return pool;
    }
  } catch (e) {
    console.error("Error parsing key pool:", e);
  }

  // Fallback to single key if pool is empty or invalid
  const legacyKey = localStorage.getItem('GEMINI_API_KEY');
  // Only use process.env.API_KEY if we are not in a strict client-only context where it might be undefined
  const envKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  
  const fallback = legacyKey || envKey;
  return fallback ? [fallback] : [];
};

export const generateMetadata = async (
  base64Image: string, 
  mimeType: string, 
  market: Market
): Promise<ApiResponse> => {
  const pool = getValidPool();
  if (pool.length === 0) {
    throw new Error("No API keys found. Please add your Gemini API keys in Settings.");
  }

  const prompt = market === Market.SPREADSHIRT 
    ? `Analyze this POD design for Spreadshirt:
       1. Title: Creative SEO title. MUST BE 50 CHARACTERS OR LESS.
       2. Description: Compelling product pitch. MUST BE 200 CHARACTERS OR LESS.
       3. Tags: Provide exactly 25 highly relevant keywords for this niche.
       Format: JSON only.`
    : `Analyze this POD design for TeePublic:
       1. Title: Catchy SEO title.
       2. Description: Detailed product description.
       3. Main Tag: The single most impactful niche tag.
       4. Secondary Tags: A broad list of relevant SEO keywords.
       Format: JSON only.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      tags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      },
      ...(market === Market.TEEPUBLIC ? { mainTag: { type: Type.STRING } } : {})
    },
    required: ["title", "description", "tags", ...(market === Market.TEEPUBLIC ? ["mainTag"] : [])]
  };

  // Internal function to handle retries with rotation
  const attemptRequest = async (retriesLeft: number): Promise<ApiResponse> => {
    const apiKey = pool[currentKeyIndex % pool.length];
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp", // Using a stable flash model for fast multi-key processing
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { data: base64Image, mimeType } }
            ]
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI engine");
      
      return JSON.parse(text) as ApiResponse;
      
    } catch (error: any) {
      console.warn(`Key Rotation: Key at index ${currentKeyIndex % pool.length} failed.`, error.message);
      
      const isRateLimit = error.message?.includes('429') || error.message?.toLowerCase().includes('too many requests');
      const isOverload = error.message?.includes('500') || error.message?.includes('503');
      const isInvalid = error.message?.includes('401') || error.message?.includes('API_KEY_INVALID');

      if ((isRateLimit || isOverload || isInvalid) && retriesLeft > 1) {
        currentKeyIndex++; // Increment to next key in pool
        return attemptRequest(retriesLeft - 1); 
      }
      
      throw error;
    }
  };

  // Allow one full rotation of the pool
  return attemptRequest(pool.length);
};
