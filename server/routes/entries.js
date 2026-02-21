import { Router } from "express";
import db from "../db.js";

const router = Router();

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

router.use(requireAuth);

router.get("/", (req, res) => {
  const entries = db.prepare(
    "SELECT id, text, category, author_name, author_id, created_at FROM entries ORDER BY created_at DESC"
  ).all();
  res.json(entries);
});

router.post("/", (req, res) => {
  const { text, category } = req.body;

  if (!text || !category) {
    return res.status(400).json({ error: "Text and category are required" });
  }

  const result = db.prepare(
    "INSERT INTO entries (text, category, author_name, author_id) VALUES (?, ?, ?, ?)"
  ).run(text, category, req.session.displayName, req.session.userId);

  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(result.lastInsertRowid);
  res.json(entry);
});

router.delete("/:id", (req, res) => {
  const entry = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: "Entry not found" });
  }

  db.prepare("DELETE FROM entries WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

export default router;
