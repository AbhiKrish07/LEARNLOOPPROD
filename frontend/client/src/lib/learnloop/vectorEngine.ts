/**
 * LearnLoop Vector Embedding & Semantic Retrieval Engine
 * --------------------------------------------------------
 * Manages semantic chunking, vector hashing, local embedding cache,
 * scope filtering, and semantic similarity search for notebook content.
 */

export interface VectorChunk {
  chunkId: string;
  sourceId: string; // notebookId / pageId / sourceId
  scope: "notebook" | "source" | "concept";
  conceptId?: string;
  content: string;
  hash: string;
  embedding: number[];
  updatedAt: number;
}

const VECTOR_CACHE_KEY = "learnloop_vector_cache";

/**
 * Deterministic TF-IDF / Trigram feature vector generator for offline semantic search
 */
export function generateFeatureVector(text: string, dimensions: number = 64): number[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words = normalized.split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  // Normalize L2 length
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || !vecA.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

export class LearnLoopVectorCache {
  private chunks: Map<string, VectorChunk> = new Map();

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      const raw = localStorage.getItem(VECTOR_CACHE_KEY);
      if (raw) {
        const parsed: VectorChunk[] = JSON.parse(raw);
        for (const c of parsed) {
          this.chunks.set(c.chunkId, c);
        }
      }
    } catch (e) {
      console.warn("Failed to load vector cache", e);
    }
  }

  private saveCache() {
    try {
      const list = Array.from(this.chunks.values());
      localStorage.setItem(VECTOR_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save vector cache", e);
    }
  }

  public indexText(sourceId: string, content: string, conceptId?: string, scope: "notebook" | "source" | "concept" = "notebook"): VectorChunk {
    const chunkId = `chunk_${sourceId}_${conceptId || "gen"}`;
    const hash = `${content.length}_${content.slice(0, 20)}`;
    const existing = this.chunks.get(chunkId);

    if (existing && existing.hash === hash) {
      return existing;
    }

    const embedding = generateFeatureVector(content);
    const chunk: VectorChunk = {
      chunkId,
      sourceId,
      scope,
      conceptId,
      content,
      hash,
      embedding,
      updatedAt: Date.now()
    };

    this.chunks.set(chunkId, chunk);
    this.saveCache();
    return chunk;
  }

  public search(query: string, conceptId?: string, topK: number = 3): { chunk: VectorChunk; score: number }[] {
    const queryVector = generateFeatureVector(query);
    const results: { chunk: VectorChunk; score: number }[] = [];

    for (const chunk of Array.from(this.chunks.values())) {
      if (conceptId && chunk.conceptId && chunk.conceptId !== conceptId) {
        continue;
      }
      const score = cosineSimilarity(queryVector, chunk.embedding);
      if (score > 0.1) {
        results.push({ chunk, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  public invalidate(sourceId: string) {
    for (const [id, chunk] of Array.from(this.chunks.entries())) {
      if (chunk.sourceId === sourceId) {
        this.chunks.delete(id);
      }
    }
    this.saveCache();
  }
}

export const vectorCache = new LearnLoopVectorCache();
