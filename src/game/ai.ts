// AI for Empire Chess - Improved Heuristics

import type { GameState, Position, PieceType } from './types';
import { getValidMoves } from './gameLogic';

export interface AIMove {
  from: Position;
  to: Position;
}

// Piece values for evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
};

interface ScoredMove {
  from: Position;
  to: Position;
  score: number;
}

export function getAIMove(gameState: GameState): AIMove | null {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (!currentPlayer || !currentPlayer.alive) {
    return null;
  }
  
  const playerColor = currentPlayer.color;
  
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
        
        // 1. CAPTURE SCORING - Highest priority
        const targetPiece = gameState.board[move.row]?.[move.col]?.piece;
        if (targetPiece) {
          score += PIECE_VALUES[targetPiece.type] * 10; // High bonus for captures
          // Bonus for capturing enemy king (immediate win)
          if (targetPiece.type === 'king') {
            score += 1000;
          }
        }
        
        // 2. KING SAFETY - If in check, prioritize escaping
        if (currentPlayer.inCheck) {
          // Moving king to safety is critical
          if (piece.type === 'king') {
            // Calculate if move moves king away from threats
            const currentDistToCenter = Math.abs(row - center) + Math.abs(col - center);
            const newDistToCenter = Math.abs(move.row - center) + Math.abs(move.col - center);
            // Prefer moving toward center (usually safer)
            score += (newDistToCenter < currentDistToCenter) ? 20 : -10;
          }
        }
        
        // 3. CENTER CONTROL - Prefer positions toward center
        const distToCenter = Math.abs(move.row - center) + Math.abs(move.col - center);
        score += Math.floor((64 - distToCenter) / 4); // Up to 16 points for center
        
        // 4. PIECE DEVELOPMENT - Prefer moving pieces from starting position
        // Pawns at starting rows should move
        if (piece.type === 'pawn' && (row <= 3 || row >= boardSize - 4)) {
          score += 3;
        }
        
        // 5. ATTACK POTENTIAL - Prefer moves that threaten enemies
        // Check if move puts piece near enemy king
        for (let r = 0; r < boardSize; r++) {
          for (let c = 0; c < boardSize; c++) {
            const enemyPiece = gameState.board[r][c]?.piece;
            if (enemyPiece && enemyPiece.player !== playerColor && enemyPiece.type === 'king') {
              const distToEnemyKing = Math.abs(move.row - r) + Math.abs(move.col - c);
              if (distToEnemyKing <= 4) {
                score += 5; // Bonus for pressuring enemy king
              }
            }
          }
        }
        
        // 6. RANDOMNESS - Add variety
        score += Math.floor(Math.random() * 5);
        
        scoredMoves.push({ from: { row, col }, to: move, score });
      }
    }
  }
  
  if (scoredMoves.length === 0) {
    return null;
  }
  
  // Sort by score (highest first)
  scoredMoves.sort((a, b) => b.score - a.score);
  
  // For multi-player: also consider threats from other players
  // If we're not in check but another player could capture us next turn, be more defensive
  const topMoves = scoredMoves.slice(0, Math.min(5, scoredMoves.length));
  const selected = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return { from: selected.from, to: selected.to };
}
