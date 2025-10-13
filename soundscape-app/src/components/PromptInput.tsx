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
    e.preventDefault()

    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch(
        `/api/freesound?query=${encodeURIComponent(prompt)}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch sounds")
      }

      const data = await response.json()
      setResults(data.results || [])

      if (data.results.length === 0) {
        setError("No sounds found. Try a different search term.")
      }
    } catch (err) {
      setError("Failed to search for sounds. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLayer = (clip: FreeSoundClip) => {
    // Detect if sound has loop tag
    const hasLoopTag = clip.tags.some((tag) =>
      tag.toLowerCase().includes("loop")
    )

    addLayer({
      id: `layer-${clip.id}-${Date.now()}`,
      url: clip.previews["preview-hq-mp3"],
      volume: 0.5,
      loop: hasLoopTag, // Use actual loop detection
      name: clip.name,
      duration: clip.duration, // Pass duration for master loop scheduling
    })
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Search for sounds (e.g., 'ocean waves', 'forest birds')"
          className="flex-1 px-4 py-3 bg-slate-800/80 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder:text-slate-500 backdrop-blur-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-lg shadow-cyan-500/25 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2
                size={20}
                className="animate-spin"
              />
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
        <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-400 backdrop-blur-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-400">
            Found {results.length} sound{results.length !== 1 ? "s" : ""}{" "}
            (loop-tagged shown first)
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {results.map((clip) => {
              const isLoopTagged = clip.tags.some((tag: string) =>
                tag.toLowerCase().includes("loop")
              )

              return (
                <div
                  key={clip.id}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className="text-sm font-medium text-white truncate flex-1 min-w-0"
                        title={clip.name}
                      >
                        {clip.name}
                      </p>
                      {isLoopTagged && (
                        <span className="px-2 py-0.5 text-xs bg-emerald-500/90 text-white rounded-md flex-shrink-0 font-medium">
                          Loop
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {clip.duration.toFixed(1)}s
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddLayer(clip)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all flex-shrink-0 font-medium shadow-md shadow-cyan-500/20"
                  >
                    Add Layer
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
};
