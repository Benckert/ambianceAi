export interface Layer {
  id: string
  url: string
  volume: number
  loop: boolean
  name?: string
  duration?: number // Duration in seconds
  isMuted?: boolean // Mute state
  lastVolume?: number // Volume before muting
}

export interface SoundscapeState {
  layers: Layer[]
  isPlaying: boolean
  masterVolume: number
  masterIsMuted: boolean
  lastMasterVolume: number
  addLayer: (layer: Layer) => void
  setLayerVolume: (id: string, volume: number) => void
  setMasterVolume: (volume: number) => void
  toggleMasterMute: () => void
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

export interface AILayerSpec {
  searchQuery: string
  category: "background" | "midground" | "foreground"
  volume: number
  description: string
}

export interface AISoundscapeStructure {
  layers: AILayerSpec[]
  mixingNotes: string
}

export interface GeneratedSoundscape {
  success: boolean
  soundscape: AISoundscapeStructure
  keywords: string
}
