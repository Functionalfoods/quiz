// Use Vercel serverless function for OpenAI API calls
export const generatePersonalizedRecommendations = async (quizData) => {
  try {
    console.log('Calling serverless function at /api/generate-recommendations');
    console.log('Quiz data:', quizData);
    
    const response = await fetch('/api/generate-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quizData }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Failed to generate recommendations');
    }

    const result = await response.json();
    console.log('Success! Got result from serverless function');
    return result;
    
  } catch (error) {
    console.error('Error calling recommendations API:', error);
    throw new Error('Kunde inte generera rekommendationer. Försök igen senare.');
  }
}; 