import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listHogskolaInfo,
  updateHogskolaInfo,
} from "../minigames/hogskolaGames/api/infoContentApi";

const GAME_OPTIONS = [
  { key: "game1", label: "Högskola Game 1" },
  { key: "game2", label: "Högskola Game 2" },
  { key: "game3", label: "Högskola Game 3" },
  { key: "game4", label: "Högskola Game 4" },
  { key: "game5", label: "Högskola Game 5" },
  { key: "game6", label: "Högskola Game 6" },
  { key: "game7", label: "Högskola Game 7" },
];

export default function HogskolaInfoEditor() {
  const navigate = useNavigate();
  const [selectedGameKey, setSelectedGameKey] = useState("game1");
  const [allContent, setAllContent] = useState([]);
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await listHogskolaInfo();
        setAllContent(data);
      } catch (err) {
        console.error("Kunde inte hämta infotexter:", err);
        setMessage("Kunde inte hämta infotexter.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedContent = useMemo(() => {
    return allContent.find((c) => c.gameKey === selectedGameKey) || null;
  }, [allContent, selectedGameKey]);

  useEffect(() => {
    setHeading(selectedContent?.heading || "");
    setBody(selectedContent?.body || "");
  }, [selectedContent]);

  const handleSave = async () => {
    if (!heading.trim() || !body.trim()) {
      setMessage("Rubrik och text maste fyllas i.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const updated = await updateHogskolaInfo(selectedGameKey, {
        heading: heading.trim(),
        body: body.trim(),
      });

      setAllContent((prev) => {
        const existing = prev.find((c) => c.gameKey === updated.gameKey);
        if (!existing) return [...prev, updated];
        return prev.map((c) => (c.gameKey === updated.gameKey ? updated : c));
      });

      setMessage("Infotext sparad!");
    } catch (err) {
      console.error("Kunde inte spara infotext:", err);
      setMessage("Kunde inte spara infotext.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Högskola - Infotext Editor</h1>
        <button style={styles.backBtn} onClick={() => navigate("/admin")}>Tillbaka</button>
      </div>

      {loading ? (
        <p>Laddar infotexter...</p>
      ) : (
        <div style={styles.card}>
          <label style={styles.label}>Valj spel:</label>
          <select
            style={styles.select}
            value={selectedGameKey}
            onChange={(e) => setSelectedGameKey(e.target.value)}
          >
            {GAME_OPTIONS.map((game) => (
              <option key={game.key} value={game.key}>
                {game.label}
              </option>
            ))}
          </select>

          <label style={styles.label}>Rubrik:</label>
          <input
            style={styles.input}
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Ex: Härligt!"
          />

          <label style={styles.label}>Text (stycken separeras med tom rad):</label>
          <textarea
            style={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Skriv infotexten här..."
          />

          {message && <p style={styles.message}>{message}</p>}

          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Sparar..." : "Spara"}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#d70000",
    padding: "30px",
    fontFamily: "sans-serif",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    color: "#ffffff",
  },
  backBtn: {
    border: "1px solid #333",
    background: "white",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  card: {
    maxWidth: "900px",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontWeight: "bold",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },


  textarea: {
    minHeight: "220px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  saveBtn: {
    alignSelf: "flex-start",
    background: "#b10000",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    margin: 0,
    color: "#0f5132",
    fontWeight: "bold",
  },
};
