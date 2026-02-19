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

  // State
  const [gameID, setGameID] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [status, setStatus] = useState("loading");

  // Timer & Poäng
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);

  // Orden (deras nuvarande ordning) och Validering
  const [items, setItems] = useState([]); // Array av ord-strängar
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

  // 2. Hämta Fråga
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

      const limit = data.timeLimitSeconds || 30;
      setTotalTimeLimit(limit);
      setSecondsLeft(limit);

      // Slumpa orden så de inte ligger i rätt ordning från början
      setItems(shuffleArray(data.options));
      setStatus("playing");
    } catch (err) {
      console.error(err);
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

  // Nollställ färgerna om spelaren börjar dra i ord igen
  const handleDragStart = () => {
    if (Object.keys(validation).length > 0) setValidation({});
  };

  // 4. Hantera Drag & Drop (Byt plats på ord)
  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Om vi släpper på samma plats gör vi inget
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex); // dnd-kit funktion för att byta plats
      });
    }
  };

  // 5. Rätta Svar
  const checkAnswer = () => {
    const correctOrder = JSON.parse(challenge.answer);
    let allCorrect = true;
    const newValidation = {};

    // Kolla om varje ord ligger på exakt rätt index jämfört med facit
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

  // 6. Börja om vid Time Out
  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setStatus("playing");
    setValidation({});
    setItems(shuffleArray(challenge.options)); // Blanda om orden igen
  };

  // --- RENDER ---
  if (status === "loading" || !challenge)
    return <div style={styles.container}>Laddar...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
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
            {/* Våra ord ritas ut här i en horisontell linje */}
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
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button onClick={fetchChallenge} style={styles.btnNext}>
                Nästa Ord
              </button>
              <button
                onClick={() => navigate("/gymnasium")}
                style={styles.btnMenu}
              >
                Till Menyn
              </button>
            </div>
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
            Rätt svar
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
  timer: {
    position: "absolute",
    top: -20,
    left: -20,
    fontSize: 24,
    fontWeight: "bold",
    background: "#fff6b0",
    padding: "20px",
    borderRadius: 10,
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
    background: "#b10000",
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
