# 🎵 Soundscape Creator

A Next.js application for creating ambient soundscapes using loopable sounds from FreeSound.org.

## Features

- 🔍 Search for loopable sounds from FreeSound
- 🎚️ Mix multiple audio layers with individual volume controls
- 🔄 Seamless looping playback with Howler.js
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with Next.js 15 and TypeScript

## Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

Create or edit `.env.local` in the root directory:

```env
FREESOUND_API_KEY=your_freesound_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
```

#### Getting a FreeSound API Key:

1. Go to https://freesound.org/
2. Create an account or log in
3. Go to https://freesound.org/apiv2/apply/
4. Create a new application
5. Copy your API key to `.env.local`

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main UI
│   ├── layout.tsx            # Root layout
│   ├── api/
│   │   ├── freesound/        # FreeSound proxy API
│   │   └── ai/               # Optional AI route
│   └── globals.css
├── components/
│   ├── SoundscapePlayer.tsx  # Howler.js looped playback
│   ├── LayerControl.tsx      # Volume controls
│   └── PromptInput.tsx       # Search input
├── hooks/
│   └── useSoundscapeStore.ts # Zustand store
├── utils/
│   ├── audioHelpers.ts       # Audio utilities
│   └── embeddingHelpers.ts   # AI helpers (future)
└── types/
    └── soundscape.d.ts       # TypeScript definitions
```

## How to Use

1. **Search for sounds**: Enter keywords like "rain", "ocean waves", or "forest ambiance"
2. **Add layers**: Click "Add Layer" on sounds you like
3. **Adjust volumes**: Use the sliders to balance your mix
4. **Play**: Press the Play button to start your soundscape
5. **Reset**: Clear all layers to start fresh

## Technologies

- **Frontend**: Next.js 15, React, TypeScript
- **State Management**: Zustand
- **Audio**: Howler.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: FreeSound.org

## Future Enhancements

- [ ] AI-powered prompt interpretation
- [ ] User accounts and saved soundscapes
- [ ] Export/download mixed soundscapes
- [ ] Crossfade and loop smoothing
- [ ] MongoDB integration for caching
- [ ] Mobile responsive improvements
- [ ] Preset soundscape templates

## Deployment

This app can be deployed to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

## License

MIT

## Credits

Sounds provided by [FreeSound.org](https://freesound.org)
