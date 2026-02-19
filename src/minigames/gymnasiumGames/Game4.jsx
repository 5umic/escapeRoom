import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

// Pixelnivåer: Från väldigt pixlig (0.02) till original (1.0)
const PIXEL_LEVELS = [0.03, 0.06, 0.12, 0.25, 0.5, 1.0];

export default function Game4() {
  const navigate = useNavigate();

  // REFS för Canvas
  const canvasRef = useRef(null);
  const imageRef = useRef(null); // Håller bilden i minnet
  const answerLocked = useRef(false);

  // DATA STATE
  const [gameID, setGameID] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState("loading");

  // GAMEPLAY STATE
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [penaltySeconds, setPenaltySeconds] = useState(0); // Strafftid

  const [pixelIndex, setPixelIndex] = useState(0); // Vilken nivå är vi på?
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
        console.error("Kunde inte hämta spel:", err);
      }
    })();
  }, []);

  // 2. Hämta Slumpmässig Fråga
  const fetchRandomChallenge = async () => {
    if (!gameID) return;
    setStatus("loading");
    setChallenge(null);
    setSelectedOption(null);
    setPixelIndex(0); // Börja om på max pixling
    setPenaltySeconds(0); // Nollställ straff
    answerLocked.current = false;

    try {
      const res = await fetch(
        `${API_BASE}/api/games/${gameID}/challenges/random`,
      );
      if (!res.ok) return;
      const data = await res.json();

      setChallenge(data);
      const limit = data.timeLimitSeconds || 30;
      setTotalTimeLimit(limit);
      setSecondsLeft(limit);

      // Ladda bilden i minnet så vi kan rita den på canvas
      const img = new Image();
      img.src = data.imageUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img; // Spara referens
        setStatus("playing"); // Nu är vi redo att rita
      };
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (gameID) fetchRandomChallenge();
  }, [gameID]);

  // 3. RITA PÅ CANVAS (Körs när status blir playing eller pixelIndex ändras)
  useEffect(() => {
    if (status !== "playing" || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // Sätt canvas storlek till bildens storlek (för responsivitet kan vi använda CSS)
    // För att det ska se bra ut på skärmen, låt oss begränsa bredden
    const maxWidth = 500;
    const scaleFactor = Math.min(maxWidth / img.width, 1);

    canvas.width = img.width * scaleFactor;
    canvas.height = img.height * scaleFactor;

    // Pixel logic (från din script.js)
    const size = PIXEL_LEVELS[pixelIndex];
    const w = canvas.width * size;
    const h = canvas.height * size;

    // 1. Stäng av smoothing för att få pixel-effekten
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    // 2. Rita bilden liten
    ctx.drawImage(img, 0, 0, w, h);

    // 3. Rita den lilla bilden stort igen (detta skapar pixlarna)
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
  }, [status, pixelIndex, challenge]); // Rita om när pixelIndex ändras

  // 4. Timer Logic
  useEffect(() => {
    if (status === "answered_correctly" || status === "time_out") return;
    if (secondsLeft <= 0) {
      setStatus("time_out");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, status]);

  // 5. KLICK PÅ BILDEN (Gör den tydligare + Straff)
  const handleImageClick = () => {
    if (status !== "playing") return;

    // Om vi inte är på sista nivån (originalbilden)
    if (pixelIndex < PIXEL_LEVELS.length - 1) {
      setPixelIndex((prev) => prev + 1); // Gör tydligare
      setPenaltySeconds((prev) => prev + 5); // Lägg till 5s straff
    }
  };

  // 6. HANTERA SVAR
  const onAnswer = (option, index) => {
    if (status !== "playing" || answerLocked.current) return;
    answerLocked.current = true;
    setSelectedOption(option);

    if (index === challenge.correctOptionIndex) {
      // --- RÄTT ---
      // Tid spenderad = (TotalTid - Kvar) + Straff
      const baseTime = totalTimeLimit - secondsLeft;
      const totalSpent = baseTime + penaltySeconds;

      setTimeTaken(totalSpent);

      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + totalSpent);

      // Visa hela bilden när man klarat det
      setPixelIndex(PIXEL_LEVELS.length - 1);
      setStatus("answered_correctly");
    } else {
      // --- FEL ---
      setStatus("answered_wrong");
      answerLocked.current = false;
    }
  };

  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setPenaltySeconds(0);
    setPixelIndex(0);
    setStatus("playing");
    setSelectedOption(null);
    answerLocked.current = false;
  };

  // --- RENDER ---

  if (status === "loading")
    return <div style={styles.container}>Laddar Pixlar...</div>;

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
              <button key={i} onClick={() => onAnswer(opt, i)} style={btnStyle}>
                {opt}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK */}
        {status === "answered_correctly" && (
          <div style={styles.feedbackBoxSuccess}>
            <h3>Snyggt sett!</h3>
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
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={() => navigate("/gymnasium/game5")}
                style={styles.btnNext}
              >
                Gå vidare till Sortera Rätt (Game 5)
              </button>
              {/* <button
                onClick={() => navigate("/gymnasium")}
                style={styles.btnMenu}
              >
                Meny
              </button> */}
            </div>
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
  content: { maxWidth: "600px", width: "100%", textAlign: "center" },
  timerBox: {
    position: "absolute",
    top: 20,
    right: 20,
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
    margin: "20px 0",
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
