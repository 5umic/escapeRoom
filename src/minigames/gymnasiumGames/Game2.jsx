import React, { useState, useEffect, useRef, useId } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function Game2() {
  const navigate = useNavigate();
  const selectIdBase = useId();

  const submissionLocked = useRef(false);

  // Data State
  const [challenges, setChallenges] = useState([]);
  const [gameID, setGameID] = useState(null);

  // Gameplay State
  const [userAnswers, setUserAnswers] = useState({}); // { challengeId: "Skola" }
  const [validationResults, setValidationResults] = useState({}); // { challengeId: true/false }

  // Status: 'loading', 'playing', 'success', 'check_failed', 'time_out'
  const [status, setStatus] = useState("loading");

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [totalTimeLimit, setTotalTimeLimit] = useState(60);
  const [timeTaken, setTimeTaken] = useState(0);

  // 1. Hämta Game ID
  useEffect(() => {
    console.log(
      "GAME 2 START - Total tid i minnet:",
      sessionStorage.getItem("totalGameTime"),
    );

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modes/gymnasium/games`);
        const games = await res.json();
        const targetGame = games.find((g) => g.title.includes("Game 2"));
        if (targetGame) setGameID(targetGame.id);
      } catch (err) {
        console.error("Kunde inte hämta spel:", err);
      }
    })();
  }, []);

  // 2. Hämta alla 3 frågor
  useEffect(() => {
    if (!gameID) return;

    (async () => {
      let fetched = [];
      let attempts = 0;

      // Vi loopar tills vi har 3 st ELLER tills vi försökt 50 gånger (skydd mot evig loop)
      while (fetched.length < 3 && attempts < 50) {
        attempts++;
        try {
          const res = await fetch(
            `${API_BASE}/api/games/${gameID}/challenges/random`,
          );
          if (!res.ok) continue; // Om anropet misslyckas, försök igen

          const data = await res.json();

          // Lägg bara till om den är UNIK (inte redan finns i listan)
          const alreadyExists = fetched.find((c) => c.id === data.id);
          if (!alreadyExists) {
            fetched.push(data);
          }
        } catch (err) {
          console.error("Fel vid hämtning:", err);
        }
      }

      // Om vi mot förmodan bara fick 2, logga en varning
      if (fetched.length < 3) {
        console.warn(
          `Varning: Hittade bara ${fetched.length} unika frågor efter ${attempts} försök.`,
        );
      }

      setChallenges(fetched);

      const totalTime = 30;
      setTotalTimeLimit(totalTime);
      setSecondsLeft(totalTime);
      setStatus("playing");
    })();
  }, [gameID]);

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

  // Hantera val i dropdown
  const handleSelectChange = (challengeId, selectedValue) => {
    // Om vi redan har "rättat" och det var fel, nollställ status till "playing"
    // så den röda rutan försvinner medan man ändrar.
    if (status === "check_failed") setStatus("playing");

    setUserAnswers((prev) => ({
      ...prev,
      [challengeId]: selectedValue,
    }));
  };

  // Rätta Svar
  const checkAnswers = () => {
    if (submissionLocked.current) return; // SÄKERHETSKONTROLL 2: Förhindra dubbelklick

    const newValidation = {};
    let allCorrect = true;

    challenges.forEach((c) => {
      // Hitta rätt svarstext (backend skickar index)
      const correctAnswerText = c.options[c.correctOptionIndex];
      const userAnswer = userAnswers[c.id];

      const isCorrect = userAnswer === correctAnswerText;
      newValidation[c.id] = isCorrect;

      if (!isCorrect) allCorrect = false;
    });

    setValidationResults(newValidation);

    if (allCorrect) {
      submissionLocked.current = true; // Lås för att förhindra snabb omtryckning
      // --- ALLA RÄTT ---
      const spent = totalTimeLimit - secondsLeft;
      setTimeTaken(spent);

      // Uppdatera totaltid
      const previousTotal =
        Number(sessionStorage.getItem("totalGameTime")) || 0;
      const newTotal = previousTotal + spent;

      console.log(`GAME 2 KLAR!`);
      console.log(`Tid spenderad: ${spent}s`);
      console.log(`Gammal total: ${previousTotal}s`);
      console.log(`Ny total som sparas: ${newTotal}s`);
      // --------------------

      sessionStorage.setItem("totalGameTime", newTotal);
      setStatus("success");
    } else {
      // --- NÅGOT FEL ---
      setStatus("check_failed");
    }
  };

  // Starta om vid Tiden slut
  const handleRetry = () => {
    setSecondsLeft(totalTimeLimit);
    setUserAnswers({});
    setValidationResults({});
    setStatus("playing");
    submissionLocked.current = false; // Lås upp vid retry
  };

  // --- RENDER ---

  if (status === "loading")
    return <div style={styles.container}>Laddar matchningsspel...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Timer */}
        <div style={styles.timer}>{secondsLeft}s</div>

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

            // Bestäm stil baserat på validering
            let blockStyle = { ...styles.questionBlock };
            const isValidated = validationResults.hasOwnProperty(c.id);
            const isCorrect = validationResults[c.id];

            if (isValidated) {
              if (isCorrect) {
                blockStyle.borderLeft = "8px solid #2ea44f"; // Grön kant
                blockStyle.backgroundColor = "rgb(0, 95, 55)"; // Ljusgrön bakgrund
                blockStyle.color = "white";
              } else {
                blockStyle.borderLeft = "8px solid #c62828"; // Röd kant
                blockStyle.backgroundColor = "rgb(95, 0, 0)"; // Ljusröd bakgrund
                blockStyle.color = "white";
              }
            }

            return (
              <div key={c.id} style={blockStyle}>
                <label htmlFor={selectId} style={styles.labelPrompt}>
                  {c.prompt}
                </label>

                <select
                  id={selectId}
                  style={styles.select}
                  value={userAnswers[c.id] || ""}
                  onChange={(e) => handleSelectChange(c.id, e.target.value)}
                  disabled={status === "success" || status === "time_out"}
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

                {/* --- HÄR KOMMER FRAMTIDA HINTS/FÖRKLARINGAR --- */}
                {isValidated && !isCorrect && (
                  <p
                    style={{
                      color: "#c62828",
                      fontSize: "14px",
                      marginTop: "5px",
                    }}
                  >
                    ❌ Inte riktigt rätt. {/* Placeholder för DB-hint */}
                  </p>
                )}
                {isValidated && isCorrect && status === "success" && (
                  <p
                    style={{
                      color: "#2ea44f",
                      fontSize: "14px",
                      marginTop: "5px",
                    }}
                  >
                    ✅ Stämmer bra! {/* Placeholder för DB-explanations */}
                  </p>
                )}
              </div>
            );
          })}

          {/* --- FEEDBACK SEKTION --- */}

          {/* SCENARIO: ALLA RÄTT */}
          {status === "success" && (
            <div style={styles.feedbackBoxSuccess}>
              <h3>Bra jobbat! Alla matchningar är rätt. ✅</h3>
              <div style={styles.timeInfoBox}>
                <p>
                  ⏱️ Tid för detta spel: <strong>{timeTaken} sekunder</strong>
                </p>
                <p>
                  📊 Total tid hittills:{" "}
                  <strong>
                    {sessionStorage.getItem("totalGameTime")} sekunder
                  </strong>
                </p>
              </div>

              {/* Nästa spel skulle vara Game 3, just nu skickar vi till menyn */}
              <button
                onClick={() => navigate("/gymnasium/game3")}
                style={styles.btnSuccess}
              >
                Nästa Spel (Sant eller Falskt)
              </button>
            </div>
          )}

          {/* SCENARIO: NÅGOT FEL */}
          {status === "check_failed" && (
            <div style={styles.feedbackBoxError}>
              <h3>Något stämmer inte ❌</h3>
              <p>
                Kolla de rödmarkerade rutorna och försök igen. Tiden tickar!
              </p>
            </div>
          )}

          {/* SCENARIO: TIDEN UTE */}
          {status === "time_out" && (
            <div style={styles.feedbackBoxError}>
              <h3>Tiden är ute! ⏱️</h3>
              <button onClick={handleRetry} style={styles.btnRetry}>
                Börja om
              </button>
            </div>
          )}

          {/* RÄTTA-KNAPP (Visa bara om inte klar eller tiden slut) */}
          {status !== "success" && status !== "time_out" && (
            <button type="submit" style={styles.submitBtn}>
              Rätta svar
            </button>
          )}
        </form>
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
    color: "white",
    fontFamily: "sans-serif",
    padding: 20,
  },
  content: {
    maxWidth: "800px",
    width: "100%",
    position: "relative",
  },
  timer: {
    position: "absolute",
    top: -60,
    right: 0, // Sätter timer till höger här för variation, eller left om du vill
    background: "#fff6b0",
    color: "#000",
    padding: "10px 20px",
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 24,
  },
  questionBlock: {
    background: "rgba(255, 255, 255, 0.95)", // Lite mer solid vit för läsbarhet
    color: "#333",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: "8px solid #ccc", // Grå default kant
    transition: "all 0.3s ease",
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
    border: "1px solid #ccc",
    marginTop: 5,
    cursor: "pointer",
  },
  submitBtn: {
    marginTop: 20,
    padding: "15px 40px",
    fontSize: "20px",
    fontWeight: "bold",
    background: "#fff6b0", // Gul
    color: "#000",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "block",
    width: "100%",
  },
  // Feedback Styles
  feedbackBoxSuccess: {
    backgroundColor: "#e6fffa",
    color: "#207a38",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    border: "2px solid #2ea44f",
    textAlign: "center",
  },
  feedbackBoxError: {
    backgroundColor: "#ffe6e6",
    color: "#c62828",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "20px",
    border: "2px solid #c62828",
    textAlign: "center",
    fontWeight: "bold",
  },
  timeInfoBox: {
    margin: "15px 0",
    padding: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "5px",
    fontSize: "16px",
    color: "#333",
  },
  btnSuccess: {
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
  btnRetry: {
    marginTop: 10,
    padding: "12px 24px",
    background: "#c62828",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
  },
};
