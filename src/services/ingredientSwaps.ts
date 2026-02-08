import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
import type { SwapRequest, SwapSuggestion } from "../types.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
  },
});

const SWAP_RESPONSE_SCHEMA = `{
  "suggestions": [
    {
      "substitute_name": "string",
      "quantity_ratio": "number (1.0 = same amount, 0.5 = half)",
      "quantity_note": "string | null",
      "confidence": "number 0-1",
      "dietary_tags": ["string"],
      "notes": "string | null"
    }
  ]
}`;

function buildSwapPrompt(request: SwapRequest): string {
  const parts: string[] = [
    `You are a culinary expert specializing in ingredient substitutions.`,
    `Find 3-5 substitutes for: "${request.ingredient}"`,
  ];

  if (request.quantity && request.unit) {
    parts.push(`Original quantity: ${request.quantity} ${request.unit}`);
  }

  if (request.recipe_context) {
    parts.push(`Recipe context: ${request.recipe_context}`);
  }

  if (request.dietary_filters && request.dietary_filters.length > 0) {
    parts.push(
      `IMPORTANT: Only suggest substitutes that are compatible with these dietary restrictions: ${request.dietary_filters.join(", ")}`
    );
  }

  if (request.available_ingredients && request.available_ingredients.length > 0) {
    parts.push(
      `Preferred ingredients (suggest from this list first if suitable): ${request.available_ingredients.join(", ")}`
    );
  }

  parts.push(`
Guidelines:
- Rank suggestions by confidence (best match first)
- Include quantity_ratio relative to original (1.0 = same amount)
- Add quantity_note for any special instructions
- Tag each substitute with relevant dietary attributes (vegan, vegetarian, dairy-free, gluten-free, nut-free, etc.)
- Add notes about flavor/texture differences or best use cases
- Consider the recipe context when ranking suggestions

Return JSON matching this schema:
${SWAP_RESPONSE_SCHEMA}`);

  return parts.join("\n\n");
}

interface GeminiSwapResponse {
  suggestions: SwapSuggestion[];
}

function safeParseSwapResponse(raw: string): SwapSuggestion[] {
  let parsed: GeminiSwapResponse;
  try {
    parsed = JSON.parse(raw) as GeminiSwapResponse;
  } catch {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    parsed = JSON.parse(cleaned) as GeminiSwapResponse;
  }

  if (!Array.isArray(parsed.suggestions)) {
    return [];
  }

  return parsed.suggestions.map((s) => ({
    substitute_name: s.substitute_name || "",
    quantity_ratio: typeof s.quantity_ratio === "number" ? s.quantity_ratio : 1.0,
    quantity_note: s.quantity_note || null,
    confidence: typeof s.confidence === "number" ? Math.min(1, Math.max(0, s.confidence)) : 0.5,
    dietary_tags: Array.isArray(s.dietary_tags) ? s.dietary_tags : [],
    notes: s.notes || null,
  }));
}

export async function getIngredientSwaps(
  request: SwapRequest
): Promise<SwapSuggestion[]> {
  const prompt = buildSwapPrompt(request);
  const result = await model.generateContent(prompt);
  const suggestions = safeParseSwapResponse(result.response.text());

  // Sort by confidence descending
  suggestions.sort((a, b) => b.confidence - a.confidence);

  return suggestions;
}
