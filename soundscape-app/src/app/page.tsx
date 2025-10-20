"use client";

import { useState, useEffect } from "react";
import { SoundscapePlayer } from "@/components/SoundscapePlayer";
import { LayersPopup } from "@/components/LayersPopup";
import { PromptInput } from "@/components/PromptInput";
import { AIPromptInput } from "@/components/AIPromptInput";
import { SemanticPromptInput } from "@/components/SemanticPromptInput";
import { Slider } from "@/components/ui/slider";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { TemplateIconButton } from "@/components/ui/TemplateIconButton";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Layers3,
  Music,
  Lightbulb,
  Palette,
  Bot,
  Zap,
  TreePine,
  CloudRain,
  Waves,
  Coffee,
  Building2,
  Moon,
  Rocket,
  Flower2,
  Flame,
  CloudLightning,
  Brain,
} from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<"manual" | "ai" | "semantic">("ai");
  const [showLayersPopup, setShowLayersPopup] = useState(false);
  const [showSearchTips, setShowSearchTips] = useState(false);
  const [generatingTemplates, setGeneratingTemplates] = useState<string[]>([]);
  const [clickedTemplates, setClickedTemplates] = useState<string[]>([]);

  const isPlaying = useSoundscapeStore((s) => s.isPlaying);
  const togglePlayback = useSoundscapeStore((s) => s.togglePlayback);
  const reset = useSoundscapeStore((s) => s.reset);
  const addLayer = useSoundscapeStore((s) => s.addLayer);
  const removeLayer = useSoundscapeStore((s) => s.removeLayer);
  const layers = useSoundscapeStore((s) => s.layers);
  const masterVolume = useSoundscapeStore((s) => s.masterVolume);
  const masterIsMuted = useSoundscapeStore((s) => s.masterIsMuted);
  const setMasterVolume = useSoundscapeStore((s) => s.setMasterVolume);
  const toggleMasterMute = useSoundscapeStore((s) => s.toggleMasterMute);

  // Template click handler
  const handleTemplateClick = async (template: string) => {
    if (clickedTemplates.includes(template)) {
      setClickedTemplates((prev) => prev.filter((t) => t !== template));
      layers.forEach((layer) => {
        if (layer.id.startsWith(`template-${template}-`)) removeLayer(layer.id);
      });
      return;
    }

    setClickedTemplates((prev) => [...prev, template]);
    setGeneratingTemplates((prev) => [...prev, template]);

    try {
      const response = await fetch("/api/generate-soundscape-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: template }),
      });
      if (!response.ok) throw new Error("Failed to generate soundscape");
      const data = await response.json();

      for (const layerSpec of data.soundscape.layers) {
        try {
          const soundResponse = await fetch(
            `/api/freesound?query=${encodeURIComponent(layerSpec.searchQuery)}`
          );
          if (!soundResponse.ok) continue;
          const soundData = await soundResponse.json();
          if (!soundData.results?.length) continue;

          const clip = soundData.results[0];
          const hasLoopTag = clip.tags.some((tag: string) => tag.toLowerCase().includes("loop"));

          addLayer({
            id: `template-${template}-${clip.id}-${Date.now()}`,
            url: clip.previews["preview-hq-mp3"],
            volume: layerSpec.volume || 0.5,
            loop: hasLoopTag,
            name: clip.name,
            duration: clip.duration,
          });
        } catch (err) {
          console.error("Failed to fetch sound for layer:", layerSpec.searchQuery, err);
        }
      }
    } catch (err) {
      console.error("Template generation error:", err);
    } finally {
      setGeneratingTemplates((prev) => prev.filter((t) => t !== template));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); layers.length && togglePlayback(); }
      if (e.code === "Delete") { e.preventDefault(); layers.length && (reset(), setClickedTemplates([])); }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [layers.length, togglePlayback, reset]);

  // Keep clicked templates in sync with layers
  useEffect(() => {
    const templatesWithLayers = clickedTemplates.filter((template) => {
      const isGenerating = generatingTemplates.includes(template);
      const hasLayers = layers.some((layer) => layer.id.startsWith(`template-${template}-`));
      return isGenerating || hasLayers;
    });
    if (templatesWithLayers.length !== clickedTemplates.length) setClickedTemplates(templatesWithLayers);
  }, [layers, clickedTemplates, generatingTemplates]);

  const modeConfig = {
    manual: { icon: Search, label: "Manual", color: "cyan" },
    ai: { icon: Sparkles, label: "AI", color: "indigo" },
    semantic: { icon: Brain, label: "Semantic", color: "pink" },
  };

  const renderInputComponent = () => {
    switch (mode) {
      case "manual": return <PromptInput />;
      case "ai": return <AIPromptInput />;
      case "semantic": return <SemanticPromptInput />;
    }
  };

  return (
    <main className="min-h-[calc(100vh+1px)] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pb-14">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
<div className="text-center mb-8 sm:mb-12">
  <h1 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
    {(() => {
      if (mode === "ai") return <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 hidden sm:block text-indigo-400" />;
      if (mode === "manual") return <Music className="w-10 h-10 sm:w-12 sm:h-12 hidden sm:block text-cyan-400" />;
      return <Brain className="w-10 h-10 sm:w-12 sm:h-12 hidden sm:block text-pink-400" />;
    })()}
    <span
      className={`font-bold bg-clip-text text-transparent ${
        mode === "ai"
          ? "bg-gradient-to-r from-indigo-400 to-purple-400"
          : mode === "manual"
          ? "bg-gradient-to-r from-cyan-400 to-blue-400"
          : "bg-gradient-to-r from-pink-400 to-rose-500"
      }`}
    >
      AmbianceAi
    </span>
  </h1>
  <p className="text-slate-400 text-sm sm:text-base md:text-lg px-4">
    Create ambient soundscapes with{" "}
    {mode === "manual"
      ? "manual search & templates"
      : mode === "ai"
      ? "AI generation"
      : "semantic search"}
  </p>
</div>



        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-slate-800/80 backdrop-blur-sm rounded-xl p-1.5 border border-slate-700/50 w-full sm:w-auto max-w-md">
            {Object.entries(modeConfig).map(([id, { icon: Icon, label, color }]) => (
              <button
                key={id}
                onClick={() => setMode(id as any)}
                className={`flex-1 sm:w-[160px] px-4 sm:px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium cursor-pointer text-sm sm:text-base ${
                  mode === id
                    ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg shadow-${color}-500/25`
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Component */}
        <div className="mb-8">{renderInputComponent()}</div>

        {/* Manual Mode Tips */}
        {mode === "manual" && (
          <div className="mb-8 mt-4">
            <button
              type="button"
              onClick={() => setShowSearchTips(!showSearchTips)}
              className="w-full p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl backdrop-blur-sm hover:bg-cyan-950/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lightbulb size={14} className="text-cyan-400 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-cyan-300 font-medium">Search Tips</span>
                </div>
                <span className="text-cyan-400 text-xs">{showSearchTips ? "▼" : "▶"}</span>
              </div>
            </button>
            {showSearchTips && (
              <div className="mt-2 p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl backdrop-blur-sm">
                <ul className="text-xs sm:text-sm text-cyan-400/70 space-y-0.5 list-disc list-inside">
                  <li>Try: "ocean waves", "forest birds", "rain thunder"</li>
                  <li>Sounds tagged with "loop" are shown first</li>
                  <li>Mix different sound durations for best results</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6">
          {mode === "manual" && (
            <>
              {/* Quick Template Buttons */}
              <div className="mb-6 p-3 bg-cyan-950/40 rounded-xl border border-cyan-600/50">
                <p className="text-xs sm:text-sm font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Palette size={14} className="sm:w-4 sm:h-4" /> Quick Templates:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-8 gap-y-6 text-xs sm:text-sm text-slate-400 p-3">
                  {/* Add all template buttons here as before */}
                  <TemplateIconButton
                    icon={Flame} iconColor="text-orange-500" label="fire"
                    onClick={() => handleTemplateClick("fire")}
                    isLoading={generatingTemplates.includes("fire")}
                    isClicked={clickedTemplates.includes("fire")}
                  />
                  <TemplateIconButton
                    icon={CloudLightning} iconColor="text-yellow-400" label="storm"
                    onClick={() => handleTemplateClick("storm")}
                    isLoading={generatingTemplates.includes("storm")}
                    isClicked={clickedTemplates.includes("storm")}
                  />
                  <TemplateIconButton
                    icon={Coffee} iconColor="text-amber-500" label="cafe"
                    onClick={() => handleTemplateClick("cafe")}
                    isLoading={generatingTemplates.includes("cafe")}
                    isClicked={clickedTemplates.includes("cafe")}
                  />
                  <TemplateIconButton
                    icon={Flower2} iconColor="text-rose-400" label="meditation"
                    onClick={() => handleTemplateClick("meditation")}
                    isLoading={generatingTemplates.includes("meditation")}
                    isClicked={clickedTemplates.includes("meditation")}
                  />
                  <TemplateIconButton
                    icon={Rocket} iconColor="text-pink-500" label="space"
                    onClick={() => handleTemplateClick("space")}
                    isLoading={generatingTemplates.includes("space")}
                    isClicked={clickedTemplates.includes("space")}
                  />
                  <TemplateIconButton
                    icon={Moon} iconColor="text-purple-400" label="night"
                    onClick={() => handleTemplateClick("night")}
                    isLoading={generatingTemplates.includes("night")}
                    isClicked={clickedTemplates.includes("night")}
                  />
                  <TemplateIconButton
                    icon={Waves} iconColor="text-blue-500" label="ocean"
                    onClick={() => handleTemplateClick("ocean")}
                    isLoading={generatingTemplates.includes("ocean")}
                    isClicked={clickedTemplates.includes("ocean")}
                  />
                  <TemplateIconButton
                    icon={CloudRain} iconColor="text-sky-400" label="rain"
                    onClick={() => handleTemplateClick("rain")}
                    isLoading={generatingTemplates.includes("rain")}
                    isClicked={clickedTemplates.includes("rain")}
                  />
                  <TemplateIconButton
                    icon={TreePine} iconColor="text-green-500" label="forest"
                    onClick={() => handleTemplateClick("forest")}
                    isLoading={generatingTemplates.includes("forest")}
                    isClicked={clickedTemplates.includes("forest")}
                  />
                  <TemplateIconButton
                    icon={Building2} iconColor="text-gray-400" label="city"
                    onClick={() => handleTemplateClick("city")}
                    isLoading={generatingTemplates.includes("city")}
                    isClicked={clickedTemplates.includes("city")}
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Click any template to instantly generate a soundscape
                </p>
              </div>
            </>
          )}

          <h3 className={`text-base sm:text-lg font-semibold mb-3 ${
            mode === "manual"
              ? "text-cyan-300"
              : mode === "ai"
              ? "text-violet-400"
              : "text-pink-400"
          }`}>
            How to use {mode === "manual" ? "Manual Search" : mode === "ai" ? "AI Mode" : "Semantic Mode"}:
          </h3>

          {mode === "manual" && (
            <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm sm:text-base">
              <li>Search for sounds using keywords (e.g., "rain", "birds", "wind")</li>
              <li>Click "Add Layer" on sounds you like</li>
              <li>Or click a Quick Template above for instant soundscapes</li>
              <li>Adjust volume sliders to balance your mix</li>
              <li>Press Play to start your soundscape</li>
            </ol>
          )}

          {mode === "ai" && (
            <>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm sm:text-base">
                <li>Describe your scene in natural language</li>
                <li>AI interprets and creates custom soundscape</li>
                <li>Fine-tune volumes and layers as needed</li>
                <li>Press Play to enjoy your creation</li>
              </ol>
              <div className="mt-3 p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/50">
                <p className="text-xs sm:text-sm font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Bot size={14} className="sm:w-4 sm:h-4" /> AI Examples:
                </p>
                <ul className="text-xs sm:text-sm text-slate-400 space-y-1">
                  <li>• "Peaceful forest morning with distant birds"</li>
                  <li>• "Cozy coffee shop on a rainy day"</li>
                  <li>• "Calm beach at sunset with gentle waves"</li>
                  <li>• "Mysterious sci-fi spaceship interior"</li>
                </ul>
              </div>
            </>
          )}

          {mode === "semantic" && (
            <>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm sm:text-base">
                <li>Enter a semantic description of your scene</li>
                <li>The system will interpret context to suggest relevant layers</li>
                <li>Fine-tune the volume and layer order as desired</li>
                <li>Press Play to enjoy your soundscape</li>
              </ol>
              <div className="mt-3 p-3 bg-pink-950/30 rounded-xl border border-pink-800/50">
                <p className="text-xs sm:text-sm font-semibold text-pink-300 mb-1 flex items-center gap-1.5">
                  <Brain size={14} className="sm:w-4 sm:h-4" /> Semantic Examples:
                </p>
                <ul className="text-xs sm:text-sm text-slate-400 space-y-1">
                  <li>• "Early morning forest with fog and birds"</li>
                  <li>• "Rainy city street with distant traffic"</li>
                  <li>• "Cozy fireplace with soft wind outside"</li>
                </ul>
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs sm:text-sm text-slate-400">
              <strong>Master Loop System:</strong> Sounds play in 30-second cycles with natural variation (±1.5s random timing). Short clips and non-looped sounds get automatic fade-in/fade-out for smooth playback.
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
              className={`font-medium bg-gradient-to-r bg-clip-text text-transparent transition-all ${
                mode === "manual"
                  ? "from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                  : mode === "ai"
                  ? "from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400"
                  : "from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400"
              }`}
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
            <button
              onClick={togglePlayback}
              disabled={layers.length === 0}
              className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-full hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all flex items-center justify-center shadow-md shadow-emerald-500/30"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              onClick={() => { reset(); setClickedTemplates([]) }}
              disabled={layers.length === 0}
              className="w-8 h-8 flex-shrink-0 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Clear all"
            >
              <RotateCcw size={18} />
            </button>

            <div className="flex-1 flex items-center gap-3 max-w-xs">
              <button
                onClick={toggleMasterMute}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                aria-label={masterIsMuted ? "Unmute master volume" : "Mute master volume"}
              >
                {masterIsMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} />}
              </button>
              <Slider
                value={[masterIsMuted ? 0 : masterVolume * 100]}
                onValueChange={(value) => setMasterVolume(value[0] / 100)}
                max={100}
                step={1}
                variant={mode}
                className="flex-1"
              />
              <span className="hidden sm:inline text-xs text-slate-400 w-10 text-right">
                {Math.round(masterIsMuted ? 0 : masterVolume * 100)}%
              </span>
            </div>

            <button
              onClick={() => setShowLayersPopup(!showLayersPopup)}
              disabled={layers.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Layers3 size={16} className="text-slate-300" />
              <span className="text-sm font-medium text-white min-w-[1.25rem] text-center">{layers.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layers Popup */}
      <LayersPopup isOpen={showLayersPopup} onClose={() => setShowLayersPopup(false)} variant={mode} />

      {/* Audio Player Component (no UI) */}
      <SoundscapePlayer />
    </main>
  )
}
