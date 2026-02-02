import type { TierResult, VideoMetadata, Ingredient } from "../types.js";
import { analyzeVideo } from "../services/videoAnalyzer.js";
import { rawToIngredients, mergeIngredients } from "./normalizer.js";

// Gemini 2.5 Flash pricing
const INPUT_COST_PER_TOKEN = 0.3 / 1_000_000; // $0.30 per 1M input tokens
const OUTPUT_COST_PER_TOKEN = 2.5 / 1_000_000; // $2.50 per 1M output tokens

/**
 * Tier 2 — Video Analysis via Gemini 2.5 Flash
 *
 * Passes the YouTube URL directly to Gemini for native video understanding.
 * Gemini processes both visual and audio content to extract ingredients.
 */
export async function runTier2(
  metadata: VideoMetadata,
  previousIngredients: Ingredient[]
): Promise<TierResult> {
  try {
    const { extraction, inputTokens, outputTokens } = await analyzeVideo(
      metadata.video_id,
      previousIngredients
    );

    const ingredients = rawToIngredients(extraction.ingredients);
    const merged = mergeIngredients(previousIngredients, ingredients);

    // Count how many ingredients are new (not from previous tiers)
    const previousNames = new Set(
      previousIngredients.map((i) => i.name.toLowerCase().trim())
    );
    const newCount = ingredients.filter(
      (i) => !previousNames.has(i.name.toLowerCase().trim())
    ).length;

    // Confidence scoring per system_design.md §3.4
    const hasOverlap = ingredients.some((i) =>
      previousNames.has(i.name.toLowerCase().trim())
    );

    let confidence: number;
    if (merged.length >= 5 && hasOverlap) {
      confidence = 0.92;
    } else if (merged.length >= 5) {
      confidence = 0.85;
    } else if (merged.length >= 3) {
      confidence = 0.7;
    } else if (merged.length >= 1) {
      confidence = 0.55;
    } else {
      confidence = 0.2;
    }

    const cost =
      inputTokens * INPUT_COST_PER_TOKEN +
      outputTokens * OUTPUT_COST_PER_TOKEN;

    console.log(
      `[Tier 2] Video analysis: ${ingredients.length} ingredients extracted (${newCount} new), ` +
        `tokens: ${inputTokens} in / ${outputTokens} out, cost: $${cost.toFixed(4)}`
    );

    return {
      tier: 2,
      confidence,
      ingredients: merged,
      servings: extraction.servings,
      source_urls: [],
      cost_usd: cost,
      recipe_name: extraction.recipe_name,
    };
  } catch (error) {
    console.error("[Tier 2] Video analysis failed:", error);
    return {
      tier: 2,
      confidence: 0,
      ingredients: [],
      servings: null,
      source_urls: [],
      cost_usd: 0,
      recipe_name: null,
    };
  }
}
