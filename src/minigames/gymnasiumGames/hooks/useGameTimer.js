import { useState, useEffect } from "react";

export const formatTime = (totalSeconds) => {
  if (totalSeconds === undefined || isNaN(totalSeconds)) return "0:00";
  // Math.max ser till att vi aldrig får minus-minuter om något går fel
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

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

  return {
    secondsLeft,
    formattedSecondsLeft: formatTime(secondsLeft),
    setSecondsLeft,
    getTimeTaken,
    formattedTimeTaken: formatTime(getTimeTaken()),
    addTimeToSession,
  };
}
