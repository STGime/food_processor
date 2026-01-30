import "dotenv/config";

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  geminiApiKey: required("GEMINI_API_KEY"),
  // YouTube Data API uses a Google API key — defaults to GEMINI_API_KEY
  // since both are Google API keys scoped to the same project.
  // If YouTube Data API isn't enabled for that key, set YOUTUBE_API_KEY separately.
  youtubeApiKey: process.env.YOUTUBE_API_KEY || required("GEMINI_API_KEY"),
  confidenceThreshold: 0.7,
} as const;
