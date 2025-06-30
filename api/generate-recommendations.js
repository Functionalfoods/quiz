const { OpenAI } = require('openai');

// Check for API key in different possible environment variable names
const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;

if (!apiKey) {
  console.error('No OpenAI API key found in environment variables');
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
    console.log('Serverless function called');
    console.log('API key available:', !!apiKey);
    console.log('Request body:', req.body);
    
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

Baserat på följande quizresultat, ge personliga och detaljerade rekommendationer i exakt detta JSON-format:

QUIZRESULTAT:
${Object.entries(quizData).map(([key, value]) => `${key}: ${value}`).join('\n')}

VIKTIGT: Svara ENDAST med en giltig JSON-struktur utan extra text:

{
  "kostrad": "<h3>Kostråd</h3><p>Detaljerade personliga kostråd baserat på quiz med specifika livsmedel och måltidsförslag...</p>",
  "livsstil": "<h3>Livsstil</h3><p>Omfattande livsstilsråd med konkreta tips för sömn, motion och stresshantering...</p>",
  "functionalFoods": "<h3>Functional Foods</h3><p>Specifika functional foods-rekommendationer med dosering och förklaringar...</p>",
  "prioriteringar": "<h3>Prioriteringar</h3><p>Tydlig prioritering av vad personen bör fokusera på först med steg-för-steg plan...</p>",
  "dinKurs": "<h3>Din Kurs</h3><p>Detaljerad kursrekommendation från functionalfoods.se med motivering...</p>"
}

VIKTIGT: Varje sektion ska vara 4-6 meningar på svenska och vara mycket personlig baserat på quiz-svaren. Ge konkreta, actionable råd med specifika livsmedel, dosering och praktiska tips.
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
        kostrad: "<h3>Kostråd</h3><p>Baserat på dina svar rekommenderar jag att du fokuserar på en antiinflammatorisk kost med mycket färgstarka grönsaker, fett fisk och nötter. Börja dagen med protein och fibrer för stabilare blodsockernivåer. Minska socker och processad mat, och öka intaget av omega-3 från kallpressade oljor och fet fisk. Inkludera fermenterade livsmedel som kimchi eller kefir för bättre tarmhälsa.</p>",
        livsstil: "<h3>Livsstil</h3><p>Prioritera 7-9 timmars kvalitetssömn genom att skapa en kvällsrutin utan skärmar 1 timme före sänggåendet. Inkludera daglig rörelse - även 10-15 minuters promenad gör skillnad för både energi och humör. Praktisera stresshantering genom andningsövningar eller meditation 5-10 minuter dagligen. Exponera dig för naturligt ljus på morgonen för bättre dygnsrytm.</p>",
        functionalFoods: "<h3>Functional Foods</h3><p>Probiotika 10-50 miljarder CFU dagligen för optimal tarmhälsa och immunförsvar. Omega-3 från alger eller fisk, 1-2g EPA/DHA per dag för hjärnfunktion och inflammation. Magnesium 200-400mg på kvällen för bättre sömn och muskelavslappning. Curcumin med svartpeppar för antiinflammatorisk effekt. Adaptogener som ashwagandha kan hjälpa med stresshantering.</p>",
        prioriteringar: "<h3>Prioriteringar</h3><p>Vecka 1-2: Förbättra sömnhygienen och etablera en konsekvent sängtid. Vecka 3-4: Lägg till probiotika och omega-3 till din rutin. Vecka 5-6: Integrera daglig rörelse och stresshanteringsteknik. Månad 2: Optimera kosten med mer antiinflammatoriska livsmedel. Fokusera på en förändring i taget för hållbara resultat.</p>",
        dinKurs: "<h3>Din Kurs</h3><p>Functional Basics-kursen på functionalfoods.se ger dig djupgående kunskap om hur functional foods påverkar din kropp på cellulär nivå. Du lär dig att läsa ingredienslistor, förstå bioaktiva ämnen och skapa personliga hälsoprotokoll. Kursen inkluderar praktiska recept och shopping-guider för att implementera kunskapen i vardagen.</p>"
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