import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Always load Backend/.env, no matter which directory the process was started from
// (src/config -> Backend, and dist/config -> Backend after `npm run build`).
export const envPath = path.resolve(__dirname, "../../.env");
export const envFileFound = fs.existsSync(envPath);
const isProd = process.env.NODE_ENV === "production";
// Locally the file wins (an empty variable in your shell must not hide it); on hosts there is no file and real env vars are used.
dotenv.config({ path: envPath, override: !isProd });

const list = (v?: string) => (v || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);

export const env = {
  port: Number(process.env.PORT) || 5000,
  isProd,
  mongoUri: (process.env.MONGODB_URI || "").trim().replace(/^["']|["']$/g, ""),
  mongoUser: process.env.MONGODB_USERNAME || "",
  mongoPassword: process.env.MONGODB_PASSWORD || "",
  dbName: (process.env.MONGODB_DB_NAME || "").trim(),
  // Allowed browser origin(s) for CORS (comma-separated). FRONTEND_URL is the name; CLIENT_URL is kept as a legacy alias.
  clientOrigins: list(process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000"),
};
