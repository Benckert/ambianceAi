"use client";

import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { useSoundscapeStore } from "@/hooks/useSoundscapeStore";

const FADE_DURATION = 500 // Fade in/out duration in milliseconds
const MASTER_LOOP_DURATION = 30000 // 30 seconds master loop

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

  // Function to schedule sound plays within the master loop
  const scheduleLayerInMasterLoop = (layer: any, howl: Howl) => {
    const soundDuration = layer.duration || 5 // Default to 5s if unknown
    const soundDurationMs = soundDuration * 1000

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
          howl.play()
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
          loop: false, // Don't auto-loop, we'll schedule plays manually
          volume: 0, // Start at 0 for fade-in
          html5: false, // Use Web Audio API for gapless looping
          preload: true, // Preload audio for seamless playback
          format: ["mp3"], // Specify format for better performance
        })
        howlsRef.current.set(layer.id, howl)

        // Fade in the volume
        setTimeout(() => {
          howl?.fade(0, layer.volume, FADE_DURATION)
        }, 100)

        previousVolumesRef.current.set(layer.id, layer.volume)
      } else {
        // Update volume with fade if changed
        const previousVolume = previousVolumesRef.current.get(layer.id)
        if (previousVolume !== undefined && previousVolume !== layer.volume) {
          howl.fade(previousVolume, layer.volume, 200) // Quick fade for volume changes
          previousVolumesRef.current.set(layer.id, layer.volume)
        }
      }
    })

    // Start or stop the master loop based on play state
    if (isPlaying && layers.length > 0) {
      startMasterLoop()
    } else {
      stopMasterLoop()
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
