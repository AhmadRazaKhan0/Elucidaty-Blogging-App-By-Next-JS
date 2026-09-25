import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export const notFound = (_: Request, res: Response) => res.status(404).json({ success: false, message: "Route not found" });

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) return res.status(err.status).json({ success: false, message: err.message });
  if (err?.code === 11000) return res.status(409).json({ success: false, message: "A post with this slug already exists" });
  if (err?.name === "ValidationError" || err?.name === "CastError") return res.status(400).json({ success: false, message: "Invalid data" });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ success: false, message: "Invalid JSON body" });
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
}
