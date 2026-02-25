import { useState, useEffect } from "react";

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
      // FIXEN: Vi väntar 1000 millisekunder (1 sekund) så att den grafiska mätaren
      // hinner animera ner till 0% innan vi kastar upp "Tiden är ute!"-skärmen.
      const delay = setTimeout(() => {
        addTimeToSession(totalTimeLimit + penaltySeconds);
        setStatus("time_out");
      }, 1250);

      return () => clearTimeout(delay);
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, status, totalTimeLimit, setStatus, penaltySeconds]);

  const addTimeToSession = (secondsToAdd) => {
    const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
    sessionStorage.setItem("totalGameTime", currentTotal + secondsToAdd);
  };

  const getTimeTaken = () => totalTimeLimit - secondsLeft + penaltySeconds;

  return { secondsLeft, setSecondsLeft, getTimeTaken, addTimeToSession };
}
