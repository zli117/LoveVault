import express from "express";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import entriesRoutes from "./routes/entries.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQLiteStore = connectSqlite3(session);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: process.env.DATA_DIR || join(__dirname, "..", "data"),
    }),
    secret: process.env.SESSION_SECRET || "lovevault-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // set to true if using HTTPS
      sameSite: "lax",
    },
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/entries", entriesRoutes);

// In production, serve the built client
if (process.env.NODE_ENV === "production") {
  const clientDist = join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LoveVault server running on http://0.0.0.0:${PORT}`);
});
