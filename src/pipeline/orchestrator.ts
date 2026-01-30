import type { ExtractionResult, VideoMetadata, Job } from "../types.js";
import { fetchVideoMetadata, extractVideoId } from "../services/youtube.js";
import { runTier0 } from "./tier0.js";
import { runTier1 } from "./tier1.js";
import { buildShoppingList } from "./normalizer.js";
import { config } from "../config.js";

/**
 * Run the tiered extraction pipeline for a YouTube video.
 * Updates the job in-place as it progresses through tiers.
 */
export async function runPipeline(job: Job): Promise<ExtractionResult> {
  const startTime = Date.now();
  const tiersAttempted: number[] = [];
  let totalCost = 0;

  // --- Fetch metadata ---
  job.current_tier = 0;
  job.progress = 0.1;

  const metadata: VideoMetadata = await fetchVideoMetadata(job.video_id);

  // --- Tier 0: Metadata scrape ---
  job.progress = 0.2;
  const tier0 = await runTier0(metadata);
  tiersAttempted.push(0);
  totalCost += tier0.cost_usd;

  console.log(
    `[Tier 0] confidence=${tier0.confidence.toFixed(2)}, ingredients=${tier0.ingredients.length}`
  );

  if (tier0.confidence >= config.confidenceThreshold) {
    job.progress = 1;
    return buildResult(metadata, tier0, tiersAttempted, totalCost, startTime);
  }

  // --- Tier 1: Transcript + LLM ---
  job.current_tier = 1;
  job.progress = 0.5;
  const tier1 = await runTier1(metadata, tier0.ingredients);
  tiersAttempted.push(1);
  totalCost += tier1.cost_usd;

  console.log(
    `[Tier 1] confidence=${tier1.confidence.toFixed(2)}, ingredients=${tier1.ingredients.length}`
  );

  if (tier1.confidence >= config.confidenceThreshold) {
    job.progress = 1;
    // Merge source URLs from both tiers
    const sourceUrls = [...tier0.source_urls, ...tier1.source_urls];
    return buildResult(
      metadata,
      { ...tier1, source_urls: sourceUrls },
      tiersAttempted,
      totalCost,
      startTime
    );
  }

  // --- Tier 2/3 not yet implemented — return best available result ---
  job.progress = 1;
  console.log(
    `[Pipeline] Tiers 0+1 insufficient (best confidence: ${Math.max(tier0.confidence, tier1.confidence).toFixed(2)}). Tier 2+ not yet implemented.`
  );

  // Return whichever tier had higher confidence
  const best = tier1.confidence >= tier0.confidence ? tier1 : tier0;
  const sourceUrls = [...tier0.source_urls, ...tier1.source_urls];
  return buildResult(
    metadata,
    { ...best, source_urls: sourceUrls },
    tiersAttempted,
    totalCost,
    startTime
  );
}

function buildResult(
  metadata: VideoMetadata,
  tier: {
    tier: number;
    confidence: number;
    ingredients: ExtractionResult["ingredients"];
    servings: number | null;
    source_urls: string[];
    recipe_name: string | null;
  },
  tiersAttempted: number[],
  totalCost: number,
  startTime: number
): ExtractionResult {
  return {
    video_id: metadata.video_id,
    video_title: tier.recipe_name || metadata.title,
    channel: metadata.channel,
    extraction_tier: tier.tier,
    confidence: tier.confidence,
    servings: tier.servings,
    ingredients: tier.ingredients,
    shopping_list: buildShoppingList(tier.ingredients),
    source_urls: tier.source_urls,
    processing_metadata: {
      tiers_attempted: tiersAttempted,
      total_cost_usd: totalCost,
      processing_time_ms: Date.now() - startTime,
    },
  };
}

/**
 * Validate a YouTube URL and extract the video ID.
 */
export function validateUrl(url: string): string {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${url}`);
  }
  return videoId;
}
