# 🌿 Functional Food Quiz

Ett intelligent och interaktivt quiz som hjälper användare att upptäcka personaliserade kostråd och livsstilsrekommendationer baserat på deras hälsoprofil.

## ✨ Funktioner

### 🎯 Personaliserad Analys
- **10 smarta frågor** som analyserar användarens livsstil
- **AI-drivna rekommendationer** med OpenAI GPT-4
- **Anpassade råd** för kost, livsstil och functional foods

### 🎨 Design & UX
- **Work Sans-font** för modern och professionell känsla
- **Färgschema**: 
  - Bakgrund: `#F3EFE3`
  - Primärfärger: `#014421`, `#93C560`, `#112A12`
  - Accentfärger: `#660C21`, `#FFE135`
- **Responsiv design** som fungerar på alla enheter
- **Smidiga animationer** för bättre användarupplevelse

### 🧠 AI-Rekommendationer
- **Kostråd & Näring**: Personaliserade näringsrekommendationer
- **Livsstilstips**: Sömnoptimering, stresshantering, träningsråd
- **Functional Foods**: Specifika tillskott och produkter
- **Prioriteringar**: De viktigaste områdena att fokusera på

## 🚀 Kom igång

### Förutsättningar
- Node.js 16+ 
- npm eller yarn

### Installation
```bash
# Klona projektet
git clone [repository-url]
cd QUIZ-Functional

# Installera dependencies
npm install

# Starta utvecklingsservern
npm start
```

Applikationen öppnas automatiskt på `http://localhost:3000`

## 🏗️ Projektstruktur

```
src/
├── components/
│   ├── WelcomeScreen.js     # Välkomstskärm med hero-sektion
│   ├── QuizModal.js         # Quiz-modal med frågor
│   ├── ResultScreen.js      # Resultatskärm med rekommendationer
│   └── *.css               # Stilar för varje komponent
├── data/
│   └── quizQuestions.js     # De 10 quiz-frågorna
├── services/
│   └── openaiService.js     # OpenAI API-integration
├── App.js                   # Huvudkomponent
└── index.js                 # Entry point
```

## 🎭 Användarupplevelse

### 1. Välkomstskärm
- Attraktiv hero-sektion som förklarar värdet
- Call-to-action knapp för att starta quizet
- Information om vad användaren får ut av quizet

### 2. Quiz-upplevelse
- **Progressbar** som visar framsteg
- **Interaktiva frågor** med ikoner och beskrivningar
- **Smidig navigation** mellan frågor
- **Mobilvänlig design**

### 3. Resultat
- **Personaliserade rekommendationer** i fyra kategorier
- **Professionell presentation** med färgkodade kort
- **PDF-export** för att spara resultaten
- **Möjlighet att göra om** quizet

## 🔧 Teknisk Implementation

### Frågetyper
Quizet täcker 10 viktiga hälsoområden:
1. Energinivå
2. Sömnkvalitet
3. Stresshantering
4. Träningsfrekvens
5. Matvanor
6. Matsmältning
7. Immunförsvar
8. Fokus & koncentration
9. Största hälsoutmaning
10. Mål med functional food

### OpenAI Integration
- Använder **GPT-4o-mini** för kostnadseffektivitet
- **Strukturerad prompt** för konsistenta rekommendationer
- **Säker API-hantering** med felhantering
- **Svenska språkstöd** för lokalisering

### Säkerhet
- API-nyckel hårdkodad för utveckling
- **Miljövariabler** för produktion (Railway)
- **Ingen användardata** sparas permanent

## 🌐 Deployment

### Railway Deployment
```bash
# Bygg för produktion
npm run build

# Sätt miljövariabel på Railway
REACT_APP_OPENAI_API_KEY=sk-proj-...

# Deploy till Railway
railway up
```

### Miljövariabler
För produktion, flytta API-nyckeln till miljövariabler:
```env
REACT_APP_OPENAI_API_KEY=din-openai-api-nyckel
```

## 🎨 Anpassning

### Färger
Uppdatera CSS-variabler i `src/index.css`:
```css
:root {
  --background: #F3EFE3;
  --primary-dark: #014421;
  --primary-light: #93C560;
  --secondary-dark: #112A12;
  --accent-red: #660C21;
  --accent-yellow: #FFE135;
}
```

### Frågor
Redigera `src/data/quizQuestions.js` för att anpassa frågor och svarsalternativ.

### AI-Rekommendationer
Justera prompt i `src/services/openaiService.js` för att ändra rekommendationernas stil och innehåll.

## 📱 Responsiv Design

- **Desktop**: Full funktionalitet med stor layout
- **Tablet**: Anpassad grid och spacing
- **Mobil**: Optimerad för touchinteraktion
- **Print**: Stilren PDF-export

## 🔬 Tester

```bash
# Kör tester
npm test

# Kör med coverage
npm test -- --coverage
```

## 🤝 Bidrag

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commita dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Pusha till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📄 Licens

Detta projekt är licensierat under MIT License.

## 🙏 Tack

- **OpenAI** för AI-funktionalitet
- **React** för UI-ramverket
- **Work Sans** för typografi
- **Railway** för hosting

---

**Byggt med ❤️ för optimal hälsa och välmående** 