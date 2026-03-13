import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/apiBase.js";

export default function EditChallenge() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchChallenges(), fetchGameDetails()]);
      setLoading(false);
    };
    loadData();
  }, [gameId]);

  const fetchGameDetails = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/games/${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setGameInfo(data);
      }
    } catch (err) {
      console.error("Nätverksfel vid hämtning av spelinfo:", err);
    }
  };

  const fetchChallenges = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/games/${gameId}/challenges/all`);
      if (res.ok) {
        setChallenges(await res.json());
      }
    } catch (err) {
      console.error("Nätverksfel vid hämtning av utmaningar:", err);
    }
  };

  const handleCreate = async () => {
    const newChallenge = {
      gameId: gameId,
      prompt: "Ny utmaning",
      answer: "",
      options: ["", ""],
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
      setShowPreview(false);
      fetchChallenges();
      alert("Uppdaterad!");
    }
  };

  const handleDelete = async (challengeId) => {
    if (!window.confirm("Radera permanent?")) return;
    const res = await fetch(`${API_BASE}/api/games/challenges/${challengeId}`, {
      method: "DELETE",
    });
    if (res.ok) setChallenges(challenges.filter((c) => c.id !== challengeId));
  };

  // --- PREVIEW LOGIC ---
  const renderPreview = () => {
    if (!editingChallenge || !gameInfo) return null;
    const title = gameInfo.title || "";

    return (
      <div style={styles.previewContainer}>
        <h4 style={styles.previewTitle}>👁️ Förhandsgranskning</h4>
        <div style={styles.previewCard}>
          {editingChallenge.imageUrl && (
            <img
              src={editingChallenge.imageUrl}
              alt="Preview"
              style={styles.previewImg}
            />
          )}
          <p
            style={{
              fontWeight: "bold",
              marginBottom: "15px",
              fontSize: "16px",
            }}
          >
            {editingChallenge.prompt}
          </p>

          {(title.includes("Game 3") || title.includes("DigitalSäkerhet")) && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button disabled style={styles.previewBtn}>
                Sant
              </button>
              <button disabled style={styles.previewBtn}>
                Falskt
              </button>
            </div>
          )}

          {(title.includes("Game 5") || title.includes("Sortera")) && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {editingChallenge.options
                .filter((o) => o.trim() !== "")
                .map((o, i) => (
                  <span key={i} style={styles.previewTag}>
                    {o}
                  </span>
                ))}
            </div>
          )}

          {(title.includes("Game 6") || title.includes("Bilda")) && (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {editingChallenge.answer.split(" ").map((word, i) => (
                <span key={i} style={styles.previewTag}>
                  {word}
                </span>
              ))}
            </div>
          )}

          {/* Standard Flerval för 1, 2, 4 */}
          {!title.includes("Game 3") &&
            !title.includes("Game 5") &&
            !title.includes("Game 6") && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {editingChallenge.options.map((o, i) => (
                  <button
                    key={i}
                    disabled
                    style={{ ...styles.previewBtn, textAlign: "left" }}
                  >
                    {o || `Alternativ ${i + 1}`}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    );
  };

  const renderGameSpecificFields = () => {
    const title = gameInfo.title || "";

    if (title.includes("Game 3") || title.includes("DigitalSäkerhet")) {
      return (
        <div style={styles.editorBox}>
          <h4 style={styles.editorTitle}>⚖️ Sant eller Falskt</h4>
          <div style={{ display: "flex", gap: "20px" }}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                checked={editingChallenge.answer === "Sant"}
                onChange={() =>
                  setEditingChallenge({ ...editingChallenge, answer: "Sant" })
                }
              />{" "}
              Sant
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                checked={editingChallenge.answer === "Falskt"}
                onChange={() =>
                  setEditingChallenge({ ...editingChallenge, answer: "Falskt" })
                }
              />{" "}
              Falskt
            </label>
          </div>
        </div>
      );
    }

    if (title.includes("Game 5") || title.includes("Sortera")) {
      return (
        <div style={styles.editorBox}>
          <h4 style={styles.editorTitle}>🧩 Sorterings-inställningar</h4>
          <label style={styles.label}>JSON-Svar (Kategorier):</label>
          <textarea
            style={{
              ...styles.input,
              minHeight: "80px",
              fontFamily: "monospace",
            }}
            value={editingChallenge.answer}
            onChange={(e) =>
              setEditingChallenge({
                ...editingChallenge,
                answer: e.target.value,
              })
            }
            placeholder='{"Kategori":["Ord"]}'
          />
          {renderOptionsList("Alla ord som ska dras")}
        </div>
      );
    }

    if (
      title.includes("Game 6") ||
      title.includes("Game 7") ||
      title.includes("Bilda") ||
      title.includes("Hänga")
    ) {
      return (
        <div style={styles.editorBox}>
          <h4 style={styles.editorTitle}>🔤 Rätt svar</h4>
          <input
            style={styles.input}
            value={editingChallenge.answer}
            placeholder="Skriv ordet/meningen..."
            onChange={(e) =>
              setEditingChallenge({
                ...editingChallenge,
                answer: e.target.value,
              })
            }
          />
        </div>
      );
    }

    return (
      <div style={styles.editorBox}>
        <h4 style={styles.editorTitle}>🔘 Flerval / Alternativ</h4>
        <label style={styles.label}>Rätt svar (Exakt text):</label>
        <input
          style={{
            ...styles.input,
            borderColor: "#2ea44f",
            borderWidth: "2px",
          }}
          value={editingChallenge.answer}
          onChange={(e) =>
            setEditingChallenge({ ...editingChallenge, answer: e.target.value })
          }
        />
        {renderOptionsList("Svarsalternativ")}
      </div>
    );
  };

  const renderOptionsList = (label) => (
    <div style={{ marginTop: "15px" }}>
      <label style={styles.label}>{label}:</label>
      {editingChallenge.options.map((opt, index) => (
        <div
          key={index}
          style={{ display: "flex", gap: "10px", marginBottom: "5px" }}
        >
          <input
            style={{ ...styles.input, flex: 1 }}
            value={opt}
            onChange={(e) => {
              const newOpts = [...editingChallenge.options];
              newOpts[index] = e.target.value;
              setEditingChallenge({ ...editingChallenge, options: newOpts });
            }}
          />
          <button
            type="button"
            onClick={() =>
              setEditingChallenge({
                ...editingChallenge,
                options: editingChallenge.options.filter((_, i) => i !== index),
              })
            }
            style={styles.removeOptBtn}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setEditingChallenge({
            ...editingChallenge,
            options: [...editingChallenge.options, ""],
          })
        }
        style={styles.addOptBtn}
      >
        + Lägg till
      </button>
    </div>
  );

  if (loading)
    return (
      <div style={styles.container}>
        <h1 style={{ color: "white" }}>Laddar...</h1>
      </div>
    );

  const showImageField =
    gameInfo.title.includes("Gymnasium") || gameInfo.title.includes("Game 4");

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Redigera: {gameInfo?.title}</h1>
      <header style={styles.header}>
        <button onClick={() => navigate("/admin")} style={styles.backBtn}>
          ← Tillbaka
        </button>
        <button onClick={handleCreate} style={styles.createBtn}>
          + Ny Fråga
        </button>
      </header>

      <div style={styles.list}>
        {challenges.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardContent}>
              {c.imageUrl && (
                <img src={c.imageUrl} alt="" style={styles.thumbnail} />
              )}
              <div>
                <p>
                  <strong>{c.prompt}</strong>
                </p>
                <span style={styles.answerTag}>{c.answer}</span>
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

      {editingChallenge && (
        <div style={styles.modalOverlay}>
          <div
            style={{ ...styles.modal, width: showPreview ? "1000px" : "600px" }}
          >
            <div style={{ display: "flex", gap: "30px" }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ margin: 0 }}>Redigera</h2>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    style={styles.previewToggle}
                  >
                    {showPreview ? "Dölj Preview" : "Visa Preview 👁️"}
                  </button>
                </div>

                <form onSubmit={handleSave} style={styles.form}>
                  <label style={styles.label}>Prompt/Fråga:</label>
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

                  {showImageField && (
                    <>
                      <label style={styles.label}>Bild URL:</label>
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
                    </>
                  )}

                  <label style={styles.label}>
                    Tidsgräns för denna utmaning (sekunder):
                  </label>
                  <input
                    style={styles.input}
                    type="number"
                    value={editingChallenge.timeLimitSeconds}
                    onChange={(e) =>
                      setEditingChallenge({
                        ...editingChallenge,
                        timeLimitSeconds: parseInt(e.target.value) || 0,
                      })
                    }
                  />

                  {renderGameSpecificFields()}

                  <div style={styles.modalButtons}>
                    <button type="submit" style={styles.saveBtn}>
                      Spara
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChallenge(null);
                        setShowPreview(false);
                      }}
                      style={styles.cancelBtn}
                    >
                      Avbryt
                    </button>
                  </div>
                </form>
              </div>

              {showPreview && (
                <div
                  style={{
                    flex: 1,
                    borderLeft: "2px solid #eee",
                    paddingLeft: "30px",
                  }}
                >
                  {renderPreview()}
                </div>
              )}
            </div>
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
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
  },
  title: { color: "white", paddingBottom: "20px" },
  backBtn: {
    background: "none",
    border: "1px solid white",
    color: "white",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  createBtn: {
    background: "#2ea44f",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  list: { display: "flex", flexDirection: "column", gap: "15px" },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: { display: "flex", gap: "20px", alignItems: "center" },
  thumbnail: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  answerTag: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  actionButtons: { display: "flex", gap: "10px" },
  editBtn: {
    background: "#333",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#ff4444",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
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
    maxHeight: "90vh",
    overflowY: "auto",
    transition: "width 0.3s ease",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: {
    fontWeight: "bold",
    fontSize: "13px",
    color: "#444",
    marginTop: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  editorBox: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #eee",
    marginTop: "10px",
  },
  editorTitle: {
    margin: "0 0 10px 0",
    fontSize: "15px",
    color: "#b10000",
    borderBottom: "1px solid #ddd",
    paddingBottom: "5px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  previewToggle: {
    background: "#eee",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  previewContainer: {
    backgroundColor: "#f4f4f4",
    padding: "20px",
    borderRadius: "10px",
    height: "100%",
    border: "1px solid #ddd",
  },
  previewTitle: {
    marginTop: 0,
    color: "#333",
    borderBottom: "2px solid #b10000",
    paddingBottom: "5px",
  },
  previewCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  previewImg: {
    width: "100%",
    height: "150px",
    objectFit: "contain",
    borderRadius: "5px",
    marginBottom: "15px",
    border: "1px solid #eee",
  },
  previewBtn: {
    width: "100%",
    padding: "12px",
    marginBottom: "8px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "white",
    color: "#444",
    fontWeight: "500",
  },
  previewTag: {
    background: "#b10000",
    color: "white",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "500",
  },
  removeOptBtn: {
    background: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "0 10px",
    cursor: "pointer",
  },
  addOptBtn: {
    background: "#eee",
    border: "1px dashed #999",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
  modalButtons: { display: "flex", gap: "10px", marginTop: "25px" },
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
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#eee",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  closeX: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
  },
};
