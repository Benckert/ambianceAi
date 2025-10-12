"use client";

import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";
import { Volume2, VolumeX, X } from "lucide-react";
import { Layer } from "@/types/soundscape";

interface LayerControlProps {
  layer: Layer;
}

export const LayerControl = ({ layer }: LayerControlProps) => {
  const setLayerVolume = useSoundscapeStore((state) => state.setLayerVolume);
  const removeLayer = useSoundscapeStore((state) => state.removeLayer);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setLayerVolume(layer.id, volume);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white truncate">
            {layer.name || 'Unnamed Layer'}
          </span>
          <button
            onClick={() => removeLayer(layer.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove layer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {layer.volume === 0 ? (
            <VolumeX size={20} className="text-gray-400" />
          ) : (
            <Volume2 size={20} className="text-gray-400" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={layer.volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-xs text-gray-400 w-10 text-right">
            {Math.round(layer.volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const LayersList = () => {
  const layers = useSoundscapeStore((state) => state.layers);

  if (layers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No layers added yet. Search for sounds to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {layers.map((layer) => (
        <LayerControl key={layer.id} layer={layer} />
      ))}
    </div>
  );
};
