import React, { useState, useEffect } from 'react';
import './ResultScreen.css';
import { generatePersonalizedRecommendations } from '../services/openaiService';

const ResultScreen = ({ quizData, onRestart }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('kostrad');
  const [showScoreExplanation, setShowScoreExplanation] = useState(false);

  // Calculate health scores based on quiz answers
  const calculateHealthScores = () => {
    const scores = {
      energi: 5,
      sömn: 5,
      stress: 5,
      kost: 5,
      motion: 5
    };

    // Energy score (question 1)
    if (quizData[1] === 'high_energy') scores.energi = 9;
    else if (quizData[1] === 'afternoon_dip') scores.energi = 7;
    else if (quizData[1] === 'variable_energy') scores.energi = 5;
    else if (quizData[1] === 'low_energy') scores.energi = 3;

    // Sleep score (question 2)
    if (quizData[2] === 'excellent_sleep') scores.sömn = 9;
    else if (quizData[2] === 'good_sleep') scores.sömn = 7;
    else if (quizData[2] === 'disrupted_sleep') scores.sömn = 4;
    else if (quizData[2] === 'poor_sleep') scores.sömn = 2;

    // Stress score (question 3 - inverse: lower stress = higher score)
    if (quizData[3] === 'low_stress') scores.stress = 9;
    else if (quizData[3] === 'moderate_stress') scores.stress = 6;
    else if (quizData[3] === 'high_stress') scores.stress = 3;
    else if (quizData[3] === 'chronic_stress') scores.stress = 2;

    // Exercise score (question 4)
    if (quizData[4] === 'very_active') scores.motion = 9;
    else if (quizData[4] === 'active') scores.motion = 7;
    else if (quizData[4] === 'somewhat_active') scores.motion = 4;
    else if (quizData[4] === 'sedentary') scores.motion = 2;

    // Diet score (question 5)
    if (quizData[5] === 'excellent_diet') scores.kost = 9;
    else if (quizData[5] === 'good_diet') scores.kost = 7;
    else if (quizData[5] === 'mixed_diet') scores.kost = 5;
    else if (quizData[5] === 'poor_diet') scores.kost = 2;

    return scores;
  };

  const healthScores = calculateHealthScores();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const result = await generatePersonalizedRecommendations(quizData);
        setRecommendations(result);
      } catch (err) {
        setError('Ett fel uppstod vid genereringen av dina rekommendationer. Försök igen.');
        console.error('Error generating recommendations:', err);
      } finally {
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
            <p>Vi skapar personaliserade rekommendationer baserat på din livsstil</p>
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
            <h2>Något gick snett</h2>
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
    <div className="result-screen fade-in">
      <div className="result-container">
        <div className="result-header">
          <div className="success-icon">🎉</div>
          <h1>Dina Personaliserade Rekommendationer</h1>
          <p className="result-subtitle">
            Baserat på dina svar har vi skapat en skräddarsydd plan för din optimala hälsa
          </p>
        </div>

        {/* Visual Health Profile */}
        <div className="health-profile-section">
          <h2 className="profile-title">
            Din Hälsoprofil
            <button 
              className="info-button"
              onClick={() => setShowScoreExplanation(true)}
              aria-label="Förklaring av poängberäkning"
            >
              ?
            </button>
          </h2>
          
          {/* Score Explanation Popup */}
          {showScoreExplanation && (
            <div className="popup-overlay" onClick={() => setShowScoreExplanation(false)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="popup-close"
                  onClick={() => setShowScoreExplanation(false)}
                >
                  ×
                </button>
                <h3>Så beräknas dina poäng</h3>
                <div className="score-explanation">
                  <div className="explanation-item">
                    <span className="explanation-emoji">⚡</span>
                    <div>
                      <h4>Energi (Fråga 1)</h4>
                      <p>• Hög energi hela dagen: 9 poäng</p>
                      <p>• Bra energi med eftermiddagsdipp: 7 poäng</p>
                      <p>• Varierande energi: 5 poäng</p>
                      <p>• Låg energi och trötthet: 3 poäng</p>
                    </div>
                  </div>
                  <div className="explanation-item">
                    <span className="explanation-emoji">😴</span>
                    <div>
                      <h4>Sömn (Fråga 2)</h4>
                      <p>• Utmärkt sömn (7-9h): 9 poäng</p>
                      <p>• Bra sömn, vaknar ibland: 7 poäng</p>
                      <p>• Svårt att somna/vaknar ofta: 4 poäng</p>
                      <p>• Dålig sömn: 2 poäng</p>
                    </div>
                  </div>
                  <div className="explanation-item">
                    <span className="explanation-emoji">🧘</span>
                    <div>
                      <h4>Stress (Fråga 3)</h4>
                      <p>• Hanterar stress mycket bra: 9 poäng</p>
                      <p>• Måttlig stress: 6 poäng</p>
                      <p>• Ofta stressad: 3 poäng</p>
                      <p>• Konstant stress: 2 poäng</p>
                    </div>
                  </div>
                  <div className="explanation-item">
                    <span className="explanation-emoji">🏃</span>
                    <div>
                      <h4>Motion (Fråga 4)</h4>
                      <p>• 5+ gånger/vecka: 9 poäng</p>
                      <p>• 3-4 gånger/vecka: 7 poäng</p>
                      <p>• 1-2 gånger/vecka: 4 poäng</p>
                      <p>• Sällan eller aldrig: 2 poäng</p>
                    </div>
                  </div>
                  <div className="explanation-item">
                    <span className="explanation-emoji">🥗</span>
                    <div>
                      <h4>Kost (Fråga 5)</h4>
                      <p>• Mycket hälsosam kost: 9 poäng</p>
                      <p>• Ganska hälsosam: 7 poäng</p>
                      <p>• Blandat: 5 poäng</p>
                      <p>• Ohälsosam kost: 2 poäng</p>
                    </div>
                  </div>
                </div>
                <div className="popup-footer">
                  <p>Maxpoäng: 50 (10 per kategori)</p>
                  <p>Din totalpoäng: <strong>{Object.values(healthScores).reduce((a, b) => a + b, 0)}/50</strong></p>
                </div>
              </div>
            </div>
          )}
          
          <div className="health-profile-container">
            <div className="radar-chart">
              <svg viewBox="0 0 300 300" className="radar-svg">
                {/* Background circles */}
                {[1, 2, 3, 4, 5].map((level) => (
                  <circle
                    key={level}
                    cx="150"
                    cy="150"
                    r={level * 25}
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Axis lines */}
                {Object.keys(healthScores).map((category, index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const x = 150 + 125 * Math.cos(angle);
                  const y = 150 + 125 * Math.sin(angle);
                  return (
                    <line
                      key={category}
                      x1="150"
                      y1="150"
                      x2={x}
                      y2={y}
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* Data polygon */}
                <polygon
                  points={Object.values(healthScores).map((score, index) => {
                    const angle = (index * 72 - 90) * (Math.PI / 180);
                    const radius = (score / 10) * 125;
                    const x = 150 + radius * Math.cos(angle);
                    const y = 150 + radius * Math.sin(angle);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="rgba(139, 195, 74, 0.3)"
                  stroke="#8BC34A"
                  strokeWidth="2"
                />
                
                {/* Labels */}
                {Object.entries(healthScores).map(([category, score], index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const x = 150 + 145 * Math.cos(angle);
                  const y = 150 + 145 * Math.sin(angle);
                  const emoji = {
                    energi: '⚡',
                    sömn: '😴',
                    stress: '🧘',
                    kost: '🥗',
                    motion: '🏃'
                  }[category];
                  
                  return (
                    <g key={category}>
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="radar-label"
                      >
                        <tspan x={x} dy="-10">{emoji}</tspan>
                        <tspan x={x} dy="20">{category}</tspan>
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="health-scores">
              <h3>Dina poäng</h3>
              <div className="score-list">
                {Object.entries(healthScores).map(([category, score]) => (
                  <div key={category} className="score-item">
                    <span className="score-category">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <div className="score-bar-container">
                      <div 
                        className="score-bar" 
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                    <span className="score-value">{score}/10</span>
                  </div>
                ))}
              </div>
              <div className="score-summary">
                <p>Total hälsopoäng: <strong>{Object.values(healthScores).reduce((a, b) => a + b, 0)}/50</strong></p>
              </div>
            </div>
          </div>
        </div>

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
                      <h2>Kostråd & Näring</h2>
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
                      <h2>Rekommenderad Kurs</h2>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.dinKurs }} />
                      <div className="course-cta">
                        <a 
                          href="https://functionalfoods.se/kursutbud/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-accent course-btn"
                        >
                          Se kurser på Functional Foods →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="result-actions">
          <button className="btn btn-secondary" onClick={onRestart}>
            Gör quizet igen
          </button>
        </div>

        <div className="disclaimer">
          <p>
            <strong>Viktigt:</strong> Dessa rekommendationer är generella råd baserade på dina svar. 
            Konsultera alltid med en läkare eller nutritionist för personlig medicinsk rådgivning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen; 