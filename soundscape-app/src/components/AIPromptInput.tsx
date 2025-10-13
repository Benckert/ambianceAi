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
  const [useSimpleMode, setUseSimpleMode] = useState(true) // Default to free mode
  const addLayer = useSoundscapeStore((state) => state.addLayer)
  const reset = useSoundscapeStore((state) => state.reset)

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

    if (!keywords.trim()) return

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
      <div className="flex items-center justify-between p-3 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Generation Mode:</span>
          <button
            type="button"
            onClick={() => setUseSimpleMode(!useSimpleMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              useSimpleMode ? "bg-emerald-500" : "bg-indigo-500"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useSimpleMode ? "translate-x-1" : "translate-x-6"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-white">
            {useSimpleMode ? "🎨 Template (Free)" : "🤖 AI (Requires Credits)"}
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {useSimpleMode
            ? "Uses predefined templates"
            : "Uses OpenAI GPT-3.5 (cached & rate-limited)"}
        </span>
      </div>

      {/* Rate Limit Info Banner */}
      {!useSimpleMode && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-sm">⚡</span>
            <div className="flex-1">
              <p className="text-xs text-amber-300 font-medium mb-1">
                AI Mode Optimizations Active:
              </p>
              <ul className="text-xs text-amber-400/80 space-y-0.5 list-disc list-inside">
                <li>Responses cached for 24h (instant re-use)</li>
                <li>Rate limited to 2 requests/min (stays under 3 RPM)</li>
                <li>Auto-fallback to Template mode if limit reached</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleGenerate}
        className="flex gap-2"
      >
        <div className="flex-1">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={
              useSimpleMode
                ? "Try: forest, rain, ocean, cafe, night, storm..."
                : "Describe your soundscape (e.g., 'peaceful forest morning with birds')"
            }
            className="w-full px-4 py-3 bg-slate-800/80 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder:text-slate-500 backdrop-blur-sm"
            disabled={isGenerating}
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating || !keywords.trim()}
          className={`px-6 py-3 rounded-xl text-white font-medium transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
            useSimpleMode
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25"
              : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/25"
          } disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none`}
        >
          {isGenerating ? (
            <>
              <Loader2
                size={20}
                className="animate-spin"
              />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate
            </>
          )}
        </button>
      </form>

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
          💡 <strong>Pro tip:</strong> Be descriptive! Examples:
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
