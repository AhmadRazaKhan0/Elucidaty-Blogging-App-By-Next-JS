import type { IncomingMessage, ServerResponse } from "http";
import app from "../src/app";
import { connectDB, explainMongoError } from "../src/config/db";

// Vercel serverless entry point. Every request is rewritten here (see vercel.json) and handed to the
// same Express app used by src/server.ts. mongoose's connection is cached at module scope, so a warm
// (already-invoked) function instance reuses the existing connection instead of opening a new one.
let dbReady: Promise<unknown> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    dbReady ??= connectDB();
    await dbReady;
  } catch (e) {
    dbReady = null; // let the next request retry rather than caching a permanent failure
    console.error("✗ MongoDB connection failed:", explainMongoError(e));
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: "Database unavailable. Check server configuration." }));
    return;
  }
  // Express apps are callable as a plain (req, res) request handler.
  (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
}
