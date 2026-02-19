import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function Game3() {
  const navigate = useNavigate();

  // LÅS 1: För att förhindra dubbelklick visuellt
  const answerLocked = useRef(false);

  // LÅS 2 (NYTT): Minne för vilka frågor vi redan räknat poäng för
  // Detta stoppar "dubbel räkning" även om man klickar snabbt
  const processedIds = useRef(new Set());

  // Data State
  const [gameID, setGameID] = useState(null);
  const [challenge, setChallenge] = useState(null);

  // Status
  const [status, setStatus] = useState("loading");

  // Timer och Statistik
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  // 1. Hämta Game ID
  useEffect(() => {
    console.log(
      "GAME 3 START - Total tid i minnet:",
      sessionStorage.getItem("totalGameTime"),
    );

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Game 3"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error("Kunde inte hämta spel:", err);
      }
    })();
  }, []);

  // 2. Hämta EN slumpmässig fråga
  const fetchRandomChallenge = async () => {
    if (!gameID) return;

    // Nollställ state och LÅS UPP
    setStatus("loading");
    setChallenge(null);
    setSelectedOption(null);

    // Nollställ låset för knappar
    answerLocked.current = false;

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

  // Timer (Uppdaterad med strafftid)
  useEffect(() => {
    if (status === "answered_correctly" || status === "time_out") return;

    if (secondsLeft <= 0) {
      // Lägg till hela omgångens tid till totaltiden
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + totalTimeLimit);

      setStatus("time_out");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status, totalTimeLimit]);

  // 4. Hantera svar
  const onAnswer = (optionText, optionIndex) => {
    // SÄKERHETSKONTROLL 1: Är spelet redan klart eller låst?
    if (
      status === "answered_correctly" ||
      status === "time_out" ||
      answerLocked.current
    )
      return;

    // Lås knapparna direkt
    answerLocked.current = true;
    setSelectedOption(optionText);

    if (optionIndex === challenge.correctOptionIndex) {
      // --- RÄTT SVAR ---

      // SÄKERHETSKONTROLL 2 (Den viktiga fixen):
      // Har vi redan räknat tid för just DENNA fråga (challenge.id)?
      if (processedIds.current.has(challenge.id)) {
        console.warn(
          "Försökte lägga till tid för samma fråga två gånger - stoppades.",
        );
        return;
      }

      // Markera denna fråga som "betald"
      processedIds.current.add(challenge.id);

      const spent = totalTimeLimit - secondsLeft;
      setTimeTaken(spent);

      // Uppdatera totaltid säkert
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      const newTotal = currentTotal + spent;

      console.log(`GAME 3 - Fråga Rätt!`);
      console.log(`Tid för fråga: ${spent}s`);
      console.log(`Gammal total: ${currentTotal}s`);
      console.log(`Ny total: ${newTotal}s`);

      sessionStorage.setItem("totalGameTime", newTotal);

      // Logga för att bekräfta att det bara händer en gång
      console.log(`✅ RÄTT! Tid: ${spent}s. Ny total: ${newTotal}s`);

      setStatus("answered_correctly");
    } else {
      // --- FEL SVAR ---
      setStatus("answered_wrong");

      // Vid fel låser vi upp igen så man kan försöka på nytt
      answerLocked.current = false;
    }
  };

  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setStatus("playing");
    setSelectedOption(null);
    answerLocked.current = false; // Lås upp vid retry
  };

  // --- RENDER ---

  if (status === "loading" || !challenge)
    return <div style={styles.container}>Laddar...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.timer}>{secondsLeft}s</div>

        <h2>Digital Säkerhet</h2>
        <p style={{ marginBottom: 20, fontSize: "18px" }}>Sant eller Falskt?</p>

        <div style={styles.card}>
          <p style={styles.prompt}>{challenge.prompt}</p>

          <div style={styles.buttonGroup}>
            {challenge.options.map((opt, index) => {
              let btnStyle = { ...styles.optionBtn };

              if (selectedOption === opt) {
                if (status === "answered_correctly") {
                  btnStyle.backgroundColor = "#2ea44f";
                  btnStyle.border = "2px solid #207a38";
                } else if (status === "answered_wrong") {
                  btnStyle.backgroundColor = "#c62828";
                  btnStyle.border = "2px solid #8e1c1c";
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => onAnswer(opt, index)}
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
        </div>

        {/* FEEDBACK */}
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

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <button
                onClick={() => navigate("/gymnasium/game4")}
                style={styles.btnNext}
              >
                Gå vidare till Pixeljakten (Game 4)
              </button>
              {/* <button
                onClick={() => navigate("/gymnasium")}
                style={styles.btnMenu}
              >
                Till Menyn
              </button> */}
            </div>
          </div>
        )}

        {status === "answered_wrong" && (
          <div style={styles.feedbackBoxError}>
            <h3>Fel svar ❌</h3>
            <p>Det stämmer inte. Försök igen!</p>
          </div>
        )}

        {status === "time_out" && (
          <div style={styles.feedbackBoxError}>
            <h3>Tiden är ute! ⏱️</h3>
            <button onClick={handleRetry} style={styles.btnRetry}>
              Försök igen
            </button>
          </div>
        )}
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
    color: "white",
    fontFamily: "sans-serif",
    padding: 20,
  },
  content: {
    maxWidth: "600px",
    width: "100%",
    position: "relative",
    textAlign: "center",
  },
  timer: {
    position: "absolute",
    top: -60,
    right: 0,
    background: "#fff6b0",
    color: "#000",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 24,
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    color: "#333",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  prompt: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "30px",
    lineHeight: "1.4",
  },
  buttonGroup: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
  },
  optionBtn: {
    flex: 1,
    padding: "20px",
    fontSize: "20px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "2px solid #eee",
    cursor: "pointer",
    background: "#f9f9f9",
    color: "#333",
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
    fontWeight: "bold",
  },
  timeInfoBox: {
    margin: "15px 0",
    padding: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "5px",
    fontSize: "16px",
    color: "#333",
  },
  btnNext: {
    padding: "12px 24px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnMenu: {
    padding: "12px 24px",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
};
