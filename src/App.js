import React, { useState } from 'react';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import QuizModal from './components/QuizModal';
import ResultScreen from './components/ResultScreen';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); // 'welcome', 'quiz', 'result'
  const [quizData, setQuizData] = useState({});

  const startQuiz = () => {
    setCurrentStep('quiz');
  };

  const completeQuiz = (data) => {
    setQuizData(data);
    setCurrentStep('result');
  };

  const resetQuiz = () => {
    setCurrentStep('welcome');
    setQuizData({});
  };

  return (
    <div className="App">
      {currentStep === 'welcome' && (
        <WelcomeScreen onStartQuiz={startQuiz} />
      )}
      
      {currentStep === 'quiz' && (
        <QuizModal 
          onComplete={completeQuiz}
          onClose={resetQuiz}
        />
      )}
      
      {currentStep === 'result' && (
        <ResultScreen 
          quizData={quizData}
          onRestart={resetQuiz}
        />
      )}
    </div>
  );
}

export default App; 