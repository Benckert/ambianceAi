# 🎵 Soundscape Creator

En webbapplikation för att generera och spela upp ambienta ljudlandskap (soundscapes). Användaren skriver nyckelord eller en prompt och systemet bygger ett JSON-baserat mixförslag bestående av flera lager (bakgrund, mellanlager, förgrund) med sökfrågor, volym och korta beskrivningar. Appen används för att snabbt skapa stämningsfulla loopar genom att kombinera AI-genererade förslag med loopbara ljudfiler.

### Huvudsyfte

- Generera ljudlandskap automatiskt utifrån textnyckelord.
- Ge användaren justerbara lager (volume, mute, loop) och enkla mixnoteringar.

### Tekniker och verktyg

- Next.js (app-router) för server- och klientrutter.
- TypeScript för typkontroll.
- Zustand för lokal state-hantering (hooks).
- Ollama Cloud (gpt-oss) och OpenAI API — används för att generera JSON-strukturen för soundscapes.
- Howler.js för ljuduppspelning i webbläsaren.

### Hur det fungerar

Användaren har två alternativ för att skapa **soundscapes**

1. **Manual**
   <br>
   Användaren söker efter önskade ljud som är hämtade från FreeSound.org och kan manuellt skapa soundscapes utifrån dem.

2. **AI**
   <br>
   Användaren beskriver det önskade soundscape med hjälp av en prompt, till exempel "Regnig skogsnatt med avlägsen åska", som skickas till en AI som genererar JSON för att hämta samplingar från FreeSound.org och skapa ett soundscape.

## Reflektion över AI-valet

Vilken ny AI-teknik/bibliotek identifierade ni och hur tillämpade ni det?

- Vi identifierade och integrerade **gpt-oss (Ollama Cloud)** som vår AI-leverantör för att generera strukturerade JSON-svar (Soundscape-specifikationer). Vi använde tidigare **OpenAI (openai npm-paket)**, men på grund av begränsningar i den kostnadsfria testversionen bestämde vi oss för att byta till **gpt-oss (Ollama Cloud)**.

Motivering av valet

- Kostnad och kontroll: Ollama ger möjlighet att köra eller använda modeller som kan vara billigare eller mer kontrollerbara för lokala/privata modeller. För development
- Enkel API och streaming: Ollama-klienten erbjuder en enkel chat-API med streaming som passar vårt flöde (generera JSON stegvis eller som hel text).
- Flexibilitet: Det är lätt att byta modell namn eller host (t.ex. Ollama Cloud) via miljövariabler.
- Olika modeller: Ollama gör att vi enkelt kan ändra de modeller vi behöver.

Varför behövdes AI-komponenten? Kunde ni löst det annorlunda?

- Varför AI behövdes: AI-komponenten ansvarar för att översätta fria textnyckelord till användbara, varierade och kreativa mixförslag (lager, volymsättning, sökfraser, beskrivningar). Det möjliggör snabb och mångsidig innehållsgenerering utan att skapa en stor handkodad regelmotor.
- Alternativ: Många enklare soundscapes kan genereras med regelbaserade mallar (och det finns redan en `generate-soundscape-simple`-route i projektet). För mer komplexa eller varierade förslag är AI överlägset i att skapa naturliga, kontextuella varianter utan omfattande manuellt underhåll.

Anteckningar för drift

För testa en webbapplikation du behöver sätta env variablärna `FREESOUND_API_KEY` och `OLLAMA_API_KEY` i .env filen.

```
npm install
npm run dev
```

Bara kör och experimentera!

---

Kort sammanfattning: Projektet är ett verktyg för att automatisera skapandet av ambienta ljudlandskap med hjälp av AI, kombinerat med klientfunktioner för uppspelning, mixning och enkel användarstyrning.
