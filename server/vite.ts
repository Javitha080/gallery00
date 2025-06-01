import express, { type Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server?: Server) {
  log("Setting up Vite in development mode", "vite");
  
  try {
    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          log(`Vite error: ${msg}`, "vite-error");
          // Don't exit the process on error, just log it
          // process.exit(1);
        },
      },
      server: {
        middlewareMode: true,
        hmr: server ? { server } : true,
        allowedHosts: true,
      },
      appType: "custom",
    });

    app.use(vite.middlewares);
    
    // Debug middleware to log client-side routing requests
    app.use((req, res, next) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/@') && !req.path.includes('.')) {
        log(`Client-side route request: ${req.method} ${req.originalUrl}`, "routing");
      }
      next();
    });

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      // Skip API routes
      if (url.startsWith('/api')) {
        return next();
      }

      try {
        const clientTemplate = path.resolve(
          import.meta.dirname,
          "..",
          "client",
          "index.html",
        );

        // Check if the template exists
        if (!fs.existsSync(clientTemplate)) {
          log(`Template file not found: ${clientTemplate}`, "vite-error");
          return next(new Error(`Template file not found: ${clientTemplate}`));
        }

        // Always reload the index.html file from disk in case it changes
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        log(`Error serving client template: ${(e as Error).message}`, "vite-error");
        next(e);
      }
    });
  } catch (error) {
    log(`Failed to initialize Vite: ${(error as Error).message}`, "vite-error");
    throw error;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  log(`Serving static files from: ${distPath}`, "static");

  if (!fs.existsSync(distPath)) {
    const errorMessage = `Could not find the build directory: ${distPath}, make sure to build the client first`;
    log(errorMessage, "static-error");
    throw new Error(errorMessage);
  }

  // Serve static files with proper caching
  app.use(express.static(distPath, {
    etag: true,
    lastModified: true,
    maxAge: '1d', // Cache for 1 day
    immutable: true,
    index: false // Don't serve index.html automatically
  }));

  // Debug middleware to log client-side routing requests
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.includes('.')) {
      log(`Client-side route request: ${req.method} ${req.originalUrl}`, "routing");
    }
    next();
  });

  // Fall through to index.html for client-side routing
  app.use("*", (req, res, next) => {
    const indexPath = path.resolve(distPath, "index.html");
    
    if (!fs.existsSync(indexPath)) {
      log(`Index file not found: ${indexPath}`, "static-error");
      return next(new Error(`Index file not found: ${indexPath}`));
    }
    
    log(`Serving index.html for: ${req.originalUrl}`, "routing");
    res.sendFile(indexPath);
  });
}
