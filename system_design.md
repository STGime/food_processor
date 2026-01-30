# Video-to-Ingredients System Design

**Scope:** Extract structured ingredient/shopping lists from YouTube cooking videos.
**Deployment:** Cloud API service (Node.js or Python backend).
**Scale:** 50–500 videos/month, growing.

---

## 1. Architecture Overview

The system uses a **tiered escalation pipeline**. Each video enters at Tier 0 and only advances to a more expensive tier if the previous tier fails or produces low-confidence results.

```
YouTube URL
    │
    ▼
┌──────────────────────────────────────┐
│  Tier 0 — Metadata Scrape           │  cost: ~$0/video
│  Parse description, comments,       │
│  linked blog/recipe site            │
└──────────┬───────────────────────────┘
           │ confidence < threshold
           ▼
┌──────────────────────────────────────┐
│  Tier 1 — Transcript + LLM          │  cost: ~$0.001/video
│  Fetch YouTube captions → LLM       │
│  ingredient extraction              │
└──────────┬───────────────────────────┘
           │ confidence < threshold
           ▼
┌──────────────────────────────────────┐
│  Tier 2 — Video Analysis            │  cost: ~$0.01–0.03/video
│  Gemini 2.5 Flash processes the     │
│  video natively (visual + audio)    │
└──────────┬───────────────────────────┘
           │ confidence < threshold
           ▼
┌──────────────────────────────────────┐
│  Tier 3 — Deep Scan                 │  cost: ~$0.36/video
│  Gemini 2.5 Pro or multi-model      │
│  cross-validation                   │
└──────────────────────────────────────┘
```

**Why this order?** Most cooking YouTubers include ingredients in the video description or in a linked blog post. Falling through to video analysis should be relatively rare, keeping average cost near zero.

---

## 2. Provider & Pricing Comparison

### 2.1 Transcript / ASR Providers

