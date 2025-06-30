const { OpenAI } = require('openai');

// Check for API key in different possible environment variable names
const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;

console.log('Environment check:');
console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('- REACT_APP_OPENAI_API_KEY exists:', !!process.env.REACT_APP_OPENAI_API_KEY);
console.log('- Final API key available:', !!apiKey);
console.log('- API key first 8 chars:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NONE');

if (!apiKey) {
  console.error('❌ No OpenAI API key found in environment variables');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI')));
}

const openai = new OpenAI({
  apiKey: apiKey,
});

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Serverless function called');
    console.log('📝 API key available:', !!apiKey);
    console.log('📦 Request body:', req.body);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔧 OpenAI client initialized:', !!openai);
    
    if (!apiKey) {
      console.error('❌ No OpenAI API key configured');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        debug: {
          hasApiKey: !!apiKey,
          envVars: Object.keys(process.env).filter(key => key.includes('OPENAI'))
        }
      });
    }
    
    const { quizData } = req.body;
    
    if (!quizData) {
      console.error('❌ No quiz data provided');
      return res.status(400).json({ error: 'Quiz data is required' });
    }

    console.log('✅ Processing quiz data:', Object.keys(quizData));

    const prompt = `
Du är Ulrika Davidsson, grundare av Functional Foods Sweden och expert på functional foods och hälsa. 

Baserat på följande quizresultat, ge MYCKET DETALJERADE och LÅNGA personliga rekommendationer. VIKTIGT: Skriv ALLTID i "du"-form direkt till användaren. Varje sektion ska innehålla MINST 500 ORD med konkreta råd, specifika exempel och djupgående förklaringar.

QUIZRESULTAT:
${Object.entries(quizData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Svara med en JSON-struktur i EXAKT detta format:

{
  "scores": {
    "energi": [1-10 baserat på svaren],
    "sömn": [1-10 baserat på svaren],
    "stress": [1-10 baserat på svaren],
    "kost": [1-10 baserat på svaren],
    "motion": [1-10 baserat på svaren]
  },
  "summary": "<h3>Din Hälsosammanfattning</h3><p>MINST 500 ORD. Börja med 'Baserat på dina svar ser jag att du...' Ge en omfattande analys av din nuvarande hälsosituation. Förklara hur dina olika hälsoområden påverkar varandra. Identifiera dina styrkor och utmaningar. Förklara vad som händer i din kropp baserat på dina symptom. Ge en översikt av vad du kan förvänta dig om du följer rekommendationerna.</p>",
  "kostrad": "<h3>Dina Personliga Kostråd</h3><p>MINST 500 ORD. Börja med 'För dig rekommenderar jag...' Inkludera specifika livsmedel du bör äta mer av, detaljerade måltidsförslag för frukost/lunch/middag, mellanmål anpassade för dina behov, exakta portionsstorlekar, näringsämnen du behöver fokusera på, livsmedel du bör undvika, tips för matlagning, och hur kosten kan optimera din energi och hälsa.</p>",
  "livsstil": "<h3>Din Livsstilsplan</h3><p>MINST 500 ORD. Börja med 'För att optimera din livsstil behöver du...' Ge detaljerade råd om dina sömnrutiner med specifika tider, kvällsrutiner som passar dig, morgonrutiner för din situation, träningsschema anpassat efter dina förutsättningar, stresshanteringstekniker du kan använda, andningsövningar, meditation, naturexponering, sociala aktiviteter, och work-life balance.</p>",
  "functionalFoods": "<h3>Dina Functional Foods</h3><p>MINST 500 ORD. Börja med 'För dina specifika behov rekommenderar jag följande tillskott...' Lista specifika tillskott med exakta doseringar, när du ska ta dem, vilka märken som är bäst för dig, synergier mellan olika tillskott, förklaringar av hur varje tillskott fungerar i din kropp, potentiella biverkningar att vara medveten om, och hur länge du bör använda dem.</p>",
  "prioriteringar": "<h3>Din Prioriteringsplan</h3><p>MINST 500 ORD. Börja med 'Här är din steg-för-steg plan...' Skapa en detaljerad plan uppdelad på veckor och månader. Förklara varför varje steg är viktigt för dig, vad du kan förvänta dig för resultat, hur du mäter dina framsteg, vanliga fallgropar du ska undvika, och hur du bygger hållbara vanor som passar din livsstil.</p>",
  "dinKurs": "<h3>Din Rekommenderade Kurs</h3><p>MINST 500 ORD. Börja med 'För dig passar kursen...' Beskriv vilken specifik kurs från functionalfoods.se som är perfekt för dina behov. Förklara vad du kommer lära dig i kursen, vilka moduler som är mest relevanta för dig, hur kursen kan hjälpa med dina specifika utmaningar, praktiska övningar du kommer göra, och långsiktiga fördelar för din hälsa. Functional Basics kostar 2295 kr (6 veckor, 75 recept). Functional Flow kostar 1836 kr (tidsbegränsat erbjudande från 2295 kr, 6 veckor, 85 recept för tarmhälsa).</p>"
}

EXTREMT VIKTIGT: 
- Skriv ALLTID i "du"-form direkt till användaren
- Varje sektion MÅSTE vara MINST 500 ORD lång
- Var MYCKET detaljerad och specifik
- Ge konkreta exempel, doseringar, tider, och praktiska tips
- Skriv på svenska
`;

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du är Ulrika Davidsson från Functional Foods Sweden. Svara ENDAST med giltig JSON utan extra text eller formatering."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 7000,
      temperature: 0.7
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
          energi: 5,
          sömn: 5,
          stress: 5,
          kost: 5,
          motion: 5
        },
        summary: "<h3>Din Hälsosammanfattning</h3><p>Baserat på dina svar ser jag att du har potential att förbättra flera områden av din hälsa. Din energinivå, sömnkvalitet och stresshantering påverkar varandra i ett komplext samspel. När du inte sover tillräckligt bra påverkas din energi negativt, vilket i sin tur gör det svårare att hantera stress. Detta skapar en ond cirkel som påverkar din motivation att träna och göra hälsosamma matval. Den goda nyheten är att du genom små, systematiska förändringar kan bryta denna cirkel och skapa en positiv spiral uppåt. Din kropp har en fantastisk förmåga att läka och återhämta sig när den får rätt förutsättningar. Genom att fokusera på grundläggande faktorer som sömn, kost och rörelse kommer du märka förbättringar redan inom några veckor. Det viktigaste är att du börjar där du är idag och tar ett steg i taget mot bättre hälsa.</p>",
        kostrad: "<h3>Dina Personliga Kostråd</h3><p>För dig rekommenderar jag att du börjar med att stabilisera ditt blodsocker genom att äta protein och fibrer vid varje måltid. Börja dagen med ägg, avokado och grönsaker eller en proteinrik smoothie med bär, spenat och mandelsmör. Till lunch passar en stor sallad med grillad kyckling eller lax, quinoa och en variation av färgglada grönsaker. För middag, fokusera på en handflata protein (fisk, kyckling, vegetariskt alternativ), två handflator grönsaker och en näve fullkorn eller rotsaker. Som mellanmål fungerar nötter med frukt, grönsaker med hummus eller grekisk yoghurt med bär utmärkt. Drick minst 2 liter vatten dagligen och undvik sockrade drycker. Minska intaget av processad mat, vitt bröd och snabba kolhydrater som ger blodsockertoppar. Inkludera omega-3-rika livsmedel som fet fisk, valnötter och chiafrön minst 3 gånger i veckan. Fermenterade livsmedel som surkål, kimchi eller kefir stöttar din tarmhälsa och bör inkluderas dagligen.</p>",
        livsstil: "<h3>Din Livsstilsplan</h3><p>För att optimera din livsstil behöver du skapa rutiner som stödjer din naturliga dygnsrytm. Gå upp och lägg dig samma tid varje dag, även på helger. Skapa en kvällsrutin som börjar 21:00 med att stänga av alla skärmar, dimma belysningen och kanske ta ett varmt bad med magnesiumsalt. Läs en bok eller gör lätta stretchövningar innan du somnar senast 22:30. På morgonen, exponera dig för dagsljus direkt när du vaknar för att kickstarta din cirkadiska rytm. Ta en 10-minuters morgonpromenad eller gör några yogaövningar vid fönstret. För stresshantering, praktisera djupandning 3 gånger om dagen: andas in i 4 sekunder, håll i 4, andas ut i 6 sekunder, repetera 5 gånger. Schemalägg pauser var 90:e minut under arbetsdagen för att hålla fokus och energi. Inkludera minst 30 minuters rörelse dagligen - det kan vara promenad, cykling, yoga eller styrketräning. Prioritera sociala aktiviteter som ger dig energi och undvik energitjuvar.</p>",
        functionalFoods: "<h3>Dina Functional Foods</h3><p>För dina specifika behov rekommenderar jag följande tillskott som en del av din dagliga rutin. Börja dagen med probiotika 20-50 miljarder CFU på fastande mage för optimal tarmhälsa och immunförsvar. Till frukost, ta omega-3 supplement med 1000-2000mg EPA/DHA för att stödja hjärnfunktion, minska inflammation och förbättra humöret. Magnesiumglycinat 300-400mg tas bäst på kvällen 30 minuter före sänggång för bättre sömnkvalitet och muskelavslappning. D-vitamin 2000-4000 IE tas med fett mat under de mörkare månaderna för immunförsvar och energi. För extra stöd vid stress kan ashwagandha 300-600mg tas på morgonen och kvällen. Curcumin med svartpeppar 500-1000mg dagligen har kraftfull antiinflammatorisk effekt. B-vitaminkomplex på morgonen stödjer energiproduktion och nervssystemet. Börja med probiotika och omega-3 första månaden, lägg sedan till magnesium. Efter 2-3 månader kan du utvärdera om du behöver ytterligare tillskott baserat på hur du mår.</p>",
        prioriteringar: "<h3>Din Prioriteringsplan</h3><p>Här är din steg-för-steg plan för de kommande månaderna. Vecka 1-2: Fokusera enbart på att etablera en konsekvent sömnrutin. Gå till sängs 22:30 varje kväll och vakna samma tid varje morgon. Vecka 3-4: Lägg till probiotika på morgonen och börja med 10 minuters daglig promenad. Vecka 5-6: Introducera omega-3 och magnesium, samt öka promenaden till 20 minuter. Månad 2: Börja implementera kostförändringarna gradvis - fokusera först på frukosten, sedan lunch och sist middag. Lägg till 2-3 styrketräningspass per vecka. Månad 3: Integrera stresshanteringstekniker som meditation eller yoga. Utvärdera vilka tillskott som ger bäst effekt för dig. För att mäta dina framsteg, för dagbok över energinivå, sömnkvalitet och humör på en skala 1-10. Ta bilder och mätningar en gång i månaden. Vanliga fallgropar är att försöka ändra allt på en gång - håll dig till planen och var tålmodig. Belöna dig själv för varje delmål du uppnår.</p>",
        dinKurs: "<h3>Din Rekommenderade Kurs</h3><p>För dig passar Functional Flow-kursen perfekt då den fokuserar specifikt på tarmhälsa, vilket är grunden för både energi, immunförsvar och mental hälsa. Kursen pågår i 6 veckor och kostar just nu endast 1836 kr (ordinarie pris 2295 kr). Du får tillgång till 85 specialdesignade recept som stödjer din tarmflora och minskar inflammation. I kursen lär du dig hur tarmen fungerar som ditt 'andra hjärna' och påverkar allt från humör till energinivå. Du kommer förstå sambandet mellan tarmhälsa och immunförsvar, vilket är extra viktigt för dig som vill förbättra din motståndskraft. Kursen innehåller praktiska moduler om fermentering, prebiotika och probiotika, samt hur du bygger upp en hälsosam tarmflora steg för steg. Du får veckovisa måltidsplaner, inköpslistor och prepptips som gör det enkelt att implementera kunskapen. Särskilt värdefullt för dig är modulen om stress och tarmhälsa, där du lär dig hur kronisk stress påverkar matsmältningen och vad du kan göra åt det. Efter kursen kommer du ha verktygen att skapa en livslång god tarmhälsa.</p>"
      };
      
      return res.status(200).json(fallbackRecommendations);
    }
    
  } catch (error) {
    console.error('Error in serverless function:', error);
    console.error('Error stack:', error.stack);
    
    // Return fallback recommendations on any error
    const fallbackRecommendations = {
      kostrad: "<h3>Kostråd</h3><p>Fokusera på en antiinflammatorisk kost med mycket färgstarka grönsaker, fett fisk och nötter. Börja dagen med protein och fibrer för stabilare blodsockernivåer. Minska socker och processad mat, och öka intaget av omega-3 från kallpressade oljor och fet fisk. Inkludera fermenterade livsmedel för bättre tarmhälsa.</p>",
      livsstil: "<h3>Livsstil</h3><p>Prioritera 7-9 timmars kvalitetssömn genom att skapa en kvällsrutin utan skärmar. Inkludera daglig rörelse - även 10-15 minuters promenad gör skillnad. Praktisera stresshantering genom andningsövningar eller meditation dagligen. Exponera dig för naturligt ljus på morgonen för bättre dygnsrytm.</p>",
      functionalFoods: "<h3>Functional Foods</h3><p>Probiotika 10-50 miljarder CFU dagligen för optimal tarmhälsa. Omega-3 från alger eller fisk, 1-2g EPA/DHA per dag för hjärnfunktion. Magnesium 200-400mg på kvällen för bättre sömn. Curcumin med svartpeppar för antiinflammatorisk effekt. Adaptogener som ashwagandha kan hjälpa med stress.</p>",
      prioriteringar: "<h3>Prioriteringar</h3><p>Vecka 1-2: Förbättra sömnhygienen. Vecka 3-4: Lägg till probiotika och omega-3. Vecka 5-6: Integrera daglig rörelse och stresshantering. Månad 2: Optimera kosten med antiinflammatoriska livsmedel. Fokusera på en förändring i taget för hållbara resultat.</p>",
      dinKurs: "<h3>Din Kurs</h3><p>Functional Basics-kursen på functionalfoods.se ger dig djupgående kunskap om functional foods och deras påverkan på cellulär nivå. Du lär dig läsa ingredienslistor, förstå bioaktiva ämnen och skapa personliga hälsoprotokoll med praktiska recept och shopping-guider.</p>"
    };
    
    return res.status(200).json(fallbackRecommendations);
  }
}; 