import { GoogleGenerativeAI, type GenerateContentResult } from "@google/generative-ai";
import { config } from "../config.js";
import type { LLMExtractionResponse, Ingredient } from "../types.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Gemini 2.5 Flash — supports native video understanding via YouTube URLs
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.1,
  },
});

const INGREDIENT_SCHEMA = `{
  "recipe_name": string | null,
  "servings": number | null,
  "ingredients": [
    {
      "name": string,           // e.g. "all-purpose flour"
      "quantity": number | null, // e.g. 2.5, null if unknown
      "unit": string | null,     // e.g. "cups", "oz", "cloves", null if count
      "raw_text": string,        // original text or description of what was seen/heard
      "optional": boolean,
      "preparation": string | null // e.g. "minced", "sliced", "room temperature"
    }
  ],
  "instructions": [
    {
      "step_number": number,        // sequential step number starting at 1
      "text": string,               // the cooking instruction text
      "duration": string | null,    // e.g. "5 minutes", "1 hour", null if not mentioned
      "temperature": string | null, // e.g. "350°F", "180°C", null if not mentioned
      "technique": string | null    // e.g. "sauté", "bake", "fold", null if not specific
    }
  ]
}`;

export interface VideoAnalysisResult {
  extraction: LLMExtractionResponse;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Analyze a YouTube video using Gemini 2.5 Flash's native video understanding.
 * Passes the YouTube URL directly via fileData.fileUri — no downloading required.
 */
export async function analyzeVideo(
  videoId: string,
  previousIngredients: Ingredient[]
): Promise<VideoAnalysisResult> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const previousContext =
    previousIngredients.length > 0
      ? `\n\nPrevious tiers already identified these ingredients — verify and supplement them:\n${previousIngredients.map((i) => `- ${i.name}${i.quantity ? ` (${i.quantity} ${i.unit || ""})` : ""}`).join("\n")}`
      : "";

  const prompt = `Watch this cooking video carefully. Extract ALL ingredients and step-by-step cooking instructions by observing:
1. What the cook says (spoken ingredients, quantities, instructions)
2. What is shown on screen (ingredient labels, measuring, packages)
3. Any on-screen text or recipe cards displayed
4. The sequence of cooking steps performed

Return every ingredient with quantities when visible or mentioned.
Also extract every cooking instruction in order — each step shown or described, including durations, temperatures, and techniques.
If the recipe name or serving count is mentioned or shown, include those.

Return JSON matching this schema:
${INGREDIENT_SCHEMA}${previousContext}`;

  const contents = [
    {
      fileData: {
        fileUri: youtubeUrl,
        mimeType: "video/*",
      },
    },
    { text: prompt },
  ];

  const result = await model.generateContent(contents);
  let extraction = parseVideoResponse(result);

  // Retry once if Gemini returned no ingredients
  if (extraction.parsed.ingredients.length === 0) {
    console.log("[Tier 2] Empty ingredients on first attempt, retrying…");
    const retry = await model.generateContent(contents);
    const retryResult = parseVideoResponse(retry);
    // Use retry if it produced ingredients, otherwise keep original
    if (retryResult.parsed.ingredients.length > 0) {
      extraction = retryResult;
    }
  }

  return {
    extraction: extraction.parsed,
    inputTokens: extraction.inputTokens,
    outputTokens: extraction.outputTokens,
  };
}

function parseVideoResponse(result: GenerateContentResult) {
  const raw = result.response.text();
  const usageMetadata = result.response.usageMetadata;

  let parsed: LLMExtractionResponse;
  try {
    parsed = JSON.parse(raw) as LLMExtractionResponse;
  } catch {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    parsed = JSON.parse(cleaned) as LLMExtractionResponse;
  }

  if (!Array.isArray(parsed.ingredients)) {
    parsed.ingredients = [];
  }
  if (!Array.isArray(parsed.instructions)) {
    parsed.instructions = [];
  }

  return {
    parsed,
    inputTokens: usageMetadata?.promptTokenCount ?? 0,
    outputTokens: usageMetadata?.candidatesTokenCount ?? 0,
  };
}
