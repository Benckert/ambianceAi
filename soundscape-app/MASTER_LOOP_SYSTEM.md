# Master Loop System 🔄

## What Changed

The soundscape player now uses a **30-second master loop** instead of continuously looping individual sounds. This creates a more natural, less repetitive ambient experience.

## How It Works

### Before (Simple Loop):
```
Sound A (3s): ▶️▶️▶️▶️▶️▶️▶️▶️▶️▶️... (continuous rapid loop)
Sound B (5s): ▶️▶️▶️▶️▶️▶️... (continuous rapid loop)
```
**Problem**: Short sounds looping rapidly become monotonous and hectic.

### After (Master Loop):
```
30-Second Master Loop:
Sound A (3s): ▶️..▶️....▶️...▶️......▶️...▶️....▶️..▶️...
Sound B (5s): ▶️....▶️......▶️....▶️.....▶️....▶️...
              |------- 30 seconds -------|  (repeats)
```
**Benefits**: 
- Sounds play at **varied intervals** within each 30s cycle
- Creates a more **organic, natural** atmosphere
- Each 30s loop has **slightly different timing** (±1.5s variance)
- Less repetitive and hectic

## Key Features

### 1. **Smart Scheduling**
- Calculates how many times each sound should play in 30 seconds
- Based on sound duration (shorter sounds play more often)
- Capped at 8 plays per loop to prevent overload

### 2. **Variance (Randomization)**
- Each play time has ±1.5 seconds of random variance
- New variance pattern every 30 seconds
- Prevents exact repetition

### 3. **Balanced Distribution**
Sounds are distributed evenly across the 30s loop:
- 3s sound → plays ~8 times (every 3-4s with variance)
- 5s sound → plays ~6 times (every 5-6s with variance)
- 10s sound → plays ~3 times (every 10-11s with variance)
- 20s sound → plays ~1-2 times per loop

## Example

If you add these layers:
- **Rain** (4 seconds)
- **Thunder** (6 seconds)  
- **Wind** (8 seconds)

**30-Second Master Loop Pattern:**
```
Time:  0s    5s    10s   15s   20s   25s   30s
Rain:  🌧️    🌧️     🌧️    🌧️     🌧️    🌧️    🌧️   (7 plays)
Thunder: ⛈️        ⛈️          ⛈️         ⛈️    (4 plays)
Wind:    💨      💨         💨        💨      (4 plays)
```

Each loop, the exact timing shifts slightly, creating natural variation.

## Benefits

### ✅ Less Hectic
- Sounds don't repeat constantly
- More space between plays
- Natural breathing room

### ✅ More Natural
- Mimics how sounds occur in nature (irregular patterns)
- Each 30s cycle feels slightly different
- Avoids the "broken record" effect

### ✅ Better Layering
- Multiple sounds can overlap naturally
- Creates rich, evolving textures
- Maintains interesting soundscape over time

### ✅ Easier on Memory
- Sounds only play when scheduled
- No continuous looping overhead
- Better performance with many layers

## Technical Implementation

### Scheduling Algorithm:
```javascript
1. Calculate base repeats: 30s / sound_duration
2. Cap at 8 plays max per loop
3. Distribute evenly: interval = 30s / repeats
4. Add variance: ±1.5 seconds random
5. Schedule all plays with setTimeout
6. Repeat cycle every 30 seconds with new variance
```

### Fade Behavior:
- **Add layer**: Fades in over 500ms
- **Remove layer**: Fades out over 500ms  
- **Volume change**: Crossfades over 200ms
- Prevents audio pops and clicks

## Best Practices

### For Best Results:

1. **Mix different durations**
   - Combine short (3-5s) with medium (8-12s) and long (15-25s) sounds
   - Creates more interesting patterns

2. **Use 3-5 layers**
   - Sweet spot for complexity without chaos
   - Each layer has room to breathe

3. **Adjust volumes**
   - Longer sounds → lower volume (20-40%)
   - Shorter sounds → medium volume (40-60%)
   - Creates balanced mix

4. **Choose complementary sounds**
   - Background: wind, rain, ocean (lower volume)
   - Mid: crickets, birds, rustling (medium volume)
   - Accent: thunder, bells, chimes (higher volume, plays less often)

## Examples to Try

### Peaceful Forest:
- Wind ambience (10s) - 30% volume
- Bird chirps (4s) - 50% volume
- Rustling leaves (6s) - 40% volume

### Ocean Atmosphere:
- Ocean waves (15s) - 40% volume
- Seagulls (5s) - 30% volume
- Wind (8s) - 35% volume

### Rainy Day:
- Rain ambience (12s) - 50% volume
- Thunder (8s) - 40% volume
- Wind (10s) - 30% volume

## Comparison

| Feature | Simple Loop | Master Loop |
|---------|-------------|-------------|
| Repetitiveness | High (every 3-5s) | Low (30s cycle with variance) |
| Natural Feel | Mechanical | Organic |
| Hectic Feeling | Yes (short loops) | No (spaced out) |
| Memory Usage | Constant streaming | Scheduled plays |
| Variance | None | ±1.5s per play |
| Complexity | Simple | Rich layers |

## Future Enhancements

Possible improvements:
- [ ] User-adjustable master loop duration (15s, 30s, 60s)
- [ ] Per-layer density control (play more/less often)
- [ ] Smart overlap prevention (avoid too many simultaneous plays)
- [ ] Pattern presets (e.g., "dense", "sparse", "rhythmic")
- [ ] Visual timeline showing when sounds will play
- [ ] Save/load master loop patterns

---

**Result**: A much more pleasant, natural-sounding ambient experience that feels less repetitive and hectic! 🎵✨
