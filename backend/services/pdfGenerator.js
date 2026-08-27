import PDFDocument from "pdfkit";

/**
 * Generates a court-formatted PDF document for a case verdict turn.
 * 
 * @param {string} threadId 
 * @param {number} turnIndex 
 * @param {object} threadData Thread Mongoose document or object
 * @returns {PDFDocument} PDFDocument readable stream
 */
export function generateVerdictPDF(threadId, turnIndex, threadData) {
  const doc = new PDFDocument({ margin: 54, size: "A4" });

  const turns = threadData?.turns || [];
  const turn = turns[turnIndex] || turns[turns.length - 1] || {};

  const support = turn.support || {};
  const oppose = turn.oppose || {};
  const judge = turn.judge || {};
  const category = turn.category || threadData.category || "Consumer Dispute";
  const caseRep = turn.caseRepresentation || {};

  // Header & Title
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("LexAgent Adjudication Report", { align: "center" })
    .moveDown(0.2);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text("Indian Consumer Protection Act, 2019 Legal Intelligence System", { align: "center" })
    .moveDown(0.5);

  doc.lineWidth(1).strokeColor("#333333").moveTo(54, doc.y).lineTo(541, doc.y).stroke().moveDown(0.8);

  // Metadata Box
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(`Case Thread ID: `, { continued: true })
    .font("Helvetica")
    .text(threadId)
    .font("Helvetica-Bold")
    .text(`Turn Index: `, { continued: true })
    .font("Helvetica")
    .text(`#${turnIndex + 1}`)
    .font("Helvetica-Bold")
    .text(`Category: `, { continued: true })
    .font("Helvetica")
    .text(category)
    .font("Helvetica-Bold")
    .text(`Date Generated: `, { continued: true })
    .font("Helvetica")
    .text(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }))
    .moveDown(0.8);

  doc.lineWidth(0.5).strokeColor("#cccccc").moveTo(54, doc.y).lineTo(541, doc.y).stroke().moveDown(0.8);

  // Section 1: Facts of the Case
  doc.fontSize(12).font("Helvetica-Bold").text("I. Facts of the Case").moveDown(0.4);
  doc.fontSize(10).font("Helvetica").text(turn.question || "No case query text recorded.").moveDown(0.8);

  // Section 2: Petitioner's Counsel (Support) Arguments
  doc.fontSize(12).font("Helvetica-Bold").text("II. Petitioner's Counsel (Support) Position").moveDown(0.4);
  doc.fontSize(10).font("Helvetica").text(support.position || "Consumer asserts statutory remedies under CPA 2019.").moveDown(0.4);

  if (Array.isArray(support.arguments) && support.arguments.length > 0) {
    support.arguments.forEach((arg, idx) => {
      doc
        .font("Helvetica-Bold")
        .text(`Point ${idx + 1}: ${arg.issue || "Legal Issue"}`)
        .font("Helvetica")
        .text(arg.argument || "")
        .moveDown(0.3);
    });
  }
  doc.moveDown(0.5);

  // Section 3: Respondent's Counsel (Oppose) Arguments
  doc.fontSize(12).font("Helvetica-Bold").text("III. Respondent's Counsel (Oppose) Position").moveDown(0.4);
  doc.fontSize(10).font("Helvetica").text(oppose.position || "Respondent asserts compliance with standard statutory terms.").moveDown(0.4);

  if (Array.isArray(oppose.arguments) && oppose.arguments.length > 0) {
    oppose.arguments.forEach((arg, idx) => {
      doc
        .font("Helvetica-Bold")
        .text(`Point ${idx + 1}: ${arg.issue || "Defense Point"}`)
        .font("Helvetica")
        .text(arg.argument || "")
        .moveDown(0.3);
    });
  }
  doc.moveDown(0.5);

  // Section 4: Grounding & Semantic Validation Audit
  doc.fontSize(12).font("Helvetica-Bold").text("IV. Grounding Audit & Semantic Entailment Report").moveDown(0.4);
  
  const suppGround = support.grounding_report || {};
  const oppGround = oppose.grounding_report || {};
  const suppSem = support.semantic_grounding_report?.summary || {};
  const oppSem = oppose.semantic_grounding_report?.summary || {};

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`• Support Citation Audit: ${suppGround.fabricated_sources?.length || 0} Fabricated, ${suppGround.citation_errors?.length || 0} Citation Errors.`)
    .text(`• Oppose Citation Audit: ${oppGround.fabricated_sources?.length || 0} Fabricated, ${oppGround.citation_errors?.length || 0} Citation Errors.`)
    .text(`• Semantic Entailment Summary: ${ (suppSem.entailed || 0) + (oppSem.entailed || 0) } Claims Entailed, ${ (suppSem.contradicted || 0) + (oppSem.contradicted || 0) } Contradicted.`)
    .moveDown(0.8);

  // Section 5: Judicial Evaluation (IRAC)
  doc.fontSize(12).font("Helvetica-Bold").text("V. Judicial Bench Evaluation (IRAC)").moveDown(0.4);
  
  const evaluatedIssues = judge.legal_issues_evaluated || [];
  if (evaluatedIssues.length > 0) {
    evaluatedIssues.forEach((item, idx) => {
      doc
        .font("Helvetica-Bold")
        .text(`Issue ${idx + 1}: ${item.issue || "Legal Issue"}`)
        .font("Helvetica")
        .text(`Finding: ${item.finding || "INCONCLUSIVE"}`)
        .text(`Reasoning: ${item.reason || item.law_application || "Evidentiary record evaluated against statutory provisions."}`)
        .moveDown(0.4);
    });
  } else {
    doc.fontSize(10).font("Helvetica").text("Evaluated under statutory provisions of the Consumer Protection Act, 2019.").moveDown(0.4);
  }
  doc.moveDown(0.5);

  // Section 6: Final Adjudication & Verdict
  doc.fontSize(13).font("Helvetica-Bold").fillColor("#004488").text("VI. Judicial Verdict").fillColor("#000000").moveDown(0.4);
  doc.fontSize(12).font("Helvetica-Bold").text(judge.decision || judge.current_assessment || "🟡 Case depends on evidence").moveDown(0.3);
  doc.fontSize(10).font("Helvetica").text(judge.decision_explanation || judge.assessment_explanation || "Adjudicated based on currently available facts and statutory requirements.").moveDown(0.8);

  // Section 7: Relief Granted
  doc.fontSize(12).font("Helvetica-Bold").text("VII. Statutory Relief").moveDown(0.4);
  const reliefList = Array.isArray(judge.relief) ? judge.relief : [judge.relief || "No specific relief granted."];
  reliefList.forEach((r) => doc.fontSize(10).font("Helvetica").text(`• ${r}`));
  doc.moveDown(0.8);

  // Section 8: Verified Legal Citations
  doc.fontSize(12).font("Helvetica-Bold").text("VIII. Verified Citations & Legal Sources").moveDown(0.4);
  const sources = judge.sources || [];
  if (sources.length > 0) {
    sources.forEach((s) => {
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(`[${s.type || "STATUTE"}] `, { continued: true })
        .font("Helvetica")
        .text(`${s.title || s.identifier} (${s.identifier || ""}) - ${s.verified !== false ? "✓ Verified" : "⚠ Unverified"}`);
    });
  } else {
    doc.fontSize(9).font("Helvetica").text("Consumer Protection Act, 2019 (Sections 2, 39, 84, 87).");
  }
  doc.moveDown(1.5);

  // Footer & Disclaimer
  doc.lineWidth(0.5).strokeColor("#aaaaaa").moveTo(54, doc.y).lineTo(541, doc.y).stroke().moveDown(0.5);
  doc
    .fontSize(8)
    .font("Helvetica-Oblique")
    .fillColor("#666666")
    .text(
      "DISCLAIMER: This document is generated by LexAgent, an AI-powered legal intelligence system. It provides decision support and analytical legal reasoning under the Consumer Protection Act, 2019, but does not constitute formal legal advice.",
      { align: "center" }
    );

  doc.end();
  return doc;
}
