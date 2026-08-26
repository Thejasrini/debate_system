import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";
import { getSupportPrompt } from "../prompts/supportPrompt.js";

/**
 * Support Agent representing Consumer Counsel.
 * 
 * @param {object} caseRepresentation Output from caseReasoningAgent
 * @param {object} hybridKnowledge Output from hybridRetriever
 * @param {Array} history Optional conversation history
 * @returns {Promise<object>} Structured JSON object for Support Agent.
 */
export async function supportAgent(caseRepresentation, hybridKnowledge, history = []) {
  const historySection = Array.isArray(history) && history.length > 0
    ? `\nPRIOR CONVERSATION HISTORY:\n${history.map((t, idx) => `Turn ${idx + 1}: Q: ${t.question} | Verdict: ${t.judge?.decision || "N/A"}`).join("\n")}\n`
    : "";

  console.log("========================================");
  console.log("MODULE 3: SUPPORT AGENT (CONSUMER COUNSEL)");
  console.log("========================================\n");

  const prompt = getSupportPrompt(caseRepresentation, hybridKnowledge, historySection);

  try {
    const result = await generateContentWithRetry(prompt);
    const parsedJSON = safeParseJSON(result.response.text());

    const resultObj = {
      position: parsedJSON.position || "The consumer seeks statutory redressal under Consumer Protection Act, 2019.",
      arguments: Array.isArray(parsedJSON.arguments) && parsedJSON.arguments.length > 0 ? parsedJSON.arguments : [
        {
          issue: caseRepresentation.legal_issues ? caseRepresentation.legal_issues[0] : "Consumer Claim",
          argument: "The consumer experienced product/service failure requiring statutory remedy under CPA 2019.",
          legal_basis: (hybridKnowledge.statutory_sections || []).map(s => `${s.section} ${s.act}`),
          supporting_evidence: caseRepresentation.evidence || ["Not specified in the case."],
          precedents: (hybridKnowledge.verified_precedents || []).map(p => `${p.case_name} (${p.citation})`),
          strength: "The delivered goods failed immediately upon purchase.",
          weakness: "Absence of independent laboratory inspection report."
        }
      ],
      overall_strengths: Array.isArray(parsedJSON.overall_strengths) ? parsedJSON.overall_strengths : ["Immediate post-delivery defect report"],
      overall_weaknesses: Array.isArray(parsedJSON.overall_weaknesses) ? parsedJSON.overall_weaknesses : ["Evidentiary verification pending"],
      missing_evidence: Array.isArray(parsedJSON.missing_evidence) ? parsedJSON.missing_evidence : caseRepresentation.missing_evidence || ["Purchase invoice"]
    };

    console.log(JSON.stringify(resultObj, null, 2));
    console.log("========================================\n");

    return resultObj;
  } catch (err) {
    console.warn("⚠️ Support Agent Warning:", err.message);
    return {
      position: "The consumer asserts statutory remedies under Consumer Protection Act, 2019.",
      arguments: [
        {
          issue: "Dispute Assessment",
          argument: "The consumer is entitled to statutory relief under the Consumer Protection Act, 2019.",
          legal_basis: ["Section 2(10)", "Section 39"],
          supporting_evidence: caseRepresentation.evidence || ["Not specified in the case."],
          precedents: [],
          strength: "Proximity of failure to purchase date.",
          weakness: "Lack of documentary evidence."
        }
      ],
      overall_strengths: ["Immediate failure after purchase"],
      overall_weaknesses: ["Documentary evidence unverified"],
      missing_evidence: ["Purchase proof"]
    };
  }
}