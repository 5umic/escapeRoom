import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const API_BASE = "http://localhost:5261";

// Hjäpfunktion för att slumpa ordningen i en array
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

// --- KOMPONENT: DRAGGABLE CARD (ORDET) ---
function DraggableCard({ id, text, isDisabled, validationStatus }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    disabled: isDisabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  let bgColor = "white";
  let color = "#333";
  let borderColor = "#999";

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
        color: color,
        borderColor: borderColor,
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
  const [gameID, setGameID] = useState(null);
  const [challenge, setChallenge] = useState(null);

  // Status och Straff
  const [status, setStatus] = useState("loading"); // loading, playing, success, check_failed, time_out
  const [lastPenalty, setLastPenalty] = useState(0);
  const [validation, setValidation] = useState({});

  // DYNAMISKA KATEGORIER!
  const [categories, setCategories] = useState([]);

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);

  // Sorting State
  const [containers, setContainers] = useState({ pool: [] });

  // 1. Hämta Game ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Game 5"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // 2. Hämta Utmaning och BYGG UPP DYNAMISKT
  const fetchChallenge = async () => {
    if (!gameID) return;
    setStatus("loading");
    setValidation({});
    setLastPenalty(0);

    try {
      const res = await fetch(
        `${API_BASE}/api/games/${gameID}/challenges/random`,
      );
      const data = await res.json();
      setChallenge(data);

      const limit = data.timeLimitSeconds || 60;
      setTotalTimeLimit(limit);
      setSecondsLeft(limit);

      const correctMapping = JSON.parse(data.answer);
      const dynamicCategories = Object.keys(correctMapping);
      setCategories(dynamicCategories);

      const initialContainers = {
        pool: shuffleArray(data.options),
      };

      dynamicCategories.forEach((cat) => {
        initialContainers[cat] = [];
      });

      setContainers(initialContainers);
      setStatus("playing");
    } catch (err) {
      console.error("Fel vid hämtning av fråga:", err);
    }
  };

  useEffect(() => {
    if (gameID) fetchChallenge();
  }, [gameID]);

  // 3. Timer (Uppdaterad för att inte pausa på check_failed)
  useEffect(() => {
    // Klockan stannar BARA när man vinner eller när tiden går ut.
    // Vid check_failed tickar den vidare!
    if (status === "success" || status === "time_out") return;

    if (secondsLeft <= 0) {
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + totalTimeLimit);
      setStatus("time_out");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, status, totalTimeLimit]);

  // Nollställ färgerna och status om man börjar dra i ett kort
  const handleDragStart = () => {
    if (Object.keys(validation).length > 0) setValidation({});
    if (status === "check_failed") setStatus("playing"); // Låser upp knappen igen
  };

  // 4. Hantera Drag & Drop Slut
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const word = active.id;
    const fromContainer = findContainer(word);
    const toContainer = over.id;

    if (!fromContainer || !toContainer || fromContainer === toContainer) return;

    setContainers((prev) => {
      const newFrom = prev[fromContainer].filter((w) => w !== word);
      const newTo = [...prev[toContainer], word];
      return { ...prev, [fromContainer]: newFrom, [toContainer]: newTo };
    });
  };

  const findContainer = (word) => {
    return Object.keys(containers).find((key) =>
      containers[key].includes(word),
    );
  };

  // 5. Rätta Svar DYNAMISKT
  const checkAnswer = () => {
    if (status === "check_failed") return; // Förhindra dubbelklick

    const correctMapping = JSON.parse(challenge.answer);
    let allCorrect = true;
    const newValidation = {};

    categories.forEach((category) => {
      const userWords = containers[category] || [];
      const correctWords = correctMapping[category] || [];

      if (userWords.length !== correctWords.length) {
        allCorrect = false;
      }

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

    const spent = totalTimeLimit - secondsLeft;
    const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;

    if (allCorrect) {
      // ALLA RÄTT
      setTimeTaken(spent);
      sessionStorage.setItem("totalGameTime", currentTotal + spent);
      setStatus("success");
    } else {
      // STRAFF (Ingen alert, visa i UI)
      sessionStorage.setItem("totalGameTime", currentTotal + spent);
      setLastPenalty(spent);
      setStatus("check_failed");
    }
  };

  // 6. Börja om vid Time Out
  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setStatus("playing");
    setValidation({});
    setLastPenalty(0);

    const allWords = Object.values(containers).flat();

    const resetContainers = {
      pool: shuffleArray(allWords),
    };

    categories.forEach((cat) => {
      resetContainers[cat] = [];
    });

    setContainers(resetContainers);
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return <div style={styles.container}>Laddar...</div>;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.timer}>{secondsLeft}s</div>
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
                    isDisabled={status === "success" || status === "time_out"} // Tillåter drag under check_failed!
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

          {/* FEEDBACK & KNAPPAR */}
          {status === "success" && (
            <div style={styles.feedbackBoxSuccess}>
              <h3>Snyggt sorterat! ✅</h3>
              <p>
                Tid för detta spel: {timeTaken}s. Total tid hittills:{" "}
                {sessionStorage.getItem("totalGameTime")}s
              </p>
              <button
                onClick={() => navigate("/gymnasium/game6")}
                style={styles.btnSuccess}
              >
                Gå vidare till Bilda Ordet (Game 6)
              </button>
            </div>
          )}

          {status === "check_failed" && (
            <div style={styles.feedbackBoxError}>
              <h3>Inte helt rätt ❌</h3>
              <p>
                Du fick precis <strong>{lastPenalty} sekunder</strong> adderat
                som straff!
              </p>
              <p style={{ fontSize: "15px", marginTop: "10px" }}>
                Flytta de röda korten och försök igen. Klockan tickar!
              </p>
            </div>
          )}

          {status === "time_out" && (
            <div style={styles.feedbackBoxError}>
              <h3>Tiden är ute! ⏱️</h3>
              <p>Du hann inte sortera alla kort i tid.</p>
              <button onClick={handleRetry} style={styles.btnRetry}>
                Försök igen
              </button>
            </div>
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
        </div>
      </div>
    </DndContext>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#b10000",
    display: "flex",
    justifyContent: "center",
    padding: 20,
    fontFamily: "sans-serif",
    color: "#333",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: "1000px",
    background: "white",
    padding: 30,
    borderRadius: 10,
    textAlign: "center",
    position: "relative",
  },
  timer: {
    position: "absolute",
    top: 20,
    right: 20,
    fontSize: 24,
    fontWeight: "bold",
    background: "#fff6b0",
    padding: "5px 15px",
    borderRadius: 15,
  },
  boxContainer: {
    display: "flex",
    gap: 20,
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 20,
  },
  box: {
    flex: 1,
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
    background: "white",
    border: "1px solid #999",
    borderRadius: 5,
    cursor: "grab",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    fontWeight: "bold",
    touchAction: "none", // Viktigt för touch-enheter
  },
  checkBtn: {
    padding: "15px 40px",
    fontSize: 18,
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 20,
  },
  btnNext: {
    marginTop: 10,
    padding: "12px 24px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnSuccess: {
    padding: "15px 40px",
    fontSize: 18,
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
