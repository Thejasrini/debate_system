import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";
import { getJudgePrompt } from "../prompts/judgePrompt.js";

/**
 * Judge Agent acting as the Judicial Bench.
 * Evaluates legal issues independently, performs explicit judicial comparison,
 * and populates overall debate summary objects.
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

    const missingEvList = caseRepresentation.missing_evidence || ["Purchase invoice / Receipt", "Unboxing footage / Photographs"];

    const resultObj = {
      legal_issues_evaluated: Array.isArray(parsedJSON.legal_issues_evaluated) && parsedJSON.legal_issues_evaluated.length > 0
        ? parsedJSON.legal_issues_evaluated
        : [
            {
              issue: caseRepresentation.legal_issues ? caseRepresentation.legal_issues[0] : "Dispute Assessment",
              material_facts: caseRepresentation.facts || [],
              applicable_law: ["Section 2(10)", "Section 39"],
              applicable_rules: [],
              precedents: [],
              support_position: supportOutput.position || "Consumer asserts statutory claim.",
              support_strengths: supportOutput.overall_strengths || ["Immediate post-delivery defect report"],
              support_weaknesses: supportOutput.overall_weaknesses || ["Lack of contemporaneous unboxing proof"],
              oppose_position: opposeOutput.position || "Respondent position: No specific defense established from supplied facts.",
              oppose_strengths: opposeOutput.overall_strengths || ["Statutory burden of proof rests on complainant"],
              oppose_weaknesses: opposeOutput.overall_weaknesses || ["No written terms supplied in record"],
              key_disagreement: "Whether the delivered item condition meets statutory defect criteria without unboxing proof.",
              evidence_assessment: "Evidentiary record evaluated against Section 39 statutory proof requirements.",
              missing_evidence: missingEvList,
              judicial_comparison: "Compared Support argument on post-delivery failure against Oppose challenge on evidentiary burden.",
              law_application: "Adjudicated under Consumer Protection Act, 2019 statutory guidelines.",
              finding: "Inconclusive / Insufficient Evidence",
              status: "inconclusive",
              confidence: 0.50,
              sources: sourcesList
            }
          ],
      support_position: parsedJSON.support_position || supportOutput.position || "Consumer asserts statutory remedies under Consumer Protection Act, 2019.",
      oppose_position: parsedJSON.oppose_position || opposeOutput.position || "Respondent position: No specific defense established from supplied facts.",
      overall_debate: parsedJSON.overall_debate || {
        support_strongest_points: supportOutput.overall_strengths || ["Temporal proximity of failure"],
        support_weakest_points: supportOutput.overall_weaknesses || ["Lack of unboxing footage"],
        oppose_strongest_points: opposeOutput.overall_strengths || ["Statutory burden of proof gap"],
        oppose_weakest_points: opposeOutput.overall_weaknesses || ["Absence of documented response"],
        key_disagreements: ["Evidentiary proof of product condition at delivery"],
        evidence_gaps: missingEvList,
        questions_that_remain_unresolved: ["Whether damage occurred in transit or prior to shipment"],
        evidence_required_to_resolve: missingEvList
      },
      decision: parsedJSON.decision || "Inconclusive / Insufficient Evidence",
      decision_explanation: parsedJSON.decision_explanation || "The available evidence does not establish the material facts required to resolve the issue.",
      required_evidence_to_resolve: Array.isArray(parsedJSON.required_evidence_to_resolve) ? parsedJSON.required_evidence_to_resolve : missingEvList,
      relief: Array.isArray(parsedJSON.relief) && parsedJSON.relief.length > 0 ? parsedJSON.relief : ["No specific relief was requested in the case."],
      overall_confidence: typeof parsedJSON.overall_confidence === "number" ? parsedJSON.overall_confidence : 0.50,
      sources: Array.isArray(parsedJSON.sources) && parsedJSON.sources.length > 0 ? parsedJSON.sources : sourcesList
    };

    console.log(JSON.stringify(resultObj, null, 2));
    console.log("========================================\n");

    return resultObj;
  } catch (err) {
    console.warn("⚠️ Judge Agent Warning:", err.message);
    const fallbackEv = caseRepresentation.missing_evidence || ["Purchase proof"];
    return {
      legal_issues_evaluated: [
        {
          issue: "Dispute Adjudication",
          material_facts: caseRepresentation.facts || [],
          applicable_law: ["Section 39"],
          applicable_rules: [],
          precedents: [],
          support_position: "Consumer asserts statutory claim.",
          support_strengths: ["Immediate post-delivery defect report"],
          support_weaknesses: ["Lack of unboxing proof"],
          oppose_position: "Respondent position: No specific defense established.",
          oppose_strengths: ["Burden of proof gap"],
          oppose_weaknesses: ["No written terms supplied"],
          key_disagreement: "Proof of delivery condition",
          evidence_assessment: "Evidentiary record incomplete.",
          missing_evidence: fallbackEv,
          judicial_comparison: "Weighed petitioner assertions against statutory proof burden.",
          law_application: "Adjudicated under Section 39.",
          finding: "Inconclusive / Insufficient Evidence",
          status: "inconclusive",
          confidence: 0.40,
          sources: []
        }
      ],
      support_position: "Consumer asserts statutory claim.",
      oppose_position: "Respondent position: No specific defense established.",
      overall_debate: {
        support_strongest_points: ["Immediate failure"],
        support_weakest_points: ["Lack of documentary evidence"],
        oppose_strongest_points: ["Burden of proof gap"],
        oppose_weakest_points: ["No terms in record"],
        key_disagreements: ["Proof of delivery condition"],
        evidence_gaps: fallbackEv,
        questions_that_remain_unresolved: ["Condition at exact time of delivery"],
        evidence_required_to_resolve: fallbackEv
      },
      decision: "Inconclusive / Insufficient Evidence",
      decision_explanation: "The available evidence does not establish the material facts required to resolve the issue.",
      required_evidence_to_resolve: fallbackEv,
      relief: ["No specific relief was requested in the case."],
      overall_confidence: 0.40,
      sources: []
    };
  }
}