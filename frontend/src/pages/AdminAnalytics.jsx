import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";
import {
  getOverviewStats,
  getVolumeStats,
  getDomainStats,
  getConfidenceStats,
  getHallucinationStats,
  getFeedbackStats,
  getFeedbackListApi
} from "../services/adminApi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine
} from "recharts";
import "./AdminAnalytics.css";

export default function AdminAnalytics() {
  const { accessToken } = useAuth();

  const [overview, setOverview] = useState(null);
  const [volume, setVolume] = useState([]);
  const [domains, setDomains] = useState([]);
  const [confidence, setConfidence] = useState([]);
  const [hallucinations, setHallucinations] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, vol, dom, conf, hal, fb, fbList] = await Promise.all([
        getOverviewStats(accessToken),
        getVolumeStats(accessToken),
        getDomainStats(accessToken),
        getConfidenceStats(accessToken),
        getHallucinationStats(accessToken),
        getFeedbackStats(accessToken),
        getFeedbackListApi(accessToken)
      ]);

      setOverview(ov);
      setVolume(vol.volumeByDay || []);
      setDomains(dom.domainDistribution || []);
      setConfidence(conf.confidenceByDay || []);
      setHallucinations(hal);
      setFeedback(fb);
      setFeedbackList(fbList.feedback || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load admin analytics statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
    const timer = setInterval(fetchAllStats, 60000);
    return () => clearInterval(timer);
  }, [accessToken]);

  const PIE_COLORS = ["#C9A45E", "#4E9078", "#B25A50", "#1B2E47", "#5DA888"];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
          <div>
            <span className="font-mono text-xs text-[var(--brass)] font-semibold">ADMINISTRATIVE AUDIT DASHBOARD</span>
            <h1 className="text-3xl font-serif mt-1">System Analytics & Grounding Metrics</h1>
            <p className="text-xs font-mono text-[var(--ink-muted)] mt-1">
              Last auto-refreshed: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={fetchAllStats}
            className="px-5 py-2.5 rounded-lg font-mono text-xs font-semibold border border-[var(--brass)] text-[var(--brass)] hover:bg-[var(--brass-light)] transition"
          >
            🔄 Refresh Data
          </button>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        {loading && !overview ? (
          <LoadingSpinner message="Aggregating statutory grounding metrics..." />
        ) : (
          <>
            {/* 6 Headline Summary Cards */}
            <div className="admin-grid-top">
              <div className="stat-card">
                <span className="stat-card-title">Total Cases</span>
                <div className="stat-card-value">{overview?.totalCases}</div>
              </div>

              <div className="stat-card">
                <span className="stat-card-title">Total Users</span>
                <div className="stat-card-value">{overview?.totalUsers}</div>
              </div>

              <div className="stat-card">
                <span className="stat-card-title">Debate Turns</span>
                <div className="stat-card-value">{overview?.totalTurns}</div>
              </div>

              <div className="stat-card">
                <span className="stat-card-title">Avg Confidence</span>
                <div className="stat-card-value text-[var(--support-green-bright)]">{overview?.avgConfidence}%</div>
              </div>

              <div className="stat-card stat-card-accent">
                <span className="stat-card-title text-[var(--brass)]">🛡️ Hallucinations Caught</span>
                <div className="stat-card-value text-[var(--brass)]">{overview?.hallucinationsCaught}</div>
              </div>

              <div className="stat-card">
                <span className="stat-card-title">Feedback Approval</span>
                <div className="stat-card-value text-[var(--support-green-bright)]">{overview?.feedbackApproval}%</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 1. Query Volume Chart */}
              <div className="chart-card">
                <h3 className="chart-card-title">Query Volume Over Time</h3>
                <p className="chart-card-subtitle">Daily incoming consumer dispute submissions (Last 90 Days)</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volume}>
                      <XAxis dataKey="date" stroke="var(--ink-muted)" fontSize={11} />
                      <YAxis stroke="var(--ink-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", color: "var(--ink)" }} />
                      <Area type="monotone" dataKey="count" stroke="var(--brass)" fill="var(--brass-light)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Legal Domain Category Distribution */}
              <div className="chart-card">
                <h3 className="chart-card-title">Legal Category Distribution</h3>
                <p className="chart-card-subtitle">Consumer Protection Act, 2019 Dispute Classification</p>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={domains} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                        {domains.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", color: "var(--ink)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Judicial Confidence Trend */}
              <div className="chart-card">
                <h3 className="chart-card-title">Judicial Confidence Score Trend</h3>
                <p className="chart-card-subtitle">Average judge confidence over time (0.0 to 1.0)</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={confidence}>
                      <XAxis dataKey="date" stroke="var(--ink-muted)" fontSize={11} />
                      <YAxis domain={[0, 1]} stroke="var(--ink-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", color: "var(--ink)" }} />
                      <ReferenceLine y={0.5} stroke="var(--ink-dim)" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="avgConfidence" stroke="var(--brass)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4. Grounding Validator Interventions & Hallucinations */}
              <div className="chart-card">
                <h3 className="chart-card-title">Grounding Interventions & Hallucinations</h3>
                <p className="chart-card-subtitle">Citation errors & ungrounded statutory claims blocked</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hallucinations?.byWeek || []}>
                      <XAxis dataKey="week" stroke="var(--ink-muted)" fontSize={11} />
                      <YAxis stroke="var(--ink-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--line)", color: "var(--ink)" }} />
                      <Bar dataKey="citationErrors" fill="var(--oppose-oxblood)" name="Citation Errors" />
                      <Bar dataKey="fabricatedSources" fill="var(--brass)" name="Fabricated Sources" />
                      <Bar dataKey="contradictions" fill="var(--support-green)" name="Semantic Contradictions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 5. User Submitted Feedback Log Table */}
            <div style={{ padding: "28px", borderRadius: "14px", border: "1px solid var(--line)", backgroundColor: "var(--surface)", boxShadow: "0 4px 18px rgba(0,0,0,0.12)", marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "20px" }}>
                <div>
                  <h3 className="font-serif text-brass" style={{ fontSize: "1.3rem", margin: "0 0 4px 0" }}>
                    💬 User Submitted Feedback Log ({feedbackList.length})
                  </h3>
                  <p className="font-mono text-muted" style={{ fontSize: "0.82rem", margin: 0 }}>
                    Live feedback and ratings transmitted by users from the About Us portal
                  </p>
                </div>
              </div>

              {feedbackList.length === 0 ? (
                <p className="font-mono text-muted" style={{ fontSize: "0.88rem", padding: "20px 0", textAlign: "center" }}>
                  No user feedback submissions logged yet.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                        <th className="font-mono text-muted" style={{ padding: "10px 12px" }}>USER</th>
                        <th className="font-mono text-muted" style={{ padding: "10px 12px" }}>RATING</th>
                        <th className="font-mono text-muted" style={{ padding: "10px 12px" }}>CATEGORY</th>
                        <th className="font-mono text-muted" style={{ padding: "10px 12px" }}>COMMENT / FEEDBACK</th>
                        <th className="font-mono text-muted" style={{ padding: "10px 12px" }}>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbackList.map((f, i) => (
                        <tr key={f._id || i} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "12px" }}>
                            <div className="font-serif" style={{ fontWeight: "600", color: "var(--ink)" }}>{f.userId?.name || "Anonymous User"}</div>
                            <div className="font-mono text-muted" style={{ fontSize: "0.75rem" }}>{f.userId?.email || f.userId}</div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              className="font-mono"
                              style={{
                                padding: "3px 10px",
                                borderRadius: "4px",
                                fontSize: "0.78rem",
                                fontWeight: "bold",
                                backgroundColor: f.rating === "up" || f.rating === "thumbs_up" ? "var(--support-bg)" : "var(--oppose-bg)",
                                color: f.rating === "up" || f.rating === "thumbs_up" ? "var(--support-green-bright)" : "var(--oppose-oxblood-bright)",
                                border: f.rating === "up" || f.rating === "thumbs_up" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)"
                              }}
                            >
                              {f.rating === "up" || f.rating === "thumbs_up" ? "👍 Positive" : "👎 Needs Impr."}
                            </span>
                          </td>
                          <td className="font-mono text-brass" style={{ padding: "12px", fontSize: "0.8rem" }}>
                            {f.category || "General Platform Feedback"}
                          </td>
                          <td className="font-sans text-muted" style={{ padding: "12px", maxWidth: "300px", lineHeight: "1.4" }}>
                            {f.comment || <em style={{ opacity: 0.6 }}>No comment provided</em>}
                          </td>
                          <td className="font-mono text-muted" style={{ padding: "12px", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                            {new Date(f.createdAt).toLocaleDateString()} {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
