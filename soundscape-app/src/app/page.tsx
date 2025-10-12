"use client";

import { SoundscapePlayer } from "@/components/SoundscapePlayer";
import { LayersList } from "@/components/LayerControl";
import { PromptInput } from "@/components/PromptInput";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Home() {
  const isPlaying = useSoundscapeStore((state) => state.isPlaying);
  const togglePlayback = useSoundscapeStore((state) => state.togglePlayback);
  const reset = useSoundscapeStore((state) => state.reset);
  const layers = useSoundscapeStore((state) => state.layers);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎵 Soundscape Creator
          </h1>
          <p className="text-gray-400 text-lg">
            Create ambient soundscapes using loopable sounds from FreeSound
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <PromptInput />
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
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Search for loopable sounds (e.g., "rain", "ocean waves", "forest ambiance")</li>
            <li>Add multiple layers to create your perfect soundscape</li>
            <li>Adjust the volume of each layer to balance the mix</li>
            <li>Press Play to start your ambient experience</li>
          </ol>
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
  );
}
