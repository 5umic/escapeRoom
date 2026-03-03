import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNextGameInfo, isLastActiveGame } from "../../utils/navigation";

// Importera våra nya DRY-verktyg!
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

export default function Game1() {
  const navigate = useNavigate();

  // State för spelet
  const [challenges, setChallenges] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("loading"); // loading, playing, answered_correctly, answered_wrong, time_out
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const lastGame = isLastActiveGame("Trafikverket (Gymnasium)");
  const nextPath = getNextGameInfo("Trafikverket (Gymnasium)");

  const challenge = challenges[currentIndex];

  // Aktivera vår nya Custom Hook för timern!
  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus);

  // 1. Hämta data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");
      const id = await fetchGameIdByTitle("gymnasium", "Trafikverket");
      if (id) {
        const data = await fetchUniqueChallenges(id);
        setChallenges(data);
        startRound(data[0]);
      }
    };
    initGame();
  }, []);

  // 2. Starta en ny runda
  const startRound = (currentChall) => {
    if (!currentChall) return;
    const limit = currentChall.timeLimitSeconds || 20;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit); // Nollställ klockan från vår hook
    setSelectedOptionIndex(null);
    setStatus("playing");
  };

  // 3. Hantera val av svar
  const onPick = (index) => {
    if (
      status === "answered_correctly" ||
      status === "answered_wrong" ||
      status === "time_out"
    )
      return;
    setSelectedOptionIndex(index);

    const spent = getTimeTaken(); // Hämtar spenderad tid via vår hook

    if (index === challenge.correctOptionIndex) {
      // RÄTT SVAR
      addTimeToSession(spent); // Sparar till sessionStorage via vår hook
      setStatus("answered_correctly");
    } else {
      // FEL SVAR (STRAFF)
      addTimeToSession(spent);
      setStatus("answered_wrong");
    }
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      startRound(challenges[nextIndex]);
    } else {
      // Om frågorna är slut, då använder vi navigeringen
      navigate(getNextGameInfo("Trafikverket (Gymnasium)"));
    }
  };
  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setStatus("playing");
    setSelectedOptionIndex(null);
  };

  // --- RENDER ---
  if (status === "loading" || !challenge) {
    return (
      <GameContainer>
        <h2>Laddar frågor...</h2>
      </GameContainer>
    );
  }

  const isLastQuestion = currentIndex === challenges.length - 1;

  return (
    // Vi använder vår nya GameContainer! Den hanterar den röda bakgrunden och timern i hörnet.
    <>
      <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
      <GameContainer>
        {/* Rund-information specifik för detta spel */}
        <div style={styles.roundInfo}>
          Fråga {currentIndex + 1} av {challenges.length}
        </div>

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

        {/* Svarsknappar */}
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

        {status === "answered_correctly" && (
          <FeedbackSuccess
            title={
              lastGame && isLastQuestion
                ? "Grattis du klarade sista spelet!"
                : "Rätt svar!"
            }
            timeTaken={getTimeTaken()}
            totalTime={sessionStorage.getItem("totalGameTime")}
            // FIX: Anropa handleNext istället för navigate direkt!
            onNext={handleNext}
            nextText={
              isLastQuestion
                ? lastGame
                  ? "Se Leaderboard 🏆"
                  : "Nästa utmaning"
                : "Nästa fråga"
            }
            currentGameTitle="Trafikverket (Gymnasium)"
            isLastQuestion={isLastQuestion}
          />
        )}

        {status === "answered_wrong" && (
          <FeedbackError
            title="Fel svar"
            message="Det där var inte riktigt rätt."
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

// Styling: Nu behöver vi BARA ha stilarna som är unika för just detta spel!
const styles = {
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
    border: "2px solid #ccc",
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "white",
    transition: "all 0.2s",
  },
};
