import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

export default function Game3() {
  const navigate = useNavigate();

  // State för spelet
  const [challenges, setChallenges] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("loading");
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalTimeLimit, setTotalTimeLimit] = useState(15);

  const challenge = challenges[currentIndex];

  // Vår anpassade Timer-hook
  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus);

  // 1. Hämta all data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");
      const id = await fetchGameIdByTitle("gymnasium", "Game 3");
      if (id) {
        const data = await fetchUniqueChallenges(id);
        setChallenges(data);
        startRound(data[0]);
      }
    };
    initGame();
  }, []);

  // 2. Starta en runda
  const startRound = (currentChall) => {
    if (!currentChall) return;
    const limit = currentChall.timeLimitSeconds || 15; // Sant/Falskt är snabba frågor
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);
    setSelectedOption(null);
    setStatus("playing");
  };

  // 3. Hantera svar
  const onAnswer = (optionText, optionIndex) => {
    // Förhindra klick om spelet är pausat
    if (
      status === "answered_correctly" ||
      status === "answered_wrong" ||
      status === "time_out"
    )
      return;

    setSelectedOption(optionText);
    const spent = getTimeTaken();

    if (optionIndex === challenge.correctOptionIndex) {
      // RÄTT SVAR
      addTimeToSession(spent);
      setStatus("answered_correctly");
    } else {
      // FEL SVAR (STRAFF!)
      addTimeToSession(spent);
      setStatus("answered_wrong");
    }
  };

  // 4. Navigering
  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      startRound(challenges[currentIndex + 1]);
    } else {
      navigate("/gymnasium/game4"); // Gå vidare till Pixeljakten
    }
  };

  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit); // Nollställ klockan
    setStatus("playing"); // Lås upp spelet
    setSelectedOption(null); // Ta bort röd markering
  };

  // --- RENDER ---
  if (status === "loading" || !challenge) {
    return (
      <GameContainer>
        <h2>Laddar...</h2>
      </GameContainer>
    );
  }

  const isLastQuestion = currentIndex === challenges.length - 1;

  return (
    <>
      <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
      <GameContainer>
        <div style={styles.roundInfo}>
          Fråga {currentIndex + 1} av {challenges.length}
        </div>

        <h2>Digital Säkerhet</h2>
        <p style={styles.prompt}>{challenge.prompt}</p>

        <div style={styles.buttonGroup}>
          {challenge.options.map((opt, index) => {
            let btnStyle = { ...styles.optionBtn };

            // Färgmarkering av det valda alternativet
            if (selectedOption === opt) {
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

        {/* --- DRY Feedback-komponenter --- */}
        {status === "answered_correctly" && (
          <FeedbackSuccess
            title="Rätt svar!"
            timeTaken={getTimeTaken()}
            totalTime={sessionStorage.getItem("totalGameTime")}
            onNext={handleNext}
            nextText={
              isLastQuestion
                ? "Gå vidare till Pixeljakten (Game 4)"
                : "Nästa fråga"
            }
          />
        )}

        {status === "answered_wrong" && (
          <FeedbackError
            title="Fel svar"
            message="Det var tyvärr inte rätt."
            penalty={getTimeTaken()}
            onRetry={handleRetry}
          />
        )}

        {status === "time_out" && (
          <FeedbackError
            title="Tiden är ute!"
            message="Du hann inte svara."
            onRetry={() => startRound(challenge)}
          />
        )}
      </GameContainer>
    </>
  );
}

// Minimal styling tack vare GameContainer!
const styles = {
  roundInfo: {
    position: "absolute",
    top: -50,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
  prompt: { fontSize: "22px", fontWeight: "bold", margin: "30px 0" },
  buttonGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "20px",
  },
  optionBtn: {
    padding: "20px",
    fontSize: "18px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "2px solid #ccc",
    cursor: "pointer",
    backgroundColor: "white",
    color: "#333",
    transition: "0.2s",
  },
};
