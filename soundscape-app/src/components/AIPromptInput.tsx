"use client";

import { useState, useRef } from "react"
import { Sparkles, Loader2, Lightbulb } from "lucide-react"
import { Music, Search, Bot } from "lucide-react"
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore"
import { AILayerSpec, FreeSoundClip } from "@/types/soundscape"

interface AIPromptInputProps {
  onClearTemplates?: () => void
}

export const AIPromptInput = ({ onClearTemplates }: AIPromptInputProps) => {
  const [keywords, setKeywords] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<React.ReactNode>("")
  const [showInfo, setShowInfo] = useState(false) // Info banner visibility
  const addLayer = useSoundscapeStore((state) => state.addLayer)
  const reset = useSoundscapeStore((state) => state.reset)
  const inputRef = useRef<HTMLInputElement>(null)

  // Track last prompt to detect duplicates
  const lastPromptRef = useRef<string>("")

  // Remove mode change notification since we no longer have template mode
  // AI mode is now the only mode in this component

  // Remove setKeywordsRef logic - templates now generate directly without filling input

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keywords.trim()) {
      inputRef.current?.focus()
      return
    }

    setIsGenerating(true)
    setError(null)

    // Detect if this is a duplicate prompt for randomization
    const isDuplicate = lastPromptRef.current === keywords.trim()
    const shouldRandomize = isDuplicate

    if (shouldRandomize) {
      setGenerationStatus(
        <span className="flex items-center gap-2">
          <Sparkles
            size={18}
            className="text-indigo-400"
          />
          AI is creating a new variation...
        </span>
      )
    } else {
      setGenerationStatus(
        <span className="flex items-center gap-2">
          <Bot
            size={18}
            className="text-indigo-400"
          />
          AI is analyzing your keywords...
        </span>
      )
    }

    // Store this prompt for next time
    lastPromptRef.current = keywords.trim()

    try {
      // Always use AI endpoint now (removed template mode)
      const endpoint = "/api/generate-soundscape"

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

        // Check if AI quota reached - fallback to manual mode (not template mode)
        if (errorData.fallbackToTemplate) {
          setError(
            "AI rate limit reached. Please switch to Manual Search mode or try again later."
          )
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
          <span className="flex items-center gap-2">
            <Loader2
              size={18}
              className="text-indigo-400 animate-spin"
            />
            Using cached result! Found {soundscape.layers.length} layers.
            Fetching sounds...
          </span>
        )
      } else {
        setGenerationStatus(
          <span className="flex items-center gap-2">
            <Music
              size={18}
              className="text-indigo-400"
            />
            Found {soundscape.layers.length} layers. Fetching sounds...
          </span>
        )
      }

      // Step 2: Clear existing layers
      reset()
      onClearTemplates?.() // Also clear clicked template buttons

      // Step 3: Fetch sounds for each layer (with duplicate prevention)
      let successCount = 0
      const usedSoundIds = new Set<number>() // Track used sound IDs to prevent duplicates

      for (let i = 0; i < soundscape.layers.length; i++) {
        const layerSpec = soundscape.layers[i]
        setGenerationStatus(
          <span className="flex items-center gap-2">
            <Search
              size={16}
              className="text-indigo-400"
            />
            Fetching {layerSpec.category} sound ({i + 1}/
            {soundscape.layers.length}): {layerSpec.description}
          </span>
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
          <span className="flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-indigo-400"
            />
            Soundscape complete! Added {successCount}/{soundscape.layers.length}{" "}
            layers. {soundscape.mixingNotes}
          </span>
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
            placeholder="Describe your soundscape..."
            className="w-full px-4 py-3 bg-slate-800/80 text-white rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-slate-500 backdrop-blur-sm text-sm sm:text-base"
            disabled={isGenerating}
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating}
          className="px-4 sm:px-6 py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer text-sm sm:text-base whitespace-nowrap w-[90px] sm:w-[140px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/25 disabled:from-indigo-700/70 disabled:to-purple-700/70 disabled:cursor-wait disabled:shadow-none disabled:opacity-75"
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

      {/* Collapsible Info Banner */}
      <div>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="w-full p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl backdrop-blur-sm hover:bg-indigo-950/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lightbulb
                size={14}
                className="text-indigo-400 sm:w-4 sm:h-4 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-indigo-300 font-medium">
                AI Features & Limits
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
              <li>Generative AI via <code>gpt-oss:120b</code> for creating ambient soundscapes</li>
              <li>Generates structured JSON for multiple audio layers (background, midground, foreground)</li>
              <li>Responses cached for 24h for faster reuse</li>
              <li>Rate limited to 2 requests/min — switch to Manual Search if limit is reached</li>
              <li>Supports optional randomness to vary volume and layer selection</li>
            </ul>
          </div>
        )}
      </div>

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
    </div>
  )
}
