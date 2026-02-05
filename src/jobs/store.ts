import crypto from "node:crypto";
import { pool } from "../db.js";
import type { Job, JobStatus, ExtractionResult } from "../types.js";

interface JobRow {
  id: string;
  status: string;
  youtube_url: string;
  video_id: string;
  device_id: string;
  current_tier: number;
  progress: number;
  status_message: string | null;
  result: unknown;
  error: string | null;
  created_at: Date;
  updated_at: Date;
}

function rowToJob(row: JobRow): Job {
  return {
    ...row,
    status: row.status as JobStatus,
    result: (row.result as ExtractionResult) ?? null,
  };
}

export async function createJob(
  youtubeUrl: string,
  videoId: string,
  deviceId: string,
): Promise<Job> {
  const id = `job_${crypto.randomUUID()}`;

  const { rows } = await pool.query<JobRow>(
    `INSERT INTO jobs (id, youtube_url, video_id, device_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, youtubeUrl, videoId, deviceId],
  );

  return rowToJob(rows[0]);
}

export async function getJob(id: string): Promise<Job | undefined> {
  const { rows } = await pool.query<JobRow>(
    `SELECT * FROM jobs WHERE id = $1`,
    [id],
  );
  return rows[0] ? rowToJob(rows[0]) : undefined;
}

export async function updateJob(
  id: string,
  updates: Partial<Pick<Job, "status" | "current_tier" | "progress" | "status_message" | "result" | "error">>,
): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(updates.status);
  }
  if (updates.current_tier !== undefined) {
    fields.push(`current_tier = $${idx++}`);
    values.push(updates.current_tier);
  }
  if (updates.progress !== undefined) {
    fields.push(`progress = $${idx++}`);
    values.push(updates.progress);
  }
  if (updates.status_message !== undefined) {
    fields.push(`status_message = $${idx++}`);
    values.push(updates.status_message);
  }
  if (updates.result !== undefined) {
    fields.push(`result = $${idx++}`);
    values.push(JSON.stringify(updates.result));
  }
  if (updates.error !== undefined) {
    fields.push(`error = $${idx++}`);
    values.push(updates.error);
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = now()`);
  values.push(id);

  await pool.query(
    `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${idx}`,
    values,
  );
}

export async function updateJobProgress(
  id: string,
  currentTier: number,
  progress: number,
  statusMessage: string,
): Promise<void> {
  await updateJob(id, {
    current_tier: currentTier,
    progress,
    status_message: statusMessage,
  });
}

export async function setJobResult(id: string, result: ExtractionResult): Promise<void> {
  await updateJob(id, { status: "completed", progress: 1, result });
}

export async function setJobError(id: string, error: string): Promise<void> {
  await updateJob(id, { status: "failed", error });
}

export async function setJobStatus(id: string, status: JobStatus): Promise<void> {
  await updateJob(id, { status });
}
