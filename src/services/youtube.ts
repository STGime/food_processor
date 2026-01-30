import { config } from "../config.js";
import type { VideoMetadata, TranscriptSegment } from "../types.js";

/**
 * Extract the video ID from various YouTube URL formats.
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// --- Video Metadata ---

/**
 * Fetch video metadata. Tries YouTube Data API v3 first, falls back to
 * oEmbed + page scraping if the API key doesn't have YouTube access.
 */
export async function fetchVideoMetadata(
  videoId: string
): Promise<VideoMetadata> {
  try {
    return await fetchViaDataApi(videoId);
  } catch {
    console.log(
      `[YouTube] Data API unavailable, falling back to page scraping`
    );
    return await fetchViaPageScrape(videoId);
  }
}

async function fetchViaDataApi(videoId: string): Promise<VideoMetadata> {
  const params = new URLSearchParams({
    part: "snippet",
    id: videoId,
    key: config.youtubeApiKey,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`
  );

  if (!res.ok) {
    throw new Error(`YouTube Data API returned ${res.status}`);
  }

  const data = (await res.json()) as {
    items?: Array<{
      snippet: {
        title: string;
        description: string;
        channelTitle: string;
        tags?: string[];
      };
    }>;
  };

  if (!data.items?.length) {
    throw new Error(`Video not found: ${videoId}`);
  }

  const snippet = data.items[0].snippet;
  return {
    video_id: videoId,
    title: snippet.title,
    description: snippet.description,
    channel: snippet.channelTitle,
    tags: snippet.tags ?? [],
  };
}

/**
 * Fallback: fetch metadata by scraping the YouTube video page.
 * Gets title from oEmbed, description from page meta tags.
 */
async function fetchViaPageScrape(videoId: string): Promise<VideoMetadata> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // oEmbed gives us title and author (no API key needed)
  const oembedRes = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  );

  let title = videoId;
  let channel = "Unknown";
  if (oembedRes.ok) {
    const oembed = (await oembedRes.json()) as {
      title?: string;
      author_name?: string;
    };
    title = oembed.title ?? title;
    channel = oembed.author_name ?? channel;
  }

  // Fetch the video page to extract the description from meta tags
  let description = "";
  try {
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // Try og:description meta tag
      const ogMatch = html.match(
        /<meta\s+property="og:description"\s+content="([^"]*)"[^>]*>/
      );
      if (ogMatch) {
        description = decodeHtmlEntities(ogMatch[1]);
      }

      // Try the longer description from the page's initial data
      const dataMatch = html.match(
        /"shortDescription":"((?:[^"\\]|\\.)*)"/
      );
      if (dataMatch) {
        description = dataMatch[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
      }
    }
  } catch {
    // Page scraping is best-effort
  }

  return {
    video_id: videoId,
    title,
    description,
    channel,
    tags: [],
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// --- Transcript / Captions ---

/**
 * Fetch transcript/captions for a YouTube video.
 * Uses YouTube's InnerTube API to get caption track URLs, then fetches
 * the XML transcript. No API key needed.
 */
export async function fetchTranscript(
  videoId: string
): Promise<TranscriptSegment[]> {
  const captionUrl = await getCaptionUrl(videoId);
  if (!captionUrl) {
    throw new Error("No captions available for this video");
  }

  const captionRes = await fetch(captionUrl, {
    headers: { "Accept-Language": "en-US" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!captionRes.ok) {
    throw new Error(`Failed to fetch captions: ${captionRes.status}`);
  }

  const xml = await captionRes.text();
  return parseCaptionXml(xml);
}

/**
 * Get the caption URL via InnerTube API (most reliable method).
 * Falls back to scraping the video page HTML if InnerTube fails.
 */
async function getCaptionUrl(videoId: string): Promise<string | null> {
  // Primary: InnerTube API
  try {
    const res = await fetch(
      "https://www.youtube.com/youtubei/v1/player",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "20.10.38",
              hl: "en",
            },
          },
          videoId,
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (res.ok) {
      const data = (await res.json()) as {
        captions?: {
          playerCaptionsTracklistRenderer?: {
            captionTracks?: Array<{
              baseUrl: string;
              languageCode: string;
              kind?: string;
            }>;
          };
        };
      };

      const tracks =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (tracks && tracks.length > 0) {
        return pickBestTrack(tracks);
      }
    }
  } catch {
    // Fall through to page scrape
  }

  // Fallback: scrape video page
  try {
    const pageRes = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!pageRes.ok) return null;
    const html = await pageRes.text();
    const match = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) return null;

    const tracks = JSON.parse(match[1]) as Array<{
      baseUrl: string;
      languageCode: string;
      kind?: string;
    }>;
    if (tracks.length === 0) return null;
    return pickBestTrack(tracks);
  } catch {
    return null;
  }
}

function pickBestTrack(
  tracks: Array<{ baseUrl: string; languageCode: string; kind?: string }>
): string {
  // Prefer English manual captions, then English auto, then any
  const english = tracks.find(
    (t) => t.languageCode === "en" && t.kind !== "asr"
  );
  const englishAuto = tracks.find(
    (t) => t.languageCode === "en" && t.kind === "asr"
  );
  const chosen = english ?? englishAuto ?? tracks[0];
  // Decode unicode escapes and remove fmt=srv3 (per Python youtube-transcript-api)
  return chosen.baseUrl
    .replace(/\\u0026/g, "&")
    .replace("&fmt=srv3", "");
}

function parseCaptionXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  // Match <text start="..." dur="...">content</text>
  const regex = /<text\s+start="([^"]*)"(?:\s+dur="([^"]*)")?[^>]*>([\s\S]*?)<\/text>/g;

  let match;
  while ((match = regex.exec(xml)) !== null) {
    const offset = parseFloat(match[1]) * 1000; // convert to ms
    const duration = match[2] ? parseFloat(match[2]) * 1000 : 0;
    const text = decodeXmlEntities(match[3]).trim();

    if (text) {
      segments.push({ text, offset, duration });
    }
  }

  return segments;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/\n/g, " ");
}

/**
 * Join transcript segments into a single text block.
 */
export function joinTranscript(segments: TranscriptSegment[]): string {
  return segments.map((s) => s.text).join(" ");
}

/**
 * Extract URLs from a text string (e.g., video description).
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  return [...text.matchAll(urlRegex)].map((m) => m[0]);
}
