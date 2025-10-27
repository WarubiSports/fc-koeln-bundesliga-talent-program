import { Router } from "express";
import { requireAuth } from "../auth/requireAuth";
const router = Router();
router.get("/v1/me", requireAuth, (req, res) => {
  // @ts-ignore
  res.json({ ok: true, me: req.user });
});
export default router;
