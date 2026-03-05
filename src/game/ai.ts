// AI for Empire Chess - Strategy-based Heuristics

import type { GameState, Position } from './types';
import { getValidMoves } from './gameLogic';
import { STRATEGIES, type AIStrategy } from './strategy';

export interface AIMove {
  from: Position;
  to: Position;
}

interface ScoredMove {
  from: Position;
  to: Position;
  score: number;
}

export function getAIMove(
  gameState: GameState, 
  strategy: AIStrategy = STRATEGIES.balanced
): AIMove | null {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (!currentPlayer || !currentPlayer.alive) {
    return null;
  }
  
  const playerColor = currentPlayer.color;
  const pieceValues = strategy.pieceValues;
  const {
    captureBonus,
    centerBonus,
    kingSafetyBonus,
    developmentBonus,
    pressureBonus,
  } = strategy;
  
  // Collect all valid moves with scores
  const scoredMoves: ScoredMove[] = [];
  const boardSize = gameState.board.length;
  const center = boardSize / 2;
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = gameState.board[row][col].piece;
      if (!piece || piece.player !== playerColor) continue;
      
      const validMoves = getValidMoves(gameState.board, piece, { row, col }, gameState.players, currentPlayer);
      
      for (const move of validMoves) {
        let score = 0;
        
        // 1. CAPTURE SCORING
        const targetPiece = gameState.board[move.row]?.[move.col]?.piece;
        if (targetPiece) {
          const pieceValue = pieceValues[targetPiece.type] || 1;
          score += pieceValue * captureBonus;
          if (targetPiece.type === 'king') {
            score += 1000; // Immediate win
          }
        }
        
        // 2. KING SAFETY
        if (currentPlayer.inCheck) {
          if (piece.type === 'king') {
            const currentDistToCenter = Math.abs(row - center) + Math.abs(col - center);
            const newDistToCenter = Math.abs(move.row - center) + Math.abs(move.col - center);
            score += (newDistToCenter < currentDistToCenter) ? kingSafetyBonus : -kingSafetyBonus / 2;
          }
        }
        
        // 3. CENTER CONTROL
        const distToCenter = Math.abs(move.row - center) + Math.abs(move.col - center);
        score += Math.floor((64 - distToCenter) * centerBonus / 8);
        
        // 4. PIECE DEVELOPMENT
        if (piece.type === 'pawn' && (row <= 3 || row >= boardSize - 4)) {
          score += developmentBonus;
        }
        
        // 5. ATTACK POTENTIAL - pressure enemy king
        for (let r = 0; r < boardSize; r++) {
          for (let c = 0; c < boardSize; c++) {
            const enemyPiece = gameState.board[r][c]?.piece;
            if (enemyPiece && enemyPiece.player !== playerColor && enemyPiece.type === 'king') {
              const distToEnemyKing = Math.abs(move.row - r) + Math.abs(move.col - c);
              if (distToEnemyKing <= 4) {
                score += pressureBonus;
              }
            }
          }
        }
        
        // 6. RANDOMNESS
        score += Math.floor(Math.random() * 3);
        
        scoredMoves.push({ from: { row, col }, to: move, score });
      }
    }
  }
  
  if (scoredMoves.length === 0) {
    return null;
  }
  
  scoredMoves.sort((a, b) => b.score - a.score);
  const topMoves = scoredMoves.slice(0, Math.min(5, scoredMoves.length));
  const selected = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return { from: selected.from, to: selected.to };
}
