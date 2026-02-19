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
  const [status, setStatus] = useState("loading");

  // DYNAMISKA KATEGORIER! (Hämtas från JSON)
  const [categories, setCategories] = useState([]);

  const [validation, setValidation] = useState({});

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);

  // Sorting State - Börjar med bara en pool
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

    try {
      const res = await fetch(
        `${API_BASE}/api/games/${gameID}/challenges/random`,
      );
      const data = await res.json();
      setChallenge(data);

      const limit = data.timeLimitSeconds || 60;
      setTotalTimeLimit(limit);
      setSecondsLeft(limit);

      // --- DYNAMISK LOGIK START ---
      const correctMapping = JSON.parse(data.answer);
      // Extrahera kategorierna från facit (t.ex. ["IKT", "Trafik", "Miljö"])
      const dynamicCategories = Object.keys(correctMapping);
      setCategories(dynamicCategories);

      // Skapa start-statet dynamiskt
      const initialContainers = {
        pool: shuffleArray(data.options),
      };

      // Skapa en tom array för varje kategori vi hittade
      dynamicCategories.forEach((cat) => {
        initialContainers[cat] = [];
      });

      setContainers(initialContainers);
      // --- DYNAMISK LOGIK SLUT ---

      setStatus("playing");
    } catch (err) {
      console.error("Fel vid hämtning av fråga:", err);
    }
  };

  useEffect(() => {
    if (gameID) fetchChallenge();
  }, [gameID]);

  // 3. Timer
  useEffect(() => {
    if (status === "success" || status === "time_out") return;
    if (secondsLeft <= 0) {
      setStatus("time_out");
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, status]);

  const handleDragStart = () => {
    if (Object.keys(validation).length > 0) {
      setValidation({});
    }
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
    const correctMapping = JSON.parse(challenge.answer);
    let allCorrect = true;
    const newValidation = {};

    // Loopa över vår dynamiska state-array istället för hårdkodad lista
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

    if (allCorrect) {
      const spent = totalTimeLimit - secondsLeft;
      setTimeTaken(spent);
      const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
      sessionStorage.setItem("totalGameTime", currentTotal + spent);
      setStatus("success");
    }
  };

  // 6. Börja om vid Time Out DYNAMISKT
  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setStatus("playing");
    setValidation({});

    // Samla ihop alla ord från ALLA containrar med en cool JS-funktion (.flat())
    // Det spelar ingen roll om det finns 3 eller 10 boxar, den hittar alla!
    const allWords = Object.values(containers).flat();

    // Bygg det tomma statet igen
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
                    isDisabled={status !== "playing"}
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
                    isDisabled={status !== "playing"}
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
                ⏱️ Tid för denna fråga: <strong>{timeTaken} sekunder</strong>
              </p>
              <p>
                📊 Total tid hittills:{" "}
                <strong>
                  {sessionStorage.getItem("totalGameTime")} sekunder
                </strong>
              </p>
              <button
                onClick={() => navigate("/gymnasium/game6")}
                style={styles.btnNext}
              >
                Gå vidare till Sortera Ord (Game 6)
              </button>
              {/* <button
                onClick={() => navigate("/gymnasium")}
                style={styles.btnSuccess}
              >
                Till Menyn (Klart!)
              </button> */}
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

          {status === "playing" && (
            <button onClick={checkAnswer} style={styles.checkBtn}>
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
