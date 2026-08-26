/**
 * Prompt builder for Oppose Agent (Respondent Counsel).
 * Grounded strictly in Consumer Protection Act, 2019.
 * Short, realistic defense arguments (2-3 sentences max per argument).
 */
export function getOpposePrompt(caseRepresentation, hybridKnowledge, historySection = "") {
  return `
ROLE & CONCISE DEFENSE MANDATE:
You are Lead Oppose Counsel representing the RESPONDENT (Seller / Manufacturer / Platform).

CRITICAL DEFENSE RULES:
1. NEVER SAY "No specific defense has been established". Derive the strongest realistic defense directly from the facts (e.g. warranty exclusions, lack of technical proof, Section 87 product liability exceptions, or user misuse allegations).
2. MAX LENGTH: Defense argument MUST be 2-3 sentences maximum. Use simple plain English.
3. STRENGTH: Exactly 1 short sentence.
4. WEAKNESS: Exactly 1 short sentence.

${historySection}
STRUCTURED_CASE_MODEL:
${JSON.stringify(caseRepresentation, null, 2)}

RETRIEVED_LEGAL_KNOWLEDGE:
${JSON.stringify(hybridKnowledge.statutory_sections || [], null, 2)}
${JSON.stringify(hybridKnowledge.official_rules || [], null, 2)}
${JSON.stringify(hybridKnowledge.verified_precedents || [], null, 2)}

Return ONLY a valid JSON object matching this structure (no code fences, no markdown):

{
  "position": "<one short sentence respondent stance>",
  "arguments": [
    {
      "issue": "<specific legal issue title>",
      "argument": "<2-3 sentence defense argument derived from facts and statutory provisions>",
      "legal_basis": [
        "Section 87 Product Liability Exceptions"
      ],
      "supporting_evidence": [
        "<evidence document or 'Warranty terms / lack of expert report'>"
      ],
      "precedents": [
        "<exact case name and citation or 'None'>"
      ],
      "strength": "<one short sentence strength>",
      "weakness": "<one short sentence weakness>"
    }
  ],
  "overall_strengths": [
    "<one short sentence defense strength>"
  ],
  "overall_weaknesses": [
    "<one short sentence defense weakness>"
  ],
  "missing_evidence": [
    "<missing document item required for defense (max 4)>"
  ]
}
`;
}
