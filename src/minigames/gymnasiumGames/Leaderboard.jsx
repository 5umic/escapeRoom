import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../gymnasiumGames/hooks/useGameTimer";

const API_BASE = "http://localhost:5261";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/leaderboard`);
        if (response.ok) {
          const data = await response.json();
          setScores(data);
        }
      } catch (error) {
        console.error("Kunde inte hämta leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>🏆 Leaderboard 🏆</h1>
        <p style={styles.subtitle}>De snabbaste hackarna i systemet</p>

        {loading ? (
          <p>Laddar resultat...</p>
        ) : scores.length === 0 ? (
          <p>Inga resultat ännu. Bli den första att klara spelet!</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Plats</th>
                <th style={styles.th}>Hackarnamn</th>
                <th style={styles.th}>Total Tid</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr
                  key={score.id}
                  style={index === 0 ? styles.firstPlace : styles.row}
                >
                  <td style={styles.td}>
                    {index === 0
                      ? "🥇 1"
                      : index === 1
                        ? "🥈 2"
                        : index === 2
                          ? "🥉 3"
                          : index + 1}
                  </td>
                  <td style={styles.td}>
                    <strong>{score.playerName}</strong>
                  </td>
                  {/* HÄR formaterar vi de råa sekunderna till MM:SS för spelaren! */}
                  <td style={styles.td}>
                    {formatTime(score.totalTimeSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button onClick={() => navigate("/gymnasium")} style={styles.backBtn}>
          Tillbaka till Startmenyn
        </button>
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
    maxWidth: "600px",
    background: "white",
    padding: "40px 30px",
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  title: { color: "#b10000", margin: "0 0 10px 0", fontSize: "36px" },
  subtitle: { fontSize: "18px", color: "#555", marginBottom: "30px" },

  table: { width: "100%", borderCollapse: "collapse", marginBottom: "30px" },
  tableHead: { backgroundColor: "#f3f3f3", borderBottom: "2px solid #ccc" },
  th: { padding: "12px", textAlign: "left", fontSize: "18px", color: "#333" },
  row: { borderBottom: "1px solid #eee", transition: "background 0.2s" },
  firstPlace: { borderBottom: "1px solid #eee", backgroundColor: "#fff6b0" }, // Guld-bakgrund för 1:an!
  td: { padding: "15px 12px", textAlign: "left", fontSize: "18px" },

  backBtn: {
    width: "100%",
    padding: "15px",
    fontSize: "18px",
    fontWeight: "bold",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.2s",
  },
};
