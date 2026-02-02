import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
import type { LLMExtractionResponse } from "../types.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Gemini 2.0 Flash — cheapest option for text extraction ($0.10/1M input)
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
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
      "raw_text": string,        // original text this was extracted from
      "optional": boolean,
      "preparation": string | null // e.g. "minced", "sliced", "room temperature"
    }
  ]
}`;

/**
 * Extract ingredients from a text block (description or transcript) using Gemini.
 */
export async function extractIngredients(
  text: string,
  context: "description" | "transcript"
): Promise<LLMExtractionResponse> {
  const prompt =
    context === "description"
      ? `Extract all cooking ingredients from this YouTube video description.
Look for ingredient lists, recipe sections, or any mentions of ingredients with quantities.
If there is a recipe name or serving count, include those too.

Return JSON matching this schema:
${INGREDIENT_SCHEMA}

Description:
${text}`
      : `Extract all cooking ingredients mentioned in this video transcript.
The speaker may mention ingredients informally (e.g., "grab some flour", "two cloves of garlic").
Identify every ingredient, estimate quantities when stated, and note preparation steps.
If the recipe name or serving count is mentioned, include those.

Return JSON matching this schema:
${INGREDIENT_SCHEMA}

Transcript:
${text}`;

  let parsed = safeParseLLMResponse(
    (await model.generateContent(prompt)).response.text(),
  );

  if (parsed.ingredients.length === 0) {
    console.log(`[Gemini] Empty ingredients from ${context}, retrying…`);
    const retry = safeParseLLMResponse(
      (await model.generateContent(prompt)).response.text(),
    );
    if (retry.ingredients.length > 0) {
      parsed = retry;
    }
  }

  return parsed;
}

/**
 * Parse a raw ingredient list text (from a recipe page) into structured ingredients.
 */
export async function parseRawIngredientList(
  rawList: string
): Promise<LLMExtractionResponse> {
  const prompt = `Parse this ingredient list into structured JSON.
Each line is one ingredient. Extract the name, quantity, unit, and any preparation notes.

Return JSON matching this schema:
${INGREDIENT_SCHEMA}

Ingredient list:
${rawList}`;

  const result = await model.generateContent(prompt);
  return safeParseLLMResponse(result.response.text());
}

/** Parse Gemini JSON response with fallback for markdown fences and missing fields */
function safeParseLLMResponse(raw: string): LLMExtractionResponse {
  let parsed: LLMExtractionResponse;
  try {
    parsed = JSON.parse(raw) as LLMExtractionResponse;
  } catch {
    // Gemini sometimes wraps JSON in markdown code fences
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    parsed = JSON.parse(cleaned) as LLMExtractionResponse;
  }

  if (!Array.isArray(parsed.ingredients)) {
    parsed.ingredients = [];
  }
  return parsed;
}
