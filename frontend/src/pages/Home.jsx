import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import QuestionBox from "../components/QuestionBox";
import SupportCard from "../components/SupportCard";
import OpposeCard from "../components/OpposeCard";
import JudgeCard from "../components/JudgeCard";
import BalanceBar from "../components/BalanceBar";
import CitationGraph from "../components/CitationGraph";
import DebateAnalysisGraph from "../components/DebateAnalysisGraph";
import { streamDebate } from "../services/api";
import { downloadVerdictPDF } from "../services/exportApi";
import { submitFeedbackApi } from "../services/feedbackApi";
import { getThreadsApi, getThreadApi, deleteThreadApi } from "../services/historyApi";

export default function Home() {
  const { user, accessToken, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("lexagent-theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  const [threadId, setThreadId] = useState(null);
  const [caseNumber, setCaseNumber] = useState("CPA/2019/0847");
  const [currentTime, setCurrentTime] = useState("");

  const [pastTurns, setPastTurns] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [category, setCategory] = useState(null);
  const [outOfScope, setOutOfScope] = useState(false);
  const [outOfScopeMessage, setOutOfScopeMessage] = useState("");

  const [caseReasoning, setCaseReasoning] = useState(null);
  const [retrieval, setRetrieval] = useState(null);
  const [support, setSupport] = useState(null);
  const [oppose, setOppose] = useState(null);
  const [judge, setJudge] = useState(null);

  const [supportLoading, setSupportLoading] = useState(false);
  const [opposeLoading, setOpposeLoading] = useState(false);
  const [judgeLoading, setJudgeLoading] = useState(false);

  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);

  // History Drawer & Threads state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyThreads, setHistoryThreads] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lexagent-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr =
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }).toUpperCase() +
        " " +
        now.toLocaleTimeString("en-US", { hour12: false });
      setCurrentTime(timeStr + " IST");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (threadId) {
      const shortId = threadId.slice(0, 4).toUpperCase();
      setCaseNumber(`CPA/2019/${shortId}`);
    }
  }, [threadId]);

  // Load history threads list
  const loadHistoryThreads = async () => {
    if (!accessToken) return;
    setLoadingHistory(true);
    try {
      const res = await getThreadsApi(accessToken);
      setHistoryThreads(res.threads || []);
    } catch (err) {
      console.warn("⚠️ Failed to load history threads:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
    loadHistoryThreads();
  };

  // Load selected previous thread into the Courtroom Terminal
  const handleSelectThread = async (selectedThreadId) => {
    try {
      setLoadingHistory(true);
      const res = await getThreadApi(selectedThreadId, accessToken);
      if (res && res.thread) {
        const t = res.thread;
        setThreadId(t.threadId);
        const shortId = t.threadId.slice(0, 4).toUpperCase();
        setCaseNumber(`CPA/2019/${shortId}`);

        const turns = Array.isArray(t.turns) ? t.turns : [];
        if (turns.length > 0) {
          const lastTurn = turns[turns.length - 1];
          const prevs = turns.slice(0, turns.length - 1);
          setPastTurns(prevs);

          setCurrentQuestion(lastTurn.question);
          setCategory(lastTurn.category || t.category || "Consumer Dispute");
          setSupport(lastTurn.support || null);
          setOppose(lastTurn.oppose || null);
          setJudge(lastTurn.judge || null);
          setRetrieval(null);
          setCaseReasoning(null);
        } else {
          setPastTurns([]);
          setCurrentQuestion("");
          setSupport(null);
          setOppose(null);
          setJudge(null);
        }

        setOutOfScope(false);
        setError(null);
        setShowHistoryModal(false);
      }
    } catch (err) {
      console.error("Failed to load thread:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Delete a history thread
  const handleDeleteThread = async (e, idToDelete) => {
    e.stopPropagation();
    try {
      await deleteThreadApi(idToDelete, accessToken);
      setHistoryThreads((prev) => prev.filter((item) => item.threadId !== idToDelete));
      if (threadId === idToDelete) {
        handleStartNewCase();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err.message);
    }
  };

  const handleStartNewCase = () => {
    setThreadId(null);
    setCaseNumber(`CPA/2019/${Math.floor(1000 + Math.random() * 9000)}`);
    setPastTurns([]);
    setCurrentQuestion("");
    setCategory(null);
    setOutOfScope(false);
    setOutOfScopeMessage("");
    setCaseReasoning(null);
    setRetrieval(null);
    setSupport(null);
    setOppose(null);
    setJudge(null);
    setError(null);
    setSupportLoading(false);
    setOpposeLoading(false);
    setJudgeLoading(false);
    setIsAnalyzing(false);
    setShowGraph(false);
    setFeedbackDone(false);
    setFeedbackRating(null);
    setFeedbackComment("");
  };

  const handleStartStream = (question) => {
    if (judge && currentQuestion) {
      setPastTurns((prev) => [
        ...prev,
        {
          question: currentQuestion,
          category,
          caseReasoning,
          retrieval,
          support,
          oppose,
          judge
        }
      ]);
    }

    setCurrentQuestion(question);
    setIsAnalyzing(true);
    setCategory(null);
    setOutOfScope(false);
    setOutOfScopeMessage("");
    setCaseReasoning(null);
    setRetrieval(null);
    setSupport(null);
    setOppose(null);
    setJudge(null);
    setError(null);
    setFeedbackDone(false);

    setSupportLoading(true);
    setOpposeLoading(true);
    setJudgeLoading(true);

    streamDebate(
      question,
      threadId,
      (eventType, data) => {
        if (eventType === "thread") {
          setThreadId(data.threadId);
        } else if (eventType === "intent") {
          setCategory(data.category);
        } else if (eventType === "outOfScope") {
          setOutOfScope(true);
          setOutOfScopeMessage(data.message);
          setCategory(data.category);
          setSupportLoading(false);
          setOpposeLoading(false);
          setJudgeLoading(false);
          setIsAnalyzing(false);
        } else if (eventType === "caseReasoning") {
          setCaseReasoning(data);
        } else if (eventType === "retrieval") {
          setRetrieval(data);
        } else if (eventType === "support") {
          setSupport(data);
          setSupportLoading(false);
        } else if (eventType === "oppose") {
          setOppose(data);
          setOpposeLoading(false);
        } else if (eventType === "judge") {
          setJudge(data);
          setJudgeLoading(false);
        }
      },
      (errMessage) => {
        console.error("Stream Error:", errMessage);
        setError(errMessage);
        setSupportLoading(false);
        setOpposeLoading(false);
        setJudgeLoading(false);
        setIsAnalyzing(false);
      },
      () => {
        setIsAnalyzing(false);
      }
    );
  };

  const handleDownloadPDF = async () => {
    if (!threadId) return;
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
    if (!feedbackRating || !threadId) return;
    try {
      await submitFeedbackApi(
        threadId,
        pastTurns.length,
        feedbackRating,
        feedbackComment,
        accessToken
      );
      setFeedbackDone(true);
    } catch (err) {
      console.warn("Feedback warning:", err.message);
      setFeedbackDone(true);
    }
  };

  const getBalancePosition = () => {
    if (judge) {
      if (judge.decision && judge.decision.includes("Consumer")) return -0.7;
      if (judge.decision && judge.decision.includes("Respondent")) return 0.7;
      return 0.0;
    }
    if (support && !oppose) return -0.4;
    if (oppose && !support) return 0.4;
    return 0.0;
  };

  const getStatusPill = () => {
    if (outOfScope) {
      return (
        <span className="docket-status-pill out-of-scope">
          <span className="status-dot"></span> OUT OF SCOPE
        </span>
      );
    }
    if (isAnalyzing) {
      return (
        <span className="docket-status-pill in-session">
          <span className="status-dot"></span> IN SESSION
        </span>
      );
    }
    if (judge) {
      return (
        <span className="docket-status-pill verdict">
          <span className="status-dot"></span> VERDICT DELIVERED
        </span>
      );
    }
    return (
      <span className="docket-status-pill draft">
        <span className="status-dot"></span> CASE DRAFT
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Top Header Bar */}
      <header className="docket-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", width: "100%", maxWidth: "100vw", boxSizing: "border-box" }}>
        <div className="docket-title-group" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Menu Toggle Icon Button */}
          <button
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            className="btn-outline-brass"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", cursor: "pointer", flexShrink: 0 }}
            title="Toggle Navigation Menu"
          >
            {isNavDrawerOpen ? "✕ Close" : "☰ Menu"}
          </button>

          <h1 className="font-serif text-brass" style={{ fontSize: "1.05rem", margin: 0, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
            ⚖️ LEXAGENT COURTROOM
          </h1>
          <span className="docket-number" style={{ whiteSpace: "nowrap", flexShrink: 0, fontSize: "0.75rem" }}>{caseNumber}</span>
          <div style={{ whiteSpace: "nowrap", flexShrink: 0 }}>{getStatusPill()}</div>
        </div>

        {/* Right Group - Single horizontal line */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", whiteSpace: "nowrap", flexShrink: 0 }}>
          <span className="font-mono text-muted" style={{ fontSize: "0.75rem", opacity: 0.85, flexShrink: 0 }}>
            {currentTime}
          </span>

          <button className="btn-theme-toggle" onClick={toggleTheme} title="Switch UI Theme Preference" style={{ flexShrink: 0 }}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* User Profile & Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded text-xs font-mono font-semibold border border-[var(--line)] text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
            title="Sign Out of Session"
            style={{ display: "inline-flex", alignItems: "center", gap: "4px", flexShrink: 0 }}
          >
            🚪 Logout
          </button>
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
              {/* Case History Option */}
              <button
                onClick={() => {
                  setIsNavDrawerOpen(false);
                  handleOpenHistory();
                }}
                className="btn-outline-brass"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>📜</span> Case History
              </button>

              {/* New Case Option */}
              <button
                onClick={() => {
                  setIsNavDrawerOpen(false);
                  handleStartNewCase();
                }}
                className="btn-outline-brass"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>➕</span> New Case
              </button>

              <hr className="hairline-divider" style={{ margin: "10px 0" }} />

              {/* Navigation Links */}
              <button
                onClick={() => { setIsNavDrawerOpen(false); navigate("/dashboard"); }}
                className="btn-outline-brass"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>📊</span> Case Dashboard
              </button>

              <button
                onClick={() => { setIsNavDrawerOpen(false); navigate("/how-it-works"); }}
                className="btn-outline-brass"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>💡</span> How It Works
              </button>

              <button
                onClick={() => { setIsNavDrawerOpen(false); navigate("/profile"); }}
                className="btn-outline-brass"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
              >
                <span>👤</span> Account Profile
              </button>

              {user?.role === "admin" && (
                <button
                  onClick={() => { setIsNavDrawerOpen(false); navigate("/admin"); }}
                  className="btn-outline-brass"
                  style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}
                >
                  <span>👑</span> Admin Analytics
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL SIDEBAR / OVERLAY */}
      {showHistoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end"
          }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              height: "100%",
              backgroundColor: "var(--surface)",
              borderLeft: "1px solid var(--line-bright)",
              padding: "24px",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "16px" }}>
              <div>
                <h3 className="font-serif text-brass" style={{ margin: 0, fontSize: "1.25rem" }}>
                  📜 Previous Case History
                </h3>
                <p className="text-muted font-mono" style={{ fontSize: "0.75rem", margin: "2px 0 0 0" }}>
                  Saved adversarial debate threads for {user?.email}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="font-mono text-muted hover:text-brass"
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {loadingHistory ? (
              <div className="font-mono text-brass text-center py-10">Loading previous case chats...</div>
            ) : historyThreads.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <span style={{ fontSize: "2rem" }}>📂</span>
                <p className="font-mono text-muted text-sm">No saved case history found yet.</p>
                <p className="text-xs text-muted">File a new dispute in the Courtroom Terminal to start logging threads.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {historyThreads.map((item) => (
                  <div
                    key={item.threadId}
                    onClick={() => handleSelectThread(item.threadId)}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      border: threadId === item.threadId ? "1.5px solid var(--brass)" : "1px solid var(--line)",
                      backgroundColor: threadId === item.threadId ? "var(--brass-light)" : "var(--bg)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    className="hover:border-[var(--brass)]"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span className="font-mono text-brass" style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                        CPA/2019/{item.threadId.slice(0, 4).toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => handleDeleteThread(e, item.threadId)}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem" }}
                        title="Delete Case Thread"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <p style={{ margin: "4px 0", color: "var(--ink)", fontSize: "0.85rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      "{item.firstQuestion}"
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "0.72rem" }} className="font-mono text-muted">
                      <span>{item.category || "General Dispute"} • {item.turnCount} turns</span>
                      <span className="text-brass">
                        {item.latestDecision ? item.latestDecision.split(" ")[0] : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px 160px 24px" }}>
        {/* Context Header */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 className="font-serif text-parchment" style={{ fontSize: "1.5rem", fontWeight: "600" }}>
              Indian Consumer Protection Legal Intelligence System
            </h2>
            <p className="text-muted font-sans" style={{ fontSize: "0.9rem", marginTop: "4px" }}>
              Continuous Adversarial Legal Debate System strictly governed by the <strong className="text-brass">Consumer Protection Act, 2019</strong>.
            </p>
          </div>

          <div className="font-mono text-muted" style={{ fontSize: "0.8rem", textAlign: "right" }}>
            User: <span className="text-brass">{user ? `${user.name} (${user.role})` : "Guest"}</span>
          </div>
        </div>

        {/* PAST CONVERSATION TURNS */}
        {pastTurns.length > 0 && (
          <div style={{ marginBottom: "35px", display: "flex", flexDirection: "column", gap: "30px" }}>
            <div className="font-mono text-brass" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              📜 PREVIOUS COURT SESSION TURNS ({pastTurns.length})
            </div>
            {pastTurns.map((turn, turnIdx) => (
              <div key={turnIdx} style={{ padding: "20px", backgroundColor: "var(--surface)", borderRadius: "12px", border: "1px solid var(--line)" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span className="font-mono text-brass" style={{ fontSize: "0.8rem", backgroundColor: "var(--brass-light)", padding: "3px 8px", borderRadius: "4px" }}>
                    Turn #{turnIdx + 1} Question
                  </span>
                  <p style={{ margin: "6px 0 0 0", color: "var(--text-parchment)", fontSize: "1rem", fontWeight: "600" }}>
                    "{turn.question}"
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                  <SupportCard data={turn.support} />
                  <OpposeCard data={turn.oppose} />
                </div>
                <JudgeCard data={turn.judge} />
              </div>
            ))}
            <hr className="hairline-divider" />
          </div>
        )}

        {/* Question & Continuous Proof Submission Box */}
        <QuestionBox onSubmit={handleStartStream} loading={isAnalyzing} isFollowUp={Boolean(threadId || judge)} />

        {/* ALWAYS VISIBLE DEBATE ANALYSIS GRAPH (Empty state before debate, loading during, live bar chart after) */}
        <div style={{ margin: "24px 0 32px 0" }}>
          <DebateAnalysisGraph supportData={support} opposeData={oppose} judgeData={judge} loading={isAnalyzing} />
        </div>

        <hr className="hairline-divider" />

        {/* Error Banner */}
        {error && (
          <div style={{ padding: "16px", backgroundColor: "var(--courtroom-red-bg)", border: "1px solid var(--courtroom-red)", color: "var(--courtroom-red-bright)", borderRadius: "8px", marginBottom: "24px" }}>
            ⚠️ <strong>Filing Error:</strong> {error}
          </div>
        )}

        {/* Out of Scope Banner */}
        {outOfScope && (
          <div className="docket-card" style={{ borderLeft: "4px solid var(--courtroom-red)", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "1.5rem" }}>🛑</span>
              <h3 className="font-serif" style={{ color: "var(--courtroom-red-bright)", margin: 0 }}>
                Jurisdictional Exception: Domain Out of Scope
              </h3>
            </div>
            <p style={{ fontSize: "1rem", color: "var(--text-parchment)", margin: 0 }}>
              {outOfScopeMessage}
            </p>
          </div>
        )}

        {/* Active Debate View */}
        {!outOfScope && (isAnalyzing || support || oppose || judge || caseReasoning) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Category Tag */}
            {category && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="font-mono text-brass" style={{ backgroundColor: "var(--accent-brass-light)", padding: "6px 14px", borderRadius: "6px", border: "1px solid var(--border-hairline-bright)", fontSize: "0.85rem", fontWeight: "600" }}>
                  🏷️ STATUTORY CATEGORY: {category.toUpperCase()}
                </span>
              </div>
            )}

            {/* Case Understanding Card */}
            {caseReasoning && (
              <div className="docket-card" style={{ borderLeft: "4px solid var(--accent-brass)" }}>
                <h3 className="font-serif text-brass" style={{ margin: "0 0 12px 0", fontSize: "1.15rem" }}>
                  🧩 Case Understanding & Factual Representation (Module 1)
                </h3>
                <p style={{ color: "var(--text-parchment)", fontSize: "0.95rem", marginBottom: "14px", fontStyle: "italic" }}>
                  "{caseReasoning.case_summary}"
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.88rem" }}>
                  <div>
                    <strong className="text-brass">Established Facts:</strong>
                    <ul style={{ margin: "6px 0 0 18px", padding: 0, color: "var(--text-parchment)" }}>
                      {caseReasoning.facts?.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-brass">Legal Issues Identified:</strong>
                    <ul style={{ margin: "6px 0 0 18px", padding: 0, color: "var(--text-parchment)" }}>
                      {caseReasoning.legal_issues?.map((iss, i) => <li key={i}>{iss}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Hybrid Retrieval Card */}
            {retrieval && (
              <div className="docket-card" style={{ borderLeft: "4px solid #3b82f6" }}>
                <h3 className="font-serif" style={{ color: "#60a5fa", margin: "0 0 12px 0", fontSize: "1.15rem" }}>
                  📖 Hybrid Legal Knowledge Retrieval (Module 2)
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", fontSize: "0.85rem" }}>
                  <div>
                    <strong style={{ color: "#93c5fd" }}>Statutory Sections ({retrieval.statutory_sections?.length}):</strong>
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, color: "var(--text-parchment)" }}>
                      {retrieval.statutory_sections?.map((s, i) => <li key={i}><strong>{s.section}</strong>: {s.title}</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong style={{ color: "#93c5fd" }}>Official Rules ({retrieval.official_rules?.length}):</strong>
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, color: "var(--text-parchment)" }}>
                      {retrieval.official_rules?.map((r, i) => <li key={i}><strong>{r.rule}</strong> ({r.document_name})</li>)}
                    </ul>
                  </div>
                  <div>
                    <strong style={{ color: "#93c5fd" }}>Verified Precedents ({retrieval.verified_precedents?.length}):</strong>
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, color: "var(--text-parchment)" }}>
                      {retrieval.verified_precedents?.map((p, i) => <li key={i}><em>{p.case_name}</em> ({p.citation})</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Balance Bar Element */}
            {(support || oppose || judge) && (
              <BalanceBar position={getBalancePosition()} label="Evidentiary Balance of Probability" animated={true} />
            )}

            {/* Dual Counsel Arguments */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                {supportLoading ? (
                  <div className="docket-card petitioner-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="gavel-icon-animated">🟢</span>
                      <h3 className="font-serif" style={{ color: "var(--courtroom-green-bright)", margin: 0 }}>
                        Petitioner Counsel Filing Numbered Debate Points...
                      </h3>
                    </div>
                  </div>
                ) : (
                  <SupportCard data={support} />
                )}
              </div>

              <div>
                {opposeLoading ? (
                  <div className="docket-card respondent-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="gavel-icon-animated">🔴</span>
                      <h3 className="font-serif" style={{ color: "var(--courtroom-red-bright)", margin: 0 }}>
                        Respondent Counsel Preparing Numbered Counter-Points...
                      </h3>
                    </div>
                  </div>
                ) : (
                  <OpposeCard data={oppose} />
                )}
              </div>
            </div>

            {/* Bench Verdict Card & Actions */}
            <div>
              {judgeLoading ? (
                <div className="docket-card bench-panel">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="gavel-icon-animated">🔨</span>
                    <h3 className="font-serif text-brass" style={{ margin: 0 }}>
                      The Judicial Bench Adjudicating Debate Points & Proof Checklist...
                    </h3>
                  </div>
                </div>
              ) : (
                judge && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <JudgeCard data={judge} />

                    {/* Verdict Export & Action Toolbar */}
                    <div className="docket-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderColor: "var(--brass)" }}>
                      <div>
                        <span className="font-mono text-brass" style={{ fontSize: "0.8rem" }}>COURT ORDER ACTIONS</span>
                        <h4 className="font-serif text-parchment" style={{ margin: "4px 0 0 0" }}>Adjudication Complete</h4>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                          onClick={() => setShowGraph(!showGraph)}
                          className="btn-theme-toggle"
                        >
                          {showGraph ? "Hide Citation Graph" : "📊 View Citation Graph"}
                        </button>
                        <button
                          onClick={handleDownloadPDF}
                          disabled={downloading}
                          className="btn-outline-brass"
                        >
                          {downloading ? "Generating PDF..." : "📄 Download Court Order PDF"}
                        </button>
                      </div>
                    </div>

                    {/* Inline Debate Analysis Graph Toggle */}
                    {showGraph && (
                      <div className="docket-card">
                        <DebateAnalysisGraph supportData={support} opposeData={oppose} judgeData={judge} loading={isAnalyzing} />
                      </div>
                    )}

                    {/* Feedback Rating Widget */}
                    <div className="docket-card">
                      <h4 className="font-serif text-brass" style={{ margin: "0 0 12px 0" }}>Accuracy Feedback Audit</h4>
                      {feedbackDone ? (
                        <p className="font-mono text-brass" style={{ fontSize: "0.85rem", margin: 0 }}>
                          ✓ Thank you! Your feedback has been logged for alignment analytics.
                        </p>
                      ) : (
                        <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", gap: "12px" }}>
                            <button
                              type="button"
                              onClick={() => setFeedbackRating("thumbs_up")}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: feedbackRating === "thumbs_up" ? "1px solid var(--support-green)" : "1px solid var(--line)",
                                backgroundColor: feedbackRating === "thumbs_up" ? "var(--support-bg)" : "transparent",
                                color: feedbackRating === "thumbs_up" ? "var(--support-green-bright)" : "var(--ink-muted)",
                                cursor: "pointer"
                              }}
                            >
                              👍 Thumbs Up (Accurate Verdict)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFeedbackRating("thumbs_down")}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: feedbackRating === "thumbs_down" ? "1px solid var(--oppose-oxblood)" : "1px solid var(--line)",
                                backgroundColor: feedbackRating === "thumbs_down" ? "var(--oppose-bg)" : "transparent",
                                color: feedbackRating === "thumbs_down" ? "var(--oppose-oxblood-bright)" : "var(--ink-muted)",
                                cursor: "pointer"
                              }}
                            >
                              👎 Thumbs Down (Inaccurate Verdict)
                            </button>
                          </div>
                          {feedbackRating && (
                            <div style={{ display: "flex", gap: "12px" }}>
                              <input
                                type="text"
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                                placeholder="Optional feedback comment on statutory reasoning..."
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid var(--line)",
                                  backgroundColor: "var(--bg)",
                                  color: "var(--ink)",
                                  fontSize: "0.85rem"
                                }}
                              />
                              <button type="submit" className="btn-outline-brass">
                                Submit Feedback
                              </button>
                            </div>
                          )}
                        </form>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}