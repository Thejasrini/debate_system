import React, { useState } from "react";
import Navbar from "../components/Navbar";
import ErrorBanner from "../components/ErrorBanner";
import { submitFeedbackApi } from "../services/feedbackApi";
import { useAuth } from "../context/AuthContext";

export default function AboutUs() {
  const { accessToken } = useAuth();

  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setLoading(true);
    setError(null);
    try {
      await submitFeedbackApi("general", 0, rating, comment, accessToken);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "960px", margin: "0 auto", padding: "40px 24px", width: "100%", boxSizing: "border-box" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span
            className="font-mono text-brass"
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "20px",
              backgroundColor: "var(--brass-light)",
              border: "1px solid var(--line-bright)",
              fontSize: "0.78rem",
              fontWeight: "bold",
              marginBottom: "12px"
            }}
          >
            ℹ️ ABOUT LEXAGENT
          </span>

          <h1 className="font-serif text-brass" style={{ fontSize: "2.4rem", margin: "4px 0 10px 0", letterSpacing: "0.5px" }}>
            About LexAgent Legal Intelligence
          </h1>

          <p className="font-serif text-muted" style={{ fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: "1.6" }}>
            Autonomous Multi-Agent Adversarial Debate & Adjudication System under the Consumer Protection Act, 2019.
          </p>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        {/* Shorter App Overview Card */}
        <div
          style={{
            padding: "28px",
            borderRadius: "14px",
            border: "1px solid var(--line)",
            borderTop: "4px solid var(--brass)",
            backgroundColor: "var(--surface)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
            marginBottom: "28px"
          }}
        >
          <h2 className="font-serif text-brass" style={{ fontSize: "1.3rem", margin: "0 0 12px 0" }}>
            ⚖️ Platform Overview
          </h2>
          <p className="font-sans text-muted" style={{ fontSize: "0.95rem", lineHeight: "1.7", margin: "0 0 16px 0" }}>
            LexAgent is an AI-powered legal intelligence platform designed to streamline statutory consumer dispute resolution. By simulating an adversarial courtroom debate between a <strong>Petitioner Counsel Agent</strong> and a <strong>Respondent Counsel Agent</strong>, an impartial <strong>Judicial Bench Engine</strong> evaluates statutory merit using IRAC reasoning and grounded precedent retrieval.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <span className="font-mono text-brass" style={{ padding: "4px 10px", borderRadius: "4px", backgroundColor: "var(--bg)", border: "1px solid var(--line)", fontSize: "0.78rem" }}>
              📜 CPA 2019 Ontology
            </span>
            <span className="font-mono text-brass" style={{ padding: "4px 10px", borderRadius: "4px", backgroundColor: "var(--bg)", border: "1px solid var(--line)", fontSize: "0.78rem" }}>
              🔍 Closed-Book FAISS RAG
            </span>
            <span className="font-mono text-brass" style={{ padding: "4px 10px", borderRadius: "4px", backgroundColor: "var(--bg)", border: "1px solid var(--line)", fontSize: "0.78rem" }}>
              🛡️ 2-Layer Statutory Grounding
            </span>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "36px" }}>
          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
              boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}
          >
            <div style={{ fontSize: "2rem" }}>📧</div>
            <div>
              <span className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>
                Official Email Contact
              </span>
              <a href="mailto:thejasrinim.23aid@kongu.edu" className="font-mono text-brass" style={{ fontSize: "0.92rem", textDecoration: "none", fontWeight: "bold" }}>
                thejasrinim.23aid@kongu.edu
              </a>
            </div>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
              boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}
          >
            <div style={{ fontSize: "2rem" }}>📞</div>
            <div>
              <span className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>
                Helpline Phone Contact
              </span>
              <span className="font-mono text-brass" style={{ fontSize: "0.92rem", fontWeight: "bold" }}>
                +91 98765 43210 / 1800-11-4000
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Section at the Bottom */}
        <div
          style={{
            padding: "32px",
            borderRadius: "16px",
            border: "1px solid var(--line)",
            borderTop: "4px solid var(--brass)",
            backgroundColor: "var(--surface)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
          }}
        >
          <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
            <h2 className="font-serif text-brass" style={{ fontSize: "1.35rem", margin: "0 0 4px 0" }}>
              💬 Submit User Feedback
            </h2>
            <p className="font-mono text-muted" style={{ fontSize: "0.85rem", margin: 0 }}>
              Your feedback is transmitted directly to system administrators for quality audit.
            </p>
          </div>

          {submitted ? (
            <div
              className="font-mono"
              style={{
                padding: "20px",
                borderRadius: "10px",
                backgroundColor: "var(--support-bg)",
                border: "1px solid var(--support-green)",
                color: "var(--support-green-bright)",
                textAlign: "center",
                fontSize: "0.95rem"
              }}
            >
              ✓ Thank you! Your feedback has been recorded and submitted to the Admin portal.
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.82rem", marginBottom: "10px" }}>
                  How would you rate your experience with LexAgent? *
                </label>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setRating("up")}
                    className="font-mono"
                    style={{
                      flex: 1,
                      minWidth: "160px",
                      padding: "12px 18px",
                      borderRadius: "8px",
                      border: rating === "up" ? "2px solid var(--support-green)" : "1px solid var(--line)",
                      backgroundColor: rating === "up" ? "var(--support-bg)" : "var(--bg)",
                      color: rating === "up" ? "var(--support-green-bright)" : "var(--ink-muted)",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    👍 Positive (Accurate)
                  </button>

                  <button
                    type="button"
                    onClick={() => setRating("down")}
                    className="font-mono"
                    style={{
                      flex: 1,
                      minWidth: "160px",
                      padding: "12px 18px",
                      borderRadius: "8px",
                      border: rating === "down" ? "2px solid var(--oppose-oxblood)" : "1px solid var(--line)",
                      backgroundColor: rating === "down" ? "var(--oppose-bg)" : "var(--bg)",
                      color: rating === "down" ? "var(--oppose-oxblood-bright)" : "var(--ink-muted)",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    👎 Needs Improvement
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.82rem", marginBottom: "8px" }}>
                  Comments / Suggestions for Admin Review
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience, feature requests, or legal reasoning feedback..."
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid var(--line)",
                    backgroundColor: "var(--bg)",
                    color: "var(--ink)",
                    fontSize: "0.92rem",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!rating || loading}
                className="btn-brass font-mono"
                style={{
                  alignSelf: "flex-start",
                  padding: "12px 28px",
                  fontSize: "0.88rem",
                  fontWeight: "bold",
                  opacity: (!rating || loading) ? 0.5 : 1,
                  boxShadow: "0 4px 14px rgba(201, 164, 94, 0.3)"
                }}
              >
                {loading ? "Submitting..." : "Submit Feedback to Admin →"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
