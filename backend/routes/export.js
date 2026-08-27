import express from "express";
import { Thread } from "../models/Thread.js";
import { generateVerdictPDF } from "../services/pdfGenerator.js";
import { optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

async function handlePdfExport(req, res) {
  try {
    const { threadId } = req.params;
    const turnIdxParam = req.params.turnIndex !== undefined ? parseInt(req.params.turnIndex, 10) : 0;
    const turnIndex = isNaN(turnIdxParam) ? 0 : turnIdxParam;

    if (!threadId || typeof threadId !== "string") {
      return res.status(400).json({ error: "Valid threadId is required." });
    }

    const thread = await Thread.findOne({ threadId });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found." });
    }

    if (!thread.turns || thread.turns.length === 0) {
      return res.status(404).json({ error: "No turns found for this case thread." });
    }

    if (turnIndex < 0 || turnIndex >= thread.turns.length) {
      return res.status(400).json({ error: "Invalid turn index." });
    }

    const filename = `LexAgent_Verdict_${threadId}_Turn${turnIndex + 1}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const pdfStream = generateVerdictPDF(threadId, turnIndex, thread);
    pdfStream.pipe(res);
  } catch (err) {
    console.error("⚠️ Error generating verdict PDF:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error generating PDF report." });
    }
  }
}

/**
 * GET /api/export/pdf/:threadId
 * GET /api/export/pdf/:threadId/:turnIndex
 * Export court-formatted PDF report for a specific case turn.
 */
router.get("/pdf/:threadId", optionalProtect, handlePdfExport);
router.get("/pdf/:threadId/:turnIndex", optionalProtect, handlePdfExport);

/**
 * GET /api/export/citation-graph/:threadId
 * Generate network node-link graph data (nodes & edges) for cited legal authorities in a thread.
 */
router.get("/citation-graph/:threadId", optionalProtect, async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await Thread.findOne({ threadId });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found." });
    }

    const nodesMap = new Map();
    const edges = [];

    // Always include CPA 2019 Root Node
    nodesMap.set("root_cpa2019", {
      id: "root_cpa2019",
      label: "Consumer Protection Act, 2019",
      group: "Act",
      val: 20
    });

    (thread.turns || []).forEach((turn, idx) => {
      const sources = turn.judge?.sources || [];
      const turnNodeId = `turn_${idx + 1}`;

      nodesMap.set(turnNodeId, {
        id: turnNodeId,
        label: `Turn #${idx + 1}`,
        group: "Turn",
        val: 12
      });

      edges.push({ source: "root_cpa2019", target: turnNodeId, value: 2 });

      sources.forEach((src) => {
        const nodeId = `source_${(src.identifier || src.title).replace(/[^a-zA-Z0-9_]/g, "_")}`;
        if (!nodesMap.has(nodeId)) {
          nodesMap.set(nodeId, {
            id: nodeId,
            label: `${src.identifier || src.title}`,
            group: src.type || "Statute",
            val: src.type === "PRECEDENT" ? 15 : 10
          });
        }

        edges.push({
          source: turnNodeId,
          target: nodeId,
          value: 1
        });
      });
    });

    return res.status(200).json({
      threadId,
      nodes: Array.from(nodesMap.values()),
      edges
    });
  } catch (err) {
    console.error("⚠️ Error building citation graph data:", err.message);
    return res.status(500).json({ error: "Server error generating citation graph." });
  }
});

export default router;
