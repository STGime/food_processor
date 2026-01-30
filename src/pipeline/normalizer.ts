import type { Ingredient, RawLLMIngredient } from "../types.js";

/**
 * Convert raw LLM-extracted ingredients to the full Ingredient type.
 * Assigns canonical names and shopping categories using heuristics.
 *
 * For MVP, this uses a static mapping. Phase 2 can upgrade to an LLM-based
 * normalization call for better accuracy.
 */
export function rawToIngredients(raw: RawLLMIngredient[]): Ingredient[] {
  return raw.map((r) => ({
    name: r.name,
    canonical_name: toCanonicalName(r.name),
    quantity: r.quantity,
    unit: r.unit,
    raw_text: r.raw_text || r.name,
    category: categorize(r.name),
    optional: r.optional ?? false,
    preparation: r.preparation,
  }));
}

/**
 * Build a canonical name from an ingredient name.
 * "fresh mozzarella cheese" → "cheese_mozzarella_fresh"
 */
function toCanonicalName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

// Checked in order — more specific categories first to avoid false matches.
// e.g. "red pepper flakes" should match spices (not produce's "pepper").
const CATEGORY_MAP: [string, string[]][] = [
  ["spices", [
    "salt", "pepper", "cumin", "paprika", "turmeric", "cinnamon",
    "nutmeg", "oregano", "bay leaf", "chili powder", "cayenne",
    "coriander", "cardamom", "clove", "star anise", "fennel seed",
    "mustard seed", "saffron", "za'atar", "garam masala", "curry",
    "red pepper flake", "pepper flake", "seasoning", "spice",
    "garlic powder", "onion powder", "smoked paprika",
  ]],
  ["pantry", [
    "olive oil", "vegetable oil", "sesame oil", "canola oil", "coconut oil",
    "oil", "vinegar", "soy sauce", "fish sauce", "worcestershire",
    "hot sauce", "ketchup", "mustard", "mayonnaise", "tahini",
    "peanut butter", "sriracha", "miso", "gochujang",
  ]],
  ["grains", [
    "rice", "pasta", "linguine", "spaghetti", "penne", "fettuccine",
    "macaroni", "rigatoni", "fusilli", "orzo", "noodle", "ramen",
    "udon", "soba", "bread", "tortilla", "oat", "quinoa",
    "couscous", "barley", "farro", "polenta", "panko", "breadcrumb",
  ]],
  ["canned", [
    "tomato sauce", "tomato paste", "diced tomato", "crushed tomato",
    "coconut milk", "broth", "stock", "beans", "chickpea", "lentil",
  ]],
  ["dairy", [
    "milk", "cream", "butter", "cheese", "mozzarella", "parmesan",
    "cheddar", "yogurt", "sour cream", "cream cheese", "ricotta",
    "mascarpone", "whipping cream", "half and half", "ghee",
    "pecorino",
  ]],
  ["meat", [
    "chicken", "beef", "pork", "lamb", "turkey", "bacon", "sausage",
    "ground beef", "ground turkey", "steak", "ribs", "ham", "prosciutto",
    "pancetta", "duck", "guanciale",
  ]],
  ["seafood", [
    "salmon", "shrimp", "tuna", "cod", "tilapia", "crab", "lobster",
    "scallop", "mussel", "clam", "anchovy", "sardine", "squid",
  ]],
  ["baking", [
    "flour", "sugar", "baking powder", "baking soda", "yeast", "cornstarch",
    "cocoa", "chocolate", "vanilla", "brown sugar", "powdered sugar",
    "confectioner", "molasses", "honey", "maple syrup", "corn syrup",
  ]],
  ["eggs", ["egg"]],
  ["nuts", [
    "almond", "walnut", "pecan", "cashew", "peanut", "pistachio",
    "pine nut", "sesame seed", "sunflower seed", "chia seed", "flax",
  ]],
  ["produce", [
    "onion", "garlic", "tomato", "potato", "carrot", "celery", "pepper",
    "lettuce", "spinach", "kale", "broccoli", "cauliflower", "zucchini",
    "cucumber", "mushroom", "avocado", "lemon", "lime", "ginger", "cilantro",
    "parsley", "basil", "thyme", "rosemary", "dill", "mint", "scallion",
    "shallot", "leek", "chili", "jalapeño", "serrano", "cabbage", "corn",
    "peas", "green bean", "asparagus", "eggplant", "beet", "radish",
    "apple", "banana", "berry", "blueberry", "strawberry", "raspberry",
    "mango", "pineapple", "peach", "pear", "orange", "grape",
  ]],
];

function categorize(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of CATEGORY_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return "other";
}

/**
 * Group ingredients into a shopping list by category.
 */
export function buildShoppingList(
  ingredients: Ingredient[]
): Record<string, string[]> {
  const list: Record<string, string[]> = {};
  for (const ing of ingredients) {
    const cat = ing.category;
    if (!list[cat]) list[cat] = [];
    if (!list[cat].includes(ing.name)) {
      list[cat].push(ing.name);
    }
  }
  return list;
}
