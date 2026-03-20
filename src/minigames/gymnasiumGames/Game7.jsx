import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNextGameInfo, isLastActiveGame } from "../../utils/navigation";

import {
  fetchGameIdByTitle,
  fetchUniqueChallenges,
  fetchGameDetails,
} from "../gymnasiumGames/api/gameApi";
import { useGameTimer } from "../gymnasiumGames/hooks/useGameTimer";
import {
  GameContainer,
  FeedbackSuccess,
  FeedbackError,
  TimerBar,
  GameNavbar,
} from "../gymnasiumGames/components/GameUI";

// QWERTY-style alfabetet
const ALPHABET = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "Å",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "Ö",
  "Ä",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
];

const CURRENT_GAME_TITLE = "Trafikljuset (Game 7)"; // Uppdaterat titel

export default function Game7() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // State
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState("loading");

  // Game State
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 9; // Ändrat från 10 till 9 försök
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [gameData, setGameData] = useState(null);

  // Dynamisk navigation
  const isLast = isLastActiveGame("Hänga Gubbe (Game 7)");
  const nextPath = getNextGameInfo("Hänga Gubbe (Game 7)");

  // --- RITAR TRAFIKLJUSET ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    // Rensa canvasen
    ctx.clearRect(0, 0, 150, 150);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // --- STEG 0: ALLTID RITA MILJÖN (TRÄD OCH TROTTOAR) ---
    // Trottoar och kant (Längst ner)
    ctx.beginPath();
    ctx.fillStyle = "#999"; // Grå trottoar
    ctx.fillRect(0, 130, 150, 20);
    ctx.fillStyle = "#666"; // Mörkare kant
    ctx.fillRect(0, 130, 150, 4);

    // Träd (Till vänster)
    // Stam
    ctx.beginPath();
    ctx.fillStyle = "#8B4513"; // Brun stam
    ctx.fillRect(20, 70, 15, 60);
    // Krona
    ctx.beginPath();
    ctx.fillStyle = "#228B22"; // Grön krona
    ctx.arc(27.5, 60, 25, 0, Math.PI * 2);
    ctx.arc(45, 75, 20, 0, Math.PI * 2);
    ctx.arc(10, 75, 20, 0, Math.PI * 2);
    ctx.fill();

    // Markera vart ljuset ska stå (En liten platta)
    ctx.beginPath();
    ctx.fillStyle = "#555";
    ctx.fillRect(80, 125, 40, 5);

    // --- STEG 1-9: RITA PÅBYGGNAD BASERAT PÅ MISSTAG ---

    // 1: Stolpen ritas (Ett vertikalt streck)
    if (mistakes >= 1) {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#444";
      ctx.moveTo(100, 125);
      ctx.lineTo(100, 30);
      ctx.stroke();
      ctx.lineWidth = 2; // Nollställ width
    }

    // 2: Armaturen/Lådan (Ramen för ljusen) ritas
    if (mistakes >= 2) {
      ctx.beginPath();
      ctx.fillStyle = "#333"; // Mörkgrå låda
      ctx.fillRect(85, 30, 30, 70);
      ctx.strokeRect(85, 30, 30, 70); // Kant
    }

    // 3: Topp-cirkeln (Där röda ska sitta) ritas (tom)
    if (mistakes >= 3) {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(100, 45, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 4: Mitten-cirkeln (Där gula ska sitta) ritas (tom)
    if (mistakes >= 4) {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(100, 65, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 5: Botten-cirkeln (Där gröna ska sitta) ritas (tom)
    if (mistakes >= 5) {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(100, 85, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 7: Det GULA ljuset tänds (Mitten)
    if (mistakes >= 7) {
      ctx.beginPath();
      ctx.fillStyle = "#ffeb3b"; // Klar gul
      ctx.arc(100, 65, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8: Det GRÖNA ljuset tänds (Botten)
    if (mistakes >= 6) {
      ctx.beginPath();
      ctx.fillStyle = "#00e676"; // Klar grön
      ctx.arc(100, 85, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8: Det RÖDA ljuset tänds (Topp)
    if (mistakes >= 8) {
      ctx.beginPath();
      ctx.fillStyle = "#ff1744"; // Klar röd
      ctx.arc(100, 45, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9: Sol-skydden/Skärmarna läggs till (Allt klart, men fullt ljus)
    if (mistakes >= 9) {
      const drawVisor = (y) => {
        ctx.beginPath();
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 3;
        ctx.moveTo(90, y - 5);
        ctx.lineTo(110, y - 5);
        ctx.stroke();
      };
      drawVisor(45);
      drawVisor(65);
      drawVisor(85);
      ctx.lineWidth = 2; // Nollställ
    }
  }, [mistakes]);

  // 1. Hämta Data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");

      // 1. Hämta ID
      const id = await fetchGameIdByTitle("gymnasium", "Hänga Gubbe");

      if (id) {
        // 2. Hämta ALLT parallellt (Spelinfo + Utmaning)
        const [info, challenges] = await Promise.all([
          fetchGameDetails(id),
          fetchUniqueChallenges(id, 1),
        ]);

        // 3. Spara ner allt
        if (info) setGameData(info);
        if (challenges.length > 0) setupChallenge(challenges[0]);
      }
      setStatus("playing");
    };
    initGame();
  }, []);

  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus);

  const setupChallenge = (data) => {
    if (!data) return;
    setChallenge(data);
    const limit = data.timeLimitSeconds || 60;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);
    setGuessedLetters([]);
    setMistakes(0);
    setStatus("playing");
  };

  // --- 3. HANTERA GISSNING ---
  const handleGuess = (letter) => {
    if (status !== "playing" || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    const word = challenge.answer.toUpperCase();
    const spent = getTimeTaken();

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= maxMistakes) {
        addTimeToSession(spent);
        setStatus("answered_wrong");
      }
    } else {
      const isWinner = word
        .split("")
        .every((char) => newGuessedLetters.includes(char) || char === " ");
      if (isWinner) {
        addTimeToSession(spent);
        setStatus("answered_correctly");
      }
    }
  };

  if (status === "loading" || !challenge)
    return (
      <GameContainer>
        <h2>Laddar Trafikljuset...</h2>
      </GameContainer>
    );

  const word = challenge.answer.toUpperCase();

  return (
    <>
      <GameNavbar gameTitle="Gissa Ordet" />
      <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
      <GameContainer>
        <h2>Trafikljuset</h2> {/* Uppdaterat rubrik */}
        <p style={{ marginBottom: "20px" }}>{challenge.prompt}</p>
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
        <div style={styles.wordContainer}>
          {word.split("").map((char, index) => (
            <span key={index} style={styles.letterSlot}>
              {char === " "
                ? "\u00A0"
                : guessedLetters.includes(char)
                  ? char
                  : ""}
            </span>
          ))}
        </div>
        <div style={styles.keyboard}>
          {ALPHABET.map((letter) => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && word.includes(letter);
            const isWrong = isGuessed && !word.includes(letter);

            let btnStyle = { ...styles.keyBtn };
            if (isCorrect) btnStyle.backgroundColor = "#2ea44f";
            if (isWrong) btnStyle.backgroundColor = "#c62828";
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
        {status === "answered_correctly" && (
          <FeedbackSuccess
            successMessage={gameData?.successMessage}
            title={
              isLast
                ? "Grattis, du tog dig genom pixel-trafiken!"
                : "Snyggt gissat!"
            }
            timeTaken={getTimeTaken()}
            totalTime={sessionStorage.getItem("totalGameTime")}
            onNext={() => navigate(nextPath)}
            nextText={isLast ? "Se Leaderboard 🏆" : "Nästa utmaning"}
            currentGameTitle="Hänga Gubbe (Game 7)" // Behåller originaltiteln för att feedback ska stämma
            isLastQuestion={true}
          />
        )}
        {status === "answered_wrong" && (
          <FeedbackError
            title="Tiden gick ut! Trafikljuset slog om till rött. 🛑"
            penalty={getTimeTaken()}
            onRetry={() => setupChallenge(challenge)}
          />
        )}
        {status === "time_out" && (
          <FeedbackError
            title="Tiden är ute! ⏱️"
            onRetry={() => setupChallenge(challenge)}
          />
        )}
      </GameContainer>
    </>
  );
}

const styles = {
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
    width: "35px",
    height: "45px",
    fontSize: "28px",
    fontWeight: "bold",
    borderBottom: "4px solid #333",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    textTransform: "uppercase",
  },
  keyboard: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "6px",
    maxWidth: "560px",
    margin: "0 auto",
  },
  keyBtn: {
    width: "42px",
    height: "45px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
