import React, { useEffect, useMemo, useState } from "react";
import { fetchHogskolaInfo } from "../api/infoContentApi";

export default function PostGameInfo({
  gameKey,
  fallbackHeading,
  fallbackParagraphs,
  onContinue,
}) {
  const [heading, setHeading] = useState(fallbackHeading);
  const [body, setBody] = useState(fallbackParagraphs.join("\n\n"));

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const info = await fetchHogskolaInfo(gameKey);
        if (!active) return;
        if (info?.heading) setHeading(info.heading);
        if (info?.body) setBody(info.body);
      } catch {
        if (!active) return;
        setHeading(fallbackHeading);
        setBody(fallbackParagraphs.join("\n\n"));
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [gameKey, fallbackHeading, fallbackParagraphs]);

  const paragraphs = useMemo(() => {
    return body
      .split(/\n\s*\n/g)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [body]);

  return (
    <>
      <h2 className="info-title">{heading}</h2>
      <div className="info-text">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <button className="continue-button" onClick={onContinue}>
        Fortsätt
      </button>
    </>
  );
}
