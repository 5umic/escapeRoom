export const getNextGameInfo = (currentTitle) => {
  const sequenceRaw = sessionStorage.getItem("activeGameSequence");
  if (!sequenceRaw) return { isLast: true, nextPath: "/gymnasium/leaderboard" };

  const sequence = JSON.parse(sequenceRaw);
  const currentIndex = sequence.findIndex((g) => g.title === currentTitle);

  // Om vi inte hittar spelet eller om det är det sista i listan
  if (currentIndex === -1 || currentIndex >= sequence.length - 1) {
    return { isLast: true, nextPath: "/gymnasium/leaderboard" };
  }

  // Hämta nästa spel och tvätta titeln
  const nextGame = sequence[currentIndex + 1];
  const sanitizedTitle = nextGame.title.replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, "");

  return {
    isLast: false,
    nextPath: `/gymnasium/${sanitizedTitle}`,
    nextTitle: nextGame.title,
  };
};

// För enkelhets skull i knappar etc.
export const isLastActiveGame = (currentTitle) => {
  return getNextGameInfo(currentTitle).isLast;
};

export const getFirstActiveGamePath = (allGames) => {
  const activeGames = allGames
    .filter((g) => g.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeGames.length > 0) {
    // Returnerar sökvägen till det första spelet som faktiskt får spelas
    return `/game${activeGames[0].id}`;
  }
  return "/"; // Om inget spel är aktivt
};
