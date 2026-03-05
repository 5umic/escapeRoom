  // Security Hunt Game - Find the Hidden Code
import React, { useState } from 'react';
import './Game2.css';
import Game3 from './Game3.jsx';

export default function Game2() {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGame3, setShowGame3] = useState(false);
  const [hint, setHint] = useState('');
  const [revealedHints, setRevealedHints] = useState([false, false, false, false]);

  const correctCode = "SÄKERHET";

  const toggleHint = (index) => {
    setRevealedHints(prev => {
      const newRevealed = [...prev];
      newRevealed[index] = !newRevealed[index];
      return newRevealed;
    });
  };

  const handleSecurityCheck = () => {
    console.log('%cSäkerhetssystem aktiverat', 'color: #d70000; font-size: 16px; font-weight: bold;');
    console.log('%cSystemkod: SÄK', 'color: #a65050; font-size: 14px;');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.toUpperCase() === correctCode) {
      setIsCorrect(true);
      setTimeout(() => {
        setShowInfo(true);
      }, 500);
    } else {
      setHint('Fel kod. Försök igen! Tips: Tryck på knappen och kolla i konsolen.');
    }
  };

  if (showGame3) {
    return <Game3 />;
  }

  if (showSuccess) {
    return (
      <div className="game2-success">
        <div className="success-content">
          <h2>Rätt svar!</h2>
          <p className="reward-word">
            <span className="reward-label"></span> <strong>BRA JOBBAT!</strong>
          </p>
          <button className="continue-button" onClick={() => setShowGame3(true)}>Fortsätt</button>
        </div>
      </div>
    );
  }

  if (showInfo) {
    return (
      <div className="game2-container">
        <div className="game2-content">
          <div className="info-section">
            <h2 className="info-title">SUPER BRA!</h2>
            
            <div className="info-text">
              <p>
                Säkerhet är en central del av Trafikverkets IT-verksamhet. Varje dag arbetar vi med att skydda känslig information och säkerställa att våra system är robusta mot hot.
              </p>
              <p>
                Genom att använda webbläsarens utvecklarverktyg kan du inspektera hur webbsidor fungerar "bakom kulisserna". Detta är viktiga verktyg för utvecklare, men också för att förstå säkerhetsaspekter. Att kunna granska nätverkstrafik, läsa konsolmeddelanden och inspektera källkod är grundläggande färdigheter inom säker webbutveckling.
              </p>
              <p>
                På Trafikverket använder vi dessa verktyg dagligen för att säkerställa att vår kod är säker och att inga känsliga uppgifter exponeras oavsiktligt.
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
    <div className="game2-container">
      <div className="game2-content">
        <h1 className="game2-title">Säkerhetsjakt</h1>
        <p className="game2-instructions">
          Vi på Trafikverket satsar mycket på säkerhet, det är viktigt för oss att man ska vara medveten om säkerhetsfrågor, samt utveckla säker kod.
        </p>

        <div className="security-panel">
            <h2 className="panel-title">Säkerhetskontroll</h2>
          <p className="panel-description">
            Hitta den dolda säkerhetskoden genom att använda webbläsarens inspektör.
          </p>
                    <p className="panel-description">
            Tips: du kan använda ledtrådarna där nere!
          </p>

          <button onClick={handleSecurityCheck} className="test-button">
            Inled säkerhetskontroll
          </button>

          <form onSubmit={handleSubmit} className="code-form">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="_ _ _ _ _ _ _ _"
              className="code-input"
            />
            <button type="submit" className="submit-button">
              Verifiera
            </button>
          </form>

          {hint && <p className="hint-message">{hint}</p>}

          {isCorrect && (
            <div className="success-message">
              Säkerhetskoden verifierad!
            </div>
          )}
        </div>

        <div className="hints-container">
          <h3>Ledtrådar:</h3>
          <ul className="hints-list">
            <li 
              className={revealedHints[0] ? 'revealed' : 'obscured'}
              onClick={() => toggleHint(0)}
            >
              <span className="hint-text">Tryck på "Kör säkerhetskontroll" knappen</span>
              {!revealedHints[0] && <span className="hint-label">1.</span>}
            </li>
            <li 
              className={revealedHints[1] ? 'revealed' : 'obscured'}
              onClick={() => toggleHint(1)}
            >
              <span className="hint-text">När du har gjort det, högerklicka sidan och tryck "inspect"</span>
              {!revealedHints[1] && <span className="hint-label">2.</span>}
            </li>
            <li 
              className={revealedHints[2] ? 'revealed' : 'obscured'}
              onClick={() => toggleHint(2)}
            >
              <span className="hint-text">Kolla i Console-fliken efter meddelanden samt granska HTML koden, öppna DIV:arna</span>
              {!revealedHints[2] && <span className="hint-label">3.</span>}
            </li>
            <li 
              className={revealedHints[3] ? 'revealed' : 'obscured'}
              onClick={() => toggleHint(3)}
            >
              <span className="hint-text">Kombinera de delar du hittar</span>
              {!revealedHints[3] && <span className="hint-label">4.</span>}
            </li>
          </ul>
        </div>
        <span className="SYSTEMKOD">ERHET</span>
      </div>
    </div>
  );
}
