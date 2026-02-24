import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function Game1() {
  const navigate = useNavigate();

  // Data State
  const [gameID, setGameID] = useState(null);
  const [challenges, setChallenges] = useState([]); // Håller alla unika frågor
  const [currentIndex, setCurrentIndex] = useState(0); // Vilken runda vi är på

  // Det aktuella kortet/frågan
  const challenge = challenges[currentIndex];

  // Status: 'loading', 'playing', 'answered_correctly', 'answered_wrong', 'time_out'
  const [status, setStatus] = useState("loading");

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);

  // Håller koll på tiden och val
  const [timeTaken, setTimeTaken] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Trafikverket"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error("Kunde inte hämta spel:", err);
      }
    })();
  }, []);

  // 2. Hämta ALLA unika frågor dynamiskt
  useEffect(() => {
    if (!gameID) return;

    const fetchAllChallenges = async () => {
      setStatus("loading");
      let uniqueChallenges = [];
      let duplicateCount = 0;

      // Smart loop: Fortsätt hämta tills vi får 5 dubbletter i rad
      // Då vet vi med stor säkerhet att vi hittat alla frågor!
      while (duplicateCount < 5 && uniqueChallenges.length < 20) {
        try {
          const res = await fetch(
            `${API_BASE}/api/games/${gameID}/challenges/random`,
          );
          if (!res.ok) continue;

          const data = await res.json();

          // Kolla om vi redan har denna fråga
          if (!uniqueChallenges.find((c) => c.id === data.id)) {
            uniqueChallenges.push(data);
            duplicateCount = 0; // Nollställ dubbletträknaren
          } else {
            duplicateCount++; // Vi hittade en dubblett
          }
        } catch (err) {
          console.error(err);
          break;
        }
      }

      setChallenges(uniqueChallenges);
      setCurrentIndex(0);
      startRound(uniqueChallenges[0]);
    };

    fetchAllChallenges();
  }, [gameID]);

  // Starta en runda
  const startRound = (currentChall) => {
    if (!currentChall) return;
    const limit = currentChall.timeLimitSeconds || 20;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);
    setSelectedOptionIndex(null);
    setStatus("playing");
  };

  // Timer (Uppdaterad med strafftid)
  useEffect(() => {
    // FIXEN: Vi lägger till || status === "answered_wrong" så att klockan fryser
    if (
      status === "answered_correctly" ||
      status === "answered_wrong" ||
      status === "time_out"
    )
      return;

    if (secondsLeft <= 0) {
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;

      sessionStorage.setItem("totalGameTime", currentTotal + totalTimeLimit);

      setStatus("time_out");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status, totalTimeLimit]); // (I Game 4 ska penaltySeconds finnas i denna array också)

  // 4. Hantera svar
  const onPick = (index) => {
    if (status === "answered_correctly" || status === "time_out") return;
    setSelectedOptionIndex(index);

    const spent = totalTimeLimit - secondsLeft; // Räkna ut tiden
    const currentTotal = Number(sessionStorage.getItem("totalGameTime") || 0);

    if (index === challenge.correctOptionIndex) {
      // RÄTT SVAR
      setTimeTaken(spent);
      sessionStorage.setItem("totalGameTime", currentTotal + spent);
      setStatus("answered_correctly");
    } else {
      // FEL SVAR (STRAFF!)
      sessionStorage.setItem("totalGameTime", currentTotal + spent);
      setStatus("answered_wrong");
    }
  };

  // 5. Gå till nästa fråga eller nästa spel
  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      // Det finns fler frågor i detta spel
      setCurrentIndex((prev) => prev + 1);
      startRound(challenges[currentIndex + 1]);
    } else {
      // Alla frågor är klara, gå till Game 2
      navigate("/gymnasium/game2");
    }
  };

  // --- RENDERING ---

  if (status === "loading" || !challenge) {
    return <div style={styles.container}>Laddar frågor...</div>;
  }

  const isLastQuestion = currentIndex === challenges.length - 1;

  return (
    <div style={styles.container}>
      <div
        style={{
          width: "min(800px, 90vw)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Visar runda och timer */}
        <div style={styles.roundInfo}>
          Fråga {currentIndex + 1} av {challenges.length}
        </div>
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

            if (index === selectedOptionIndex) {
              if (status === "answered_correctly") {
                btnStyle.backgroundColor = "#2ea44f";
                btnStyle.color = "white";
                btnStyle.border = "2px solid #207a38";
              } else if (status === "answered_wrong") {
                btnStyle.backgroundColor = "#c62828";
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
        {status === "answered_correctly" && (
          <div style={styles.feedbackBoxSuccess}>
            <h3>Rätt svar! ✅</h3>
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

            <button onClick={handleNext} style={styles.btnNext}>
              {isLastQuestion
                ? "Gå vidare till nästa spel (Game 2)"
                : "Nästa fråga"}
            </button>
          </div>
        )}

        {status === "answered_wrong" && (
          <div style={styles.feedbackBoxError}>
            <h3>Fel svar ❌</h3>
            <p>
              Du fick <strong>{totalTimeLimit - secondsLeft} sekunder</strong> i
              straff!
            </p>
            <button
              onClick={() => {
                setSecondsLeft(totalTimeLimit); // Nollställ klockan
                setStatus("playing"); // Lås upp spelet
                setSelectedOptionIndex(null); // Ta bort markeringen
              }}
              style={styles.btnRetry}
            >
              Försök igen
            </button>
          </div>
        )}

        {status === "time_out" && (
          <div style={styles.feedbackBoxError}>
            <h3>Tiden är ute! ⏱️</h3>
            <button
              onClick={() => {
                startRound(challenge);
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
  roundInfo: {
    position: "absolute",
    top: -50,
    right: 0,
    background: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 16,
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
  question: { fontSize: 22, fontWeight: "bold", margin: "20px 0" },
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
