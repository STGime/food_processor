import { Router } from "express";
import { createJob, getJob, setJobResult, setJobError, setJobStatus } from "../jobs/store.js";
import { runPipeline, validateUrl } from "../pipeline/orchestrator.js";

export const router = Router();

/**
 * POST /api/extract
 * Submit a YouTube URL for ingredient extraction.
 */
router.post("/extract", (req, res) => {
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
router.get("/status/:job_id", (req, res) => {
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
 */
router.get("/results/:job_id", (req, res) => {
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

  res.json(job.result);
});

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
