/**
 * Prompt builder for Judge Agent (The Bench).
 * Enforces structured predicted judgment with final statutory ruling and orders.
 */
export function getJudgePrompt(caseRepresentation, hybridKnowledge, supportOutput, opposeOutput, historySection = "") {
  const supportSem = supportOutput.semantic_grounding_report || { summary: {} };
  const opposeSem = opposeOutput.semantic_grounding_report || { summary: {} };

  const supportContradicted = (supportSem.results || [])
    .filter((r) => r.verdict === "contradicted")
    .map((r) => `${r.cited_section}: "${r.claim_sentence}" (${r.explanation})`);

  const opposeContradicted = (opposeSem.results || [])
    .filter((r) => r.verdict === "contradicted")
    .map((r) => `${r.cited_section}: "${r.claim_sentence}" (${r.explanation})`);

  const semanticGroundingSection = `
SEMANTIC GROUNDING FACT-CHECKING AUDIT:
- Support Counsel Claims: ${supportSem.summary.entailed || 0} Entailed, ${supportSem.summary.contradicted || 0} Contradicted, ${supportSem.summary.unsupported || 0} Unsupported.
${supportContradicted.length > 0 ? `⚠️ Contradicted Support Claims: ${supportContradicted.join("; ")}` : "All support citations verified."}

- Oppose Counsel Claims: ${opposeSem.summary.entailed || 0} Entailed, ${opposeSem.summary.contradicted || 0} Contradicted, ${opposeSem.summary.unsupported || 0} Unsupported.
${opposeContradicted.length > 0 ? `⚠️ Contradicted Oppose Claims: ${opposeContradicted.join("; ")}` : "All oppose citations verified."}

JUDICIAL MANDATE: Disregard claims flagged as "contradicted" by the semantic grounding validator.
`;

  return `
ROLE & JUDICIAL MANDATE:
You are the Lead Judicial Bench for the Consumer Disputes Redressal Commission in LexAgent (Consumer Protection Act, 2019).

PREDICTED JUDGMENT MANDATE:
Synthesize all arguments from Petitioner Counsel and Respondent Counsel to deliver a clear, definitive PREDICTED JUDGMENT at the bottom of the order.

${historySection}
${semanticGroundingSection}

CASE_REPRESENTATION:
${JSON.stringify(caseRepresentation, null, 2)}

RETRIEVED_LEGAL_KNOWLEDGE:
${JSON.stringify(hybridKnowledge.statutory_sections || [], null, 2)}
${JSON.stringify(hybridKnowledge.official_rules || [], null, 2)}
${JSON.stringify(hybridKnowledge.verified_precedents || [], null, 2)}

SUPPORT_COUNSEL_ARGUMENTS:
${JSON.stringify(supportOutput, null, 2)}

OPPOSE_COUNSEL_ARGUMENTS:
${JSON.stringify(opposeOutput, null, 2)}

Return ONLY a valid JSON object matching this structure (no markdown, no code fences):

{
  "case_summary": "<2-4 sentence short, clear case summary>",
  "key_legal_issues": [
    "1. Defect & Deficiency Determination under Section 2(10) & 2(11)",
    "2. Statutory Liability & Redressal under Section 39",
    "3. Evidentiary Proof Sufficiency under Section 38"
  ],
  "consumer_argument": "<2-3 sentence strongest consumer argument>",
  "respondent_argument": "<2-3 sentence strongest respondent defense>",
  "available_evidence": [
    "<Evidence explicitly provided>"
  ],
  "not_provided_evidence": [
    "<Important missing evidence item>"
  ],
  "outcome_changing_evidence": [
    "<Evidence Item> -> If [supports consumer fact]: Consumer case stronger; If [supports respondent fact]: Respondent defense stronger"
  ],
  "current_assessment": "🟢 Consumer case stronger|🔴 Respondent case stronger|🟡 Case depends on evidence",
  "assessment_explanation": "<2-4 sentence concise specific explanation of why consumer/respondent is stronger or why evidence is decisive>",
  "legal_issues_evaluated": [
    {
      "issue": "<Issue title>",
      "finding": "PROVED|LIKELY|NOT PROVED|INCONCLUSIVE",
      "reason": "<1-2 sentence specific evaluation of this issue>"
    }
  ],
  "predicted_judgment": {
    "verdict_title": "🟢 PREDICTED JUDGMENT: CONSUMER DISPUTE ALLOWED IN FAVOR OF PETITIONER",
    "ruling_summary": "The Commission holds the Respondent liable for deficiency of service and defect under Consumer Protection Act, 2019.",
    "relief_awarded": [
      "1. Direct refund of total consideration amount along with 9% interest per annum from filing date.",
      "2. Award of Rs. 15,000 compensation for mental agony, distress, and inconvenience suffered by consumer.",
      "3. Award of Rs. 5,000 towards litigation expenses incurred by the complainant."
    ],
    "statutory_sections_applied": [
      "Section 2(10) Defect in Goods",
      "Section 2(11) Deficiency of Service",
      "Section 39 Orders of District Commission",
      "Section 83 Product Liability Action"
    ],
    "final_orders": "The Respondent is directed to comply with the above directions within 30 days from the date of receipt of this order."
  },
  "decision": "🟢 Consumer case stronger|🔴 Respondent case stronger|🟡 Case depends on evidence",
  "decision_explanation": "<2-4 sentence concise explanation>",
  "relief": [
    "Full refund of purchase consideration",
    "Compensation for mental agony",
    "Litigation costs"
  ],
  "overall_confidence": 0.88,
  "sources": [
    {
      "type": "STATUTE",
      "title": "Consumer Protection Act, 2019",
      "identifier": "Section 39",
      "verified": true
    }
  ]
}
`;
}
