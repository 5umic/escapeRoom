// Jigsaw Puzzle Game - Trafikverket Logo
import React, { useState, useEffect } from 'react';
import './Game5.css';
import Game6 from './Game6.jsx';

export default function Game5() {
  const GRID_COLS = 4;
  const GRID_ROWS = 6;
  const TOTAL_PIECES = GRID_COLS * GRID_ROWS;

  const [pieces, setPieces] = useState([]);
  const [board, setBoard] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGame6, setShowGame6] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState(null);

  useEffect(() => {
    initializePuzzle();
  }, []);

  useEffect(() => {
    if (board.length === 0) return;
    
    let complete = true;
    for (let i = 0; i < TOTAL_PIECES; i++) {
      if (board[i] !== i) {
        complete = false;
        break;
      }
    }
    
    if (complete) {
      console.log('Puzzle complete!', board);
    }
    setIsComplete(complete);
  }, [board]);

  const initializePuzzle = () => {
    const allPieces = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
    
    const shuffled = [...allPieces].sort(() => Math.random() - 0.5);
    
    setPieces(shuffled);
    setBoard(Array(TOTAL_PIECES).fill(null));
    setIsComplete(false);
  };

  const getPieceStyle = (pieceId) => {
    const row = Math.floor(pieceId / GRID_COLS);
    const col = pieceId % GRID_COLS;

    return {
      backgroundImage: 'url(/assets/images/backgrounds/TV_logo_symbol_rgb_neg.png)',
      backgroundSize: `${GRID_COLS * 100}% ${GRID_ROWS * 100}%`,
      backgroundPosition: `${(col * 100) / (GRID_COLS - 1)}% ${(row * 100) / (GRID_ROWS - 1)}%`,
    };
  };

  const handleDragStart = (e, pieceId, fromPieces) => {
    if (fromPieces && board.includes(pieceId)) {
      e.preventDefault();
      return;
    }
    setDraggedPiece({ pieceId, fromPieces });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnBoard = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedPiece || isComplete) return;

    const { pieceId, fromPieces } = draggedPiece;

    if (fromPieces) {
      const newBoard = [...board];
      
      if (newBoard[targetIndex] !== null) {
      }
      
      newBoard[targetIndex] = pieceId;
      setBoard(newBoard);
    } else {
      const fromIndex = board.indexOf(pieceId);
      const newBoard = [...board];
      
      [newBoard[fromIndex], newBoard[targetIndex]] = [newBoard[targetIndex], newBoard[fromIndex]];
      setBoard(newBoard);
    }

    setDraggedPiece(null);
  };

  const handleDropOnPieces = (e) => {
    e.preventDefault();
    if (!draggedPiece || isComplete) return;

    const { pieceId, fromPieces } = draggedPiece;

    if (!fromPieces) {
      // Moving from board back to pieces
      const newBoard = [...board];
      const pieceIndex = newBoard.indexOf(pieceId);
      newBoard[pieceIndex] = null;
      
      setBoard(newBoard);
    }

    setDraggedPiece(null);
  };

  const handleReset = () => {
    initializePuzzle();
  };

  if (showGame6) {
    return <Game6 />;
  }

  if (showSuccess) {
    return (
      <div className="game5-success">
        <div className="success-content">
          <h2>SNYGGT!</h2>
          <p className="reward-word">
            <span className="reward-label">Du lade ihop pusslet!</span>
          </p>
          <button className="continue-button" onClick={() => setShowGame6(true)}>Fortsätt</button>
        </div>
      </div>
    );
  }

  if (showInfo) {
    return (
      <div className="game5-container">
        <div className="game5-content">
          <div className="info-section">
            <h2 className="info-title">UTMÄRKT!</h2>
            
            <div className="info-text">
              <p>
                Vår logotyp symboliserar det ansvar vi bär och den service vi levererar till svenska folket varje dag. Vi är stolta över att representera Trafikverket och att vara en del av Sveriges infrastruktur. Genom vårt arbete bidrar vi till ett samhälle där människor kan resa säkert, hållbart och effektivt - det är ett uppdrag vi tar på största allvar och utför med stolthet.
              </p>
              <p>
                Trafikverket är en myndighet under Infrastrukturdepartementet med ansvar för långsiktig planering av transportsystemet för vägtrafik, järnvägstrafik, sjöfart och luftfart. Vi ansvarar för byggande, drift och underhåll av statliga vägar och järnvägar.
              </p>
              <p>
                Vårt uppdrag är att svara för den samlade sektorsuppföljningen och för samordning, planering och samverkan för att nå målen i transportpolitiken. Vi arbetar för ett tillgängligt Sverige med en hållbar och jämlik transportförsörjning där hänsyn tas till människors säkerhet och miljön.
              </p>
              <p>
                Genom innovation och digitalisering utvecklar vi smarta lösningar för framtidens transporter. IKT och cybersäkerhet är centrala delar i denna utveckling där vi kontinuerligt arbetar med att skydda våra system samtidigt som vi gör dem mer effektiva och tillgängliga.
              </p>
            </div>

            <button className="continue-button" onClick={() => setShowSuccess(true)}>
              Fortsätt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game5-container">
      <div className="game5-content">
        <h1 className="game5-title">Pusslet</h1>
        <p className="game5-instructions">
          Dra och släpp pusselbitarna till rätt plats för att bygga ihop Trafikverkets logotyp!
        </p>

        <div className="game5-header">
        </div>

        <div className="puzzle-area">
          {/* Board */}
          <div className="board-wrapper">
            <div className="puzzle-board">
              {Array.from({ length: TOTAL_PIECES }, (_, index) => (
                <div
                  key={index}
                  className={`board-slot ${board[index] !== null ? 'filled' : 'empty'} ${
                    isComplete ? 'complete' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnBoard(e, index)}
                >
                  {board[index] !== null && (
                    <div
                      className="puzzle-piece placed"
                      style={getPieceStyle(board[index])}
                      draggable={!isComplete}
                      onDragStart={(e) => handleDragStart(e, board[index], false)}
                    >
                      {(board[index] === 0 || board[index] === 3) && (
                        <span className="piece-number">{board[index] + 1}</span>
                      )}
                    </div>
                  )}
                  {board[index] === null && (       <span className="slot-number">{index + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div
            className="pieces-container"
            onDragOver={handleDragOver}
            onDrop={handleDropOnPieces}
          >
            <h3>Tillgängliga bitar:</h3>
            <div className="pieces-grid">
              {pieces.map((pieceId, idx) => {
                const isPlaced = board.includes(pieceId);
                return (
                  <div
                    key={idx}
                    className={`puzzle-piece ${isPlaced ? 'used' : ''}`}
                    style={getPieceStyle(pieceId)}
                    draggable={!isComplete && !isPlaced}
                    onDragStart={(e) => handleDragStart(e, pieceId, true)}
                  >
                    {(pieceId === 0 || pieceId === 3) && (
                      <span className="piece-number">{pieceId + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="completion-message">
            <p>🎉 Pusslet är klart! Bra jobbat!</p>
            <button className="continue-button" onClick={() => setShowInfo(true)}>
              Gå vidare
            </button>
          </div>
        )}
        
        {/* debug info remove later */}
        {!isComplete && board.filter(b => b !== null).length === TOTAL_PIECES && (
          <div style={{color: 'white', marginTop: '20px', textAlign: 'center'}}>
            <p>Alla bitar placerade men inte i rätt ordning. Kontrollera placeringen!</p>
          </div>
        )}
      </div>
    </div>
  );
}
