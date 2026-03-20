import React, { useState, useEffect } from 'react';
import './Game5.css';
import Game6 from './Game6.jsx';
import PostGameInfo from './components/PostGameInfo.jsx';

const FALLBACK_INFO = {
  heading: 'UTMÄRKT!',
  paragraphs: [
    'Varje symbol i detta memory-spel representerar en viktig del av vårt transportsystem. Från bilar och bussar till tåg och järnvägar - allt är sammankopplat i ett komplext nätverk som Trafikverket ansvarar för att planera, bygga och underhålla.',
    'Trafikmärken och vägskyltar är centrala för trafiksäkerheten. De kommunicerar snabbt och tydligt med alla trafikanter, oavsett språk. Att förstå och respektera dessa symboler är avgörande för ett säkert transportsystem.',
    'Som IT-specialist på Trafikverket kan du arbeta med digitala lösningar för allt från trafikstyrning och vägväder till reseinformation och järnvägssignaler. Våra system hanterar miljontals datapunkter varje dag för att hålla Sverige i rörelse.',
  ],
};

export default function Game5() {

  const emojis = ['🚗', '🚌', '🚂', '🚦', '⛔', '🛑', '🚧', '🛤️', '⚠️'];
  
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNextGame, setShowNextGame] = useState(false);
  const [canFlip, setCanFlip] = useState(true);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (matchedCards.length === 18 && matchedCards.length > 0) {
      setIsComplete(true);
    }
  }, [matchedCards]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setCanFlip(false);
      const [first, second] = flippedCards;
      
      if (cards[first] === cards[second]) {
        // kollar om match
        setMatchedCards([...matchedCards, first, second]);
        setFlippedCards([]);
        setCanFlip(true);
      } else {
        // ingen match
        setTimeout(() => {
          setFlippedCards([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  }, [flippedCards]);

  const initializeGame = () => {
    const cardPairs = [...emojis, ...emojis];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
    setIsComplete(false);
  };

  const handleCardClick = (index) => {
    if (!canFlip) return;
    if (flippedCards.includes(index)) return;
    if (matchedCards.includes(index)) return;
    if (isComplete) return;
    
    setFlippedCards([...flippedCards, index]);
  };

  const isCardFlipped = (index) => {
    return flippedCards.includes(index) || matchedCards.includes(index);
  };

  if (showNextGame) {
    return <Game6 />;
  }

  if (showSuccess) {
    return (
      <div className="game6-success">
        <div className="success-content">
          <h2>FANTASTISKT!</h2>
          <p className="reward-word">
            <span className="reward-label"></span> <strong>BRA JOBBAT!</strong>          </p>
          <button 
            className="continue-button" 
            onClick={() => setShowNextGame(true)}
          >
            Fortsätt
          </button>
        </div>
      </div>
    );
  }

  if (showInfo) {
    return (
      <div className="game6-container">
        <div className="game6-content">
          <div className="info-section">
            <PostGameInfo
              gameKey="game5"
              fallbackHeading={FALLBACK_INFO.heading}
              fallbackParagraphs={FALLBACK_INFO.paragraphs}
              onContinue={() => setShowSuccess(true)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game6-container">
      <div className="game6-content">
        <h1 className="game6-title">Memory - Trafiktema</h1>
        <p className="game6-instructions">
          Hitta alla matchande par! Klicka på korten för att vända dem.
        </p>

        <div className="memory-grid">
          {cards.map((emoji, index) => {
            const flipped = isCardFlipped(index);
            const matched = matchedCards.includes(index);
            
            return (
              <div
                key={index}
                className={`memory-card ${flipped ? 'flipped' : ''} ${matched ? 'matched' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-inner">

                  <div className="card-back">
                    <div className="logo-small"></div>
                  </div>

                  <div className="card-front">
                    <span className="emoji">{emoji}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="completion-message">
            <p>Grattis! Du hittade alla par!</p>
            <button className="continue-button" onClick={() => setShowInfo(true)}>
              Gå vidare
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
