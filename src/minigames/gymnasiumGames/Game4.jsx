import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// DRY-verktyg!
import {
  fetchGameIdByTitle,
  fetchUniqueChallenges,
} from "../gymnasiumGames/api/gameApi";
import { useGameTimer } from "../gymnasiumGames/hooks/useGameTimer";
import {
  GameContainer,
  FeedbackSuccess,
  FeedbackError,
} from "../gymnasiumGames/components/GameUI";

const PIXEL_LEVELS = [0.03, 0.06, 0.12, 0.25, 0.5, 1.0];

export default function Game4() {
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Data State
  const [challenges, setChallenges] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const challenge = challenges[currentIndex];

  // Gameplay State
  const [status, setStatus] = useState("loading");
  const [selectedOption, setSelectedOption] = useState(null);
  const [pixelIndex, setPixelIndex] = useState(0);
  const [penaltySeconds, setPenaltySeconds] = useState(0);
  const [totalTimeLimit, setTotalTimeLimit] = useState(30);

  // Hook för timern (Nu med penaltySeconds!)
  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus, penaltySeconds);

  // 1. Hämta all data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");
      const id = await fetchGameIdByTitle("gymnasium", "Game 4");
      if (id) {
        const data = await fetchUniqueChallenges(id);
        setChallenges(data);
        loadRound(data[0]);
      }
    };
    initGame();
  }, []);

  // 2. Ladda in en runda (och bilden)
  const loadRound = (currentChall) => {
    if (!currentChall) return;
    setStatus("loading");

    setPixelIndex(0);
    setPenaltySeconds(0);
    setSelectedOption(null);

    const limit = currentChall.timeLimitSeconds || 30;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentChall.imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setStatus("playing");
    };
  };

  // 3. Rita på Canvas (Offscreen-fixen är kvar)
  useEffect(() => {
    if (status !== "playing" || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    const maxWidth = 500;
    const scaleFactor = Math.min(maxWidth / img.width, 1);
    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;

    const size = PIXEL_LEVELS[pixelIndex];
    const w = Math.ceil(canvas.width * size);
    const h = Math.ceil(canvas.height * size);

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = w;
    offscreenCanvas.height = h;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    offscreenCtx.drawImage(img, 0, 0, w, h);

    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      offscreenCanvas,
      0,
      0,
      w,
      h,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }, [status, pixelIndex, challenge]);

  // 4. Klick på bilden (Straff)
  const handleImageClick = () => {
    if (status !== "playing") return;
    if (pixelIndex < PIXEL_LEVELS.length - 1) {
      setPixelIndex((prev) => prev + 1);
      setPenaltySeconds((prev) => prev + 5);
    }
  };

  // 5. Hantera svar
  const onAnswer = (optionText, index) => {
    if (
      status === "answered_correctly" ||
      status === "answered_wrong" ||
      status === "time_out"
    )
      return;

    setSelectedOption(optionText);
    const spent = getTimeTaken(); // Hooken räknar nu automatiskt in dina klick-straff!

    if (index === challenge.correctOptionIndex) {
      setPixelIndex(PIXEL_LEVELS.length - 1); // Visa hela bilden skarp
      addTimeToSession(spent);
      setStatus("answered_correctly");
    } else {
      addTimeToSession(spent);
      setStatus("answered_wrong");
    }
  };

  // 6. Navigering
  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      loadRound(challenges[currentIndex + 1]);
    } else {
      navigate("/gymnasium/game5");
    }
  };

  const handleRetry = () => {
    loadRound(challenge);
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return (
      <GameContainer>
        <h2>Laddar Bild...</h2>
      </GameContainer>
    );

  const isLastQuestion = currentIndex === challenges.length - 1;

  return (
    <GameContainer secondsLeft={secondsLeft}>
      <div style={styles.roundInfo}>
        Bild {currentIndex + 1} av {challenges.length}
      </div>

      {/* Visa klick-straffet synligt under spelets gång */}
      {penaltySeconds > 0 && (
        <div style={styles.penaltyTracker}>+{penaltySeconds}s straff</div>
      )}

      <h2>Pixeljakten</h2>
      <p>
        Klicka på bilden för att göra den tydligare (+5 sekunder per klick!)
      </p>

      {/* CANVAS (Klickbar) */}
      <div style={styles.canvasContainer} onClick={handleImageClick}>
        <canvas ref={canvasRef} style={styles.canvas} />
        {pixelIndex < PIXEL_LEVELS.length - 1 && status === "playing" && (
          <div style={styles.clickHint}>👆 Klicka för att skärpa</div>
        )}
      </div>

      <p style={styles.prompt}>{challenge.prompt}</p>

      {/* SVARSKNAPPAR */}
      <div style={styles.buttonGroup}>
        {challenge.options.map((opt, i) => {
          let btnStyle = { ...styles.optionBtn };
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
              key={i}
              onClick={() => onAnswer(opt, i)}
              style={btnStyle}
              disabled={status !== "playing"}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* DRY FEEDBACK */}
      {status === "answered_correctly" && (
        <FeedbackSuccess
          title="Snyggt sett!"
          timeTaken={getTimeTaken()}
          totalTime={sessionStorage.getItem("totalGameTime")}
          penaltyTime={penaltySeconds}
          onNext={handleNext}
          nextText={
            isLastQuestion ? "Gå vidare till Sortering (Game 5)" : "Nästa Bild"
          }
        />
      )}

      {status === "answered_wrong" && (
        <FeedbackError
          title="Fel svar"
          message="Du gissade fel."
          penalty={getTimeTaken()}
          onRetry={handleRetry}
        />
      )}

      {status === "time_out" && (
        <FeedbackError
          title="Tiden är ute!"
          message="Du hann inte gissa i tid."
          onRetry={handleRetry}
        />
      )}
    </GameContainer>
  );
}

// Styling: Mycket städat igen!
const styles = {
  roundInfo: {
    position: "absolute",
    top: 20,
    left: 20,
    background: "rgba(255,255,255,0.2)",
    color: "#333",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
  penaltyTracker: {
    position: "absolute",
    top: -50,
    right: 0,
    color: "#c62828",
    background: "#ffe6e6",
    padding: "5px 15px",
    borderRadius: 10,
    fontWeight: "bold",
    fontSize: 18,
    border: "2px solid #c62828",
  },
  canvasContainer: {
    position: "relative",
    display: "inline-block",
    margin: "20px 0",
    cursor: "pointer",
    border: "4px solid #333",
    borderRadius: "4px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
  canvas: { display: "block", maxWidth: "100%", height: "auto" },
  clickHint: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: "12px",
    pointerEvents: "none",
  },
  prompt: { fontSize: "20px", fontWeight: "bold", marginBottom: "20px" },
  buttonGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(186px, 1fr))",
    gap: "10px",
  },
  optionBtn: {
    padding: "15px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "2px solid #ccc",
    cursor: "pointer",
    background: "#f9f9f9",
    color: "#333",
    transition: "0.2s",
  },
};
