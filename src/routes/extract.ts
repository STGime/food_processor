import { Router, type Request } from "express";
import { createJob, getJob, setJobResult, setJobError, setJobStatus } from "../jobs/store.js";
import { runPipeline, validateUrl } from "../pipeline/orchestrator.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config.js";
import type { ExtractionResult, GatedExtractionResult, Ingredient } from "../types.js";

export const router = Router();

/**
 * POST /api/extract
 * Submit a YouTube URL for ingredient extraction.
 */
router.post("/extract", requireAuth, (req, res) => {
  const { youtube_url } = req.body as { youtube_url?: string };

  if (!youtube_url || typeof youtube_url !== "string") {
    res.status(400).json({ error: "Missing required field: youtube_url" });
    return;
  }

  let videoId: string;
  try {
    videoId = validateUrl(youtube_url);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
    return;
  }

  const job = createJob(youtube_url, videoId);

  // Process async — don't await
  processJob(job.id);

  res.status(202).json({
    job_id: job.id,
    status: "queued",
  });
});

/**
 * GET /api/status/:job_id
 * Check the status of an extraction job.
 */
router.get("/status/:job_id", requireAuth, (req: Request<{ job_id: string }>, res) => {
  const job = getJob(req.params.job_id);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({
    job_id: job.id,
    status: job.status,
    current_tier: job.current_tier,
    progress: job.progress,
    ...(job.error ? { error: job.error } : {}),
  });
});

/**
 * GET /api/results/:job_id
 * Get the extraction results for a completed job.
 * Free users get truncated ingredients; premium users get full results.
 */
router.get("/results/:job_id", requireAuth, (req: Request<{ job_id: string }>, res) => {
  const job = getJob(req.params.job_id);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.status === "queued" || job.status === "processing") {
    res.status(202).json({
      job_id: job.id,
      status: job.status,
      message: "Job is still processing. Poll /api/status/:job_id for updates.",
    });
    return;
  }

  if (job.status === "failed") {
    res.status(500).json({
      job_id: job.id,
      status: "failed",
      error: job.error,
    });
    return;
  }

  const result = job.result!;
  res.json(gateResult(result, req.device!.is_premium));
});

function gateResult(
  result: ExtractionResult,
  isPremium: boolean,
): ExtractionResult | GatedExtractionResult {
  const totalCount = result.ingredients.length;
  const limit = config.freeIngredientLimit;

  if (isPremium || totalCount <= limit) {
    return {
      ...result,
      is_truncated: false,
      total_ingredient_count: totalCount,
      shown_ingredient_count: totalCount,
    } satisfies GatedExtractionResult;
  }

  const truncated = result.ingredients.slice(0, limit);
  const shoppingList = rebuildShoppingList(truncated);

  return {
    ...result,
    ingredients: truncated,
    shopping_list: shoppingList,
    is_truncated: true,
    total_ingredient_count: totalCount,
    shown_ingredient_count: limit,
    upgrade_message: `This recipe has ${totalCount} ingredients. Upgrade to Premium to see all of them.`,
  } satisfies GatedExtractionResult;
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

async function processJob(jobId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) return;

  setJobStatus(jobId, "processing");

  try {
    const result = await runPipeline(job);
    setJobResult(jobId, result);
    console.log(
      `[Job ${jobId}] Completed — tier=${result.extraction_tier}, ` +
      `ingredients=${result.ingredients.length}, ` +
      `confidence=${result.confidence.toFixed(2)}, ` +
      `cost=$${result.processing_metadata.total_cost_usd.toFixed(4)}, ` +
      `time=${result.processing_metadata.processing_time_ms}ms`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    setJobError(jobId, msg);
    console.error(`[Job ${jobId}] Failed:`, msg);
  }
}
