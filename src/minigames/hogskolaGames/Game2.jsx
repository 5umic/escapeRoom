// Game 2 - Sentence Building Game
import React, { useState, useEffect } from 'react';
import './Game2.css';
import Game3 from './Game3.jsx';

export default function Game2() {
  const targetSentence = ["Alla", "kommer", "fram", "smidigt,", "grönt", "och", "tryggt"];
  
  const [selectedWords, setSelectedWords] = useState(Array(targetSentence.length).fill(null));
  const [availableWords, setAvailableWords] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGame4, setShowGame4] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null); // { word, fromIndex } or { word, fromAvailable: true }
  const [isDragging, setIsDragging] = useState(false);
  
  const allWords = [
    "Alla", "kommer", "fram", "smidigt,", "grönt", "och", "tryggt",
    "aldrig", "äppelmos", "vi", "måste", "imorgon", "kanske", "bra"
  ];

  useEffect(() => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
  }, []);

  const handleWordClick = (word) => {
    // When clicking a word from available words, add it to first empty slot
    const emptyIndex = selectedWords.findIndex(w => w === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedWords];
      newSelected[emptyIndex] = word;
      setSelectedWords(newSelected);
      setAvailableWords(availableWords.filter(w => w !== word));
      setFeedback([]);
    }
  };

  const handleSlotClick = (index) => {
    // Click on a word slot to send it back to available words
    const wordAtSlot = selectedWords[index];
    if (wordAtSlot !== null && !isDragging) {
      const newSelected = [...selectedWords];
      newSelected[index] = null;
      setSelectedWords(newSelected);
      setAvailableWords([...availableWords, wordAtSlot]);
      setFeedback([]);
    }
  };

  // Drag handlers for word slots
  const handleDragStartSlot = (e, index) => {
    const word = selectedWords[index];
    if (word !== null) {
      setDraggedItem({ word, fromIndex: index });
      setIsDragging(true);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOverSlot = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropSlot = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.fromAvailable) {
      // Dropping from available words
      const newSelected = [...selectedWords];
      if (newSelected[targetIndex] === null) {
        newSelected[targetIndex] = draggedItem.word;
        setSelectedWords(newSelected);
        setAvailableWords(availableWords.filter(w => w !== draggedItem.word));
        setFeedback([]);
      }
    } else {
      // Dropping from another slot - swap positions
      const newSelected = [...selectedWords];
      [newSelected[draggedItem.fromIndex], newSelected[targetIndex]] = 
        [newSelected[targetIndex], newSelected[draggedItem.fromIndex]];
      setSelectedWords(newSelected);
      setFeedback([]);
    }

    setDraggedItem(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
  };

  // Drag handlers for available words
  const handleDragStartAvailable = (e, word) => {
    setDraggedItem({ word, fromAvailable: true });
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
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
    return <Game3 />;
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
          Dra och släpp ord från listan nedan för att bygga Trafikverkets viktiga budskap. 
          Klicka på ord i meningen för att ta bort dem.
          <br />
          Grön = rätt ord på rätt plats, Gul = rätt ord men fel plats, Grå = fel ord.
        </p>

        <div className="sentence-builder">
          <div className="selected-words">
            {selectedWords.map((word, index) => (
              <div 
                key={index} 
                className={`word-slot ${word !== null ? 'filled' : 'empty'} ${feedback[index] || ''}`}
                onClick={() => handleSlotClick(index)}
                onDragOver={handleDragOverSlot}
                onDrop={(e) => handleDropSlot(e, index)}
                draggable={word !== null}
                onDragStart={(e) => handleDragStartSlot(e, index)}
                onDragEnd={handleDragEnd}
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
                draggable={true}
                onDragStart={(e) => handleDragStartAvailable(e, word)}
                onDragEnd={handleDragEnd}
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
