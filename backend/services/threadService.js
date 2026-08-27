import { Thread } from "../models/Thread.js";
import mongoose from "mongoose";

// In-memory fallback map if MongoDB is offline
const memoryStore = new Map();

/**
 * Retrieves thread document by threadId.
 * @param {string} threadId 
 * @returns {Promise<{threadId: string, turns: Array}>}
 */
export async function getThread(threadId) {
  if (!threadId) return null;

  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Thread.findOne({ threadId }).lean();
      if (doc) return doc;
    } catch (err) {
      console.warn("⚠️ MongoDB getThread warning:", err.message);
    }
  }

  // Fallback to in-memory store
  return memoryStore.get(threadId) || { threadId, turns: [] };
}

/**
 * Saves a new turn to a thread document with user association.
 * @param {string} threadId 
 * @param {object} turnData { question, retrievedContext, support, oppose, judge }
 * @param {string|null} userId Optional user ID owning the thread
 * @param {string} category Optional category classification
 */
export async function saveTurn(threadId, turnData, userId = null, category = "") {
  if (!threadId || !turnData) return;

  const newTurn = {
    ...turnData,
    timestamp: new Date()
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const updatePayload = {
        $push: { turns: newTurn }
      };

      // Set userId and category on thread creation / update if provided
      const setOnInsert = {};
      if (userId) setOnInsert.userId = userId;
      if (category) setOnInsert.category = category;

      if (Object.keys(setOnInsert).length > 0) {
        updatePayload.$setOnInsert = setOnInsert;
      }

      await Thread.findOneAndUpdate(
        { threadId },
        updatePayload,
        { upsert: true, new: true }
      );
      return;
    } catch (err) {
      console.warn("⚠️ MongoDB saveTurn warning:", err.message);
    }
  }

  // Fallback to in-memory store
  const existing = memoryStore.get(threadId) || { threadId, userId, category, turns: [] };
  if (userId && !existing.userId) existing.userId = userId;
  if (category && !existing.category) existing.category = category;
  existing.turns.push(newTurn);
  memoryStore.set(threadId, existing);
}
