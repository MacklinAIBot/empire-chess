// Game Info Component

import type { GameState } from '../game/types';
import { PLAYER_COLOR_HEX } from '../game/types';
import './GameInfo.css';

interface GameInfoProps {
  gameState: GameState;
  onNewGame: (numPlayers: number) => void;
}

export function GameInfo({ gameState, onNewGame }: GameInfoProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  return (
    <div className="game-info">
      <h1 className="game-title">Empire Chess</h1>
      
      {gameState.phase === 'finished' && gameState.winner && (
        <div className="winner-banner">
          🎉 {gameState.winner.toUpperCase()} Wins! 🎉
        </div>
      )}
      
      <div className="turn-indicator">
        <span 
          className="player-dot"
          style={{ backgroundColor: PLAYER_COLOR_HEX[currentPlayer.color] }}
        />
        <span className="turn-text">
          {gameState.phase === 'finished' 
            ? 'Game Over' 
            : `${currentPlayer.color.charAt(0).toUpperCase() + currentPlayer.color.slice(1)}'s Turn`
          }
        </span>
        {currentPlayer.inCheck && gameState.phase !== 'finished' && (
          <span className="check-warning">⚠️ CHECK!</span>
        )}
      </div>
      
      <div className="players-list">
        <h3>Players</h3>
        {gameState.players.map((player) => (
          <div 
            key={player.color} 
            className={`player-item ${!player.alive ? 'eliminated' : ''} ${player.color === currentPlayer.color && gameState.phase !== 'finished' ? 'active' : ''}`}
          >
            <span 
              className="player-dot"
              style={{ backgroundColor: PLAYER_COLOR_HEX[player.color] }}
            />
            <span className="player-name">
              {player.color.charAt(0).toUpperCase() + player.color.slice(1)}
            </span>
            {!player.alive && <span className="eliminated-text">(Eliminated)</span>}
          </div>
        ))}
      </div>
      
      <div className="game-controls">
        <label>New Game:</label>
        <div className="player-buttons">
          <button onClick={() => onNewGame(2)}>2 Players</button>
          <button onClick={() => onNewGame(4)}>4 Players</button>
        </div>
      </div>
      
      <div className="rules-info">
        <h4>Empire Chess Rules:</h4>
        <ul>
          <li>32×32 board with 4x scale pieces</li>
          <li>Pieces move up to 4× normal distance</li>
          <li>King limited to 1 square when in check</li>
          <li>Pawns can move sideways</li>
          <li>Turn order: Clockwise</li>
          <li>Win: Capture all enemy kings</li>
        </ul>
      </div>
    </div>
  );
}
