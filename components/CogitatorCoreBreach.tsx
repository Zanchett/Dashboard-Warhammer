import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, Database, Shield } from 'lucide-react';

interface Node {
  type: 'data' | 'firewall' | 'power' | 'empty';
  active: boolean;
  revealed: boolean;
  hint: string;
  showHint: boolean;
}

interface CogitatorCoreBreachProps {
  onSuccess: () => void;
  onFailure: () => void;
}

const CogitatorCoreBreach: React.FC<CogitatorCoreBreachProps> = ({ onSuccess, onFailure }) => {
  const [grid, setGrid] = useState<Node[][]>([]);
  const [energy, setEnergy] = useState(100);
  const [dataCollected, setDataCollected] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [scansAvailable, setScansAvailable] = useState(3);

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid: Node[][] = [];
    for (let i = 0; i < 8; i++) {
      const row: Node[] = [];
      for (let j = 0; j < 8; j++) {
        row.push(generateNode());
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  const generateNode = (): Node => {
    const rand = Math.random();
    if (rand < 0.1) return { type: 'data', active: true, revealed: false, hint: 'D', showHint: false };
    if (rand < 0.3) return { type: 'firewall', active: true, revealed: false, hint: 'F', showHint: false };
    if (rand < 0.5) return { type: 'power', active: true, revealed: false, hint: 'P', showHint: false };
    return { type: 'empty', active: false, revealed: false, hint: '-', showHint: false };
  };

  const handleNodeClick = (row: number, col: number) => {
    if (gameStatus !== 'playing' || energy <= 0) return;

    const newGrid = [...grid];
    const node = newGrid[row][col];

    if (!node.revealed) {
      node.revealed = true;
      setEnergy(energy - 5);

      if (node.type === 'data') {
        setDataCollected(dataCollected + 1);
        if (dataCollected + 1 >= 5) {
          setGameStatus('won');
          onSuccess();
        }
      } else if (node.type === 'firewall') {
        setEnergy(energy - 20);
      } else if (node.type === 'power') {
        setEnergy(Math.min(energy + 15, 100));
      }

      if (energy - 5 <= 0) {
        setGameStatus('lost');
        onFailure();
      }
    }

    setGrid(newGrid);
  };

  const handleScan = () => {
    if (scansAvailable > 0 && gameStatus === 'playing') {
      const newGrid = grid.map((row, i) =>
        row.map((node, j) => {
          if (!node.revealed) {
            const adjacentNodes = [
              grid[i - 1]?.[j],
              grid[i + 1]?.[j],
              grid[i]?.[j - 1],
              grid[i]?.[j + 1],
            ].filter(Boolean);
            const hasRevealedNeighbor = adjacentNodes.some((n) => n.revealed);
            if (hasRevealedNeighbor) {
              return { ...node, showHint: true };
            }
          }
          return node;
        })
      );
      setGrid(newGrid);
      setScansAvailable(scansAvailable - 1);
    }
  };

  const getNodeIcon = (node: Node) => {
    if (!node.revealed) {
      if (node.showHint) {
        return <span className="node-hint">{node.hint}</span>;
      }
      return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
    switch (node.type) {
      case 'data':
        return <Database className="w-6 h-6 text-blue-500" />;
      case 'firewall':
        return <Shield className="w-6 h-6 text-red-500" />;
      case 'power':
        return <Zap className="w-6 h-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="cogitator-core-breach">
      <div className="game-header">
        <h2>Cogitator Core Breach</h2>
        <div className="game-stats">
          <span>Energy: {energy}</span>
          <span>Data Collected: {dataCollected}/5</span>
          <span>Scans: {scansAvailable}</span>
        </div>
      </div>
      <div className="grid-container">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((node, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-node ${node.revealed ? 'revealed' : ''} ${node.type}`}
                onClick={() => handleNodeClick(rowIndex, colIndex)}
              >
                {getNodeIcon(node)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        className="scan-button"
        onClick={handleScan}
        disabled={scansAvailable === 0 || gameStatus !== 'playing'}
      >
        Scan
      </button>
      {gameStatus === 'won' && (
        <div className="game-message success">Access granted. Core breached successfully.</div>
      )}
      {gameStatus === 'lost' && (
        <div className="game-message failure">Energy depleted. Breach attempt failed.</div>
      )}
    </div>
  );
};

export default CogitatorCoreBreach;
