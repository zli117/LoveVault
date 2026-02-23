import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext.jsx";
import { entries as entriesApi, auth as authApi } from "../api.js";

const CATEGORIES = [
  { id: "sacrifice", emoji: "🛡️", label: "Sacrifices", color: "#e8b4b8" },
  { id: "care", emoji: "💛", label: "Daily Care", color: "#f0d9a0" },
  { id: "surprise", emoji: "✨", label: "Sweet Moments", color: "#b8d4e3" },
  { id: "support", emoji: "🤝", label: "Support", color: "#c3d9c6" },
  { id: "patience", emoji: "🕊️", label: "Patience", color: "#d4c5e2" },
];

// Warm, hand-crafted font stack
const fonts = {
  display: "'Playfair Display', 'Georgia', serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
  accent: "'Caveat', cursive",
};

function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= breakpoint
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isDesktop;
}

export default function LoveVault() {
  const { user, logout } = useAuth();
  const isDesktop = useIsDesktop();
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("home"); // home, add, sos
  const [newEntry, setNewEntry] = useState({ text: "", category: "care" });
  const [sosIndex, setSosIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [loadingDone, setLoadingDone] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [showAccount, setShowAccount] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const sosOrderRef = useRef([]);

  // Load entries from API
  useEffect(() => {
    entriesApi.list()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoadingDone(true));
  }, []);

  const addEntry = async () => {
    if (!newEntry.text.trim()) return;
    try {
      const entry = await entriesApi.create(newEntry.text, newEntry.category);
      setEntries((prev) => [entry, ...prev]);
      setNewEntry({ text: "", category: "care" });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (e) {
      console.error("Failed to save:", e);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await entriesApi.remove(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  const enterSOS = () => {
    if (entries.length === 0) return;
    sosOrderRef.current = [...entries].sort(() => Math.random() - 0.5);
    setSosIndex(0);
    setFadeIn(true);
    setView("sos");
  };

  const nextSOS = () => {
    setFadeIn(false);
    setTimeout(() => {
      setSosIndex((i) => (i + 1) % sosOrderRef.current.length);
      setFadeIn(true);
    }, 300);
  };

  const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[1];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const filteredEntries = filterCat === "all" ? entries : entries.filter((e) => e.category === filterCat);

  // --- STYLES ---
  const bg = "#fdf2e9";
  const cardBg = "rgba(255, 255, 255, 0.45)";
  const textMain = "#3d2c2c";
  const textSoft = "#8a7575";
  const accent = "#c97b6b";

  if (!loadingDone) {
    return (
      <div style={{ minHeight: "100vh", background: "#fdf2e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: fonts.accent, fontSize: 24, color: textSoft }}>Loading your memories...</p>
      </div>
    );
  }

  // =================== SOS MODE ===================
  if (view === "sos") {
    const sosEntries = sosOrderRef.current;
    const entry = sosEntries[sosIndex % sosEntries.length];
    if (!entry) { setView("home"); return null; }
    const cat = getCat(entry.category);

    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(160deg, #2c1e1e 0%, #3d2828 50%, #2a1f2f 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", fontFamily: fonts.body,
      }}>
        <p style={{
          fontFamily: fonts.accent, fontSize: 18, color: "rgba(255,200,180,0.5)",
          marginBottom: 12, letterSpacing: 1,
        }}>
          Take a breath. Remember this:
        </p>

        <div style={{
          background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)",
          borderRadius: 24, padding: "48px 36px", maxWidth: 440, width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: fadeIn ? 1 : 0, transition: "opacity 0.3s ease",
          textAlign: "center",
        }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>{cat.emoji}</span>
          <p style={{
            fontFamily: fonts.display, fontSize: 22, lineHeight: 1.6,
            color: "#f5e6da", marginBottom: 20, fontWeight: 400,
          }}>
            &ldquo;{entry.text}&rdquo;
          </p>
          <p style={{
            fontFamily: fonts.accent, fontSize: 16, color: "rgba(255,200,180,0.45)",
          }}>
            — recorded by {entry.author_name}, {formatDate(entry.created_at)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
          <button onClick={nextSOS} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#f5e6da", padding: "12px 32px", borderRadius: 50,
            fontFamily: fonts.body, fontSize: 15, cursor: "pointer",
            transition: "all 0.2s",
          }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.18)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
          >
            Show me another 💫
          </button>
          <button onClick={() => setView("home")} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,200,180,0.4)", padding: "12px 24px", borderRadius: 50,
            fontFamily: fonts.body, fontSize: 14, cursor: "pointer",
          }}>
            I feel better
          </button>
        </div>

        <p style={{
          fontFamily: fonts.accent, fontSize: 14, color: "rgba(255,200,180,0.25)",
          marginTop: 40,
        }}>
          {sosIndex + 1} of {sosEntries.length} memories
        </p>
      </div>
    );
  }

  // =================== SHARED PANELS ===================
  const browsePanel = (
    <div style={{ padding: isDesktop ? 0 : "0 28px" }}>
      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        <button onClick={() => setFilterCat("all")} style={{
          padding: "6px 14px", borderRadius: 20, border: "none",
          background: filterCat === "all" ? accent : "rgba(255,255,255,0.5)",
          color: filterCat === "all" ? "#fff" : textSoft,
          fontFamily: fonts.body, fontSize: 13, cursor: "pointer",
        }}>All ({entries.length})</button>
        {CATEGORIES.map((cat) => {
          const count = entries.filter((e) => e.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none",
              background: filterCat === cat.id ? cat.color : "rgba(255,255,255,0.5)",
              color: filterCat === cat.id ? textMain : textSoft,
              fontFamily: fonts.body, fontSize: 13, cursor: "pointer",
            }}>
              {cat.emoji} {count}
            </button>
          );
        })}
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: cardBg, borderRadius: 20,
        }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📝</p>
          <p style={{ fontFamily: fonts.display, fontSize: 18, color: textMain, marginBottom: 8 }}>
            No memories yet
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: textSoft }}>
            Start adding the little things you do for each other
          </p>
          {!isDesktop && (
            <button onClick={() => setView("add")} style={{
              marginTop: 16, padding: "10px 24px", borderRadius: 10,
              border: "none", background: accent, color: "#fff",
              fontFamily: fonts.body, fontSize: 14, cursor: "pointer",
            }}>
              Add your first memory
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredEntries.map((entry) => {
            const cat = getCat(entry.category);
            return (
              <div key={entry.id} style={{
                background: cardBg, borderRadius: 16, padding: "20px 22px",
                border: "1px solid rgba(201,123,107,0.08)",
                borderLeft: `4px solid ${cat.color}`,
                transition: "transform 0.15s",
                position: "relative",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                    <span style={{
                      fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
                      color: textSoft, textTransform: "uppercase", letterSpacing: 0.5,
                    }}>
                      {cat.label}
                    </span>
                  </div>
                  <button onClick={() => deleteEntry(entry.id)} style={{
                    background: "none", border: "none", color: "#d4c5c5",
                    cursor: "pointer", fontSize: 16, padding: "0 4px",
                  }} title="Delete">×</button>
                </div>
                <p style={{
                  fontFamily: fonts.body, fontSize: 15, lineHeight: 1.65,
                  color: textMain, margin: "0 0 12px 0",
                }}>
                  {entry.text}
                </p>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{
                    fontFamily: fonts.accent, fontSize: 14, color: textSoft,
                  }}>
                    — {entry.author_name}
                  </span>
                  <span style={{
                    fontFamily: fonts.body, fontSize: 12, color: "#c4b5b5",
                  }}>
                    {formatDate(entry.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const addPanel = (
    <div style={{ padding: isDesktop ? 0 : "0 28px" }}>
      <div style={{
        background: cardBg, borderRadius: 20, padding: 28,
        border: "1px solid rgba(201,123,107,0.08)",
        ...(isDesktop ? { position: "sticky", top: 28 } : {}),
      }}>
        <div style={{
          fontFamily: fonts.accent, fontSize: 16, color: accent,
          marginBottom: 20, textAlign: "center",
        }}>
          Writing as {user.displayName} 💕
        </div>

        <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: textSoft, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Category
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setNewEntry({ ...newEntry, category: cat.id })} style={{
              padding: "8px 14px", borderRadius: 20,
              border: newEntry.category === cat.id ? `2px solid ${accent}` : "2px solid #e8ddd6",
              background: newEntry.category === cat.id ? cat.color + "40" : "transparent",
              color: newEntry.category === cat.id ? textMain : textSoft,
              fontFamily: fonts.body, fontSize: 13, cursor: "pointer",
              transition: "all 0.15s",
            }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: textSoft, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          What happened?
        </label>
        <textarea
          value={newEntry.text}
          onChange={(e) => setNewEntry({ ...newEntry, text: e.target.value })}
          placeholder="e.g. She went to sleep on the couch so I wouldn't be woken up by her teeth grinding, even though the couch is uncomfortable..."
          style={{
            width: "100%", minHeight: 120, padding: 16, borderRadius: 14,
            border: "2px solid #e8ddd6", background: "rgba(255,255,255,0.6)",
            fontFamily: fonts.body, fontSize: 15, color: textMain, lineHeight: 1.6,
            resize: "vertical", outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = accent}
          onBlur={(e) => e.target.style.borderColor = "#e8ddd6"}
        />

        <button onClick={addEntry} disabled={!newEntry.text.trim()}
          style={{
            width: "100%", padding: "14px 0", marginTop: 16, borderRadius: 12,
            border: "none", cursor: !newEntry.text.trim() ? "default" : "pointer",
            background: !newEntry.text.trim() ? "#e8ddd6" : accent,
            color: !newEntry.text.trim() ? textSoft : "#fff",
            fontFamily: fonts.body, fontSize: 15, fontWeight: 600,
            transition: "all 0.2s",
          }}
        >
          {justAdded ? "✓ Saved with love!" : "Save to the Vault 💝"}
        </button>
      </div>
    </div>
  );

  // =================== MAIN LAYOUT ===================
  return (
    <div style={{
      minHeight: "100vh", background: bg, fontFamily: fonts.body, color: textMain,
    }}>
      {/* Account Modal */}
      {showAccount && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", display: "flex",
          alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 24,
        }} onClick={() => setShowAccount(false)}>
          <div style={{
            background: "#fdf2e9", borderRadius: 20, padding: 32,
            maxWidth: 380, width: "100%",
            border: "1px solid rgba(201,123,107,0.12)",
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              fontFamily: fonts.display, fontSize: 22, fontWeight: 600,
              color: textMain, margin: "0 0 4px 0", textAlign: "center",
            }}>
              Account
            </h2>
            <p style={{
              fontFamily: fonts.accent, fontSize: 15, color: textSoft,
              textAlign: "center", marginBottom: 24,
            }}>
              Signed in as {user.displayName}
            </p>

            <label style={{
              fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: textSoft,
              display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1,
            }}>
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                border: "2px solid #e8ddd6", background: "rgba(255,255,255,0.6)",
                fontFamily: fonts.body, fontSize: 15, color: textMain,
                outline: "none", boxSizing: "border-box", marginBottom: 12,
              }}
              onFocus={(e) => e.target.style.borderColor = accent}
              onBlur={(e) => e.target.style.borderColor = "#e8ddd6"}
            />

            <label style={{
              fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: textSoft,
              display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1,
            }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                border: "2px solid #e8ddd6", background: "rgba(255,255,255,0.6)",
                fontFamily: fonts.body, fontSize: 15, color: textMain,
                outline: "none", boxSizing: "border-box", marginBottom: 16,
              }}
              onFocus={(e) => e.target.style.borderColor = accent}
              onBlur={(e) => e.target.style.borderColor = "#e8ddd6"}
            />

            {pwMsg && (
              <p style={{
                fontFamily: fonts.body, fontSize: 14, textAlign: "center",
                marginBottom: 12,
                color: pwMsg.includes("updated") ? "#27ae60" : "#c0392b",
              }}>
                {pwMsg}
              </p>
            )}

            <button onClick={async () => {
              if (newPassword.length < 4) {
                setPwMsg("Password must be at least 4 characters");
                return;
              }
              if (newPassword !== confirmPassword) {
                setPwMsg("Passwords don't match");
                return;
              }
              try {
                await authApi.changePassword(newPassword);
                setPwMsg("Password updated!");
                setNewPassword("");
                setConfirmPassword("");
              } catch (e) {
                setPwMsg(e.message);
              }
            }} style={{
              width: "100%", padding: "14px 0", borderRadius: 12,
              border: "none", cursor: "pointer",
              background: accent, color: "#fff",
              fontFamily: fonts.body, fontSize: 15, fontWeight: 600,
              marginBottom: 12,
            }}>
              Change password
            </button>

            <button onClick={() => setShowAccount(false)} style={{
              width: "100%", padding: "10px 0", borderRadius: 12,
              border: "1px solid #e8ddd6", background: "transparent",
              color: textSoft, fontFamily: fonts.body, fontSize: 14, cursor: "pointer",
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "48px 28px 32px", textAlign: "center",
        background: "transparent",
        position: "relative",
        maxWidth: isDesktop ? 900 : 480,
        margin: "0 auto",
      }}>
        <div style={{
          position: "absolute", top: 20, right: 20,
          display: "flex", gap: 8,
        }}>
          <button onClick={() => { setShowAccount(true); setPwMsg(""); setNewPassword(""); setConfirmPassword(""); }} style={{
            background: "rgba(255,255,255,0.5)", border: "1px solid #e8ddd6",
            color: textSoft, padding: "6px 14px", borderRadius: 20,
            fontFamily: fonts.body, fontSize: 12, cursor: "pointer",
          }}>
            Account
          </button>
          <button onClick={logout} style={{
            background: "rgba(255,255,255,0.5)", border: "1px solid #e8ddd6",
            color: textSoft, padding: "6px 14px", borderRadius: 20,
            fontFamily: fonts.body, fontSize: 12, cursor: "pointer",
          }}>
            Sign out
          </button>
        </div>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏠</div>
        <h1 style={{
          fontFamily: fonts.display, fontSize: 28, fontWeight: 600,
          color: textMain, margin: "0 0 6px 0", letterSpacing: -0.5,
        }}>
          The Love Vault
        </h1>
        <p style={{
          fontFamily: fonts.accent, fontSize: 17, color: textSoft,
          margin: 0,
        }}>
          Evidence that we love each other, even when we forget
        </p>
      </div>

      {/* SOS Button */}
      <div style={{
        padding: "0 28px", marginBottom: 28,
        maxWidth: isDesktop ? 900 : 480,
        margin: "0 auto 28px",
      }}>
        <button onClick={enterSOS} disabled={entries.length === 0} style={{
          width: "100%", padding: "18px 24px",
          background: entries.length === 0 ? "#e8ddd6" : "linear-gradient(135deg, #c97b6b 0%, #b5686a 50%, #a05f7a 100%)",
          border: "none", borderRadius: 16, cursor: entries.length === 0 ? "default" : "pointer",
          color: entries.length === 0 ? textSoft : "#fff",
          fontFamily: fonts.body, fontSize: 16, fontWeight: 600,
          letterSpacing: 0.3, transition: "transform 0.15s, box-shadow 0.15s",
          boxShadow: entries.length > 0 ? "0 4px 20px rgba(201,123,107,0.3)" : "none",
        }}
          onMouseEnter={(e) => { if (entries.length > 0) { e.target.style.transform = "scale(1.02)"; } }}
          onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
        >
          {entries.length === 0 ? "Add some memories first ✍️" : "🆘 I'm upset — remind me we're okay"}
        </button>
      </div>

      {/* Content area */}
      {isDesktop ? (
        /* Desktop: two columns, no tabs */
        <div style={{
          maxWidth: 900, margin: "0 auto", padding: "0 28px 100px",
          display: "flex", gap: 32, alignItems: "flex-start",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {browsePanel}
          </div>
          <div style={{ width: 340, flexShrink: 0 }}>
            {addPanel}
          </div>
        </div>
      ) : (
        /* Mobile: tabbed layout */
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 100px 0" }}>
          <div style={{
            display: "flex", gap: 0, margin: "0 28px 24px", background: "rgba(255,255,255,0.5)",
            borderRadius: 12, padding: 4,
          }}>
            {[["home", "📖 Browse"], ["add", "✍️ Add New"]].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
                background: view === v ? "#fff" : "transparent",
                boxShadow: view === v ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                color: view === v ? textMain : textSoft,
                fontFamily: fonts.body, fontSize: 14, fontWeight: view === v ? 600 : 400,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {label}
              </button>
            ))}
          </div>

          {view === "home" && browsePanel}
          {view === "add" && addPanel}
        </div>
      )}
    </div>
  );
}
