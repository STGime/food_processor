import type { Request, Response, NextFunction } from "express";
import type { Device } from "../types.js";
import { getDeviceByApiKey } from "../devices/store.js";

declare global {
  namespace Express {
    interface Request {
      device?: Device;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.header("X-API-Key");

  if (!apiKey) {
    res.status(401).json({ error: "Missing X-API-Key header" });
    return;
  }

  const device = await getDeviceByApiKey(apiKey);

  if (!device) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  req.device = device;
  next();
}
