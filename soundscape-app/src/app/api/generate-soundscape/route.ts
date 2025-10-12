import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { keywords } = await req.json();

    if (!keywords || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Use OpenAI to interpret keywords and create soundscape structure
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert audio engineer specializing in ambient soundscapes. Your task is to analyze user keywords and create a structured soundscape with multiple audio layers.

For each user input, identify 3-5 distinct sound layers that would create a cohesive ambient soundscape. Categorize sounds into:
- BACKGROUND: Continuous ambient sounds (40-50% volume) - e.g., rain, ocean, wind
- MIDGROUND: Textural elements (30-40% volume) - e.g., rustling leaves, flowing water
- FOREGROUND: Accent sounds (20-30% volume) - e.g., birds, thunder, bells

For each layer, provide:
1. A specific FreeSound search query (optimized for finding loopable sounds)
2. A category (background/midground/foreground)
3. A recommended volume (0.0 to 1.0)
4. A brief description of the sound's role

Consider:
- Sound frequency balance (don't overlap too many similar frequencies)
- Natural environment compatibility (sounds that would occur together)
- Variation in duration preferences (mix of short and longer loops)
- Complementary sounds that create depth

Return ONLY valid JSON with this structure:
{
  "layers": [
    {
      "searchQuery": "rain ambience loop",
      "category": "background",
      "volume": 0.45,
      "description": "Steady rain for ambient base"
    }
  ],
  "mixingNotes": "Brief notes on the overall soundscape and how layers work together"
}`
        },
        {
          role: 'user',
          content: keywords
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    const soundscapeStructure = JSON.parse(aiResponse);

    return NextResponse.json({
      success: true,
      soundscape: soundscapeStructure,
      keywords: keywords,
    });

  } catch (error) {
    console.error('AI Soundscape Generation Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate soundscape',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
