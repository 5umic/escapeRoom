// Welcome page for Högskola level
import React, { useState } from 'react';
import './SharedWelcomePage.css';
import TypewriterText from '../components/TypewriterText.jsx';
import Game1 from '../minigames/Game1.jsx';


export default function HogskolaWelcomePage() {
  const [startGame, setStartGame] = useState(false);

  if (startGame) {
    return <Game1 />;
  }
  return (
    <div className="welcome-page-container">
      <div className="welcome-page-content">
        <img 
          src="/assets/images/backgrounds/TV_logo_Master_Horisontal_RGB.png" 
          alt="Trafikverket Logo" 
          className="welcome-page-logo"
        />
        
        <div className="welcome-page-text-container">
          <h1 className="welcome-page-title">Välkommen till Trafikverket Escape Room!</h1>
          
          <p className="welcome-page-description">
            <TypewriterText 
              text={`I detta digitala escape room kommer du att lösa 6-7 spännande mini-spel som representerar Trafikverkets värderingar och arbete. Varje spel du klarar belönar dig med ett ord som du kommer behöva mot slutet av spelet.
                \nNär du har klarat alla spel kommer du använda orden som du har samlat för att bygga en mening som speglar Trafikverkets uppdrag. 
                \nUpplev hur planering, säkerhet och samarbete formar framtidens infrastruktur!`}
              speed={30}
            />
          </p>

        </div>

        <div className="welcome-page-button-container">
          <button className="welcome-page-button" onClick={() => setStartGame(true)}>
            Starta
          </button>
        </div>
      </div>
    </div>
  );
}
