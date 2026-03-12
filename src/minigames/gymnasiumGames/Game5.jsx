import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
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

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// --- KOMPONENT: DRAGGABLE CARD ---
function DraggableCard({ id, text, isDisabled, validationStatus }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: isDisabled,
    });

  // Optimerad transform
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    willChange: "transform", // KEYWORD för bättre prestanda under drag
  };

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

// --- KOMPONENT: DROPPABLE BOX ---
function DroppableBox({ id, title, children, isPool }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const boxStyle = {
    ...styles.box,
    backgroundColor: isOver ? "#e3f2fd" : isPool ? "#f9f9f9" : "white",
    border: isOver
      ? "2px solid #2196f3"
      : isPool
        ? "2px dashed #ccc"
        : "2px solid #ccc",
    // Fixar storleken:
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div ref={setNodeRef} style={boxStyle}>
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "1.1rem",
          color: isPool ? "#666" : "#b10000",
        }}
      >
        {title}
      </h3>
      <div style={styles.boxContent}>
        <div style={{ display: "grid", gap: "10px", width: "100%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Game5() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState("loading");
  const [validation, setValidation] = useState({});
  const [categories, setCategories] = useState([]);
  const [containers, setContainers] = useState({ pool: [] });
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [gameData, setGameData] = useState(null);

  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus);

  const lastGame = isLastActiveGame("Sortera Rätt (Game 5)");

  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");

      // 1. Hämta ID
      const id = await fetchGameIdByTitle("gymnasium", "Game 5");

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
  const setupChallenge = (data) => {
    setChallenge(data);
    const limit = data.timeLimitSeconds || 60;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);
    setValidation({});

    const correctMapping = JSON.parse(data.answer);
    const dynamicCategories = Object.keys(correctMapping);
    setCategories(dynamicCategories);

    const initialContainers = { pool: shuffleArray(data.options) };
    dynamicCategories.forEach((cat) => (initialContainers[cat] = []));
    setContainers(initialContainers);
    setStatus("playing");
  };

  const handleDragStart = () => {
    if (status === "check_failed") {
      setValidation({});
      setStatus("playing");
    }
  };

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

  const checkAnswer = () => {
    const correctMapping = JSON.parse(challenge.answer);
    let allCorrect = true;
    const newValidation = {};

    // Samla alla ord som SKA vara i boxar
    const allCorrectWords = Object.values(correctMapping).flat();

    // 1. Kolla boxarna
    categories.forEach((category) => {
      const userWords = containers[category] || [];
      const correctWordsForThisCat = correctMapping[category] || [];

      userWords.forEach((word) => {
        if (correctWordsForThisCat.includes(word)) {
          newValidation[word] = "correct";
        } else {
          newValidation[word] = "incorrect";
          allCorrect = false;
        }
      });

      // Om boxen saknar ord som borde vara där
      if (userWords.length < correctWordsForThisCat.length) {
        allCorrect = false;
      }
    });

    // 2. Kolla poolen (Ord som ligger kvar men borde vara i en box)
    containers.pool.forEach((word) => {
      if (allCorrectWords.includes(word)) {
        newValidation[word] = "incorrect"; // Markera som rött för att visa att det SKA flyttas
        allCorrect = false;
      }
    });

    setValidation(newValidation);

    if (allCorrect) {
      addTimeToSession(getTimeTaken());
      setStatus("success");
    } else {
      // Straff: Dra av 10 sekunder från klockan direkt (eller valfri mängd)
      setSecondsLeft((prev) => Math.max(0, prev - 10));
      setStatus("check_failed");
    }
  };

  const handleRetry = () => {
    setupChallenge(challenge);
  };

  if (status === "loading" || !challenge)
    return (
      <GameContainer>
        <h2>Laddar...</h2>
      </GameContainer>
    );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <>
        <GameNavbar gameTitle="Sortera Rätt" />
        <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
        <GameContainer>
          <h2>Sortera Rätt</h2>
          <p style={{ marginBottom: "20px" }}>{challenge.prompt}</p>

          <div style={styles.boxContainer}>
            {categories.map((cat) => (
              <DroppableBox key={cat} id={cat} title={cat}>
                {containers[cat].map((w) => (
                  <DraggableCard
                    key={w}
                    id={w}
                    text={w}
                    validationStatus={validation[w]}
                    isDisabled={status === "success"}
                  />
                ))}
              </DroppableBox>
            ))}
          </div>

          <DroppableBox
            id="pool"
            title="Ordpool (Vissa ord ska ligga kvar här)"
            isPool
          >
            <div style={styles.boxContent}>
              {containers.pool.map((w) => (
                <DraggableCard
                  key={w}
                  id={w}
                  text={w}
                  validationStatus={validation[w]}
                  isDisabled={status === "success"}
                />
              ))}
            </div>
          </DroppableBox>

          {status === "success" && (
            <FeedbackSuccess
              successMessage={gameData?.successMessage}
              title={
                lastGame ? "Fantastiskt! Du klarade allt!" : "Snyggt jobbat!"
              }
              timeTaken={getTimeTaken()}
              totalTime={sessionStorage.getItem("totalGameTime")}
              nextText={lastGame ? "Leaderboard 🏆" : "Nästa spel"}
              currentGameTitle="Sortera Rätt (Game 5)"
              isLastQuestion={true}
            />
          )}

          {status === "check_failed" && (
            <FeedbackError
              title="Inte riktigt rätt!"
              message="Några ord ligger fel, eller så saknas viktiga ord i boxarna. Du fick 10 sekunder tidsstraff! Försök igen direkt."
              onRetry={() => setStatus("playing")}
            />
          )}

          {status === "time_out" && (
            <FeedbackError
              title="Tiden tog slut!"
              message="Försök igen från början för att klara utmaningen."
              onRetry={handleRetry}
            />
          )}

          {status === "playing" && (
            <button onClick={checkAnswer} style={styles.checkBtn}>
              Kontrollera svar
            </button>
          )}
        </GameContainer>
      </>
    </DndContext>
  );
}

const styles = {
  boxContainer: {
    display: "grid", // Ändrat från flex till grid för perfekt linjering
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    width: "100%",
    marginBottom: "30px",
  },
  box: {
    minHeight: "250px", // Fast minsta höjd så boxarna är lika stora
    borderRadius: "12px",
    padding: "15px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },
  boxContent: {
    flex: 1, // Fyller ut boxen
    display: "flex",
    flexWrap: "wrap", // Gör att orden kan ligga sida vid sida inuti boxen
    alignContent: "flex-start",
    justifyContent: "center",
    gap: "10px",
    padding: "5px",
  },
  card: {
    padding: "10px 18px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "0.95rem",
    backgroundColor: "white",
    userSelect: "none",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    touchAction: "none", // Viktigt för mobiler och smidighet
  },
  checkBtn: {
    padding: "15px 40px",
    fontSize: 18,
    fontWeight: "bold",
    background: "#b10000",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 20,
    width: "100%",
    maxWidth: "300px",
  },
};
