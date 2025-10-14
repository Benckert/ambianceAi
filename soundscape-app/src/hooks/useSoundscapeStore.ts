import { create } from 'zustand';
import { Layer, SoundscapeState } from '@/types/soundscape';

export const useSoundscapeStore = create<SoundscapeState>((set) => ({
  layers: [],
  isPlaying: false,
  masterVolume: 0.7,
  masterIsMuted: false,
  lastMasterVolume: 0.7,

  addLayer: (layer: Layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),

  setLayerVolume: (id: string, volume: number) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id === id) {
          // If volume is set to 0, mute the layer and set lastVolume to 0.7
          if (volume === 0 && !l.isMuted) {
            return { ...l, volume: 0, isMuted: true, lastVolume: 0.7 }
          }
          // If volume is set above 0 and layer is muted, unmute it
          if (volume > 0 && l.isMuted) {
            return { ...l, volume, isMuted: false }
          }
          return { ...l, volume }
        }
        return l
      }),
    })),

  setMasterVolume: (volume: number) =>
    set((state) => {
      // If volume is set to 0, mute and set lastMasterVolume to 0.7
      if (volume === 0 && !state.masterIsMuted) {
        return { masterVolume: 0, masterIsMuted: true, lastMasterVolume: 0.7 }
      }
      // If volume is set above 0 and muted, unmute
      if (volume > 0 && state.masterIsMuted) {
        return { masterVolume: volume, masterIsMuted: false }
      }
      return { masterVolume: volume }
    }),

  toggleMasterMute: () =>
    set((state) => {
      if (state.masterIsMuted) {
        // Unmute: restore last volume
        return { masterIsMuted: false, masterVolume: state.lastMasterVolume }
      } else {
        // Mute: save current volume and set to 0
        return {
          masterIsMuted: true,
          lastMasterVolume: state.masterVolume > 0 ? state.masterVolume : 0.7,
          masterVolume: 0,
        }
      }
    }),

  toggleLayerMute: (id: string) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id === id) {
          if (l.isMuted) {
            // Unmute: restore last volume or default to 0.7
            const restoredVolume = l.lastVolume ?? 0.7
            return { ...l, isMuted: false, volume: restoredVolume }
          } else {
            // Mute: save current volume and set to 0
            return {
              ...l,
              isMuted: true,
              lastVolume: l.volume > 0 ? l.volume : 0.7,
              volume: 0,
            }
          }
        }
        return l
      }),
    })),

  removeLayer: (id: string) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
    })),

  togglePlayback: () =>
    set((state) => ({
      isPlaying: !state.isPlaying,
    })),

  reset: () =>
    set({
      layers: [],
      isPlaying: false,
    }),
}))
