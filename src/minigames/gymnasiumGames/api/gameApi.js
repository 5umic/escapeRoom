const API_BASE = "http://localhost:5261";

// 1. Hämta rätt Game ID baserat på titel
export const fetchGameIdByTitle = async (modeKey, titleKeyword) => {
  try {
    const res = await fetch(`${API_BASE}/api/modes/${modeKey}/games`);
    const games = await res.json();
    const targetGame = games.find((g) => g.title.includes(titleKeyword));
    return targetGame ? targetGame.id : null;
  } catch (error) {
    console.error("Kunde inte hämta spel:", error);
    return null;
  }
};

// 2. Hämta flera unika frågor (Smart loop för Game 1, 2, 3, 4, 6)
export const fetchUniqueChallenges = async (gameId, maxChallenges = 20) => {
  let uniqueChallenges = [];
  let duplicateCount = 0;

  // ÄNDRING: Höjt gränsen till 15 för att garantera att alla frågor hittas!
  while (duplicateCount < 15 && uniqueChallenges.length < maxChallenges) {
    try {
      const res = await fetch(
        `${API_BASE}/api/games/${gameId}/challenges/random`,
      );
      if (!res.ok) continue;

      const data = await res.json();

      if (!uniqueChallenges.find((c) => c.id === data.id)) {
        uniqueChallenges.push(data);
        duplicateCount = 0;
      } else {
        duplicateCount++;
      }
    } catch (err) {
      break;
    }
  }
  return uniqueChallenges;
};

// 3. Hämta bara en enda fråga (Om det behövs för Game 5 eller 7)
export const fetchSingleChallenge = async (gameId) => {
  try {
    const res = await fetch(
      `${API_BASE}/api/games/${gameId}/challenges/random`,
    );
    return await res.json();
  } catch (error) {
    console.error("Fel vid hämtning av fråga:", error);
    return null;
  }
};

// 4. Spara spelarens resultat till Leaderboarden
export const savePlayerScore = async (playerName, totalTimeSeconds) => {
  try {
    const response = await fetch(`${API_BASE}/api/leaderboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerName: playerName,
        totalTimeSeconds: totalTimeSeconds,
      }),
    });

    if (!response.ok) {
      console.error("Något gick fel vid sparandet av poäng");
    }
    return response.ok;
  } catch (error) {
    console.error(
      "Kunde inte ansluta till servern för att spara poäng:",
      error,
    );
    return false;
  }
};
