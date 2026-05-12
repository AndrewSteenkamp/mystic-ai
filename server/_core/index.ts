import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ensureDummyUser, insertSampleProfiles } from "../db";

async function startServer() {
  // Ensure dummy user exists for standalone mode (non-fatal if DB fails)
  try {
    ensureDummyUser();
    insertSampleProfiles();
  } catch (e) {
    console.error("DB init failed (non-fatal):", e);
  }

  const app = express();
  const server = createServer(app);

  // Body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check for Railway
  app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString(), hasDeepSeek: !!process.env.DEEPSEEK_API_KEY, keyLen: (process.env.DEEPSEEK_API_KEY || "").length, buildId: "2105-may12-2" }));

  // Debug: show filesystem to help diagnose static file issues
  app.get("/debug-files", (_req, res) => {
    const fs = require("fs");
    const path = require("path");
    const cwd = process.cwd();
    const files: string[] = [];
    function walk(dir: string, depth: number) {
      if (depth > 3) return;
      try {
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry);
          files.push(full.replace(cwd, ""));
          if (fs.statSync(full).isDirectory() && depth < 3) walk(full, depth + 1);
        }
      } catch {}
    }
    walk(cwd, 0);
    res.json({ cwd, files });
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3001");

  server.listen(port, () => {
    console.log(`🔮 Mystic AI running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
