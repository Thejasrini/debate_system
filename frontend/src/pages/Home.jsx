import { useState, useEffect } from "react";
import QuestionBox from "../components/QuestionBox";
import SupportCard from "../components/SupportCard";
import OpposeCard from "../components/OpposeCard";
import JudgeCard from "../components/JudgeCard";
import { streamDebate } from "../services/api";

export default function Home() {
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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lexagent-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).toUpperCase() + " " + now.toLocaleTimeString("en-US", { hour12: false });
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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-navy)" }}>
      
      {/* Top Header Bar */}
      <header className="docket-topbar">
        <div className="docket-title-group">
          <h1 className="font-serif text-brass" style={{ fontSize: "1.25rem", margin: 0, letterSpacing: "0.5px" }}>
            ⚖️ LEXAGENT COURTROOM TERMINAL
          </h1>
          <span className="docket-number">{caseNumber}</span>
          {getStatusPill()}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span className="font-mono text-muted" style={{ fontSize: "0.78rem" }}>
            {currentTime}
          </span>

          <button className="btn-theme-toggle" onClick={toggleTheme} title="Switch UI Theme Preference">
            {theme === "dark" ? "☀️ Light Theme" : "🌙 Dark Theme"}
          </button>

          {threadId && (
            <button className="btn-outline-brass" onClick={handleStartNewCase}>
              ➕ Start New Case
            </button>
          )}
        </div>
      </header>

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
            Corpus: <span className="text-brass">CPA 2019 + Statutory Rules + Supreme Court & NCDRC Precedents</span>
          </div>
        </div>

        {/* PAST CONVERSATION TURNS (CONTINUOUS CHAT HISTORY) */}
        {pastTurns.length > 0 && (
          <div style={{ marginBottom: "35px", display: "flex", flexDirection: "column", gap: "30px" }}>
            <div className="font-mono text-brass" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              📜 PREVIOUS COURT SESSION TURNS ({pastTurns.length})
            </div>
            {pastTurns.map((turn, turnIdx) => (
              <div key={turnIdx} style={{ padding: "20px", backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", border: "1px solid var(--border-hairline)" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span className="font-mono text-brass" style={{ fontSize: "0.8rem", backgroundColor: "rgba(201, 169, 97, 0.15)", padding: "3px 8px", borderRadius: "4px" }}>
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

        <hr className="hairline-divider" />

        {/* Error Banner */}
        {error && (
          <div style={{ padding: "16px", backgroundColor: "var(--courtroom-red-bg)", border: "1px solid var(--courtroom-red)", color: "var(--courtroom-red-bright)", borderRadius: "6px", marginBottom: "24px" }}>
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
                <span className="font-mono text-brass" style={{ backgroundColor: "var(--accent-brass-light)", padding: "4px 12px", borderRadius: "4px", border: "1px solid var(--border-hairline-bright)", fontSize: "0.85rem" }}>
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

            {/* Bench Verdict & Required Proof Checklist */}
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
                <JudgeCard data={judge} />
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}