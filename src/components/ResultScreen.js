import React, { useState, useEffect } from 'react';
import './ResultScreen.css';
import { generatePersonalizedRecommendations } from '../services/openaiService';

const ResultScreen = ({ quizData, onRestart }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('kostrad');
  const [healthScores, setHealthScores] = useState({
    energi: 5,
    sömn: 5,
    stress: 5,
    kost: 5,
    motion: 5
  });
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const calculateHealthScores = () => {
    // This would be calculated based on quiz answers
    // For now, using placeholder logic
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

  const renderMiniRadarChart = (category, score) => {
    const categories = ['energi', 'sömn', 'stress', 'kost', 'motion'];
    const categoryIndex = categories.indexOf(category);
    
    return (
      <div className="mini-radar-container">
        <svg viewBox="0 0 120 120" className="mini-radar-svg">
          {/* Background circles */}
          {[1, 2, 3, 4, 5].map((level) => (
            <circle
              key={level}
              cx="60"
              cy="60"
              r={level * 10}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          
          {/* Single point */}
          <circle
            cx={60 + (score * 5) * Math.cos((categoryIndex * 72 - 90) * (Math.PI / 180))}
            cy={60 + (score * 5) * Math.sin((categoryIndex * 72 - 90) * (Math.PI / 180))}
            r="4"
            fill="#93c560"
            stroke="#014421"
            strokeWidth="2"
          />
          
          {/* Center to point line */}
          <line
            x1="60"
            y1="60"
            x2={60 + (score * 5) * Math.cos((categoryIndex * 72 - 90) * (Math.PI / 180))}
            y2={60 + (score * 5) * Math.sin((categoryIndex * 72 - 90) * (Math.PI / 180))}
            stroke="#93c560"
            strokeWidth="2"
            opacity="0.6"
          />
          
          {/* Score text */}
          <text
            x="60"
            y="65"
            textAnchor="middle"
            className="mini-score-text"
            fill="#014421"
          >
            {score}/10
          </text>
        </svg>
      </div>
    );
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

  return (
    <div className="result-screen">
      <div className="result-container">
        <div className="result-header">
          <div className="success-icon">✨</div>
          <h1>DINA PERSONALISERADE REKOMMENDATIONER</h1>
          <p className="result-subtitle">
            Baserat på dina svar har vi skapat en omfattande hälsoplan anpassad just för dig
          </p>
        </div>

        {recommendations && recommendations.summary && (
          <div className="health-summary">
            <h2>Din Hälsosammanfattning</h2>
            <div className="help-button" onClick={() => setShowInfoPopup(true)}>
              ?
            </div>
            <div dangerouslySetInnerHTML={{ __html: recommendations.summary }} />
          </div>
        )}

        {showInfoPopup && (
          <div className="info-popup-overlay" onClick={() => setShowInfoPopup(false)}>
            <div className="info-popup" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>Hur beräknas dina poäng?</h3>
                <button className="close-btn" onClick={() => setShowInfoPopup(false)}>×</button>
              </div>
              <div className="popup-content">
                <p><strong>Energi:</strong> Baserat på din energinivå under dagen och hur ofta du känner dig trött.</p>
                <p><strong>Sömn:</strong> Beräknas från din sömnkvalitet och hur utvilad du känner dig på morgonen.</p>
                <p><strong>Stress:</strong> Baserat på din upplevda stressnivå - lägre stress ger högre poäng.</p>
                <p><strong>Kost:</strong> Utvärderas från dina matvanor och hur näringsrik din kost är.</p>
                <p><strong>Motion:</strong> Baserat på din aktivitetsnivå och regelbunden träning.</p>
                <br />
                <p><em>Poängen sätts av AI baserat på dina quiz-svar och används för att skapa personaliserade rekommendationer.</em></p>
              </div>
            </div>
          </div>
        )}

        {recommendations && (
          <>
            <div className="tabs-container">
              <div className="tabs-header">
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
                {activeTab === 'kostrad' && (
                  <div className="recommendation-card diet-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">🍃</div>
                      <h2>Kostråd</h2>
                      {renderMiniRadarChart('kost', healthScores.kost)}
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.kostrad }} />
                    </div>
                  </div>
                )}

                {activeTab === 'livsstil' && (
                  <div className="recommendation-card lifestyle-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">🏃‍♀️</div>
                      <h2>Livsstilsrekommendationer</h2>
                      <div className="mini-charts-row">
                        {renderMiniRadarChart('energi', healthScores.energi)}
                        {renderMiniRadarChart('sömn', healthScores.sömn)}
                        {renderMiniRadarChart('stress', healthScores.stress)}
                      </div>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.livsstil }} />
                    </div>
                  </div>
                )}

                {activeTab === 'functionalFoods' && (
                  <div className="recommendation-card supplements-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">💊</div>
                      <h2>Functional Foods & Tillskott</h2>
                      <div className="overall-score">
                        <span className="score-label">Total hälsopoäng:</span>
                        <span className="score-value">
                          {Object.values(healthScores).reduce((a, b) => a + b, 0)}/50
                        </span>
                      </div>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.functionalFoods }} />
                    </div>
                  </div>
                )}

                {activeTab === 'prioriteringar' && (
                  <div className="recommendation-card priorities-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">⭐</div>
                      <h2>Dina Prioriteringar</h2>
                      {renderMiniRadarChart('motion', healthScores.motion)}
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.prioriteringar }} />
                    </div>
                  </div>
                )}

                {activeTab === 'dinKurs' && (
                  <div className="recommendation-card course-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">🎓</div>
                      <h2>Din Rekommenderade Kurs</h2>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.dinKurs }} />
                      <div className="course-cta">
                        <a 
                          href="https://functionalfoods.se" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="course-btn"
                        >
                          Gå till kursen →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="result-actions">
              <button className="btn btn-secondary" onClick={onRestart}>
                Gör om testet
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