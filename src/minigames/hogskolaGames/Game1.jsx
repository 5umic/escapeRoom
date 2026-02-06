// Code Quiz Game - Train System (C#)
import React, { useState } from 'react';
import './Game1.css';

export default function Game1() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [droppedAnswer, setDroppedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const correctAnswer = "Distance / Speed";
  
  const codeOptions = [
    "Distance / Speed",
    "Speed / Distance",
    "Distance * Speed",
    "Distance + Speed",
    "Distance - Speed",
    "Speed * 2",
    "Distance % Speed",
    "Math.Sqrt(Distance)",
    "Speed + Distance / 2",
    "Distance / (Speed * 2)",
    "Speed - (Distance * 2)",
    "Distance * 2 - Speed"
  ];

  const handleDragStart = (e, option) => {
    e.dataTransfer.setData('text/plain', option);
    setSelectedOption(option);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const option = e.dataTransfer.getData('text/plain');
    setDroppedAnswer(option);
    
    if (option === correctAnswer) {
      setIsCorrect(true);
      setTimeout(() => {
        setShowInfo(true);
      }, 500);
    } else {
      setIsCorrect(false);
    }
  };

  const handleReset = () => {
    setDroppedAnswer(null);
    setIsCorrect(false);
  };

  if (showSuccess) {
    return (
      <div className="game1-success">
        <div className="success-content">
          <h2>Rätt svar!</h2>
          <p className="reward-word">
            <span className="reward-label">Ditt ord:</span> <strong>ALLA</strong></p>
          <button className="continue-button">Fortsätt</button>
        </div>
      </div>
    );
  }

  if (showInfo) {
    return (
      <div className="game1-container">
        <div className="game1-content">
          <div className="info-section">
            <h2 className="info-title">Bra jobbat!</h2>
            
            <div className="info-text">
              <p>
                Inom Trafikverket står IKT för Informations- och Kommunikationsteknik. Det omfattar hela infrastrukturen för dataöverföring, IT-system och kommunikationslösningar som används för att styra och övervaka Sveriges transportinfrastruktur.
              </p>
              <p>
                Trafikverket hanterar omfattande IKT-system för järnvägstrafikledning och vägtrafikinformation - allt från skyltar och kameror till avancerade övervakningssystem. IKT-säkerhet är en kritisk del av verksamheten där vi arbetar kontinuerligt med att skydda våra system mot cyberattacker och säkerställa att transportsystemet fungerar utan avbrott.
              </p>
              <p>
                Genom digitalisering använder Trafikverket IKT för att effektivisera underhåll av vägar och järnvägar. Med hjälp av sensorer och realtidsdata (IoT) kan vi förutse behov och agera innan problem uppstår.
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
    <div className="game1-container">
      <div className="game1-content">
        <h1 className="game1-title">Tågkod Utmaning</h1>
        <p className="game1-instructions">
          Visste du att många av Trafivkverkets applikationer är utvecklade i .NET C#. <br></br>Det är en av våra primära utvecklingsplattformar.
          Dra rätt kod för att beräkna ankomsttiden för tåget
        </p>

        <div className="code-display">
          <pre className="code-block">
{`public class Train 
{
    public int Speed { get; set; }
    public int Distance { get; set; }
    
    public int CalculateArrivalTime() 
    {
        return `}
            <span 
              className={`drop-zone ${droppedAnswer ? 'filled' : ''} ${isCorrect ? 'correct' : droppedAnswer ? 'incorrect' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {droppedAnswer || "// Dra kod hit"}
            </span>
{`;
    }
}`}
          </pre>
        </div>

        {droppedAnswer && !isCorrect && (
          <button className="reset-button" onClick={handleReset}>
            Försök igen
          </button>
        )}

        <div className="options-container">
          <h3>Välj rätt kod:</h3>
          <div className="options-grid">
            {codeOptions.map((option, index) => (
              <div
                key={index}
                className={`code-option ${droppedAnswer === option ? 'used' : ''}`}
                draggable={droppedAnswer !== option}
                onDragStart={(e) => handleDragStart(e, option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
