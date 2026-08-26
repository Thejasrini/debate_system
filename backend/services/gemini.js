import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Primary and Fallback Models to ensure fast responses under 30 seconds
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-8b",
  "gemini-3.5-flash-lite"
];

/**
 * Creates a promise that rejects after a specified timeout in ms.
 */
function timeoutPromise(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini API call timed out after ${ms / 1000}s`)), ms)
  );
}

/**
 * Robust content generator with an explicit 8-second timeout per model attempt.
 * Automatically switches models if a call takes > 8 seconds or hits a rate limit.
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
        
        // Race the Gemini API call against an 8-second hard timeout
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

        if (isTimeout || is429 || is404) {
          console.warn(`⚠️ Model '${modelName}' (${error.message}). Switching to next candidate model...`);
          break; // Switch candidate model immediately!
        }

        if (attempt >= maxRetries) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // Final fallback attempt with gemini-2.5-flash and a 10s timeout
  console.warn("⚠️ All candidate models failed or timed out. Executing final emergency attempt...");
  const defaultModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  return await Promise.race([
    defaultModel.generateContent(prompt),
    timeoutPromise(10000)
  ]);
}