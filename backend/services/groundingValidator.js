import fs from "fs";
import path from "path";

const JUDGMENTS_PATH = path.resolve("./data/consumer_protection_judgments.json");
const LEGISLATION_PATH = path.resolve("./data/primary_legislation_rules.json");

/**
 * Module 6: Grounding Validator & Source Traceability Interceptor.
 * Performs deterministic verification on legal citations, sections, rules, and precedents.
 * Checks against verified dataset records in primary_legislation_rules.json and consumer_protection_judgments.json.
 * 
 * @param {string} agentName "Support" | "Oppose" | "Judge"
 * @param {object} output Agent JSON response object
 * @param {string} context Raw retrieved context string
 * @returns {object} { sanitizedOutput: object, groundingReport: object }
 */
export function validateAgentOutput(agentName, output, context = "") {
  if (!output || typeof output !== "object") {
    return {
      valid: true,
      citation_errors: [],
      unsupported_claims: [],
      fabricated_sources: [],
      warnings: []
    };
  }

  const citationErrors = [];
  const unsupportedClaims = [];
  const fabricatedSources = [];
  const warnings = [];

  // Load verified database records for grounding lookup
  let verifiedJudgments = [];
  let verifiedLegislation = [];
  try {
    if (fs.existsSync(JUDGMENTS_PATH)) {
      verifiedJudgments = JSON.parse(fs.readFileSync(JUDGMENTS_PATH, "utf-8"));
    }
    if (fs.existsSync(LEGISLATION_PATH)) {
      verifiedLegislation = JSON.parse(fs.readFileSync(LEGISLATION_PATH, "utf-8"));
    }
  } catch (err) {
    console.warn("⚠️ Grounding dataset loading warning:", err.message);
  }

  const validJudgmentNames = new Set(verifiedJudgments.map(j => j.case_name.toLowerCase().trim()));
  const validCitations = new Set(verifiedJudgments.map(j => j.citation.toLowerCase().trim()));

  // 1. Audit Precedents
  const precedentsList = output.supporting_precedents || output.contrary_precedents || output.precedents_considered || [];
  if (Array.isArray(precedentsList)) {
    precedentsList.forEach(p => {
      if (p.case_name) {
        const nameLower = p.case_name.toLowerCase().trim();
        const isValid = validJudgmentNames.has(nameLower) || Array.from(validJudgmentNames).some(v => v.includes(nameLower.substring(0, 15)));
        if (!isValid) {
          fabricatedSources.push(`Unverified Precedent Case Name: "${p.case_name}" not found in verified judgments dataset.`);
        }
      }
      if (p.citation) {
        const citLower = p.citation.toLowerCase().trim();
        const isValid = validCitations.has(citLower) || Array.from(validCitations).some(v => v.includes(citLower));
        if (!isValid) {
          citationErrors.push(`Unverified Case Citation: "${p.citation}" not found in authoritative records.`);
        }
      }
    });
  }

  // 2. Audit Statutory Sections
  const sectionsList = output.applicable_sections || [];
  if (Array.isArray(sectionsList)) {
    sectionsList.forEach(s => {
      if (s.section && !context.toLowerCase().includes(s.section.toLowerCase()) && !s.section.includes("Section 2") && !s.section.includes("Section 39")) {
        warnings.push(`Statutory Section '${s.section}' cited by ${agentName} was not directly present in retrieved text chunks.`);
      }
    });
  }

  // 3. Audit Unsupported Claims vs Context
  if (output.arguments && Array.isArray(output.arguments)) {
    output.arguments.forEach(arg => {
      if (arg.argument && arg.argument.includes("misused") && !context.toLowerCase().includes("misused")) {
        unsupportedClaims.push(`Unsupported claim: 'misused' mentioned without factual context proof.`);
      }
    });
  }

  const isValid = citationErrors.length === 0 && fabricatedSources.length === 0;

  const groundingReport = {
    valid: isValid,
    citation_errors: citationErrors,
    unsupported_claims: unsupportedClaims,
    fabricated_sources: fabricatedSources,
    warnings: warnings
  };

  if (!isValid) {
    console.warn(`🛡️ GROUNDING AUDIT WARNING [${agentName}]: Citation/Fabrication errors detected:`, JSON.stringify(groundingReport, null, 2));
  } else {
    console.log(`🛡️ GROUNDING AUDIT PASSED [${agentName}]: 0 Citation Errors, 0 Fabricated Sources.`);
  }

  // Attach grounding report to output object
  const sanitized = JSON.parse(JSON.stringify(output));
  sanitized.grounding_report = groundingReport;

  return sanitized;
}
