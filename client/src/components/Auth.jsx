import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";

const fonts = {
  display: "'Playfair Display', 'Georgia', serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
  accent: "'Caveat', cursive",
};

const bg = "#fdf2e9";
const textMain = "#3d2c2c";
const textSoft = "#8a7575";
const accent = "#c97b6b";

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password, displayName);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: bg, fontFamily: fonts.body, color: textMain,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
        <h1 style={{
          fontFamily: fonts.display, fontSize: 32, fontWeight: 600,
          color: textMain, margin: "0 0 6px 0", letterSpacing: -0.5,
        }}>
          The Love Vault
        </h1>
        <p style={{
          fontFamily: fonts.accent, fontSize: 17, color: textSoft,
          margin: "0 0 36px 0",
        }}>
          Evidence that we love each other, even when we forget
        </p>

        {/* Tab toggle */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 24, background: "rgba(255,255,255,0.5)",
          borderRadius: 12, padding: 4,
        }}>
          {[["login", "Sign In"], ["register", "Create Account"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
              background: mode === m ? "#fff" : "transparent",
              boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              color: mode === m ? textMain : textSoft,
              fontFamily: fonts.body, fontSize: 14, fontWeight: mode === m ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "rgba(255, 255, 255, 0.72)", borderRadius: 20, padding: 28,
          border: "1px solid rgba(201,123,107,0.12)",
          backdropFilter: "blur(10px)", textAlign: "left",
        }}>
          {mode === "register" && (
            <>
              <label style={{
                fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: textSoft,
                display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1,
              }}>
                Your name (shown in entries)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Lydia"
                required
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12,
                  border: "2px solid #e8ddd6", background: "rgba(255,255,255,0.6)",
                  fontFamily: fonts.body, fontSize: 15, color: textMain,
                  outline: "none", boxSizing: "border-box", marginBottom: 16,
                }}
                onFocus={(e) => e.target.style.borderColor = accent}
                onBlur={(e) => e.target.style.borderColor = "#e8ddd6"}
              />
            </>
          )}

          <label style={{
            fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: textSoft,
            display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1,
          }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            autoComplete="username"
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              border: "2px solid #e8ddd6", background: "rgba(255,255,255,0.6)",
              fontFamily: fonts.body, fontSize: 15, color: textMain,
              outline: "none", boxSizing: "border-box", marginBottom: 16,
            }}
            onFocus={(e) => e.target.style.borderColor = accent}
            onBlur={(e) => e.target.style.borderColor = "#e8ddd6"}
          />

          <label style={{
            fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: textSoft,
            display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1,
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              border: "2px solid #e8ddd6", background: "rgba(255,255,255,0.6)",
              fontFamily: fonts.body, fontSize: 15, color: textMain,
              outline: "none", boxSizing: "border-box", marginBottom: 20,
            }}
            onFocus={(e) => e.target.style.borderColor = accent}
            onBlur={(e) => e.target.style.borderColor = "#e8ddd6"}
          />

          {error && (
            <p style={{
              color: "#c0392b", fontFamily: fonts.body, fontSize: 14,
              marginBottom: 16, textAlign: "center",
            }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "14px 0", borderRadius: 12,
            border: "none", cursor: loading ? "default" : "pointer",
            background: accent, color: "#fff",
            fontFamily: fonts.body, fontSize: 15, fontWeight: 600,
            transition: "all 0.2s", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "..." : mode === "login" ? "Enter the Vault" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
