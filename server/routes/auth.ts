import { Router } from "express";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }
  // In production: verify JWT or user record here
  res.json({ ok: true, user: { email }, token: "FAKE_JWT_TOKEN" });
});

router.post("/auth/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  // In production: insert new user record here
  res.status(201).json({ ok: true, user: { email } });
});

export default router;
