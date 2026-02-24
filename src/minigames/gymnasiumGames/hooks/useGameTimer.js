import { useState, useEffect } from "react";

// LÄGG TILL: penaltySeconds = 0
export function useGameTimer(
  totalTimeLimit,
  status,
  setStatus,
  penaltySeconds = 0,
) {
  const [secondsLeft, setSecondsLeft] = useState(totalTimeLimit);

  useEffect(() => {
    setSecondsLeft(totalTimeLimit);
  }, [totalTimeLimit]);

  useEffect(() => {
    if (
      status === "success" ||
      status === "answered_correctly" ||
      status === "time_out" ||
      status === "answered_wrong"
    )
      return;

    if (secondsLeft <= 0) {
      // LÄGG TILL STRAFF VID TIMEOUT
      addTimeToSession(totalTimeLimit + penaltySeconds);
      setStatus("time_out");
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, status, totalTimeLimit, setStatus, penaltySeconds]);

  const addTimeToSession = (secondsToAdd) => {
    const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
    sessionStorage.setItem("totalGameTime", currentTotal + secondsToAdd);
  };

  // RÄKNA UT TOTAL TID INKLUSIVE STRAFFKLICK
  const getTimeTaken = () => totalTimeLimit - secondsLeft + penaltySeconds;

  return { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession };
}
