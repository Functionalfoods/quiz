import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Course information for recommendations
const FUNCTIONAL_BASICS_INFO = `
FUNCTIONAL BASICS - BASKURS INOM FUNCTIONAL FOODS
- 6 veckor, 2295 kr
- 75 recept och måltidsplaner
- Fokus på grundläggande hälsosam mat och longevity
- Passar dig som vill: förbättra allmän hälsa, mer energi, bättre matvanor, starkare immunförsvar
- Hälsovinster: stabilt blodsocker, bättre matsmältning, mindre inflammation, hormonell balans
- Bra för: variabel/låg energi, fokusproblem, dåliga matvanor, svagt immunförsvar, allmän hälsa
`;

const FUNCTIONAL_FLOW_INFO = `
FUNCTIONAL FLOW - MAGHÄLSA OCH ANTIINFLAMMATORISK KOST  
- 6 veckor, 2295 kr
- 85 recept specialiserade på mage-tarmhälsa
- Fokus på maghälsa, antiinflammatorisk kost, tarmflora
- Passar dig som har: magproblem, uppblåsthet, energitrötthet, inflammationer
- Hälsovinster: förbättrad tarmflora, minskad inflammation, bättre matsmältning, jämnare energi
- Bra för: magbesvär, matsmältningsproblem, energidippar, inflammationer, tarmhälsa
`;

const translateAnswers = (answers) => {
  const answerMap = {
    // Energy levels
    'high_energy': 'Hög energi genom hela dagen',
    'afternoon_dip': 'Bra energi men trötthet på eftermiddagen',
    'variable_energy': 'Varierande energi under dagen',
    'low_energy': 'Låg energi och konstant trötthet',
    
    // Sleep
    'excellent_sleep': 'Utmärkt sömn (7-9 timmar, vaknar utvilad)',
    'good_sleep': 'Bra sömn men vaknar ibland under natten',
    'disrupted_sleep': 'Svårt att somna eller vaknar ofta',
    'poor_sleep': 'Dålig sömn (för lite eller dålig kvalitet)',
    
    // Stress
    'low_stress': 'Hanterar stress mycket bra',
    'moderate_stress': 'Måttlig stress, klarar det mesta',
    'high_stress': 'Ofta stressad och överväldigad',
    'chronic_stress': 'Konstant stress och ångest',
    
    // Exercise
    'very_active': 'Tränar 5+ gånger per vecka',
    'active': 'Tränar 3-4 gånger per vecka',
    'somewhat_active': 'Tränar 1-2 gånger per vecka',
    'sedentary': 'Tränar sällan eller aldrig',
    
    // Diet
    'excellent_diet': 'Mycket hälsosam och balanserad kost',
    'good_diet': 'Ganska hälsosam men kan förbättras',
    'mixed_diet': 'Blandat - vissa måltider hälsosamma',
    'poor_diet': 'Ohälsosam kost med mycket processad mat',
    
    // Digestion
    'excellent_digestion': 'Utmärkt matsmältning - inga problem',
    'occasional_issues': 'Mest bra med tillfälliga problem',
    'frequent_issues': 'Regelbundna magproblem',
    'chronic_issues': 'Konstanta matsmältningsbesvär',
    
    // Immunity
    'strong_immunity': 'Sällan eller aldrig sjuk',
    'normal_immunity': 'Blir sjuk 1-2 gånger per år',
    'frequent_illness': 'Blir sjuk 3-4 gånger per år',
    'weak_immunity': 'Blir mycket ofta sjuk',
    
    // Focus
    'excellent_focus': 'Utmärkt fokus och mental klarhet',
    'good_focus': 'Bra fokus men trötthet påverkar',
    'poor_focus': 'Svårt att koncentrera sig',
    'brain_fog': 'Ständig hjärndimma och förvirring',
    
    // Health challenges
    'weight_management': 'Vikthantering',
    'energy_fatigue': 'Energi och trötthet',
    'stress_recovery': 'Stress och återhämtning',
    'general_health': 'Allmän hälsa och prevention',
    
    // Goals
    'energy_vitality': 'Mer energi och vitalitet',
    'immunity_boost': 'Bättre immunförsvar',
    'digestive_health': 'Förbättrad matsmältning',
    'mental_clarity': 'Mental klarhet och fokus'
  };
  
  return Object.keys(answers).map(key => answerMap[answers[key]] || answers[key]).join(', ');
};

