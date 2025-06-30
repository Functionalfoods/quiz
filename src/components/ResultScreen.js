import React, { useState, useEffect } from 'react';
import './ResultScreen.css';
import { generatePersonalizedRecommendations } from '../services/openaiService';

const ResultScreen = ({ quizData, onRestart }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [healthScores, setHealthScores] = useState({
    energi: 5,
    sömn: 5,
    stress: 5,
    kost: 5,
    motion: 5
  });

  const calculateHealthScores = () => {
    const scores = {
      energi: 5,
      sömn: 5,
      stress: 5,
      kost: 5,
      motion: 5
    };

    // Map quiz answers to scores
    if (quizData['0'] === 'high_energy') scores.energi = 8;
    else if (quizData['0'] === 'low_energy') scores.energi = 3;
    else if (quizData['0'] === 'afternoon_dip') scores.energi = 5;

    if (quizData['1'] === 'great_sleep') scores.sömn = 9;
    else if (quizData['1'] === 'poor_sleep') scores.sömn = 3;
    else if (quizData['1'] === 'good_sleep') scores.sömn = 7;

    if (quizData['2'] === 'low_stress') scores.stress = 8;
    else if (quizData['2'] === 'high_stress') scores.stress = 3;
    else if (quizData['2'] === 'moderate_stress') scores.stress = 5;

    if (quizData['3'] === 'active') scores.motion = 8;
    else if (quizData['3'] === 'sedentary') scores.motion = 3;
    else if (quizData['3'] === 'moderately_active') scores.motion = 6;

    if (quizData['4'] === 'good_diet') scores.kost = 7;
    else if (quizData['4'] === 'poor_diet') scores.kost = 3;
    else if (quizData['4'] === 'moderate_diet') scores.kost = 5;

    return scores;
  };

  const calculateTotalScore = () => {
    const total = Object.values(healthScores).reduce((sum, score) => sum + score, 0);
    // Convert from 50 max to 100 max
    return Math.round((total / 50) * 100);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Determine which API URL to use based on environment
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? 'https://functional-quiz-api.onrender.com/api/generate-recommendations'
          : 'http://localhost:3001/api/generate-recommendations';

        console.log('Fetching recommendations from:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quizData }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to get recommendations: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received recommendations:', data);
        
        setRecommendations(data);
        
        // Use scores from API if available, otherwise calculate from quiz
        if (data.scores) {
          setHealthScores(data.scores);
        } else {
          const calculatedScores = calculateHealthScores();
          setHealthScores(calculatedScores);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Kunde inte hämta rekommendationer. Försök igen senare.');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [quizData]);

  if (loading) {
    return (
      <div className="result-screen">
        <div className="result-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <h2>Analyserar dina svar...</h2>
            <p>Vi skapar personliga rekommendationer baserat på din hälsoprofil</p>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-screen">
        <div className="result-container">
          <div className="error-section">
            <div className="error-icon">⚠️</div>
            <h2>Något gick fel</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={onRestart}>
              Försök igen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  
  const getScoreMessage = (score) => {
    if (score >= 80) return { text: "Utmärkt! Du är på rätt väg!", emoji: "🌟" };
    if (score >= 60) return { text: "Bra! Det finns potential för förbättring", emoji: "💪" };
    if (score >= 40) return { text: "Okej start! Låt oss förbättra din hälsa", emoji: "🌱" };
    return { text: "Tid för förändring! Vi hjälper dig", emoji: "🚀" };
  };

  const scoreMessage = getScoreMessage(totalScore);

  return (
    <div className="result-screen">
      <div className="result-container">
        <div className="result-header">
          <h1>DINA PERSONALISERADE REKOMMENDATIONER</h1>
          <div className="total-score">
            <div className="score-circle">
              <span className="score-number">{totalScore}</span>
              <span className="score-max">/100</span>
            </div>
            <p className="score-label">Din totala hälsopoäng</p>
            <div className="score-message">
              <span className="score-emoji">{scoreMessage.emoji}</span>
              <span className="score-text">{scoreMessage.text}</span>
            </div>
          </div>
        </div>

        {recommendations && (
          <>
            <div className="quick-wins">
              <h3>🎯 Snabba vinster för din hälsa:</h3>
              <div className="win-cards">
                <div className="win-card">
                  <span className="win-icon">💧</span>
                  <span className="win-text">Drick 2L vatten dagligen</span>
                </div>
                <div className="win-card">
                  <span className="win-icon">🚶</span>
                  <span className="win-text">10 min promenad efter lunch</span>
                </div>
                <div className="win-card">
                  <span className="win-icon">😴</span>
                  <span className="win-text">Sov före 22:30</span>
                </div>
              </div>
            </div>

            <div className="tabs-container">
              <div className="tabs-header">
                <button 
                  className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  <span className="tab-icon">📊</span>
                  <span className="tab-text">Sammanfattning</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'kostrad' ? 'active' : ''}`}
                  onClick={() => setActiveTab('kostrad')}
                >
                  <span className="tab-icon">🍃</span>
                  <span className="tab-text">Kostråd</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'livsstil' ? 'active' : ''}`}
                  onClick={() => setActiveTab('livsstil')}
                >
                  <span className="tab-icon">🏃‍♀️</span>
                  <span className="tab-text">Livsstil</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'functionalFoods' ? 'active' : ''}`}
                  onClick={() => setActiveTab('functionalFoods')}
                >
                  <span className="tab-icon">💊</span>
                  <span className="tab-text">Functional Foods</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'prioriteringar' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prioriteringar')}
                >
                  <span className="tab-icon">⭐</span>
                  <span className="tab-text">Prioriteringar</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'dinKurs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dinKurs')}
                >
                  <span className="tab-icon">🎓</span>
                  <span className="tab-text">Din Kurs</span>
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'summary' && recommendations.summary && (
                  <div className="tab-panel">
                    <h2>Din Hälsosammanfattning</h2>
                    <div className="content-text" dangerouslySetInnerHTML={{ __html: recommendations.summary }} />
                    <div className="score-breakdown">
                      <h3>Dina poäng per område:</h3>
                      <div className="score-items">
                        <div className="score-item">
                          <div className="score-label">
                            <span className="score-emoji">⚡</span>
                            <span className="score-name">Energi</span>
                          </div>
                          <span className="score-value">{healthScores.energi}/10</span>
                        </div>
                        <div className="score-item">
                          <div className="score-label">
                            <span className="score-emoji">😴</span>
                            <span className="score-name">Sömn</span>
                          </div>
                          <span className="score-value">{healthScores.sömn}/10</span>
                        </div>
                        <div className="score-item">
                          <div className="score-label">
                            <span className="score-emoji">🧘</span>
                            <span className="score-name">Stress</span>
                          </div>
                          <span className="score-value">{healthScores.stress}/10</span>
                        </div>
                        <div className="score-item">
                          <div className="score-label">
                            <span className="score-emoji">🥗</span>
                            <span className="score-name">Kost</span>
                          </div>
                          <span className="score-value">{healthScores.kost}/10</span>
                        </div>
                        <div className="score-item">
                          <div className="score-label">
                            <span className="score-emoji">🏃</span>
                            <span className="score-name">Motion</span>
                          </div>
                          <span className="score-value">{healthScores.motion}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'kostrad' && (
                  <div className="tab-panel">
                    <div className="content-text" dangerouslySetInnerHTML={{ __html: recommendations.kostrad }} />
                  </div>
                )}

                {activeTab === 'livsstil' && (
                  <div className="tab-panel">
                    <div className="content-text" dangerouslySetInnerHTML={{ __html: recommendations.livsstil }} />
                  </div>
                )}

                {activeTab === 'functionalFoods' && (
                  <div className="tab-panel">
                    <div className="content-text" dangerouslySetInnerHTML={{ __html: recommendations.functionalFoods }} />
                  </div>
                )}

                {activeTab === 'prioriteringar' && (
                  <div className="tab-panel">
                    <div className="content-text" dangerouslySetInnerHTML={{ __html: recommendations.prioriteringar }} />
                  </div>
                )}

                {activeTab === 'dinKurs' && (
                  <div className="tab-panel">
                    <div className="content-text" dangerouslySetInnerHTML={{ __html: recommendations.dinKurs }} />
                    <div className="course-cta">
                      <a 
                        href="https://functionalfoods.se/kursutbud" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="course-btn"
                      >
                        Se alla kurser →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="motivational-quote">
              <blockquote>
                "Let food be thy medicine and medicine be thy food"
                <cite>- Hippocrates</cite>
              </blockquote>
            </div>

            <div className="result-actions">
              <button className="btn btn-secondary" onClick={onRestart}>
                Gör om testet
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const shareText = `Jag fick ${totalScore}/100 poäng på Functional Foods hälsoquiz! Testa du också: https://functional-quiz-frontend.onrender.com`;
                  if (navigator.share) {
                    navigator.share({
                      title: 'Functional Foods Quiz',
                      text: shareText,
                      url: 'https://functional-quiz-frontend.onrender.com'
                    });
                  } else {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                  }
                }}
              >
                Dela ditt resultat 📤
              </button>
            </div>

            <div className="disclaimer">
              <p>
                <strong>Observera:</strong> Dessa rekommendationer är generella råd baserade på dina 
                quiz-svar och ersätter inte professionell medicinsk rådgivning. 
                Konsultera alltid läkare innan du gör större förändringar i din livsstil eller börjar med nya tillskott.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultScreen; 