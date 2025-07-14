// server/minimal.ts
import express from "express";
import { createServer } from "http";
var app = express();
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
var port = process.env.PORT || 5e3;
createServer(app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
