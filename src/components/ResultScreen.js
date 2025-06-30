import React, { useState, useEffect } from 'react';
import './ResultScreen.css';
import { generatePersonalizedRecommendations } from '../services/openaiService';

const ResultScreen = ({ quizData, onRestart }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('diet');

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

        {recommendations && (
          <>
            <div className="tabs-container">
              <div className="tabs-header">
                <button 
                  className={`tab-button ${activeTab === 'diet' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diet')}
                >
                  <span className="tab-icon">🍃</span>
                  <span className="tab-text">Kostråd</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'lifestyle' ? 'active' : ''}`}
                  onClick={() => setActiveTab('lifestyle')}
                >
                  <span className="tab-icon">🏃‍♀️</span>
                  <span className="tab-text">Livsstil</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'supplements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('supplements')}
                >
                  <span className="tab-icon">💊</span>
                  <span className="tab-text">Functional Foods</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'priorities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('priorities')}
                >
                  <span className="tab-icon">⭐</span>
                  <span className="tab-text">Prioriteringar</span>
                </button>
                <button 
                  className={`tab-button ${activeTab === 'course' ? 'active' : ''}`}
                  onClick={() => setActiveTab('course')}
                >
                  <span className="tab-icon">🎓</span>
                  <span className="tab-text">Din Kurs</span>
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'diet' && (
                  <div className="recommendation-card diet-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">🍃</div>
                      <h2>Kostråd & Näring</h2>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.diet }} />
                    </div>
                  </div>
                )}

                {activeTab === 'lifestyle' && (
                  <div className="recommendation-card lifestyle-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">🏃‍♀️</div>
                      <h2>Livsstilsrekommendationer</h2>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.lifestyle }} />
                    </div>
                  </div>
                )}

                {activeTab === 'supplements' && (
                  <div className="recommendation-card supplements-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">💊</div>
                      <h2>Functional Foods & Tillskott</h2>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.supplements }} />
                    </div>
                  </div>
                )}

                {activeTab === 'priorities' && (
                  <div className="recommendation-card priorities-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">⭐</div>
                      <h2>Dina Prioriteringar</h2>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.priorities }} />
                    </div>
                  </div>
                )}

                {activeTab === 'course' && (
                  <div className="recommendation-card course-card active-tab-content">
                    <div className="card-header">
                      <div className="card-icon">🎓</div>
                      <h2>Rekommenderad Kurs</h2>
                    </div>
                    <div className="card-content">
                      <div dangerouslySetInnerHTML={{ __html: recommendations.courseRecommendation }} />
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