import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Game2 from "./Game2.jsx";
const API_BASE = "http://localhost:5261";

export default function Game1() {
  const [gameID, setGameID] = useState(null);
  const [challenge, setChallenge] = useState(null);

  // Statusar: 'loading', 'playing', 'success', 'fail_time', 'fail_wrong'
  const [status, setStatus] = useState("loading");

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);

  const navigate = useNavigate();

  const nextGame = () => {
    navigate("/gymnasium/Game2");
  };

  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        if (games && games.length > 0) {
          setGameID(games[0].id);
        }
      } catch (err) {
        console.error("Kunde inte hämta spel:", err);
      }
    })();
  }, []);

  // 2. Hämta fråga
  const fetchRandomChallenge = async () => {
    if (!gameID) return;
    setStatus("loading");
    setChallenge(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/games/${gameID}/challenges/random`,
      );
      if (!res.ok) {
        console.error("Inga frågor hittades");
        return;
      }
      const data = await res.json();

      setChallenge(data);

      // Sätt tiden (default 20s om det saknas)
      const limit = data.timeLimitSeconds || 20;
      setTotalTimeLimit(limit);
      setSecondsLeft(limit);
      setStatus("playing");
    } catch (err) {
      console.error(err);
    }
  };

  // Körs när vi har ett GameID
  useEffect(() => {
    if (gameID) fetchRandomChallenge();
  }, [gameID]);

  // 3. Timer
  useEffect(() => {
    if (status !== "playing") return;
    if (secondsLeft <= 0) {
      setStatus("fail_time");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status]);

  // 4. Hantera svar
  const onPick = (index) => {
    if (status !== "playing") return;

    // Jämför index med det vi fick från Backend
    if (index === challenge.correctOptionIndex) {
      // RÄTT SVAR
      const spent = totalTimeLimit - secondsLeft;
      setTimeTaken(spent);

      // Spara totaltid i sessionen
      const currentTotal = Number(sessionStorage.getItem("totalGameTime") || 0);
      sessionStorage.setItem("totalGameTime", currentTotal + spent);

      setStatus("success");
    } else {
      // FEL SVAR
      setStatus("fail_wrong");
    }
  };

  // --- RENDERING ---

  if (!challenge) return <div style={styles.container}>Laddar...</div>;

  // SCENARIO: RÄTT SVAR
  if (status === "success") {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, border: "5px solid #2ea44f" }}>
          <h1 style={{ color: "#2ea44f" }}>RÄTT SVAR!</h1>
          <p style={{ fontSize: 20 }}>
            Du klarade det på <strong>{timeTaken} sekunder</strong>.
          </p>
          <button onClick={nextGame} style={styles.btnSuccess}>
            Nästa spel
          </button>
        </div>
      </div>
    );
  }

  // SCENARIO: TIDEN SLUT
  if (status === "fail_time") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={{ color: "#b10000" }}>Tiden är ute!</h1>
          <button onClick={fetchRandomChallenge} style={styles.btnRetry}>
            Få en ny fråga
          </button>
        </div>
      </div>
    );
  }

  // SCENARIO: FEL SVAR (Försök igen)
  if (status === "fail_wrong") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={{ color: "#b10000" }}>Fel svar!</h1>
          <p>Det var inte rätt alternativ.</p>
          <button onClick={() => setStatus("playing")} style={styles.btnRetry}>
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  // SCENARIO: SPELAR
  return (
    <div style={styles.container}>
      <div
        style={{
          width: "min(800px, 90vw)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Timer bubbla */}
        <div style={styles.timer}>{secondsLeft}s</div>

        <h2>Trafikverket</h2>

        {challenge.imageUrl && (
          <img src={challenge.imageUrl} alt="Clue" style={styles.image} />
        )}

        <p style={styles.question}>{challenge.prompt}</p>

        <div style={styles.grid}>
          {challenge.options.map((opt, i) => (
            <button key={i} onClick={() => onPick(i)} style={styles.optionBtn}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Enkel styling
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#b10000",
    color: "white",
    fontFamily: "sans-serif",
  },
  card: {
    background: "white",
    padding: 40,
    borderRadius: 15,
    textAlign: "center",
    color: "#333",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  timer: {
    position: "absolute",
    top: -50,
    left: 0,
    background: "#fff6b0",
    color: "#000",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 24,
  },
  image: {
    maxWidth: "200px",
    borderRadius: 10,
    margin: "10px 0",
  },
  question: {
    fontSize: 22,
    fontWeight: "bold",
    margin: "20px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 15,
  },
  optionBtn: {
    padding: 20,
    fontSize: 18,
    cursor: "pointer",
    borderRadius: 8,
    border: "none",
    fontWeight: "bold",
    color: "#b10000",
  },
  btnSuccess: {
    marginTop: 20,
    padding: "15px 30px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    cursor: "pointer",
  },
  btnRetry: {
    marginTop: 20,
    padding: "15px 30px",
    background: "#b10000",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    cursor: "pointer",
  },
};
