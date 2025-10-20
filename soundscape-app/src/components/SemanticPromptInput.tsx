"use client";

import { useState, useRef } from "react";
import { Brain, Loader2 } from "lucide-react";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { FreeSoundClip } from "@/types/soundscape";

export const SemanticPromptInput = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FreeSoundClip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const addLayer = useSoundscapeStore((state) => state.addLayer);
  const removeLayer = useSoundscapeStore((state) => state.removeLayer);
  const layers = useSoundscapeStore((state) => state.layers);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/generate-soundscape-semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to fetch embeddings search");
      const data = await response.json();

      const mappedResults = (data.results || []).map((clip: any) => ({
        id: clip.id ?? String(Math.random()),
        name: clip.name ?? clip.description ?? "Unknown",
        tags: Array.isArray(clip.tags) ? clip.tags : [],
        previews: clip.previews ?? {},
        duration: clip.duration ?? 0,
        ...clip,
      }));

      setResults(mappedResults);

      if (mappedResults.length === 0) {
        setError("No similar sounds found. Try a different search term.");
      }
    } catch (err) {
      setError("Failed to search for sounds. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLayer = (clip: FreeSoundClip) => {
    const isDuplicate = layers.some(
      (layer) =>
        layer.id.includes(`layer-${clip.id}-`) ||
        layer.id.includes(`ai-layer-${clip.id}-`)
    );

    if (isDuplicate) {
      setError(`"${clip.name}" is already in your soundscape.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const hasLoopTag = clip.tags.some((tag) =>
      tag.toLowerCase().includes("loop")
    );

    addLayer({
      id: `layer-${clip.id}-${Date.now()}`,
      url: clip.previews["preview-hq-mp3"],
      volume: 0.5,
      loop: hasLoopTag,
      name: clip.name,
      duration: clip.duration,
    });
  };

  const handleRemoveLayer = (clip: FreeSoundClip) => {
    const layerToRemove = layers.find(
      (layer) =>
        layer.id.includes(`layer-${clip.id}-`) ||
        layer.id.includes(`ai-layer-${clip.id}-`)
    );

    if (layerToRemove) removeLayer(layerToRemove.id);
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Search for sounds semantically..."
          className="flex-1 px-4 py-3 bg-slate-800/80 text-white rounded-xl border border-pink-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 placeholder:text-slate-500 backdrop-blur-sm text-sm sm:text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 sm:px-6 py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer text-sm sm:text-base whitespace-nowrap w-[90px] sm:w-[140px] bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-500 shadow-pink-500/25 disabled:from-pink-700/70 disabled:to-rose-700/70 disabled:cursor-wait disabled:shadow-none disabled:opacity-75"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Searching...</span>
            </>
          ) : (
            <>
              <Brain size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-3 sm:p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-400 backdrop-blur-sm text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-slate-400">
            Found {results.length} sound{results.length !== 1 ? "s" : ""} (loop-tagged shown first)
          </h3>
          <div className="max-h-64 sm:max-h-80 overflow-y-auto space-y-2">
            {results.map((clip) => {
              const similarity = (clip as any).similarity;
              const similarityPercent = typeof similarity === "number"
                ? `${(similarity * 100).toFixed(1)}%`
                : null;
              const isLoopTagged = Array.isArray(clip.tags) && clip.tags.some((tag) =>
                tag.toLowerCase().includes("loop")
              );
              const isAlreadyAdded = layers.some(
                (layer) =>
                  layer.id.includes(`layer-${clip.id}-`) ||
                  layer.id.includes(`ai-layer-${clip.id}-`)
              );

              return (
                <div
                  key={clip.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border transition-all group/item ${
                    isAlreadyAdded
                      ? "bg-slate-700/40 border-slate-600/30 hover:opacity-100"
                      : "bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600/50"
                  }`}
                >
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`text-xs sm:text-sm font-medium truncate flex-1 min-w-0 ${
                          isAlreadyAdded ? "text-white/60 group-hover:item:text-white" : "text-white"
                        }`}
                        title={clip.name}
                      >
                        {clip.name}
                      </p>
                      {isLoopTagged && (
                        <span className="px-2 py-0.5 text-xs bg-rose-500/90 text-white rounded-md flex-shrink-0 font-medium cursor-default">
                          Loop
                        </span>
                      )}
                      {similarityPercent && (
                        <span className="px-2 py-0.5 text-xs bg-rose-700/80 text-white rounded-md flex-shrink-0 font-medium cursor-default">
                          {similarityPercent}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isAlreadyAdded ? "text-slate-400/60 group-hover:item:text-slate-400" : "text-slate-400"}`}>
                      {clip.duration?.toFixed(1)}s
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      isAlreadyAdded ? handleRemoveLayer(clip) : handleAddLayer(clip)
                    }
                    className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm rounded-lg flex-shrink-0 font-medium min-w-[100px] group cursor-pointer ${
                      isAlreadyAdded
                        ? "bg-slate-600 text-white/60 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 hover:text-white hover:shadow-md hover:shadow-rose-500/20"
                        : "bg-gradient-to-r from-pink-400 to-rose-500 text-white hover:from-pink-500 hover:to-rose-500 shadow-md shadow-pink-500/20 transition-all"
                    }`}
                  >
                    <span className={isAlreadyAdded ? "group-hover:hidden" : ""}>
                      {isAlreadyAdded ? "Added" : "Add Layer"}
                    </span>
                    {isAlreadyAdded && <span className="hidden group-hover:inline">Remove</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
