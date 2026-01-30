import * as cheerio from "cheerio";

export interface ScrapedRecipe {
  name: string | null;
  ingredients: string[];
  servings: number | null;
  source_url: string;
}

/**
 * Fetch a URL and attempt to extract recipe data.
 * Tries JSON-LD (schema.org/Recipe) first, then falls back to HTML heuristics.
 */
export async function scrapeRecipePage(
  url: string
): Promise<ScrapedRecipe | null> {
  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FoodProcessor/0.1; recipe extraction)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const $ = cheerio.load(html);

  // Try JSON-LD first (most recipe blogs use schema.org/Recipe)
  const jsonLd = extractJsonLdRecipe($);
  if (jsonLd) return { ...jsonLd, source_url: url };

  // Fallback: look for common recipe HTML patterns
  const heuristic = extractHeuristicRecipe($);
  if (heuristic) return { ...heuristic, source_url: url };

  return null;
}

interface PartialRecipe {
  name: string | null;
  ingredients: string[];
  servings: number | null;
}

function extractJsonLdRecipe($: cheerio.CheerioAPI): PartialRecipe | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const raw = $(scripts[i]).html();
      if (!raw) continue;

      const data = JSON.parse(raw);
      const recipes = findRecipeObjects(data);

      if (recipes.length > 0) {
        const recipe = recipes[0];
        return {
          name: recipe.name || null,
          ingredients: normalizeIngredientList(
            recipe.recipeIngredient || recipe.ingredients || []
          ),
          servings: parseServings(recipe.recipeYield),
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findRecipeObjects(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.flatMap(findRecipeObjects);
  if (typeof data !== "object") return [];

  if (
    data["@type"] === "Recipe" ||
    (Array.isArray(data["@type"]) && data["@type"].includes("Recipe"))
  ) {
    return [data];
  }

  // Check @graph (common in WordPress recipe plugins)
  if (data["@graph"]) return findRecipeObjects(data["@graph"]);

  return [];
}

function extractHeuristicRecipe(
  $: cheerio.CheerioAPI
): PartialRecipe | null {
  // Look for elements near "ingredient" headings
  const ingredientHeadings = $(
    'h2, h3, h4, [class*="ingredient" i], [id*="ingredient" i]'
  ).filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes("ingredient");
  });

  if (ingredientHeadings.length === 0) return null;

  const heading = ingredientHeadings.first();
  // Get the next list after the heading
  const list = heading.nextAll("ul, ol").first();
  if (list.length === 0) return null;

  const ingredients: string[] = [];
  list.find("li").each((_, el) => {
    const text = $(el).text().trim();
    if (text) ingredients.push(text);
  });

  if (ingredients.length === 0) return null;

  // Try to find the recipe title
  const title = $("h1").first().text().trim() || null;

  return {
    name: title,
    ingredients,
    servings: null,
  };
}

function normalizeIngredientList(raw: unknown[]): string[] {
  return raw
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "object" && item !== null && "text" in item) {
        return String((item as { text: unknown }).text).trim();
      }
      return null;
    })
    .filter((s): s is string => !!s && s.length > 0);
}

function parseServings(yield_: unknown): number | null {
  if (typeof yield_ === "number") return yield_;
  if (typeof yield_ === "string") {
    const match = yield_.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  if (Array.isArray(yield_) && yield_.length > 0) {
    return parseServings(yield_[0]);
  }
  return null;
}

/**
 * Check if a URL is likely a recipe page (heuristic filter before scraping).
 */
export function isLikelyRecipeUrl(url: string): boolean {
  const lower = url.toLowerCase();
  // Skip social media, video platforms, and non-recipe URLs
  const skipDomains = [
    "youtube.com",
    "youtu.be",
    "instagram.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "tiktok.com",
    "amazon.com",
    "amzn.to",
    "bit.ly",
  ];
  if (skipDomains.some((d) => lower.includes(d))) return false;

  // Prefer URLs with recipe-related paths
  const recipeSignals = ["recipe", "cook", "food", "kitchen", "bake", "meal"];
  if (recipeSignals.some((s) => lower.includes(s))) return true;

  // Accept any non-skipped URL (blogs, personal sites, etc.)
  return true;
}
