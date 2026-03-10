// Game 3 - Sentence Building Game
import React, { useState, useEffect } from 'react';
import './Game3.css';
import Game4 from './Game4.jsx';

export default function Game3() {
  const targetSentence = ["Alla", "kommer", "fram", "smidigt,", "grönt", "och", "tryggt"];
  
  const [selectedWords, setSelectedWords] = useState(Array(targetSentence.length).fill(null));
  const [availableWords, setAvailableWords] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGame4, setShowGame4] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const allWords = [
    "Alla", "kommer", "fram", "smidigt,", "grönt", "och", "tryggt",
    "snabbt", "säkert", "vi", "måste", "kan", "vara", "bra"
  ];

  useEffect(() => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
  }, []);

  const handleWordClick = (word) => {
    const emptyIndex = selectedWords.findIndex(w => w === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedWords];
      newSelected[emptyIndex] = word;
      setSelectedWords(newSelected);
      setAvailableWords(availableWords.filter(w => w !== word));
      setFeedback([]);
    }
  };

  const handleRemoveWord = (index) => {
    const wordToRemove = selectedWords[index];
    if (wordToRemove !== null) {
      const newSelected = [...selectedWords];
      newSelected[index] = null;
      setSelectedWords(newSelected);
      setAvailableWords([...availableWords, wordToRemove]);
      setFeedback([]);
    }
  };

  const handleClear = () => {
    setAvailableWords([...allWords].sort(() => Math.random() - 0.5));
    setSelectedWords(Array(targetSentence.length).fill(null));
    setFeedback([]);
  };

  const checkSentence = () => {
    if (selectedWords.some(w => w === null)) {
      return;
    }

    const newFeedback = selectedWords.map((word, index) => {
      if (word === targetSentence[index]) {
        return 'correct';
      } else if (targetSentence.includes(word)) {
        return 'misplaced';
      } else {
        return 'wrong';
      }
    });

    setFeedback(newFeedback);
    setAttempts(attempts + 1);

    if (newFeedback.every(f => f === 'correct')) {
      setTimeout(() => {
        setShowInfo(true);
      }, 1000);
    }
  };

  if (showGame4) {
    return <Game4 />;
  }

  if (showSuccess) {
    return (
      <div className="game3-success">
        <div className="success-content">
          <h2>Rätt svar!</h2>
          <p className="reward-word">
            <span className="reward-label"></span> <strong>BRA JOBBAT!</strong>
          </p>
          <button className="continue-button" onClick={() => setShowGame4(true)}>Fortsätt</button>
        </div>
      </div>
    );
  }

  if (showInfo) {
    return (
      <div className="game3-container">
        <div className="game3-content">
          <div className="info-section">
            <h2 className="info-title">Du är helt grym!</h2>
            
            <div className="info-text">
              <p>
                "Alla kommer fram smidigt, grönt och tryggt" - detta är en av Trafikverkets kärnvärden när det gäller trafikplanering och infrastruktur.
              </p>
              <p>
                Smidighet i trafikflöden, gröna hållbara lösningar och trygghet för alla trafikanter är grundläggande principer i vårt arbete. Som IT-utvecklare på Trafikverket bidrar du till att skapa system som hjälper till att uppnå dessa mål.
              </p>
              <p>
                Genom att utveckla intelligenta trafikstyrningssystem, realtidsövervakning och dataanalys hjälper vi till att göra Sveriges vägar och järnvägar säkrare och mer effektiva.
              </p>
            </div>

            <button className="continue-button" onClick={() => setShowSuccess(true)}>
              Fortsätt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game3-container">
      <div className="game3-content">
        <h1 className="game3-title">Bygg Rätt Mening</h1>
        <p className="game3-instructions">
          Välj ord från listan nedan för att bygga Trafikverkets viktiga budskap. 
          Grön = rätt ord på rätt plats, Gul = rätt ord men fel plats, Grå = fel ord.
        </p>

        <div className="sentence-builder">
          <div className="selected-words">
            {selectedWords.map((word, index) => (
              <div 
                key={index} 
                className={`word-slot ${word !== null ? 'filled' : 'empty'} ${feedback[index] || ''}`}
                onClick={() => word !== null && handleRemoveWord(index)}
              >
                {word !== null ? word : '_'}
              </div>
            ))}
          </div>

          <div className="button-group">
            <button 
              className="check-button" 
              onClick={checkSentence}
              disabled={selectedWords.some(w => w === null)}
            >
              Kontrollera Mening
            </button>
          </div>

        </div>

        <div className="available-words">
          <h3>Tillgängliga Ord:</h3>
          <div className="word-bank">
            {availableWords.map((word, index) => (
              <button 
                key={index} 
                className="word-button"
                onClick={() => handleWordClick(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
