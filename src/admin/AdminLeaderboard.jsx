import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatTimeWithTenths } from "../minigames/gymnasiumGames/hooks/useGameTimer";

const API_BASE = "http://localhost:5261";

export default function AdminLeaderboard() {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    // Vi hämtar alla scores (du kan skapa en speciell /all-endpoint i C# om du vill se fler än 10)
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    if (res.ok) setScores(await res.json());
  };

  const handleDeleteScore = async (id) => {
    console.log("Försöker radera med ID:", id);
    console.log("Typ av ID:", typeof id);

    if (!window.confirm("Vill du verkligen ta bort detta resultat?")) return;

    // id här måste vara det GUID som kommer från databasen
    const res = await fetch(`${API_BASE}/api/leaderboard/scores/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setScores(scores.filter((s) => s.id !== id));
    } else {
      console.error("Servern svarade med:", res.status);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "VARNING: Detta raderar ALLA resultat permanent. Är du helt säker?",
      )
    )
      return;

    const res = await fetch(`${API_BASE}/api/leaderboard/scores/all`, {
      method: "DELETE",
    });

    if (res.ok) {
      setScores([]);
      alert("Leaderboarden är tömd!");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate("/admin")} style={styles.backBtn}>
          ← Tillbaka
        </button>
        <h1 style={{ color: "white", margin: 0 }}>Hantera Leaderboard</h1>
        <button onClick={handleClearAll} style={styles.clearBtn}>
          Töm Hela Listan 🗑️
        </button>
      </header>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thr}>
              <th style={styles.th}>Plats</th>
              <th style={styles.th}>Namn</th>
              <th style={styles.th}>Tid (sek)</th>
              <th style={styles.th}>Datum</th>
              <th style={styles.th}>Åtgärd</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, index) => (
              <tr key={s.id} style={styles.tr}>
                <td style={styles.td}>#{index + 1}</td>
                <td style={styles.td}>
                  <strong>{s.playerName}</strong>
                </td>
                <td style={styles.td}>
                  {formatTimeWithTenths(s.totalTimeSeconds)}
                </td>
                <td style={styles.td}>
                  {new Date(s.playedAt).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleDeleteScore(s.id)}
                    style={styles.delBtn}
                  >
                    Radera
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {scores.length === 0 && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Inga resultat ännu.
          </p>
        )}
      </div>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    maxWidth: "900px",
    margin: "0 auto 30px auto",
  },
  backBtn: {
    background: "none",
    border: "1px solid white",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  clearBtn: {
    background: "white",
    color: "#b10000",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tableCard: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom: "2px solid #eee",
    color: "#666",
  },
  td: { padding: "15px", borderBottom: "1px solid #eee" },
  tr: { transition: "background 0.2s" },
  delBtn: {
    background: "#ff4444",
    color: "white",
    border: "none",
    padding: "5px 12px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
