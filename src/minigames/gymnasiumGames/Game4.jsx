import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";
const PIXEL_LEVELS = [0.03, 0.06, 0.12, 0.25, 0.5, 1.0];

export default function Game4() {
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const answerLocked = useRef(false);

  // DATA STATE FÖR FLERA OMGÅNGAR
  const [gameID, setGameID] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const challenge = challenges[currentIndex];
  const [status, setStatus] = useState("loading");

  // GAMEPLAY STATE
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [penaltySeconds, setPenaltySeconds] = useState(0);
  const [pixelIndex, setPixelIndex] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Game 4"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // 2. Hämta ALLA unika frågor
  useEffect(() => {
    if (!gameID) return;

    const fetchAllChallenges = async () => {
      setStatus("loading");
      let uniqueChallenges = [];
      let duplicateCount = 0;

      while (duplicateCount < 5 && uniqueChallenges.length < 20) {
        try {
          const res = await fetch(
            `${API_BASE}/api/games/${gameID}/challenges/random`,
          );
          if (!res.ok) continue;
          const data = await res.json();

          if (!uniqueChallenges.find((c) => c.id === data.id)) {
            uniqueChallenges.push(data);
            duplicateCount = 0;
          } else {
            duplicateCount++;
          }
        } catch (err) {
          break;
        }
      }

      setChallenges(uniqueChallenges);
      setCurrentIndex(0);
      loadRound(uniqueChallenges[0]);
    };

    fetchAllChallenges();
  }, [gameID]);

  // Ladda in rundan och dess specifika bild i minnet
  const loadRound = (currentChall) => {
    if (!currentChall) return;
    setStatus("loading");

    setPixelIndex(0);
    setPenaltySeconds(0);
    setSelectedOption(null);
    answerLocked.current = false;

    const limit = currentChall.timeLimitSeconds || 30;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);

    // Ladda in ny bild
    const img = new Image();
    img.src = currentChall.imageUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setStatus("playing");
    };
  };

  // 3. RITA PÅ CANVAS
  useEffect(() => {
    if (status !== "playing" || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // Sätt storleken på vår canvas
    const maxWidth = 500;
    const scaleFactor = Math.min(maxWidth / img.width, 1);
    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;

    const size = PIXEL_LEVELS[pixelIndex];

    // FIX 1: Använd Math.ceil för att undvika decimaler (vilket skapar glipor)
    const w = Math.ceil(canvas.width * size);
    const h = Math.ceil(canvas.height * size);

    // FIX 2: Skapa en temporär canvas i minnet för miniatyren
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = w;
    offscreenCanvas.height = h;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    // Steg A: Rita bilden jätteliten på vår osynliga canvas
    offscreenCtx.drawImage(img, 0, 0, w, h);

    // Steg B: Stäng av mjukgöring (anti-aliasing) på vår riktiga canvas så pixlarna blir skarpa
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    // Steg C: Rensa riktiga canvasen helt för att undvika spökbilder
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Steg D: Sträck ut vår lilla miniatyr från den osynliga canvasen så den täcker hela originalet perfekt
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

  // 4. Timer (Uppdaterad med maxtid + straffsekunder)
  useEffect(() => {
    if (
      status === "answered_correctly" ||
      status === "answered_wrong" ||
      status === "time_out"
    )
      return;

    if (secondsLeft <= 0) {
      // Lägg till hela omgångens tid PLUS alla straffsekunder man samlat på sig
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem(
        "totalGameTime",
        currentTotal + totalTimeLimit + penaltySeconds,
      );

      setStatus("time_out");
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status, totalTimeLimit, penaltySeconds]);

  // 5. KLICK PÅ BILDEN (Straff)
  const handleImageClick = () => {
    if (status !== "playing") return;
    if (pixelIndex < PIXEL_LEVELS.length - 1) {
      setPixelIndex((prev) => prev + 1);
      setPenaltySeconds((prev) => prev + 5);
    }
  };

  // 6. HANTERA SVAR
  const onAnswer = (option, index) => {
    if (status !== "playing" || answerLocked.current) return;
    answerLocked.current = true;
    setSelectedOption(option);

    if (index === challenge.correctOptionIndex) {
      const baseTime = totalTimeLimit - secondsLeft;
      const totalSpent = baseTime + penaltySeconds;

      setTimeTaken(totalSpent);

      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + totalSpent);

      setPixelIndex(PIXEL_LEVELS.length - 1); // Visa hela bilden
      setStatus("answered_correctly");
    } else {
      setStatus("answered_wrong");
      answerLocked.current = false;
    }
  };

  // 7. Gå till nästa eller börja om
  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      loadRound(challenges[currentIndex + 1]);
    } else {
      navigate("/gymnasium/game5"); // Går till Game 5 Sortering när klar!
    }
  };

  const handleRetry = () => {
    loadRound(challenge);
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return <div style={styles.container}>Laddar Bild...</div>;

  const isLastQuestion = currentIndex === challenges.length - 1;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* TIMER med STRAFF */}
        <div style={styles.timerBox}>
          <div>Tid: {secondsLeft}s</div>
          {penaltySeconds > 0 && (
            <div style={{ color: "#ff6b6b", fontSize: "16px" }}>
              (+{penaltySeconds}s straff)
            </div>
          )}
        </div>

        <h2>Pixeljakten</h2>
        <p>
          Klicka på bilden för att göra den tydligare (+5 sekunder per klick!)
        </p>

        <div style={styles.roundInfo}>
          Bild {currentIndex + 1} av {challenges.length}
        </div>

        {/* CANVAS (Klickbar) */}
        <div style={styles.canvasContainer} onClick={handleImageClick}>
          <canvas ref={canvasRef} style={styles.canvas} />
          {pixelIndex < PIXEL_LEVELS.length - 1 && status === "playing" && (
            <div style={styles.clickHint}>👆 Klicka för att skärpa</div>
          )}
        </div>

        <p style={styles.prompt}>{challenge.prompt}</p>

        {/* ALTERNATIV */}
        <div style={styles.buttonGroup}>
          {challenge.options.map((opt, i) => {
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
                key={i}
                onClick={() => onAnswer(opt, i)}
                style={btnStyle}
                disabled={
                  status === "time_out" || status === "answered_correctly"
                }
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK */}
        {status === "answered_correctly" && (
          <div style={styles.feedbackBoxSuccess}>
            <h3>Snyggt sett! 👁️</h3>
            <div style={styles.timeInfoBox}>
              <p>
                Grundtid: <strong>{timeTaken - penaltySeconds}s</strong>
              </p>
              <p>
                Strafftid: <strong>{penaltySeconds}s</strong>
              </p>
              <hr style={{ margin: "5px 0", opacity: 0.3 }} />
              <p>
                Total tid för fråga: <strong>{timeTaken}s</strong>
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
                ? "Gå vidare till Sortering (Game 5)"
                : "Nästa Bild"}
            </button>
          </div>
        )}

        {status === "answered_wrong" && (
          <div style={styles.feedbackBoxError}>
            <h3>Fel! Försök igen.</h3>
          </div>
        )}

        {status === "time_out" && (
          <div style={styles.feedbackBoxError}>
            <h3>Tiden är ute!</h3>
            <button onClick={handleRetry} style={styles.btnRetry}>
              Börja om
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
    textAlign: "center",
    position: "relative",
  },
  roundInfo: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 16,
    marginInline: "auto",
    width: "fit-content",
    marginTop: 20,
  },
  timerBox: {
    position: "absolute",
    top: -50,
    left: 0,
    background: "#fff6b0",
    color: "#000",
    padding: "10px 20px",
    borderRadius: 10,
    fontWeight: "bold",
    fontSize: 24,
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  canvasContainer: {
    position: "relative",
    display: "inline-block",
    margin: "20px 0 20px 0",
    cursor: "pointer",
    border: "4px solid white",
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
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: "12px",
    pointerEvents: "none",
  },
  prompt: { fontSize: "20px", fontWeight: "bold", marginBottom: "20px" },
  buttonGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
  },
  optionBtn: {
    padding: "15px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#f9f9f9",
    color: "#333",
    transition: "0.2s",
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
