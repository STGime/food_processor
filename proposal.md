0. Overall idea: “Text first, vision second”

For most cooking videos, 90% of the ingredients are already in the text layer:

Spoken narration (“Now we add two onions and some garlic…”)

On-screen text (“Ingredients: 2 onions, 3 tomatoes…”)

Video description / pinned comment / recipe link

So a good pipeline is:

Grab all text you can

Video description + title + chapters.

Auto-captions / subtitles → run through ASR if you can’t get them via API.

Run OCR only on a few frames that look like ingredient lists (more on that below).

NLP the text

Extract ingredient entities (onion, garlic, olive oil…).

Extract quantities and units where possible.

Normalize (e.g., “red onion” → “onion”).

Use vision only to:

Confirm ingredients.

Catch items not mentioned explicitly (e.g., oil, salt, pepper, spices).

Disambiguate (“cream” vs “milk”, “pasta” vs “noodles”).

This already avoids frame-by-frame scanning and shifts most work to cheaper text/NLP.

1. Smart frame sampling (instead of scanning every frame)

If you do look at the video, do it strategically.

A. Coarse uniform sampling + refinement

Sample super coarsely first: e.g., 1 frame every 2–3 seconds.

Run a cheap classifier/embedding model on those frames:

Is this a “kitchen / food” frame or just a talking head / title card?

Keep only the frames that look like actual cooking.

On the retained frames, sample more densely around interesting segments:

e.g., if seconds 120–160 look like food prep, resample at 3–5 fps there.

This way, a 10-minute video might only need a few hundred frames analysed deeply.

B. Scene / shot boundary detection

Cooking videos are often shot in segments:

Intro / talking

Showing ingredients

Prep (chopping, mixing)

Cooking

Plating / serving

You can:

Run shot detection:

Based on histogram differences or keyframe clustering.

Libraries like PySceneDetect use color histogram differences, but you can also roll your own.

For each shot:

Pick 1–3 keyframes only.

Label the shot (ingredient table, cutting board close-up, pan on stove, plating…).

This reduces a 30 fps video to maybe 30–100 keyframes.

C. Action / hand-based filtering

Most “ingredient appearance moments” involve hands + food + cutting board / bowl / pan.

Strategy:

Run a lightweight model (or even heuristic) to detect:

Hands

Kitchen tools (knife, spatula, pan)

Cutting board / bowl shapes

Only run heavy object detection on frames where these appear.

Even a simple rule like “skip frames with no hands and no kitchen tools” will avoid intros, shots of host’s face, etc.

2. Object detection + tracking instead of per-frame detection

Even if you sample smartly, running a big detector on each selected frame is still costly. Use tracking:

Every N-th frame (say every 5th or 10th):

Run a stronger object detector (YOLO, DETR, etc.).

For in-between frames:

Use a cheap tracker (e.g., SORT/DeepSORT/ByteTrack-style) to propagate boxes forward/backward.

This gives you “object tubes” over time without re-detecting constantly.

Benefit: You can:

Get more robust counts (“I saw onions across 30 frames, likely important, not a one-frame false positive”).

Ignore “background” ingredients that appear only once, tiny, in the corner.

3. Use text-overlay moments as “ingredient list hotspots”

Many food videos have an explicit ingredients screen:

A static shot of a list.

Overlaid text as the host reads it out.

You can detect these cheaply:

Look for low-motion segments:

Use frame differencing or optical flow.

“Static frame + text” often means slides or lists.

On those low-motion segments:

Run OCR on 1–2 frames only.

Look specifically for bullet lists (“- 2 onions”, “• 200 g flour”).

Merge OCR ingredients with ASR ingredients and deduplicate.

This easily gives you a “near-complete” ingredient list with very few frames.

4. Leverage the timeline: audio cues → targeted visual checks

You can use ASR timestamps to decide where to look visually:

From the transcript, get time ranges:

“Now chop the onion” (t = 120s)

“Add garlic and chili” (t = 150–160s)

Around those timestamps:

Sample frames at higher frequency (e.g. 3–5 fps from t–3s to t+5s).

Run object detection only there.

Use results to:

Confirm the ingredient.

If ASR is unclear (“add some of this”), vision can clarify the item type.

So scanning is conditional: “scan around when they talk about food”, not around everything.

5. Cheap classifiers before heavy detectors

Instead of going straight to “detect all foods”, use a hierarchy:

Stage 1: Frame classifier

Is this frame: [no food] / [simple food] / [table of ingredients] / [cooking in pan]?

Use a cheap image classifier or CLIP-like embeddings + clustering.

Stage 2: Only for candidate frames, run detector

If class == ingredients_table → run detector + OCR (text labels like “salt”, “pepper”).

If class == pan_cooking → detect more ambiguous things like “meat vs veggies”.

This minifies the number of frames hitting your heavy food-detector.

6. Don’t forget all the existing recipe metadata

For YouTube especially, there’s often structured or semi-structured info:

Description with “Ingredients:” section.

Pinned comment with full recipe.

A link to a blog post: you can fetch that page and parse it like a normal recipe.

A very pragmatic strategy:

Try “metadata recipe mode” first:

Parse description, comments, linked page.

If you can build a confident ingredient list from that → done.

If metadata is missing/weak:

Fall back to the video-analysis pipeline from above, but maybe as a “deep scan mode”.

This lets you keep costs low for “good” videos and only spend more on messy ones.

7. Turning detections into a clean shopping list

Once you have candidate ingredients (from text + vision):

Normalize & map to canonical ingredients

“red onion”, “yellow onion” → onion.

“sea salt”, “kosher salt” → salt.

“olive oil”, “sunflower oil” → cooking oil.

Estimate quantities

Prefer transcript / OCR: “2 onions”, “200 g flour”.

If missing, you can:

Infer from serving size (“looks like for 2 servings”).

Use a heuristic default or ask the user: “How many servings do you want?”

Deduplicate & group

Merge same ingredient from multiple mentions.

Create sections: “Produce”, “Dairy”, “Meat & fish”, “Spices & pantry”.

Use an LLM to do:

Semantic mapping (“clove of garlic” vs “garlic”).

Unit conversions if the user wants metric/imperial.

8. Modes for your app (cost vs accuracy)

You could even expose this to users as “scan modes”:

Fast mode (cheap)

Text-only + minimal visual confirmation.

Very quick, cheap inference.

Balanced mode

Text-first + smart frame sampling + detector on selected frames.

Deep mode (expensive)

Everything above + more dense sampling around key segments + better tracking.

For power users willing to wait/pay more credits.

Quick example pipeline end-to-end

Putting it all together for a YouTube URL:

Fetch metadata (title, description, chapters).

Fetch transcript / subtitles (or run ASR).

Text pipeline:

Extract ingredients + quantities.

Video pipeline (only if needed or as “plus mode”):

Shot detection → keyframes.

Detect “ingredient list” shots → OCR on 1–2 frames.

Use ASR timestamps to sample frames around “add X”, “chop Y”.

Run detector + light tracking on those segments.

Merge ingredient candidates from:

Text

OCR

Vision

Normalize → group → output as shopping list.