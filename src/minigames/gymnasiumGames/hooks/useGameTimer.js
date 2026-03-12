import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const formatTimeWithTenths = (totalSeconds) => {
  if (totalSeconds === undefined || isNaN(totalSeconds)) return "0:00.0";
  // Math.max ser till att vi aldrig får minus-minuter om något går fel
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.floor(Math.max(0, totalSeconds) % 60);
  const tenths = Math.floor((totalSeconds % 1) * 10);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;
};

export function useGameTimer(
  totalTimeLimit,
  status,
  setStatus,
  penaltySeconds = 0,
) {
  const [secondsLeft, setSecondsLeft] = useState(totalTimeLimit);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionActive = sessionStorage.getItem("gameSessionActive");
    if (!sessionActive) {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (
      status === "success" ||
      status === "answered_correctly" ||
      status === "time_out" ||
      status === "answered_wrong" ||
      status === "loading"
    )
      return;

    // Om tiden tar slut
    if (secondsLeft <= 0) {
      addTimeToSession(totalTimeLimit + penaltySeconds);
      setStatus("time_out");
      return;
    }

    const t = setTimeout(() => {
      setSecondsLeft((s) => {
        const nextValue = s - 0.1;

        return parseFloat(Math.max(0, nextValue).toFixed(1));
      });
    }, 100);

    return () => clearTimeout(t);
  }, [secondsLeft, status, totalTimeLimit, setStatus, penaltySeconds]);

  const addTimeToSession = (secondsToAdd) => {
    const currentTotal = Number(sessionStorage.getItem("totalGameTime")) || 0;
    sessionStorage.setItem("totalGameTime", currentTotal + secondsToAdd);
  };

  const getTimeTaken = () => {
    const timeElapsed = totalTimeLimit - secondsLeft + penaltySeconds;
    return parseFloat(timeElapsed.toFixed(1));
  };

  return {
    secondsLeft,
    formattedSecondsLeft: formatTimeWithTenths(secondsLeft),
    setSecondsLeft,
    getTimeTaken,
    formattedTimeTaken: formatTimeWithTenths(getTimeTaken()),
    addTimeToSession,
  };
}
