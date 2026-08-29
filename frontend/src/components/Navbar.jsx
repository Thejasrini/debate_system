import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { submitFeedbackApi } from "../services/feedbackApi";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, accessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState("");
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).toUpperCase() + " " + now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) + " IST";
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackRating) return;
    try {
      await submitFeedbackApi(null, 0, feedbackRating, feedbackComment, accessToken);
      setFeedbackDone(true);
    } catch (err) {
      console.warn("Feedback submission warning:", err);
      setFeedbackDone(true);
    }
  };

  const brandDestination = user
    ? user.role === "admin"
      ? "/admin"
      : "/courtroom"
    : "/";

  return (
    <>
      <header
        className="docket-topbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          width: "100%",
          maxWidth: "100vw",
          padding: "10px 24px",
          borderBottom: "1px solid var(--line)",
          backgroundColor: "var(--surface)",
          boxSizing: "border-box"
        }}
      >
        {/* Left Title & Status Pill Group */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {user && (
            <button
              onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
              className="btn-outline-brass font-mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "0.82rem",
                cursor: "pointer",
                flexShrink: 0
              }}
              title="Toggle Navigation Menu"
            >
              {isNavDrawerOpen ? "✕ Close" : "☰ Menu"}
            </button>
          )}

          <Link to={brandDestination} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 className="font-serif text-brass" style={{ fontSize: "1.05rem", margin: 0, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
              ⚖️ LEXAGENT COURTROOM
            </h1>
          </Link>

          <span
            className="font-mono text-brass"
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: "bold",
              backgroundColor: "var(--brass-light)",
              border: "1px solid var(--line-bright)",
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
          >
            CPA/2019/0847
          </span>

          <span
            className="font-mono"
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "0.72rem",
              fontWeight: "bold",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "var(--support-green-bright)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
          >
            ● CASE ACTIVE
          </span>
        </div>

        {/* Right Group - Clock, Theme Toggle & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", whiteSpace: "nowrap", flexShrink: 0 }}>
          <span className="font-mono text-muted" style={{ fontSize: "0.75rem", opacity: 0.85, flexShrink: 0 }}>
            {currentTime}
          </span>

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn font-mono"
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
              color: "var(--ink)",
              fontSize: "0.82rem",
              cursor: "pointer",
              flexShrink: 0
            }}
            title="Toggle Dark/Light Mode"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="font-mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--line)",
                backgroundColor: "transparent",
                color: "#f87171",
                fontSize: "0.82rem",
                fontWeight: "600",
                cursor: "pointer",
                flexShrink: 0
              }}
              title="Sign Out of Session"
            >
              🚪 Logout
            </button>
          )}
        </div>
      </header>

      {/* LEFT NAVIGATION SIDE DRAWER */}
      {isNavDrawerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9998,
            display: "flex",
            justifyContent: "flex-start"
          }}
          onClick={() => setIsNavDrawerOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "320px",
              height: "100%",
              backgroundColor: "var(--surface)",
              borderRight: "1px solid var(--line-bright)",
              padding: "24px",
              boxShadow: "10px 0 30px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "14px" }}>
              <h3 className="font-serif text-brass" style={{ margin: 0, fontSize: "1.1rem" }}>
                ⚖️ Courtroom Menu
              </h3>
              <button
                onClick={() => setIsNavDrawerOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => { setIsNavDrawerOpen(false); navigate("/courtroom"); }}
                className="btn-outline-brass font-mono"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>⚖️</span> Courtroom Terminal
              </button>

              <button
                onClick={() => { setIsNavDrawerOpen(false); navigate("/dashboard"); }}
                className="btn-outline-brass font-mono"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>📊</span> Case Dashboard
              </button>

              <button
                onClick={() => { setIsNavDrawerOpen(false); navigate("/profile"); }}
                className="btn-outline-brass font-mono"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>👤</span> Account Profile
              </button>

              <button
                onClick={() => { setIsNavDrawerOpen(false); navigate("/about-us"); }}
                className="btn-outline-brass font-mono"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>ℹ️</span> About Us
              </button>

              {user?.role === "admin" && (
                <button
                  onClick={() => { setIsNavDrawerOpen(false); navigate("/admin"); }}
                  className="btn-outline-brass font-mono"
                  style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
                >
                  <span>👑</span> Admin Analytics
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--line-bright)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
              <h3 className="font-serif text-brass" style={{ margin: 0, fontSize: "1.2rem" }}>
                💬 System Feedback & Audit
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {feedbackDone ? (
              <p className="font-mono text-brass" style={{ fontSize: "0.9rem", margin: 0, textAlign: "center", padding: "20px 0" }}>
                ✓ Thank you! Your feedback has been recorded for system alignment.
              </p>
            ) : (
              <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p className="font-mono text-muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                  Help us improve LexAgent by rating accuracy and legal reasoning quality:
                </p>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setFeedbackRating("thumbs_up")}
                    className="font-mono"
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: feedbackRating === "thumbs_up" ? "2px solid var(--support-green)" : "1px solid var(--line)",
                      backgroundColor: feedbackRating === "thumbs_up" ? "var(--support-bg)" : "var(--bg)",
                      color: feedbackRating === "thumbs_up" ? "var(--support-green-bright)" : "var(--ink-muted)",
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    👍 Accurate
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackRating("thumbs_down")}
                    className="font-mono"
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: feedbackRating === "thumbs_down" ? "2px solid var(--oppose-oxblood)" : "1px solid var(--line)",
                      backgroundColor: feedbackRating === "thumbs_down" ? "var(--oppose-bg)" : "var(--bg)",
                      color: feedbackRating === "thumbs_down" ? "var(--oppose-oxblood-bright)" : "var(--ink-muted)",
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    👎 Inaccurate
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Optional comments on statutory reasoning or citation accuracy..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    backgroundColor: "var(--bg)",
                    color: "var(--ink)",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />

                <button
                  type="submit"
                  disabled={!feedbackRating}
                  className="btn-brass font-mono"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "0.88rem",
                    fontWeight: "bold",
                    opacity: !feedbackRating ? 0.5 : 1
                  }}
                >
                  Submit Feedback →
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
