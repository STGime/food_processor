import type { ExtractionResult, VideoMetadata, Job } from "../types.js";
import { fetchVideoMetadata, extractVideoId } from "../services/youtube.js";
import { runTier0 } from "./tier0.js";
import { runTier1 } from "./tier1.js";
import { runTier2 } from "./tier2.js";
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

  // --- Tier 2: Video Analysis via Gemini 2.5 Flash ---
  job.current_tier = 2;
  job.progress = 0.7;

  // Collect best ingredients so far from Tiers 0+1
  const bestPrior =
    tier1.ingredients.length >= tier0.ingredients.length
      ? tier1.ingredients
      : tier0.ingredients;

  const tier2 = await runTier2(metadata, bestPrior);
  tiersAttempted.push(2);
  totalCost += tier2.cost_usd;

  console.log(
    `[Tier 2] confidence=${tier2.confidence.toFixed(2)}, ingredients=${tier2.ingredients.length}`
  );

  if (tier2.confidence >= config.confidenceThreshold) {
    job.progress = 1;
    const sourceUrls = [
      ...tier0.source_urls,
      ...tier1.source_urls,
      ...tier2.source_urls,
    ];
    return buildResult(
      metadata,
      { ...tier2, source_urls: sourceUrls },
      tiersAttempted,
      totalCost,
      startTime
    );
  }

  // --- Fallback: return best result across all tiers ---
  job.progress = 1;
  console.log(
    `[Pipeline] All tiers insufficient (best confidence: ${Math.max(tier0.confidence, tier1.confidence, tier2.confidence).toFixed(2)}).`
  );

  const allTiers = [tier0, tier1, tier2];
  const best = allTiers.reduce((a, b) =>
    b.confidence > a.confidence ? b : a
  );
  const sourceUrls = [
    ...tier0.source_urls,
    ...tier1.source_urls,
    ...tier2.source_urls,
  ];
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
    video_title: metadata.title,
    recipe_name: tier.recipe_name,
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
