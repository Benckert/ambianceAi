export interface Layer {
  id: string
  url: string
  volume: number
  loop: boolean
  name?: string
  duration?: number // Duration in seconds
  isMuted?: boolean // Mute state
}

export interface SoundscapeState {
  layers: Layer[]
  isPlaying: boolean
  addLayer: (layer: Layer) => void
  setLayerVolume: (id: string, volume: number) => void
  toggleLayerMute: (id: string) => void
  removeLayer: (id: string) => void
  togglePlayback: () => void
  reset: () => void
}

export interface FreeSoundClip {
  id: number;
  name: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
  };
  duration: number;
  tags: string[];
}
