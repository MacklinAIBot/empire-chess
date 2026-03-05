// Game Logic

import type {
  GameState,
  PlayerColor,
  Position,
  Piece,
  PieceType,
  Player,
  Cell,
} from './types';
import { generateTerrain, type TerrainType } from './terrain';

// Config by player count
const GAME_CONFIG: Record<number, { boardSize: number; piecesPerPlayer: number; maxMovement: number }> = {
  2: { boardSize: 32, piecesPerPlayer: 32, maxMovement: 8 },
  4: { boardSize: 32, piecesPerPlayer: 32, maxMovement: 8 },
};

export function getConfig(numPlayers: number) {
  return GAME_CONFIG[numPlayers] || GAME_CONFIG[2];
}

export function createInitialBoard(numPlayers: number, terrainSeed?: number): Cell[][] {
  const { boardSize } = getConfig(numPlayers);
  
  // Generate terrain with seed (or random if not provided)
  const seed = terrainSeed || Math.floor(Math.random() * 100000);
  const terrain = generateTerrain(boardSize, seed);
  
  const board: Cell[][] = [];
  for (let row = 0; row < boardSize; row++) {
    board[row] = [];
    for (let col = 0; col < boardSize; col++) {
      board[row][col] = {
        position: { row, col },
        piece: null,
        terrain: terrain[row][col],
      };
    }
  }
  return board;
}

export function createPlayers(numPlayers: number): Player[] {
  // Order for turn-taking: Blue → Red (2p), Blue → Red → Green → Yellow (4p)
  const colors: PlayerColor[] = numPlayers === 2 
    ? ['blue', 'red'] 
    : ['blue', 'red', 'green', 'yellow'];
  return colors.slice(0, numPlayers).map((color) => ({
    color,
    alive: true,
    inCheck: false,
    inCheckmate: false,
    kingsCaptured: 0,
    capturedPieces: [],
  }));
}

