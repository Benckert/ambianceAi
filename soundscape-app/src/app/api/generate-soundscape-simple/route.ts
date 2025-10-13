import { NextRequest, NextResponse } from 'next/server';

// Helper function to randomly vary volume slightly for more variety
function randomizeVolume(baseVolume: number): number {
  const variation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
  return Math.max(0.05, Math.min(0.8, baseVolume + variation));
}

// Helper function to add slight variation to search queries
function addSearchVariation(baseQuery: string): string {
  const variations = ['loop', 'ambient', 'sound', 'atmosphere'];
  const randomVariation = variations[Math.floor(Math.random() * variations.length)];
  // Randomly decide whether to add variation (50% chance)
  return Math.random() > 0.5 ? `${baseQuery} ${randomVariation}` : baseQuery;
}

// Simple rule-based soundscape generator (no AI required!)
// Maps keywords to predefined sound combinations
export async function POST(req: NextRequest) {
  try {
    const { keywords } = await req.json();

    if (!keywords || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const keywordsLower = keywords.toLowerCase();
    
    // Predefined soundscape templates based on common keywords
    const soundscapeTemplates: Record<string, any> = {
      // Nature scenes
      forest: {
        layers: [
          { searchQuery: "forest ambience birds", category: "background", volume: 0.4, description: "Forest background with birds" },
          { searchQuery: "wind trees leaves", category: "midground", volume: 0.3, description: "Wind through trees" },
          { searchQuery: "bird chirp", category: "foreground", volume: 0.2, description: "Occasional bird calls" },
        ],
        mixingNotes: "A peaceful forest atmosphere with layered natural sounds"
      },
      rain: {
        layers: [
          { searchQuery: "rain ambience loop", category: "background", volume: 0.45, description: "Steady rain sound" },
          { searchQuery: "rain thunder distant", category: "midground", volume: 0.25, description: "Distant thunder" },
          { searchQuery: "water drops", category: "foreground", volume: 0.15, description: "Water dripping" },
        ],
        mixingNotes: "Rainy day atmosphere with thunder accents"
      },
      ocean: {
        layers: [
          { searchQuery: "ocean waves loop", category: "background", volume: 0.5, description: "Ocean waves" },
          { searchQuery: "seagull", category: "midground", volume: 0.2, description: "Seagulls calling" },
          { searchQuery: "wind beach", category: "foreground", volume: 0.25, description: "Coastal wind" },
        ],
        mixingNotes: "Coastal beach ambience with waves and wildlife"
      },
      cafe: {
        layers: [
          { searchQuery: "coffee shop ambience", category: "background", volume: 0.4, description: "Cafe background" },
          { searchQuery: "people talking murmur", category: "midground", volume: 0.3, description: "Conversation murmur" },
          { searchQuery: "coffee machine", category: "foreground", volume: 0.2, description: "Coffee brewing sounds" },
        ],
        mixingNotes: "Cozy coffee shop atmosphere"
      },
      city: {
        layers: [
          { searchQuery: "city ambience traffic", category: "background", volume: 0.35, description: "Urban traffic" },
          { searchQuery: "people crowd", category: "midground", volume: 0.25, description: "Crowd sounds" },
          { searchQuery: "car horn distant", category: "foreground", volume: 0.15, description: "Occasional car horns" },
        ],
        mixingNotes: "Urban city soundscape"
      },
      night: {
        layers: [
          { searchQuery: "crickets night ambience", category: "background", volume: 0.4, description: "Night crickets" },
          { searchQuery: "owl hoot", category: "midground", volume: 0.2, description: "Owl calls" },
          { searchQuery: "wind gentle", category: "foreground", volume: 0.25, description: "Gentle night breeze" },
        ],
        mixingNotes: "Peaceful nighttime atmosphere"
      },
      space: {
        layers: [
          { searchQuery: "space ambient drone", category: "background", volume: 0.45, description: "Space ambience" },
          { searchQuery: "sci fi hum", category: "midground", volume: 0.3, description: "Electronic hum" },
          { searchQuery: "beep signal", category: "foreground", volume: 0.15, description: "Occasional signals" },
        ],
        mixingNotes: "Sci-fi space atmosphere"
      },
      meditation: {
        layers: [
          { searchQuery: "tibetan bowl singing", category: "background", volume: 0.35, description: "Singing bowls" },
          { searchQuery: "wind chimes", category: "midground", volume: 0.25, description: "Wind chimes" },
          { searchQuery: "water stream gentle", category: "foreground", volume: 0.3, description: "Gentle water" },
        ],
        mixingNotes: "Calming meditation soundscape"
      },
      fire: {
        layers: [
          { searchQuery: "fireplace crackling", category: "background", volume: 0.5, description: "Crackling fire" },
          { searchQuery: "wood burning", category: "midground", volume: 0.3, description: "Wood burning" },
          { searchQuery: "fire pop", category: "foreground", volume: 0.2, description: "Occasional pops" },
        ],
        mixingNotes: "Cozy fireplace atmosphere"
      },
      storm: {
        layers: [
          { searchQuery: "rain heavy storm", category: "background", volume: 0.45, description: "Heavy rain" },
          { searchQuery: "thunder close", category: "midground", volume: 0.35, description: "Thunder strikes" },
          { searchQuery: "wind howling", category: "foreground", volume: 0.25, description: "Howling wind" },
        ],
        mixingNotes: "Intense storm atmosphere"
      },
    };

    // Find matching template(s) based on keywords
    let selectedTemplate = null;
    let matchedKeyword = '';

    for (const [key, template] of Object.entries(soundscapeTemplates)) {
      if (keywordsLower.includes(key)) {
        selectedTemplate = template;
        matchedKeyword = key;
        break;
      }
    }

    // If no template matches, create a generic ambient soundscape
    if (!selectedTemplate) {
      selectedTemplate = {
        layers: [
          { searchQuery: `${keywords} ambient loop`, category: "background", volume: 0.4, description: "Main ambience" },
          { searchQuery: `${keywords} atmosphere`, category: "midground", volume: 0.3, description: "Atmospheric layer" },
          { searchQuery: `${keywords} sound`, category: "foreground", volume: 0.2, description: "Accent sounds" },
        ],
        mixingNotes: `Custom soundscape based on: ${keywords}`
      };
    }

    // Add randomization to create variety on repeated requests
    const randomizedTemplate = {
      layers: selectedTemplate.layers.map((layer: any) => ({
        ...layer,
        searchQuery: addSearchVariation(layer.searchQuery),
        volume: randomizeVolume(layer.volume),
      })),
      mixingNotes: selectedTemplate.mixingNotes
    };

    return NextResponse.json({
      success: true,
      soundscape: randomizedTemplate,
      keywords: keywords,
      usedTemplate: matchedKeyword || 'custom',
    });

  } catch (error) {
    console.error('Simple Soundscape Generation Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate soundscape',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
