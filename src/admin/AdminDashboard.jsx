import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploadModal, setUploadModal] = useState(false);

  const [targetFolder, setTargetFolder] = useState("pixels");
  const [generatedUrl, setGeneratedUrl] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/games/list-all`);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error("Fel vid hämtning av spel:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (gameId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const response = await fetch(
        `${API_BASE}/api/games/${gameId}/toggle-active`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStatus),
        },
      );

      if (response.ok) {
        setGames((prev) =>
          prev.map((g) =>
            g.id === gameId ? { ...g, isActive: newStatus } : g,
          ),
        );
        setMessage(`Spelet blev ${newStatus ? "aktivt" : "inaktivt"}!`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Kunde inte uppdatera status:", error);
    }
  };

  if (loading)
    return (
      <div style={styles.adminContainer}>
        <h2>Laddar admin...</h2>
      </div>
    );

  return (
    <div style={styles.adminContainer}>
      <header style={styles.header}>
        <h1 style={{ color: "white" }}>Admin Panel 🔐</h1>
        <p style={{ color: "rgba(255,255,255,0.8)" }}>
          Hantera tillgängliga spel och utmaningar
        </p>
      </header>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          style={{ ...styles.uploadTriggerBtn }}
          onClick={() => navigate("/admin/leaderboard")} // Se till att du har denna route i App.js
        >
          Kolla leaderboard 🏆
        </button>

        <button
          style={{ ...styles.uploadTriggerBtn }}
          onClick={() => navigate("/admin/gallery")} // Se till att du har denna route i App.js
        >
          Ladda upp ny bild 📸
        </button>
      </div>

      {message && <div style={styles.alert}>{message}</div>}

      <section>
        <h2 style={{ color: "white", marginBottom: "20px" }}>Spelkontroll</h2>
        <div style={styles.gameGrid}>
          {games.map((game) => (
            <div key={game.id} style={styles.gameCard}>
              <div style={styles.gameInfo}>
                <h3 style={{ margin: "0 0 10px 0" }}>{game.title}</h3>
                <span
                  style={
                    game.isActive ? styles.badgeActive : styles.badgeInactive
                  }
                >
                  {game.isActive ? "AKTIVT" : "INAKTIVT"}
                </span>
              </div>

              <div style={styles.actions}>
                {/* SWITCHEN */}
                <div
                  onClick={() => toggleActive(game.id, game.isActive)}
                  style={{
                    ...styles.switchBase,
                    backgroundColor: game.isActive ? "#2ea44f" : "#ccc",
                  }}
                >
                  <div
                    style={{
                      ...styles.switchKnob,
                      transform: game.isActive
                        ? "translateX(26px)"
                        : "translateX(0px)",
                    }}
                  />
                </div>

                <button
                  style={styles.editBtn}
                  onClick={() => navigate(`/admin/EditChallenge/${game.id}`)}
                >
                  Redigera Frågor
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  adminContainer: {
    minHeight: "100vh",
    padding: "40px",
    backgroundColor: "#b10000",
    fontFamily: "sans-serif",
  },
  header: {
    borderBottom: "1px solid rgba(255,255,255,0.3)",
    marginBottom: "30px",
    paddingBottom: "10px",
  },
  alert: {
    padding: "15px",
    backgroundColor: "#fff",
    color: "#2ea44f",
    borderRadius: "8px",
    marginBottom: "20px",
    fontWeight: "bold",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  gameGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
  },
  gameCard: {
    borderRadius: "12px",
    padding: "20px",
    backgroundColor: "white",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gameInfo: { display: "flex", flexDirection: "column" },
  badgeActive: {
    backgroundColor: "#e6fffa",
    color: "#2ea44f",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    border: "1px solid #2ea44f",
    width: "fit-content",
  },
  badgeInactive: {
    backgroundColor: "#ffe6e6",
    color: "#c62828",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    border: "1px solid #c62828",
    width: "fit-content",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "15px",
  },

  // Custom Switch Styles (Istället för checkbox)
  switchBase: {
    width: "54px",
    height: "28px",
    borderRadius: "15px",
    padding: "2px",
    cursor: "pointer",
    transition: "0.3s ease",
    display: "flex",
    alignItems: "center",
  },
  switchKnob: {
    width: "24px",
    height: "24px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "0.3s ease",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },

  editBtn: {
    padding: "10px 15px",
    cursor: "pointer",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  uploadTriggerBtn: {
    backgroundColor: "white",
    color: "#b10000",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "30px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
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
    width: "400px",
    textAlign: "center",
  },
  urlBox: {
    backgroundColor: "#f4f4f4",
    padding: "10px",
    borderRadius: "5px",
    margin: "15px 0",
    wordBreak: "break-all",
    fontSize: "14px",
    border: "1px solid #ccc",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#2ea44f",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
