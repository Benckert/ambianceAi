"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { AILayerSpec, FreeSoundClip } from "@/types/soundscape";

export const AIPromptInput = () => {
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [useSimpleMode, setUseSimpleMode] = useState(true); // Default to free mode
  const addLayer = useSoundscapeStore((state) => state.addLayer);
  const reset = useSoundscapeStore((state) => state.reset);

  const fetchSoundForLayer = async (layerSpec: AILayerSpec): Promise<FreeSoundClip | null> => {
    try {
      const response = await fetch(
        `/api/freesound?query=${encodeURIComponent(layerSpec.searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch sound');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Return the first result (prioritized by our API)
        return data.results[0];
      }
      
      return null;
    } catch (err) {
      console.error(`Failed to fetch sound for: ${layerSpec.searchQuery}`, err);
      return null;
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keywords.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGenerationStatus(useSimpleMode ? "🎨 Creating soundscape template..." : "🤖 AI is analyzing your keywords...");

    try {
      // Choose endpoint based on mode
      const endpoint = useSimpleMode ? '/api/generate-soundscape-simple' : '/api/generate-soundscape';
      
      // Step 1: Get AI structure
      const aiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywords.trim() }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to generate soundscape structure');
      }

      const { soundscape } = await aiResponse.json();
      
      setGenerationStatus(`🎵 Found ${soundscape.layers.length} layers. Fetching sounds...`);

      // Step 2: Clear existing layers
      reset();

      // Step 3: Fetch sounds for each layer
      let successCount = 0;
      for (let i = 0; i < soundscape.layers.length; i++) {
        const layerSpec = soundscape.layers[i];
        setGenerationStatus(
          `🔍 Fetching ${layerSpec.category} sound (${i + 1}/${soundscape.layers.length}): ${layerSpec.description}`
        );

        const sound = await fetchSoundForLayer(layerSpec);
        
        if (sound) {
          // Add layer with AI-recommended volume
          addLayer({
            id: `ai-layer-${sound.id}-${Date.now()}-${i}`,
            url: sound.previews['preview-hq-mp3'],
            volume: layerSpec.volume,
            loop: true,
            name: sound.name,
            duration: sound.duration,
            isMuted: false,
          });
          successCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (successCount === 0) {
        setError('Could not find any suitable sounds. Try different keywords.');
      } else {
        setGenerationStatus(
          `✨ Soundscape complete! Added ${successCount}/${soundscape.layers.length} layers. ${soundscape.mixingNotes}`
        );
        
        // Clear status after 5 seconds
        setTimeout(() => setGenerationStatus(""), 5000);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate soundscape. Please try again.';
      setError(errorMessage);
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Generation Mode:</span>
          <button
            type="button"
            onClick={() => setUseSimpleMode(!useSimpleMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useSimpleMode ? 'bg-green-600' : 'bg-purple-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useSimpleMode ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-white">
            {useSimpleMode ? '🎨 Template (Free)' : '🤖 AI (Requires Credits)'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {useSimpleMode ? 'Uses predefined templates' : 'Uses OpenAI GPT-3.5'}
        </span>
      </div>

      <form onSubmit={handleGenerate} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={useSimpleMode 
              ? "Try: forest, rain, ocean, cafe, night, storm..."
              : "Describe your soundscape (e.g., 'peaceful forest morning with birds')"
            }
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isGenerating}
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating || !keywords.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
        >
          {isGenerating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate
            </>
          )}
        </button>
      </form>

      {generationStatus && (
        <div className="p-4 bg-purple-900/20 border border-purple-800 rounded-lg text-purple-300 text-sm">
          {generationStatus}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Pro tip:</strong> Be descriptive! Examples:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>"Rainy forest night with distant thunder"</li>
          <li>"Peaceful ocean beach sunset with seagulls"</li>
          <li>"Cozy coffee shop ambience with light chatter"</li>
          <li>"Mystical cave with water drips and wind"</li>
        </ul>
      </div>
    </div>
  );
};
