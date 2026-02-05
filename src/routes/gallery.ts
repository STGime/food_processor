import { Router, type Request } from "express";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config.js";
import {
  createRecipeCard,
  getCardsByDevice,
  getCardById,
  updateCardImage,
  deleteCard,
} from "../gallery/store.js";
import { generateRecipeImage, buildImagePrompt } from "../services/fireworks.js";
import { uploadImage, deleteImage } from "../services/gcsStorage.js";
import type { Ingredient, Instruction, RecipeCard, GatedRecipeCard } from "../types.js";

export const router = Router();

/**
 * POST /api/gallery
 * Save a recipe card. Generates an image inline by default.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      recipe_name,
      video_id,
      video_title,
      channel,
      servings,
      ingredients,
      instructions,
      shopping_list,
      generate_image = true,
    } = req.body as {
      recipe_name?: string;
      video_id?: string;
      video_title?: string;
      channel?: string;
      servings?: number;
      ingredients?: Ingredient[];
      instructions?: Instruction[];
      shopping_list?: Record<string, string[]>;
      generate_image?: boolean;
    };

    if (!recipe_name || typeof recipe_name !== "string") {
      res.status(400).json({ error: "Missing required field: recipe_name" });
      return;
    }
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: "Missing required field: ingredients (non-empty array)" });
      return;
    }

    const deviceId = req.device!.device_id;

    let imageData: { image_url: string; image_gcs_path: string; image_prompt: string } | undefined;

    // Create card first (to get card_id for GCS path)
    const card = await createRecipeCard(deviceId, {
      recipe_name,
      video_id,
      video_title,
      channel,
      servings,
      ingredients,
      instructions: instructions ?? [],
      shopping_list,
    });

    if (generate_image) {
      try {
        const prompt = buildImagePrompt(recipe_name, ingredients);
        const buf = await generateRecipeImage(recipe_name, ingredients);
        const { publicUrl, gcsPath } = await uploadImage(buf, card.card_id);
        imageData = { image_url: publicUrl, image_gcs_path: gcsPath, image_prompt: prompt };
        await updateCardImage(card.card_id, imageData);
        card.image_url = publicUrl;
        card.image_gcs_path = gcsPath;
        card.image_prompt = prompt;
        card.image_generated_at = new Date();
      } catch (imgErr) {
        console.error(`[Gallery] Image generation failed for card ${card.card_id}:`, imgErr);
        // Card is saved without image — caller can retry via POST /:card_id/image
      }
    }

    res.status(201).json(gateCard(card, req.device!.is_premium));
  } catch (err) {
    console.error("[Gallery] POST / error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/gallery
 * List the authenticated device's recipe cards (paginated).
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const deviceId = req.device!.device_id;

    const cards = await getCardsByDevice(deviceId, limit, offset);
    const gated = cards.map((c) => gateCard(c, req.device!.is_premium));

    res.json({ cards: gated, limit, offset });
  } catch (err) {
    console.error("[Gallery] GET / error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /api/gallery/:card_id
 * Get a single recipe card (must belong to the authenticated device).
 */
router.get("/:card_id", requireAuth, async (req: Request<{ card_id: string }>, res) => {
  try {
    const card = await getCardById(req.params.card_id);

    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    if (card.device_id !== req.device!.device_id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json(gateCard(card, req.device!.is_premium));
  } catch (err) {
    console.error("[Gallery] GET /:card_id error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * DELETE /api/gallery/:card_id
 * Delete a recipe card and its GCS image.
 */
router.delete("/:card_id", requireAuth, async (req: Request<{ card_id: string }>, res) => {
  try {
    const card = await getCardById(req.params.card_id);

    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    if (card.device_id !== req.device!.device_id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (card.image_gcs_path) {
      try {
        await deleteImage(card.image_gcs_path);
      } catch (gcsErr) {
        console.error(`[Gallery] GCS delete failed for ${card.image_gcs_path}:`, gcsErr);
      }
    }

    await deleteCard(card.card_id);
    res.json({ deleted: true, card_id: card.card_id });
  } catch (err) {
    console.error("[Gallery] DELETE /:card_id error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/gallery/:card_id/image
 * Generate (or regenerate) an image for an existing recipe card.
 */
router.post("/:card_id/image", requireAuth, async (req: Request<{ card_id: string }>, res) => {
  try {
    const card = await getCardById(req.params.card_id);

    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    if (card.device_id !== req.device!.device_id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Delete old image if exists
    if (card.image_gcs_path) {
      try {
        await deleteImage(card.image_gcs_path);
      } catch (gcsErr) {
        console.error(`[Gallery] GCS delete failed for old image ${card.image_gcs_path}:`, gcsErr);
      }
    }

    const prompt = buildImagePrompt(card.recipe_name, card.ingredients);
    const buf = await generateRecipeImage(card.recipe_name, card.ingredients);
    const { publicUrl, gcsPath } = await uploadImage(buf, card.card_id);

    await updateCardImage(card.card_id, {
      image_url: publicUrl,
      image_gcs_path: gcsPath,
      image_prompt: prompt,
    });

    card.image_url = publicUrl;
    card.image_gcs_path = gcsPath;
    card.image_prompt = prompt;
    card.image_generated_at = new Date();

    res.json(gateCard(card, req.device!.is_premium));
  } catch (err) {
    console.error("[Gallery] POST /:card_id/image error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Gate a recipe card for free vs premium users.
 * Image is always visible. Ingredients and instructions are truncated for free users.
 */
function gateCard(
  card: RecipeCard,
  isPremium: boolean,
): RecipeCard | GatedRecipeCard {
  const totalIngredients = card.ingredients.length;
  const totalInstructions = card.instructions.length;
  const ingredientLimit = config.freeIngredientLimit;
  const instructionLimit = config.freeInstructionLimit;

  const needsTruncation = !isPremium &&
    (totalIngredients > ingredientLimit || totalInstructions > instructionLimit);

  if (!needsTruncation) {
    return {
      ...card,
      is_truncated: false,
      total_ingredient_count: totalIngredients,
      shown_ingredient_count: totalIngredients,
      total_instruction_count: totalInstructions,
      shown_instruction_count: totalInstructions,
    } satisfies GatedRecipeCard;
  }

  const truncatedIngredients = card.ingredients.slice(0, ingredientLimit);
  const truncatedInstructions = card.instructions.slice(0, instructionLimit);
  const shoppingList = rebuildShoppingList(truncatedIngredients);

  const parts: string[] = [];
  if (totalIngredients > ingredientLimit) {
    parts.push(`${totalIngredients} ingredients`);
  }
  if (totalInstructions > instructionLimit) {
    parts.push(`${totalInstructions} steps`);
  }

  return {
    ...card,
    ingredients: truncatedIngredients,
    instructions: truncatedInstructions,
    shopping_list: shoppingList,
    is_truncated: true,
    total_ingredient_count: totalIngredients,
    shown_ingredient_count: Math.min(totalIngredients, ingredientLimit),
    total_instruction_count: totalInstructions,
    shown_instruction_count: Math.min(totalInstructions, instructionLimit),
    upgrade_message: `This recipe has ${parts.join(" and ")}. Upgrade to Premium to see all of them.`,
  } satisfies GatedRecipeCard;
}

function rebuildShoppingList(ingredients: Ingredient[]): Record<string, string[]> {
  const list: Record<string, string[]> = {};
  for (const ing of ingredients) {
    const category = ing.category || "Other";
    if (!list[category]) list[category] = [];
    list[category].push(ing.canonical_name || ing.name);
  }
  return list;
}
