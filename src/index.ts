import express from "express";
import { config } from "./config.js";
import { router as extractRouter } from "./routes/extract.js";

const app = express();

app.use(express.json());

// Routes
app.use("/api", extractRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "0.1.0" });
});

app.listen(config.port, () => {
  console.log(`Food Processor API running on http://localhost:${config.port}`);
  console.log(`Endpoints:`);
  console.log(`  POST /api/extract        — submit a YouTube URL`);
  console.log(`  GET  /api/status/:job_id — check job status`);
  console.log(`  GET  /api/results/:job_id — get extraction results`);
  console.log(`  GET  /api/health          — health check`);
});
