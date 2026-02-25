import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StartScreen() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  const handleStart = (e) => {
    e.preventDefault(); // Förhindrar att sidan laddas om

    // Enkel validering så de inte bara trycker "Starta" direkt
    if (playerName.trim().length < 2) {
      setError("Ditt namn måste vara minst 2 bokstäver långt!");
      return;
    }

    // 1. Spara namnet i sessionen
    sessionStorage.setItem("playerName", playerName.trim());

    // 2. NOLLSTÄLL tiden! (Jätteviktigt så de inte har kvar tid från tidigare försök)
    sessionStorage.setItem("totalGameTime", "0");

    // 3. Skicka spelaren till första spelet
    navigate("/gymnasium/game1");
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Välkommen till Escape Room</h1>
        <p style={styles.description}>
          Systemet är låst. För att ta dig vidare måste du klara av 7 stycken
          utmaningar och pussel. Varje felsteg kommer ge dig straffsekunder, så
          tänk dig för innan du svarar!
        </p>

        <form onSubmit={handleStart} style={styles.form}>
          <label style={styles.label} htmlFor="playerName">
            Ange ditt namn för att börja:
          </label>

          <input
            id="playerName"
            type="text"
            placeholder="T.ex. Hackerman eller Anna..."
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError(""); // Ta bort felmeddelandet när de börjar skriva
            }}
            style={styles.input}
            autoComplete="off"
            autoFocus
          />

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.startBtn}>
            Börja Hacka 🚀
          </button>
        </form>

        {/* Länk till Leaderboard (Vi bygger denna sida strax!) */}
        <button
          onClick={() => navigate("/gymnasium/leaderboard")}
          style={styles.leaderboardBtn}
        >
          🏆 Visa Leaderboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#b10000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "sans-serif",
    color: "#333",
  },
  content: {
    width: "100%",
    maxWidth: "500px",
    background: "white",
    padding: "40px 30px",
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  title: { color: "#b10000", marginBottom: "15px", fontSize: "28px" },
  description: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#555",
    marginBottom: "30px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
  },
  label: { fontWeight: "bold", fontSize: "18px" },
  input: {
    width: "100%",
    padding: "15px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "2px solid #ccc",
    textAlign: "center",
    outline: "none",
  },
  errorText: { color: "#c62828", fontWeight: "bold", margin: "0" },

  startBtn: {
    width: "100%",
    padding: "15px",
    fontSize: "20px",
    fontWeight: "bold",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.2s",
    marginTop: "10px",
  },
  leaderboardBtn: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    background: "#f3f3f3",
    color: "#333",
    border: "2px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
  },
};
