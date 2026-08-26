export default function JudgeCard({ data }) {
  if (!data) return null;

  const keyIssues = Array.isArray(data.key_legal_issues) ? data.key_legal_issues : [];
  const availableEv = Array.isArray(data.available_evidence) ? data.available_evidence : [];
  const notProvidedEv = Array.isArray(data.not_provided_evidence) ? data.not_provided_evidence : [];
  const outcomeChangingEv = Array.isArray(data.outcome_changing_evidence) ? data.outcome_changing_evidence : [];
  const sourcesList = Array.isArray(data.sources) ? data.sources : [];

  const assessment = data.current_assessment || "🟡 Case depends on evidence";
  
  const assessmentColor =
    assessment.includes("Consumer")
      ? "#52B788"
      : assessment.includes("Respondent")
      ? "#E63946"
      : "#C9A961";

  return (
    <div className="docket-card bench-panel" style={{ marginTop: "16px", borderTop: `4px solid ${assessmentColor}` }}>
      
      {/* ⚖️ CASE SUMMARY */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "1.4rem" }}>⚖️</span>
          <h3 className="font-serif text-brass" style={{ margin: 0, fontSize: "1.2rem", letterSpacing: "0.5px" }}>
            CASE SUMMARY
          </h3>
        </div>
        <p style={{ fontSize: "0.98rem", color: "var(--text-parchment)", lineHeight: "1.6", margin: 0, fontStyle: "italic", backgroundColor: "rgba(15, 23, 42, 0.5)", padding: "12px 14px", borderRadius: "6px", borderLeft: "3px solid var(--accent-brass)" }}>
          "{data.case_summary || "Consumer dispute submitted under Consumer Protection Act, 2019."}"
        </p>
      </div>

      {/* 📌 KEY LEGAL ISSUES */}
      {keyIssues.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div className="font-mono text-brass" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            📌 KEY LEGAL ISSUES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {keyIssues.map((issue, idx) => (
              <div key={idx} style={{ padding: "8px 12px", backgroundColor: "var(--surface-navy)", borderRadius: "4px", border: "1px solid var(--border-hairline)", fontSize: "0.92rem", color: "var(--text-parchment)" }}>
                <strong>{idx + 1}.</strong> {issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DUAL COUNSEL ARGUMENTS (🟢 CONSUMER vs 🔴 RESPONDENT) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        
        {/* 🟢 CONSUMER ARGUMENT */}
        <div style={{ padding: "14px", backgroundColor: "rgba(46, 92, 78, 0.14)", borderRadius: "6px", border: "1px solid rgba(82, 183, 136, 0.3)" }}>
          <div className="font-mono" style={{ color: "#52B788", fontSize: "0.82rem", textTransform: "uppercase", marginBottom: "6px", fontWeight: "bold" }}>
            🟢 CONSUMER ARGUMENT
          </div>
          <p style={{ fontSize: "0.92rem", color: "var(--text-parchment)", margin: 0, lineHeight: "1.5" }}>
            {data.consumer_argument || "Asserts statutory remedy under Consumer Protection Act, 2019."}
          </p>
        </div>

        {/* 🔴 RESPONDENT ARGUMENT */}
        <div style={{ padding: "14px", backgroundColor: "rgba(139, 46, 46, 0.14)", borderRadius: "6px", border: "1px solid rgba(248, 113, 113, 0.3)" }}>
          <div className="font-mono" style={{ color: "#F87171", fontSize: "0.82rem", textTransform: "uppercase", marginBottom: "6px", fontWeight: "bold" }}>
            🔴 RESPONDENT ARGUMENT
          </div>
          <p style={{ fontSize: "0.92rem", color: "var(--text-parchment)", margin: 0, lineHeight: "1.5" }}>
            {data.respondent_argument || "Asserets warranty terms exclusion or evidentiary failure by complainant."}
          </p>
        </div>

      </div>

      {/* 📄 EVIDENCE STATUS */}
      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--surface-navy)", borderRadius: "8px", border: "1px solid var(--border-hairline)" }}>
        <div className="font-mono text-brass" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
          📄 EVIDENCE STATUS
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px", fontSize: "0.88rem" }}>
          {/* ✅ Available */}
          <div>
            <strong style={{ color: "#52B788" }}>✅ Available:</strong>
            <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "var(--text-parchment)" }}>
              {availableEv.length > 0 ? availableEv.map((item, i) => <li key={i}>{item}</li>) : <li>Factually asserted in claim text.</li>}
            </ul>
          </div>

          {/* ❌ Not Provided */}
          <div>
            <strong style={{ color: "#F87171" }}>❌ Not Provided:</strong>
            <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "var(--text-muted)" }}>
              {notProvidedEv.length > 0 ? notProvidedEv.map((item, i) => <li key={i}>{item}</li>) : <li>No critical documents missing.</li>}
            </ul>
          </div>
        </div>

        {/* ⚠️ OUTCOME-CHANGING EVIDENCE */}
        {outcomeChangingEv.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: "12px", marginTop: "8px", fontSize: "0.88rem" }}>
            <strong style={{ color: "#F59E0B" }}>⚠️ OUTCOME-CHANGING EVIDENCE:</strong>
            <ul style={{ margin: "6px 0 0 16px", padding: 0, color: "var(--text-parchment)" }}>
              {outcomeChangingEv.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* ⚖️ CURRENT ASSESSMENT */}
      <div style={{ padding: "18px", backgroundColor: "rgba(201, 169, 97, 0.12)", borderRadius: "8px", border: `2px solid ${assessmentColor}`, marginBottom: "20px" }}>
        <div className="font-mono" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", color: assessmentColor, marginBottom: "6px" }}>
          ⚖️ CURRENT ASSESSMENT
        </div>
        <h3 className="font-serif" style={{ fontSize: "1.3rem", color: assessmentColor, margin: "0 0 8px 0", fontWeight: "700" }}>
          {assessment}
        </h3>
        <p style={{ fontSize: "0.95rem", color: "var(--text-parchment)", margin: 0, lineHeight: "1.5" }}>
          {data.assessment_explanation || data.decision_explanation || "Based on currently available facts and evidence, this conditional assessment reflects the relative strength of arguments under CPA 2019."}
        </p>
      </div>

      {/* Sources Traceability Array */}
      {sourcesList.length > 0 && (
        <div style={{ padding: "12px 14px", backgroundColor: "var(--surface-navy)", borderRadius: "6px", border: "1px solid var(--border-hairline)" }}>
          <div className="font-mono text-brass" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            📚 Verified Legal Sources & Statutory Provisions ({sourcesList.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {sourcesList.map((src, i) => (
              <span key={i} className="font-mono" style={{ backgroundColor: "rgba(201, 169, 97, 0.15)", color: "var(--accent-brass)", padding: "3px 8px", borderRadius: "4px", fontSize: "0.78rem", border: "1px solid var(--accent-brass)" }}>
                📖 {src.title || src.identifier} ({src.identifier || "CPA 2019"})
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}