// API-route: Semantisk sökning med embeddings
// Denna route tar emot en textprompt och returnerar liknande ljud/soundscapes baserat på embeddings.
//
// Funktion:
// 1. Tar emot en prompt från användaren (POST-request)
// 2. Genererar en embedding för prompten (dummy eller via OpenAI/Supabase)
// 3. Jämför embedding mot lagrade soundscapes och returnerar de mest lika
//
// För vidareutveckling:
// - Byt ut getEmbedding mot riktig embedding från OpenAI eller Supabase Vector
// - Lagra riktiga embeddings för soundscapes i en databas
// - Utvärdera precision och användbarhet

import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_EMBEDDING_URL = process.env.OLLAMA_EMBEDDING_URL || 'http://localhost:11434/api/embeddings';
const OLLAMA_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

// Helper: Bygg absolut URL till intern API-route
function getAbsoluteUrl(req: NextRequest, path: string) {
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}${path}`;
}

// Helper: Fetch sounds from FreeSound API route
async function fetchFreeSoundClips(req: NextRequest, query: string) {
  const url = getAbsoluteUrl(req, `/api/freesound?query=${encodeURIComponent(query)}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('FreeSound API error:', res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    // Säkerställ att varje clip har en tags-array
    return (data.results || []).map((clip: any) => ({
      ...clip,
      tags: Array.isArray(clip.tags) ? clip.tags : [],
    }));
  } catch (err) {
    console.error('FreeSound API fetch failed:', err);
    return [];
  }
}

// Helper: Get embedding from Ollama
async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(OLLAMA_EMBEDDING_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: text,
    }),
  });
  if (!res.ok) throw new Error('Ollama embedding failed');
  const data = await res.json();
  return data.embedding;
}

// Helper: Cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ results: [] });

  // 1. Hämta topp 10 FreeSound-klipp
  const clips = await fetchFreeSoundClips(req, prompt);
  const topClips = clips.slice(0, 7);

  // 2. Hämta embedding för prompt
  let promptEmbedding: number[];
  try {
    promptEmbedding = await getEmbedding(prompt);
  } catch (err) {
    console.error('Ollama embedding error:', err);
    return NextResponse.json({ results: [] });
  }

  // 3. Hämta embedding för varje klipp (namn + tags)
  const clipEmbeddings = await Promise.all(
    topClips.map(async (clip: any) => {
      const text = `${clip.name} ${clip.tags.join(' ')}`;
      try {
        const embedding = await getEmbedding(text);
        return { ...clip, embedding };
      } catch {
        return { ...clip, embedding: null };
      }
    })
  );

  // 4. Jämför och sortera efter kosinuslikhet
  const scored = clipEmbeddings
    .filter(c => Array.isArray(c.embedding))
    .map(c => ({ ...c, similarity: cosineSimilarity(promptEmbedding, c.embedding) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  return NextResponse.json({ results: scored });
}

