import React, { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function Game2() {
  const navigate = useNavigate();
  const selectIdBase = useId(); // Unikt ID för tillgänglighet

  // State
  const [challenges, setChallenges] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // Sparar valen: { challengeId: "Skola" }
  const [status, setStatus] = useState("loading"); // loading, playing, success, fail
  const [gameID, setGameID] = useState(null);

  // Hämtar GameID för "Risk & Säkerhet (Game 2)"
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        // Hitta rätt spel baserat på titeln vi satte i Seedern
        const targetGame = games.find((g) => g.title.includes("Game 2"));
        if (targetGame) {
          setGameID(targetGame.id);
        } else {
          console.error("Hittade inte Game 2!");
        }
      } catch (err) {
        console.error("Kunde inte hämta spel:", err);
      }
    })();
  }, []);

  // Hämta ALLA frågor för detta spel
  useEffect(() => {
    if (!gameID) return;

    (async () => {
      // Vi hämtar 3 slumpmässiga frågor. Eftersom det bara finns 3 totalt får vi alla.
      // OBS: Du kanske behöver ändra backend för att hämta "alla" istället för "random one",
      // men vi kan lösa det genom att anropa random 3 gånger eller bygga en ny endpoint.
      // FÖR NU: Vi gör en speciallösning där vi loopar 3 gånger för att fylla listan.

      let fetched = [];
      // Vi försöker hämta unika frågor tills vi har 3 st (eller max 10 försök)
      for (let i = 0; i < 10; i++) {
        const res = await fetch(
          `${API_BASE}/api/games/${gameID}/challenges/random`,
        );
        const data = await res.json();

        // Lägg bara till om den inte redan finns
        if (!fetched.find((c) => c.id === data.id)) {
          fetched.push(data);
        }
        if (fetched.length >= 3) break;
      }

      setChallenges(fetched);
      setStatus("playing");
    })();
  }, [gameID]);

  // Hantera när användaren väljer i en dropdown
  const handleSelectChange = (challengeId, selectedValue) => {
    setUserAnswers((prev) => ({
      ...prev,
      [challengeId]: selectedValue,
    }));
  };

  // Rätta svaren
  const checkAnswers = () => {
    let allCorrect = true;

    challenges.forEach((c) => {
      // Vi måste hitta rätt text-svar.
      // Eftersom backend skickar CorrectOptionIndex, får vi slå upp ordet.
      const correctAnswerText = c.options[c.correctOptionIndex];
      const userAnswer = userAnswers[c.id];

      if (userAnswer !== correctAnswerText) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setStatus("success");
    } else {
      setStatus("fail");
    }
  };

  // --- RENDER ---

  if (status === "loading")
    return <div style={styles.container}>Laddar Game 2...</div>;

  if (status === "success") {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, border: "5px solid #2ea44f" }}>
          <h1 style={{ color: "#2ea44f" }}>Alla rätt!</h1>
          <p>Snyggt jobbat. Du har matchat rätt risker med rätt platser.</p>
          <button
            onClick={() => navigate("/gymnasium/Game3")}
            style={styles.btnSuccess}
          >
            Tillbaks till menyn (Eller nästa spel)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2>Risk & Säkerhet</h2>
        <p style={{ marginBottom: 30 }}>
          Matcha rätt påstående med rätt plats.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkAnswers();
          }}
        >
          {challenges.map((c, index) => {
            const selectId = `${selectIdBase}-${index}`;

            return (
              <div key={c.id} style={styles.questionBlock}>
                {/* PÅSTÅENDET */}
                <label htmlFor={selectId} style={styles.labelPrompt}>
                  {c.prompt}
                </label>

                {/* SELECT-MENYN */}
                <select
                  id={selectId}
                  name={`question-${index}`}
                  style={styles.select}
                  onChange={(e) => handleSelectChange(c.id, e.target.value)}
                  defaultValue="" // Tomt från början
                >
                  <option value="" disabled>
                    -- Välj plats --
                  </option>
                  {c.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          {status === "fail" && (
            <p style={{ color: "#ffcccc", fontWeight: "bold", marginTop: 20 }}>
              Något är fel. Försök igen!
            </p>
          )}

          <button type="submit" style={styles.submitBtn}>
            Rätta svar
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#b10000", // Trafikverket röd
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontFamily: "sans-serif",
    padding: 20,
  },
  content: {
    maxWidth: "800px",
    width: "100%",
  },
  card: {
    background: "white",
    padding: 40,
    borderRadius: 15,
    textAlign: "center",
    color: "#333",
  },
  questionBlock: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: "5px solid #fff6b0", // Gul accent
  },
  labelPrompt: {
    display: "block",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: 10,
    lineHeight: "1.4",
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    marginTop: 5,
    cursor: "pointer",
  },
  submitBtn: {
    marginTop: 20,
    padding: "15px 40px",
    fontSize: "20px",
    fontWeight: "bold",
    background: "#fff6b0", // Trafikverket gul
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "block",
    width: "100%",
  },
  btnSuccess: {
    padding: "10px 20px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: 5,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 20,
  },
};
