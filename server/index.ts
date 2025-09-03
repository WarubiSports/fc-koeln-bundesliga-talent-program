import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Serve the built client (static files)
const clientDist = path.resolve(__dirname, "../client-dist");
console.log("[startup] Serving client from:", clientDist);
app.use(express.static(clientDist));

// SPA fallback (Express 5 safe)
app.get(/.*/, (_req: Request, res: Response, next: NextFunction) => {
  const indexFile = path.join(clientDist, "index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  next(new Error(`index.html not found at ${indexFile}`));
});

// Global error handler
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("🔥 SERVER ERROR:", err?.stack || err);
    res
      .status(500)
      .send("Internal Server Error: " + (err.message || "Unknown error"));
  }
);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});