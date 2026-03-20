import React, { useState, useEffect } from 'react';
import './Game7.css';
import PostGameInfo from './components/PostGameInfo.jsx';

const FALLBACK_INFO = {
  heading: 'Otroligt bra!',
  paragraphs: [
    'Du har framgångsrikt kartlagt nätverksarkitekturen. I moderna system följer data en logisk väg från klient till server, genom säkerhetslager och cache-system, innan den slutligen når databaser och lagring.',
    'På Trafikverket arbetar vi med komplexa nätverksarkitekturer för att säkerställa att våra system är både säkra och snabba. Varje komponent i kedjan har sin specifika roll - från lastbalansering till autentisering och caching.',
    'Genom att förstå hur data flödar genom systemen kan vi bygga robusta lösningar som hanterar Sveriges transportinfrastruktur dygnet runt.',
  ],
};

export default function Game7() {
  const [selectedNodes, setSelectedNodes] = useState([0]);
  const [isComplete, setIsComplete] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [lockedNodes, setLockedNodes] = useState([0]);
  const [lives, setLives] = useState(8);
  const [hasNewConnection, setHasNewConnection] = useState(false);
  const [losingLife, setLosingLife] = useState(false);

  const nodes = [
    { id: 0, x: 20, y: 20, label: 'Client' },
    { id: 1, x: 50, y: 15, label: 'Load Balancer' },
    { id: 2, x: 80, y: 20, label: 'API Gateway' },
    { id: 3, x: 15, y: 50, label: 'Auth Server' },
    { id: 4, x: 75, y: 50, label: 'App Server' },
    { id: 5, x: 25, y: 80, label: 'Database' },
    { id: 6, x: 50, y: 65, label: 'Cache' },
    { id: 7, x: 75, y: 85, label: 'File Storage' }
  ];

  const correctSequence = [0, 1, 2, 3, 4, 6, 5, 7];

  const handleNodeClick = (nodeId) => {
    if (isComplete || isValidating) return;
    if (validationResult === 'correct' || validationResult === 'gameover') return;

    if (validationResult === 'incorrect') {
      if (lockedNodes.includes(nodeId)) return;
      setValidationResult(null);
      setSelectedNodes([...lockedNodes, nodeId]);
      setHasNewConnection(true);
      return;
    }

    if (lockedNodes.includes(nodeId)) return;

    if (selectedNodes.includes(nodeId)) {
      const nodeIndex = selectedNodes.indexOf(nodeId);
      setSelectedNodes(selectedNodes.slice(0, nodeIndex));
      setHasNewConnection(false);
      return;
    }

    setSelectedNodes([...selectedNodes, nodeId]);
    setHasNewConnection(true);
  };

  const handleCheck = () => {
    if (selectedNodes.length === 0 || !hasNewConnection) return;
    setHasNewConnection(false);
    validateSequence(selectedNodes);
  };

  const validateSequence = (sequence) => {
    setIsValidating(true);
    
    setTimeout(() => {
      let correctCount = 0;
      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] === correctSequence[i]) correctCount++;
        else break;
      }

      const allCorrect = correctCount === sequence.length;
      const isFullyComplete = sequence.length === correctSequence.length && allCorrect;

      if (isFullyComplete) {
        setValidationResult('correct');
        setLockedNodes([...sequence]);
        setIsComplete(true);
      } else if (allCorrect) {
        setLockedNodes([...sequence]);
      } else {
        const newLives = lives - 1;
        setLosingLife(true);
        setLives(newLives);
        setTimeout(() => setLosingLife(false), 500);
        if (newLives <= 0) {
          setValidationResult('gameover');
        } else {
          setValidationResult('incorrect');
          setLockedNodes(sequence.slice(0, correctCount));
        }
      }
      setIsValidating(false);
    }, 500);
  };

  const handleReset = () => {
    setSelectedNodes([...lockedNodes]);
    setValidationResult(null);
    setIsValidating(false);
    setHasNewConnection(false);
  };

  const handleFullReset = () => {
    setSelectedNodes([0]);
    setLockedNodes([0]);
    setValidationResult(null);
    setIsValidating(false);
    setLives(8);
    setHasNewConnection(false);
  };

  const getLineColor = (lineIndex) => {
    if (!validationResult) return '#888888';
    if (lineIndex < lockedNodes.length - 1) return '#00ff00';
    if (validationResult === 'correct') return '#00ff00';
    if (validationResult === 'incorrect') return '#ff0000';
    return '#888888';
  };

  const renderLines = () => {
    const lines = [];
    for (let i = 0; i < selectedNodes.length - 1; i++) {
      const fromNode = nodes.find(n => n.id === selectedNodes[i]);
      const toNode = nodes.find(n => n.id === selectedNodes[i + 1]);
      
      if (fromNode && toNode) {
        const isCorrectLine = i < lockedNodes.length - 1;
        const isIncorrectLine = validationResult === 'incorrect' && i >= lockedNodes.length - 1;
        
        lines.push(
          <line
            key={`line-${i}`}
            x1={`${fromNode.x}%`}
            y1={`${fromNode.y}%`}
            x2={`${toNode.x}%`}
            y2={`${toNode.y}%`}
            className={`connection-line ${isCorrectLine ? 'correct' : ''} ${isIncorrectLine ? 'incorrect' : ''}`}
            stroke={getLineColor(i)}
            strokeWidth="3"
          />
        );
      }
    }
    return lines;
  };

  if (showInfo && !showSuccess) {
    return (
      <div className="game7-container">
        <div className="game7-content">
          <div className="info-section">
            <PostGameInfo
              gameKey="game7"
              fallbackHeading={FALLBACK_INFO.heading}
              fallbackParagraphs={FALLBACK_INFO.paragraphs}
              onContinue={() => setShowSuccess(true)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="game7-container final-screen">
        <div className="final-content">
          <h1 className="final-title">GRATTIS!</h1>
          <h2 className="final-subtitle">Du har klarat Escape Room!</h2>
          <div className="final-text">
            <p>
              Du har framgångsrikt tagit dig igenom alla utmaningar och löst varje pusselbit. 
              Från programmering och debugging till trafiksäkerhet och nätverksarkitektur - du har visat upp imponerande kompetens.
            </p>
            <p className="final-message">
              Tack för att du spelade! Du är redo för nya tekniska utmaningar.
            </p>
          </div>
          <button onClick={() => window.location.reload()} className="restart-button">
            Spela igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game7-container">
      <div className="game7-header">
        <h2>Spel 7: Nätverkskoppling</h2>
        <p className="game7-instructions">
          Hjälp oss!
          <br />
          Det är någon som har strulat till vår nätverksanslutning
          </p>
          <p className='game7-instructions'>
          Klicka på noderna i rätt ordning för att upprätta nätverksanslutningen.

        </p>
      </div>

      <div className="lives-container">
        {[...Array(8)].map((_, index) => (
          <img
            key={index}
            src="/assets/images/backgrounds/vecteezy_ai-generated-pixelation-of-red-heart-in-png-image_41638505.png"
            alt="heart"
            className={`heart ${index >= lives ? 'lost' : ''} ${index === lives && losingLife ? 'losing' : ''}`}
          />
        ))}
      </div>

      <div className="game7-content">
        <svg className="network-canvas" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {renderLines()}

          {nodes.map((node) => {
            const isSelected = selectedNodes.includes(node.id);
            const isLocked = lockedNodes.includes(node.id);
            const selectionOrder = selectedNodes.indexOf(node.id);
            
            return (
              <g key={node.id} className="node-group">
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="3"
                  className={`network-node ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${validationResult === 'correct' ? 'correct-node' : ''} ${validationResult === 'incorrect' && !isLocked ? 'incorrect-node' : ''}`}
                  onClick={() => handleNodeClick(node.id)}
                />
                
                {isSelected && (
                  <text
                    x={`${node.x}%`}
                    y={`${node.y}%`}
                    className="selection-number"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {selectionOrder + 1}
                  </text>
                )}
                <text
                  x={`${node.x}%`}
                  y={`${node.y + 7}%`}
                  className="node-label"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNodes.length > 0 && !validationResult && (
        <div className="check-container">
          <button 
            onClick={handleCheck} 
            className={`check-button ${!hasNewConnection ? 'disabled' : ''}`}
            disabled={!hasNewConnection}
          >
            Kontrollera Koppling
          </button>
        </div>
      )}

      {isComplete && validationResult === 'correct' && (
        <div className="success-container">
          <p className="success-message">
            Perfekt! Du har kopplat nätverket korrekt!
          </p>
          <button onClick={() => setShowInfo(true)} className="continue-button">
            Fortsätt
          </button>
        </div>
      )}

      {validationResult === 'incorrect' && (
        <div className="reset-container">
          <p className="error-message">
            {lockedNodes.length > 0 
              ? `De första ${lockedNodes.length} kopplingarna är korrekta! Fortsätt därifrån.`
              : 'Fel ordning! Försök igen.'}
          </p>
          <button onClick={handleReset} className="reset-button">
            Försök igen
          </button>
        </div>
      )}

      {validationResult === 'gameover' && (
        <div className="reset-container gameover">
          <p className="error-message gameover-message">
            💔 Alla liv förlorade! Du måste börja om från början.
          </p>
          <button onClick={handleFullReset} className="reset-button">
            Börja om
          </button>
        </div>
      )}
    </div>
  );
}
