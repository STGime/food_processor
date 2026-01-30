import type { Job, JobStatus, ExtractionResult } from "../types.js";

/**
 * In-memory job store. Replace with PostgreSQL/Redis for production.
 */
const jobs = new Map<string, Job>();

let counter = 0;

export function createJob(youtubeUrl: string, videoId: string): Job {
  const id = `job_${++counter}_${Date.now().toString(36)}`;
  const job: Job = {
    id,
    status: "queued",
    youtube_url: youtubeUrl,
    video_id: videoId,
    current_tier: -1,
    progress: 0,
    result: null,
    error: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(
  id: string,
  updates: Partial<Pick<Job, "status" | "current_tier" | "progress" | "result" | "error">>
): void {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job, updates, { updated_at: new Date() });
}

export function setJobResult(id: string, result: ExtractionResult): void {
  updateJob(id, { status: "completed", progress: 1, result });
}

export function setJobError(id: string, error: string): void {
  updateJob(id, { status: "failed", error });
}

export function setJobStatus(id: string, status: JobStatus): void {
  updateJob(id, { status });
}
