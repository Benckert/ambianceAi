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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl hidden sm:inline">
              {useAI ? "✨" : "🎵"}
            </span>
            <span className="font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Soundscape Creator
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg px-4">
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
          <div className="inline-flex bg-slate-800/80 backdrop-blur-sm rounded-xl p-1.5 border border-slate-700/50 w-full sm:w-auto max-w-md">
            <button
              onClick={() => setUseAI(false)}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium cursor-pointer text-sm sm:text-base ${
                !useAI
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search
                size={16}
                className="sm:w-[18px] sm:h-[18px]"
              />
              <span className="hidden xs:inline">Manual Search</span>
              <span className="xs:hidden">Manual</span>
            </button>
            <button
              onClick={() => setUseAI(true)}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium cursor-pointer text-sm sm:text-base ${
                useAI
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles
                size={16}
                className="sm:w-[18px] sm:h-[18px]"
              />
              <span className="hidden xs:inline">AI Generator</span>
              <span className="xs:hidden">AI</span>
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
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-8 border border-slate-700/50">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Your Soundscape
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <button
                onClick={togglePlayback}
                disabled={layers.length === 0}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-emerald-500/20 disabled:shadow-none text-sm sm:text-base"
              >
                {isPlaying ? (
                  <>
                    <Pause
                      size={18}
                      className="sm:w-5 sm:h-5"
                    />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play
                      size={18}
                      className="sm:w-5 sm:h-5"
                    />
                    <span>Play</span>
                  </>
                )}
              </button>
              <button
                onClick={reset}
                disabled={layers.length === 0}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:shadow-none text-sm sm:text-base font-medium"
                title="Clear all layers"
              >
                <RotateCcw
                  size={18}
                  className="sm:w-5 sm:h-5"
                />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Layers List */}
          <LayersList />
        </div>

        {/* Instructions */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-3">
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
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm sm:text-base">
                <li>
                  Search for sounds using keywords (e.g., "rain", "birds",
                  "wind")
                </li>
                <li>Click "Add Layer" on sounds you like</li>
                <li>Adjust volume sliders to balance your mix</li>
                <li>Press Play to start your soundscape</li>
              </ol>
              <div className="mt-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <p className="text-xs sm:text-sm font-semibold text-cyan-300 mb-1">
                  💡 Search Tips:
                </p>
                <ul className="text-xs sm:text-sm text-slate-400 space-y-1">
                  <li>• Try: "ocean waves", "forest birds", "rain thunder"</li>
                  <li>• Sounds tagged with "loop" are shown first</li>
                  <li>• Mix different sound durations for best results</li>
                </ul>
              </div>
            </>
          )}

          {currentMode === "template" && (
            <>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm sm:text-base">
                <li>Type a scene keyword (see examples below)</li>
                <li>Click Generate to create instant soundscape</li>
                <li>Adjust volumes and add/remove layers as needed</li>
                <li>Press Play to start your ambient experience</li>
              </ol>
              <div className="mt-3 p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/50">
                <p className="text-xs sm:text-sm font-semibold text-emerald-300 mb-1">
                  🎨 Available Templates:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs sm:text-sm text-slate-400 mt-2">
                  <div>
                    <span className="text-emerald-400">🌲</span> forest
                  </div>
                  <div>
                    <span className="text-cyan-400">🌧️</span> rain
                  </div>
                  <div>
                    <span className="text-blue-400">🌊</span> ocean
                  </div>
                  <div>
                    <span className="text-amber-400">☕</span> cafe
                  </div>
                  <div>
                    <span className="text-slate-400">🏙️</span> city
                  </div>
                  <div>
                    <span className="text-indigo-400">🌙</span> night
                  </div>
                  <div>
                    <span className="text-violet-400">🚀</span> space
                  </div>
                  <div>
                    <span className="text-purple-400">🧘</span> meditation
                  </div>
                  <div>
                    <span className="text-orange-400">🔥</span> fire
                  </div>
                  <div>
                    <span className="text-sky-400">⛈️</span> storm
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Mix keywords like "rainy forest" or "peaceful ocean"
                </p>
              </div>
            </>
          )}

          {currentMode === "ai" && (
            <>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm sm:text-base">
                <li>Describe your scene in natural language</li>
                <li>AI interprets and creates custom soundscape</li>
                <li>Fine-tune volumes and layers as needed</li>
                <li>Press Play to enjoy your creation</li>
              </ol>
              <div className="mt-3 p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/50">
                <p className="text-xs sm:text-sm font-semibold text-indigo-300 mb-1">
                  🤖 AI Examples:
                </p>
                <ul className="text-xs sm:text-sm text-slate-400 space-y-1">
                  <li>• "Peaceful forest morning with distant birds"</li>
                  <li>• "Cozy coffee shop on a rainy day"</li>
                  <li>• "Calm beach at sunset with gentle waves"</li>
                  <li>• "Mysterious sci-fi spaceship interior"</li>
                </ul>
              </div>
              <div className="mt-2 p-2 bg-amber-950/30 rounded-xl border border-amber-800/50">
                <p className="text-xs sm:text-sm text-amber-300">
                  ⚡ <strong>Smart Caching:</strong> Repeated searches are
                  instant!
                </p>
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs sm:text-sm text-slate-400">
              💡 <strong>Master Loop System:</strong> Sounds play in 30-second
              cycles with natural variation (±1.5s random timing). Short clips
              and non-looped sounds get automatic fade-in/fade-out for smooth
              playback.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-12 mb-8 sm:mb-6 text-slate-500 text-xs sm:text-sm px-4">
          <p>
            Powered by{" "}
            <a
              href="https://freesound.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
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
