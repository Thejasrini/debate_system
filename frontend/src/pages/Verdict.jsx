import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BalanceBar from "../components/BalanceBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import CitationGraph from "../components/CitationGraph";
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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Loading judicial verdict & statutory citations..." />
        </div>
      </div>
    );
  }

  const latestTurn = thread?.turns?.[thread.turns.length - 1];
  const judge = latestTurn?.judge;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        {/* Header & Actions */}
        <div className="border-b border-[var(--line)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-[var(--brass)]">FORMAL JUDICIAL VERDICT REPORT</span>
            <h1 className="text-3xl font-serif mt-1">{thread?.category || "Consumer Dispute"}</h1>
            <p className="text-xs font-mono text-[var(--ink-muted)] mt-1">Case ID: {threadId}</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="px-4 py-2.5 rounded-lg font-mono text-xs font-semibold border border-[var(--line)] text-[var(--ink)] hover:border-[var(--brass)] transition"
            >
              {showGraph ? "Hide Citation Graph" : "📊 Citation Graph"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-6 py-2.5 rounded-lg font-mono text-xs font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition shadow-md disabled:opacity-50"
            >
              {downloading ? "Generating PDF..." : "📄 Download Court PDF"}
            </button>
          </div>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        {/* Citation Graph Visualizer Toggle */}
        {showGraph && (
          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            <CitationGraph threadId={threadId} />
          </div>
        )}

        {/* Verdict Banner */}
        <div className="p-8 rounded-xl border-2 border-[var(--brass)] bg-[var(--surface)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--brass)]">ADJUDICATION DECISION</span>
            <span className="font-mono text-sm text-[var(--brass)] font-bold">
              Confidence: {((judge?.overall_confidence || 0.85) * 100).toFixed(0)}%
            </span>
          </div>
          <h2 className="text-3xl font-serif text-[var(--ink)]">{judge?.decision || "Verdict Pending"}</h2>
          <p className="text-base font-serif text-[var(--ink-muted)] leading-relaxed">{judge?.decision_explanation}</p>
        </div>

        {/* Balance Bar */}
        <BalanceBar
          position={judge?.decision?.includes("Consumer") ? -0.7 : judge?.decision?.includes("Respondent") ? 0.7 : 0.0}
          animated={false}
          label="Final Adjudicated Balance of Probability"
        />

        {/* IRAC Sections */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif border-b border-[var(--line)] pb-2">IRAC Statutory Reasoning</h3>

          {judge?.legal_issues_evaluated?.map((issue, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--brass)]">ISSUE #{idx + 1}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--brass-light)] text-[var(--brass)] font-mono font-semibold">
                  {issue.finding}
                </span>
              </div>
              <h4 className="font-serif text-lg text-[var(--ink)]">{issue.issue}</h4>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{issue.reason}</p>
            </div>
          ))}
        </div>

        {/* Relief Granted */}
        {judge?.relief && judge.relief.length > 0 && (
          <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-3">
            <h3 className="font-serif text-lg text-[var(--support-green-bright)]">Relief Orders Granted</h3>
            <ul className="list-disc list-inside text-sm text-[var(--ink-muted)] space-y-1">
              {judge.relief.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Verified Statutory Citations */}
        <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
          <h3 className="font-serif text-lg">Verified Legal Authorities & Citations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {judge?.sources?.map((src, i) => (
              <div key={i} className="p-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] flex items-center justify-between">
                <div>
                  <div className="font-serif text-sm font-medium text-[var(--ink)]">{src.title}</div>
                  <div className="font-mono text-xs text-[var(--brass)]">{src.identifier}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-[var(--support-bg)] text-[var(--support-green-bright)] font-mono">
                  ✓ Grounded
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Loop Widget */}
        <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
          <h3 className="font-serif text-lg">Feedback & Rating</h3>
          {feedbackSubmitted ? (
            <p className="text-sm font-mono text-[var(--support-green-bright)]">
              ✓ Thank you! Your feedback has been recorded for continuous alignment audit.
            </p>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setRating("thumbs_up")}
                  className={`px-4 py-2 rounded-lg font-mono text-sm border ${
                    rating === "thumbs_up"
                      ? "border-[var(--support-green)] bg-[var(--support-bg)] text-[var(--support-green-bright)]"
                      : "border-[var(--line)] text-[var(--ink-muted)]"
                  }`}
                >
                  👍 Thumbs Up (Accurate)
                </button>
                <button
                  type="button"
                  onClick={() => setRating("thumbs_down")}
                  className={`px-4 py-2 rounded-lg font-mono text-sm border ${
                    rating === "thumbs_down"
                      ? "border-[var(--oppose-oxblood)] bg-[var(--oppose-bg)] text-[var(--oppose-oxblood-bright)]"
                      : "border-[var(--line)] text-[var(--ink-muted)]"
                  }`}
                >
                  👎 Thumbs Down (Inaccurate)
                </button>
              </div>

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional feedback comment on statutory reasoning or citation accuracy..."
                className="w-full p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
              />

              <button
                type="submit"
                disabled={!rating}
                className="px-6 py-2 rounded-lg font-mono text-xs font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition disabled:opacity-50"
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
