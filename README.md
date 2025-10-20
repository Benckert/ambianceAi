# 🎵 AmbianceAI

AmbianceAI är en webbapplikation som låter användaren skapa ljudlandskap (soundscapes) på flera olika sätt. Genom att kombinera AI-genererade förslag, manuell ljudsökning och semantisk sökning skapas dynamiska och stämningsfulla ljudmiljöer baserade på ljud från FreeSound.org.

Systemet bygger ett JSON-baserat mixförslag som innehåller flera ljudlager (bakgrund, mellanlager, förgrund) med volym, loop, mute och korta beskrivningar.

Användaren kan spela upp, justera och spara sina mixar direkt i webbläsaren.

### Huvudsyfte

- Utforska hur AI kan användas för kreativ ljudgenerering.
- Automatisera skapandet av soundscapes från fria textbeskrivningar.
- Ge användaren verktyg för att justera och experimentera med ljudlager

### Tekniker och verktyg

- Next.js (app-router) för server- och klientrutter.
- TypeScript för typkontroll och säker utveckling
- Zustand för lokal state-hantering (hooks).
- Ollama Cloud (gpt-oss) och OpenAI API — används för att generera JSON-strukturen för soundscapes.
- Howler.js för loopad ljuduppspelning i webbläsaren.
- Tailwind CSS & Lucide Icons för UI och ikongrafi
- FreeSound API som källa för ljudfiler

### Hur det fungerar

Användaren har två alternativ för att skapa **soundscapes**

1. **Manuell sökning**
   <br>
   Användaren söker efter önskade ljud som är hämtade från FreeSound.org och kan manuellt skapa soundscapes utifrån dem.

2. **AI-genererad(LLM)**
   <br>
   Användaren beskriver det önskade soundscape med hjälp av en prompt, till exempel "Regnig skogsnatt med avlägsen åska", som skickas till en AI som genererar JSON för att hämta samlingar från FreeSound.org och skapa ett soundscape.

3. **Semantisk sökning (Embeddings)**
   <br>
   Användaren beskriver det önskade soundscape med en enkel prompt, till exempel “Havsvågor”. Sedan använder AI:n semantiska embeddings för att hitta och föreslå liknande ljud som till exempel “strandbrus”, “vind mot klippor” eller “vågskvalp”. Alltså baserat på ljudens betydelse och innehåll, inte bara nyckelord.

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

För testa webbapplikation finns en tydlig manual i projektets root (README.md).

Bara kör och experimentera!

---

## Fördjupad reflektion och avancerad AI-teknik (VG)

### Jämförelse: LLM vs. Embeddings
Projektet använder både LLM (Ollama Cloud, OpenAI) för att generera kreativa mixförslag och har nu även stöd för semantisk sökning med embeddings (se `generate-soundscape-semantic`-routen). LLM är överlägset för att skapa nya, kontextuella förslag, medan embeddings är bäst för att hitta liknande ljud eller soundscapes utifrån semantisk likhet.

**LLM-fördelar:**
- Kan generera helt nya och varierade mixar utifrån fri text.
- Flexibel och kreativ.

**Embeddings-fördelar:**
- Möjliggör semantisk sökning och rekommendationer.
- Snabb och skalbar för likhetsjämförelser.

### Begränsningar och risker med AI
- LLM kan hallucinera och ge förslag som inte är möjliga att realisera.
- Embeddings kräver bra datakvalitet och kan vara "svarta lådor".
- Upphovsrätt och licensfrågor kring ljudfiler måste hanteras.
- Kostnad och prestanda kan variera beroende på API och modell.

### Experiment och testning
- Testat olika promptar och modeller (Ollama, OpenAI) för att jämföra kvalitet och variation.
- Implementerat dummy-embeddings och planerar att utvärdera riktiga embeddings via OpenAI eller Supabase Vector.
- Jämfört regelbaserad och AI-genererad mixning för att se när AI är nödvändigt.

### När är AI lämpligt?
- AI är bäst när variation, kreativitet och kontext är viktigt.
- För enkla, återkommande mixar räcker ibland mallar eller regler.

### Egen fördjupning
- Skapat en egen API-route för semantisk sökning med embeddings (`generate-soundscape-semantic`).
- Utforskat prompt engineering och olika AI-parametrar.
- Dokumenterat och kommenterat kod för att visa förståelse.
- Fördelat komponenter för respektive mode.
