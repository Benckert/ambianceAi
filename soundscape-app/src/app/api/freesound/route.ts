import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('query');
    const token = process.env.FREESOUND_API_KEY;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'FreeSound API key not configured' },
        { status: 500 }
      );
    }

    // Search for loopable clips under 30 seconds
    const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&fields=id,name,previews,duration,tags&filter=duration:[0.0 TO 30.0]&token=${token}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FreeSound API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Filter for clips tagged as 'loop' or 'loopable'
    const loopable = data.results.filter((clip: any) => 
      clip.tags.some((tag: string) => 
        tag.toLowerCase().includes('loop')
      )
    );

    return NextResponse.json({
      count: loopable.length,
      results: loopable,
    });
  } catch (error) {
    console.error('FreeSound API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sounds from FreeSound' },
      { status: 500 }
    );
  }
}
