"use client";

import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";

const FADE_DURATION = 500 // Fade in/out duration in milliseconds

export const SoundscapePlayer = () => {
  const layers = useSoundscapeStore((state) => state.layers)
  const isPlaying = useSoundscapeStore((state) => state.isPlaying)
  const howlsRef = useRef<Map<string, Howl>>(new Map())
  const previousVolumesRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    // Get current layer IDs
    const currentLayerIds = new Set(layers.map((l) => l.id))

    // Remove Howl instances for layers that no longer exist
    howlsRef.current.forEach((howl, id) => {
      if (!currentLayerIds.has(id)) {
        // Fade out before removing
        if (howl.playing()) {
          const currentVol = howl.volume()
          howl.fade(currentVol, 0, FADE_DURATION)
          setTimeout(() => {
            howl.unload()
          }, FADE_DURATION)
        } else {
          howl.unload()
        }
        howlsRef.current.delete(id)
        previousVolumesRef.current.delete(id)
      }
    })

    // Create or update Howl instances for each layer
    layers.forEach((layer) => {
      let howl = howlsRef.current.get(layer.id)

      if (!howl) {
        // Create new Howl instance
        howl = new Howl({
          src: [layer.url],
          loop: layer.loop,
          volume: 0, // Start at 0 for fade-in
          html5: false, // Use Web Audio API for gapless looping
          preload: true, // Preload audio for seamless playback
          format: ["mp3"], // Specify format for better performance
        })
        howlsRef.current.set(layer.id, howl)

        // Start playing immediately if global play is active
        if (isPlaying) {
          howl.play()
          howl.fade(0, layer.volume, FADE_DURATION) // Fade in
        }
        previousVolumesRef.current.set(layer.id, layer.volume)
      } else {
        // Update volume with fade if changed
        const previousVolume = previousVolumesRef.current.get(layer.id)
        if (previousVolume !== undefined && previousVolume !== layer.volume) {
          howl.fade(previousVolume, layer.volume, 200) // Quick fade for volume changes
          previousVolumesRef.current.set(layer.id, layer.volume)
        }
        howl.loop(layer.loop)
      }

      // Play or pause based on global state
      if (isPlaying && !howl.playing()) {
        const currentVol = howl.volume()
        if (currentVol === 0) {
          howl.volume(0)
          howl.play()
          howl.fade(0, layer.volume, FADE_DURATION) // Fade in
        } else {
          howl.play()
        }
      } else if (!isPlaying && howl.playing()) {
        howl.pause()
      }
    })

    // Cleanup function
    return () => {
      if (!isPlaying) {
        howlsRef.current.forEach((howl) => {
          if (howl.playing()) {
            howl.pause()
          }
        })
      }
    }
  }, [layers, isPlaying])

  // Cleanup all Howl instances on unmount
  useEffect(() => {
    return () => {
      howlsRef.current.forEach((howl) => howl.unload())
      howlsRef.current.clear()
    }
  }, [])

  return null // UI handled separately
}
