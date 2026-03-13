import { API_BASE } from "../../../config/apiBase.js";

export const fetchHogskolaInfo = async (gameKey) => {
  const response = await fetch(`${API_BASE}/api/games/hogskola-info/${gameKey}`);
  if (!response.ok) {
    throw new Error("Kunde inte hamta infotext");
  }
  return await response.json();
};

export const updateHogskolaInfo = async (gameKey, payload) => {
  const response = await fetch(`${API_BASE}/api/games/hogskola-info/${gameKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Kunde inte spara infotext");
  }

  return await response.json();
};

export const listHogskolaInfo = async () => {
  const response = await fetch(`${API_BASE}/api/games/hogskola-info`);
  if (!response.ok) {
    throw new Error("Kunde inte hamta infotexter");
  }
  return await response.json();
};
