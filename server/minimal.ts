import express from "express";
import { createServer } from "http";

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 5000;
createServer(app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
