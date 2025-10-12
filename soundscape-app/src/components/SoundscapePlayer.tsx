"use client";

import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";

export const SoundscapePlayer = () => {
  const layers = useSoundscapeStore((state) => state.layers);
  const isPlaying = useSoundscapeStore((state) => state.isPlaying);
  const howlsRef = useRef<Map<string, Howl>>(new Map());

  useEffect(() => {
    // Get current layer IDs
    const currentLayerIds = new Set(layers.map(l => l.id));
    
    // Remove Howl instances for layers that no longer exist
    howlsRef.current.forEach((howl, id) => {
      if (!currentLayerIds.has(id)) {
        howl.unload();
        howlsRef.current.delete(id);
      }
    });

    // Create or update Howl instances for each layer
    layers.forEach(layer => {
      let howl = howlsRef.current.get(layer.id);
      
      if (!howl) {
        // Create new Howl instance
        howl = new Howl({
          src: [layer.url],
          loop: layer.loop,
          volume: layer.volume,
          html5: true, // Use HTML5 Audio for better streaming
        });
        howlsRef.current.set(layer.id, howl);
      } else {
        // Update existing Howl instance
        howl.volume(layer.volume);
        howl.loop(layer.loop);
      }

      // Play or pause based on global state
      if (isPlaying && !howl.playing()) {
        howl.play();
      } else if (!isPlaying && howl.playing()) {
        howl.pause();
      }
    });

    // Cleanup function
    return () => {
      if (!isPlaying) {
        howlsRef.current.forEach(howl => {
          if (howl.playing()) {
            howl.pause();
          }
        });
      }
    };
  }, [layers, isPlaying]);

  // Cleanup all Howl instances on unmount
  useEffect(() => {
    return () => {
      howlsRef.current.forEach(howl => howl.unload());
      howlsRef.current.clear();
    };
  }, []);

  return null; // UI handled separately
};
