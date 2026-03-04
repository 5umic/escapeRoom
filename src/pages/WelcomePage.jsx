import React from "react";
import { useNavigate } from "react-router-dom";
import "./SharedWelcomePage.css"; // Behåll din CSS
import TypewriterText from "../components/TypewriterText.jsx";

export default function WelcomePage({ nextPath, title }) {
  const navigate = useNavigate();

  return (
    <div className="welcome-page-container">
      <div className="welcome-page-content">
        <img
          src="/assets/images/backgrounds/TV_logo_Master_Horisontal_RGB.png"
          alt="Trafikverket Logo"
          className="welcome-page-logo"
        />

        <div className="welcome-page-text-container">
          <h1 className="welcome-page-title">
            {title || "Välkommen till Trafikverket Escape Room!"}
          </h1>

          <div className="welcome-page-description">
            <TypewriterText
              text={`I detta digitala escape room kommer du att lösa spännande mini-spel som representerar Trafikverkets värderingar och arbete. Varje spel du klarar belönar dig med ett ord.
                \n\nNär du har klarat alla spel kommer du använda orden för att bygga en mening. 
                \n\nUpplev hur planering, säkerhet och samarbete formar framtidens infrastruktur!`}
              speed={30}
            />
          </div>
        </div>

        <div className="welcome-page-button-container">
          <button
            className="welcome-page-button"
            onClick={() => navigate(nextPath)} // <--- HÄR BYTER VI URL
          >
            Börja
          </button>
        </div>
      </div>
    </div>
  );
}
