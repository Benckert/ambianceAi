import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== OPTIMIZATION 1: IN-MEMORY CACHE =====
// Cache responses for identical keywords to avoid duplicate API calls
const responseCache = new Map<string, any>();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry {
  data: any;
  timestamp: number;
}

// ===== OPTIMIZATION 2: RATE LIMITING =====
// Track requests to avoid hitting 3 RPM limit
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 2; // Stay under 3 RPM limit

function canMakeRequest(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Remove timestamps older than 1 minute
  const recentRequests = requestTimestamps.filter(ts => ts > oneMinuteAgo);
  requestTimestamps.length = 0;
  requestTimestamps.push(...recentRequests);
  
  return recentRequests.length < MAX_REQUESTS_PER_MINUTE;
}

function recordRequest(): void {
  requestTimestamps.push(Date.now());
}

export async function POST(req: NextRequest) {
  try {
    const { keywords } = await req.json()

    if (!keywords || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: "Keywords are required" },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Normalize keywords for cache lookup
    const normalizedKeywords = keywords.trim().toLowerCase();

    // ===== CHECK CACHE FIRST =====
    const cachedEntry = responseCache.get(normalizedKeywords) as CacheEntry | undefined;
    if (cachedEntry) {
      const age = Date.now() - cachedEntry.timestamp;
      if (age < CACHE_DURATION) {
        console.log(`✅ Cache hit for: "${normalizedKeywords}"`);
        return NextResponse.json({
          success: true,
          soundscape: cachedEntry.data,
          keywords: keywords,
          cached: true,
        });
      } else {
        // Expired cache entry
        responseCache.delete(normalizedKeywords);
      }
    }

    // ===== CHECK RATE LIMIT =====
    if (!canMakeRequest()) {
      console.warn('⚠️ Rate limit reached, falling back to template mode');
      return NextResponse.json(
        { 
          error: 'Rate limit reached',
          details: 'Too many AI requests. Please wait a moment or use Template mode.',
          fallbackToTemplate: true,
        },
        { status: 429 }
      );
    }

    // ===== OPTIMIZATION 3: SHORTENED PROMPT (Reduce Token Usage) =====
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Create 3-5 sound layers for ambient soundscape. Categorize: background (0.4-0.5 vol), midground (0.3-0.4 vol), foreground (0.2-0.3 vol).
Return JSON:
{
  "layers": [
    {"searchQuery": "sound query", "category": "background", "volume": 0.45, "description": "brief"}
  ],
  "mixingNotes": "brief notes"
}`,
        },
        {
          role: "user",
          content: keywords,
        },
      ],
      temperature: 0.7,
      max_tokens: 500, // Limit response size
      response_format: { type: "json_object" },
    })

    recordRequest(); // Track this request

    const aiResponse = completion.choices[0].message.content
    if (!aiResponse) {
      throw new Error("No response from OpenAI")
    }

    const soundscapeStructure = JSON.parse(aiResponse)

    // ===== CACHE THE RESPONSE =====
    responseCache.set(normalizedKeywords, {
      data: soundscapeStructure,
      timestamp: Date.now(),
    });

    // ===== OPTIMIZATION 4: LOG TOKEN USAGE =====
    console.log(`🎵 Generated soundscape for: "${keywords}"`);
    console.log(`📊 Tokens used: ${completion.usage?.total_tokens || 'unknown'}`);
    console.log(`📦 Cache size: ${responseCache.size} entries`);

    return NextResponse.json({
      success: true,
      soundscape: soundscapeStructure,
      keywords: keywords,
      cached: false,
    })
  } catch (error: any) {
    console.error('AI Soundscape Generation Error:', error);
    
    // Check for quota/rate limit errors
    if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('rate')) {
      return NextResponse.json(
        { 
          error: 'OpenAI API limit reached',
          details: 'Rate limit or quota exceeded. Use Template mode instead.',
          fallbackToTemplate: true,
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate soundscape',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
