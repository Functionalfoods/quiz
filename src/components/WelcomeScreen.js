import React from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStartQuiz }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              UPPTÄCK DIN PERFEKTA
              <span className="highlight"> FUNCTIONAL FOOD</span>
            </h1>
            <p className="hero-subtitle">
              Få personaliserade rekommendationer baserat på din livsstil och hälsobehov enligt <strong>Ulrika Davidssons</strong> beprövade metod. 
              Vårt intelligenta quiz analyserar dina vanor och ger dig skräddarsydda råd för optimal hälsa genom functional foods.
            </p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <span>Personaliserade rekommendationer</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🧬</div>
                <span>Vetenskapligt baserade råd</span>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <span>Snabb analys på 2 minuter</span>
              </div>
            </div>
            <button 
              className="btn btn-primary quiz-start-btn"
              onClick={onStartQuiz}
            >
              Starta Ditt Personliga Quiz
              <span className="btn-arrow">→</span>
            </button>
            <p className="quiz-info">
              10 smarta frågor • Kostnadsfritt • Inga mejl krävs
            </p>
          </div>
        </div>
        
        <div className="benefits-section">
          <h2>Vad får du ut av quizet?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🍃</div>
              <h3>Kostråd</h3>
              <p>Personaliserade näringsrekommendationer baserat på dina behov och mål</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🏃‍♀️</div>
              <h3>Livsstilstips</h3>
              <p>Praktiska råd för att förbättra din dagliga rutin och välmående</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💊</div>
              <h3>Tillskottsguide</h3>
              <p>Rekommendationer för functional foods som passar just din profil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen; 