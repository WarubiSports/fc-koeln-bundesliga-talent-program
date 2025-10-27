import { Router } from "express";

const router = Router();

// Only /healthz here. v1 ping lives in the v1 router.
router.get("/healthz", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

export default router;
