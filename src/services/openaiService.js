// Fallback recommendations for when OpenAI API is not available
const getFallbackRecommendations = (quizData) => {
  // Analyze quiz data to provide somewhat personalized fallbacks
  const energy = quizData.energy || '';
  const sleep = quizData.sleep || '';
  const stress = quizData.stress || '';
  const exercise = quizData.exercise || '';
  
  let energyTip = "Fokusera på en balanserad kost med komplexe kolhydrater och protein.";
  if (energy.includes('låg') || energy.includes('trött')) {
    energyTip = "Öka intaget av järn, B-vitaminer och magnesium för bättre energi.";
  }
  
  let sleepTip = "Skapa en regelbunden sömnrutin och undvik skärmar före sänggåendet.";
  if (sleep.includes('dålig') || sleep.includes('svårt')) {
    sleepTip = "Överväg magnesium och melatonin, samt en avslappnande kvällsrutin.";
  }
  
  return {
    kostrad: `<h3>Kostråd</h3><p>${energyTip} Minska socker och processad mat för stabilare blodsockernivåer.</p>`,
    livsstil: `<h3>Livsstil</h3><p>${sleepTip} Inkludera daglig rörelse som passar din energinivå.</p>`,
    functionalFoods: "<h3>Functional Foods</h3><p>Probiotika för tarmhälsa, omega-3 för hjärnfunktion och antioxidanter från bär och gröna bladgrönsaker kan stödja din hälsa.</p>",
    prioriteringar: "<h3>Prioriteringar</h3><p>Börja med att förbättra sömnkvaliteten och minska stress. Detta skapar en grund för bättre energi och allmän hälsa.</p>",
    dinKurs: "<h3>Din Kurs</h3><p>Functional Basics-kursen ger dig kunskap om hur functional foods kan optimera din hälsa baserat på dina individuella behov.</p>"
  };
};

export const generatePersonalizedRecommendations = async (quizData) => {
  try {
    console.log('Calling Render API for OpenAI recommendations...');
    console.log('Quiz data:', quizData);
    
    const response = await fetch('https://functional-quiz-api.onrender.com/api/generate-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quizData }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      console.log('API not available, using fallback recommendations');
      return getFallbackRecommendations(quizData);
    }

    const result = await response.json();
    console.log('Success! Got result from Render API');
    return result;
    
  } catch (error) {
    console.error('Error calling Render API:', error);
    console.log('Falling back to static recommendations');
    return getFallbackRecommendations(quizData);
  }
}; 