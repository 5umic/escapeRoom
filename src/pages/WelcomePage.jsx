// Entry point, difficulty selection
import React from 'react';
import './WelcomePage.css';

export default function WelcomePage() {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <img 
          src="/assets/images/backgrounds/TV_logo_Master_Horisontal_RGB.png" 
          alt="Trafikverket Logo" 
          className="welcome-logo"
        />
        
        <div className="welcome-text-container">
          <h1 className="welcome-title">Välkommen till Trafikverket Escape Room!</h1>
          
          <p className="welcome-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. I detta digitala escape room 
            kommer du att lösa 6-7 spännande mini-spel som representerar Trafikverkets värderingar 
            och arbete. Varje spel du klarar belönar dig med ett ord.
          </p>
          
          <p className="welcome-description">
            När du har klarat alla spel kommer dina ord att samlas till en meningsfull mening 
            som speglar Trafikverkets uppdrag. Upplev hur planering, säkerhet och samarbete 
            formar framtidens infrastruktur!
          </p>
          
          <p className="welcome-description">
            Välj din svårighetsgrad för att börja din resa:
          </p>
        </div>

        <div className="welcome-button-container">
          <button className="welcome-button">
            Gymnasium
          </button>
          <button className="welcome-button">
            Högskola
          </button>
        </div>
      </div>
    </div>
  );
}
