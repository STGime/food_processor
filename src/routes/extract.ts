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
router.post("/extract", requireAuth, async (req, res) => {
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

  const job = await createJob(youtube_url, videoId, req.device!.device_id);

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
router.get("/status/:job_id", requireAuth, async (req: Request<{ job_id: string }>, res) => {
  const job = await getJob(req.params.job_id);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({
    job_id: job.id,
    status: job.status,
    current_tier: job.current_tier,
    progress: job.progress,
    ...(job.status_message ? { status_message: job.status_message } : {}),
    ...(job.error ? { error: job.error } : {}),
  });
});

/**
 * GET /api/results/:job_id
 * Get the extraction results for a completed job.
 * Free users get truncated ingredients; premium users get full results.
 */
router.get("/results/:job_id", requireAuth, async (req: Request<{ job_id: string }>, res) => {
  const job = await getJob(req.params.job_id);

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
  const totalIngredients = result.ingredients.length;
  const totalInstructions = result.instructions.length;
  const ingredientLimit = config.freeIngredientLimit;
  const instructionLimit = config.freeInstructionLimit;

  const needsTruncation = !isPremium &&
    (totalIngredients > ingredientLimit || totalInstructions > instructionLimit);

  if (!needsTruncation) {
    return {
      ...result,
      is_truncated: false,
      total_ingredient_count: totalIngredients,
      shown_ingredient_count: totalIngredients,
      total_instruction_count: totalInstructions,
      shown_instruction_count: totalInstructions,
    } satisfies GatedExtractionResult;
  }

  const truncatedIngredients = result.ingredients.slice(0, ingredientLimit);
  const truncatedInstructions = result.instructions.slice(0, instructionLimit);
  const shoppingList = rebuildShoppingList(truncatedIngredients);

  const parts: string[] = [];
  if (totalIngredients > ingredientLimit) {
    parts.push(`${totalIngredients} ingredients`);
  }
  if (totalInstructions > instructionLimit) {
    parts.push(`${totalInstructions} steps`);
  }

  return {
    ...result,
    ingredients: truncatedIngredients,
    instructions: truncatedInstructions,
    shopping_list: shoppingList,
    is_truncated: true,
    total_ingredient_count: totalIngredients,
    shown_ingredient_count: Math.min(totalIngredients, ingredientLimit),
    total_instruction_count: totalInstructions,
    shown_instruction_count: Math.min(totalInstructions, instructionLimit),
    upgrade_message: `This recipe has ${parts.join(" and ")}. Upgrade to Premium to see all of them.`,
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
  const job = await getJob(jobId);
  if (!job) return;

  await setJobStatus(jobId, "processing");

  try {
    const result = await runPipeline(job);
    await setJobResult(jobId, result);
    console.log(
      `[Job ${jobId}] Completed — tier=${result.extraction_tier}, ` +
      `ingredients=${result.ingredients.length}, ` +
      `confidence=${result.confidence.toFixed(2)}, ` +
      `cost=$${result.processing_metadata.total_cost_usd.toFixed(4)}, ` +
      `time=${result.processing_metadata.processing_time_ms}ms`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await setJobError(jobId, msg);
    console.error(`[Job ${jobId}] Failed:`, msg);
  }
}