function getStartingPositions(player: PlayerColor, numPlayers: number): Position[] {
  const { boardSize } = getConfig(numPlayers);
  const positions: Position[] = [];
  
  // Positions: Blue=top, Red=bottom, Yellow=left, Green=right
  const startCol = 12; // M (columns M-T = indices 12-19)
  const numCols = 8; // 8 pieces per row
  
  if (numPlayers === 2) {
    if (player === 'blue') {
      // Blue at TOP (row 0)
      // Row 1: R, N, B, Q, K, B, N, R
      const row1Pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      row1Pieces.forEach((_, idx) => {
        positions.push({ row: 0, col: startCol + idx });
      });
      // Row 2: R, N, B, N, N, B, N, R
      const row2Pieces = ['rook', 'knight', 'bishop', 'knight', 'knight', 'bishop', 'knight', 'rook'];
      row2Pieces.forEach((_, idx) => {
        positions.push({ row: 1, col: startCol + idx });
      });
      // Rows 3-4: Pawns
      for (let col = 0; col < numCols; col++) {
        positions.push({ row: 2, col: startCol + col });
        positions.push({ row: 3, col: startCol + col });
      }
    } else if (player === 'red') {
      // Red at BOTTOM (row 31)
      // Row 1 (from bottom): R, N, B, Q, K, B, N, R
      const row1Pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      row1Pieces.forEach((_, idx) => {
        positions.push({ row: boardSize - 1, col: startCol + idx });
      });
      // Row 2: R, N, B, N, N, B, N, R
      const row2Pieces = ['rook', 'knight', 'bishop', 'knight', 'knight', 'bishop', 'knight', 'rook'];
      row2Pieces.forEach((_, idx) => {
        positions.push({ row: boardSize - 2, col: startCol + idx });
      });
      // Rows 3-4: Pawns
      for (let col = 0; col < numCols; col++) {
        positions.push({ row: boardSize - 3, col: startCol + col });
        positions.push({ row: boardSize - 4, col: startCol + col });
      }
    }
  } else if (numPlayers === 4) {
    // 4 players: Blue=top, Red=bottom, Yellow=left, Green=right
    if (player === 'blue') {
      // Blue at TOP (row 0)
      const row1Pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      row1Pieces.forEach((_, idx) => {
        positions.push({ row: 0, col: startCol + idx });
      });
      const row2Pieces = ['rook', 'knight', 'bishop', 'knight', 'knight', 'bishop', 'knight', 'rook'];
      row2Pieces.forEach((_, idx) => {
        positions.push({ row: 1, col: startCol + idx });
      });
      for (let col = 0; col < numCols; col++) {
        positions.push({ row: 2, col: startCol + col });
        positions.push({ row: 3, col: startCol + col });
      }
    } else if (player === 'red') {
      // Red at BOTTOM (row 31)
      const row1Pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      row1Pieces.forEach((_, idx) => {
        positions.push({ row: boardSize - 1, col: startCol + idx });
      });
      const row2Pieces = ['rook', 'knight', 'bishop', 'knight', 'knight', 'bishop', 'knight', 'rook'];
      row2Pieces.forEach((_, idx) => {
        positions.push({ row: boardSize - 2, col: startCol + idx });
      });
      for (let col = 0; col < numCols; col++) {
        positions.push({ row: boardSize - 3, col: startCol + col });
        positions.push({ row: boardSize - 4, col: startCol + col });
      }
    } else if (player === 'green') {
      // Green at RIGHT (col 31)
      const rightStartRow = startCol;
      const row1Pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      row1Pieces.forEach((_, idx) => {
        positions.push({ row: rightStartRow + idx, col: boardSize - 1 });
      });
      const row2Pieces = ['rook', 'knight', 'bishop', 'knight', 'knight', 'bishop', 'knight', 'rook'];
      row2Pieces.forEach((_, idx) => {
        positions.push({ row: rightStartRow + idx, col: boardSize - 2 });
      });
      for (let row = 0; row < numCols; row++) {
        positions.push({ row: rightStartRow + row, col: boardSize - 3 });
        positions.push({ row: rightStartRow + row, col: boardSize - 4 });
      }
    } else if (player === 'yellow') {
      // Yellow at LEFT (col 0)
      const leftStartRow = startCol;
      const row1Pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
      row1Pieces.forEach((_, idx) => {
        positions.push({ row: leftStartRow + idx, col: 0 });
      });
      const row2Pieces = ['rook', 'knight', 'bishop', 'knight', 'knight', 'bishop', 'knight', 'rook'];
      row2Pieces.forEach((_, idx) => {
        positions.push({ row: leftStartRow + idx, col: 1 });
      });
      for (let row = 0; row < numCols; row++) {
        positions.push({ row: leftStartRow + row, col: 2 });
        positions.push({ row: leftStartRow + row, col: 3 });
      }
    }
  }
  
  return positions;
}

function createPiecesForPlayer(color: PlayerColor, _numPlayers: number): Piece[] {
  const pieces: Piece[] = [];
  
  // Specific piece order matching positions from getStartingPositions:
  // Row 1: R, N, B, Q, K, B, N, R
  // Row 2: R, N, B, N, N, B, N, R  
  // Row 3: P (8 pawns)
  // Row 4: P (8 pawns)
  const pieceTypes: PieceType[] = [
    // Row 1 (8 pieces)
    'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook',
    // Row 2 (8 pieces)
    'rook', 'knight', 'bishop', 'knight', 'knight', 'bishop', 'knight', 'rook',
    // Row 3 (8 pawns)
    'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn',
    // Row 4 (8 pawns)
    'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn',
  ];
  
  pieceTypes.forEach((type, index) => {
    pieces.push({
      id: `${color}-${type}-${index}`,
      type,
      player: color,
    });
  });
  
  return pieces;
}

export function setupBoard(
  _board: Cell[][],
  players: Player[]
): Cell[][] {
  const numPlayers = players.length;
  const newBoard = createInitialBoard(numPlayers);
  
  players.forEach((player) => {
    const pieces = createPiecesForPlayer(player.color, numPlayers);
    const positions = getStartingPositions(player.color, numPlayers);
    
    pieces.forEach((piece, index) => {
      if (index < positions.length) {
        const pos = positions[index];
        newBoard[pos.row][pos.col].piece = piece;
      }
    });
  });
  
  return newBoard;
}

