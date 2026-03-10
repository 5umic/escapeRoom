import React from "react";
import { Routes, Route, Navigate, Router } from "react-router-dom";

// Importera dina sidor
import SelectPage from "./pages/SelectPage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import Game1 from "./minigames/gymnasiumGames/Game1.jsx";
import Game2 from "./minigames/gymnasiumGames/Game2.jsx";
import Game3 from "./minigames/gymnasiumGames/Game3.jsx";
import Game4 from "./minigames/gymnasiumGames/Game4.jsx";
import Game5 from "./minigames/gymnasiumGames/Game5.jsx";
import Game6 from "./minigames/gymnasiumGames/Game6.jsx";
import Game7 from "./minigames/gymnasiumGames/Game7.jsx";
import StartScreen from "./minigames/gymnasiumGames/StartScreen.jsx";
import Leaderboard from "./minigames/gymnasiumGames/Leaderboard.jsx";
import AdminLeaderboard from "./admin/AdminLeaderboard.jsx";

// Högskola games import
import HogskolaGame1 from "./minigames/hogskolaGames/Game1.jsx";
import HogskolaGame2 from "./minigames/hogskolaGames/Game2.jsx";
import HogskolaGame3 from "./minigames/hogskolaGames/Game3.jsx";
import HogskolaGame4 from "./minigames/hogskolaGames/Game4.jsx";
import HogskolaGame5 from "./minigames/hogskolaGames/Game5.jsx";
import HogskolaGame6 from "./minigames/hogskolaGames/Game6.jsx";
import HogskolaGame7 from "./minigames/hogskolaGames/Game7.jsx";

// Admin imports
import AdminDashboard from "./admin/AdminDashboard.jsx";
import EditChallenge from "./admin/EditChallenge.jsx";

function App() {
  return (
    <Routes>
      {/* 1. Startsidan: Välj nivå */}
      <Route path="/" element={<SelectPage />} />

      {/* Admin-rutter */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
      <Route path="/admin/EditChallenge/:gameId" element={<EditChallenge />} />

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

      <Route path="/gymnasium/" element={<StartScreen />} />
      <Route path="/gymnasium/leaderboard" element={<Leaderboard />} />

      <Route path="/gymnasium/TrafikverketGymnasium" element={<Game1 />} />
      <Route path="/gymnasium/RiskSäkerhetGame2" element={<Game2 />} />
      <Route path="/gymnasium/DigitalSäkerhetGame3" element={<Game3 />} />
      <Route path="/gymnasium/PixeljaktenGame4" element={<Game4 />} />
      <Route path="/gymnasium/SorteraRättGame5" element={<Game5 />} />
      <Route path="/gymnasium/BildaOrdetGame6" element={<Game6 />} />
      <Route path="/gymnasium/HängaGubbeGame7" element={<Game7 />} />

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

      {/* Högskola games routes */}
      <Route path="/hogskolaGames/Game1" element={<HogskolaGame1 />} />
      <Route path="/hogskolaGames/Game2" element={<HogskolaGame2 />} />
      <Route path="/hogskolaGames/Game3" element={<HogskolaGame3 />} />
      <Route path="/hogskolaGames/Game4" element={<HogskolaGame4 />} />
      <Route path="/hogskolaGames/Game5" element={<HogskolaGame5 />} />
      <Route path="/hogskolaGames/Game6" element={<HogskolaGame6 />} />
      <Route path="/hogskolaGames/Game7" element={<HogskolaGame7 />} />

      {/* Fallback om någon skriver fel länk */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
