import { generateEmbedding } from "./embedding.js";
import { queryCollection } from "./chroma.js";

/**
 * Historical term patterns that indicate older 1986 Act references in PDF appendices.
 */
const HISTORICAL_PATTERNS = [
  /district forum/i,
  /consumer protection act,?\s*1986/i,
  /act 62 of 2002/i,
  /act 50 of 1993/i
];

/**
 * Checks whether a retrieved legal chunk contains historical/older framework terminology.
 * @param {string} text 
 * @param {object} metadata 
 * @returns {boolean}
 */
export function isHistoricalChunk(text = "", metadata = {}) {
  const textMatches = HISTORICAL_PATTERNS.some((pattern) => pattern.test(text));
  const isAppendixPage = metadata.page && Number(metadata.page) > 57;
  return textMatches || (isAppendixPage && /forum/i.test(text));
}

/**
 * Normalizes Section metadata to extract specific sub-sections (e.g. Section 2(10), 2(11), 2(47))
 * instead of returning plain 'Section 2' repetitively.
 * 
 * @param {string} text 
 * @param {string} rawSection 
 * @returns {string} Precise Section Identifier
 */
export function normalizeSectionIdentifier(text = "", rawSection = "Section N/A") {
  if (!text || typeof text !== "string") return rawSection;

  // Extract explicit section numbers if present in chunk heading/body
  const specificMatch = text.match(/Section\s+\d+\s*\(\d+\)/i);
  if (specificMatch) {
    return specificMatch[0];
  }

  // Sub-section matching for Section 2 (Definitions)
  if (rawSection.trim() === "Section 2" || /definitions/i.test(text)) {
    if (/\(10\)/.test(text) || /defect/i.test(text)) return "Section 2(10)";
    if (/\(11\)/.test(text) || /deficiency/i.test(text)) return "Section 2(11)";
    if (/\(28\)/.test(text) || /misleading advertisement/i.test(text)) return "Section 2(28)";
    if (/\(47\)/.test(text) || /unfair trade practice/i.test(text)) return "Section 2(47)";
    if (/\(7\)/.test(text) || /consumer/i.test(text)) return "Section 2(7)";
    if (/\(46\)/.test(text) || /unfair contract/i.test(text)) return "Section 2(46)";
  }

  return rawSection;
}

/**
 * Retrieves the topK most relevant legal sections for a user query.
 * Prioritizes current Consumer Protection Act 2019 provisions over historical appendix text.
 * 
 * @param {string} query User question / claim
 * @param {number} topK Number of relevant legal chunks to retrieve (default: 3)
 * @returns {Promise<Array<{text: string, metadata: object, score: number, isHistorical: boolean}>>}
 */
export async function retrieveRelevantSections(query, topK = 3) {
  if (!query || typeof query !== "string" || !query.trim()) {
    throw new Error("Query must be a valid non-empty string.");
  }

  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Fetch candidate pool (4x topK to allow re-ranking non-historical 2019 provisions first)
  const candidateLimit = Math.max(topK * 4, 12);
  const queryResult = await queryCollection(queryEmbedding, candidateLimit);

  if (!queryResult || !queryResult.documents || queryResult.documents.length === 0 || queryResult.documents[0].length === 0) {
    console.log("========================================");
    console.log("LEXAGENT RETRIEVAL");
    console.log("==================");
    console.log(`Query:\n${query}\n`);
    console.log("Retrieved chunks: None");
    console.log("Relevant provision not found in indexed legal sources.");
    console.log("========================================\n");
    return [];
  }

  const documents = queryResult.documents[0] || [];
  const metadatas = queryResult.metadatas[0] || [];
  const distances = queryResult.distances ? queryResult.distances[0] : [];

  // 3. Process candidates with metadata normalization and historical detection
  const candidates = documents.map((doc, idx) => {
    const distance = distances[idx] !== undefined ? distances[idx] : 1;
    const baseScore = Number((1 / (1 + distance)).toFixed(4));

    const rawMeta = metadatas[idx] || {};
    const rawSec = rawMeta.section || "Section N/A";
    const preciseSection = normalizeSectionIdentifier(doc, rawSec);

    const metadata = {
      act: rawMeta.act || "Consumer Protection Act, 2019",
      section: preciseSection,
      raw_section: rawSec,
      title: rawMeta.title || "Legal Provision",
      page: rawMeta.page !== undefined ? Number(rawMeta.page) : 1,
      source: rawMeta.source || "Consumer_Protection_Act_2019.pdf",
      documentVersion: "2019"
    };

    const isHistorical = isHistoricalChunk(doc, metadata);

    // Apply ranking adjustments: preference for current 2019 Act sections over historical 1986 appendix text
    const adjustedScore = isHistorical ? baseScore * 0.82 : baseScore;

    return {
      text: doc,
      metadata,
      score: baseScore,
      adjustedScore,
      isHistorical
    };
  });

  // 4. Sort candidates by adjusted score descending
  candidates.sort((a, b) => b.adjustedScore - a.adjustedScore);

  // 5. Select topK results
  const selectedResults = candidates.slice(0, topK);

  // 6. Print required debug output
  console.log("========================================");
  console.log("LEXAGENT RETRIEVAL");
  console.log("==================");
  console.log(`\nQuery:\n${query}\n`);
  console.log("Retrieved chunks:\n");

  selectedResults.forEach((item, i) => {
    console.log(`[${i + 1}]`);
    console.log(`Section: ${item.metadata.section}`);
    console.log(`Title: ${item.metadata.title}`);
    console.log(`Page: ${item.metadata.page}`);
    console.log(`Source: ${item.metadata.source}`);
    console.log(`Score: ${item.score}`);
    if (item.isHistorical) {
      console.log("WARNING: POSSIBLE HISTORICAL PROVISION");
    }
    console.log("");
  });

  console.log("========================================\n");

  return selectedResults;
}
