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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
          <div>
            <h1 className="text-3xl font-serif">Consumer Case Dashboard</h1>
            <p className="text-sm font-mono text-[var(--ink-muted)] mt-1">Manage and review your statutory dispute history</p>
          </div>

          <Link
            to="/new-case"
            className="px-6 py-3 rounded-lg font-mono text-xs font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition shadow-md"
          >
            + File New Case
          </Link>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by case ID, category, or claim facts..."
            className="flex-1 p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:border-[var(--brass)] outline-none"
          />
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <LoadingSpinner message="Retrieving user thread history..." />
        ) : filteredThreads.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <h3 className="text-xl font-serif">No Case Threads Found</h3>
            <p className="text-sm text-[var(--ink-muted)]">You have not submitted any consumer disputes yet.</p>
            <Link
              to="/new-case"
              className="inline-block px-6 py-2.5 rounded-lg font-mono text-xs font-semibold bg-[var(--brass)] text-[var(--bg)] hover:bg-[var(--brass-hover)] transition"
            >
              File Your First Case →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredThreads.map((t) => (
              <div
                key={t.threadId}
                className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[var(--brass)] transition"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-[var(--brass)] font-semibold">{t.category}</span>
                    <span className="font-mono text-xs text-[var(--ink-dim)]">ID: {t.threadId}</span>
                  </div>
                  <h3
                    onClick={() => navigate(`/verdict/${t.threadId}`)}
                    className="font-serif text-lg text-[var(--ink)] cursor-pointer hover:text-[var(--brass)] transition"
                  >
                    {t.firstQuestion}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs font-mono text-[var(--ink-muted)] pt-1">
                    <span>Turns: {t.turnCount}</span>
                    <span>Date: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate(`/verdict/${t.threadId}`)}
                    className="px-4 py-2 rounded-lg font-mono text-xs border border-[var(--brass)] text-[var(--brass)] hover:bg-[var(--brass-light)] transition"
                  >
                    View Verdict
                  </button>
                  <button
                    onClick={() => handleDelete(t.threadId)}
                    disabled={deletingId === t.threadId}
                    className="px-3 py-2 rounded-lg font-mono text-xs text-[var(--oppose-oxblood-bright)] hover:bg-[var(--oppose-bg)] transition"
                  >
                    {deletingId === t.threadId ? "Deleting..." : "Delete"}
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
