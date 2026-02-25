import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function EditChallenges() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [editingChallenge, setEditingChallenge] = useState(null);

  useEffect(() => {
    fetchChallenges();
  }, [gameId]);

  // FIX: Hämta alla utmaningar baserat på spelets ID
  const fetchChallenges = async () => {
    const res = await fetch(`${API_BASE}/api/games/${gameId}/challenges/all`);
    if (res.ok) setChallenges(await res.json());
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // FIX: Lagt till /games/ för att matcha din nya Controller-route
    const res = await fetch(
      `${API_BASE}/api/games/challenges/${editingChallenge.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingChallenge),
      },
    );

    if (res.ok) {
      setEditingChallenge(null);
      fetchChallenges();
      alert("Frågan uppdaterad!");
    } else {
      alert("Kunde inte spara. Servern svarade med felkod: " + res.status);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/admin")} style={styles.backBtn}>
        ← Tillbaka till Dashboard
      </button>
      <h1 style={{ color: "white" }}>Redigera Frågor</h1>

      <div style={styles.list}>
        {challenges.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={{ display: "flex", gap: "20px" }}>
              {c.imageUrl && (
                <img src={c.imageUrl} alt="Fråga" style={styles.thumbnail} />
              )}
              <div>
                <p>
                  <strong>Prompt:</strong> {c.prompt}
                </p>
                <p>
                  <strong>Svar:</strong> {c.answer}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditingChallenge({ ...c })}
              style={styles.editBtn}
            >
              Ändra
            </button>
          </div>
        ))}
      </div>

      {/* MODAL FÖR REDIGERING */}
      {editingChallenge && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Redigera Fråga</h2>
            <form onSubmit={handleSave} style={styles.form}>
              <label>Frågetext (Prompt):</label>
              <input
                value={editingChallenge.prompt}
                onChange={(e) =>
                  setEditingChallenge({
                    ...editingChallenge,
                    prompt: e.target.value,
                  })
                }
              />

              <label>Bild-URL:</label>
              <input
                value={editingChallenge.imageUrl || ""}
                onChange={(e) =>
                  setEditingChallenge({
                    ...editingChallenge,
                    imageUrl: e.target.value,
                  })
                }
              />

              <label>Rätt svar (måste finnas i alternativen nedan):</label>
              <input
                value={editingChallenge.answer}
                onChange={(e) =>
                  setEditingChallenge({
                    ...editingChallenge,
                    answer: e.target.value,
                  })
                }
              />

              <label>Alternativ (Options):</label>
              {editingChallenge.options.map((opt, index) => (
                <div key={index} style={{ display: "flex", gap: "5px" }}>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...editingChallenge.options];
                      newOptions[index] = e.target.value;
                      setEditingChallenge({
                        ...editingChallenge,
                        options: newOptions,
                      });
                    }}
                  />
                </div>
              ))}

              {/* Tips: Om du vill kunna lägga till fler alternativ kan vi lägga en knapp här */}

              <div style={styles.modalButtons}>
                <button type="submit" style={styles.saveBtn}>
                  Spara ändringar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingChallenge(null)}
                  style={styles.cancelBtn}
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#b10000",
    fontFamily: "sans-serif",
  },
  backBtn: {
    background: "none",
    border: "1px solid white",
    color: "white",
    padding: "10px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  list: { display: "flex", flexDirection: "column", gap: "15px" },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  thumbnail: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  editBtn: {
    background: "#333",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "15px",
    width: "500px",
    maxWidth: "90%",
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  modalButtons: { display: "flex", gap: "10px", marginTop: "20px" },
  saveBtn: {
    flex: 1,
    padding: "10px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    background: "#ccc",
    color: "black",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
