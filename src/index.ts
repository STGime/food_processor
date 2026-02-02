import express from "express";
import { config } from "./config.js";
import { router as extractRouter } from "./routes/extract.js";
import { router as devicesRouter } from "./routes/devices.js";
import { router as webhooksRouter } from "./routes/webhooks.js";
import { router as checkoutRouter } from "./routes/checkout.js";
import { router as galleryRouter } from "./routes/gallery.js";

const app = express();

// Parse JSON with raw body preserved for webhook signature verification
app.use(
  express.json({
    verify(req, _res, buf) {
      (req as unknown as { rawBody: Buffer }).rawBody = buf;
    },
  }),
);

// Routes
app.use("/api", extractRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/gallery", galleryRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "0.1.0" });
});

app.listen(config.port, () => {
  console.log(`Food Processor API running on http://localhost:${config.port}`);
  console.log(`Endpoints:`);
  console.log(`  POST /api/devices/register — register device, get API key`);
  console.log(`  GET  /api/devices/me       — check premium status`);
  console.log(`  POST /api/extract          — submit a YouTube URL`);
  console.log(`  GET  /api/status/:job_id   — check job status`);
  console.log(`  GET  /api/results/:job_id  — get extraction results`);
  console.log(`  GET  /api/checkout         — get LemonSqueezy checkout URL`);
  console.log(`  POST /api/webhooks/lemonsqueezy — LemonSqueezy webhook`);
  console.log(`  POST /api/gallery          — save a recipe card`);
  console.log(`  GET  /api/gallery          — list recipe cards`);
  console.log(`  GET  /api/gallery/:card_id — get a recipe card`);
  console.log(`  DEL  /api/gallery/:card_id — delete a recipe card`);
  console.log(`  POST /api/gallery/:card_id/image — generate card image`);
  console.log(`  GET  /api/health           — health check`);
});
