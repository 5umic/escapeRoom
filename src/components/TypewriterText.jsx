// Typewriter effect component for RPG-style text reveal
import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text, speed = 50, className = '' }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset animation when text changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <span className={className} style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</span>;
}
