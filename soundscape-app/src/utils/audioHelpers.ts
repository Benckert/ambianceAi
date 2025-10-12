/**
 * Normalize volume to ensure it's between 0 and 1
 */
export function normalizeVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume));
}

/**
 * Apply crossfade between two volumes over a duration
 */
export function crossfade(
  fromVolume: number,
  toVolume: number,
  duration: number,
  onUpdate: (volume: number) => void
): void {
  const startTime = Date.now();
  const volumeDiff = toVolume - fromVolume;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentVolume = fromVolume + volumeDiff * progress;

    onUpdate(normalizeVolume(currentVolume));

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
}

/**
 * Calculate RMS (Root Mean Square) for volume leveling
 */
export function calculateRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}
