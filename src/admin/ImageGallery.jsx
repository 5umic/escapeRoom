import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5261";

export default function ImageGallery() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [folder, setFolder] = useState("pixels");
  const [loading, setLoading] = useState(false);

  // States för uppladdning (Flyttade från AdminDashboard)
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState("");

  const fetchImages = async (targetFolder) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/games/list-images?folder=${targetFolder}`,
      );
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Kunde inte hämta bilder:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(folder);
  }, [folder]);

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("Välj en fil först!");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folder", folder); // Använder galleriets valda mapp

    try {
      const response = await fetch(`${API_BASE}/api/games/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedUrl(data.url);
        alert("Bilden har sparats!");
        fetchImages(folder); // Uppdatera galleriet direkt!
      }
    } catch (error) {
      console.error("Fel vid uppladdning:", error);
    }
  };

  const handleDelete = async (e, fileName) => {
    e.stopPropagation(); // Hindra att "Kopiera URL" körs samtidigt!

    if (!window.confirm(`Är du säker på att du vill radera ${fileName}?`))
      return;

    try {
      const res = await fetch(
        `${API_BASE}/api/games/delete-image?folder=${folder}&fileName=${fileName}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        alert("Bilden är borta!");
        fetchImages(folder); // Uppdaterar listan direkt
      } else {
        alert("Kunde inte radera bilden.");
      }
    } catch (err) {
      console.error("Fel vid radering:", err);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert(`URL Kopierad: ${url}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate("/admin")} style={styles.backBtn}>
          ⬅ Tillbaka
        </button>
        <h1 style={{ flex: 1, color: "#fff" }}>Bildgalleri 🖼️</h1>

        <button
          onClick={() => {
            setUploadModal(true);
            setGeneratedUrl("");
          }}
          style={styles.uploadBtn}
        >
          + Ladda upp ny bild
        </button>

        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          style={styles.select}
        >
          <option value="pixels">pixels</option>
          <option value="signs">signs</option>
        </select>
      </header>

      {/* MODAL FÖR UPPLADDNING (Din befintliga modal) */}
      {uploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Ladda upp bild till /{folder}</h3>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ margin: "20px 0" }}
            />
            {generatedUrl && (
              <div style={styles.urlBox}>
                <strong>Kopiera URL:</strong>
                <br />
                <code>{generatedUrl}</code>
              </div>
            )}
            <div style={styles.modalActions}>
              <button onClick={handleFileUpload} style={styles.saveBtn}>
                Ladda upp
              </button>
              <button
                onClick={() => setUploadModal(false)}
                style={styles.cancelBtn}
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERI-GRID */}
      <div style={styles.grid}>
        {images.map((fileName) => {
          const url = `/images/${folder}/${fileName}`;
          return (
            <div
              key={fileName}
              style={styles.card}
              onClick={() => copyToClipboard(url)}
            >
              <button
                onClick={(e) => handleDelete(e, fileName)}
                style={styles.deleteBtn}
                title="Radera bild"
              >
                🗑️
              </button>
              <img src={url} alt={fileName} style={styles.img} />
              <div style={styles.info}>
                <code>{url}</code>
                <p style={{ fontSize: "10px", color: "#666" }}>
                  Klicka för att kopiera URL
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Lägg till styles här (samma som tidigare plus dina modal-styles)
const styles = {
  container: { padding: "40px" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },
  backBtn: { padding: "10px", cursor: "pointer" },
  uploadBtn: {
    padding: "10px 20px",
    backgroundColor: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  select: { padding: "10px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    position: "relative",
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    cursor: "copy",
    textAlign: "center",
  },
  deleteBtn: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid #ddd",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
    zIndex: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  img: {
    width: "100%",
    height: "120px",
    objectFit: "contain",
    marginBottom: "10px",
  },
  info: { fontSize: "12px", wordBreak: "break-all" },
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
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "400px",
  },
  modalActions: { display: "flex", gap: "10px", marginTop: "20px" },
  saveBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#2ea44f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  urlBox: {
    backgroundColor: "#eee",
    padding: "10px",
    borderRadius: "5px",
    marginTop: "10px",
  },
};
