"use client";

import { useState } from "react"
import { SoundscapePlayer } from "@/components/SoundscapePlayer";
import { LayersPopup } from "@/components/LayersPopup"
import { AIPromptInput } from "@/components/AIPromptInput"
import { PromptInput } from "@/components/PromptInput"
import { Slider } from "@/components/ui/slider"
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore"
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Layers3,
} from "lucide-react"

export default function Home() {
  const [useAI, setUseAI] = useState(false)
  const [aiUseTemplate, setAiUseTemplate] = useState(true)
  const [showLayersPopup, setShowLayersPopup] = useState(false)
  const isPlaying = useSoundscapeStore((state) => state.isPlaying)
  const togglePlayback = useSoundscapeStore((state) => state.togglePlayback)
  const reset = useSoundscapeStore((state) => state.reset)
  const layers = useSoundscapeStore((state) => state.layers)
  const masterVolume = useSoundscapeStore((state) => state.masterVolume)
  const masterIsMuted = useSoundscapeStore((state) => state.masterIsMuted)
  const setMasterVolume = useSoundscapeStore((state) => state.setMasterVolume)
  const toggleMasterMute = useSoundscapeStore((state) => state.toggleMasterMute)

  // Determine current mode for instructions
  const currentMode = !useAI ? "manual" : aiUseTemplate ? "template" : "ai"

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pb-14">
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
              className={`flex-1 sm:w-[160px] px-4 sm:px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium cursor-pointer text-sm sm:text-base ${
                !useAI
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search
                size={16}
                className="sm:w-[18px] sm:h-[18px] flex-shrink-0"
              />
              <span className="hidden xs:inline flex-shrink-0">
                Manual Search
              </span>
              <span className="xs:hidden flex-shrink-0">Manual</span>
            </button>
            <button
              onClick={() => setUseAI(true)}
              className={`flex-1 sm:w-[160px] px-4 sm:px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium cursor-pointer text-sm sm:text-base ${
                useAI
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles
                size={16}
                className="sm:w-[18px] sm:h-[18px] flex-shrink-0"
              />
              <span className="hidden xs:inline flex-shrink-0">
                AI Generator
              </span>
              <span className="xs:hidden flex-shrink-0">AI</span>
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
        <div className="text-center mt-6 sm:mt-12 mb-6 text-slate-500 text-xs sm:text-sm px-4">
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

      {/* Spotify-Style Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl z-50 pb-safe">
        <div className="container mx-auto px-4 py-3 pb-6 md:pb-3 max-w-7xl">
          <div className="flex items-center justify-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayback}
              disabled={layers.length === 0}
              className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-full hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all flex items-center justify-center shadow-md shadow-emerald-500/30"
            >
              {isPlaying ? (
                <Pause
                  size={20}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={20}
                  fill="currentColor"
                  className="ml-0.5"
                />
              )}
            </button>

            {/* Reset Button */}
            <button
              onClick={reset}
              disabled={layers.length === 0}
              className="w-8 h-8 flex-shrink-0 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Clear all"
            >
              <RotateCcw size={18} />
            </button>

            {/* Master Volume Control */}
            <div className="flex-1 flex items-center gap-3 max-w-xs">
              <button
                onClick={toggleMasterMute}
                disabled={layers.length === 0}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={
                  masterIsMuted ? "Unmute master volume" : "Mute master volume"
                }
              >
                {masterIsMuted ? (
                  <VolumeX
                    size={18}
                    className="text-red-400"
                  />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <Slider
                value={[masterIsMuted ? 0 : masterVolume * 100]}
                onValueChange={(value) => setMasterVolume(value[0] / 100)}
                max={100}
                step={1}
                disabled={layers.length === 0}
                className="flex-1"
              />
              <span className="hidden sm:inline text-xs text-slate-400 w-10 text-right">
                {Math.round(masterIsMuted ? 0 : masterVolume * 100)}%
              </span>
            </div>

            {/* Layers Pill Button */}
            <button
              onClick={() => setShowLayersPopup(!showLayersPopup)}
              disabled={layers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Layers3
                size={16}
                className="text-cyan-400"
              />
              <span className="text-sm font-medium text-white">
                {layers.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Layers Popup */}
      <LayersPopup
        isOpen={showLayersPopup}
        onClose={() => setShowLayersPopup(false)}
      />

      {/* Audio Player Component (no UI) */}
      <SoundscapePlayer />
    </main>
  )
}
