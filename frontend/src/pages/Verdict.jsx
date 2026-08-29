import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BalanceBar from "../components/BalanceBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import CitationGraph from "../components/CitationGraph";
import DebateAnalysisGraph from "../components/DebateAnalysisGraph";
import { getThreadApi } from "../services/historyApi";
import { downloadVerdictPDF } from "../services/exportApi";
import { submitFeedbackApi } from "../services/feedbackApi";
import { useAuth } from "../context/AuthContext";

export default function Verdict() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    async function loadVerdict() {
      try {
        const data = await getThreadApi(threadId, accessToken);
        setThread(data.thread);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load verdict details.");
      } finally {
        setLoading(false);
      }
    }
    loadVerdict();
  }, [threadId, accessToken]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadVerdictPDF(threadId, 0, accessToken);
    } catch (err) {
      setError("Failed to download PDF verdict report.");
    } finally {
      setDownloading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    try {
      await submitFeedbackApi(threadId, 0, rating, comment, accessToken);
      setFeedbackSubmitted(true);
    } catch (err) {
      setError("Failed to submit feedback rating.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LoadingSpinner message="Loading judicial verdict & statutory citations..." />
        </div>
      </div>
    );
  }

  const latestTurn = thread?.turns?.[thread.turns.length - 1];
  const judge = latestTurn?.judge;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "1100px", margin: "0 auto", padding: "40px 24px", width: "100%", boxSizing: "border-box" }}>
        {/* Header & Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px", borderBottom: "1px solid var(--line)", paddingBottom: "24px", marginBottom: "28px" }}>
          <div>
            <span
              className="font-mono text-brass"
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: "var(--brass-light)",
                border: "1px solid var(--line-bright)",
                fontSize: "0.78rem",
                fontWeight: "bold",
                marginBottom: "8px"
              }}
            >
              ⚖️ FORMAL JUDICIAL VERDICT REPORT
            </span>
            <h1 className="font-serif text-brass" style={{ fontSize: "2.2rem", margin: "4px 0", letterSpacing: "0.5px" }}>
              {thread?.category || "Consumer Dispute"}
            </h1>
            <p className="font-mono text-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
              Case ID: <strong>{threadId}</strong>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="font-mono"
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                backgroundColor: "var(--surface)",
                color: "var(--ink)",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {showGraph ? "Hide Citation Graph" : "📊 Citation Graph"}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="btn-brass font-mono"
              style={{
                padding: "10px 22px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                boxShadow: "0 4px 14px rgba(201, 164, 94, 0.3)"
              }}
            >
              {downloading ? "Generating PDF..." : "📥 Download Court PDF"}
            </button>
          </div>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        {/* Citation Graph Visualizer Overlay */}
        {showGraph && (
          <div style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--line)", backgroundColor: "var(--surface)", marginBottom: "28px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            <CitationGraph />
          </div>
        )}

        {/* Verdict Banner Card */}
        <div
          style={{
            padding: "32px",
            borderRadius: "16px",
            border: "2px solid var(--brass)",
            backgroundColor: "var(--surface)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
            marginBottom: "32px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
            <span className="font-mono text-brass" style={{ fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
              ⚖️ ADJUDICATION DECISION
            </span>
            <span
              className="font-mono"
              style={{
                padding: "4px 14px",
                borderRadius: "6px",
                backgroundColor: "var(--brass-light)",
                color: "var(--brass)",
                border: "1px solid var(--line-bright)",
                fontSize: "0.82rem",
                fontWeight: "bold"
              }}
            >
              Bench Confidence: {((judge?.overall_confidence || 0.85) * 100).toFixed(0)}%
            </span>
          </div>

          <h2 className="font-serif text-brass" style={{ fontSize: "2.4rem", margin: "0 0 14px 0", lineHeight: "1.2" }}>
            {judge?.decision || "Verdict Pending"}
          </h2>

          <p className="font-serif text-muted" style={{ fontSize: "1.08rem", lineHeight: "1.7", margin: 0 }}>
            {judge?.decision_explanation}
          </p>
        </div>

        {/* Balance Bar & Debate Analysis Graph */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginBottom: "32px" }}>
          <BalanceBar
            position={judge?.decision?.includes("Consumer") ? -0.7 : judge?.decision?.includes("Respondent") ? 0.7 : 0.0}
            animated={false}
            label="Final Adjudicated Balance of Probability"
          />

          <DebateAnalysisGraph supportData={latestTurn?.support} opposeData={latestTurn?.oppose} judgeData={latestTurn?.judge} />
        </div>

        {/* IRAC Statutory Reasoning Sections */}
        {judge?.legal_issues_evaluated && judge.legal_issues_evaluated.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h3 className="font-serif text-brass" style={{ fontSize: "1.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "10px", marginBottom: "18px" }}>
              IRAC Statutory Reasoning
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {judge.legal_issues_evaluated.map((issue, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "20px 24px",
                    borderRadius: "12px",
                    border: "1px solid var(--line)",
                    backgroundColor: "var(--surface)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="font-mono text-brass" style={{ fontSize: "0.78rem", fontWeight: "bold" }}>
                      ISSUE #{idx + 1}
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        padding: "2px 10px",
                        borderRadius: "4px",
                        backgroundColor: "var(--brass-light)",
                        color: "var(--brass)",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        border: "1px solid var(--line-bright)"
                      }}
                    >
                      {issue.finding}
                    </span>
                  </div>

                  <h4 className="font-serif" style={{ fontSize: "1.18rem", margin: "0 0 8px 0", color: "var(--ink)" }}>
                    {issue.issue}
                  </h4>

                  <p className="font-sans text-muted" style={{ fontSize: "0.92rem", lineHeight: "1.6", margin: 0 }}>
                    {issue.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relief Granted Section */}
        {judge?.relief && judge.relief.length > 0 && (
          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
              marginBottom: "32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
            }}
          >
            <h3 className="font-serif" style={{ fontSize: "1.25rem", color: "var(--support-green-bright)", margin: "0 0 12px 0" }}>
              🏆 Relief Orders Granted
            </h3>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--ink-muted)", fontSize: "0.92rem", lineHeight: "1.8" }}>
              {judge.relief.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Verified Statutory Citations */}
        {judge?.sources && judge.sources.length > 0 && (
          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
              marginBottom: "32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
            }}
          >
            <h3 className="font-serif" style={{ fontSize: "1.25rem", margin: "0 0 16px 0", color: "var(--ink)" }}>
              📚 Verified Legal Authorities & Citations
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {judge.sources.map((src, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    backgroundColor: "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px"
                  }}
                >
                  <div>
                    <div className="font-serif" style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--ink)", marginBottom: "4px" }}>
                      {src.title}
                    </div>
                    <div className="font-mono text-brass" style={{ fontSize: "0.78rem" }}>
                      {src.identifier}
                    </div>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "0.72rem",
                      padding: "3px 10px",
                      borderRadius: "4px",
                      backgroundColor: "var(--support-bg)",
                      color: "var(--support-green-bright)",
                      border: "1px solid rgba(78, 144, 120, 0.4)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    ✓ Grounded
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Loop Widget */}
        <div
          style={{
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid var(--line)",
            backgroundColor: "var(--surface)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
          }}
        >
          <h3 className="font-serif" style={{ fontSize: "1.25rem", margin: "0 0 14px 0", color: "var(--ink)" }}>
            💬 Feedback & Bench Alignment Rating
          </h3>

          {feedbackSubmitted ? (
            <p className="font-mono" style={{ color: "var(--support-green-bright)", fontSize: "0.9rem", margin: 0 }}>
              ✓ Thank you! Your feedback has been recorded for continuous judicial alignment audit.
            </p>
          ) : (
            <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setRating("thumbs_up")}
                  className="font-mono"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: rating === "thumbs_up" ? "2px solid var(--support-green)" : "1px solid var(--line)",
                    backgroundColor: rating === "thumbs_up" ? "var(--support-bg)" : "var(--bg)",
                    color: rating === "thumbs_up" ? "var(--support-green-bright)" : "var(--ink-muted)",
                    fontSize: "0.88rem",
                    cursor: "pointer"
                  }}
                >
                  👍 Thumbs Up (Accurate)
                </button>

                <button
                  type="button"
                  onClick={() => setRating("thumbs_down")}
                  className="font-mono"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: rating === "thumbs_down" ? "2px solid var(--oppose-oxblood)" : "1px solid var(--line)",
                    backgroundColor: rating === "thumbs_down" ? "var(--oppose-bg)" : "var(--bg)",
                    color: rating === "thumbs_down" ? "var(--oppose-oxblood-bright)" : "var(--ink-muted)",
                    fontSize: "0.88rem",
                    cursor: "pointer"
                  }}
                >
                  👎 Thumbs Down (Inaccurate)
                </button>
              </div>

              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional feedback comment on statutory reasoning or citation accuracy..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  backgroundColor: "var(--bg)",
                  color: "var(--ink)",
                  fontSize: "0.92rem",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />

              <button
                type="submit"
                disabled={!rating}
                className="btn-brass font-mono"
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 24px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  opacity: !rating ? 0.5 : 1
                }}
              >
                Submit Feedback →
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
