"use client";

import { useState } from "react"
import { SoundscapePlayer } from "@/components/SoundscapePlayer";
import { LayersList } from "@/components/LayerControl";
import { AIPromptInput } from "@/components/AIPromptInput"
import { PromptInput } from "@/components/PromptInput"
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { Play, Pause, RotateCcw, Sparkles, Search } from "lucide-react"

export default function Home() {
  const [useAI, setUseAI] = useState(false)
  const isPlaying = useSoundscapeStore((state) => state.isPlaying);
  const togglePlayback = useSoundscapeStore((state) => state.togglePlayback);
  const reset = useSoundscapeStore((state) => state.reset);
  const layers = useSoundscapeStore((state) => state.layers);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ Soundscape Creator
          </h1>
          <p className="text-gray-400 text-lg">
            Create ambient soundscapes with {useAI ? "AI" : "manual search"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setUseAI(false)}
              className={`px-6 py-2 rounded-md transition-all flex items-center gap-2 ${
                !useAI
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Search size={18} />
              Manual Search
            </button>
            <button
              onClick={() => setUseAI(true)}
              className={`px-6 py-2 rounded-md transition-all flex items-center gap-2 ${
                useAI
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles size={18} />
              AI Generator
            </button>
          </div>
        </div>

        {/* Input Component */}
        <div className="mb-8">
          {useAI ? <AIPromptInput /> : <PromptInput />}
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Your Soundscape
            </h2>
            <div className="flex gap-3">
              <button
                onClick={togglePlayback}
                disabled={layers.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Play
                  </>
                )}
              </button>
              <button
                onClick={reset}
                disabled={layers.length === 0}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                title="Clear all layers"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>

          {/* Layers List */}
          <LayersList />
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            How to use:
          </h3>
          {useAI ? (
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Describe your desired soundscape in natural language</li>
              <li>AI will analyze and select appropriate sounds</li>
              <li>Adjust volumes and layers as needed</li>
              <li>Press Play to start your ambient experience</li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>
                Search for loopable sounds (e.g., "rain", "ocean waves", "forest
                ambiance")
              </li>
              <li>Add multiple layers to create your perfect soundscape</li>
              <li>Adjust the volume of each layer to balance the mix</li>
              <li>Press Play to start your ambient experience</li>
            </ol>
          )}
          <div className="mt-4 pt-4 border-t border-blue-800/50">
            <p className="text-sm text-gray-400">
              💡 <strong>Master Loop System:</strong> Your soundscape plays in a
              30-second cycle with natural variation. Sounds are distributed
              evenly with random timing (±1.5s) to create an organic,
              non-repetitive atmosphere. Mix different sound durations for best
              results!
            </p>
            {useAI && (
              <p className="text-sm text-yellow-400 mt-2">
                ⚠️ <strong>Note:</strong> AI mode requires a valid OpenAI API
                key with available credits. If you don't have one, use Manual
                Search mode instead.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Powered by{" "}
            <a
              href="https://freesound.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              FreeSound.org
            </a>
          </p>
        </div>
      </div>

      {/* Audio Player Component (no UI) */}
      <SoundscapePlayer />
    </main>
  )
}
