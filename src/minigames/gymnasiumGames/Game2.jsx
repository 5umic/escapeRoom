import React, { useState, useEffect, useRef, useId } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function Game2() {
  const navigate = useNavigate();
  const selectIdBase = useId();

  // SÄKERHET: Förhindra dubbelklick
  const submissionLocked = useRef(false);

  // Data State
  const [challenges, setChallenges] = useState([]);
  const [gameID, setGameID] = useState(null);

  // Gameplay State
  const [userAnswers, setUserAnswers] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [status, setStatus] = useState("loading"); // loading, playing, success, check_failed, time_out
  const [lastPenalty, setLastPenalty] = useState(0); // Sparar senaste straffet i sekunder

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);

  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Game 2"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error("Kunde inte hämta spel:", err);
      }
    })();
  }, []);

  // 2. Hämta alla unika frågor
  useEffect(() => {
    if (!gameID) return;

    (async () => {
      let fetched = [];
      let attempts = 0;
      // Hämta tills vi har 3 unika eller har försökt 50 gånger
      while (fetched.length < 3 && attempts < 50) {
        attempts++;
        try {
          const res = await fetch(
            `${API_BASE}/api/games/${gameID}/challenges/random`,
          );
          if (!res.ok) continue;
          const data = await res.json();
          if (!fetched.find((c) => c.id === data.id)) {
            fetched.push(data);
          }
        } catch (err) {}
      }

      setChallenges(fetched);
      const totalTime = 60;
      setTotalTimeLimit(totalTime);
      setSecondsLeft(totalTime);
      setStatus("playing");
    })();
  }, [gameID]);

  // 3. Timer
  useEffect(() => {
    // VIKTIGT: Klockan stannar BARA vid success eller time_out.
    // Vid check_failed (fel svar) fortsätter klockan ticka!
    if (status === "success" || status === "time_out") return;

    if (secondsLeft <= 0) {
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + totalTimeLimit);
      setStatus("time_out");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status, totalTimeLimit]);

  // --- DENNA FUNKTION SAKNADES ---
  // Hanterar när spelaren väljer något i dropdown-menyn
  const handleSelectChange = (challengeId, selectedValue) => {
    // Om vi var i ett fel-läge, låser vi upp knappen så de kan rätta igen
    if (status === "check_failed") {
      submissionLocked.current = false;
    }

    setUserAnswers((prev) => ({ ...prev, [challengeId]: selectedValue }));
  };
  // ---------------------------------

  // --- RÄTTA SVAR ---
  const checkAnswers = () => {
    if (submissionLocked.current) return; // Förhindra dubbelklick

    const newValidation = {};
    let allCorrect = true;

    challenges.forEach((c) => {
      const correctAnswerText = c.options[c.correctOptionIndex];
      const userAnswer = userAnswers[c.id];
      const isCorrect = userAnswer === correctAnswerText;

      newValidation[c.id] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });

    setValidationResults(newValidation);

    if (allCorrect) {
      submissionLocked.current = true; // Lås knappen

      const spent = totalTimeLimit - secondsLeft;
      setTimeTaken(spent);

      const previousTotal =
        Number(sessionStorage.getItem("totalGameTime")) || 0;
      const newTotal = previousTotal + spent;
      sessionStorage.setItem("totalGameTime", newTotal);

      setStatus("success");
    } else {
      // STRAFF! (Ingen alert, vi använder UI istället)
      submissionLocked.current = true; // Lås tills de ändrar ett val

      const spent = totalTimeLimit - secondsLeft;
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;

      // Lägg till straffsekunderna i sessionen
      sessionStorage.setItem("totalGameTime", currentTotal + spent);

      // Spara hur mycket straff de fick så vi kan visa det
      setLastPenalty(spent);
      setStatus("check_failed");
    }
  };

  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setUserAnswers({});
    setValidationResults({});
    setStatus("playing");
    setLastPenalty(0);
    submissionLocked.current = false;
  };

  // --- RENDER ---
  if (status === "loading")
    return <div style={styles.container}>Laddar...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.timer}>{secondsLeft}s</div>

        <h2>Risk & Säkerhet</h2>
        <p style={{ marginBottom: 30 }}>
          Matcha rätt påstående med rätt plats.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkAnswers();
          }}
        >
          {challenges.map((c, index) => {
            const selectId = `${selectIdBase}-${index}`;
            let blockStyle = { ...styles.questionBlock };

            const isValidated = validationResults.hasOwnProperty(c.id);
            const isCorrect = validationResults[c.id];

            // Färgmarkering på boxarna efter man har tryckt rätta
            if (isValidated) {
              blockStyle.borderLeft = isCorrect
                ? "8px solid #2ea44f"
                : "8px solid #ed2828";
              blockStyle.backgroundColor = isCorrect
                ? "rgb(44, 100, 60)"
                : "rgb(111, 37, 37)";
              blockStyle.color = isCorrect ? "white" : "white";
            }

            return (
              <div key={c.id} style={blockStyle}>
                <label htmlFor={selectId} style={styles.labelPrompt}>
                  {c.prompt}
                </label>
                <select
                  id={selectId}
                  style={styles.select}
                  value={userAnswers[c.id] || ""}
                  onChange={(e) => handleSelectChange(c.id, e.target.value)}
                  disabled={status === "success" || status === "time_out"}
                >
                  <option value="" disabled>
                    -- Välj plats --
                  </option>
                  {c.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          {status === "success" && (
            <div style={styles.feedbackBoxSuccess}>
              <h3>Bra jobbat! ✅</h3>
              <div style={styles.timeInfoBox}>
                <p>
                  ⏱️ Tid för detta spel: <strong>{timeTaken} sekunder</strong>
                </p>
                <p>
                  📊 Total tid hittills:{" "}
                  <strong>
                    {sessionStorage.getItem("totalGameTime")} sekunder
                  </strong>
                </p>
              </div>
              <button
                onClick={() => navigate("/gymnasium/game3")}
                style={styles.btnSuccess}
              >
                Nästa Spel (Game 3)
              </button>
            </div>
          )}

          {status === "check_failed" && (
            <div style={styles.feedbackBoxError}>
              <h3>Inte helt rätt ❌</h3>
              <p>
                Du fick precis <strong>{lastPenalty} sekunder</strong> adderat
                som straff!
              </p>
              <p style={{ fontSize: "15px", marginTop: "10px" }}>
                Ändra de röda fälten och försök igen. Klockan tickar!
              </p>
            </div>
          )}

          {status === "time_out" && (
            <div style={styles.feedbackBoxError}>
              <h3>Tiden är ute! ⏱️</h3>
              <button onClick={handleRetry} style={styles.btnRetry}>
                Börja om
              </button>
            </div>
          )}

          {status !== "success" && status !== "time_out" && (
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={submissionLocked.current && status === "check_failed"} // Stäng av knappen tills de ändrar ett val
            >
              Rätta svar
            </button>
          )}
        </form>
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
  content: { maxWidth: "800px", width: "100%", position: "relative" },
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
  questionBlock: {
    background: "rgba(255, 255, 255, 0.95)",
    color: "#333",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: "8px solid #ccc",
    transition: "all 0.3s ease",
  },
  labelPrompt: {
    display: "block",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: "1.4",
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: 5,
    cursor: "pointer",
  },
  submitBtn: {
    marginTop: 20,
    padding: "15px 40px",
    fontSize: "20px",
    fontWeight: "bold",
    background: "#fff6b0",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "block",
    width: "100%",
  },
  feedbackBoxSuccess: {
    backgroundColor: "#e6fffa",
    color: "#207a38",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    border: "2px solid #2ea44f",
    textAlign: "center",
  },
  feedbackBoxError: {
    backgroundColor: "#ffe6e6",
    color: "#c62828",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
    border: "2px solid #c62828",
    textAlign: "center",
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
  btnSuccess: {
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
