// Benchmark Component - AI Parameter Testing

import { useState } from 'react';
import { initializeGame, nextTurn, checkForCheck, checkWinCondition } from '../game/gameLogic';
import { getAIMove } from '../game/ai';
import './Benchmark.css';

interface BenchmarkParams {
  numPlayers: number;
  numGames: number;
  maxMoves: number;
}

interface BenchmarkResult {
  blue: number;
  red: number;
  green: number;
  yellow: number;
  draws: number;
}

export function Benchmark() {
  const [params, setParams] = useState<BenchmarkParams>({
    numPlayers: 4,
    numGames: 10,
    maxMoves: 2000,
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [progress, setProgress] = useState(0);
  
  const runGame = () => {
    let gs = initializeGame(params.numPlayers);
    let moves = 0;
    
    while (gs.phase !== 'finished' && moves < params.maxMoves) {
      const player = gs.players[gs.currentPlayerIndex];
      
      if (!player.alive) {
        gs.currentPlayerIndex = nextTurn(gs.players, gs.currentPlayerIndex);
        continue;
      }
      
      const aiMove = getAIMove(gs);
      if (!aiMove) break;
      
      // Make move
      const newBoard = gs.board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
      const currentPlayer = gs.players[gs.currentPlayerIndex];
      const selectedPiece = newBoard[aiMove.from.row][aiMove.from.col].piece;
      const clickedCell = newBoard[aiMove.to.row][aiMove.to.col].piece;
      
      if (clickedCell) {
        currentPlayer.capturedPieces.push(clickedCell);
        if (clickedCell.type === 'king') {
          const capturedPlayerIndex = gs.players.findIndex(p => p.color === clickedCell.player);
          if (capturedPlayerIndex !== -1) {
            gs.players[capturedPlayerIndex].alive = false;
          }
        }
      }
      
      newBoard[aiMove.to.row][aiMove.to.col].piece = selectedPiece;
      newBoard[aiMove.from.row][aiMove.from.col].piece = null;
      if (selectedPiece) selectedPiece.hasMoved = true;
      
      const nextPlayerIndex = nextTurn(gs.players, gs.currentPlayerIndex);
      const updatedPlayers = gs.players.map((p, idx) => ({
        ...p,
        inCheck: idx === nextPlayerIndex ? checkForCheck(newBoard, p.color, gs.players) : p.inCheck,
      }));
      
      const winner = checkWinCondition(updatedPlayers);
      
      gs = {
        ...gs,
        board: newBoard,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        phase: winner ? 'finished' : 'playing',
        winner,
      };
      moves++;
    }
    
    return gs.winner;
  };
  
  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    setProgress(0);
    
    const results: BenchmarkResult = {
      blue: 0, red: 0, green: 0, yellow: 0, draws: 0
    };
    
    for (let i = 0; i < params.numGames; i++) {
      const winner = runGame();
      if (winner && winner in results) {
        (results as any)[winner]++;
      } else {
        results.draws++;
      }
      setProgress(Math.round(((i + 1) / params.numGames) * 100));
      
      // Small delay to not freeze UI
      await new Promise(r => setTimeout(r, 10));
    }
    
    setResult(results);
    setIsRunning(false);
  };
  
  return (
    <div className="benchmark-page">
      <div className="benchmark-container">
        <h2>🧪 AI Benchmark</h2>
        <p className="benchmark-desc">
          Run headless games to test and improve AI strategies.
        </p>
        
        <div className="params-section">
          <h3>Parameters</h3>
          
          <div className="param-row">
            <label>Players:</label>
            <select 
              value={params.numPlayers}
              onChange={(e) => setParams({...params, numPlayers: Number(e.target.value)})}
              disabled={isRunning}
            >
              <option value={2}>2 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>
          
          <div className="param-row">
            <label>Number of Games:</label>
            <input 
              type="number" 
              value={params.numGames}
              onChange={(e) => setParams({...params, numGames: Number(e.target.value)})}
              disabled={isRunning}
              min={1}
              max={100}
            />
          </div>
          
          <div className="param-row">
            <label>Max Moves per Game:</label>
            <input 
              type="number" 
              value={params.maxMoves}
              onChange={(e) => setParams({...params, maxMoves: Number(e.target.value)})}
              disabled={isRunning}
              min={100}
              max={10000}
              step={100}
            />
          </div>
          
          <button 
            className="run-button"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? `Running... ${progress}%` : '▶ Run Benchmark'}
          </button>
        </div>
        
        {result && (
          <div className="results-section">
            <h3>Results</h3>
            <div className="results-grid">
              <div className="result-item blue">
                <span className="result-label">Blue</span>
                <span className="result-value">{result.blue}</span>
              </div>
              <div className="result-item red">
                <span className="result-label">Red</span>
                <span className="result-value">{result.red}</span>
              </div>
              {params.numPlayers >= 4 && (
                <>
                  <div className="result-item green">
                    <span className="result-label">Green</span>
                    <span className="result-value">{result.green}</span>
                  </div>
                  <div className="result-item yellow">
                    <span className="result-label">Yellow</span>
                    <span className="result-value">{result.yellow}</span>
                  </div>
                </>
              )}
              <div className="result-item draws">
                <span className="result-label">Draws</span>
                <span className="result-value">{result.draws}</span>
              </div>
            </div>
            
            <div className="total-games">
              Total: {result.blue + result.red + result.green + result.yellow + result.draws} games
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
