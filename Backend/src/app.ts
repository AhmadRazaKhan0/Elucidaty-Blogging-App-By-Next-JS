import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { dbState } from "./config/db";
import postRoutes from "./routes/postRoutes";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: env.clientOrigins, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_, res) => {
  const db = dbState();
  res.status(db === "connected" ? 200 : 503).json({ success: db === "connected", service: "elucidaty-api", data: { db }, message: db === "connected" ? "Elucidaty API is running" : "Elucidaty API is running, but the database is unavailable" });
});
app.use("/api/posts", postRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
