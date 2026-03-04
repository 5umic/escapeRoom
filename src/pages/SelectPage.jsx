// Fil: src/pages/SelectPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./SelectPage.css"; // Importerar din CSS

export default function SelectPage() {
  const navigate = useNavigate();

  return (
    <div className="select-container">
      <div className="select-content">
        {/* Valfritt: Lägg in loggan här om du vill, annars bara titeln */}
        <h1 className="select-title">Välj din nivå</h1>

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