function isWithinBounds(pos: Position, boardSize: number): boolean {
  return pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize;
}

function getPieceAt(board: Cell[][], pos: Position): Piece | null {
  if (!isWithinBounds(pos, board.length)) return null;
  return board[pos.row][pos.col].piece;
}

function getPlayerDirection(playerColor: PlayerColor, numPlayers: number): number {
  if (numPlayers === 2) {
    return playerColor === 'red' ? 1 : -1;
  }
  return 1;
}

export function getValidMoves(
  board: Cell[][],
  piece: Piece,
  pos: Position,
  players: Player[],
  currentPlayer: Player
): Position[] {
  // Immobile pieces (captured a 2nd+ king) cannot move
  if (piece.originalColor && piece.originalColor !== piece.player) {
    return [];
  }
  
  const { maxMovement } = getConfig(players.length);
  const boardSize = board.length;
  const moves: Position[] = [];
  const numPlayers = players.length;
  const inCheck = currentPlayer.inCheck;
  
  // If king is in check, can only move 1 square
  const maxDistance = (piece.type === 'king' && inCheck) ? 1 : maxMovement;
  
  // Get terrain at position
  const getTerrain = (r: number, c: number): TerrainType => {
    return board[r]?.[c]?.terrain?.type || 'normal';
  };
  
  // Check if can enter terrain
  const canEnterTerrain = (terrain: TerrainType): boolean => {
    if (terrain === 'lava') return false;
    return true;
  };
  
  // Get max movement through/across terrain
  const getTerrainMaxMove = (terrain: TerrainType): number => {
    switch (terrain) {
      case 'mountain': return 1;
      case 'forest': return 2;
      case 'water': return 4;
      case 'normal': 
      default: return maxDistance;
    }
  };
  
  const addMove = (row: number, col: number) => {
    if (!isWithinBounds({ row, col }, boardSize)) return;
    const targetPiece = getPieceAt(board, { row, col });
    const targetTerrain = getTerrain(row, col);
    
    // Can't enter lava
    if (!canEnterTerrain(targetTerrain)) {
      return;
    }
    
    // Can't capture own piece
    if (targetPiece && targetPiece.player === piece.player) {
      return;
    }
    
    moves.push({ row, col });
  };
  
  // Linear movements (rook, queen) - respect terrain
  if (piece.type === 'rook' || piece.type === 'queen') {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    directions.forEach(([dr, dc]) => {
      let spacesMoved = 0;
      for (let i = 1; i <= maxDistance; i++) {
        const newRow = pos.row + dr * i;
        const newCol = pos.col + dc * i;
        
        // Check bounds
        if (!isWithinBounds({ row: newRow, col: newCol }, boardSize)) break;
        
        const targetTerrain = getTerrain(newRow, newCol);
        const terrainMax = getTerrainMaxMove(targetTerrain);
        
        // Check if terrain restricts movement
        if (spacesMoved >= terrainMax) break;
        
        // Can't enter lava
        if (!canEnterTerrain(targetTerrain)) break;
        
        const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
        
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            moves.push({ row: newRow, col: newCol });
          }
          break; // Blocked
        }
        
        moves.push({ row: newRow, col: newCol });
        spacesMoved++;
        
        // In non-normal terrain, can only move 1 space (stop after 1)
        if (targetTerrain !== 'normal') {
          break;
        }
      }
    });
  }
  
  // Diagonal movements (bishop, queen) - respect terrain
  if (piece.type === 'bishop' || piece.type === 'queen') {
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    directions.forEach(([dr, dc]) => {
      let spacesMoved = 0;
      for (let i = 1; i <= maxDistance; i++) {
        const newRow = pos.row + dr * i;
        const newCol = pos.col + dc * i;
        
        // Check bounds
        if (!isWithinBounds({ row: newRow, col: newCol }, boardSize)) break;
        
        const targetTerrain = getTerrain(newRow, newCol);
        const terrainMax = getTerrainMaxMove(targetTerrain);
        
        // Check if terrain restricts movement
        if (spacesMoved >= terrainMax) break;
        
        // Can't enter lava
        if (!canEnterTerrain(targetTerrain)) break;
        
        const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
        
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            moves.push({ row: newRow, col: newCol });
          }
          break; // Blocked
        }
        
        moves.push({ row: newRow, col: newCol });
        spacesMoved++;
        
        // In non-normal terrain, can only move 1 space (stop after 1)
        if (targetTerrain !== 'normal') {
          break;
        }
      }
    });
  }
  
  // Knight moves (specific L-shapes: 1x2, 2x1, 2x4, 4x2)
  // Knights can jump over terrain but are restricted by terrain if landing on it
  if (piece.type === 'knight') {
    const knightMoves: [number, number][] = [
      [1, 2], [1, -2], [-1, 2], [-1, -2],
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [2, 4], [2, -4], [-2, 4], [-2, -4],
      [4, 2], [4, -2], [-4, 2], [-4, -2],
    ];
    knightMoves.forEach(([dr, dc]) => {
      const newRow = pos.row + dr;
      const newCol = pos.col + dc;
      
      if (!isWithinBounds({ row: newRow, col: newCol }, boardSize)) return;
      
      const targetTerrain = getTerrain(newRow, newCol);
      
      // Can't land on lava
      if (!canEnterTerrain(targetTerrain)) return;
      
      // Knight is restricted by terrain max move (but knights can move further in normal)
      const terrainMax = getTerrainMaxMove(targetTerrain);
      const knightMoveDist = Math.max(Math.abs(dr), Math.abs(dc));
      
      // If terrain restricts movement less than the knight's move, allow it
      // Knights can always do their moves in normal terrain
      if (targetTerrain === 'normal') {
        addMove(newRow, newCol);
      } else {
        // On terrain, knight can only move if their move distance <= terrain max
        if (knightMoveDist <= terrainMax) {
          addMove(newRow, newCol);
        }
      }
    });
  }
  
  // King moves: 2 spaces unless in check, attacking, or moving into check
  if (piece.type === 'king') {
    // Helper: check if a position is under attack by any enemy
    const isUnderAttack = (targetRow: number, targetCol: number): boolean => {
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          const enemyPiece = board[r][c].piece;
          if (enemyPiece && enemyPiece.player !== piece.player) {
            const dr = targetRow - r;
            const dc = targetCol - c;
            const absDr = Math.abs(dr);
            const absDc = Math.abs(dc);
            
            if (enemyPiece.type === 'pawn') {
              const enemyDir = getPlayerDirection(enemyPiece.player, numPlayers);
              if (absDr === 1 && absDc === 1 && dr === enemyDir) return true;
            } else if (enemyPiece.type === 'knight') {
              const knightPatterns = [[1,2],[2,1],[2,-1],[1,-2],[-1,2],[-2,1],[-2,-1],[-1,-2]];
              if (knightPatterns.some(([kd, kc]) => kd === absDr && kc === absDc)) return true;
            } else if (enemyPiece.type === 'king') {
              if (absDr <= 1 && absDc <= 1) return true;
            } else if (enemyPiece.type === 'bishop' || enemyPiece.type === 'queen') {
              if (absDr === absDc && absDr > 0 && absDr <= maxMovement) {
                const stepR = dr / absDr;
                const stepC = dc / absDc;
                let clear = true;
                for (let i = 1; i < absDr; i++) {
                  const checkR = r + stepR * i;
                  const checkC = c + stepC * i;
                  if (checkR < 0 || checkR >= boardSize || checkC < 0 || checkC >= boardSize) { clear = false; break; }
                  if (board[checkR][checkC].piece) { clear = false; break; }
                }
                if (clear) return true;
              }
            }
            if (enemyPiece.type === 'rook' || enemyPiece.type === 'queen') {
              if ((absDr === 0 || absDc === 0) && absDr + absDc > 0 && Math.max(absDr, absDc) <= maxMovement) {
                const stepR = absDr === 0 ? 0 : dr / absDr;
                const stepC = absDc === 0 ? 0 : dc / absDc;
                let clear = true;
                for (let i = 1; i < Math.max(absDr, absDc); i++) {
                  const checkR = r + stepR * i;
                  const checkC = c + stepC * i;
                  if (checkR < 0 || checkR >= boardSize || checkC < 0 || checkC >= boardSize) { clear = false; break; }
                  if (board[checkR][checkC].piece) { clear = false; break; }
                }
                if (clear) return true;
              }
            }
          }
        }
      }
      return false;
    };
    
    const isAttacking = (row: number, col: number): boolean => {
      const targetPiece = getPieceAt(board, { row, col });
      return targetPiece !== null && targetPiece.player !== piece.player;
    };
    
    const maxDist = inCheck ? 1 : 2;
    
    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    
    directions.forEach(([dr, dc]) => {
      let spacesMoved = 0;
      for (let i = 1; i <= maxDist; i++) {
        const newRow = pos.row + dr * i;
        const newCol = pos.col + dc * i;
        
        // Check bounds
        if (!isWithinBounds({ row: newRow, col: newCol }, boardSize)) break;
        
        const targetTerrain = getTerrain(newRow, newCol);
        const terrainMax = getTerrainMaxMove(targetTerrain);
        
        // Can't move through or into attacked squares
        if (isUnderAttack(newRow, newCol)) {
          break;
        }
        
        // If attacking (trying to capture), limit to 1 space
        if (i > 1 && isAttacking(newRow, newCol)) break;
        
        // Check terrain restrictions
        if (spacesMoved >= terrainMax) break;
        if (!canEnterTerrain(targetTerrain)) break;
        
        addMove(newRow, newCol);
        spacesMoved++;
        
        // In non-normal terrain, king can only move 1 space
        if (targetTerrain !== 'normal') {
          break;
        }
      }
    });
  }
  
  // Pawn moves (Empire Chess: 2 spaces any direction, 4 on first move, capture diagonally 1)
  // Respects terrain: mountain=1, forest=2, water=4
  if (piece.type === 'pawn') {
    const direction = getPlayerDirection(piece.player, numPlayers);
    const firstMove = !piece.hasMoved;
    const moveDistance = firstMove ? 4 : 2;
    const effectiveDistance = inCheck ? 1 : moveDistance;
    
    // Forward moves (must be empty, stop at first piece, respect terrain)
    for (let i = 1; i <= effectiveDistance; i++) {
      const newRow = pos.row + direction * i;
      if (!isWithinBounds({ row: newRow, col: pos.col }, boardSize)) break;
      
      const targetTerrain = getTerrain(newRow, pos.col);
      const terrainMax = getTerrainMaxMove(targetTerrain);
      
      if (i - 1 >= terrainMax) break; // Terrain restricts
      if (!canEnterTerrain(targetTerrain)) break; // Can't enter lava
      
      const targetPiece = getPieceAt(board, { row: newRow, col: pos.col });
      if (targetPiece) break; // Blocked
      addMove(newRow, pos.col);
      
      // In non-normal terrain, pawn can only move 1 space
      if (targetTerrain !== 'normal') break;
    }
    
    // Backward moves (must be empty, stop at first piece, respect terrain)
    for (let i = 1; i <= 2; i++) {
      const newRow = pos.row - direction * i;
      if (!isWithinBounds({ row: newRow, col: pos.col }, boardSize)) break;
      
      const targetTerrain = getTerrain(newRow, pos.col);
      const terrainMax = getTerrainMaxMove(targetTerrain);
      
      if (i - 1 >= terrainMax) break;
      if (!canEnterTerrain(targetTerrain)) break;
      
      const targetPiece = getPieceAt(board, { row: newRow, col: pos.col });
      if (targetPiece) break;
      addMove(newRow, pos.col);
      
      if (targetTerrain !== 'normal') break;
    }
    
    // Sideways moves (left/right - must be empty, stop at first piece, respect terrain)
    for (let i = 1; i <= effectiveDistance; i++) {
      // Left
      if (isWithinBounds({ row: pos.row, col: pos.col - i }, boardSize)) {
        const targetTerrain = getTerrain(pos.row, pos.col - i);
        const terrainMax = getTerrainMaxMove(targetTerrain);
        
        if (i - 1 < terrainMax && canEnterTerrain(targetTerrain)) {
          const targetPiece = getPieceAt(board, { row: pos.row, col: pos.col - i });
          if (!targetPiece) {
            addMove(pos.row, pos.col - i);
          }
        }
      }
      // Right
      if (isWithinBounds({ row: pos.row, col: pos.col + i }, boardSize)) {
        const targetTerrain = getTerrain(pos.row, pos.col + i);
        const terrainMax = getTerrainMaxMove(targetTerrain);
        
        if (i - 1 < terrainMax && canEnterTerrain(targetTerrain)) {
          const targetPiece = getPieceAt(board, { row: pos.row, col: pos.col + i });
          if (!targetPiece) {
            addMove(pos.row, pos.col + i);
          }
        }
      }
    }
    
    // Diagonal captures (only 1 space, normal chess) - respect terrain
    const captureOffsets = [[direction, 1], [direction, -1]];
    captureOffsets.forEach(([dr, dc]) => {
      const newRow = pos.row + dr;
      const newCol = pos.col + dc;
      
      if (!isWithinBounds({ row: newRow, col: newCol }, boardSize)) return;
      
      const targetTerrain = getTerrain(newRow, newCol);
      if (!canEnterTerrain(targetTerrain)) return;
      
      const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
      if (targetPiece && targetPiece.player !== piece.player) {
        addMove(newRow, newCol);
      }
    });
  }
  
  return moves;
}

