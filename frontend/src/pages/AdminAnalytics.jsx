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
  getFeedbackStats
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, vol, dom, conf, hal, fb] = await Promise.all([
        getOverviewStats(accessToken),
        getVolumeStats(accessToken),
        getDomainStats(accessToken),
        getConfidenceStats(accessToken),
        getHallucinationStats(accessToken),
        getFeedbackStats(accessToken)
      ]);

      setOverview(ov);
      setVolume(vol.volumeByDay || []);
      setDomains(dom.domainDistribution || []);
      setConfidence(conf.confidenceByDay || []);
      setHallucinations(hal);
      setFeedback(fb);
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
          </>
        )}
      </main>
    </div>
  );
}
