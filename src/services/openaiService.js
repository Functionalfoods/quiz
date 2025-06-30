// Use Vercel serverless function instead of direct OpenAI API calls
export const generatePersonalizedRecommendations = async (quizData) => {
  try {
    const response = await fetch('/api/generate-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quizData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate recommendations');
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error calling recommendations API:', error);
    throw new Error('Kunde inte generera rekommendationer. Försök igen senare.');
  }
}; 