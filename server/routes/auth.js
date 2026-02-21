import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password, displayName } = req.body;

  if (!username || !password || !displayName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db.prepare(
    "INSERT INTO users (username, display_name, password_hash) VALUES (?, ?, ?)"
  ).run(username, displayName.trim(), passwordHash);

  req.session.userId = result.lastInsertRowid;
  req.session.displayName = displayName.trim();

  res.json({ id: result.lastInsertRowid, displayName: displayName.trim() });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  req.session.userId = user.id;
  req.session.displayName = user.display_name;

  res.json({ id: user.id, displayName: user.display_name });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ id: req.session.userId, displayName: req.session.displayName });
});

export default router;
