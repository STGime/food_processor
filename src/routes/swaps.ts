import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getIngredientSwaps } from "../services/ingredientSwaps.js";
import type { SwapRequest, SwapResponse } from "../types.js";

export const router = Router();

/**
 * POST /api/swaps
 * Get AI-powered ingredient substitution suggestions.
 */
router.post("/swaps", requireAuth, async (req, res) => {
  const body = req.body as Partial<SwapRequest>;

  // Validate required field
  if (!body.ingredient || typeof body.ingredient !== "string" || body.ingredient.trim() === "") {
    res.status(400).json({ error: "Missing required field: ingredient" });
    return;
  }

  // Validate optional arrays
  if (body.dietary_filters !== undefined) {
    if (!Array.isArray(body.dietary_filters) || !body.dietary_filters.every((f) => typeof f === "string")) {
      res.status(400).json({ error: "dietary_filters must be an array of strings" });
      return;
    }
  }

  if (body.available_ingredients !== undefined) {
    if (!Array.isArray(body.available_ingredients) || !body.available_ingredients.every((i) => typeof i === "string")) {
      res.status(400).json({ error: "available_ingredients must be an array of strings" });
      return;
    }
  }

  const request: SwapRequest = {
    ingredient: body.ingredient.trim(),
    quantity: typeof body.quantity === "number" ? body.quantity : undefined,
    unit: typeof body.unit === "string" ? body.unit : undefined,
    recipe_context: typeof body.recipe_context === "string" ? body.recipe_context : undefined,
    dietary_filters: body.dietary_filters,
    available_ingredients: body.available_ingredients,
  };

  try {
    const suggestions = await getIngredientSwaps(request);

    const response: SwapResponse = {
      original_ingredient: request.ingredient,
      suggestions,
    };

    res.json(response);
  } catch (e) {
    console.error("[Swaps] Error generating suggestions:", e);
    res.status(500).json({
      error: "Failed to generate swap suggestions. Please try again.",
    });
  }
});
