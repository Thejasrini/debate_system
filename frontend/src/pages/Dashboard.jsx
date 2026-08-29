import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import { getThreadsApi, deleteThreadApi } from "../services/historyApi";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await getThreadsApi(accessToken);
        setThreads(data.threads || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load case history.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [accessToken]);

  const handleDelete = async (threadId) => {
    if (!window.confirm("Are you sure you want to delete this case thread?")) return;
    setDeletingId(threadId);
    try {
      await deleteThreadApi(threadId, accessToken);
      setThreads(threads.filter((t) => t.threadId !== threadId));
    } catch (err) {
      setError("Failed to delete thread.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredThreads = threads.filter((t) =>
    (t.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.firstQuestion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.threadId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCases = threads.length;
  const totalTurns = threads.reduce((acc, t) => acc + (t.turnCount || 1), 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", width: "100%", boxSizing: "border-box" }}>
        {/* Header Title Section */}
        <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "24px", marginBottom: "28px" }}>
          <h1 className="font-serif text-brass" style={{ fontSize: "2.2rem", margin: "0 0 6px 0", letterSpacing: "0.5px" }}>
            Consumer Case Dashboard
          </h1>
          <p className="font-mono text-muted" style={{ fontSize: "0.88rem", margin: 0 }}>
            Manage and review your statutory dispute history under Consumer Protection Act 2019
          </p>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        {/* Quick Metrics Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid var(--line)", backgroundColor: "var(--surface)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Total Cases Filed</div>
            <div className="font-serif text-brass" style={{ fontSize: "2rem", fontWeight: "bold" }}>{totalCases}</div>
          </div>

          <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid var(--line)", backgroundColor: "var(--surface)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Total Debate Turns</div>
            <div className="font-serif text-brass" style={{ fontSize: "2rem", fontWeight: "bold" }}>{totalTurns}</div>
          </div>

          <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid var(--line)", backgroundColor: "var(--surface)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Judicial Bench Engine</div>
            <div className="font-serif text-brass" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>IRAC Adjudicator</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search by case ID, category, or claim facts..."
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "10px",
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
              color: "var(--ink)",
              fontSize: "0.95rem",
              boxSizing: "border-box",
              outline: "none",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}
          />
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <LoadingSpinner message="Retrieving user thread history..." />
        ) : filteredThreads.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              borderRadius: "16px",
              border: "1px solid var(--line)",
              backgroundColor: "var(--surface)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📂</div>
            <h3 className="font-serif" style={{ fontSize: "1.3rem", margin: "0 0 8px 0" }}>No Case Threads Found</h3>
            <p className="font-mono text-muted" style={{ fontSize: "0.88rem", margin: "0 0 20px 0" }}>
              {searchTerm ? "No case matches your search filter." : "You have not submitted any consumer disputes yet."}
            </p>
            <Link
              to="/courtroom"
              className="btn-brass font-mono"
              style={{ display: "inline-block", padding: "12px 24px", fontSize: "0.88rem", textDecoration: "none" }}
            >
              Open Courtroom Terminal →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredThreads.map((t) => (
              <div
                key={t.threadId}
                style={{
                  padding: "24px",
                  borderRadius: "14px",
                  border: "1px solid var(--line)",
                  borderLeft: "4px solid var(--brass)",
                  backgroundColor: "var(--surface)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
                  transition: "transform 0.2s ease, border-color 0.2s ease"
                }}
              >
                <div style={{ flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span
                      className="font-mono"
                      style={{
                        padding: "3px 10px",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: "bold",
                        backgroundColor: "var(--brass-light)",
                        color: "var(--brass)",
                        border: "1px solid var(--line-bright)"
                      }}
                    >
                      {t.category || "Consumer Dispute"}
                    </span>
                    <span className="font-mono text-muted" style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                      ID: {t.threadId}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigate(`/verdict/${t.threadId}`)}
                    className="font-serif text-brass"
                    style={{
                      fontSize: "1.15rem",
                      margin: "0 0 10px 0",
                      cursor: "pointer",
                      lineHeight: "1.4"
                    }}
                  >
                    {t.firstQuestion}
                  </h3>

                  <div className="font-mono text-muted" style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.78rem" }}>
                    <span>🔄 Turns: <strong>{t.turnCount}</strong></span>
                    <span>📅 Date: <strong>{new Date(t.createdAt).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => navigate(`/verdict/${t.threadId}`)}
                    className="btn-outline-brass font-mono"
                    style={{
                      padding: "10px 18px",
                      fontSize: "0.82rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    📜 View Verdict
                  </button>

                  <button
                    onClick={() => handleDelete(t.threadId)}
                    disabled={deletingId === t.threadId}
                    className="font-mono"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: "semibold"
                    }}
                  >
                    {deletingId === t.threadId ? "Deleting..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
