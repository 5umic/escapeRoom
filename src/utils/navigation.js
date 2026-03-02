export const getNextGamePath = (currentTitle) => {
  const sequenceRaw = sessionStorage.getItem("activeGameSequence");
  if (!sequenceRaw) return "/gymnasium/leaderboard";

  const sequence = JSON.parse(sequenceRaw);
  const currentIndex = sequence.findIndex(g => g.title === currentTitle);
  
  // Om vi inte hittar spelet eller om det är det sista i listan
  if (currentIndex === -1 || currentIndex >= sequence.length - 1) {
    return "/gymnasium/leaderboard";
  }

  // Annars, hämta nästa spel
  const nextGame = sequence[currentIndex + 1];
  const sanitizedTitle = nextGame.title.replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, "");
  return `/gymnasium/${sanitizedTitle}`;
};

// Hjälpfunktion för att veta om vi är på sista spelet (för knappar/text)
export const isLastActiveGame = (currentTitle) => {
  const sequenceRaw = sessionStorage.getItem("activeGameSequence");
  if (!sequenceRaw) return true;
  const sequence = JSON.parse(sequenceRaw);
  const currentIndex = sequence.findIndex(g => g.title === currentTitle);
  return currentIndex === -1 || currentIndex === sequence.length - 1;
};