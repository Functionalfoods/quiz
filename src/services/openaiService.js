import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generatePersonalizedRecommendations = async (quizData) => {
  try {
    console.log('Calling OpenAI API directly...');
    console.log('Quiz data:', quizData);
    
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
    console.log('OpenAI response:', response);
    
    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      console.log('Parsed recommendations:', recommendations);
      return recommendations;
    } else {
      throw new Error('Could not parse recommendations from OpenAI response');
    }
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Kunde inte generera rekommendationer. Försök igen senare.');
  }
}; 