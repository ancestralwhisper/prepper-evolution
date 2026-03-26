import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Strip trailing slashes — redirect /articles/slug/ → /articles/slug
  app.use((req, res, next) => {
    if (req.path !== '/' && req.path.endsWith('/')) {
      const newPath = req.path.slice(0, -1);
      const query = req.url.slice(req.path.length);
      return res.redirect(301, newPath + query);
    }
    next();
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
