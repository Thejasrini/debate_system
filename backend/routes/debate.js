import express from "express";
import crypto from "crypto";
import { runDebate } from "../services/orchestrator.js";
import { getThread, saveTurn } from "../services/threadService.js";
import { optionalProtect } from "../middleware/authMiddleware.js";
import { debateRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", optionalProtect, debateRateLimiter, async (req, res) => {
  try {
    const { question, threadId: reqThreadId } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Question is required and must be a non-empty string."
      });
    }

    // Assign or reuse threadId
    const activeThreadId = reqThreadId || crypto.randomUUID();
    const userId = req.user ? req.user._id : null;

    // Set Server-Sent Event (SSE) and CORS headers
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // 1. Send thread event first
    sendEvent("thread", { threadId: activeThreadId });

    // 2. Load prior thread history if existing threadId provided
    const existingThread = await getThread(activeThreadId);
    const history = existingThread && Array.isArray(existingThread.turns)
      ? existingThread.turns
      : [];

    // 3. Execute multi-agent legal debate with live event callbacks
    const finalResult = await runDebate(question.trim(), history, (event, data) => {
      sendEvent(event, data);
    });

    // 4. Save turn to database (associated with userId if logged in)
    if (finalResult && !finalResult.outOfScope) {
      await saveTurn(
        activeThreadId,
        question.trim(),
        finalResult.support,
        finalResult.oppose,
        finalResult.judge,
        userId,
        finalResult.category,
        finalResult.judge?.overall_confidence
      );
    }

    // 5. Send completion event and close SSE stream
    sendEvent("done", { threadId: activeThreadId, message: "Debate completed successfully." });
    res.end();
  } catch (err) {
    console.error("❌ Error in SSE debate route:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to process debate query. " + err.message });
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;