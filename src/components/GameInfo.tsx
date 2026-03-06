// Game Info Component

import { useState } from 'react';
import type { GameState, Piece, Position } from '../game/types';
import { PLAYER_COLOR_HEX } from '../game/types';
import './GameInfo.css';

interface PlayerType {
  color: string;
  isAI: boolean;
}

interface GameInfoProps {
  gameState: GameState;
  onNewGame: (numPlayers: number, seed?: number) => void;
  selectedPiece: Piece | null;
  selectedPosition: Position | null;
  playerTypes: PlayerType[];
  onToggleAI: (color: string) => void;
}

const PIECE_DESCRIPTIONS: Record<string, string> = {
  king: 'Moves 2 squares any direction. Limited to 1 when in check or attacking. Cannot move through or into attacked squares.',
  queen: 'Moves up to 8 squares in any direction (horizontal, vertical, or diagonal).',
  rook: 'Moves up to 8 squares horizontally or vertically.',
  bishop: 'Moves up to 8 squares diagonally.',
  knight: 'Moves in L-shapes: 1×2, 2×1, 2×4, or 4×2 squares. Can jump over pieces.',
  pawn: 'Moves 2 spaces any direction (forward, backward, sideways). 4 spaces on first move. Captures diagonally 1 space.',
};

function colToLetter(col: number): string {
  if (col < 26) {
    return String.fromCharCode(65 + col);
  } else {
    const letterIndex = col - 26;
    const letter = String.fromCharCode(65 + letterIndex);
    return letter + letter;
  }
}

function getPieceSymbol(type: string): string {
  switch (type) {
    case 'king': return '♚';
    case 'queen': return '♛';
    case 'rook': return '♜';
    case 'bishop': return '♝';
    case 'knight': return '♞';
    case 'pawn': return '♟';
    default: return '';
  }
}

export function GameInfo({ gameState, onNewGame, selectedPiece, selectedPosition, playerTypes, onToggleAI }: GameInfoProps) {
  const [seedInput, setSeedInput] = useState<string>('');
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  const positionNotation = selectedPosition 
    ? `${colToLetter(selectedPosition.col)}${gameState.board.length - selectedPosition.row}`
    : null;
  
  return (
    <div className="game-info">
      <h1 className="game-title">Terra Chess</h1>
      
      <div className="selection-card">
        {selectedPiece ? (
          <>
            <div className="selection-header">
              <span 
                className="selection-piece"
                style={{ color: PLAYER_COLOR_HEX[selectedPiece.player as keyof typeof PLAYER_COLOR_HEX] }}
              >
                {getPieceSymbol(selectedPiece.type)}
              </span>
              <span className="selection-name">
                {selectedPiece.type.charAt(0).toUpperCase() + selectedPiece.type.slice(1)}
              </span>
              <span 
                className="selection-player"
                style={{ color: PLAYER_COLOR_HEX[selectedPiece.player as keyof typeof PLAYER_COLOR_HEX] }}
              >
                ({selectedPiece.player})
              </span>
            </div>
            <div className="selection-position">
              Position: {positionNotation}
            </div>
            <div className="selection-description">
              {PIECE_DESCRIPTIONS[selectedPiece.type]}
            </div>
          </>
        ) : (
          <div className="selection-placeholder">
            Click a piece to see details
          </div>
        )}
      </div>
      
      {gameState.phase === 'finished' && gameState.winner && (
        <div className="winner-banner">
          🎉 {gameState.winner.toUpperCase()} Wins! 🎉
        </div>
      )}
      
      <div className="turn-indicator">
        <span 
          className="player-dot"
          style={{ backgroundColor: PLAYER_COLOR_HEX[currentPlayer.color as keyof typeof PLAYER_COLOR_HEX] }}
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
        {gameState.players.map((player) => {
          const playerType = playerTypes.find(p => p.color === player.color);
          return (
            <div 
              key={player.color} 
              className={`player-item ${!player.alive ? 'eliminated' : ''} ${player.color === currentPlayer.color && gameState.phase !== 'finished' ? 'active' : ''}`}
            >
              <span 
                className="player-dot"
                style={{ backgroundColor: PLAYER_COLOR_HEX[player.color as keyof typeof PLAYER_COLOR_HEX] }}
              />
              <span className="player-name">
                {player.color.charAt(0).toUpperCase() + player.color.slice(1)}
              </span>
              <button 
                className={`ai-toggle ${playerType?.isAI ? 'ai-on' : ''}`}
                onClick={() => onToggleAI(player.color)}
                title={playerType?.isAI ? 'Click to make human' : 'Click to make AI'}
              >
                {playerType?.isAI ? '🤖' : '👤'}
              </button>
              {!player.alive && <span className="eliminated-text">(Eliminated)</span>}
            </div>
          );
        })}
      </div>
      
      <div className="game-controls">
        <label>New Game:</label>
        <input 
          type="number" 
          className="seed-input"
          placeholder="Random (max 9 quadrillion)"
          max={Number.MAX_SAFE_INTEGER}
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
        />
        <div className="player-buttons">
          <button onClick={() => onNewGame(2, seedInput ? parseInt(seedInput) : undefined)}>2 Players</button>
          <button onClick={() => onNewGame(4, seedInput ? parseInt(seedInput) : undefined)}>4 Players</button>
        </div>
      </div>
      
      <div className="rules-info">
        <h4>Terra Chess Rules:</h4>
        <ul>
          <li>32×32 board with terrain</li>
          <li>32 pieces per player</li>
          <li>Pieces move up to 8 spaces (terrain limits apply)</li>
          <li><b>Terrain:</b> Mountain=1, Forest=2, Water=4, Lava=no entry</li>
          <li>Knights can jump terrain, restricted on landing</li>
          <li>King limited to 1 square when in check</li>
          <li>Checkmate ≠ elimination until 2 players remain</li>
          <li>1st king captured: inherit pieces | 2nd+: immobile</li>
        </ul>
      </div>
      
      <div className="version-info">
        Version 0.6.0
      </div>
    </div>
  );
}
