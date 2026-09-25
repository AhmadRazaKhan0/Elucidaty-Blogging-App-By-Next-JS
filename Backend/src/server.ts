import app from "./app";
import { connectDB, disconnectDB, explainMongoError } from "./config/db";
import { env } from "./config/env";

async function main() {
  try {
    await connectDB();
  } catch (e) {
    console.error("✗ MongoDB connection failed");
    console.error("  Reason:", explainMongoError(e));
    process.exit(1);
  }
  console.log("✓ MongoDB connected successfully");
  const server = app.listen(env.port, () => console.log(`✓ Backend server running on http://localhost:${env.port}`));
  server.on("error", (e: NodeJS.ErrnoException) => {
    console.error(e.code === "EADDRINUSE"
      ? `✗ Port ${env.port} is already in use by another program. Stop it (Windows: netstat -ano | findstr :${env.port}), or set a different PORT in Backend/.env and update NEXT_PUBLIC_API_URL in the frontend.`
      : `✗ Server error: ${e.message}`);
    process.exit(1);
  });
  const stop = () => server.close(() => disconnectDB().finally(() => process.exit(0)));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

process.on("unhandledRejection", (r) => console.error("Unhandled rejection:", r));
main();