export function checkForCheck(
  board: Cell[][],
  playerColor: PlayerColor,
  players: Player[]
): boolean {
  const boardSize = board.length;
  let kingPos: Position | null = null;
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col].piece;
      if (piece && piece.player === playerColor && piece.type === 'king') {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false;
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col].piece;
      if (piece && piece.player !== playerColor) {
        const enemyPlayer = players.find(p => p.color === piece.player)!;
        const moves = getValidMoves(board, piece, { row, col }, players, enemyPlayer);
        if (moves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Check if a player has any valid moves (for checkmate detection)
function playerHasValidMoves(
  board: Cell[][],
  playerColor: PlayerColor,
  players: Player[]
): boolean {
  const player = players.find(p => p.color === playerColor);
  if (!player) return false;
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      const piece = board[row][col].piece;
      if (piece && piece.player === playerColor) {
        const moves = getValidMoves(board, piece, { row, col }, players, player);
        if (moves.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check for checkmate: player in check with no valid moves
export function checkForCheckmate(
  board: Cell[][],
  playerColor: PlayerColor,
  players: Player[]
): boolean {
  const player = players.find(p => p.color === playerColor);
  if (!player || !player.inCheck) return false;
  
  // Checkmate if in check and has no valid moves
  return !playerHasValidMoves(board, playerColor, players);
}

export function checkWinCondition(players: Player[]): PlayerColor | null {
  const alivePlayers = players.filter(p => p.alive);
  
  if (alivePlayers.length === 1) {
    return alivePlayers[0].color;
  }
  
  return null;
}

export function nextTurn(players: Player[], currentIndex: number): number {
  const nextIndex = (currentIndex + 1) % players.length;
  // Skip dead or checkmated players
  if (!players[nextIndex].alive || players[nextIndex].inCheckmate) {
    return nextTurn(players, nextIndex);
  }
  return nextIndex;
}

export function initializeGame(numPlayers: number, terrainSeed?: number): GameState {
  const players = createPlayers(numPlayers);
  const seed = terrainSeed ?? Math.floor(Math.random() * 100000);
  const board = createInitialBoard(numPlayers, seed);
  const setupBoardResult = setupBoard(board, players);
  
  return {
    board: setupBoardResult,
    players,
    currentPlayerIndex: 0,
    phase: 'playing',
    selectedCell: null,
    validMoves: [],
    winner: null,
    terrainSeed,
  };
}
