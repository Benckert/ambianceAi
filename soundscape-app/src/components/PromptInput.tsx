"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { FreeSoundClip } from "@/types/soundscape";

export const PromptInput = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FreeSoundClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const addLayer = useSoundscapeStore((state) => state.addLayer);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `/api/freesound?query=${encodeURIComponent(prompt)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch sounds');
      }

      const data = await response.json();
      setResults(data.results || []);
      
      if (data.results.length === 0) {
        setError('No loopable sounds found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to search for sounds. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLayer = (clip: FreeSoundClip) => {
    addLayer({
      id: `layer-${clip.id}-${Date.now()}`,
      url: clip.previews['preview-hq-mp3'],
      volume: 0.5,
      loop: true,
      name: clip.name,
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your soundscape (e.g., 'rain forest ambient')"
          className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search size={20} />
              Search
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">
            Found {results.length} loopable sound{results.length !== 1 ? 's' : ''}
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {results.map((clip) => (
              <div
                key={clip.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {clip.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {clip.duration.toFixed(1)}s
                  </p>
                </div>
                <button
                  onClick={() => handleAddLayer(clip)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors ml-3"
                >
                  Add Layer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
