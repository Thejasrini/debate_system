import express from "express";
import { Thread } from "../models/Thread.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route GET /api/history
 * @desc Retrieves all case threads owned by the authenticated user
 */
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const threads = await Thread.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedThreads = threads.map((t) => ({
      threadId: t.threadId,
      category: t.category || "General Consumer Dispute",
      createdAt: t.createdAt,
      turnCount: Array.isArray(t.turns) ? t.turns.length : 0,
      firstQuestion: Array.isArray(t.turns) && t.turns.length > 0 ? t.turns[0].question : "No questions yet",
      latestTurnTimestamp: Array.isArray(t.turns) && t.turns.length > 0 ? t.turns[t.turns.length - 1].timestamp : t.createdAt
    }));

    return res.status(200).json({
      threads: formattedThreads
    });
  } catch (err) {
    console.error("❌ Error fetching user thread history:", err.message);
    return res.status(500).json({ error: "Failed to retrieve thread history." });
  }
});

/**
 * @route GET /api/history/:threadId
 * @desc Retrieves full details of a specific thread owned by the authenticated user
 */
router.get("/:threadId", protect, async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user._id;

    const thread = await Thread.findOne({ threadId, userId }).lean();
    if (!thread) {
      return res.status(404).json({
        error: "Thread not found or access denied."
      });
    }

    return res.status(200).json({
      thread
    });
  } catch (err) {
    console.error("❌ Error fetching thread by ID:", err.message);
    return res.status(500).json({ error: "Failed to retrieve thread details." });
  }
});

/**
 * @route DELETE /api/history/:threadId
 * @desc Deletes a specific thread owned by the authenticated user
 */
router.delete("/:threadId", protect, async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user._id;

    const deleted = await Thread.findOneAndDelete({ threadId, userId });
    if (!deleted) {
      return res.status(404).json({
        error: "Thread not found or access denied."
      });
    }

    return res.status(200).json({
      message: "Thread deleted successfully.",
      threadId
    });
  } catch (err) {
    console.error("❌ Error deleting thread:", err.message);
    return res.status(500).json({ error: "Failed to delete thread." });
  }
});

export default router;
