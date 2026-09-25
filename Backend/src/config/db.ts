import mongoose from "mongoose";
import { env, envFileFound, envPath } from "./env";

/** Build the connection string. Optional MONGODB_USERNAME/MONGODB_PASSWORD are URL-encoded and injected
 *  when the URI has no credentials, so passwords with special characters (@ : / #) work. */
class ConfigError extends Error {}

function resolveUri(): string {
  let uri = env.mongoUri;
  if (!uri) {
    throw new ConfigError(envFileFound
      ? `MONGODB_URI is empty in ${envPath}. Add your MongoDB connection string there.`
      : `No .env file found at ${envPath}. Copy Backend/.env.example to Backend/.env (exact name, no .txt) and fill it in.`);
  }
  if (/[<>]/.test(uri)) throw new ConfigError(`MONGODB_URI in ${envPath} still contains placeholders like <username>. Replace them with your real MongoDB Atlas values.`);
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) throw new ConfigError('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  if (env.mongoUser && env.mongoPassword && !uri.includes("@")) {
    const cred = `${encodeURIComponent(env.mongoUser)}:${encodeURIComponent(env.mongoPassword)}@`;
    uri = uri.replace(/^(mongodb(?:\+srv)?:\/\/)/, `$1${cred}`);
  }
  return uri;
}

/** Turn a driver error into a plain-language cause. Never includes the connection string. */
export function explainMongoError(err: any): string {
  if (err instanceof ConfigError) return err.message;
  const m = String(err?.message || err);
  if (/bad auth|authentication failed|AuthenticationFailed/i.test(m)) return "Authentication failed: check the database username and password (URL-encode special characters in the password).";
  if (/ENOTFOUND|querySrv|EAI_AGAIN/i.test(m)) return "DNS lookup failed: check the cluster host name in MONGODB_URI and your internet connection.";
  if (/ECONNREFUSED/i.test(m)) return "Connection refused: the MongoDB server is not running at that address/port.";
  if (/Server selection timed out|ReplicaSetNoPrimary|ETIMEDOUT/i.test(m)) return "Could not reach the server in time: on MongoDB Atlas, add your IP address under Network Access (or check the cluster is running).";
  if (/Invalid (scheme|connection string)/i.test(m)) return "MONGODB_URI is malformed.";
  return m;
}

let connecting: Promise<typeof mongoose> | null = null;

/** Idempotent: reuses the open connection (Mongoose pools sockets) and never opens a second one. */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  connecting ??= mongoose
    .connect(resolveUri(), { serverSelectionTimeoutMS: 10_000, ...(env.dbName ? { dbName: env.dbName } : {}) })
    .finally(() => { connecting = null; });
  return connecting;
}

export const dbState = (): string => (["disconnected", "connected", "connecting", "disconnecting"] as string[])[mongoose.connection.readyState] ?? "unknown";

export async function disconnectDB() {
  await mongoose.disconnect();
}

let wasConnected = false;
mongoose.connection.on("connected", () => { wasConnected = true; });
mongoose.connection.on("disconnected", () => wasConnected && console.warn("! MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("✓ MongoDB reconnected"));
mongoose.connection.on("error", (e) => console.error("✗ MongoDB error:", explainMongoError(e)));
