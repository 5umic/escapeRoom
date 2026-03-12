import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { formatTimeWithTenths } from "../hooks/useGameTimer";
import { getNextGameInfo } from "../../../utils/navigation";
import { savePlayerScore } from "../api/gameApi";

export function GameSuccessModal({
  message,
  onNext,
  onClose,
  buttonText = "Gå vidare",
}) {
  if (!message) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.messageBody}>
          <button onClick={onClose} style={styles.closeX}>
            ✕
          </button>
          {message.split("\n").map((line, i) => (
            <p key={i} style={styles.modalText}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export const GameNavbar = ({ gameTitle }) => {
  // Hämta den totala tiden från sessionStorage annars 00:00
  const totalTimeRaw = sessionStorage.getItem("totalGameTime");
  const totalTime = totalTimeRaw ? parseFloat(totalTimeRaw) : 0;

  return (
    <nav style={navStyles.navbar}>
      {/* VÄNSTER: Kan vara plats för en "Avbryt"-knapp i framtiden? Men tom för tillfället */}
      <div style={navStyles.navSide}></div>

      {/* MITTEN: Logga och Speltitel */}
      <div style={navStyles.navCenter}>
        <img
          src="/images/trafikverket_horisontal_logo_RGB.png"
          alt="Trafikverket"
          style={navStyles.logo}
        />
        <h1 style={navStyles.gameTitle}>{gameTitle}</h1>
      </div>

      {/* HÖGER: Total tid */}
      <div style={navStyles.navSide}>
        <div style={navStyles.timeWrapper}>
          <span style={navStyles.timeDigits}>
            {formatTimeWithTenths(totalTime)}
          </span>
          <span style={navStyles.timeLabel}>TOTAL TID</span>
        </div>
      </div>
    </nav>
  );
};

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
  successMessage,
  timeTaken,
  totalTime,
  penaltyTime = 0,
  onNext,
  currentGameTitle,
  isLastQuestion,
}) {
  const navigate = useNavigate();
  const hasSaved = useRef(false);

  // State för att styra om modalen ska synas
  const [showModal, setShowModal] = React.useState(
    !!successMessage && isLastQuestion,
  );

  const { isLast, nextPath } = getNextGameInfo(currentGameTitle);

  useEffect(() => {
    const isFinalEnding = isLast && isLastQuestion;
    const alreadySaved = sessionStorage.getItem("isScoreSaved") === "true";

    if (isFinalEnding && !alreadySaved && !hasSaved.current) {
      const playerName =
        sessionStorage.getItem("playerName") || "Anonym Spelare";
      const finalTime = parseFloat(totalTime || 0);
      sessionStorage.setItem("isScoreSaved", "true");
      hasSaved.current = true;
      savePlayerScore(playerName, finalTime);
    }
  }, [isLast, isLastQuestion, totalTime, currentGameTitle]);

  const handleButtonClick = () => {
    if (isLastQuestion) {
      navigate(nextPath);
    } else {
      onNext();
    }
  };

  return (
    <>
      {showModal && (
        <GameSuccessModal
          message={successMessage}
          onClose={() => setShowModal(false)}
        />
      )}

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
          {isLast && isLastQuestion
            ? "Se Resultat 🏆"
            : isLastQuestion
              ? "Nästa Utmaning ➡️"
              : "Nästa Fråga"}
        </button>
      </div>
    </>
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

const navStyles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 40px",
    borderBottom: "3px solid #b10000", // Trafikverkets röda linje
    width: "100%",
    boxSizing: "border-box",
    marginBottom: "20px",
  },
  navSide: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
  navCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },
  logo: {
    height: "80px",
    width: "auto",
  },
  gameTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#f4f4f4",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "bold",
  },
  timeWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: "5px 15px",
    borderRadius: "8px",
    minWidth: "100px",
  },
  timeDigits: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    fontFamily: "monospace",
  },
  timeLabel: {
    fontSize: "10px",
    color: "#888",
    fontWeight: "bold",
  },
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    backdropFilter: "blur(4px)", // Ger en snygg suddig effekt bakom
  },
  modalContent: {
    backgroundColor: "white",
    // padding: "40px",
    borderRadius: "15px",
    maxWidth: "600px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    borderTop: "8px solid #b10000", // Trafikverkets röda tråd
  },
  modalText: {
    fontSize: "1.2rem",
    lineHeight: "1.6",
    color: "#333",
    marginBottom: "20px",
    fontWeight: "500",
  },
  messageBody: {
    position: "relative",
    padding: "40px",
  },
  modalBtn: {
    padding: "12px 35px",
    backgroundColor: "#b10000",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    textTransform: "uppercase",
    marginTop: "10px",
  },
  closeX: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#999",
  },
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
    minHeight: "85vh",
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
