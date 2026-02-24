import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");

export default function Game7() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Data State
  const [gameID, setGameID] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, playing, answered_correctly, answered_wrong, time_out

  // Hangman State
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 10; // Det tar 10 streck att rita hela gubben

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [totalTimeLimit, setTotalTimeLimit] = useState(120);
  const [timeTaken, setTimeTaken] = useState(0);

  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Game 7"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // 2. Hämta Fråga
  const fetchChallenge = async () => {
    if (!gameID) return;
    setStatus("loading");
    setGuessedLetters([]);
    setMistakes(0);

    try {
      const res = await fetch(
        `${API_BASE}/api/games/${gameID}/challenges/random`,
      );
      const data = await res.json();
      setChallenge(data);

      const limit = data.timeLimitSeconds || 120;
      setTotalTimeLimit(limit);
      setSecondsLeft(limit);
      setStatus("playing");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (gameID) fetchChallenge();
  }, [gameID]);

  // 3. Timer (Samma princip som tidigare spel)
  useEffect(() => {
    if (
      status === "answered_correctly" ||
      status === "answered_wrong" ||
      status === "time_out"
    )
      return;

    if (secondsLeft <= 0) {
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + totalTimeLimit);
      setStatus("time_out");
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, status, totalTimeLimit]);

  // 4. RITA GUBBEN PÅ CANVAS
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    // Rensa hela canvasen inför varje omritning
    ctx.clearRect(0, 0, 150, 150);
    ctx.beginPath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;

    const drawLine = (fromX, fromY, toX, toY) => {
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    };

    // Rita delarna beroende på antalet misstag
    if (mistakes >= 1) drawLine(0, 140, 150, 140); // Basen
    if (mistakes >= 2) drawLine(10, 0, 10, 140); // Stolpen
    if (mistakes >= 3) drawLine(0, 5, 70, 5); // Överliggaren
    if (mistakes >= 4) drawLine(60, 5, 60, 15); // Repet

    if (mistakes >= 5) {
      // Huvudet
      ctx.beginPath();
      ctx.arc(60, 25, 10, 0, Math.PI * 2, true);
      ctx.stroke();
    }

    if (mistakes >= 6) drawLine(60, 35, 60, 70); // Kroppen
    if (mistakes >= 7) drawLine(60, 46, 20, 50); // Vänster arm
    if (mistakes >= 8) drawLine(60, 46, 100, 50); // Höger arm
    if (mistakes >= 9) drawLine(60, 70, 20, 100); // Vänster ben
    if (mistakes >= 10) drawLine(60, 70, 100, 100); // Höger ben
  }, [mistakes, status]); // Rita om varje gång misstag ändras

  // 5. HANTERA GISSNING
  const handleGuess = (letter) => {
    if (status !== "playing" || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    const word = challenge.answer.toUpperCase();

    // Om bokstaven INTE finns i ordet
    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);

      // Kolla om vi har förlorat
      if (newMistakes >= maxMistakes) {
        setStatus("answered_wrong");
      }
    }
    // Om bokstaven FINNS i ordet
    else {
      // Kolla om vi har vunnit (alla bokstäver i ordet finns i guessedLetters)
      const isWinner = word
        .split("")
        .every((char) => newGuessedLetters.includes(char));
      if (isWinner) {
        const spent = totalTimeLimit - secondsLeft;
        setTimeTaken(spent);
        const currentTotal =
          Number(sessionStorage.getItem("totalGameTime")) || 0;
        sessionStorage.setItem("totalGameTime", currentTotal + spent);
        setStatus("answered_correctly");
      }
    }
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return <div style={styles.container}>Laddar Hänga Gubbe...</div>;

  const word = challenge.answer.toUpperCase();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.timer}>{secondsLeft}s</div>

        <h2>Hänga Gubbe</h2>
        <p style={{ margin: "20px 0" }}>{challenge.prompt}</p>

        {/* CANVAS (GUBBEN) */}
        <div style={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width="150"
            height="150"
            style={styles.canvas}
          />
          <p style={styles.livesText}>
            Försök kvar: <strong>{maxMistakes - mistakes}</strong>
          </p>
        </div>

        {/* ORDET SOM SKA GISSAS */}
        <div style={styles.wordContainer}>
          {word.split("").map((char, index) => (
            <span key={index} style={styles.letterSlot}>
              {guessedLetters.includes(char) || status === "answered_wrong"
                ? char
                : ""}
            </span>
          ))}
        </div>

        {/* ALFABETET / TANGENTBORDET */}
        <div style={styles.keyboard}>
          {ALPHABET.map((letter) => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && word.includes(letter);
            const isWrong = isGuessed && !word.includes(letter);

            // Dynamisk knappfärg baserat på status
            let btnStyle = { ...styles.keyBtn };
            if (isCorrect) btnStyle.backgroundColor = "#2ea44f"; // Grön
            if (isWrong) btnStyle.backgroundColor = "#c62828"; // Röd
            if (isGuessed) btnStyle.color = "white";

            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                style={btnStyle}
                disabled={isGuessed || status !== "playing"}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK & KNAPPAR */}
        {status === "answered_correctly" && (
          <div style={styles.feedbackBoxSuccess}>
            <h3>Grattis, du överlevde! ✅</h3>
            <p>
              ⏱️ Tid för denna fråga: <strong>{timeTaken} sekunder</strong>
            </p>
            <p>
              📊 Total tid hittills:{" "}
              <strong>
                {sessionStorage.getItem("totalGameTime")} sekunder
              </strong>
            </p>
            <button
              onClick={() => navigate("/gymnasium")}
              style={styles.btnSuccess}
            >
              Avsluta & Till Meny
            </button>
          </div>
        )}

        {status === "answered_wrong" && (
          <div style={styles.feedbackBoxError}>
            <h3>Åh nej, gubben hängdes! 💀</h3>
            <p>
              Ordet var: <strong>{word}</strong>
            </p>
            <button onClick={fetchChallenge} style={styles.btnRetry}>
              Försök igen
            </button>
          </div>
        )}

        {status === "time_out" && (
          <div style={styles.feedbackBoxError}>
            <h3>Tiden är ute! ⏱️</h3>
            <button onClick={fetchChallenge} style={styles.btnRetry}>
              Börja om
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling (Anpassad för att matcha dina andra React-spel)
const styles = {
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
  },

  canvasWrapper: { marginBottom: "20px" },
  canvas: {
    border: "2px dashed #ccc",
    borderRadius: "10px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
  },
  livesText: { fontSize: "18px", color: "#b10000", marginTop: "10px" },

  wordContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    margin: "30px 0",
  },
  letterSlot: {
    width: "40px",
    height: "50px",
    fontSize: "32px",
    fontWeight: "bold",
    borderBottom: "4px solid #333",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: "5px",
    textTransform: "uppercase",
  },

  keyboard: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  keyBtn: {
    width: "45px",
    height: "45px",
    fontSize: "18px",
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "0.2s",
  },

  btnSuccess: {
    padding: "15px 40px",
    fontSize: 18,
    fontWeight: "bold",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 20,
  },
  btnRetry: {
    padding: "15px 40px",
    fontSize: 18,
    fontWeight: "bold",
    background: "#c62828",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 20,
  },

  feedbackBoxSuccess: {
    background: "#e6fffa",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    border: "2px solid #2ea44f",
  },
  feedbackBoxError: {
    background: "#ffe6e6",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    border: "2px solid #c62828",
    color: "#c62828",
  },
};
