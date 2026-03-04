import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNextGameInfo, isLastActiveGame } from "../../utils/navigation";

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
  TimerBar,
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

const CURRENT_GAME_TITLE = "Hänga Gubbe (Game 7)";

export default function Game7() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // State
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState("loading");

  // Hangman State
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 10;
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);

  // Dynamisk navigation
  const isLast = isLastActiveGame(CURRENT_GAME_TITLE);
  const nextPath = getNextGameInfo(CURRENT_GAME_TITLE);

  // 1. Hämta Data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");
      const id = await fetchGameIdByTitle("gymnasium", CURRENT_GAME_TITLE);
      if (id) {
        const data = await fetchUniqueChallenges(id, 1);
        if (data.length > 0) setupChallenge(data[0]);
      }
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

  // 2. RITA GUBBEN
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 150, 150);
    ctx.beginPath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;

    const drawLine = (fromX, fromY, toX, toY) => {
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    };

    if (mistakes >= 1) drawLine(0, 140, 150, 140);
    if (mistakes >= 2) drawLine(10, 0, 10, 140);
    if (mistakes >= 3) drawLine(0, 5, 70, 5);
    if (mistakes >= 4) drawLine(60, 5, 60, 15);
    if (mistakes >= 5) {
      ctx.beginPath();
      ctx.arc(60, 25, 10, 0, Math.PI * 2, true);
      ctx.stroke();
    }
    if (mistakes >= 6) drawLine(60, 35, 60, 70);
    if (mistakes >= 7) drawLine(60, 46, 20, 50);
    if (mistakes >= 8) drawLine(60, 46, 100, 50);
    if (mistakes >= 9) drawLine(60, 70, 20, 100);
    if (mistakes >= 10) drawLine(60, 70, 100, 100);
  }, [mistakes]);

  // 3. HANTERA GISSNING
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
        <h2>Laddar Hänga Gubbe...</h2>
      </GameContainer>
    );

  const word = challenge.answer.toUpperCase();

  const isLastQuestion = true;

  return (
    <>
      <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
      <GameContainer>
        <h2>Hänga Gubbe</h2>
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
            title={
              isLast
                ? "Grattis, du överlevde hela pixeljakten!"
                : "Snyggt gissat!"
            }
            timeTaken={getTimeTaken()}
            totalTime={sessionStorage.getItem("totalGameTime")}
            onNext={() => navigate(nextPath)}
            nextText={isLast ? "Se Leaderboard 🏆" : "Nästa utmaning"}
            currentGameTitle="Hänga Gubbe (Game 7)"
            isLastQuestion={true}
          />
        )}

        {status === "answered_wrong" && (
          <FeedbackError
            title="Åh nej, gubben hängdes! 💀"
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
