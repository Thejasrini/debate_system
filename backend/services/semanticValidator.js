import { extractClaimSentences } from "../utils/claimExtractor.js";
import { findRetrievedTextForSection } from "../utils/sectionMatcher.js";
import { getEntailmentPrompt } from "../prompts/entailmentPrompt.js";
import { generateContentWithRetry } from "./gemini.js";
import { safeParseJSON } from "../utils/jsonHelper.js";

const MAX_CLAIMS_TO_CHECK = 8;

/**
 * Module C: Semantic Grounding Layer.
 * Performs LLM-based semantic entailment validation on all section-citing claim sentences.
 * 
 * @param {string} agentName "Support" | "Oppose" | "Judge"
 * @param {object} agentOutput Raw agent response object
 * @param {string} retrievedContext Raw retrieved statutory context
 * @returns {Promise<object>} Semantic Validation Report
 */
export async function semanticValidate(agentName, agentOutput, retrievedContext = "") {
  const resultObj = {
    agent: agentName,
    total_claims_checked: 0,
    results: [],
    summary: {
      entailed: 0,
      contradicted: 0,
      unsupported: 0
    }
  };

  if (!agentOutput || typeof agentOutput !== "object") {
    return resultObj;
  }

  const claimPairs = extractClaimSentences(agentOutput);
  if (!claimPairs || claimPairs.length === 0) {
    console.log(`🔬 [Semantic Grounding ${agentName}]: 0 claim sentences with section citations found.`);
    return resultObj;
  }

  const claimsToCheck = claimPairs.slice(0, MAX_CLAIMS_TO_CHECK);
  console.log(`🔬 [Semantic Grounding ${agentName}]: Validating ${claimsToCheck.length} claim sentence(s)...`);

  for (let i = 0; i < claimsToCheck.length; i++) {
    const pair = claimsToCheck[i];
    const sentence = pair.sentence;
    const primarySection = pair.citedSections[0] || "Section N/A";

    const textSnippet = findRetrievedTextForSection(primarySection, retrievedContext);

    if (!textSnippet) {
      console.warn(`🔬 Check [${i + 1}/${claimsToCheck.length}]: ${primarySection} — NOT IN RETRIEVED CONTEXT`);
      resultObj.results.push({
        claim_sentence: sentence,
        cited_section: primarySection,
        retrieved_text_snippet: "",
        verdict: "unsupported",
        confidence: 1.0,
        explanation: "Section not present in retrieved statutory context."
      });
      resultObj.summary.unsupported++;
      continue;
    }

    try {
      const prompt = getEntailmentPrompt(sentence, primarySection, textSnippet);
      const llmResult = await generateContentWithRetry(prompt);
      const rawText = llmResult.response.text();
      const parsed = safeParseJSON(rawText);

      const verdict = ["entailed", "contradicted", "unsupported"].includes(parsed.verdict)
        ? parsed.verdict
        : "unsupported";
      const confidence = typeof parsed.confidence === "number" ? Math.min(1.0, Math.max(0.0, parsed.confidence)) : 0.85;
      const explanation = parsed.explanation || "Entailment analysis completed.";

      console.log(`🔬 Check [${i + 1}/${claimsToCheck.length}]: ${primarySection} — verdict: ${verdict} (${confidence})`);

      resultObj.results.push({
        claim_sentence: sentence,
        cited_section: primarySection,
        retrieved_text_snippet: textSnippet.slice(0, 150) + "...",
        verdict,
        confidence,
        explanation
      });

      if (verdict === "entailed") resultObj.summary.entailed++;
      else if (verdict === "contradicted") resultObj.summary.contradicted++;
      else resultObj.summary.unsupported++;

      // Sequential delay between API calls to prevent rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      console.warn(`⚠️ Semantic check failed for "${primarySection}":`, err.message);
      resultObj.results.push({
        claim_sentence: sentence,
        cited_section: primarySection,
        retrieved_text_snippet: textSnippet.slice(0, 150) + "...",
        verdict: "unsupported",
        confidence: 0.5,
        explanation: "Validation check encountered an API error — treated as unsupported."
      });
      resultObj.summary.unsupported++;
    }
  }

  resultObj.total_claims_checked = resultObj.results.length;

  console.log(
    `🔬 [Semantic Grounding ${agentName} Complete]: ${resultObj.summary.entailed} Entailed, ${resultObj.summary.contradicted} Contradicted, ${resultObj.summary.unsupported} Unsupported`
  );

  return resultObj;
}
