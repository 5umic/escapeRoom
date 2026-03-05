// Selection page for difficulty level
import React, { useState } from 'react';
import './SelectPage.css';
import GymnasiumWelcomePage from './GymnasiumWelcomePage.jsx';
import HogskolaWelcomePage from './HogskolaWelcomePage.jsx';

export default function SelectPage() {
  const [selectedLevel, setSelectedLevel] = useState(null);

  if (selectedLevel === 'gymnasium') {
    return <GymnasiumWelcomePage />;
  }

  if (selectedLevel === 'hogskola') {
    return <HogskolaWelcomePage />;
  }

  return (
    <div className="select-container">
      <div className="select-content">
        <img 
          src="/assets/images/backgrounds/TV_logo_Master_Horisontal_RGB.png" 
          alt="Trafikverket Logo" 
          className="select-logo"
        />
        
        <div className="escape-room-text">Escape Room</div>
        
        <h1 className="select-title">Välj</h1>
        
        <div className="select-button-container">
          <button 
            className="select-button"
            onClick={() => setSelectedLevel('gymnasium')}
          >
            Gymnasium
          </button>
          <button 
            className="select-button"
            onClick={() => setSelectedLevel('hogskola')}
          >
            Högskola
          </button>
        </div>
      </div>
    </div>
  );
}
