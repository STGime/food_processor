import { pool } from "../db.js";
import type { Ingredient, Instruction, RecipeCard } from "../types.js";

interface CreateCardData {
  recipe_name: string;
  video_id?: string;
  video_title?: string;
  channel?: string;
  servings?: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  shopping_list?: Record<string, string[]>;
}

interface ImageData {
  image_url: string;
  image_gcs_path: string;
  image_prompt: string;
}

export async function createRecipeCard(
  deviceId: string,
  data: CreateCardData,
  imageData?: ImageData,
): Promise<RecipeCard> {
  const { rows } = await pool.query<RecipeCard>(
    `INSERT INTO recipe_cards
       (device_id, recipe_name, video_id, video_title, channel, servings,
        ingredients, instructions, shopping_list, image_url, image_gcs_path, image_prompt, image_generated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      deviceId,
      data.recipe_name,
      data.video_id ?? null,
      data.video_title ?? null,
      data.channel ?? null,
      data.servings ?? null,
      JSON.stringify(data.ingredients),
      JSON.stringify(data.instructions),
      data.shopping_list ? JSON.stringify(data.shopping_list) : null,
      imageData?.image_url ?? null,
      imageData?.image_gcs_path ?? null,
      imageData?.image_prompt ?? null,
      imageData ? new Date() : null,
    ],
  );

  return parseCard(rows[0]);
}

export async function getCardsByDevice(
  deviceId: string,
  limit: number,
  offset: number,
): Promise<RecipeCard[]> {
  const { rows } = await pool.query<RecipeCard>(
    `SELECT * FROM recipe_cards
     WHERE device_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [deviceId, limit, offset],
  );

  return rows.map(parseCard);
}

export async function getCardById(cardId: string): Promise<RecipeCard | undefined> {
  const { rows } = await pool.query<RecipeCard>(
    `SELECT * FROM recipe_cards WHERE card_id = $1`,
    [cardId],
  );

  return rows[0] ? parseCard(rows[0]) : undefined;
}

export async function updateCardImage(cardId: string, imageData: ImageData): Promise<void> {
  await pool.query(
    `UPDATE recipe_cards
     SET image_url = $1, image_gcs_path = $2, image_prompt = $3,
         image_generated_at = now(), updated_at = now()
     WHERE card_id = $4`,
    [imageData.image_url, imageData.image_gcs_path, imageData.image_prompt, cardId],
  );
}

export async function deleteCard(cardId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `DELETE FROM recipe_cards WHERE card_id = $1`,
    [cardId],
  );
  return (rowCount ?? 0) > 0;
}

/** Parse JSONB columns from raw row into typed objects */
function parseCard(row: RecipeCard): RecipeCard {
  return {
    ...row,
    ingredients:
      typeof row.ingredients === "string"
        ? JSON.parse(row.ingredients)
        : row.ingredients,
    instructions:
      typeof row.instructions === "string"
        ? JSON.parse(row.instructions)
        : row.instructions ?? [],
    shopping_list:
      row.shopping_list && typeof row.shopping_list === "string"
        ? JSON.parse(row.shopping_list)
        : row.shopping_list,
  };
}
