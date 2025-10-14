"use client";

import { useState, useEffect, useRef } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore"
import { AILayerSpec, FreeSoundClip } from "@/types/soundscape"

interface AIPromptInputProps {
  onModeChange?: (isTemplate: boolean) => void
}

export const AIPromptInput = ({ onModeChange }: AIPromptInputProps) => {
  const [keywords, setKeywords] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const [useSimpleMode, setUseSimpleMode] = useState(false) // Default to AI mode
  const [showInfo, setShowInfo] = useState(false) // Info banner visibility
  const addLayer = useSoundscapeStore((state) => state.addLayer)
  const reset = useSoundscapeStore((state) => state.reset)
  const inputRef = useRef<HTMLInputElement>(null)

  // Track last prompt to detect duplicates
  const lastPromptRef = useRef<string>("")

  // Notify parent component when mode changes
  useEffect(() => {
    if (onModeChange) {
      onModeChange(useSimpleMode)
    }
  }, [useSimpleMode, onModeChange])

  const fetchSoundForLayer = async (
    layerSpec: AILayerSpec,
    excludeSoundIds: Set<number> = new Set(),
    resultIndex: number = 0
  ): Promise<FreeSoundClip | null> => {
    try {
      const response = await fetch(
        `/api/freesound?query=${encodeURIComponent(layerSpec.searchQuery)}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch sound")
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        // Find first result that's not in the excluded set
        for (let i = resultIndex; i < data.results.length; i++) {
          const result = data.results[i]
          if (!excludeSoundIds.has(result.id)) {
            return result
          }
        }

        // If all results are duplicates, try from the beginning
        for (let i = 0; i < Math.min(resultIndex, data.results.length); i++) {
          const result = data.results[i]
          if (!excludeSoundIds.has(result.id)) {
            return result
          }
        }
      }

      return null
    } catch (err) {
      console.error(`Failed to fetch sound for: ${layerSpec.searchQuery}`, err)
      return null
    }
  }

  const handleGenerate = async (
    e: React.FormEvent,
    forceTemplateMode = false
  ) => {
    e.preventDefault()

    if (!keywords.trim()) {
      inputRef.current?.focus()
      return
    }

    // If forced to use template mode (after fallback), ensure it's set
    const effectiveMode = forceTemplateMode ? true : useSimpleMode

    setIsGenerating(true)
    setError(null)

    // Detect if this is a duplicate prompt for randomization
    const isDuplicate = lastPromptRef.current === keywords.trim()
    const shouldRandomize = isDuplicate

    if (shouldRandomize) {
      setGenerationStatus(
        effectiveMode
          ? "🎲 Creating new variation..."
          : "🎲 AI is creating a new variation..."
      )
    } else {
      setGenerationStatus(
        effectiveMode
          ? "🎨 Creating soundscape template..."
          : "🤖 AI is analyzing your keywords..."
      )
    }

    // Store this prompt for next time
    lastPromptRef.current = keywords.trim()

    try {
      // Choose endpoint based on mode (use effective mode to respect forceTemplateMode)
      const endpoint = effectiveMode
        ? "/api/generate-soundscape-simple"
        : "/api/generate-soundscape"

      // Step 1: Get AI structure
      const aiResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.trim(),
          randomize: shouldRandomize, // Pass randomize flag to bypass cache
        }),
      })

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}))
        console.error("API Error:", errorData)

        // Check if we should auto-fallback to template mode
        if (errorData.fallbackToTemplate && !effectiveMode) {
          setError(
            "AI rate limit reached. Switching to Template mode and regenerating..."
          )

          // Switch to template mode
          setUseSimpleMode(true)

          // Wait a moment, then automatically regenerate with template mode FORCED
          setTimeout(() => {
            setError(null)
            // Recursively call handleGenerate WITH forceTemplateMode=true
            handleGenerate(e, true)
          }, 1500)
          return
        }

        throw new Error(
          errorData.error ||
            errorData.details ||
            "Failed to generate soundscape structure"
        )
      }

      const response = await aiResponse.json()
      const { soundscape, cached } = response

      // Show cache status
      if (cached) {
        setGenerationStatus(
          `💾 Using cached result! Found ${soundscape.layers.length} layers. Fetching sounds...`
        )
      } else {
        setGenerationStatus(
          `🎵 Found ${soundscape.layers.length} layers. Fetching sounds...`
        )
      }

      // Step 2: Clear existing layers
      reset()

      // Step 3: Fetch sounds for each layer (with duplicate prevention)
      let successCount = 0
      const usedSoundIds = new Set<number>() // Track used sound IDs to prevent duplicates

      for (let i = 0; i < soundscape.layers.length; i++) {
        const layerSpec = soundscape.layers[i]
        setGenerationStatus(
          `🔍 Fetching ${layerSpec.category} sound (${i + 1}/${
            soundscape.layers.length
          }): ${layerSpec.description}`
        )

        // Fetch sound, automatically excluding already-used IDs
        const sound = await fetchSoundForLayer(layerSpec, usedSoundIds)

        if (sound) {
          // Track this sound ID to prevent duplicates
          usedSoundIds.add(sound.id)

          // Add layer with AI-recommended volume
          addLayer({
            id: `ai-layer-${sound.id}-${Date.now()}-${i}`,
            url: sound.previews["preview-hq-mp3"],
            volume: layerSpec.volume,
            loop: true,
            name: sound.name,
            duration: sound.duration,
            isMuted: false,
          })
          successCount++
          console.log(`✅ Added unique sound: ${sound.name} (ID: ${sound.id})`)
        } else {
          console.log(
            `⚠️ Could not find unique sound for layer ${i + 1}, skipping...`
          )
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      if (successCount === 0) {
        setError("Could not find any suitable sounds. Try different keywords.")
      } else {
        setGenerationStatus(
          `✨ Soundscape complete! Added ${successCount}/${soundscape.layers.length} layers. ${soundscape.mixingNotes}`
        )

        // Clear status after 5 seconds
        setTimeout(() => setGenerationStatus(""), 5000)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate soundscape. Please try again."
      setError(errorMessage)
      console.error("Generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex flex-col gap-3 p-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-slate-400">Mode:</span>
            <button
              type="button"
              onClick={() => setUseSimpleMode(!useSimpleMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all cursor-pointer flex-shrink-0 ${
                useSimpleMode
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                  useSimpleMode ? "translate-x-1" : "translate-x-6"
                }`}
              />
            </button>
            <span className="text-xs sm:text-sm font-medium text-white">
              {useSimpleMode ? "🎨 Template" : "🤖 AI"}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {useSimpleMode
            ? "Uses predefined templates (free)"
            : "Uses OpenAI GPT-3.5 (cached & rate-limited)"}
        </p>
      </div>

      {/* Rate Limit Info Banner - Removed from here */}

      <form
        onSubmit={handleGenerate}
        className="flex flex-col sm:flex-row gap-2"
      >
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={
              useSimpleMode
                ? "Try: forest, rain, ocean, cafe..."
                : "Describe your soundscape..."
            }
            className="w-full px-4 py-3 bg-slate-800/80 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder:text-slate-500 backdrop-blur-sm text-sm sm:text-base"
            disabled={isGenerating}
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating}
          className={`px-4 sm:px-6 py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer text-sm sm:text-base whitespace-nowrap ${
            useSimpleMode
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25"
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/25"
          } disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none`}
        >
          {isGenerating ? (
            <>
              <Loader2
                size={18}
                className="animate-spin sm:w-5 sm:h-5"
              />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles
                size={18}
                className="sm:w-5 sm:h-5"
              />
              <span className="hidden sm:inline">Generate</span>
            </>
          )}
        </button>
      </form>

      {/* Collapsible Info Banner - Below form */}
      {!useSimpleMode && (
        <div>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="w-full p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl backdrop-blur-sm hover:bg-indigo-950/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 text-sm flex-shrink-0">
                  💡
                </span>
                <span className="text-xs sm:text-sm text-indigo-300 font-medium">
                  Smart Features Enabled
                </span>
              </div>
              <span className="text-indigo-400 text-xs">
                {showInfo ? "▼" : "▶"}
              </span>
            </div>
          </button>
          {showInfo && (
            <div className="mt-2 p-3 bg-indigo-950/20 border border-indigo-800/30 rounded-xl backdrop-blur-sm">
              <ul className="text-xs sm:text-sm text-indigo-400/70 space-y-0.5 list-disc list-inside">
                <li>Responses cached for 24h (instant re-use)</li>
                <li>Rate limited to 2 requests/min (stays under 3 RPM)</li>
                <li>Auto-fallback to Template mode if limit reached</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {generationStatus && (
        <div className="p-4 bg-indigo-950/30 border border-indigo-800/50 rounded-xl text-indigo-300 text-sm backdrop-blur-sm">
          {generationStatus}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl text-rose-400 backdrop-blur-sm">
          {error}
        </div>
      )}

      <div className="text-xs text-slate-500 space-y-1">
        <p>
          <strong>Pro tip:</strong> Be descriptive! Examples:
        </p>
        <ul className="list-disc list-inside ml-4 space-y-1 text-slate-600">
          <li>"Rainy forest night with distant thunder"</li>
          <li>"Peaceful ocean beach sunset with seagulls"</li>
          <li>"Cozy coffee shop ambience with light chatter"</li>
          <li>"Mystical cave with water drips and wind"</li>
        </ul>
      </div>
    </div>
  )
}
