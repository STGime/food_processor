import crypto from "node:crypto";
import { pool } from "../db.js";
import type { Device } from "../types.js";

export async function createDevice(deviceId: string): Promise<Device> {
  const apiKey = crypto.randomUUID();

  await pool.query(
    `INSERT INTO devices (device_id, api_key)
     VALUES ($1, $2)
     ON CONFLICT (device_id) DO NOTHING`,
    [deviceId, apiKey],
  );

  const { rows } = await pool.query<Device>(
    `SELECT device_id, api_key, is_premium, subscription_id, created_at, updated_at
     FROM devices WHERE device_id = $1`,
    [deviceId],
  );

  return rows[0];
}

export async function getDeviceByApiKey(apiKey: string): Promise<Device | undefined> {
  const { rows } = await pool.query<Device>(
    `SELECT device_id, api_key, is_premium, subscription_id, created_at, updated_at
     FROM devices WHERE api_key = $1`,
    [apiKey],
  );
  return rows[0];
}

export async function getDeviceByDeviceId(deviceId: string): Promise<Device | undefined> {
  const { rows } = await pool.query<Device>(
    `SELECT device_id, api_key, is_premium, subscription_id, created_at, updated_at
     FROM devices WHERE device_id = $1`,
    [deviceId],
  );
  return rows[0];
}

export async function updateDevicePremium(
  deviceId: string,
  isPremium: boolean,
  subscriptionId: string | null,
): Promise<void> {
  await pool.query(
    `UPDATE devices
     SET is_premium = $1, subscription_id = $2, updated_at = now()
     WHERE device_id = $3`,
    [isPremium, subscriptionId, deviceId],
  );
}
