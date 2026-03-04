import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { getNextGameInfo, isLastActiveGame } from "../../utils/navigation";

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

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// --- KOMPONENT: DRAGGABLE CARD (ORDET) ---
function DraggableCard({ id, text, isDisabled, validationStatus }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: isDisabled,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  let bgColor = "white",
    color = "#333",
    borderColor = "#999";
  if (validationStatus === "correct") {
    bgColor = "#2ea44f";
    color = "white";
    borderColor = "#207a38";
  } else if (validationStatus === "incorrect") {
    bgColor = "#c62828";
    color = "white";
    borderColor = "#8e1c1c";
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.card,
        ...style,
        backgroundColor: bgColor,
        color,
        borderColor,
      }}
      {...listeners}
      {...attributes}
    >
      {text}
    </div>
  );
}

// --- KOMPONENT: DROPPABLE BOX (LÅDAN) ---
function DroppableBox({ id, title, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const boxStyle = {
    ...styles.box,
    backgroundColor: isOver ? "#e3f2fd" : "white",
    border: isOver ? "2px solid #2196f3" : "2px solid #ccc",
  };

  return (
    <div ref={setNodeRef} style={boxStyle}>
      <h3 style={{ margin: "0 0 10px 0", color: "#b10000" }}>{title}</h3>
      <div style={styles.boxContent}>{children}</div>
    </div>
  );
}

// --- MAIN GAME COMPONENT ---
export default function Game5() {
  const navigate = useNavigate();

  // State
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState("loading"); // loading, playing, success, check_failed, time_out
  const [lastPenalty, setLastPenalty] = useState(0);
  const [validation, setValidation] = useState({});
  const [categories, setCategories] = useState([]);
  const [containers, setContainers] = useState({ pool: [] });
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);

  // Hook för timern
  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus);

  const lastGame = isLastActiveGame("Sortera Rätt (Game 5)");
  const nextPath = getNextGameInfo("Sortera Rätt (Game 5)");

  // 1. Hämta Data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");
      const id = await fetchGameIdByTitle("gymnasium", "Game 5");
      if (id) {
        // Hämtar en fråga (sortering)
        const data = await fetchUniqueChallenges(id, 1);
        if (data.length > 0) setupChallenge(data[0]);
      }
    };
    initGame();
  }, []);

  const setupChallenge = (data) => {
    setChallenge(data);
    const limit = data.timeLimitSeconds || 60;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);
    setLastPenalty(0);
    setValidation({});

    const correctMapping = JSON.parse(data.answer);
    const dynamicCategories = Object.keys(correctMapping);
    setCategories(dynamicCategories);

    const initialContainers = { pool: shuffleArray(data.options) };
    dynamicCategories.forEach((cat) => (initialContainers[cat] = []));
    setContainers(initialContainers);
    setStatus("playing");
  };

  // Nollställ färgerna och lås upp kontroll-knappen vid drag
  const handleDragStart = () => {
    if (Object.keys(validation).length > 0) setValidation({});
    if (status === "check_failed") setStatus("playing");
  };

  // 2. Hantera Drag & Drop Slut
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const word = active.id;
    const fromContainer = Object.keys(containers).find((key) =>
      containers[key].includes(word),
    );
    const toContainer = over.id;

    if (!fromContainer || !toContainer || fromContainer === toContainer) return;

    setContainers((prev) => {
      const newFrom = prev[fromContainer].filter((w) => w !== word);
      const newTo = [...prev[toContainer], word];
      return { ...prev, [fromContainer]: newFrom, [toContainer]: newTo };
    });
  };

  // 3. Rätta Svar
  const checkAnswer = () => {
    if (status === "check_failed") return; // Förhindra dubbelklick

    const correctMapping = JSON.parse(challenge.answer);
    let allCorrect = true;
    const newValidation = {};

    // Är startpoolen tom? Om inte, är det automatiskt fel.
    if (containers.pool.length > 0) {
      allCorrect = false;
      // Markera de ord som ligger kvar i poolen som felaktiga
      containers.pool.forEach((word) => {
        newValidation[word] = "incorrect";
      });
    }

    categories.forEach((category) => {
      const userWords = containers[category] || [];
      const correctWords = correctMapping[category] || [];

      // Kontrollera om antalet ord matchar
      if (userWords.length !== correctWords.length) allCorrect = false;

      userWords.forEach((word) => {
        if (correctWords.includes(word)) {
          newValidation[word] = "correct";
        } else {
          newValidation[word] = "incorrect";
          allCorrect = false;
        }
      });
    });

    setValidation(newValidation);
    const spent = getTimeTaken();

    if (allCorrect) {
      addTimeToSession(spent);
      setStatus("success");
    } else {
      // Vi lägger till strafftid men låter spelaren fortsätta efter att ha fått feedback på vilka kort som är felplacerade
      addTimeToSession(spent);
      setLastPenalty(spent);
      setStatus("check_failed");
    }
  };

  // 4. Börja om vid Time Out
  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setStatus("playing");
    setValidation({});
    setLastPenalty(0);

    const allWords = Object.values(containers).flat();
    const resetContainers = { pool: shuffleArray(allWords) };
    categories.forEach((cat) => (resetContainers[cat] = []));
    setContainers(resetContainers);
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return (
      <GameContainer>
        <h2>Laddar...</h2>
      </GameContainer>
    );

  const isLastQuestion = true;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <>
        <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
        <GameContainer>
          <h2>Sortera Korten</h2>
          <p>{challenge.prompt}</p>

          {/* DYNAMISKA BOXAR */}
          <div style={styles.boxContainer}>
            {categories.map((cat) => (
              <DroppableBox key={cat} id={cat} title={cat}>
                {containers[cat].map((w) => (
                  <DraggableCard
                    key={w}
                    id={w}
                    text={w}
                    validationStatus={validation[w]}
                    isDisabled={status === "success" || status === "time_out"}
                  />
                ))}
              </DroppableBox>
            ))}
          </div>

          {/* STARTPOOL */}
          <div style={styles.poolArea}>
            <DroppableBox id="pool" title="Ord att sortera">
              <div style={styles.poolGrid}>
                {containers.pool.map((w) => (
                  <DraggableCard
                    key={w}
                    id={w}
                    text={w}
                    validationStatus={validation[w]}
                    isDisabled={status === "success" || status === "time_out"}
                  />
                ))}
              </div>
            </DroppableBox>
          </div>

          {/* --- DRY FEEDBACK --- */}
          {status === "success" && (
            <FeedbackSuccess
              title={
                lastGame
                  ? "Grattis, du klarade sista spelet!"
                  : "Snyggt sorterat!"
              }
              timeTaken={getTimeTaken()}
              totalTime={sessionStorage.getItem("totalGameTime")}
              nextText={lastGame ? "Se Leaderboard 🏆" : "Nästa utmaning"}
              currentGameTitle="Sortera Rätt (Game 5)"
              isLastQuestion={true}
            />
          )}

          {status === "check_failed" && (
            <FeedbackError
              title="Inte helt rätt"
              message={
                containers.pool.length > 0
                  ? "Du måste sortera ALLA kort innan du kontrollerar! Klockan tickar!"
                  : "Några kort ligger i fel box. Flytta de röda korten och försök igen! Klockan tickar!"
              }
              penalty={lastPenalty}
              // Lägg till onRetry här så att spelaren kan klicka bort rutan och fortsätta
              onRetry={() => setStatus("playing")}
            />
          )}

          {status === "time_out" && (
            <FeedbackError
              title="Tiden är ute!"
              message="Du hann inte sortera alla kort i tid."
              onRetry={handleRetry}
            />
          )}

          {status !== "success" && status !== "time_out" && (
            <button
              onClick={checkAnswer}
              style={{
                ...styles.checkBtn,
                opacity: status === "check_failed" ? 0.6 : 1,
                cursor: status === "check_failed" ? "not-allowed" : "pointer",
              }}
              disabled={status === "check_failed"}
            >
              Kontrollera svar
            </button>
          )}
        </GameContainer>
      </>
    </DndContext>
  );
}

// Styling
const styles = {
  boxContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  box: {
    flex: "1 1 30%",
    minWidth: "200px",
    minHeight: "200px",
    borderRadius: 8,
    padding: 15,
    transition: "background 0.2s",
  },
  boxContent: {
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  poolArea: { marginTop: 30, borderTop: "2px dashed #ccc", paddingTop: 20 },
  poolGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  card: {
    padding: "10px 15px",
    border: "2px solid #999",
    borderRadius: 5,
    cursor: "grab",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    fontWeight: "bold",
    touchAction: "none",
    transition: "background-color 0.3s, border-color 0.3s, color 0.3s",
  },
  checkBtn: {
    padding: "15px 40px",
    fontSize: 18,
    fontWeight: "bold",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 20,
    width: "100%",
    maxWidth: "400px",
  },
};
