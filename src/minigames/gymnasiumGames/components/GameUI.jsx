import React, { use, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { formatTimeWithTenths } from "../hooks/useGameTimer";
import { getNextGameInfo } from "../../../utils/navigation";
import { savePlayerScore } from "../api/gameApi";

// --- KRYMPANDE TIMER-MÄTARE ---
export function TimerBar({ secondsLeft, totalTimeLimit }) {
  const maxTime = totalTimeLimit || 1;
  const percentage = Math.max(0, Math.min(100, (secondsLeft / maxTime) * 100));

  let barColor = "#2ea44f"; // Grön
  if (percentage <= 50 && percentage > 20) {
    barColor = "#fbbc05"; // Gul
  } else if (percentage <= 20) {
    barColor = "#c62828"; // Röd
  }

  return (
    <div style={styles.timerBackground}>
      <div
        style={{
          ...styles.timerFill,
          width: `${percentage}%`,
          backgroundColor: barColor,
          transition: "width 0.1s linear, background-color 0.5s ease",
        }}
      />
      <span style={styles.timerText}>{formatTimeWithTenths(secondsLeft)}</span>
    </div>
  );
}
// --- HUVUDCONTAINER ---
export function GameContainer({ children, secondsLeft }) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {secondsLeft !== undefined && (
          <div style={styles.timer}>{secondsLeft}s</div>
        )}
        {children}
      </div>
    </div>
  );
}

// --- FEEDBACK BOX: SUCCESS ---
export function FeedbackSuccess({
  title,
  timeTaken,
  totalTime,
  penaltyTime = 0, // Default 0
  onNext, // Används för nästa FRÅGA i samma spel
  currentGameTitle,
  isLastQuestion,
}) {
  const navigate = useNavigate();
  const hasSaved = useRef(false);

  // Hämta dynamisk info om var vi är i hela spelserien
  const { isLast, nextPath } = getNextGameInfo(currentGameTitle);

  useEffect(() => {
    // Spara endast om det är sista frågan i det absolut sista aktiva spelet
    const isFinalEnding = isLast && isLastQuestion;
    const alreadySaved = sessionStorage.getItem("isScoreSaved") === "true";

    if (isFinalEnding && !alreadySaved && !hasSaved.current) {
      const playerName =
        sessionStorage.getItem("playerName") || "Anonym Spelare";
      const finalTime = parseFloat(totalTime || 0);

      sessionStorage.setItem("isScoreSaved", "true");
      hasSaved.current = true;

      console.log("🏆 Mål! Sparar slutgiltig tid...", {
        playerName,
        finalTime,
      });
      savePlayerScore(playerName, finalTime);
    }
  }, [isLast, isLastQuestion, totalTime, currentGameTitle]);

  const handleButtonClick = () => {
    if (isLastQuestion) {
      // Om sista frågan i spelet: Gå till nextPath (Leaderboard eller nästa spel)
      navigate(nextPath);
    } else {
      // Annars: Kör spelets lokala onNext för att byta fråga
      onNext();
    }
  };

  // Dynamisk text på knappen
  const getButtonText = () => {
    if (isLast && isLastQuestion) return "Se Resultat 🏆";
    if (isLastQuestion) return "Nästa Utmaning ➡️";
    return "Nästa Fråga";
  };

  return (
    <div style={styles.feedbackBoxSuccess}>
      <h3>
        {isLast && isLastQuestion ? "Grattis, du klarade allt!" : title} ✅
      </h3>

      {timeTaken !== undefined && (
        <div style={styles.timeInfoBox}>
          {penaltyTime > 0 && (
            <>
              <p>
                ⏳ Grundtid:{" "}
                <strong>{(timeTaken - penaltyTime).toFixed(1)}s</strong>
              </p>
              <p style={{ color: "#c62828" }}>
                ⚠️ Straff: <strong>+{penaltyTime}s</strong>
              </p>
              <hr
                style={{
                  margin: "8px 0",
                  border: "none",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                }}
              />
            </>
          )}

          <p>
            ⏱️ {penaltyTime > 0 ? "Total tid för momentet:" : "Tid:"}{" "}
            <strong>{timeTaken}s</strong>
          </p>
          <p>
            📊 Din totala tid:{" "}
            <strong>{formatTimeWithTenths(totalTime)}</strong>
          </p>
        </div>
      )}

      <button onClick={handleButtonClick} style={styles.btnSuccess}>
        {getButtonText()}
      </button>
    </div>
  );
}

// --- FEEDBACK BOX: ERROR / PENALTY ---
export function FeedbackError({ title, message, penalty, onRetry, retryText }) {
  return (
    <div style={styles.feedbackBoxError}>
      <h3>{title} ❌</h3>
      <p>{message}</p>
      {penalty > 0 && (
        <p>
          Du fick precis <strong>{penalty} sekunder</strong> i straff!
        </p>
      )}
      {onRetry && (
        <button onClick={onRetry} style={styles.btnRetry}>
          {retryText || "Försök igen"}
        </button>
      )}
    </div>
  );
}

const styles = {
  timerBackground: {
    width: "95%",
    height: "24px",
    backgroundColor: "#333",
    borderRadius: "12px",
    marginBottom: "20px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
    marginInline: "auto",
  },
  timerFill: {
    height: "100%",
    borderRadius: "12px",
    transition: "width 1s linear, background-color 0.5s ease",
  },
  timerText: {
    fontFamily: "monospace",
    position: "absolute",
    fontVariantNumeric: "tabular-nums",
    minwidth: "60px",
    textAlign: "center",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
  },
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
    maxWidth: "800px",
    background: "white",
    padding: 40,
    borderRadius: 10,
    textAlign: "center",
    position: "relative",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  timer: {
    position: "absolute",
    top: -20,
    right: 20,
    fontSize: 24,
    fontWeight: "bold",
    background: "#fff6b0",
    padding: "10px 20px",
    borderRadius: 15,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    zIndex: 10,
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
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
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
