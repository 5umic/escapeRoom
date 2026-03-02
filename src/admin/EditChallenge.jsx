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

  const handleCreate = async () => {
    const newChallenge = {
      gameId: gameId,
      prompt: "Ny fråga",
      answer: "",
      options: ["", ""], // Starta med två tomma fält
      imageUrl: "",
      timeLimitSeconds: 30,
    };

    try {
      const res = await fetch(`${API_BASE}/api/games/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChallenge),
      });

      if (res.ok) {
        const data = await res.json();
        setEditingChallenge(data);
        fetchChallenges();
      }
    } catch (err) {
      console.error("Fel vid skapande:", err);
    }
  };

  const fetchChallenges = async () => {
    const res = await fetch(`${API_BASE}/api/games/${gameId}/challenges/all`);
    if (res.ok) setChallenges(await res.json());
  };

  const handleSave = async (e) => {
    e.preventDefault();
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
      alert("Kunde inte spara. Felkod: " + res.status);
    }
  };

  const handleDelete = async (challengeId) => {
    if (
      !window.confirm(
        "Är du säker på att du vill ta bort denna fråga permanent?",
      )
    )
      return;

    try {
      const res = await fetch(
        `${API_BASE}/api/games/challenges/${challengeId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        setChallenges(challenges.filter((c) => c.id !== challengeId));
      } else {
        alert("Kunde inte radera frågan.");
      }
    } catch (err) {
      console.error("Fel vid radering:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Redigera Frågor</h1>
      <header
        style={{
          ...styles.header,
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <button onClick={() => navigate("/admin")} style={styles.backBtn}>
          ← Tillbaka
        </button>
        <button onClick={handleCreate} style={styles.createBtn}>
          + Lägg till ny fråga
        </button>
      </header>

      <div style={styles.list}>
        {challenges.length === 0 && (
          <p style={{ color: "white", textAlign: "center" }}>
            Inga frågor hittades för detta spel.
          </p>
        )}
        {challenges.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardContent}>
              {c.imageUrl && (
                <img src={c.imageUrl} alt="Fråga" style={styles.thumbnail} />
              )}
              <div style={styles.textInfo}>
                <p>
                  <strong>Prompt:</strong> {c.prompt}
                </p>
                <p>
                  <strong>Svar:</strong>{" "}
                  <span style={styles.answerTag}>{c.answer}</span>
                </p>
                <p>
                  <strong>Tid:</strong> {c.timeLimitSeconds || 30}s
                </p>
              </div>
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={() => setEditingChallenge({ ...c })}
                style={styles.editBtn}
              >
                Ändra
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                style={styles.deleteBtn}
              >
                Radera
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FÖR REDIGERING */}
      {editingChallenge && (
        <div
          style={styles.modalOverlay}
          onClick={() => setEditingChallenge(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>Redigera Fråga</h2>
              <button
                onClick={() => setEditingChallenge(null)}
                style={styles.closeX}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Frågetext (Prompt):</label>
                <input
                  style={styles.input}
                  value={editingChallenge.prompt}
                  onChange={(e) =>
                    setEditingChallenge({
                      ...editingChallenge,
                      prompt: e.target.value,
                    })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Bild-URL:</label>
                <input
                  style={styles.input}
                  value={editingChallenge.imageUrl || ""}
                  onChange={(e) =>
                    setEditingChallenge({
                      ...editingChallenge,
                      imageUrl: e.target.value,
                    })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tidsgräns (sekunder):</label>
                <input
                  style={styles.input}
                  type="number"
                  value={editingChallenge.timeLimitSeconds || 30}
                  onChange={(e) =>
                    setEditingChallenge({
                      ...editingChallenge,
                      timeLimitSeconds: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Rätt svar:</label>
                <input
                  style={styles.input}
                  value={editingChallenge.answer}
                  onChange={(e) =>
                    setEditingChallenge({
                      ...editingChallenge,
                      answer: e.target.value,
                    })
                  }
                />
              </div>
              <label style={styles.label}>Alternativ (Options):</label>
              <div style={styles.optionsList}>
                {editingChallenge.options.map((opt, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      value={opt}
                      placeholder={`Alternativ ${index + 1}`}
                      onChange={(e) => {
                        const newOptions = [...editingChallenge.options];
                        newOptions[index] = e.target.value;
                        setEditingChallenge({
                          ...editingChallenge,
                          options: newOptions,
                        });
                      }}
                    />
                    {/* Knapp för att ta bort ett specifikt alternativ */}
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = editingChallenge.options.filter(
                          (_, i) => i !== index,
                        );
                        setEditingChallenge({
                          ...editingChallenge,
                          options: newOptions,
                        });
                      }}
                      style={styles.removeOptBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Knapp för att lägga till ett nytt tomt alternativ */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingChallenge({
                      ...editingChallenge,
                      options: [...editingChallenge.options, ""],
                    });
                  }}
                  style={styles.addOptBtn}
                >
                  + Lägg till alternativ
                </button>
                <div style={styles.modalButtons}>
                  <button type="submit" style={styles.saveBtn}>
                    Spara ändringar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingChallenge(null)} // STÄNG-KNAPP
                    style={styles.cancelBtn}
                  >
                    Avbryt
                  </button>
                </div>
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
    padding: "40px 100px",
    backgroundColor: "#b10000",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  title: { color: "white", margin: "0 0 40px 0" },
  backBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid white",
    color: "white",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "100%",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  cardContent: { display: "flex", gap: "20px", alignItems: "center" },
  thumbnail: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  textInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  answerTag: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  createBtn: {
    background: "#2ea44f",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px",
    fontWeight: "bold",
  },
  actionButtons: { display: "flex", gap: "10px" },
  editBtn: {
    background: "#333",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteBtn: {
    background: "#ff4444",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "15px",
    width: "550px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontWeight: "bold", fontSize: "14px", color: "#555" },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  optionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  modalButtons: { display: "flex", gap: "10px", marginTop: "10px" },
  saveBtn: {
    flex: 2,
    padding: "12px",
    background: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
  closeX: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#666",
  },
  removeOptBtn: {
    background: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "0 10px",
    cursor: "pointer",
  },
  addOptBtn: {
    background: "#f0f0f0",
    border: "1px dashed #ccc",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#eee",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
