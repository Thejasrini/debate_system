import { generateContentWithRetry } from "../services/gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";
import { getOpposePrompt } from "../prompts/opposePrompt.js";

/**
 * Oppose Agent representing Respondent Counsel.
 * 
 * @param {object} caseRepresentation Output from caseReasoningAgent
 * @param {object} hybridKnowledge Output from hybridRetriever
 * @param {Array} history Optional conversation history
 * @returns {Promise<object>} Structured JSON object for Oppose Agent.
 */
export async function opposeAgent(caseRepresentation, hybridKnowledge, history = []) {
  const historySection = Array.isArray(history) && history.length > 0
    ? `\nPRIOR CONVERSATION HISTORY:\n${history.map((t, idx) => `Turn ${idx + 1}: Q: ${t.question} | Verdict: ${t.judge?.decision || "N/A"}`).join("\n")}\n`
    : "";

  console.log("========================================");
  console.log("MODULE 4: OPPOSE AGENT (RESPONDENT COUNSEL)");
  console.log("========================================\n");

  const prompt = getOpposePrompt(caseRepresentation, hybridKnowledge, historySection);

  try {
    const result = await generateContentWithRetry(prompt);
    const parsedJSON = safeParseJSON(result.response.text());

    const resultObj = {
      position: parsedJSON.position || "Respondent position: No specific respondent defense has been established from the supplied facts.",
      arguments: Array.isArray(parsedJSON.arguments) && parsedJSON.arguments.length > 0 ? parsedJSON.arguments : [
        {
          issue: caseRepresentation.legal_issues ? caseRepresentation.legal_issues[0] : "Defense Assessment",
          argument: "Statutory orders under consumer law require formal proof and satisfaction of statutory conditions.",
          legal_basis: ["Section 39 Evidentiary Requirements"],
          supporting_evidence: ["No repair/warranty facts provided in case model."],
          precedents: [],
          strength: "Burden of proof rests on complainant under Section 39.",
          weakness: "No documented terms supplied by respondent in record."
        }
      ],
      overall_strengths: Array.isArray(parsedJSON.overall_strengths) ? parsedJSON.overall_strengths : ["Burden of proof rests on complainant"],
      overall_weaknesses: Array.isArray(parsedJSON.overall_weaknesses) ? parsedJSON.overall_weaknesses : ["Lack of documented terms in record"],
      missing_evidence: Array.isArray(parsedJSON.missing_evidence) ? parsedJSON.missing_evidence : ["Documentary proof of terms"]
    };

    console.log(JSON.stringify(resultObj, null, 2));
    console.log("========================================\n");

    return resultObj;
  } catch (err) {
    console.warn("⚠️ Oppose Agent Warning:", err.message);
    return {
      position: "Respondent position: No specific respondent defense has been established from the supplied facts.",
      arguments: [
        {
          issue: "Defense Assessment",
          argument: "Statutory claims under consumer protection law require formal documentary evidence.",
          legal_basis: ["Section 39"],
          supporting_evidence: ["No warranty facts provided."],
          precedents: [],
          strength: "Statutory burden of proof gap.",
          weakness: "No written terms supplied."
        }
      ],
      overall_strengths: ["Burden of proof gap"],
      overall_weaknesses: ["Documentary evidence unverified"],
      missing_evidence: ["Formal proof of terms"]
    };
  }
}