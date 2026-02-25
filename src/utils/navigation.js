export const getNextGamePath = (currentTitle) => {
  const sequenceRaw = sessionStorage.getItem("activeGameSequence");
  if (!sequenceRaw) return "/gymnasium/leaderboard";

  const sequence = JSON.parse(sequenceRaw);

  console.log("Letar efter nästa spel efter:", currentTitle);
  console.log("Aktiva spel i kön:", sequence);

  const currentIndex = sequence.findIndex((g) => g.title === currentTitle);

  if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
    const nextGame = sequence[currentIndex + 1];

    // Rensa titeln från ALLT som inte är bokstäver eller siffror
    // Detta gör att "Risk & Säkerhet (Game 2)" blir "RiskSäkerhetGame2"
    const sanitizedTitle = nextGame.title.replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, "");

    const finalPath = `/gymnasium/${sanitizedTitle}`;
    console.log("Navigerar till:", finalPath); // Håll koll i konsolen!
    return finalPath;
  }

  return "/gymnasium/leaderboard";
};
