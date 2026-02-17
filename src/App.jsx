import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Importera dina sidor
import SelectPage from "./pages/SelectPage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx"; // Den nya delade sidan
import Game1 from "./minigames/gymnasiumGames/Game1.jsx";
import Game2 from "./minigames/gymnasiumGames/Game2.jsx"; // När du skapat denna
import Game3 from "./minigames/gymnasiumGames/Game3.jsx"; // När du skapat denna

function App() {
  return (
    <Routes>
      {/* 1. Startsidan: Välj nivå */}
      <Route path="/" element={<SelectPage />} />

      {/* 2. Gymnasium-flödet */}
      <Route
        path="/gymnasium"
        element={
          <WelcomePage
            title="Välkommen - Gymnasium"
            nextPath="/gymnasium/Game1"
          />
        }
      />
      <Route path="/gymnasium/Game1" element={<Game1 />} />
      <Route path="/gymnasium/Game2" element={<Game2 />} />
      <Route path="/gymnasium/Game3" element={<Game3 />} />

      {/* 3. Högskola-flödet (återanvänder samma komponent!) */}
      <Route
        path="/hogskola"
        element={
          <WelcomePage
            title="Välkommen - Högskola"
            nextPath="/hogskolaGames/Game1"
          />
        }
      />

      {/* Fallback om någon skriver fel länk */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
