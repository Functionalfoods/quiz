import React, { useState } from 'react';
import './QuizModal.css';
import { quizQuestions } from '../data/quizQuestions';

const QuizModal = ({ onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnswer = (answer) => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: answer
    };
    setAnswers(newAnswers);

    // Smooth animation between questions
    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Quiz complete
        onComplete(newAnswers);
      }
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  return (
    <div className="modal-overlay fade-in">
      <div className="quiz-modal slide-up">
        <div className="quiz-header">
          <button className="close-btn" onClick={onClose}>×</button>
          <div className="progress-section">
            <div className="progress-text">
              Fråga {currentQuestion + 1} av {quizQuestions.length}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`quiz-content ${isAnimating ? 'animating' : ''}`}>
          <div className="question-section">
            <div className="question-icon">{question.icon}</div>
            <h2 className="question-title">{question.question}</h2>
            {question.subtitle && (
              <p className="question-subtitle">{question.subtitle}</p>
            )}
          </div>

          <div className="answers-section">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`answer-btn ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(option.value)}
              >
                <div className="answer-content">
                  <div className="answer-icon">{option.icon}</div>
                  <div className="answer-text">
                    <div className="answer-title">{option.label}</div>
                    {option.description && (
                      <div className="answer-description">{option.description}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="quiz-navigation">
            {currentQuestion > 0 && (
              <button className="btn btn-secondary nav-btn" onClick={goToPrevious}>
                ← Föregående
              </button>
            )}
            <div className="nav-spacer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal; 