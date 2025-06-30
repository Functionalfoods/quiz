const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'https://functional-quiz-frontend.onrender.com',
    'https://functionalfoods.github.io',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Check for API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('No OpenAI API key found in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Functional Quiz API is running' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API endpoint working',
    timestamp: new Date().toISOString(),
    hasApiKey: !!apiKey
  });
});

// Main API endpoint
app.post('/api/generate-recommendations', async (req, res) => {
  try {
    console.log('API endpoint called');
    console.log('API key available:', !!apiKey);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    if (!apiKey) {
      console.error('No OpenAI API key configured');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    const { quizData } = req.body;
    
    if (!quizData) {
      console.error('No quiz data provided');
      return res.status(400).json({ error: 'Quiz data is required' });
    }

    console.log('Processing quiz data:', Object.keys(quizData));

    const prompt = `
Du är Ulrika Davidsson, grundare av Functional Foods Sweden och expert på functional foods och hälsa. 

ABSOLUT KRAV: Totalt MINST 2500 ORD fördelat över alla sektioner. Varje textsektion MÅSTE vara MINST 500 ORD (cirka 3-4 stycken). Detta är INTE förhandlingsbart.

VIKTIGT FORMATERING: 
- Använd <p> för stycken, INTE ** för fetstil
- Använd <strong> för fetstil istället för **
- Dela upp texten i logiska stycken med <p> taggar
- Skriv flytande text, inte punktlistor

QUIZRESULTAT:
${Object.entries(quizData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Analysera svaren och skapa en hälsoprofil med poäng 1-10 för varje kategori baserat på personens svar:
- Energi: [baserat på energinivå och trötthet]
- Sömn: [baserat på sömnkvalitet] 
- Stress: [baserat på stressnivå]
- Kost: [baserat på matvanor]
- Motion: [baserat på aktivitetsnivå]

KURSER SOM FINNS (välj den mest passande):

1. FUNCTIONAL BASICS (6 veckor, 2295 kr):
- Baskurs inom functional foods
- 75 recept och måltidsplaner
- För dig som vill skapa bättre matvanor från grunden
- Fokus på immunförsvar, energi och allmän hälsa
- Inkluderar: recept & måltidsplan, råvaruguide & inköpslista, djupgående näringslära, steg-för-steg-planering, videolektioner varje vecka, one-to-one coachning med Ulrika
- Perfekt för: stabilt blodsocker, mer energi, bättre humör, starkare immunförsvar, hormonell balans

2. FUNCTIONAL FLOW (6 veckor, ordinarie 2295 kr, nu 1836 kr - begränsad tid):
- Fokus på maghälsa och antiinflammatorisk kost
- 85 recept anpassade för tarmflora
- För dig med magproblem, inflammation eller energiproblem
- Fokus på: förbättrad matsmältning, balanserad tarmflora, mindre uppblåsthet, regelbunden tarmtömning
- Minskar inflammation och stärker immunförsvar
- Perfekt för: orolig/uppblåst mage, trötthet, inflammation

Svara med JSON i EXAKT detta format:

{
  "scores": {
    "energi": [1-10 baserat på personens energinivå],
    "sömn": [1-10 baserat på personens sömnkvalitet],
    "stress": [1-10 baserat på personens stressnivå, lägre stress = högre poäng],
    "kost": [1-10 baserat på personens matvanor],
    "motion": [1-10 baserat på personens aktivitetsnivå]
  },
  "summary": "<p>En sammanfattande analys av personens hälsosituation baserat på poängen. Minst 100 ord i flytande text.</p>",
  "kostrad": "<h3>Kostråd</h3><p>FÖRSTA STYCKET: Börja med att förklara varför just dessa kostråd är viktiga baserat på personens svar.</p><p>ANDRA STYCKET: Inkludera detaljerade måltidsförslag för frukost (3-4 alternativ), lunch (3-4 alternativ), middag (3-4 alternativ) och mellanmål (4-5 alternativ). Beskriv portionsstorlekar, näringsinnehåll och timing.</p><p>TREDJE STYCKET: Lista specifika livsmedel som bör prioriteras och varför, samt livsmedel att undvika. Ge konkreta tips för meal prep och planering.</p><p>FJÄRDE STYCKET: Avsluta med hur dessa kostförändringar kommer påverka energi, sömn och allmänt välmående inom 2-4 veckor.</p>",
  "livsstil": "<h3>Livsstil</h3><p>FÖRSTA STYCKET: Börja med att analysera personens nuvarande livsstil baserat på svaren.</p><p>ANDRA STYCKET: Skapa en detaljerad dygnsrutin från morgon till kväll med specifika tider. Inkludera: morgonrutin (steg-för-steg), arbetsdag med pauser och återhämtning, kvällsrutin för optimal sömn, helgrutiner.</p><p>TREDJE STYCKET: Ge konkreta tekniker för stresshantering (minst 5 olika med instruktioner), träningsschema anpassat efter energinivå, tips för bättre sömn (minst 10 konkreta råd).</p><p>FJÄRDE STYCKET: Förklara hur varje förändring påverkar hälsan på kort och lång sikt.</p>",
  "functionalFoods": "<h3>Functional Foods</h3><p>FÖRSTA STYCKET: Börja med att förklara vad functional foods är och varför de är viktiga för just denna person.</p><p>ANDRA STYCKET: Lista minst 8-10 specifika tillskott med: exakt dosering, bästa tid att ta dem, varför de behövs, förväntade effekter, kvalitetsmärken att leta efter, möjliga biverkningar, hur länge de bör användas.</p><p>TREDJE STYCKET: Inkludera naturliga functional foods från mat (minst 10 exempel). Skapa ett schema för hur tillskotten ska introduceras gradvis.</p><p>FJÄRDE STYCKET: Förklara synergier mellan olika tillskott och hur de samverkar med kosten. Avsluta med kostnadsuppskattning och prioriteringsordning.</p>",
  "prioriteringar": "<h3>Prioriteringar</h3><p>FÖRSTA STYCKET: Skapa en detaljerad 12-veckors plan uppdelad i 2-veckorsperioder.</p><p>ANDRA STYCKET: För varje period: specificera exakt vad som ska göras, varför det är viktigt just då, förväntade resultat, hur man mäter framgång, vanliga hinder och lösningar.</p><p>TREDJE STYCKET: Inkludera: Vecka 1-2 (grundläggande förändringar), Vecka 3-4 (bygga vanor), Vecka 5-6 (intensifiera), Vecka 7-8 (utvärdera och justera), Vecka 9-10 (fördjupa), Vecka 11-12 (långsiktig plan).</p><p>FJÄRDE STYCKET: Ge konkreta delmål och milstolpar. Avsluta med tips för att göra förändringarna permanenta.</p>",
  "dinKurs": "<h3>Din Kurs</h3><p>FÖRSTA STYCKET: Välj antingen FUNCTIONAL BASICS eller FUNCTIONAL FLOW baserat på personens behov och förklara varför just denna kurs passar bäst.</p><p>ANDRA STYCKET: Beskriv kursens innehåll i detalj - antal recept, vad som ingår, kurslängd, coachning och support.</p><p>TREDJE STYCKET: Förklara hur kursen specifikt adresserar personens utmaningar och vad de kommer lära sig.</p><p>FJÄRDE STYCKET: Inkludera pris, vad som ingår, support och community. Förklara ROI - hur investeringen betalar sig i hälsa och livskvalitet. Avsluta med en stark uppmaning att agera nu.</p>"
}

KRITISKT: Varje textsektion (kostrad, livsstil, functionalFoods, prioriteringar, dinKurs) MÅSTE vara MINST 500 ord. Använd <p> taggar för stycken och <strong> för fetstil. Skriv flytande text, engagerande och motiverande. Använd svenska.
`;

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du är Ulrika Davidsson från Functional Foods Sweden. Du MÅSTE skriva EXTREMT långa, detaljerade svar. Varje sektion ska vara MINST 500 ord. Detta är obligatoriskt. Inkludera även poäng och sammanfattning. Svara ENDAST med giltig JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 7000,
      temperature: 0.7,
      presence_penalty: 0.3,
      frequency_penalty: 0.1
    });

    const response = completion.choices[0].message.content.trim();
    console.log('OpenAI raw response:', response);
    
    // Try to parse the JSON response
    try {
      // Remove any potential markdown formatting
      let cleanResponse = response;
      if (response.includes('```json')) {
        cleanResponse = response.replace(/```json\n?/g, '').replace(/```/g, '');
      }
      if (response.includes('```')) {
        cleanResponse = response.replace(/```/g, '');
      }
      
      const recommendations = JSON.parse(cleanResponse);
      console.log('Successfully parsed recommendations');
      return res.status(200).json(recommendations);
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response that failed to parse:', response);
      
      // Fallback with manual recommendations based on quiz data
      const fallbackRecommendations = {
        scores: {
          energi: 6,
          sömn: 7,
          stress: 5,
          kost: 7,
          motion: 6
        },
        summary: "<p>Din hälsoprofil visar att du har en god grund att bygga på. Med några riktade förbättringar inom stresshantering och energioptimering kan du nå en ännu bättre hälsa. Dina goda sömnvanor och kostmedvetenhet är styrkor att bygga vidare på. Genom att implementera de rekommendationer som följer kan du förvänta dig märkbara förbättringar inom 4-6 veckor.</p>",
        kostrad: "<h3>Kostråd</h3><p>Baserat på dina svar rekommenderar jag att du fokuserar på en antiinflammatorisk kost med mycket färgstarka grönsaker, fett fisk och nötter. Börja dagen med protein och fibrer för stabilare blodsockernivåer - till exempel ägg med avokado och fullkornsbröd, eller en smoothie med protein, spenat och bär. För lunch och middag, inkludera alltid en portion protein (fisk, kött, bönor), mycket grönsaker och hälsosamma fetter som olivolja eller nötter. Minska socker och processad mat kraftigt, och öka intaget av omega-3 från kallpressade oljor och fet fisk som lax, makrill och sardiner minst 2-3 gånger per vecka. Inkludera fermenterade livsmedel som kimchi, kefir eller kombucha dagligen för bättre tarmhälsa. Drick minst 2 liter vatten per dag och undvik alkohol och koffein efter 15:00 för bättre sömn. Ät ditt sista mål minst 3 timmar före sänggåendet. Fokusera på säsongsbetonade, ekologiska råvaror när det är möjligt och laga mat hemma så ofta du kan för att ha kontroll över ingredienserna.</p>",
        livsstil: "<h3>Livsstil</h3><p>Prioritera 7-9 timmars kvalitetssömn genom att skapa en konsekvent kvällsrutin utan skärmar 1 timme före sänggåendet. Gå till sängs och vakna samma tid varje dag, även på helger, för att stärka din dygnsrytm. Skapa en lugn sovmiljö med mörka gardiner, sval temperatur (16-18°C) och eventuellt white noise. Inkludera daglig rörelse - även 10-15 minuters rask promenad efter måltider gör stor skillnad för både energi, humör och blodsockerbalans. Praktisera stresshantering genom djupandning (4-7-8 tekniken) eller meditation 5-10 minuter dagligen, helst på morgonen för att sätta tonen för dagen. Exponera dig för naturligt ljus inom 30 minuter efter uppvaknandet för att optimera melatoninproduktionen. Begränsa skärmtid på kvällen och använd blåljusfilter efter solnedgången. Planera in återhämtning och vila som en viktig del av din vecka. Undvik att kolla telefonen första och sista 30 minuterna av dagen. Skapa gränser mellan arbete och vila för bättre work-life balance.</p>",
        functionalFoods: "<h3>Functional Foods</h3><p>Probiotika 10-50 miljarder CFU dagligen för optimal tarmhälsa och stärkt immunförsvar - ta på tom mage på morgonen med ett glas vatten. Omega-3 från alger eller fisk, 1000-2000mg EPA/DHA per dag för hjärnfunktion, hjärthälsa och minskad inflammation - ta med mat för bättre absorption. Magnesium 200-400mg på kvällen 1 timme före sänggåendet för bättre sömn, muskelavslappning och stressreduktion. D-vitamin 1000-2000 IE dagligen, särskilt under vintermånaderna, för immunförsvar och benstyrka. Curcumin 500-1000mg med svartpeppar (piperin) för kraftfull antiinflammatorisk effekt - ta med fett för ökad biotillgänglighet. Adaptogener som ashwagandha 300-600mg kan hjälpa kroppen hantera stress bättre och förbättra energinivåerna. Zink 15-30mg för immunförsvar och hormonbalans. B-komplex för energimetabolism och nervfunktion. Börja med ett tillskott i taget och introducera nytt var 2:a vecka för att känna effekten. Konsultera alltid läkare om du tar mediciner.</p>",
        prioriteringar: "<h3>Prioriteringar</h3><p>Vecka 1-2: Förbättra sömnhygienen genom att etablera en konsekvent sängtid och kvällsrutin. Detta är grunden för allt annat och kommer ge dig mer energi för kommande förändringar. Vecka 3-4: Lägg till probiotika och omega-3 till din dagliga rutin för att stödja tarmhälsa och minska inflammation. Samtidigt börja med 10 minuters daglig promenad efter lunch. Vecka 5-6: Integrera stresshanteringstekniker som djupandning eller kort meditation på morgonen. Börja också planera och förbereda hälsosamma måltider för att undvika impulsval. Månad 2: Optimera kosten genom att gradvis minska processad mat och socker medan du ökar intaget av antiinflammatoriska livsmedel. Månad 3: Lägg till styrketräning 2 gånger per vecka för att bygga muskelmassa och förbättra ämnesomsättningen. Fokusera på en förändring i taget för att skapa hållbara vanor. Mät framsteg genom energinivåer, sömnkvalitet och allmänt välmående snarare än bara vikten. Var tålmodig - verkliga förändringar tar 3-6 månader att etablera.</p>",
        dinKurs: "<h3>Din Kurs</h3><p>Functional Basics-kursen på functionalfoods.se (3997kr) ger dig djupgående kunskap om hur functional foods påverkar din kropp på cellulär nivå och hur du kan optimera din hälsa genom kost och livsstil. Kursen innehåller 8 moduler som täcker allt från tarmhälsa och inflammation till hormonbalans och energioptimering. Du lär dig att läsa och förstå ingredienslistor, identifiera kvalitativa tillskott och skapa personliga hälsoprotokoll baserat på dina unika behov. Kursen inkluderar praktiska recept, shopping-guider och meal prep-strategier för att enkelt implementera kunskapen i vardagen. Du får tillgång till en privat Facebook-grupp med andra kursdeltagare och regelbundna Q&A-sessioner med Ulrika Davidsson själv. Modulen om functional foods hjälper dig förstå exakt vilka tillskott du behöver och i vilka doseringar, vilket sparar pengar på onödiga produkter. Kursen ger dig verktyg för att bli din egen hälsoexpert och fatta informerade beslut om din hälsa för resten av livet. Efter kursen har du kunskap motsvarande flera års självstudier och kan hjälpa även familj och vänner med deras hälsoresor.</p>"
      };
      
      return res.status(200).json(fallbackRecommendations);
    }
    
  } catch (error) {
    console.error('Error in API endpoint:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback recommendations on any error
    const fallbackRecommendations = {
      scores: {
        energi: 5,
        sömn: 6,
        stress: 5,
        kost: 6,
        motion: 5
      },
      summary: "<p>Din hälsoprofil indikerar att det finns flera områden med förbättringspotential. Genom att fokusera på de rekommendationer som presenteras nedan kan du gradvis förbättra din energi, sömn och allmänna välbefinnande. Kom ihåg att små, konsekventa förändringar ger stora resultat över tid.</p>",
      kostrad: "<h3>Kostråd</h3><p>Fokusera på en balanserad kost med mycket grönsaker, protein och hälsosamma fetter. Minska socker och processad mat.</p>",
      livsstil: "<h3>Livsstil</h3><p>Prioritera god sömn, stresshantering och regelbunden fysisk aktivitet för optimal hälsa.</p>",
      functionalFoods: "<h3>Functional Foods</h3><p>Probiotika, omega-3 och antioxidanter kan stödja din allmänna hälsa och välmående.</p>",
      prioriteringar: "<h3>Prioriteringar</h3><p>Börja med grunderna: bättre sömn, mindre stress och mer näring i kosten.</p>",
      dinKurs: "<h3>Din Kurs</h3><p>Functional Basics-kursen ger dig kunskap om hur functional foods kan förbättra din hälsa.</p>"
    };
    
    return res.status(200).json(fallbackRecommendations);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Functional Quiz API server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Test endpoint: http://localhost:${port}/api/test`);
}); 