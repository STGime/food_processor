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

export interface ExtractionResult {
  video_id: string;
  video_title: string;
  channel: string;
  extraction_tier: number;
  confidence: number;
  servings: number | null;
  ingredients: Ingredient[];
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
  current_tier: number;
  progress: number;
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

export interface LLMExtractionResponse {
  recipe_name: string | null;
  servings: number | null;
  ingredients: RawLLMIngredient[];
}
