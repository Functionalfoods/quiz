const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
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
    const { quizData } = req.body;
    
    if (!quizData) {
      return res.status(400).json({ error: 'Quiz data is required' });
    }

    console.log('Processing quiz data:', quizData);

    const prompt = `
Du är Ulrika Davidsson, grundare av Functional Foods Sweden och expert på functional foods och hälsa. 

Baserat på följande quizresultat, ge personliga rekommendationer i exakt detta format (använd HTML-formatering):

QUIZRESULTAT:
${Object.entries(quizData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Svara med exakt denna struktur:

{
  "kostrad": "<h3>Kostråd</h3><p>Personliga kostråd baserat på quiz...</p>",
  "livsstil": "<h3>Livsstil</h3><p>Livsstilsråd baserat på quiz...</p>",
  "functionalFoods": "<h3>Functional Foods</h3><p>Rekommenderade functional foods...</p>",
  "prioriteringar": "<h3>Prioriteringar</h3><p>Vad du bör fokusera på först...</p>",
  "dinKurs": "<h3>Din Kurs</h3><p>Rekommenderad kurs från functionalfoods.se...</p>"
}

Gör rekommendationerna personliga, specifika och använd svensk ton. Varje sektion ska vara 2-3 meningar.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du är Ulrika Davidsson från Functional Foods Sweden. Svara alltid på svenska och ge praktiska, personliga råd."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    console.log('OpenAI response received');
    
    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed recommendations');
      return res.status(200).json(recommendations);
    } else {
      console.error('Could not parse JSON from OpenAI response');
      return res.status(500).json({ error: 'Could not parse recommendations' });
    }
    
  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
}; 