

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
        { text: "Går direkt in i bilen, det regnar ju", correct: false, feedback: "Nja, vi uppskattar din motivation att hålla dig torr... men tänk om det står en katt bakom bilen som också försöker hålla sig torr? Kolla runt bilen först, även när det öser ner." },
        { text: "Kollar mobilen medan du går till bilen", correct: false, feedback: "Okej, vi förstår - TikTok är viktigt. Men säg det till den bil som nästan kör på dig på parkeringen... Ögonen på omgivningen tack!" }
      ]
    },
    {
      title: "I bilen",
      description: "Du sitter nu i förarsätet. Bilen är kall och rutorna är immiga. Vad är det allra första du gör?",
      options: [
        { text: "Startar motorn så att det blir varmt", correct: false, feedback: "Ahhh, mysigt och varmt... tills du flyger genom vindrutan! Bältet FÖRST, även om fingrarna fryser. Det är inte lika mysigt som uppvärmda säten, men betydligt säkrare." },
        { text: "Sätter på säkerhetsbältet", correct: true, feedback: "Rätt! Säkerhetsbältet ska ALLTID vara det första. Gör det till en vana att sätta på bältet direkt när du sätter dig - innan du startar, innan du kollar mobilen, innan allt annat." },
        { text: "Kollar mobilen för att se navigationsinstruktioner", correct: false, feedback: "GPS:en kan vänta 5 sekunder, ditt liv kan inte! Bältet på FÖRST, sedan kan du ta reda på var du ska. Förresten, visste du att airbagen kan skada dig allvarligt om du inte har bälte?" }
      ]
    },
    {
      title: "Starta färden",
      description: "Motorn är igång och rutorna börjar klarna. Du ser att det regnar kraftigt. Vad gör du innan du backar ut?",
      options: [
        { text: "Backar ut försiktigt med backspegeln", correct: false, feedback: "'Försiktigt' är ett fint ord, men döda vinklar heter inte döda utan anledning... I regn och mörker är särskilt små barn och djur betydligt svårare att se. Kolla ALLT innan du backar!" },
        { text: "Kontrollerar alla speglar, döda vinklar, och väntar tills rutorna är helt klara", correct: true, feedback: "Rätt! I dåliga väderförhållanden är det extra viktigt med god sikt och att dubbelkolla döda vinklar." },
        { text: "Sätter på musiken och backar ut", correct: false, feedback: "Party time! Förutom att... jo, det där lilla ljudet du inte hörde över musiken? Det var en cyklist som försökte varna dig. Musik efter säkerheten är klar, tack!" }
      ]
    },
    {
      title: "På vägen",
      description: "Du är nu ute på vägen. Regnet öser ner, sikten är dålig och vägbanan är våt och hal. Det är mörklagt och du kör bakom en annan bil. Hur kör du?",
      options: [
        { text: "Kör i normal hastighet, vill komma hem fort", correct: false, feedback: "Snabbt hem låter najs... sjukhuset är också en destination tekniskt sett. Våt asfalt + normal hastighet = längre bromssträcka än du tror. Sakta ner lite, soffolocket väntar." },
        { text: "Sänker hastigheten, ökar avståndet till bilen framför, tänder helljus för bättre sikt", correct: false, feedback: "Nästan perfekt! Förutom helljus-grejen... Föraren framför dig ser nu ingenting i backspegeln utom dina strålkastare. Halvljus är din vän här!" },
        { text: "Sänker hastigheten, ökar avståndet till framförvarande, använder halvljus", correct: true, feedback: "Rätt! Anpassad hastighet, ökat avstånd och halvljus är avgörande. Använd ALDRIG helljus bakom andra fordon - det bländar dem i backspegeln." },
        { text: "Kör tätt bakom bilen framför för bättre sikt", correct: false, feedback: "Ah, klassisk taktik! Problemet är att när föraren framför bromsar så... PANG! Våt väg = längre bromssträcka. Du vill inte pussas med bakljuset på bilen framför, eller?" }
      ]
    },
    {
      title: "Nästan hemma",
      description: "Du kör på sista biten hem. Plötsligt piper telefonen - du får en notifikation. Samtidigt känner du att den vibrerar i fickan. Vad gör du?",
      options: [
        { text: "Tar snabbt upp telefonen och kollar meddelandet", correct: false, feedback: "'Snabbt' är relativ tid... På den sekunden du kollar telefonen hinner du köra 14 meter blint. Det är längre än en buss! Om det är så viktigt kan de ringa ambulansen åt dig efter olyckan." },
        { text: "Tittar snabbt på skärmen utan att röra telefonen", correct: false, feedback: "Smart tänkt! Ingen hands-free brott här... men dina ögon är fortfarande inte på vägen. 14 meter blind-körning är ganska mycket. Spoiler alert: meddelandet är en reklam för pizzeria." },
        { text: "Ignorerar telefonen helt tills du har stannat och parkerat", correct: true, feedback: "Rätt! Inget meddelande är viktigare än din säkerhet. Vänta alltid tills du har stannat säkert innan du använder telefonen. Du har klarat resan säkert!" },
        { text: "Svarar med röstkommando", correct: false, feedback: "Ahh, teknologi! Men din hjärna är fortfarande upptagen med samtalet istället för trafiken. Det är som att försöka rubiks kub samtidigt som du spelar schack. Kan det vänta 2 minuter?" }
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
