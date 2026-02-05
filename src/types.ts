export interface Ingredient {
  name: string;
  canonical_name: string;
  quantity: number | null;
  unit: string | null;
  raw_text: string;
  category: string;
  optional: boolean;
  preparation: string | null;
}

export interface Instruction {
  step_number: number;
  text: string;
  duration?: string;
  temperature?: string;
  technique?: string;
}

export interface ExtractionResult {
  video_id: string;
  video_title: string;
  recipe_name: string | null;
  channel: string;
  extraction_tier: number;
  confidence: number;
  servings: number | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  shopping_list: Record<string, string[]>;
  source_urls: string[];
  processing_metadata: {
    tiers_attempted: number[];
    total_cost_usd: number;
    processing_time_ms: number;
  };
}

export interface TierResult {
  tier: number;
  confidence: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  servings: number | null;
  source_urls: string[];
  cost_usd: number;
  recipe_name: string | null;
}

export interface VideoMetadata {
  video_id: string;
  title: string;
  description: string;
  channel: string;
  tags: string[];
}

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  youtube_url: string;
  video_id: string;
  device_id: string;
  current_tier: number;
  progress: number;
  status_message: string | null;
  result: ExtractionResult | null;
  error: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RawLLMIngredient {
  name: string;
  quantity: number | null;
  unit: string | null;
  raw_text: string;
  optional: boolean;
  preparation: string | null;
}

export interface RawLLMInstruction {
  step_number: number;
  text: string;
  duration?: string;
  temperature?: string;
  technique?: string;
}

export interface LLMExtractionResponse {
  recipe_name: string | null;
  servings: number | null;
  ingredients: RawLLMIngredient[];
  instructions: RawLLMInstruction[];
}

export interface Device {
  device_id: string;
  api_key: string;
  is_premium: boolean;
  subscription_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GatedExtractionResult extends ExtractionResult {
  is_truncated: boolean;
  total_ingredient_count: number;
  shown_ingredient_count: number;
  total_instruction_count: number;
  shown_instruction_count: number;
  upgrade_message?: string;
}

export interface RecipeCard {
  card_id: string;
  device_id: string;
  recipe_name: string;
  video_id: string | null;
  video_title: string | null;
  channel: string | null;
  servings: number | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  shopping_list: Record<string, string[]> | null;
  image_url: string | null;
  image_gcs_path: string | null;
  image_prompt: string | null;
  image_generated_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface GatedRecipeCard extends RecipeCard {
  is_truncated: boolean;
  total_ingredient_count: number;
  shown_ingredient_count: number;
  total_instruction_count: number;
  shown_instruction_count: number;
  upgrade_message?: string;
}

