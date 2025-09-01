import express from "express";

const app = express();
const port = process.env.PORT || 3000;

// Example route
app.get("/", (_req, res) => {
  res.send("Server is up ✅");
});

// Health check route (optional, good for monitoring)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
