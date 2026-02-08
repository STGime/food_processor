import express from "express";
import { config } from "./config.js";
import { router as extractRouter } from "./routes/extract.js";
import { router as devicesRouter } from "./routes/devices.js";
import { router as galleryRouter } from "./routes/gallery.js";
import { router as swapsRouter } from "./routes/swaps.js";

const app = express();

app.use(express.json());

// Routes
app.use("/api", extractRouter);
app.use("/api/devices", devicesRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api", swapsRouter);

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
  console.log(`  POST /api/gallery          — save a recipe card`);
  console.log(`  GET  /api/gallery          — list recipe cards`);
  console.log(`  GET  /api/gallery/:card_id — get a recipe card`);
  console.log(`  DEL  /api/gallery/:card_id — delete a recipe card`);
  console.log(`  POST /api/gallery/:card_id/image — generate card image`);
  console.log(`  POST /api/swaps            — get ingredient swap suggestions`);
  console.log(`  GET  /api/health           — health check`);
});
