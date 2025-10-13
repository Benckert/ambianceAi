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
  const [aiUseTemplate, setAiUseTemplate] = useState(true) // Track AI sub-mode
  const isPlaying = useSoundscapeStore((state) => state.isPlaying)
  const togglePlayback = useSoundscapeStore((state) => state.togglePlayback)
  const reset = useSoundscapeStore((state) => state.reset)
  const layers = useSoundscapeStore((state) => state.layers)

  // Determine current mode for instructions
  const currentMode = !useAI ? "manual" : aiUseTemplate ? "template" : "ai"

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4 flex items-center justify-center gap-3">
            <span className="text-4xl">{useAI ? "✨" : "🎵"}</span>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Soundscape Creator
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Create ambient soundscapes with{" "}
            {currentMode === "manual"
              ? "manual search"
              : currentMode === "template"
              ? "smart templates"
              : "AI generation"}
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
          {useAI ? (
            <AIPromptInput onModeChange={setAiUseTemplate} />
          ) : (
            <PromptInput />
          )}
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
            How to use{" "}
            {currentMode === "manual"
              ? "Manual Search"
              : currentMode === "template"
              ? "Template Mode"
              : "AI Mode"}
            :
          </h3>

          {currentMode === "manual" && (
            <>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>
                  Search for sounds using keywords (e.g., "rain", "birds",
                  "wind")
                </li>
                <li>Click "Add Layer" on sounds you like</li>
                <li>Adjust volume sliders to balance your mix</li>
                <li>Press Play to start your soundscape</li>
              </ol>
              <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                <p className="text-xs font-semibold text-blue-300 mb-1">
                  💡 Search Tips:
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Try: "ocean waves", "forest birds", "rain thunder"</li>
                  <li>• Sounds tagged with "loop" are shown first</li>
                  <li>• Mix different sound durations for best results</li>
                </ul>
              </div>
            </>
          )}

          {currentMode === "template" && (
            <>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Type a scene keyword (see examples below)</li>
                <li>Click Generate to create instant soundscape</li>
                <li>Adjust volumes and add/remove layers as needed</li>
                <li>Press Play to start your ambient experience</li>
              </ol>
              <div className="mt-3 p-3 bg-green-900/20 rounded border border-green-800/50">
                <p className="text-xs font-semibold text-green-300 mb-1">
                  🎨 Available Templates:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-2">
                  <div>
                    <span className="text-green-400">🌲</span> forest
                  </div>
                  <div>
                    <span className="text-blue-400">🌧️</span> rain
                  </div>
                  <div>
                    <span className="text-cyan-400">🌊</span> ocean
                  </div>
                  <div>
                    <span className="text-amber-400">☕</span> cafe
                  </div>
                  <div>
                    <span className="text-gray-400">🏙️</span> city
                  </div>
                  <div>
                    <span className="text-purple-400">🌙</span> night
                  </div>
                  <div>
                    <span className="text-indigo-400">🚀</span> space
                  </div>
                  <div>
                    <span className="text-pink-400">🧘</span> meditation
                  </div>
                  <div>
                    <span className="text-orange-400">🔥</span> fire
                  </div>
                  <div>
                    <span className="text-slate-400">⛈️</span> storm
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Mix keywords like "rainy forest" or "peaceful ocean"
                </p>
              </div>
            </>
          )}

          {currentMode === "ai" && (
            <>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Describe your scene in natural language</li>
                <li>AI interprets and creates custom soundscape</li>
                <li>Fine-tune volumes and layers as needed</li>
                <li>Press Play to enjoy your creation</li>
              </ol>
              <div className="mt-3 p-3 bg-purple-900/20 rounded border border-purple-800/50">
                <p className="text-xs font-semibold text-purple-300 mb-1">
                  🤖 AI Examples:
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• "Peaceful forest morning with distant birds"</li>
                  <li>• "Cozy coffee shop on a rainy day"</li>
                  <li>• "Calm beach at sunset with gentle waves"</li>
                  <li>• "Mysterious sci-fi spaceship interior"</li>
                </ul>
              </div>
              <div className="mt-2 p-2 bg-yellow-900/20 rounded border border-yellow-800/50">
                <p className="text-xs text-yellow-300">
                  ⚡ <strong>Smart Caching:</strong> Repeated searches are
                  instant!
                </p>
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-blue-800/50">
            <p className="text-sm text-gray-400">
              💡 <strong>Master Loop System:</strong> Sounds play in 30-second
              cycles with natural variation (±1.5s random timing). Short clips
              and non-looped sounds get automatic fade-in/fade-out for smooth
              playback.
            </p>
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
