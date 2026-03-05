

import React, { useState } from 'react';
import './Game4.css';
import Game5 from './Game5.jsx';

export default function Game4() {
  const [stage, setStage] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGame5, setShowGame5] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const stages = [
    {
      title: "Vid bilen",
      description: "Det är en regnig, mörk hösteftermiddag. Du lämnar kontoret efter en lång dag på Trafikverket. Regnet öser ner och sikten är dålig. Du närmar dig din bil på parkeringen. Vad gör du?",
      options: [
        { text: "Ser runt bilen och kontrollerar att inga föremål eller personer/djur är i vägen", correct: true, feedback: "Rätt! Även om det regnar ska du alltid kontrollera runt fordonet. I mörker och dåligt väder kan det finnas hinder, barn eller djur som du inte ser." },
        { text: "Går direkt in i bilen, det regnar ju", correct: false, feedback: "Fel! Även i regn måste du kontrollera runt bilen. Ett barn eller djur kan vara gömt bakom bilen, särskilt i mörker." },
        { text: "Kollar mobilen medan du går till bilen", correct: false, feedback: "Fel! Du måste vara uppmärksam i trafiken, även som fotgängare på en parkering." }
      ]
    },
    {
      title: "I bilen",
      description: "Du sitter nu i förarsätet. Bilen är kall och rutorna är immiga. Vad är det allra första du gör?",
      options: [
        { text: "Startar motorn så att det blir varmt", correct: false, feedback: "Fel! Säkerhetsbältet ska ALLTID vara det första du gör när du sätter dig i bilen, innan du ens startar motorn." },
        { text: "Sätter på säkerhetsbältet", correct: true, feedback: "Rätt! Säkerhetsbältet ska ALLTID vara det första. Gör det till en vana att sätta på bältet direkt när du sätter dig - innan du startar, innan du kollar mobilen, innan allt annat." },
        { text: "Kollar mobilen för att se navigationsinstruktioner", correct: false, feedback: "Fel! Säkerhetsbältet FÖRST, alltid. Använd inte mobilen innan du har bältet på och är redo att köra säkert." }
      ]
    },
    {
      title: "Starta färden",
      description: "Motorn är igång och rutorna börjar klarna. Du ser att det regnar kraftigt. Vad gör du innan du backar ut?",
      options: [
        { text: "Backar ut försiktigt med backspegeln", correct: false, feedback: "Fel! I dåligt väder och mörker måste du kontrollera ALLA döda vinklar och använda både speglar OCH titta över axeln." },
        { text: "Kontrollerar alla speglar, döda vinklar, och väntar tills rutorna är helt klara", correct: true, feedback: "Rätt! I dåliga väderförhållanden är det extra viktigt med god sikt och att dubbelkolla döda vinklar." },
        { text: "Sätter på musiken och backar ut", correct: false, feedback: "Fel! Du måste ha full koncentration när du backar, särskilt i dåligt väder." }
      ]
    },
    {
      title: "På vägen",
      description: "Du är nu ute på vägen. Regnet öser ner, sikten är dålig och vägbanan är våt och hal. Det är mörklagt och du kör bakom en annan bil. Hur kör du?",
      options: [
        { text: "Kör i normal hastighet, vill komma hem fort", correct: false, feedback: "Fel! I dåligt väder ska du ALLTID anpassa hastigheten efter förhållandena. Våt vägbana = längre bromssträcka." },
        { text: "Sänker hastigheten, ökar avståndet till bilen framför, tänder helljus för bättre sikt", correct: false, feedback: "Fel! Helljus bakom en annan bil bländar föraren framför dig i backspegeln - extremt farligt! Använd ALDRIG helljus bakom andra fordon. Dessutom reflekterar helljus i regnet." },
        { text: "Sänker hastigheten, ökar avståndet till framförvarande, använder halvljus", correct: true, feedback: "Rätt! Anpassad hastighet, ökat avstånd och halvljus är avgörande. Använd ALDRIG helljus bakom andra fordon - det bländar dem i backspegeln." },
        { text: "Kör tätt bakom bilen framför för bättre sikt", correct: false, feedback: "Fel! Att köra tätt är extremt farligt i dåligt väder. Du behöver längre bromssträcka på våt väg." }
      ]
    },
    {
      title: "Nästan hemma",
      description: "Du kör på sista biten hem. Plötsligt piper telefonen - du får en notifikation. Samtidigt känner du att den vibrerar i fickan. Vad gör du?",
      options: [
        { text: "Tar snabbt upp telefonen och kollar meddelandet", correct: false, feedback: "Fel! Att använda mobilen medan du kör är en av de vanligaste orsakerna till olyckor. Även en sekunds ouppmärksamhet kan få katastrofala följder." },
        { text: "Tittar snabbt på skärmen utan att röra telefonen", correct: false, feedback: "Fel! Även att titta på telefonen tar bort din uppmärksamhet från vägen. I 50 km/h hinner du köra 14 meter blint på en sekund." },
        { text: "Ignorerar telefonen helt tills du har stannat och parkerat", correct: true, feedback: "Rätt! Inget meddelande är viktigare än din säkerhet. Vänta alltid tills du har stannat säkert innan du använder telefonen. Du har klarat resan säkert!" },
        { text: "Svarar med röstkommando", correct: false, feedback: "Fel! Även röstkommandon och handsfree-samtal tar bort mental uppmärksamhet från trafiken. Studier visar att din reaktionstid försämras även när du pratar i telefon." }
      ]
    }
  ];

  const handleChoice = (option) => {
    if (option.correct) {
      setErrorMessage(option.feedback);
      setShowNextButton(true);
      setIsCorrect(true);
    } else {
      setErrorMessage(option.feedback);
      setShowNextButton(false);
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    setErrorMessage('');
    setShowNextButton(false);
    setIsCorrect(false);
    if (stage < stages.length - 1) {
      setStage(stage + 1);
    } else {
      setShowInfo(true);
    }
  };

  const handleRetry = () => {
    setErrorMessage('');
    setIsCorrect(false);
  };

  if (showGame5) {
    return <Game5 />;
  }

  if (showSuccess) {
    return (
      <div className="game4-success">
        <div className="success-content">
          <h2>Rätt svar!</h2>
          <p className="reward-word">
            <span className="reward-label"></span> <strong>BRA JOBBAT!</strong>
          </p>
          <button className="continue-button" onClick={() => setShowGame5(true)}>Fortsätt</button>
        </div>
      </div>
    );
  }

  if (showInfo) {
    return (
      <div className="game4-container">
        <div className="game4-content">
          <div className="info-section">
            <h2 className="info-title">Fantastiskt!</h2>
            
            <div className="info-text">
              <p>
                Du har visat god kunskap om trafiksäkerhet. Varje år skadas och dör människor i trafiken på grund av misstag som kunde undvikas. 
                Genom att följa säkerhetsrutiner, anpassa hastigheten och vara uppmärksam räddar du liv - både ditt eget och andras.
              </p>
              <p>
                På Trafikverket arbetar vi kontinuerligt med att förbättra trafiksäkerheten genom utbildning, infrastruktur och smarta IT-lösningar. 
                Varje decision vi tar i vårt arbete kan bidra till att göra Sveriges vägar och järnvägar säkrare för alla.
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

  const currentStage = stages[stage];

  return (
    <div className="game4-container">
      <div className="game4-content">
        <div className="progress-bar">
          {stages.map((_, index) => (
            <div 
              key={index} 
              className={`progress-dot ${index <= stage ? 'completed' : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <h1 className="game4-title">{currentStage.title}</h1>
        <div className="story-text">
          <p>{currentStage.description}</p>
        </div>

        {errorMessage && (
          <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            <p className="feedback-text">{errorMessage}</p>
            {showNextButton ? (
              <button className="retry-button" onClick={handleNext}>
                Nästa scenario
              </button>
            ) : (
              <button className="retry-button" onClick={handleRetry}>
                Försök igen
              </button>
            )}
          </div>
        )}

        {!errorMessage && (
          <div className="choices">
            {currentStage.options.map((option, index) => (
              <button
                key={index}
                className="choice-button"
                onClick={() => handleChoice(option)}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
