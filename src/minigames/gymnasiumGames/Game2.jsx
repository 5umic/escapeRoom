import React, { useState, useEffect, useRef, useId } from "react";
import { useNavigate } from "react-router-dom";
import { getNextGamePath } from "../../utils/navigation";

// Importera DRY-verktygen!
import {
  fetchGameIdByTitle,
  fetchUniqueChallenges,
} from "../gymnasiumGames/api/gameApi";
import { useGameTimer } from "../gymnasiumGames/hooks/useGameTimer";
import {
  GameContainer,
  FeedbackSuccess,
  FeedbackError,
  TimerBar,
} from "../gymnasiumGames/components/GameUI";

export default function Game2() {
  const navigate = useNavigate();
  const selectIdBase = useId();
  const submissionLocked = useRef(false);

  // State för spelet
  const [challenges, setChallenges] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [status, setStatus] = useState("loading"); // loading, playing, success, check_failed, time_out
  const [lastPenalty, setLastPenalty] = useState(0);

  const totalTimeLimit = 60; // Fast tid för detta spel

  // Vår anpassade Timer-hook gör allt det tunga jobbet!
  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus);

  // 1. Hämta all data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");
      const id = await fetchGameIdByTitle("gymnasium", "Game 2");
      if (id) {
        // ÄNDRING HÄR: Ta bort siffran 3. Nu hämtar den ALLA den kan hitta!
        const data = await fetchUniqueChallenges(id);
        setChallenges(data);
        setSecondsLeft(totalTimeLimit);
        setStatus("playing");
      }
    };
    initGame();
  }, [setSecondsLeft]);

  // 2. Hantera val i rullgardinsmenyn
  const handleSelectChange = (challengeId, selectedValue) => {
    // Lås upp knappen om de rättar till ett fel
    if (status === "check_failed") {
      submissionLocked.current = false;
    }
    setUserAnswers((prev) => ({ ...prev, [challengeId]: selectedValue }));
  };

  // 3. Rätta Svar
  const checkAnswers = () => {
    if (submissionLocked.current) return;

    const newValidation = {};
    let allCorrect = true;

    challenges.forEach((c) => {
      const isCorrect = userAnswers[c.id] === c.options[c.correctOptionIndex];
      newValidation[c.id] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });

    setValidationResults(newValidation);
    const spent = getTimeTaken(); // Hämta tid från hooken

    if (allCorrect) {
      // ALLA RÄTT
      submissionLocked.current = true;
      addTimeToSession(spent); // Lägg till tid i session via hook
      setStatus("success");
    } else {
      // STRAFF!
      submissionLocked.current = true;
      addTimeToSession(spent);
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
  if (status === "loading" || challenges.length === 0) {
    return (
      <GameContainer>
        <h2>Laddar...</h2>
      </GameContainer>
    );
  }

  return (
    // GameContainer sätter upp bakgrunden och timern
    <>
      <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
      <GameContainer>
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

            // Färgmarkering
            if (isValidated) {
              blockStyle.borderLeft = isCorrect
                ? "8px solid #2ea44f"
                : "8px solid #c62828";
              blockStyle.backgroundColor = isCorrect
                ? "rgba(46, 164, 79, 0.1)"
                : "rgba(198, 40, 40, 0.1)";
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

          {/* --- DRY Feedback-komponenter --- */}
          {status === "success" && (
            <FeedbackSuccess
              title="Bra jobbat!"
              timeTaken={getTimeTaken()}
              totalTime={sessionStorage.getItem("totalGameTime")}
              onNext={() =>
                navigate(getNextGamePath("Risk & Säkerhet (Game 2)"))
              }
              nextText="Gå vidare till nästa spel"
            />
          )}

          {status === "check_failed" && (
            <FeedbackError
              title="Inte helt rätt"
              message="Ändra de röda fälten och försök igen. Klockan tickar!"
              penalty={lastPenalty}
            />
          )}

          {status === "time_out" && (
            <FeedbackError
              title="Tiden är ute!"
              message="Du hann inte matcha allt i tid."
              onRetry={handleRetry}
              retryText="Börja om"
            />
          )}

          {status !== "success" && status !== "time_out" && (
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={submissionLocked.current && status === "check_failed"}
            >
              Rätta svar
            </button>
          )}
        </form>
      </GameContainer>
    </>
  );
}

// Styling: Skalades ner från ca 25 rader till 4 rader!
const styles = {
  questionBlock: {
    background: "rgba(255, 255, 255, 0.95)",
    color: "#333",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: "8px solid #ccc",
    transition: "all 0.3s ease",
    textAlign: "left",
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
};
