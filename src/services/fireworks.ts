import { config } from "../config.js";
import type { Ingredient } from "../types.js";

const FIREWORKS_URL =
  "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-schnell-fp8/text_to_image";

export async function generateRecipeImage(
  recipeName: string,
  ingredients: Ingredient[],
): Promise<Buffer> {
  const topIngredients = ingredients
    .slice(0, 5)
    .map((i) => i.name)
    .join(", ");

  const prompt = `Professional food photography of ${recipeName}, featuring ${topIngredients}, appetizing, well-lit, overhead angle`;

  const response = await fetch(FIREWORKS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "image/jpeg",
      Authorization: `Bearer ${config.fireworksApiKey}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Fireworks API error (${response.status}): ${text}`);
  }

  const arrayBuf = await response.arrayBuffer();
  return Buffer.from(arrayBuf);
}

export function buildImagePrompt(
  recipeName: string,
  ingredients: Ingredient[],
): string {
  const topIngredients = ingredients
    .slice(0, 5)
    .map((i) => i.name)
    .join(", ");
  return `Professional food photography of ${recipeName}, featuring ${topIngredients}, appetizing, well-lit, overhead angle`;
}
