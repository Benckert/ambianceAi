"use client";

import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";

const FADE_DURATION = 500 // Fade in/out duration in milliseconds
const MASTER_LOOP_DURATION = 30000 // 30 seconds master loop
const SHORT_CLIP_THRESHOLD = 10 // Clips shorter than this get fade-in/out (seconds)

interface ScheduledPlay {
  layerId: string
  timeouts: NodeJS.Timeout[]
}

export const SoundscapePlayer = () => {
  const layers = useSoundscapeStore((state) => state.layers)
  const isPlaying = useSoundscapeStore((state) => state.isPlaying)
  const howlsRef = useRef<Map<string, Howl>>(new Map())
  const previousVolumesRef = useRef<Map<string, number>>(new Map())
  const scheduledPlaysRef = useRef<Map<string, ScheduledPlay>>(new Map())
  const masterLoopIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const layerIdsRef = useRef<string[]>([]) // Track layer IDs to detect changes
  const previousIsPlayingRef = useRef<boolean>(false) // Track previous play state

  // Function to schedule sound plays within the master loop
  const scheduleLayerInMasterLoop = (layer: any, howl: Howl) => {
    const soundDuration = layer.duration || 5 // Default to 5s if unknown
    const soundDurationMs = soundDuration * 1000
    const isShortClip = soundDuration < SHORT_CLIP_THRESHOLD
    const needsFade = isShortClip || !layer.loop // Short clips or non-looped clips get fade

    // Calculate how many times this sound should play in 30s
    // Add some variance (±20%) to prevent exact repetition
    const baseRepeats = Math.floor(MASTER_LOOP_DURATION / soundDurationMs)
    const repeats = Math.max(1, Math.min(baseRepeats, 8)) // Cap at 8 plays per loop

    const timeouts: NodeJS.Timeout[] = []

    // Schedule plays at varied intervals
    for (let i = 0; i < repeats; i++) {
      // Distribute plays across the 30s loop with variance
      const baseDelay = (MASTER_LOOP_DURATION / repeats) * i
      // Add random variance of ±1.5 seconds
      const variance = (Math.random() - 0.5) * 3000
      const delay = Math.max(0, baseDelay + variance)

      const timeout = setTimeout(() => {
        if (howl && isPlaying) {
          const targetVolume = layer.isMuted ? 0 : layer.volume

          if (needsFade && targetVolume > 0) {
            // Apply fade-in for short/non-looped clips
            howl.volume(0)
            const soundId = howl.play()
            howl.fade(0, targetVolume, FADE_DURATION, soundId)

            // Schedule fade-out before the clip ends
            const fadeOutStart = soundDuration * 1000 - FADE_DURATION
            if (fadeOutStart > FADE_DURATION) {
              setTimeout(() => {
                howl.fade(targetVolume, 0, FADE_DURATION, soundId)
              }, fadeOutStart)
            }
          } else {
            // No fade for longer looped clips
            howl.play()
          }
        }
      }, delay)

      timeouts.push(timeout)
    }

    return timeouts
  }

  // Function to start the master loop cycle
  const startMasterLoop = () => {
    // Clear any existing master loop
    if (masterLoopIntervalRef.current) {
      clearInterval(masterLoopIntervalRef.current)
    }

    // Clear all scheduled plays
    scheduledPlaysRef.current.forEach((scheduled) => {
      scheduled.timeouts.forEach(clearTimeout)
    })
    scheduledPlaysRef.current.clear()

    // Schedule initial plays for all layers
    layers.forEach((layer) => {
      const howl = howlsRef.current.get(layer.id)
      if (howl) {
        const timeouts = scheduleLayerInMasterLoop(layer, howl)
        scheduledPlaysRef.current.set(layer.id, {
          layerId: layer.id,
          timeouts,
        })
      }
    })

    // Set up the master loop to repeat every 30 seconds
    masterLoopIntervalRef.current = setInterval(() => {
      layers.forEach((layer) => {
        const howl = howlsRef.current.get(layer.id)
        if (howl) {
          // Clear old timeouts
          const oldScheduled = scheduledPlaysRef.current.get(layer.id)
          if (oldScheduled) {
            oldScheduled.timeouts.forEach(clearTimeout)
          }

          // Schedule new plays with fresh variance
          const timeouts = scheduleLayerInMasterLoop(layer, howl)
          scheduledPlaysRef.current.set(layer.id, {
            layerId: layer.id,
            timeouts,
          })
        }
      })
    }, MASTER_LOOP_DURATION)
  }

  // Function to stop the master loop
  const stopMasterLoop = () => {
    if (masterLoopIntervalRef.current) {
      clearInterval(masterLoopIntervalRef.current)
      masterLoopIntervalRef.current = null
    }

    scheduledPlaysRef.current.forEach((scheduled) => {
      scheduled.timeouts.forEach(clearTimeout)
    })
    scheduledPlaysRef.current.clear()

    // Stop all playing sounds
    howlsRef.current.forEach((howl) => {
      if (howl.playing()) {
        const currentVol = howl.volume()
        howl.fade(currentVol, 0, FADE_DURATION)
        setTimeout(() => howl.stop(), FADE_DURATION)
      }
    })
  }

  // Effect for managing Howl instances and master loop (only when layers change)
  useEffect(() => {
    // Get current layer IDs
    const currentLayerIds = layers.map((l) => l.id).sort()
    const previousLayerIds = layerIdsRef.current

    // Check if layer composition has changed (added/removed)
    const layersChanged =
      currentLayerIds.length !== previousLayerIds.length ||
      !currentLayerIds.every((id, idx) => id === previousLayerIds[idx])

    // Check if play state changed
    const playStateChanged = isPlaying !== previousIsPlayingRef.current
    previousIsPlayingRef.current = isPlaying

    // Remove Howl instances for layers that no longer exist
    howlsRef.current.forEach((howl, id) => {
      if (!currentLayerIds.includes(id)) {
        // Fade out before removing (layer already gone from UI)
        if (howl.playing()) {
          const currentVol = howl.volume()
          // Start fade to 0
          howl.fade(currentVol, 0, FADE_DURATION)
          // Clean up after fade completes
          setTimeout(() => {
            howl.stop()
            howl.unload()
          }, FADE_DURATION)
        } else {
          // Not playing, clean up immediately
          howl.unload()
        }
        howlsRef.current.delete(id)
        previousVolumesRef.current.delete(id)
      }
    })

    // Create new Howl instances for new layers
    layers.forEach((layer) => {
      let howl = howlsRef.current.get(layer.id)

      if (!howl) {
        // Create new Howl instance with target volume immediately
        const targetVolume = layer.isMuted ? 0 : layer.volume

        howl = new Howl({
          src: [layer.url],
          loop: false, // Don't auto-loop, we'll schedule plays manually
          volume: targetVolume, // Set volume immediately (no fade)
          html5: false, // Use Web Audio API for gapless looping
          preload: true, // Preload audio for seamless playback
          format: ["mp3"], // Specify format for better performance
        })
        howlsRef.current.set(layer.id, howl)
        previousVolumesRef.current.set(layer.id, layer.volume)
      }
    })

    // Restart master loop if layers changed OR play state changed
    if (layersChanged || playStateChanged) {
      layerIdsRef.current = currentLayerIds

      if (isPlaying && layers.length > 0) {
        startMasterLoop()
      } else if (!isPlaying || layers.length === 0) {
        stopMasterLoop()
      }
    }

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
  }, [layers.map((l) => l.id).join(","), isPlaying]) // Only re-run when layer IDs or play state change

  // Separate effect for volume/mute changes (no master loop restart)
  useEffect(() => {
    layers.forEach((layer) => {
      const howl = howlsRef.current.get(layer.id)
      if (howl) {
        // Update volume instantly (no crossfade, no restart)
        const previousVolume = previousVolumesRef.current.get(layer.id)
        const effectiveVolume = layer.isMuted ? 0 : layer.volume

        if (previousVolume !== undefined && previousVolume !== layer.volume) {
          howl.volume(effectiveVolume) // Instant volume change
          previousVolumesRef.current.set(layer.id, layer.volume)
        }

        // Update volume based on mute state change
        const currentHowlVolume = howl.volume()
        if (currentHowlVolume !== effectiveVolume) {
          howl.volume(effectiveVolume)
        }
      }
    })
  }, [layers]) // Run on any layer change, but won't restart master loop

  // Cleanup all Howl instances on unmount
  useEffect(() => {
    return () => {
      howlsRef.current.forEach((howl) => howl.unload())
      howlsRef.current.clear()
    }
  }, [])

  return null // UI handled separately
}
