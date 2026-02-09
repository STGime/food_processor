import { Router } from "express";
import { config } from "../config.js";
import { getDeviceByDeviceId, updateDevicePremium } from "../devices/store.js";

export const router = Router();

/**
 * RevenueCat webhook event types that grant or revoke premium.
 * See: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */
const PREMIUM_GRANT_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
]);

const PREMIUM_REVOKE_EVENTS = new Set([
  "CANCELLATION",
  "EXPIRATION",
  "BILLING_ISSUE",
]);

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  entitlement_ids: string[] | null;
  original_transaction_id: string | null;
  expiration_at_ms: number | null;
}

interface RevenueCatWebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

/**
 * POST /api/webhooks/revenucat
 * Handles subscription lifecycle events from RevenueCat.
 * Verified via Bearer token in the Authorization header.
 */
router.post("/revenucat", async (req, res) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || authHeader !== `Bearer ${config.revenuecatWebhookAuthKey}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = req.body as RevenueCatWebhookPayload;
  const event = payload.event;

  if (!event) {
    res.status(400).json({ error: "Missing event in payload" });
    return;
  }

  const eventType = event.type;
  // RevenueCat app_user_id is set to the device_id during SDK configuration
  const deviceId = event.app_user_id;
  const transactionId = event.original_transaction_id ?? null;

  if (!deviceId) {
    console.warn(`[RevenueCat Webhook] No app_user_id for event: ${eventType}`);
    res.status(200).json({ received: true });
    return;
  }

  const device = await getDeviceByDeviceId(deviceId);

  if (!device) {
    console.warn(`[RevenueCat Webhook] Unknown device_id: ${deviceId}`);
    res.status(200).json({ received: true });
    return;
  }

  if (PREMIUM_GRANT_EVENTS.has(eventType)) {
    await updateDevicePremium(deviceId, true, transactionId);
    console.log(`[RevenueCat Webhook] Device ${deviceId} upgraded to premium (event: ${eventType})`);
  } else if (PREMIUM_REVOKE_EVENTS.has(eventType)) {
    await updateDevicePremium(deviceId, false, null);
    console.log(`[RevenueCat Webhook] Device ${deviceId} downgraded to free (event: ${eventType})`);
  } else {
    console.log(`[RevenueCat Webhook] Unhandled event: ${eventType}`);
  }

  res.status(200).json({ received: true });
});
