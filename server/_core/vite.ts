import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";

export async function setupVite(app: Express, server: Server) {
  // Lazy imports — only needed in dev, not available in production
  const { nanoid } = await import("nanoid");
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await import("../../vite.config")).default;

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible locations for the built frontend
  const candidates = [
    path.resolve(import.meta.dirname, "public"),
    path.resolve(import.meta.dirname, "..", "..", "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
  ];
  let distPath = candidates.find(p => fs.existsSync(path.join(p, "index.html")));
  
  if (!distPath) {
    // Fallback: serve client source directly (last resort)
    const clientPath = path.resolve(process.cwd(), "client");
    if (fs.existsSync(path.join(clientPath, "index.html"))) {
      console.log(`Falling back to client directory: ${clientPath}`);
      app.use(express.static(clientPath));
      app.use("*", (_req, res) => res.sendFile(path.join(clientPath, "index.html")));
      return;
    }
    console.error("No static files found at any location");
    distPath = candidates[0]; // will 404 but won't crash
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
