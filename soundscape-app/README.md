# 🎵 Soundscape Creator

A Next.js 15 application for creating ambient soundscapes using loopable sounds from FreeSound.org, enhanced with AI-generated mix suggestions.

## Features

- 🔍 **Manual Search**: Search for loopable sounds from FreeSound
- 🤖 **Generative AI Search**: AI generates soundscape layers from keywords using Ollama
- 🧠 **Semantic AI Search**: Find similar sounds using AI embeddings
- 🎚️ Mix multiple audio layers with individual volume controls
- 🔄 Seamless looping playback with Howler.js
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with Next.js 15 and TypeScript

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` in the root directory and use `.env.example` as reference or copy following example:

```
FREESOUND_API_KEY=your_freesound_api_key_here
OLLAMA_API_KEY=your_ollama_api_key_here
OLLAMA_EMBEDDING_URL=http://localhost:11434/api/embeddings
OLLAMA_EMBEDDING_MODEL=llama3
MONGODB_URI=your_mongodb_connection_string_here #optional for future improvements
```

#### Getting a FreeSound API Key:

1. Go to https://freesound.org/
2. Create an account or log in
3. Go to https://freesound.org/apiv2/apply/
4. Create a new application
5. Copy your API key to `.env`

#### Getting a Ollama API Key:

1. Go to https://ollama.com/
2. Create an account or log in
3. Go to https://ollama.com/settings/keys
4. Add API key
5. Copy your API key to `.env`

#### Setting up Ollama locally:

1. Open terminal
2. Install ollama `brew install ollama`
3. Start ollama `ollama serve`
4. Open new terminal and pull a model that supports embeddings llama3 or nomic-embed-text etc. `ollama pull llama3` or `ollama pull nomic-embed-text`
5. Add ollama embedding URL and Model to .env

```
OLLAMA_EMBEDDING_URL=http://localhost:11434/api/embeddings
OLLAMA_EMBEDDING_MODEL=llama3 or nomic-embed-text
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                            # Main UI
│   ├── layout.tsx                          # Root layout
│   ├── globals.css                         
│   └── api/
│       ├── ai/                             # Optional AI route (placeholder/mock, returns hardcoded sound layers)
│       ├── freesound/                      # FreeSound API search (fetches loopable audio clips)
│       ├── generate-soundscape/            # Generative AI search (Ollama, generates soundscape from Freesound based on keywords)
│       ├── generate-soundscape-openai/     # Alternative generative AI (OpenAI GPT, with cache and rate-limiting)
│       ├── generate-soundscape-semantic/   # Ollama semantic search with embeddings (AI-driven similarity search)
│       └── generate-soundscape-simple/     # Manual / rule-based soundscape generator (predefined template) 
├── components/
│   ├── ui 
│   │   ├── slider.tsx                      # Mode slider
│   │   └── TemplateIconButton.tsx          # Icon & button template
│   ├── AIPromptInput.tsx                   # Generative AI search input
│   ├── LayerControl.tsx                    # Volume controls
│   ├── LayersPopup.tsx                     # Manage layers Modal
│   ├── PromptInput.tsx                     # Manual search input
│   ├── SemanticPromptInput.tsx             # Semantic search input
│   └── SoundscapePlayer.tsx                # Howler.js looped playback
├── hooks/
│   └── useSoundscapeStore.ts               # Zustand store
├── lib/
│   └── utils.ts                            # Tailwind Utility (shared helpers)
├── types/
│   └── soundscape.d.ts                     # TypeScript definitions
├── utils/
│   ├── audioHelpers.ts                     # Audio utilities
│   └── embeddingHelpers.ts                 # AI helpers (future)
├── .env.example                            # .env template/reference
└── README.md                               # Setup manual
```

## How to Use

1. **Select a mode**: Manual, Genereative AI, or Semantic AI
2. **Search for sounds**: Enter keywords (e.g. "rain", "ocean waves", "forest ambiance")
3. **Add layers**: Click "Add Layer" on sounds you like
4. **Adjust volumes**: Use the sliders to balance your mix
5. **Play**: Press the Play button to start your soundscape
6. **Reset**: Clear all layers to start fresh

## Technologies

- **Frontend**: Next.js 15, React, TypeScript
- **State Management**: Zustand
- **Audio Playback**: Howler.js for looped sound layers
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **APIs**: FreeSound.org for loopable audio clips
- **AI / Generative Search**: Ollama (local or API) for generating soundscape structures from keywords
- **Semantic Search / Embeddings**: Ollama embeddings (llama3 or nomic-embed-text) for similarity-based sound search
- **Optional AI**: OpenAI GPT (via API) as alternative for generative soundscape search


## Future Enhancements

- [x] AI-powered prompt interpretation
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
