// Comprehensive fallback recommendations for when OpenAI API is not available
const getFallbackRecommendations = (quizData) => {
  return {
    kostrad: "<h3>Kostråd</h3><p>Börja dagen med en proteinrik frukost som äggröra med spenat eller grekisk yoghurt med bär och nötter för att stabilisera blodsockret. Inkludera fettrik fisk som lax eller makrill 2-3 gånger per vecka för omega-3. Välj färgstarka grönsaker - rödbetor för nitrater, blåbär för antioxidanter, och gröna bladgrönsaker för folat. Undvik processerade livsmedel, raffinerat socker och transfetter som skapar inflammation. Ät var tredje timme för att hålla energinivåerna stabila och inkludera en näve nötter eller frön som mellanmål. Använd kurkuma och ingefära i matlagningen för antiinflammatoriska effekter. Välj fullkornsprodukter istället för vitt bröd och pasta för långvarig energi. Drick minst 2 liter vatten dagligen och begränsa koffein efter kl 14 för bättre sömn.</p>",
    
    livsstil: "<h3>Livsstil</h3><p>Etablera en konsekvent sovrutin genom att gå till sängs samma tid varje kväll, helst före kl 22:30 för optimal melatoninproduktion. Skapa en avkopplande kvällsrutin 1-2 timmar före sänggåendet - dimma ljuset, ta ett varmt bad eller läs en bok. Undvik skärmar minst 1 timme före sänggåendet eftersom blått ljus supprimerar melatonin. Träna regelbundet, helst 30 minuter daglig rörelse som promenader, yoga eller styrketräning, men undvik intensiv träning 3 timmar före sänggåendet. Praktisera stresshantering genom djupandning (4-7-8 tekniken), meditation eller progressiv muskelavslappning i 10-15 minuter dagligen. Exponera dig för naturligt ljus på morgonen för att reglera din dygnsrytm. Begränsa alkohol och koffein som kan störa sömn och öka stress. Skapa en lugn sovmiljö med mörka gardiner, svala temperaturer (16-18°C) och minimal elektronik i sovrummet.</p>",
    
    functionalFoods: "<h3>Functional Foods</h3><p>Probiotika 10-50 miljarder CFU dagligen, helst på tom mage på morgonen, för optimal tarmhälsa och immunförsvar - välj stammar som Lactobacillus och Bifidobacterium. Omega-3 från algoljem eller fiskoljor, 1000-2000mg EPA/DHA dagligen med mat för hjärnhälsa och inflammationshämning. Magnesium 200-400mg på kvällen (magnesiumglycinat är bäst för absorption) för bättre sömn, muskelavslappning och stresshantering. D-vitamin 1000-2000 IE dagligen, särskilt under vintermånaderna, för immunförsvar och humör. Curcumin med svartpeppar 500-1000mg dagligen för kraftfull antiinflammatorisk effekt. Adaptogener som ashwagandha 300-600mg eller rhodiola 200-400mg för stresshantering och energi. Zink 10-15mg dagligen för immunförsvar och sårläkning. B-komplex för energimetabolism och nervfunktion. Kollagen 10-20g dagligen för hud, leder och tarmhälsa. Ta tillskott med mat för bättre absorption och minska risken för magbesvär.</p>",
    
    prioriteringar: "<h3>Prioriteringar</h3><p>Vecka 1-2: Fokusera på sömnhygien genom att etablera fasta sov- och vakentider, skapa mörk sovmiljö och införa kvällsrutin utan skärmar. Vecka 3-4: Börja med grundtillskott - probiotika på morgonen och magnesium på kvällen för att stödja sömn och matsmältning. Vecka 5-6: Integrera daglig rörelse, börja med 10-15 minuters promenader och bygg upp gradvis till 30 minuter aktivitet per dag. Vecka 7-8: Optimera kosten genom att införa antiinflammatoriska livsmedel och minska processad mat och socker stegvis. Månad 2: Lägg till stresshanteringstekniker som meditation eller andningsövningar i 10 minuter dagligen. Månad 3: Finjustera tillskottsrutinen med omega-3 och andra functional foods baserat på hur du känner dig. Månad 4-6: Fokusera på hållbara vanor och långsiktig optimering. Följ upp med nya hälsobedömningar för att mäta framsteg. Kom ihåg att förändring tar tid - fokusera på en sak i taget för bästa resultat.</p>",
    
    dinKurs: "<h3>Din Kurs</h3><p>Functional Basics-kursen på functionalfoods.se är perfekt för dig som vill förstå hur näring påverkar kroppen på cellnivå och lära dig skapa en personlig hälsostrategi. Kursen innehåller 8 moduler som täcker allt från grundläggande näringslära till avancerade functional foods och deras mekanismer. Du får praktiska verktyg för att läsa och förstå ingredienslistor, lära dig vilka tillskott som faktiskt fungerar och varför. Kursen inkluderar också 30+ recept på functional foods-rätter, shopping-guider för optimal näringstäthet och verktyg för att spåra din hälsoutveckling. Expert-intervjuer med ledande forskare ger dig senaste vetenskapen inom området. Du får livstid tillgång till alla material, möjlighet att ställa frågor till experter och tillgång till en privat Facebook-grupp med likasinnade. Kursen är helt evidensbaserad och uppdateras kontinuerligt med ny forskning. Efter genomförd kurs kommer du kunna skapa din egen functional foods-plan, förstå hur olika näringsämnen interagerar och optimera din hälsa på ett hållbart sätt. Investeringen är 3997kr men du får tillbaka pengarna mångfalt genom bättre hälsa och minskade sjukvårdskostnader.</p>"
  };
};

export const generatePersonalizedRecommendations = async (quizData) => {
  try {
    console.log('Calling Render API for OpenAI recommendations...');
    console.log('Quiz data:', quizData);
    
    // Use the full Render API URL for reliable cross-origin requests
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