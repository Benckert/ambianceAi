import { NextRequest, NextResponse } from "next/server";
import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { keywords, randomize = false } = await req.json();

    if (!keywords || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: "Keywords are required" },
        { status: 400 }
      );
    }

    const temperature = randomize ? 1.0 : 0.7;

    const response = await ollama.chat({
      model: "gpt-oss:120b",
      messages: [
        {
          role: "system",
          content: `
You are an AI sound designer. Your task is to create an ambient soundscape based on a short human keyword description.
Return a strict JSON object with this exact structure, without any extra text:

{
  "layers": [
    {
      "searchQuery": "single keyword",
      "category": "background | midground | foreground",
      "volume": 0.2-0.5,
      "description": "brief, 1-2 sentence description"
    }
  ],
  "mixingNotes": "brief notes on how to blend the layers"
}

Guidelines:
- Create 3-5 layers.
- For \`searchQuery\`, use **only one word** extracted from the user keywords.
- Categories:
    - background: 0.4-0.5 volume
    - midground: 0.3-0.4 volume
    - foreground: 0.2-0.3 volume
- Provide concise descriptions, 1-2 sentences max.
- Do not add any explanation or text outside the JSON.
`,
        },
        { role: "user", content: keywords },
      ],
      options: {
        temperature,
      },
    });

    // Ollama возвращает массив сообщений, берем последнее
    const aiMessage = response.message?.content;
    if (!aiMessage) {
      throw new Error("No response from Ollama");
    }

    const soundscape = JSON.parse(aiMessage);

    return NextResponse.json({
      success: true,
      soundscape,
      keywords,
    });
  } catch (error: any) {
    console.error("AI Soundscape Generation Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate soundscape",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
