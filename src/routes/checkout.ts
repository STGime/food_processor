import { Router } from "express";
import { config } from "../config.js";
import { requireAuth } from "../middleware/auth.js";

export const router = Router();

/**
 * GET /api/checkout
 * Returns a LemonSqueezy checkout URL with the device_id embedded as custom data.
 */
router.get("/", requireAuth, (req, res) => {
  const device = req.device!;

  const checkoutUrl =
    `https://${config.lemonSqueezyStoreId}.lemonsqueezy.com/checkout/buy/` +
    `${config.lemonSqueezyVariantId}` +
    `?checkout[custom][device_id]=${encodeURIComponent(device.device_id)}`;

  res.json({ checkout_url: checkoutUrl });
});
