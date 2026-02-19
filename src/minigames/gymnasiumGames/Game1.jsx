import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function Game1() {
  const navigate = useNavigate();

  const [gameID, setGameID] = useState(null);
  const [challenge, setChallenge] = useState(null);

  // Status: 'loading', 'playing', 'answered_correctly', 'answered_wrong', 'time_out'
  const [status, setStatus] = useState("loading");

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);

  // Håller koll på tiden och val
  const [timeTaken, setTimeTaken] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

  // 1. Hämta Game ID
  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();

        // ÄNDRING HÄR: Vi letar efter "Trafikverket" eftersom spelet heter "Trafikverket (Gymnasium)"
        // Vi tar också bort "|| games[0]" så att vi inte laddar fel spel av misstag.
        const g1 = games.find((g) => g.title.includes("Trafikverket"));

        if (g1) {
          setGameID(g1.id);
        } else {
          console.error("Kunde inte hitta spelet 'Trafikverket'!");
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
    setSelectedOptionIndex(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/games/${gameID}/challenges/random`,
      );
      if (!res.ok) return;

      const data = await res.json();
      setChallenge(data);

      const limit = data.timeLimitSeconds || 20;
      setTotalTimeLimit(limit);
      setSecondsLeft(limit);
      setStatus("playing");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (gameID) fetchRandomChallenge();
  }, [gameID]);

  // 3. Timer
  useEffect(() => {
    // Stoppa klockan om man svarat rätt eller tiden är ute
    if (status === "answered_correctly" || status === "time_out") return;

    if (secondsLeft <= 0) {
      setStatus("time_out");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status]);

  // 4. Hantera svar
  const onPick = (index) => {
    if (status === "answered_correctly" || status === "time_out") return;

    setSelectedOptionIndex(index);

    if (index === challenge.correctOptionIndex) {
      // --- RÄTT SVAR ---

      // 1. Räkna ut tiden för just detta spel
      const spent = totalTimeLimit - secondsLeft;
      setTimeTaken(spent);

      // 2. Uppdatera totaltiden i sessionen
      const currentTotal = Number(sessionStorage.getItem("totalGameTime") || 0);
      const newTotal = currentTotal + spent;
      sessionStorage.setItem("totalGameTime", newTotal);

      setStatus("answered_correctly");
    } else {
      // --- FEL SVAR ---
      setStatus("answered_wrong");
    }
  };

  // --- RENDERING ---

  if (!challenge || status === "loading") {
    return <div style={styles.container}>Laddar fråga...</div>;
  }

  return (
    <div style={styles.container}>
      <div
        style={{
          width: "min(800px, 90vw)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Timer */}
        <div style={styles.timer}>{secondsLeft}s</div>

        <h2>Trafikverket</h2>

        {challenge.imageUrl && (
          <img
            src={challenge.imageUrl}
            alt="Clue"
            style={styles.image}
            onError={(e) => (e.target.style.display = "none")}
          />
        )}

        <p style={styles.question}>{challenge.prompt}</p>

        {/* --- KNAPPAR --- */}
        <div style={styles.grid}>
          {challenge.options.map((opt, index) => {
            let btnStyle = { ...styles.optionBtn };

            // Färgkodning baserat på status
            if (index === selectedOptionIndex) {
              if (status === "answered_correctly") {
                btnStyle.backgroundColor = "#2ea44f"; // Grön
                btnStyle.color = "white";
                btnStyle.border = "2px solid #207a38";
              } else if (status === "answered_wrong") {
                btnStyle.backgroundColor = "#c62828"; // Röd
                btnStyle.color = "white";
                btnStyle.border = "2px solid #8e1c1c";
              }
            }

            return (
              <button
                key={index}
                onClick={() => onPick(index)}
                style={btnStyle}
                disabled={
                  status === "answered_correctly" || status === "time_out"
                }
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* --- FEEDBACK-RUTOR --- */}

        {/* SCENARIO: RÄTT SVAR (Med tider) */}
        {status === "answered_correctly" && (
          <div style={styles.feedbackBoxSuccess}>
            <h3>Rätt svar! ✅</h3>
            <p>Snyggt jobbat!</p>

            {/* HÄR VISAS TIDERNA */}
            <div style={styles.timeInfoBox}>
              <p>
                ⏱️ Tid för denna fråga: <strong>{timeTaken} sekunder</strong>
              </p>
              <p>
                📊 Total tid hittills:{" "}
                <strong>
                  {sessionStorage.getItem("totalGameTime")} sekunder
                </strong>
              </p>
            </div>

            <button
              onClick={() => navigate("/gymnasium/game2")}
              style={styles.btnNext}
            >
              Gå vidare till nästa spel (Risk & Säkerhet)
            </button>
          </div>
        )}

        {/* SCENARIO: FEL SVAR */}
        {status === "answered_wrong" && (
          <div style={styles.feedbackBoxError}>
            <h3>Fel svar ❌</h3>
            <p>Det där var inte riktigt rätt. Försök igen!</p>
          </div>
        )}

        {/* SCENARIO: TIDEN UTE */}
        {status === "time_out" && (
          <div style={styles.feedbackBoxError}>
            <h3>Tiden är ute! ⏱️</h3>
            <button
              onClick={() => {
                setSecondsLeft(totalTimeLimit);
                setStatus("playing");
                setSelectedOptionIndex(null);
              }}
              style={styles.btnRetry}
            >
              Försök igen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#b10000",
    color: "white",
    fontFamily: "sans-serif",
    paddingBottom: "50px",
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
    maxHeight: "200px",
    borderRadius: 10,
    margin: "10px 0",
    objectFit: "contain",
    backgroundColor: "white",
    padding: "5px",
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
    marginBottom: 20,
  },
  optionBtn: {
    padding: 20,
    fontSize: 18,
    cursor: "pointer",
    borderRadius: 8,
    border: "2px solid transparent",
    fontWeight: "bold",
    color: "#b10000",
    backgroundColor: "white",
    transition: "all 0.2s",
  },
  feedbackBoxSuccess: {
    backgroundColor: "#e6fffa",
    color: "#207a38",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    border: "2px solid #2ea44f",
    animation: "fadeIn 0.5s",
  },
  feedbackBoxError: {
    backgroundColor: "#ffe6e6",
    color: "#c62828",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
    border: "2px solid #c62828",
    animation: "fadeIn 0.5s",
  },
  timeInfoBox: {
    margin: "15px 0",
    padding: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: "5px",
    fontSize: "16px",
  },
  btnNext: {
    marginTop: 10,
    padding: "12px 24px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnRetry: {
    marginTop: 10,
    padding: "12px 24px",
    background: "#c62828",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
  },
};
