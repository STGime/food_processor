import type { TierResult, VideoMetadata, RawLLMIngredient } from "../types.js";
import { extractUrls } from "../services/youtube.js";
import { extractIngredients, parseRawIngredientList } from "../services/gemini.js";
import {
  scrapeRecipePage,
  isLikelyRecipeUrl,
} from "../services/recipeScraper.js";
import { rawToIngredients } from "./normalizer.js";

/**
 * Tier 0 — Metadata Scrape
 *
 * 1. Parse video description for ingredient lists / recipe text
 * 2. Extract URLs from description, scrape recipe pages (JSON-LD)
 * 3. If recipe data found, normalize via LLM
 */
export async function runTier0(metadata: VideoMetadata): Promise<TierResult> {
  const sourceUrls: string[] = [];
  let allRaw: RawLLMIngredient[] = [];
  let recipeName: string | null = null;
  let servings: number | null = null;
  let cost = 0;

  // --- Step 1: Try scraping linked recipe pages ---
  const urls = extractUrls(metadata.description);
  const recipeUrls = urls.filter(isLikelyRecipeUrl).slice(0, 3); // cap at 3

  for (const url of recipeUrls) {
    const recipe = await scrapeRecipePage(url);
    if (recipe && recipe.ingredients.length > 0) {
      sourceUrls.push(recipe.source_url);
      recipeName = recipe.name ?? recipeName;
      servings = recipe.servings ?? servings;

      // Parse the scraped ingredient strings via LLM
      const parsed = await parseRawIngredientList(
        recipe.ingredients.join("\n")
      );
      cost += 0.0001; // ~250 input + 200 output tokens on Gemini 2.0 Flash
      allRaw.push(...parsed.ingredients);
      recipeName = parsed.recipe_name ?? recipeName;
      servings = parsed.servings ?? servings;
    }
  }

  // --- Step 2: Parse description directly if no recipe page worked ---
  if (allRaw.length === 0 && hasIngredientSignals(metadata.description)) {
    const extracted = await extractIngredients(
      metadata.description,
      "description"
    );
    cost += 0.0001;
    allRaw = extracted.ingredients;
    recipeName = extracted.recipe_name ?? recipeName;
    servings = extracted.servings ?? servings;
  }

  // --- Step 3: Score confidence ---
  let confidence: number;
  if (sourceUrls.length > 0 && allRaw.length >= 3) {
    // Found a recipe page with ingredients — high confidence
    confidence = 0.95;
  } else if (allRaw.length >= 5) {
    // Description had a solid ingredient list
    confidence = 0.85;
  } else if (allRaw.length >= 1) {
    // Partial data
    confidence = 0.4;
  } else {
    confidence = 0;
  }

  return {
    tier: 0,
    confidence,
    ingredients: rawToIngredients(allRaw),
    servings,
    source_urls: sourceUrls,
    cost_usd: cost,
    recipe_name: recipeName,
  };
}

/**
 * Quick check if description text likely contains ingredient info.
 * Avoids sending random descriptions to the LLM.
 */
function hasIngredientSignals(text: string): boolean {
  const lower = text.toLowerCase();
  const signals = [
    "ingredient",
    "recipe",
    "you will need",
    "you'll need",
    "what you need",
    "shopping list",
    "cups ",
    "tablespoon",
    "teaspoon",
    " tsp",
    " tbsp",
    " oz ",
    "grams",
    " g ",
    "cloves",
    "pinch of",
  ];
  return signals.some((s) => lower.includes(s));
}