export const generatePersonalizedRecommendations = async (quizData) => {
  try {
    const translatedAnswers = translateAnswers(quizData);
    
    const prompt = `Du är Ulrika Davidsson, kostrådgivare, receptkreatör och Nordens ledande expert på functional foods. Du har hjälpt tusentals människor till hälsosamma livsstilsförändringar genom din unika metod som kombinerar näringslära med praktisk vardagsplanering.

Din filosofi bygger på:
- Functional foods: Naturliga livsmedel med specifika hälsofrämjande egenskaper
- Mervärdesmat rik på antioxidanter, probiotika, prebiotika och omega-3
- Hållbara livsstilsförändringar genom disciplin, motivation och smart planering
- Näringsrika, lättlagade och goda recept för hela familjen
- Holistisk approach där maten är rätt bränsle för kroppen

Baserat på följande svar från en kund, skapa detaljerade och personaliserade rekommendationer enligt din metod på svenska:

KUNDENS SVAR: ${translatedAnswers}

Skapa rekommendationer inom dessa fem kategorier:

1. KOSTRÅD & NÄRING (Enligt Ulrikas metod)
- Specifika functional foods att prioritera baserat på personens behov
- Näringsrika livsmedel med antioxidanter, probiotika och omega-3
- Måltidsplanering för optimal näringsupptag och energibalans  
- Praktiska inköpslistor och vardagstips
- Anti-inflammatoriska ingredienser för denna persons specifika utmaningar

2. LIVSSTILSREKOMMENDATIONER (Ulrikas holistiska approach)
- Sömnoptimering för hormonal balans och återhämtning
- Stresshantering genom kostval och mindfulness
- Träningsråd som kompletterar kostplanen
- Dagliga rutiner för hållbar livsstilsförändring
- Hur man skapar nya, bestående vanor

3. FUNCTIONAL FOODS & MERVÄRDESMAT
- Specifika functional foods för denna persons hälsoprofil
- Antioxidantrika superfoods och deras effekter
- Probiotika och prebiotika för optimal tarmhälsa  
- Omega-3-källor och anti-inflammatoriska kryddor
- Praktiska sätt att integrera functional foods i vardagen

4. PRIORITERINGAR & GENOMFÖRANDE
- De 3 viktigaste områdena enligt Ulrikas metod
- Varför dessa är avgörande för denna persons hälsomål
- Steg-för-steg plan för de första veckorna
- Disciplin och motivation för bestående förändring

5. KURSREKOMMENDATION
Baserat på kundens svar, rekommendera den mest passande kursen och förklara varför:

${FUNCTIONAL_BASICS_INFO}

${FUNCTIONAL_FLOW_INFO}

Välj den kurs som bäst matchar kundens behov enligt Ulrikas metod och förklara:
- Varför just denna kurs passar personens hälsoprofil och livssituation
- Vilka specifika functional foods och tekniker de kommer lära sig
- Hur Ulrikas beprövade metod kommer transformera deras vardag
- Konkreta, mätbara resultat de kan förvänta sig inom 6 veckor
- Personlig coachning och community-stöd som ingår

Skriv som Ulrika själv - varmt, kunnigt och inspirerande. Använd hennes erfarenhet av att ha hjälpt tusentals människor. Formatera svaret som HTML med <h3> för underrubriker, <p> för text, <ul> och <li> för listor, och <strong> för viktiga punkter. Ge konkreta, genomförbara råd baserat på functional foods-principerna.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du är Ulrika Davidsson - kostrådgivare, receptkreatör och författare till över 30 kokböcker. Du är Nordens ledande expert på functional foods och har hjälpt tusentals människor med din 'Kickstart'-metod. Svara alltid på svenska med din varma, uppmuntrande och kunniga röst. Ge konkreta, praktiska råd baserat på functional foods-principerna och din beprövade erfarenhet."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    const fullResponse = completion.choices[0].message.content;
    
    // Split the response into sections
    const sections = fullResponse.split(/(?=<h3>)/);
    
    const result = {
      diet: sections.find(s => s.includes('KOSTRÅD') || s.includes('NÄRING')) || sections[1] || '',
      lifestyle: sections.find(s => s.includes('LIVSSTIL')) || sections[2] || '',
      supplements: sections.find(s => s.includes('FUNCTIONAL') || s.includes('TILLSKOTT')) || sections[3] || '',
      priorities: sections.find(s => s.includes('PRIORITER')) || sections[4] || '',
      courseRecommendation: sections.find(s => s.includes('KURSREKOMMENDATION') || s.includes('KURS')) || sections[5] || ''
    };

    return result;
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Kunde inte generera rekommendationer. Försök igen senare.');
  }
}; 