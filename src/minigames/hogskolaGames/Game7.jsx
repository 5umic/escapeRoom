import React, { useState, useEffect } from 'react';
import './Game7.css';

export default function Game7() {
  const [selectedNodes, setSelectedNodes] = useState([0]); // Start with Client node selected
  const [isComplete, setIsComplete] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // 'correct' or 'incorrect'
  const [lockedNodes, setLockedNodes] = useState([0]); // Client node is locked from the start
  const [lives, setLives] = useState(8); // Player has 8 lives
  const [hasNewConnection, setHasNewConnection] = useState(false); // Track if player made a new connection
  const [losingLife, setLosingLife] = useState(false); // Track when losing a life for shake animation

  // Network nodes with positions (percentage-based for responsiveness)
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

  // Correct sequence: Client → Load Balancer → API Gateway → Auth Server → App Server → Cache → Database → File Storage
  const correctSequence = [0, 1, 2, 3, 4, 6, 5, 7];

  // Handle node click
  const handleNodeClick = (nodeId) => {
    if (isComplete || isValidating || validationResult) return;
    if (lockedNodes.includes(nodeId)) return; // Can't click locked nodes

    // If node is already selected, remove it and all nodes after it
    if (selectedNodes.includes(nodeId)) {
      const nodeIndex = selectedNodes.indexOf(nodeId);
      const newSelection = selectedNodes.slice(0, nodeIndex);
      setSelectedNodes(newSelection);
      setHasNewConnection(false); // Removing nodes doesn't count as new connection
      return;
    }

    // Otherwise, add the node to the selection
    const newSelection = [...selectedNodes, nodeId];
    setSelectedNodes(newSelection);
    setHasNewConnection(true); // Mark that a new connection was made
  };

  // Check the connection
  const handleCheck = () => {
    if (selectedNodes.length === 0) return;
    if (!hasNewConnection) return; // Don't allow check if no new connection was made
    setHasNewConnection(false); // Reset the flag
    validateSequence(selectedNodes);
  };

  // Validate the sequence
  const validateSequence = (sequence) => {
    setIsValidating(true);
    
    setTimeout(() => {
      // Check how many nodes from the start are correct
      let correctCount = 0;
      for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] === correctSequence[i]) {
          correctCount++;
        } else {
          break; // Stop at first incorrect node
        }
      }

      const allSelectedAreCorrect = correctCount === sequence.length;
      const isFullyComplete = sequence.length === correctSequence.length && allSelectedAreCorrect;
      
      if (isFullyComplete) {
        // All nodes connected correctly - game won!
        setValidationResult('correct');
        setLockedNodes([...sequence]);
        setIsComplete(true);
      } else if (allSelectedAreCorrect) {
        // Partial sequence but all correct so far - lock them and continue
        setLockedNodes([...sequence]);
        // Don't set validationResult so the button stays visible
      } else {
        // Wrong answer - lose a life
        const newLives = lives - 1;
        setLosingLife(true); // Trigger shake animation
        setLives(newLives);
        
        // Reset shake animation after it completes
        setTimeout(() => setLosingLife(false), 500);
        
        if (newLives <= 0) {
          // Game over - reset everything
          setValidationResult('gameover');
        } else {
          setValidationResult('incorrect');
          // Lock the correct prefix
          setLockedNodes(sequence.slice(0, correctCount));
        }
      }
      setIsValidating(false);
    }, 500); // Brief delay for animation
  };

  // Reset the game - only clears nodes after locked ones
  const handleReset = () => {
    setSelectedNodes([...lockedNodes]);
    setValidationResult(null);
    setIsValidating(false);
    setHasNewConnection(false);
  };

  // Full reset when lives run out
  const handleFullReset = () => {
    setSelectedNodes([0]); // Start with Client node selected
    setLockedNodes([0]); // Client node is locked from the start
    setValidationResult(null);
    setIsValidating(false);
    setLives(8);
    setHasNewConnection(false);
  };

  // Get line color based on validation state and position
  const getLineColor = (lineIndex) => {
    if (!validationResult) return '#888888'; // Gray while building
    
    // Check if this connection is in the locked (correct) section
    if (lineIndex < lockedNodes.length - 1) {
      return '#00ff00'; // Green for correct connections
    }
    
    if (validationResult === 'correct') return '#00ff00';
    if (validationResult === 'incorrect') return '#ff0000'; // Red for incorrect
    return '#888888';
  };

  // Render lines between selected nodes
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

  // Info screen after completion
  if (showInfo && !showSuccess) {
    return (
      <div className="game7-container">
        <div className="game7-content">
          <div className="info-section">
            <h2 className="info-title">Otroligt bra!</h2>
            <div className="info-text">
              <p>
                Du har framgångsrikt kartlagt nätverksarkitekturen. I moderna system följer data en logisk väg från klient till server, genom säkerhetslager och cache-system, innan den slutligen når databaser och lagring.
              </p>
              <p>
                På Trafikverket arbetar vi med komplexa nätverksarkitekturer för att säkerställa att våra system är både säkra och snabba. Varje komponent i kedjan har sin specifika roll - från lastbalansering till autentisering och caching.
              </p>
              <p>
                Genom att förstå hur data flödar genom systemen kan vi bygga robusta lösningar som hanterar Sveriges transportinfrastruktur dygnet runt.
              </p>
            </div>
            <button onClick={() => setShowSuccess(true)} className="continue-button">
              Fortsätt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Final success screen
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

  // Main game screen
  // error-message
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

      {/* Lives display */}
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
          {/* Render connection lines */}
          {renderLines()}

          {/* Render nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodes.includes(node.id);
            const isLocked = lockedNodes.includes(node.id);
            const selectionOrder = selectedNodes.indexOf(node.id);
            
            return (
              <g key={node.id} className="node-group">
                {/* Node circle */}
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="4"
                  className={`network-node ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${validationResult === 'correct' ? 'correct-node' : ''} ${validationResult === 'incorrect' && !isLocked ? 'incorrect-node' : ''}`}
                  onClick={() => handleNodeClick(node.id)}
                />
                
                {/* Selection order number */}
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
                
                {/* Node label */}
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

      {/* Check button (shown when nodes are selected and not yet validated) */}
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

      {/* Success button (shown when completed correctly) */}
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

      {/* Reset button (shown when validation fails) */}
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

      {/* Game over - all lives lost */}
      {validationResult === 'gameover' && (
        <div className="reset-container gameover">
          <p className="error-message gameover-message">
            💔 Alla liv förlorade! Du måste börja om från början.
          </p>
          <button onClick={handleFullReset} className="reset-button">
            Börja om från början
          </button>
        </div>
      )}
    </div>
  );
}
