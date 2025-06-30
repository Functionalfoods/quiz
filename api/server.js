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

KRITISKT: Du MÅSTE skriva LÅNGA, DETALJERADE svar. Varje sektion ska vara MINST 150-200 ord (cirka 8-10 meningar). KORTA SVAR ÄR INTE ACCEPTABLA.

QUIZRESULTAT:
${Object.entries(quizData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Svara med JSON i EXAKT detta format. VARJE sektion MÅSTE vara LÅNG och DETALJERAD:

{
  "kostrad": "<h3>Kostråd</h3><p>[SKRIV MINST 150 ORD HÄR - Inkludera specifika livsmedel, måltidsförslag för frukost/lunch/middag, mellanmål, portionsstorlekar, näringsämnen att fokusera på, livsmedel att undvika, tips för matlagning, och hur kosten kan optimera energi och hälsa baserat på personens svar. Ge konkreta exempel och praktiska tips.]</p>",
  "livsstil": "<h3>Livsstil</h3><p>[SKRIV MINST 150 ORD HÄR - Ge detaljerade råd om sömnrutiner, specifika tider, kvällsrutiner, morgonrutiner, träningsschema, stresshanteringstekniker, andningsövningar, meditation, naturexponering, sociala aktiviteter, och work-life balance baserat på deras behov. Inkludera steg-för-steg instruktioner.]</p>",
  "functionalFoods": "<h3>Functional Foods</h3><p>[SKRIV MINST 150 ORD HÄR - Lista specifika tillskott med exakta doseringar, när de ska tas, vilka märken som rekommenderas, synergier mellan olika tillskott, förklaringar av hur varje tillskott fungerar i kroppen, potentiella biverkningar, och hur länge de bör användas. Ge detaljerade instruktioner.]</p>",
  "prioriteringar": "<h3>Prioriteringar</h3><p>[SKRIV MINST 150 ORD HÄR - Skapa en detaljerad steg-för-steg plan uppdelad på veckor och månader. Förklara varför varje steg är viktigt, vad personen kan förvänta sig för resultat, hur de mäter framsteg, vanliga fallgropar att undvika, och hur de bygger hållbara vanor. Ge en konkret tidsplan.]</p>",
  "dinKurs": "<h3>Din Kurs</h3><p>[SKRIV MINST 150 ORD HÄR - Beskriv vilken specifik kurs från functionalfoods.se som passar bäst, vad kursen innehåller i detalj, vilka moduler som är mest relevanta, vad de kommer lära sig, hur kursen kan hjälpa med deras specifika utmaningar, praktiska övningar från kursen, och långsiktiga fördelar. Inkludera pris och värde.]</p>"
}

ABSOLUT KRAV: VARJE sektion MÅSTE vara MINST 150 ord. KORTA SVAR KOMMER ATT REFUSERAS. Var EXTREMT detaljerad och specifik. Skriv på svenska.
`;

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du är Ulrika Davidsson från Functional Foods Sweden. Du MÅSTE skriva LÅNGA, DETALJERADE svar på minst 150 ord per sektion. KORTA SVAR ÄR FÖRBJUDNA. Svara ENDAST med giltig JSON utan extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 7000,
      temperature: 0.3,
      presence_penalty: 0.1,
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