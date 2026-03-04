// Mini-game 7 implementation (optional)
import React from 'react';

export default function Game7() {
  return (
    <div style={{
      background: '#d70000',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '50px',
        borderRadius: '20px',
        textAlign: 'center',
        border: '4px solid #fff',
        maxWidth: '600px'
      }}>
        <h2 style={{
          fontSize: '48px',
          color: '#fff',
          marginBottom: '20px',
          fontFamily: 'Pixelify Sans, sans-serif',
          fontWeight: 'bold'
        }}>
          GRATTIS!
        </h2>
        <p style={{
          fontSize: '24px',
          color: '#fff',
          margin: '30px 0',
          fontFamily: 'Pixelify Sans, sans-serif'
        }}>
          Du har klarat alla spel i Högskola-nivån!
        </p>
      </div>
    </div>
  );
}
