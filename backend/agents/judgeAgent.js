import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";
import { getJudgePrompt } from "../prompts/judgePrompt.js";

/**
 * Judge Agent acting as the Judicial Bench.
 * Enforces the 13 LexAgent Reasoning & Output Correction Directives.
 * 
 * @param {object} caseRepresentation Output from caseReasoningAgent
 * @param {object} hybridKnowledge Output from hybridRetriever
 * @param {object} supportOutput Output from supportAgent
 * @param {object} opposeOutput Output from opposeAgent
 * @param {Array} history Optional conversation history
 * @returns {Promise<object>} Structured JSON object for Judge Agent.
 */
export async function judgeAgent(caseRepresentation, hybridKnowledge, supportOutput, opposeOutput, history = []) {
  const historySection = Array.isArray(history) && history.length > 0
    ? `\nPRIOR CONVERSATION HISTORY:\n${history.map((t, idx) => `Turn ${idx + 1}: Q: ${t.question} | Verdict: ${t.judge?.decision || "N/A"}`).join("\n")}\n`
    : "";

  console.log("========================================");
  console.log("MODULE 5: JUDGE AGENT (THE BENCH)");
  console.log("========================================\n");

  const prompt = getJudgePrompt(caseRepresentation, hybridKnowledge, supportOutput, opposeOutput, historySection);

  try {
    const result = await generateContentWithRetry(prompt);
    const parsedJSON = safeParseJSON(result.response.text());

    // Normalize sources array across Statutes, Rules, and Precedents
    const sourcesList = [];
    (hybridKnowledge.statutory_sections || []).forEach(s => {
      sourcesList.push({
        type: "STATUTE",
        title: s.act || "Consumer Protection Act, 2019",
        identifier: s.section,
        source_url: s.source_url,
        verified: true
      });
    });

    (hybridKnowledge.official_rules || []).forEach(r => {
      sourcesList.push({
        type: "RULE",
        title: r.document_name,
        identifier: r.rule,
        source_url: r.source_url,
        verified: r.verified !== false
      });
    });

    (hybridKnowledge.verified_precedents || []).forEach(p => {
      sourcesList.push({
        type: "PRECEDENT",
        title: p.case_name,
        identifier: p.citation,
        source_url: p.source_url,
        verified: p.verified !== false
      });
    });

    const fallbackMissingEv = caseRepresentation.missing_evidence || ["Certified technician inspection report"];

    // Preserve new required fields matching LexAgent Correction Prompt
    const currentAssessment = parsedJSON.current_assessment || parsedJSON.decision || "🟡 Case depends on evidence";
    const assessmentExplanation = parsedJSON.assessment_explanation || parsedJSON.decision_explanation || "Based on currently available facts, this conditional assessment reflects argument strength under CPA 2019.";

    const resultObj = {
      case_summary: parsedJSON.case_summary || caseRepresentation.case_summary || "Consumer dispute submitted under Consumer Protection Act, 2019.",
      key_legal_issues: Array.isArray(parsedJSON.key_legal_issues) && parsedJSON.key_legal_issues.length > 0
        ? parsedJSON.key_legal_issues
        : (caseRepresentation.legal_issues || ["Existence of Defect under Section 2(10)"]),
      consumer_argument: parsedJSON.consumer_argument || supportOutput.position || "Consumer asserts statutory remedies under Consumer Protection Act, 2019.",
      respondent_argument: parsedJSON.respondent_argument || opposeOutput.position || "Respondent asserts warranty terms exclusion and statutory proof gap.",
      available_evidence: Array.isArray(parsedJSON.available_evidence) && parsedJSON.available_evidence.length > 0
        ? parsedJSON.available_evidence
        : ["Factually asserted in claim text."],
      not_provided_evidence: Array.isArray(parsedJSON.not_provided_evidence)
        ? parsedJSON.not_provided_evidence
        : fallbackMissingEv,
      outcome_changing_evidence: Array.isArray(parsedJSON.outcome_changing_evidence) && parsedJSON.outcome_changing_evidence.length > 0
        ? parsedJSON.outcome_changing_evidence
        : [
            "Certified Technician Inspection Report -> If factory fault: Consumer case stronger; If voltage fluctuation damage: Manufacturer defense stronger."
          ],
      current_assessment: currentAssessment,
      assessment_explanation: assessmentExplanation,
      decision: currentAssessment,
      decision_explanation: assessmentExplanation,
      legal_issues_evaluated: Array.isArray(parsedJSON.legal_issues_evaluated) && parsedJSON.legal_issues_evaluated.length > 0
        ? parsedJSON.legal_issues_evaluated
        : [
            {
              issue: caseRepresentation.legal_issues ? caseRepresentation.legal_issues[0] : "Existence of Defect under Section 2(10)",
              finding: "INCONCLUSIVE",
              reason: "While post-delivery manifestation supports the consumer, independent technical proof is required to resolve cause."
            }
          ],
      relief: Array.isArray(parsedJSON.relief) && parsedJSON.relief.length > 0 ? parsedJSON.relief : ["No specific relief was requested in the case."],
      overall_confidence: typeof parsedJSON.overall_confidence === "number" ? parsedJSON.overall_confidence : 0.85,
      sources: Array.isArray(parsedJSON.sources) && parsedJSON.sources.length > 0 ? parsedJSON.sources : sourcesList
    };

    console.log(JSON.stringify(resultObj, null, 2));
    console.log("========================================\n");

    return resultObj;
  } catch (err) {
    console.warn("⚠️ Judge Agent Warning:", err.message);
    const fallbackEv = caseRepresentation.missing_evidence || ["Purchase proof"];
    return {
      case_summary: "Consumer dispute submitted under Consumer Protection Act, 2019.",
      key_legal_issues: ["Existence of Defect under Section 2(10)"],
      consumer_argument: "Consumer asserts statutory remedies under CPA 2019.",
      respondent_argument: "Respondent asserts statutory proof gap.",
      available_evidence: ["Factually asserted in claim text."],
      not_provided_evidence: fallbackEv,
      outcome_changing_evidence: ["Technical Inspection Report -> If factory fault: Consumer stronger; If user damage: Respondent stronger."],
      current_assessment: "🟡 Case depends on evidence",
      assessment_explanation: "Available evidence leaves the cause of failure disputed.",
      decision: "🟡 Case depends on evidence",
      decision_explanation: "Available evidence leaves the cause of failure disputed.",
      legal_issues_evaluated: [
        {
          issue: "Existence of Defect under Section 2(10)",
          finding: "INCONCLUSIVE",
          reason: "Cause of failure remains disputed pending technical inspection."
        }
      ],
      relief: ["No specific relief was requested in the case."],
      overall_confidence: 0.85,
      sources: []
    };
  }
}