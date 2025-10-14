import { create } from 'zustand';
import { Layer, SoundscapeState } from '@/types/soundscape';

export const useSoundscapeStore = create<SoundscapeState>((set) => ({
  layers: [],
  isPlaying: false,
  masterVolume: 0.7,

  addLayer: (layer: Layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),

  setLayerVolume: (id: string, volume: number) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, volume } : l)),
    })),

  setMasterVolume: (volume: number) => set({ masterVolume: volume }),

  toggleLayerMute: (id: string) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, isMuted: !l.isMuted } : l
      ),
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