| Provider | Model | Price | Notes |
|---|---|---|---|
| [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) | — | **Free** (open source) | No API key. Works with auto-generated and manual captions. Python only. |
| [AssemblyAI](https://www.assemblyai.com/pricing) | Slam-1 / Universal-2 | **$0.15/hr** ($0.0025/min) | Custom vocabulary support. Free tier: 100 hrs + $50 credits. |
| [OpenAI](https://openai.com/api/pricing/) | GPT-4o-mini Transcribe | **$0.18/hr** ($0.003/min) | Lower-cost option. |
| [OpenAI](https://openai.com/api/pricing/) | Whisper / GPT-4o Transcribe | **$0.36/hr** ($0.006/min) | Higher accuracy. |
| [Google Cloud STT](https://cloud.google.com/speech-to-text/pricing) | Chirp / V2 | **$0.96/hr** ($0.016/min) | Batch mode: $0.24/hr. Free: 60 min/month. |
| [Deepgram](https://deepgram.com/pricing) | Nova-2 | **$0.46/hr** ($0.0077/min) | Growth plan: $0.39/hr. Free: $200 credits. |

**Recommendation:** Use `youtube-transcript-api` as default (Tier 1). Fall back to AssemblyAI only when YouTube captions are unavailable.

### 2.2 Vision / Video Models

| Provider | Model | Input Price (per 1M tokens) | Output Price (per 1M tokens) | Video Support | Notes |
|---|---|---|---|---|---|
| [Google](https://ai.google.dev/gemini-api/docs/pricing) | Gemini 2.5 Flash | $0.30 | $2.50 | **Native** | Batch mode: 50% off. Thinking output: $3.50/1M. |
| [Google](https://ai.google.dev/gemini-api/docs/pricing) | Gemini 2.0 Flash | $0.10 | $0.40 | **Native** | 258 tokens/sec video, 25 tokens/sec audio. Free tier available. |
| [Google](https://ai.google.dev/gemini-api/docs/pricing) | Gemini 2.5 Pro | $1.25 | $10.00 | **Native** | >200K ctx: $2.50 in / $15.00 out. Batch: 50% off. |
| [OpenAI](https://openai.com/api/pricing/) | GPT-4o-mini | $0.15 | $0.60 | Images only | No native video. |
| [OpenAI](https://openai.com/api/pricing/) | GPT-4.1-nano | $0.10 | $0.40 | Images only | Cheapest OpenAI option for text extraction. |

**Recommendation:** Gemini 2.5 Flash for Tier 2 (native video at reasonable cost). Gemini 2.5 Pro for Tier 3.

### 2.3 Text Extraction LLMs (Ingredient NER)

| Provider | Model | Input (per 1M tokens) | Output (per 1M tokens) | Est. Cost per 1K Calls* |
|---|---|---|---|---|
| [OpenAI](https://openai.com/api/pricing/) | GPT-4.1-nano | $0.10 | $0.40 | ~$0.13 |
| [Google](https://ai.google.dev/gemini-api/docs/pricing) | Gemini 2.0 Flash | $0.10 | $0.40 | ~$0.13 |
| [Google](https://ai.google.dev/gemini-api/docs/pricing) | Gemini 2.5 Flash | $0.30 | $2.50 | ~$0.60 |
| [OpenAI](https://openai.com/api/pricing/) | GPT-4o-mini | $0.15 | $0.60 | ~$0.18 |

*Assumes ~250 input tokens + 200 output tokens per call.

**Recommendation:** GPT-4.1-nano or Gemini 2.0 Flash — both at ~$0.13/1K calls.

### 2.4 OCR (For on-screen text in video frames)

| Provider | Price | Notes |
|---|---|---|
| [Tesseract](https://github.com/tesseract-ocr/tesseract) | **Free** (open source) | Self-hosted. Good for clear, printed text. |
| [EasyOCR](https://github.com/JaidedAI/EasyOCR) | **Free** (open source) | Python. 80+ languages. GPU optional. |
| [Google Cloud Vision](https://cloud.google.com/vision/pricing) | $1.50/1K images | First 1K/month free. Best accuracy. |

**Recommendation:** Skip standalone OCR. Gemini handles on-screen text natively during video analysis (Tier 2+).

### 2.5 Food Detection (Supplementary)

| Provider | Price | Notes |
|---|---|---|
| [Roboflow YOLO](https://roboflow.com/) | **Free** (self-hosted) | Pre-trained food models available. Requires GPU for real-time. |
| [LogMeal API](https://logmeal.com/) | Usage-based | Food recognition + nutritional info. |
| [Clarifai](https://clarifai.com/) | Usage-based | General object detection with food models. |

**Recommendation:** Not needed for MVP. The LLM pipeline handles ingredient identification from text and video without dedicated food detection.

---

## 3. Detailed Pipeline Per Tier

### 3.1 Shared Output Schema

Every tier produces the same structured output:

```json
{
  "video_id": "dQw4w9WgXcQ",
  "video_title": "Classic Margherita Pizza",
  "channel": "Cooking With Chef X",
  "extraction_tier": 1,
  "confidence": 0.92,
  "servings": 4,
  "ingredients": [
    {
      "name": "all-purpose flour",
      "canonical_name": "flour_all_purpose",
      "quantity": 2.5,
      "unit": "cups",
      "raw_text": "2 1/2 cups all-purpose flour",
      "category": "baking",
      "optional": false,
      "preparation": null
    },
    {
      "name": "fresh mozzarella",
      "canonical_name": "cheese_mozzarella_fresh",
      "quantity": 8,
      "unit": "oz",
      "raw_text": "8 ounces fresh mozzarella, sliced",
      "category": "dairy",
      "optional": false,
      "preparation": "sliced"
    }
  ],
  "shopping_list": {
    "produce": ["fresh basil"],
    "dairy": ["fresh mozzarella"],
    "baking": ["all-purpose flour", "active dry yeast", "sugar"],
    "pantry": ["olive oil", "salt"],
    "canned": ["San Marzano tomatoes"]
  },
  "source_urls": ["https://chefx.com/margherita-pizza-recipe"],
  "processing_metadata": {
    "tiers_attempted": [0, 1],
    "total_cost_usd": 0.0004,
    "processing_time_ms": 2340
  }
}
```

### 3.2 Tier 0 — Metadata Scrape

**Cost:** ~$0/video (no paid API calls)

```
Input: YouTube video URL
    │
    ├─► 1. Fetch video metadata via YouTube Data API v3
    │      (title, description, channel, tags)
    │
    ├─► 2. Parse description for:
    │      a. Explicit ingredient lists (regex + heuristics)
    │      b. Links to external recipe pages
    │
    ├─► 3. If recipe URL found:
    │      a. Fetch page HTML
    │      b. Parse JSON-LD (schema.org/Recipe) — most recipe blogs use this
    │      c. Fallback: extract from <ul>/<ol> elements near "ingredient" headings
    │
    ├─► 4. Normalize ingredients via LLM (GPT-4.1-nano)
    │      Prompt: "Parse these raw ingredients into structured JSON..."
    │
    └─► 5. Score confidence:
           - JSON-LD recipe found → 0.95
           - Description had ingredient list → 0.85
           - Only partial data → 0.40 (escalate)
```

**Escalation rule:** Confidence < 0.70 → proceed to Tier 1.

### 3.3 Tier 1 — Transcript + LLM Extraction

**Cost:** ~$0.001/video

```
Input: YouTube video URL (Tier 0 failed or low confidence)
    │
    ├─► 1. Fetch transcript via youtube-transcript-api
    │      - Try manual captions first (more accurate)
    │      - Fall back to auto-generated captions
    │      - If no captions at all → escalate to Tier 2
    │
    ├─► 2. Send transcript to LLM (GPT-4.1-nano or Gemini 2.0 Flash)
    │      System prompt:
    │      "Extract all ingredients from this cooking video transcript.
    │       For each ingredient, provide: name, quantity, unit, preparation.
    │       Also identify the recipe name and serving count.
    │       Return valid JSON matching the schema provided."
    │
    ├─► 3. Merge with any partial Tier 0 data
    │      - Union of ingredients from both tiers
    │      - Deduplicate by canonical_name
    │
    ├─► 4. Confidence scoring:
    │      - Manual captions + 5+ ingredients found → 0.90
    │      - Auto captions + 5+ ingredients → 0.80
    │      - Fewer than 3 ingredients → 0.50 (escalate)
    │      - Transcript unavailable → 0.00 (escalate)
    │
    └─► 5. Normalize and categorize via LLM
```

**Escalation rule:** Confidence < 0.70 → proceed to Tier 2.

### 3.4 Tier 2 — Video Analysis (Gemini 2.5 Flash)

**Cost:** ~$0.01–0.03/video (depends on video length)

```
Input: YouTube video URL (Tier 1 failed or low confidence)
    │
    ├─► 1. Upload video to Gemini File API
    │      (supports direct URL or file upload, max 2GB)
    │
    ├─► 2. Send video + prompt to Gemini 2.5 Flash:
    │      "Watch this cooking video. Extract ALL ingredients used,
    │       including those shown on screen, mentioned verbally, or
    │       visible in the cooking process. For each ingredient provide:
    │       name, estimated quantity, unit, and any preparation notes.
    │       Return structured JSON."
    │
    ├─► 3. Cross-reference with Tier 0/1 data
    │      - Use earlier results as a checklist
    │      - Flag any ingredients found in video but missing from transcript
    │
    ├─► 4. Confidence scoring:
    │      - 5+ ingredients + consistent with transcript → 0.92
    │      - New ingredients found not in transcript → 0.85
    │      - Model expressed uncertainty → 0.65 (escalate)
    │
    └─► 5. Final normalization and shopping list generation
```

**Token estimate for a 10-min video:**
- Video: ~258 tokens/sec × 600 sec = ~155K tokens
- Audio: ~25 tokens/sec × 600 sec = ~15K tokens
- Total input: ~170K tokens + prompt ≈ 171K tokens
- Output: ~500 tokens
- Cost: 171K × $0.30/1M + 500 × $2.50/1M ≈ **$0.05/video** (10 min)
- With batch mode (50% off): **~$0.03/video**

### 3.5 Tier 3 — Deep Scan (Gemini 2.5 Pro)

**Cost:** ~$0.21–0.36/video

```
Input: YouTube video URL (Tier 2 failed or low confidence)
    │
    ├─► 1. Upload video to Gemini File API (same as Tier 2)
    │
    ├─► 2. Multi-pass analysis with Gemini 2.5 Pro:
    │      Pass A: Full video ingredient extraction (same as Tier 2)
    │      Pass B: Cross-validate against any Tier 0/1/2 results
    │      Pass C: Estimate quantities for "eyeballed" ingredients
    │
    ├─► 3. Optional: Second model validation
    │      - Send extracted ingredients to a different model (GPT-4o)
    │      - Compare outputs for consistency
    │
    ├─► 4. Human review flag:
    │      - If Tier 3 confidence still < 0.70, flag for manual review
    │
    └─► 5. Final output (highest fidelity)
```

**Token estimate (10-min video, single pass):**
- Input: ~171K tokens × $1.25/1M = $0.21
- With multi-pass (2 passes): ~$0.36/video

---

## 4. Key Technology Choices & Rationale

### Primary Video Model: Gemini 2.5 Flash

- **Why:** Only production model that processes raw video natively (not just frame extraction). Handles both visual ingredient identification and audio/spoken content in a single API call.
- **Alternative considered:** Frame extraction + GPT-4o-mini vision. Rejected because it requires managing frame sampling, misses audio cues, and the per-frame cost adds up quickly for long videos.

### Transcript Source: youtube-transcript-api

- **Why:** Free, no API key, works with both manual and auto-generated captions. Covers Tier 1 at zero marginal cost.
- **Limitation:** Only works for YouTube. If the system expands to other platforms, a paid ASR service will be needed.

### ASR Fallback: AssemblyAI

- **Why:** Cheapest paid transcription at $0.15/hr. Supports custom vocabulary (useful for specialized cooking terms). Free tier gives 100 hours for development.
- **Alternative considered:** OpenAI GPT-4o-mini Transcribe at $0.18/hr is close in price but lacks custom vocabulary.

### Text NLP / Ingredient NER: GPT-4.1-nano

- **Why:** Cheapest text LLM for structured extraction at ~$0.13/1K calls. Sufficient reasoning ability for ingredient parsing — this is a straightforward extraction task, not complex reasoning.
- **Alternative:** Gemini 2.0 Flash at the same price point. Could use either; GPT-4.1-nano chosen for ecosystem diversity (avoids single-vendor lock-in with Google).

### Ingredient Normalization: LLM-based

Rather than maintaining a static ingredient database, we use the LLM to:
1. Map raw text to canonical names (e.g., "2 cloves of garlic, minced" → `garlic_clove`)
2. Assign shopping categories (produce, dairy, pantry, etc.)
3. Convert between measurement systems when needed

This approach adapts to new ingredients automatically and handles colloquial names ("za'atar", "gochujang") without manual dictionary updates.

---

## 5. Cost Projections

### Assumptions

- Average video length: 12 minutes
- Tier resolution distribution (typical): 40% Tier 0, 35% Tier 1, 20% Tier 2, 5% Tier 3
- LLM normalization call per video: ~$0.0001

### Per-Video Cost by Tier

| Tier | API Calls | Est. Cost |
|---|---|---|
| 0 | YouTube Data API + web scrape + 1 LLM call | ~$0.0001 |
| 1 | youtube-transcript-api + 1-2 LLM calls | ~$0.001 |
| 2 | Gemini 2.5 Flash video analysis (batch) | ~$0.03 |
| 3 | Gemini 2.5 Pro video analysis | ~$0.36 |

### Monthly Cost Estimates

#### 50 videos/month

| Scenario | Distribution | Monthly Cost |
|---|---|---|
| **Best case** | 60% T0, 30% T1, 10% T2 | **$0.18** |
| **Typical** | 40% T0, 35% T1, 20% T2, 5% T3 | **$1.21** |
| **Worst case** | 10% T0, 10% T1, 50% T2, 30% T3 | **$6.17** |

#### 200 videos/month

| Scenario | Distribution | Monthly Cost |
|---|---|---|
| **Best case** | 60% T0, 30% T1, 10% T2 | **$0.72** |
| **Typical** | 40% T0, 35% T1, 20% T2, 5% T3 | **$4.82** |
| **Worst case** | 10% T0, 10% T1, 50% T2, 30% T3 | **$24.68** |

#### 500 videos/month

| Scenario | Distribution | Monthly Cost |
|---|---|---|
| **Best case** | 60% T0, 30% T1, 10% T2 | **$1.81** |
| **Typical** | 40% T0, 35% T1, 20% T2, 5% T3 | **$12.05** |
| **Worst case** | 10% T0, 10% T1, 50% T2, 30% T3 | **$61.70** |

**Takeaway:** Even the worst case at 500 videos/month stays under $62. The typical case at scale is ~$12/month — dominated by Tier 2 and 3 costs.

### Cost Breakdown (Typical, 200 videos/month)

| Component | Videos | Cost/Video | Subtotal |
|---|---|---|---|
| Tier 0 | 80 | $0.0001 | $0.008 |
| Tier 1 | 70 | $0.001 | $0.07 |
| Tier 2 | 40 | $0.03 | $1.20 |
| Tier 3 | 10 | $0.36 | $3.60 |
| LLM normalization | 200 | $0.0001 | $0.02 |
| **Total** | | | **$4.90** |

*YouTube Data API: Free up to 10K units/day. Each video metadata fetch = ~3 units. 200 videos/month = 600 units → well within free tier.*

---

## 6. Legal Considerations

### YouTube Terms of Service

- **Transcript scraping:** `youtube-transcript-api` accesses YouTube's internal transcript endpoint. This is **not** part of the official YouTube Data API. YouTube could rate-limit or block this access. Risk: low (widely used), but not zero.
- **Video downloading:** YouTube ToS explicitly prohibits downloading video content. **Do not download videos.** Use the Gemini File API which accepts YouTube URLs directly, or only process transcripts.
- **YouTube Data API:** Official and compliant. Free quota of 10,000 units/day covers metadata fetching at this scale.
- **Description/comment scraping:** Accessing publicly visible metadata is generally permitted, but automated access should respect `robots.txt` and rate limits.

### Gemini File API & Video Processing

- Gemini's File API allows uploading video files or passing URLs. When possible, pass the YouTube URL directly to avoid storing video locally.
- Google's Gemini ToS permits commercial use of API outputs.

### Recipe Content Copyright

- Ingredient lists are generally **not copyrightable** (they are factual information). The creative expression in a recipe (instructions, commentary) is copyrightable, but we only extract ingredients.
- Linking back to the source video/blog is good practice and helps with attribution concerns.

### Recommendations

1. Use the official YouTube Data API for metadata (compliant).
2. Use `youtube-transcript-api` for transcripts — accept the minor ToS risk.
3. Never download or store video files.
4. For Tier 2/3, use Gemini File API with direct URL when supported, or extract transcript + keyframes only.
5. Attribute source videos in all output data.

---

## 7. Cloud Architecture

### API Service Design

```
                        ┌──────────────┐
                        │   Client     │
                        │  (Web/App)   │
                        └──────┬───────┘
                               │ POST /api/extract
                               ▼
                    ┌──────────────────────┐
                    │    API Gateway       │
                    │  (Cloud Run / ECS)   │
                    │                      │
                    │  - Auth (API key)    │
                    │  - Rate limiting     │
                    │  - Request validation│
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
     ┌────────────┐   ┌─────────────┐   ┌────────────┐
     │ /extract   │   │ /status/:id │   │ /results/:id│
     │ (POST)     │   │ (GET)       │   │ (GET)       │
     │            │   │             │   │             │
     │ Enqueue    │   │ Poll job    │   │ Fetch       │
     │ job        │   │ status      │   │ results     │
     └─────┬──────┘   └─────────────┘   └─────────────┘
           │
           ▼
   ┌───────────────┐      ┌───────────────────────┐
   │  Job Queue    │─────►│    Worker Process      │
   │  (Cloud Tasks │      │                        │
   │   or Redis    │      │  Tier 0 → 1 → 2 → 3   │
   │   + Bull)     │      │  pipeline execution    │
   └───────────────┘      └───────────┬────────────┘
                                      │
                          ┌───────────┼───────────┐
                          ▼           ▼           ▼
                   ┌──────────┐ ┌──────────┐ ┌────────┐
                   │ YouTube  │ │ Gemini   │ │ OpenAI │
                   │ APIs     │ │ API      │ │ API    │
                   └──────────┘ └──────────┘ └────────┘
```

### REST Endpoints

```
POST /api/extract
  Body: { "youtube_url": "https://youtube.com/watch?v=..." }
  Response: { "job_id": "abc123", "status": "queued" }

GET /api/status/:job_id
  Response: {
    "job_id": "abc123",
    "status": "processing",    // queued | processing | completed | failed
    "current_tier": 1,
    "progress": 0.45
  }

GET /api/results/:job_id
  Response: { /* full ingredient JSON as defined in §3.1 */ }

GET /api/health
  Response: { "status": "ok", "version": "1.0.0" }
```

### Async Job Processing

Processing a video can take 5–60 seconds depending on the tier reached. The system uses **async job processing**:

1. Client submits a URL → receives a `job_id` immediately.
2. A worker picks up the job from the queue and runs the tiered pipeline.
3. Client polls `/status/:job_id` or receives a webhook callback.

**Queue options:**
- **GCP Cloud Tasks** — managed, serverless, integrates with Cloud Run. Best for GCP deployment.
- **Redis + BullMQ** — self-hosted, more control, good for Node.js. Works on any cloud.

### Storage

| Data | Store | Retention |
|---|---|---|
| Job metadata | PostgreSQL (or Cloud SQL) | Indefinite |
| Extraction results | PostgreSQL (JSONB) | Indefinite |
| Cached transcripts | Redis or PostgreSQL | 30 days |
| Video files | **Never stored** | — |

### Suggested Cloud Provider: GCP

**Rationale:** Gemini API is a Google product — using GCP provides:
- Lower latency to Gemini endpoints
- Unified billing
- Cloud Run for the API service (scales to zero, pay-per-request)
- Cloud Tasks for job queuing
- Cloud SQL (PostgreSQL) for persistence
- Secret Manager for API keys

**Monthly infrastructure cost estimate (GCP, typical load):**
- Cloud Run: ~$0 at low volume (free tier: 2M requests/month)
- Cloud SQL (db-f1-micro): ~$7/month
- Cloud Tasks: ~$0 (free tier: 1M operations/month)
- **Total infra: ~$7–15/month**

*Alternative:* AWS (Lambda + SQS + RDS) or a simple VPS ($5–10/month) with Redis + BullMQ.

---

## 8. Implementation Roadmap

### Phase 1: Tier 0 + Tier 1 (MVP)

**Goal:** Handle videos where ingredients are in the description or transcript.

Tasks:
- [ ] Set up Node.js/Python API service with `/extract`, `/status`, `/results` endpoints
- [ ] Implement Tier 0: YouTube Data API metadata fetch + description parsing
- [ ] Implement Tier 0: Web scrape linked recipe pages, parse JSON-LD (`schema.org/Recipe`)
- [ ] Implement Tier 1: Integrate `youtube-transcript-api` for caption retrieval
- [ ] Implement Tier 1: LLM prompt for ingredient extraction (GPT-4.1-nano)
- [ ] Implement ingredient normalization (canonical names + categories)
- [ ] Implement confidence scoring and tier escalation logic
- [ ] Set up async job processing (BullMQ or Cloud Tasks)
- [ ] Set up PostgreSQL for job/result storage
- [ ] Deploy to Cloud Run (or equivalent)
- [ ] Basic API key auth and rate limiting

**Expected coverage:** ~70–80% of cooking videos resolved at Tier 0 or 1.

### Phase 2: Tier 2 (Video Analysis)

**Goal:** Handle videos without text-based ingredient data.

Tasks:
- [ ] Integrate Gemini 2.5 Flash video analysis via File API
- [ ] Build cross-referencing logic (merge Tier 0/1 partial data with Tier 2 results)
- [ ] Implement batch processing for cost savings (50% discount)
- [ ] Add detailed logging and cost tracking per job
- [ ] Tune confidence thresholds based on Phase 1 production data

**Expected coverage:** ~95% of cooking videos resolved at Tier 2 or below.

### Phase 3: Tier 3 + Polish

**Goal:** Handle edge cases and improve accuracy.

Tasks:
- [ ] Integrate Gemini 2.5 Pro for deep scan
- [ ] Build multi-model validation pipeline (optional second model check)
- [ ] Add manual review queue for sub-threshold results
- [ ] Implement webhook callbacks as alternative to polling
- [ ] Add caching layer (same video URL → return cached result)
- [ ] Dashboard for monitoring costs, tier distribution, accuracy metrics

---

## References

- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [AssemblyAI Pricing](https://www.assemblyai.com/pricing)
- [Deepgram Pricing](https://deepgram.com/pricing)
- [Google Cloud Speech-to-Text Pricing](https://cloud.google.com/speech-to-text/pricing)
- [Google Cloud Vision Pricing](https://cloud.google.com/vision/pricing)
- [youtube-transcript-api (GitHub)](https://github.com/jdepoix/youtube-transcript-api)
- [Gemini File API Docs](https://ai.google.dev/gemini-api/docs/vision)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [schema.org/Recipe](https://schema.org/Recipe)
