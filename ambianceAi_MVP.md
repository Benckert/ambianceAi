# 🎵 FreeSound Loopable Soundscape App MVP Blueprint

---

## 1️⃣ Project Setup

```bash
# Create Next.js project with TypeScript
npx create-next-app@latest soundscape-app --typescript
cd soundscape-app

# Install frontend dependencies
npm install zustand howler lucide-react
npx shadcn-ui init
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Optional backend dependencies
npm install express mongoose dotenv
```

---

## 2️⃣ Directory Structure (App Router)

```
app/
├─ page.tsx                # Main UI
├─ layout.tsx
├─ api/
│  ├─ freesound/route.ts   # FreeSound proxy API
│  └─ ai/route.ts           # Optional AI route for prompt → JSON
├─ components/
│  ├─ SoundscapePlayer.tsx  # Howler.js looped playback
│  ├─ LayerControl.tsx      # Volume controls / optional layer info
│  └─ PromptInput.tsx       # User prompt input
hooks/
├─ useSoundscapeStore.ts    # Zustand store for layers, playback
utils/
├─ audioHelpers.ts          # Volume normalization / crossfade helpers
├─ embeddingHelpers.ts      # Optional AI embedding functions
types/
├─ soundscape.d.ts          # Layer and soundscape interfaces
public/
styles/
├─ globals.css
```

---

## 3️⃣ State Management (Zustand)

```ts
interface Layer {
  id: string;
  url: string;
  volume: number;
  loop: boolean;
}

export const useSoundscapeStore = create<SoundscapeState>((set) => ({
  layers: [],
  isPlaying: false,
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  setLayerVolume: (id, volume) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, volume } : l),
  })),
  togglePlayback: () => set(state => ({ isPlaying: !state.isPlaying })),
  reset: () => set({ layers: [], isPlaying: false }),
}));
```

---

## 4️⃣ FreeSound API Proxy (App Router)

`app/api/freesound/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');
  const token = process.env.FREESOUND_API_KEY;

  const url = `https://freesound.org/apiv2/search/text/?query=${query}&fields=id,name,previews,duration,tags&filter=duration:[0.0 TO 30.0]&token=${token}`;
  const response = await fetch(url);
  const data = await response.json();

  const loopable = data.results.filter((clip: any) => clip.tags.includes('loop'));
  return NextResponse.json(loopable);
}
```

- Filters **<30s and loopable clips**  
- API key stays hidden server-side  

---

## 5️⃣ AI Interpretation Route (Optional)

`app/api/ai/route.ts`:

- Accepts user prompt  
- Pre-prompt embeddings → expand semantic meaning  
- LLM → JSON structure of soundscape layers  
- Post-prompt embeddings → map layers to FreeSound clips  

**Note:** For MVP, this can initially be **hardcoded or lightweight** to simplify development.

---

## 6️⃣ Audio Playback (Howler.js)

`components/SoundscapePlayer.tsx`:

```tsx
"use client";

import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { useSoundscapeStore } from "../hooks/useSoundscapeStore";

export const SoundscapePlayer = () => {
  const layers = useSoundscapeStore((state) => state.layers);
  const isPlaying = useSoundscapeStore((state) => state.isPlaying);
  const howlsRef = useRef<Howl[]>([]);

  useEffect(() => {
    // Clean up old Howl instances
    howlsRef.current.forEach(h => h.unload());
    howlsRef.current = [];

    // Initialize new Howl instances
    layers.forEach(layer => {
      const howl = new Howl({
        src: [layer.url],
        loop: true,
        volume: layer.volume,
      });
      howlsRef.current.push(howl);
      if (isPlaying) howl.play();
    });

    if (!isPlaying) howlsRef.current.forEach(h => h.pause());
  }, [layers, isPlaying]);

  return null; // UI handled separately
};
```

- All playback is **loop-only**  
- Layer volumes adjustable via Zustand  
- Optional crossfade logic in `audioHelpers.ts`

---

## 7️⃣ Frontend Components

- `PromptInput.tsx` → User inputs prompt, triggers AI/FreeSound fetch  
- `LayerControl.tsx` → Show each layer, allow volume adjustment (optional)  
- `SoundscapePlayer.tsx` → Handles looped playback  

- Use **shadcn/ui** + **Tailwind** for buttons, sliders, input fields  
- Use **Lucide icons** for play, stop, volume, layer indicators

---

## 8️⃣ Optional Backend / Database

- **MongoDB + Mongoose**  
  - Cache JSON + clip URLs  
  - Store user-created soundscapes for reuse  
- API routes can read/write directly via server components

---

## 9️⃣ Future Implementations / Nice-to-Haves

| Feature | Description |
|---------|-------------|
| Embeddings pre/post prompt | Expand prompt and match layers semantically |
| AI consistency check | Detect overlapping frequencies or abrupt transitions |
| User accounts / saved soundscapes | MongoDB to store user data |
| Volume sliders per layer | Fine control over playback |
| Crossfade / loop smoothing | Preprocess clips for seamless playback |
| Hybrid AI clips | Later generate missing or custom layers |
| Export/download | Allow users to save mixed soundscape |
| Mobile responsive UI | Tailwind + shadcn for all devices |

---

## 🔟 Deployment

- **Vercel**: Deploy frontend + API routes  
- **MongoDB Atlas**: Free tier for caching / storing soundscapes  
- **Environment Variables**: Store FreeSound API key, AI API keys if needed

---

## ✅ Summary

- **Frontend:** Next.js App Router + React + Zustand + Howler.js + Tailwind + shadcn/ui + Lucide  
- **Backend:** API routes via App Router (FreeSound proxy, optional AI interpretation)  
- **Database:** MongoDB + Mongoose for caching and user data  
- **AI Usage:** Light — embeddings and LLM for prompt interpretation & layer mapping  
- **Playback:** Loop-only soundscapes, layers mixed with Howler.js  
