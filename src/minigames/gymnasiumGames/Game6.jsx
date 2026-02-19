import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_BASE = "http://localhost:5261";

// Hjäpfunktion för att slumpa
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
    transition,
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

  // Data State
  const [gameID, setGameID] = useState(null);

  // STATS FÖR FLERA OMGÅNGAR
  const [challenges, setChallenges] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const challenge = challenges[currentIndex];
  const [status, setStatus] = useState("loading");

  // Timer & Poäng
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);

  // Orden (deras nuvarande ordning) och Validering
  const [items, setItems] = useState([]);
  const [validation, setValidation] = useState({});

  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Game 6"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // 2. Hämta ALLA unika frågor dynamiskt
  useEffect(() => {
    if (!gameID) return;

    const fetchAllChallenges = async () => {
      setStatus("loading");
      let uniqueChallenges = [];
      let duplicateCount = 0;

      // Hämta tills vi får 5 dubbletter i rad, då vet vi att vi har alla
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

  // Ladda in en ny runda
  const loadRound = (currentChall) => {
    if (!currentChall) return;
    setStatus("loading");
    setValidation({});

    const limit = currentChall.timeLimitSeconds || 30;
    setTotalTimeLimit(limit);
    setSecondsLeft(limit);

    // Slumpa orden så de inte ligger i rätt ordning från början
    setItems(shuffleArray(currentChall.options));
    setStatus("playing");
  };

  // Timer (Uppdaterad med strafftid)
  useEffect(() => {
    if (status === "success" || status === "time_out") return;

    if (secondsLeft <= 0) {
      // Lägg till hela omgångens tid till totaltiden
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + totalTimeLimit);

      setStatus("time_out");
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, status, totalTimeLimit]);

  // Nollställ färgerna om spelaren börjar dra i ord igen
  const handleDragStart = () => {
    if (Object.keys(validation).length > 0) setValidation({});
  };

  // 4. Hantera Drag & Drop (Byt plats på ord)
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 5. Rätta Svar
  const checkAnswer = () => {
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

    if (allCorrect) {
      const spent = totalTimeLimit - secondsLeft;
      setTimeTaken(spent);
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + spent);
      setStatus("success");
    }
  };

  // 6. Gå till nästa ord eller börja om
  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      loadRound(challenges[currentIndex + 1]);
    } else {
      navigate("/gymnasium"); // Gå till menyn eller ett "Grattis"-slut när alla 6 spel är klara!
    }
  };

  const handleRetry = () => {
    loadRound(challenge);
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return <div style={styles.container}>Laddar...</div>;

  const isLastQuestion = currentIndex === challenges.length - 1;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Visar runda och timer */}
        <div style={styles.roundInfo}>
          Ord {currentIndex + 1} av {challenges.length}
        </div>
        <div style={styles.timer}>{secondsLeft}s</div>

        <h2>Bilda Rätta Ordet</h2>
        <p>{challenge.prompt}</p>

        {/* DND CONTEXT FÖR SORTERING */}
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
                  isDisabled={status !== "playing"}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        {/* FEEDBACK & KNAPPAR */}
        {status === "success" && (
          <div style={styles.feedbackBoxSuccess}>
            <h3>Snyggt pusslat! ✅</h3>
            <p>
              ⏱️ Tid för denna fråga: <strong>{timeTaken} sekunder</strong>
            </p>
            <p>
              📊 Total tid hittills:{" "}
              <strong>
                {sessionStorage.getItem("totalGameTime")} sekunder
              </strong>
            </p>
            <button onClick={handleNext} style={styles.btnNext}>
              {isLastQuestion ? "Slutför och gå till Meny" : "Nästa Ord"}
            </button>
          </div>
        )}

        {status === "time_out" && (
          <div style={styles.feedbackBoxError}>
            <h3>Tiden är ute! ⏱️</h3>
            <button onClick={handleRetry} style={styles.btnRetry}>
              Försök igen
            </button>
          </div>
        )}

        {status === "playing" && (
          <button onClick={checkAnswer} style={styles.checkBtn}>
            Kontrollera
          </button>
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

  // Timer & Runda
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
  timer: {
    position: "absolute",
    top: -50,
    left: 0,
    fontSize: 24,
    fontWeight: "bold",
    background: "#fff6b0",
    padding: "10px 20px",
    borderRadius: 20,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
    background: "white",
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
  btnNext: {
    padding: "12px 24px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 10,
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
