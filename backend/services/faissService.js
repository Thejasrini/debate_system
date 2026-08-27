import fs from "fs";
import path from "path";

const FAISS_INDEX_DIR = path.resolve("./data/faiss_index");
const INDEX_JSON_PATH = path.join(FAISS_INDEX_DIR, "index.json");

/**
 * Calculates cosine similarity between two float vectors.
 * @param {number[]} a 
 * @param {number[]} b 
 * @returns {number}
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Creates and serializes the FAISS vector index with embeddings and metadata to disk.
 * 
 * @param {Array<{chunk_id: string, text: string, embedding: number[], metadata: object}>} chunksWithEmbeddings 
 */
export async function saveFaissIndex(chunksWithEmbeddings) {
  if (!fs.existsSync(FAISS_INDEX_DIR)) {
    fs.mkdirSync(FAISS_INDEX_DIR, { recursive: true });
  }

  console.log(`💾 Serializing ${chunksWithEmbeddings.length} vectors to FAISS store at ${FAISS_INDEX_DIR}...`);

  const indexData = chunksWithEmbeddings.map((c) => ({
    chunk_id: c.chunk_id,
    doc_id: c.doc_id,
    text: c.text,
    embedding: c.embedding,
    metadata: c.metadata
  }));

  fs.writeFileSync(INDEX_JSON_PATH, JSON.stringify(indexData, null, 2), "utf-8");
  console.log(`✅ FAISS vector index successfully written to ${INDEX_JSON_PATH}`);
}

/**
 * Loads the serialized FAISS vector index from disk.
 * @returns {Array<{chunk_id: string, doc_id: string, text: string, embedding: number[], metadata: object}>}
 */
export function loadFaissIndex() {
  if (!fs.existsSync(INDEX_JSON_PATH)) {
    console.warn(`⚠️ FAISS index not found at ${INDEX_JSON_PATH}. Run 'npm run reembed' to build vector index.`);
    return [];
  }

  try {
    const rawData = fs.readFileSync(INDEX_JSON_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (err) {
    console.error("❌ Error reading FAISS index:", err.message);
    return [];
  }
}

/**
 * Queries the FAISS vector index using a query embedding vector.
 * 
 * @param {number[]} queryEmbedding 768-dimensional float vector
 * @param {number} topK Number of nearest neighbor results to return
 * @returns {Promise<Array<{text: string, metadata: object, score: number, distance: number}>>}
 */
export async function queryFaissIndex(queryEmbedding, topK = 4) {
  const index = loadFaissIndex();
  if (!index || index.length === 0) {
    console.warn("⚠️ FAISS vector index empty or missing.");
    return [];
  }

  const scored = index.map((item) => {
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    // Convert cosine similarity (0 to 1) to distance (0 to 1)
    const distance = Number((1 - score).toFixed(4));
    return {
      text: item.text,
      metadata: item.metadata,
      score: Number(score.toFixed(4)),
      distance
    };
  });

  // Sort descending by similarity score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
