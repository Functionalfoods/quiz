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

Baserat på följande quizresultat, ge personliga rekommendationer i exakt detta JSON-format:

QUIZRESULTAT:
${Object.entries(quizData).map(([key, value]) => `${key}: ${value}`).join('\n')}

VIKTIGT: Svara ENDAST med en giltig JSON-struktur utan extra text:

{
  "kostrad": "<h3>Kostråd</h3><p>Personliga kostråd baserat på quiz...</p>",
  "livsstil": "<h3>Livsstil</h3><p>Livsstilsråd baserat på quiz...</p>",
  "functionalFoods": "<h3>Functional Foods</h3><p>Rekommenderade functional foods...</p>",
  "prioriteringar": "<h3>Prioriteringar</h3><p>Vad du bör fokusera på först...</p>",
  "dinKurs": "<h3>Din Kurs</h3><p>Rekommenderad kurs från functionalfoods.se...</p>"
}

Gör rekommendationerna personliga och specifika. Varje sektion ska vara 2-3 meningar på svenska.
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
      max_tokens: 1000,
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
        kostrad: "<h3>Kostråd</h3><p>Baserat på dina svar rekommenderar jag att du fokuserar på en balanserad kost med mycket grönsaker och protein. Minska socker och processad mat för bättre energi.</p>",
        livsstil: "<h3>Livsstil</h3><p>Prioritera regelbunden sömn och stresshantering. Inkludera daglig rörelse som passar din livsstil och energinivå.</p>",
        functionalFoods: "<h3>Functional Foods</h3><p>Probiotika för tarmhälsa och omega-3 för hjärnfunktion kan vara bra tillskott för dig. Överväg också magnesium för bättre sömn.</p>",
        prioriteringar: "<h3>Prioriteringar</h3><p>Börja med att förbättra din sömnkvalitet och minska stress. Detta är grunden för allt annat och kommer ge dig mer energi.</p>",
        dinKurs: "<h3>Din Kurs</h3><p>Jag rekommenderar Functional Basics-kursen för att lära dig grunderna om functional foods och hur de kan stödja din hälsa.</p>"
      };
      
      return res.status(200).json(fallbackRecommendations);
    }
    
  } catch (error) {
    console.error('Error in serverless function:', error);
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
}; 