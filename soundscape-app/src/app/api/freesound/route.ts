import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("query")
    const token = process.env.FREESOUND_API_KEY

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: "FreeSound API key not configured" },
        { status: 500 }
      )
    }

    // Search for loopable clips under 30 seconds
    const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(
      query
    )}&fields=id,name,previews,duration,tags&filter=duration:[0.0 TO 30.0]&token=${token}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`FreeSound API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Prioritize clips tagged with 'loop', but show all results
    // (Many loopable sounds on FreeSound aren't explicitly tagged)
    const results = data.results || []

    // Sort: loop-tagged clips first, then by duration (shorter first)
    const sorted = results.sort((a: any, b: any) => {
      const aHasLoop = a.tags.some((tag: string) =>
        tag.toLowerCase().includes("loop")
      )
      const bHasLoop = b.tags.some((tag: string) =>
        tag.toLowerCase().includes("loop")
      )

      if (aHasLoop && !bHasLoop) return -1
      if (!aHasLoop && bHasLoop) return 1
      return a.duration - b.duration // Shorter sounds first
    })

    return NextResponse.json({
      count: sorted.length,
      results: sorted,
    })
  } catch (error) {
    console.error('FreeSound API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sounds from FreeSound' },
      { status: 500 }
    );
  }
}
