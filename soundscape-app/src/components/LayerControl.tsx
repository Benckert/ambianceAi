"use client";

import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, X } from "lucide-react"
import { Layer } from "@/types/soundscape"

interface LayerControlProps {
  layer: Layer
}

// Utility function to truncate long filenames
const truncateFilename = (filename: string, maxLength: number = 40): string => {
  if (filename.length <= maxLength) return filename

  const extension = filename.split(".").pop()
  const nameWithoutExt = filename.slice(0, filename.lastIndexOf("."))

  if (extension && nameWithoutExt.length > maxLength - extension.length - 4) {
    const truncated = nameWithoutExt.slice(0, maxLength - extension.length - 4)
    return `${truncated}...${extension}`
  }

  return filename.slice(0, maxLength - 3) + "..."
}

export const LayerControl = ({ layer }: LayerControlProps) => {
  const setLayerVolume = useSoundscapeStore((state) => state.setLayerVolume)
  const toggleLayerMute = useSoundscapeStore((state) => state.toggleLayerMute)
  const removeLayer = useSoundscapeStore((state) => state.removeLayer)

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setLayerVolume(layer.id, newVolume)
  }

  const handleToggleMute = () => {
    toggleLayerMute(layer.id)
  }

  const isMuted = layer.isMuted || layer.volume === 0
  const displayVolume = isMuted ? 0 : layer.volume * 100
  const displayName = truncateFilename(layer.name || "Unnamed Layer", 40)

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-800 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span
            className="text-xs sm:text-sm font-medium text-white truncate flex-1 min-w-0"
            title={layer.name || "Unnamed Layer"}
          >
            {displayName}
          </span>
          <button
            onClick={() => removeLayer(layer.id)}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Remove layer"
          >
            <X
              size={14}
              className="sm:w-4 sm:h-4"
            />
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleToggleMute}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            aria-label={isMuted ? "Unmute layer" : "Mute layer"}
          >
            {isMuted ? (
              <VolumeX
                size={18}
                className="text-red-400 sm:w-5 sm:h-5"
              />
            ) : (
              <Volume2
                size={18}
                className="sm:w-5 sm:h-5"
              />
            )}
          </button>
          <Slider
            value={[displayVolume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-400 w-12 sm:w-14 text-right flex-shrink-0">
            {Math.round(displayVolume)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export const LayersList = () => {
  const layers = useSoundscapeStore((state) => state.layers)

  if (layers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
        No layers added yet. Search for sounds to get started.
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {layers.map((layer) => (
        <LayerControl
          key={layer.id}
          layer={layer}
        />
      ))}
    </div>
  )
}
