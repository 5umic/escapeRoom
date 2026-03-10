// Fil: src/pages/SelectPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./SelectPage.css"; // Importerar din CSS

export default function SelectPage() {
  const navigate = useNavigate();

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
          {/* Knapp för Gymnasium -> Går till /gymnasium */}
          <button
            className="select-button"
            onClick={() => navigate("/gymnasium")}
          >
            Gymnasium
          </button>

          {/* Knapp för Högskola -> Går till /hogskola */}
          <button
            className="select-button"
            onClick={() => navigate("/hogskola")}
          >
            Högskola
          </button>
        </div>
      </div>
    </div>
  );
}
