import { Router } from "express";
import { createDevice } from "../devices/store.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

/**
 * POST /api/devices/register
 * Register a device and get an API key. Idempotent — returns existing key if already registered.
 */
router.post("/register", async (req, res) => {
  const { device_id } = req.body as { device_id?: string };

  if (!device_id || typeof device_id !== "string") {
    res.status(400).json({ error: "Missing required field: device_id" });
    return;
  }

  const device = await createDevice(device_id);

  res.status(201).json({
    device_id: device.device_id,
    api_key: device.api_key,
    is_premium: device.is_premium,
  });
});

/**
 * GET /api/devices/me
 * Get the authenticated device's info.
 */
router.get("/me", requireAuth, (req, res) => {
  const device = req.device!;

  res.json({
    device_id: device.device_id,
    is_premium: device.is_premium,
    subscription_id: device.subscription_id,
  });
});
