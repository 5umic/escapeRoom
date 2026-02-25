import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { getNextGamePath } from "../../utils/navigation";

import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// --- KOMPONENT: SORTERBART KORT ---
function SortableWord({ id, text, validationStatus, isDisabled }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id,
      disabled: isDisabled,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition, // VIKTIGT: dnd-kit sköter animationen här, ingen egen CSS-transition!
    ...styles.card,
    backgroundColor:
      validationStatus === "correct"
        ? "#2ea44f"
        : validationStatus === "incorrect"
          ? "#c62828"
          : "white",
    color: validationStatus ? "white" : "#333",
    borderColor:
      validationStatus === "correct"
        ? "#207a38"
        : validationStatus === "incorrect"
          ? "#8e1c1c"
          : "#ccc",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {text}
    </div>
  );
}

// --- MAIN GAME COMPONENT ---
export default function Game6() {
  const navigate = useNavigate();

  // State
  const [challenges, setChallenges] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const challenge = challenges[currentIndex];

  const [status, setStatus] = useState("loading"); // loading, playing, success, check_failed, time_out
  const [lastPenalty, setLastPenalty] = useState(0);
  const [validation, setValidation] = useState({});
  const [items, setItems] = useState([]);
  const [totalTimeLimit, setTotalTimeLimit] = useState(30);

  // Hook för timern
  const { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession } =
    useGameTimer(totalTimeLimit, status, setStatus);

  // 1. Hämta Data vid start
  useEffect(() => {
    const initGame = async () => {
      setStatus("loading");
      const id = await fetchGameIdByTitle("gymnasium", "Game 6");
      if (id) {
        // Hämtar alla unika ordbyggar-frågor
        const data = await fetchUniqueChallenges(id);
        setChallenges(data);
        loadRound(data[0]);
      }
    };
    initGame();
  }, []);

  const loadRound = (currentChall) => {
    if (!currentChall) return;
    setStatus("loading");
    setValidation({});
    setLastPenalty(0);

    const limit = currentChall.timeLimitSeconds || 30;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);
    setItems(shuffleArray(currentChall.options));
    setStatus("playing");
  };

  // Nollställ färgerna och lås upp knappen om spelaren börjar dra i ord igen
  const handleDragStart = () => {
    if (Object.keys(validation).length > 0) setValidation({});
    if (status === "check_failed") setStatus("playing");
  };

  // 2. Hantera Drag & Drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 3. Rätta Svar
  const checkAnswer = () => {
    if (status === "check_failed") return; // Förhindra spam

    const correctOrder = JSON.parse(challenge.answer);
    let allCorrect = true;
    const newValidation = {};

    items.forEach((item, index) => {
      if (item === correctOrder[index]) {
        newValidation[item] = "correct";
      } else {
        newValidation[item] = "incorrect";
        allCorrect = false;
      }
    });

    setValidation(newValidation);
    const spent = getTimeTaken(); // Hämta spenderad tid via hook

    if (allCorrect) {
      addTimeToSession(spent);
      setStatus("success");
    } else {
      addTimeToSession(spent);
      setLastPenalty(spent);
      setStatus("check_failed");
    }
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      loadRound(challenges[currentIndex + 1]);
    } else {
      navigate(getNextGamePath("Bilda Ordet (Game 6)"));
    }
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return (
      <GameContainer>
        <h2>Laddar...</h2>
      </GameContainer>
    );

  const isLastQuestion = currentIndex === challenges.length - 1;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TimerBar secondsLeft={secondsLeft} totalTimeLimit={totalTimeLimit} />
      <GameContainer>
        {/* Visar runda */}
        <div style={styles.roundInfo}>
          Ord {currentIndex + 1} av {challenges.length}
        </div>

        <h2>Bilda Rätta Ordet</h2>
        <p>{challenge.prompt}</p>

        {/* DND CONTEXT FÖR SORTERING */}
        <div style={styles.sortableContainer}>
          <SortableContext
            items={items}
            strategy={horizontalListSortingStrategy}
          >
            {items.map((word) => (
              <SortableWord
                key={word}
                id={word}
                text={word}
                validationStatus={validation[word]}
                isDisabled={status === "success" || status === "time_out"}
              />
            ))}
          </SortableContext>
        </div>

        {/* --- DRY FEEDBACK --- */}
        {status === "success" && (
          <FeedbackSuccess
            title="Snyggt pusslat!"
            timeTaken={getTimeTaken()}
            totalTime={sessionStorage.getItem("totalGameTime")}
            onNext={handleNext}
            nextText={
              isLastQuestion ? "Gå vidare till nästa spel" : "Nästa Ord"
            }
          />
        )}

        {status === "check_failed" && (
          <FeedbackError
            title="Inte helt rätt"
            message="Byt plats på de röda orden och försök igen. Klockan tickar!"
            penalty={lastPenalty}
          />
        )}

        {status === "time_out" && (
          <FeedbackError
            title="Tiden är ute!"
            message="Du hann inte pussla klart ordet i tid."
            onRetry={() => loadRound(challenge)}
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
            Kontrollera
          </button>
        )}
      </GameContainer>
    </DndContext>
  );
}

// Superslimmad CSS
const styles = {
  roundInfo: {
    position: "absolute",
    top: -50,
    right: 0,
    background: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
  sortableContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "15px",
    padding: "40px 0",
    minHeight: "150px",
  },
  card: {
    padding: "20px 30px",
    fontSize: "22px",
    fontWeight: "bold",
    border: "2px solid #ccc",
    borderRadius: 8,
    cursor: "grab",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    touchAction: "none",
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
  },
};
