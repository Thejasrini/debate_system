import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Candidate Model Rotation Hierarchy
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite"
];

function timeoutPromise(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini API call timed out after ${ms / 1000}s`)), ms)
  );
}

/**
 * Robust content generator with instant model candidate rotation on 429 rate limits or timeouts.
 * 
 * @param {string} prompt 
 * @param {number} maxRetries 
 */
export async function generateContentWithRetry(prompt, maxRetries = 2) {
  for (const modelName of CANDIDATE_MODELS) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const currentModel = genAI.getGenerativeModel({ model: modelName });
        
        // Race Gemini API call against an 8-second hard timeout
        const result = await Promise.race([
          currentModel.generateContent(prompt),
          timeoutPromise(8000)
        ]);

        return result;
      } catch (error) {
        attempt++;
        const isTimeout = error.message && error.message.includes("timed out");
        const is429 = error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("Quota")));
        const is404 = error.status === 404 || (error.message && error.message.includes("404"));

        if (is429 || is404 || isTimeout) {
          console.warn(`⚠️ Model '${modelName}' (${error.message.slice(0, 60)}...). Rotating to next model...`);
          break; // Switch to next candidate model immediately!
        }

        if (attempt >= maxRetries) break;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  // Final fallback attempt with gemini-3.5-flash-lite
  const defaultModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
  return await Promise.race([
    defaultModel.generateContent(prompt),
    timeoutPromise(10000)
  ]);
}