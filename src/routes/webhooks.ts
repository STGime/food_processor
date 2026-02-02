import { Router } from "express";
import crypto from "node:crypto";
import { config } from "../config.js";
import { getDeviceByDeviceId, updateDevicePremium } from "../devices/store.js";
import type { LemonSqueezyWebhookPayload } from "../types.js";

export const router = Router();

/**
 * POST /api/webhooks/lemonsqueezy
 * Handles subscription lifecycle events from LemonSqueezy.
 * Verified via HMAC-SHA256 signature — not API-key-authenticated.
 */
router.post("/lemonsqueezy", async (req, res) => {
  const signature = req.header("X-Signature");

  if (!signature) {
    res.status(401).json({ error: "Missing X-Signature header" });
    return;
  }

  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

  if (!rawBody) {
    res.status(400).json({ error: "Missing raw body" });
    return;
  }

  const hmac = crypto
    .createHmac("sha256", config.lemonSqueezyWebhookSecret)
    .update(rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const hmacBuffer = Buffer.from(hmac, "hex");

  if (
    signatureBuffer.length !== hmacBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, hmacBuffer)
  ) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const payload = req.body as LemonSqueezyWebhookPayload;
  const eventName = payload.meta.event_name;
  const deviceId = payload.meta.custom_data?.device_id;
  const subscriptionId = String(payload.data.id);

  if (!deviceId) {
    console.warn(`[Webhook] No device_id in custom_data for event: ${eventName}`);
    res.status(200).json({ received: true });
    return;
  }

  const device = await getDeviceByDeviceId(deviceId);

  if (!device) {
    console.warn(`[Webhook] Unknown device_id: ${deviceId}`);
    res.status(200).json({ received: true });
    return;
  }

  switch (eventName) {
    case "subscription_created":
      await updateDevicePremium(deviceId, true, subscriptionId);
      console.log(`[Webhook] Device ${deviceId} upgraded to premium (sub: ${subscriptionId})`);
      break;

    case "subscription_cancelled":
    case "subscription_expired":
      await updateDevicePremium(deviceId, false, null);
      console.log(`[Webhook] Device ${deviceId} downgraded to free (event: ${eventName})`);
      break;

    default:
      console.log(`[Webhook] Unhandled event: ${eventName}`);
  }

  res.status(200).json({ received: true });
});
