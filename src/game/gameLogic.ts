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

const BOARD_SIZE = 32;

export function createInitialBoard(): Cell[][] {
  const board: Cell[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = {
        position: { row, col },
        piece: null,
      };
    }
  }
  return board;
}

export function createPlayers(numPlayers: number): Player[] {
  const colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
  return colors.slice(0, numPlayers).map((color) => ({
    color,
    alive: true,
    inCheck: false,
    capturedPieces: [],
  }));
}

function getStartingPositions(player: PlayerColor, numPlayers: number): Position[] {
  const positions: Position[] = [];
  
  if (numPlayers === 2) {
    // 2 players: red on top (rows 0-3), blue on bottom (rows 28-31)
    if (player === 'red') {
      // Pawns on row 3
      for (let col = 0; col < BOARD_SIZE; col++) {
        positions.push({ row: 3, col });
      }
      // Back row on row 0
      positions.push({ row: 0, col: 0 }); // rook
      positions.push({ row: 0, col: 1 }); // knight
      positions.push({ row: 0, col: 2 }); // bishop
      positions.push({ row: 0, col: 3 }); // bishop
      positions.push({ row: 0, col: 4 }); // queen
      positions.push({ row: 0, col: 5 }); // king
      positions.push({ row: 0, col: 6 }); // bishop
      positions.push({ row: 0, col: 7 }); // bishop
      positions.push({ row: 0, col: 8 }); // knight
      positions.push({ row: 0, col: 9 }); // rook
      // Scale pieces - add more
      positions.push({ row: 0, col: 10 }); // rook
      positions.push({ row: 0, col: 11 }); // knight
      positions.push({ row: 0, col: 12 }); // bishop
      positions.push({ row: 0, col: 13 }); // queen
      positions.push({ row: 0, col: 14 }); // king
      positions.push({ row: 0, col: 15 }); // bishop
      positions.push({ row: 0, col: 16 }); // knight
      positions.push({ row: 0, col: 17 }); // rook
      positions.push({ row: 0, col: 18 }); // rook
      positions.push({ row: 0, col: 19 }); // knight
      positions.push({ row: 0, col: 20 }); // bishop
      positions.push({ row: 0, col: 21 }); // queen
      positions.push({ row: 0, col: 22 }); // king
      positions.push({ row: 0, col: 23 }); // bishop
      positions.push({ row: 0, col: 24 }); // knight
      positions.push({ row: 0, col: 25 }); // rook
      positions.push({ row: 0, col: 26 }); // rook
      positions.push({ row: 0, col: 27 }); // knight
      positions.push({ row: 0, col: 28 }); // bishop
      positions.push({ row: 0, col: 29 }); // queen
      positions.push({ row: 0, col: 30 }); // king
      positions.push({ row: 0, col: 31 }); // bishop
    } else if (player === 'blue') {
      // Pawns on row 28
      for (let col = 0; col < BOARD_SIZE; col++) {
        positions.push({ row: 28, col });
      }
      // Back row on row 31
      for (let col = 0; col < BOARD_SIZE; col++) {
        positions.push({ row: 31, col });
      }
    }
  } else if (numPlayers === 4) {
    // 4 players: red (top), blue (right), green (bottom), yellow (left)
    const half = BOARD_SIZE / 2;
    if (player === 'red') {
      for (let col = 0; col < half; col++) {
        positions.push({ row: 3, col });
        positions.push({ row: 0, col });
      }
    } else if (player === 'blue') {
      for (let row = 0; row < half; row++) {
        positions.push({ row, col: 28 });
        positions.push({ row, col: 31 });
      }
    } else if (player === 'green') {
      for (let col = half; col < BOARD_SIZE; col++) {
        positions.push({ row: 28, col });
        positions.push({ row: 31, col });
      }
    } else if (player === 'yellow') {
      for (let row = half; row < BOARD_SIZE; row++) {
        positions.push({ row, col: 3 });
        positions.push({ row, col: 0 });
      }
    }
  }
  
  return positions;
}

function createPiecesForPlayer(color: PlayerColor, numPlayers: number): Piece[] {
  const pieces: Piece[] = [];
  const positions = getStartingPositions(color, numPlayers);
  let pieceIndex = 0;
  
  // Piece order for 4x scale (simplified)
  const pieceTypes: PieceType[] = [
    'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook',
    'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn',
  ];
  
  // Repeat for 4x scale
  for (let i = 0; i < 4; i++) {
    pieceTypes.forEach((type) => {
      if (pieceIndex < positions.length) {
        pieces.push({
          id: `${color}-${type}-${i}`,
          type,
          player: color,
        });
        pieceIndex++;
      }
    });
  }
  
  return pieces;
}

export function setupBoard(
  _board: Cell[][],
  players: Player[]
): Cell[][] {
  const newBoard = createInitialBoard();
  
  players.forEach((player) => {
    const pieces = createPiecesForPlayer(player.color, players.length);
    const positions = getStartingPositions(player.color, players.length);
    
    pieces.forEach((piece, index) => {
      if (index < positions.length) {
        const pos = positions[index];
        newBoard[pos.row][pos.col].piece = piece;
      }
    });
  });
  
  return newBoard;
}

function isWithinBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

function getPieceAt(board: Cell[][], pos: Position): Piece | null {
  if (!isWithinBounds(pos)) return null;
  return board[pos.row][pos.col].piece;
}

function getPlayerDirection(playerColor: PlayerColor, numPlayers: number): number {
  if (numPlayers === 2) {
    return playerColor === 'red' ? 1 : -1;
  }
  return 1; // Default for other configs
}

export function getValidMoves(
  board: Cell[][],
  piece: Piece,
  pos: Position,
  players: Player[],
  currentPlayer: Player
): Position[] {
  const moves: Position[] = [];
  const numPlayers = players.length;
  const inCheck = currentPlayer.inCheck;
  
  // If king is in check, can only move 1 square
  const maxDistance = (piece.type === 'king' && inCheck) ? 1 : 4;
  
  const addMove = (row: number, col: number) => {
    if (!isWithinBounds({ row, col })) return;
    const targetPiece = getPieceAt(board, { row, col });
    
    // Can't capture own piece
    if (targetPiece && targetPiece.player === piece.player) {
      return;
    }
    
    moves.push({ row, col });
  };
  
  // Linear movements (rook, queen)
  if (piece.type === 'rook' || piece.type === 'queen') {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    directions.forEach(([dr, dc]) => {
      for (let i = 1; i <= maxDistance; i++) {
        const newRow = pos.row + dr * i;
        const newCol = pos.col + dc * i;
        const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
        
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            addMove(newRow, newCol);
          }
          break; // Blocked by any piece
        }
        addMove(newRow, newCol);
      }
    });
  }
  
  // Diagonal movements (bishop, queen)
  if (piece.type === 'bishop' || piece.type === 'queen') {
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    directions.forEach(([dr, dc]) => {
      for (let i = 1; i <= maxDistance; i++) {
        const newRow = pos.row + dr * i;
        const newCol = pos.col + dc * i;
        const targetPiece = getPieceAt(board, { row: newRow, col: newCol });
        
        if (targetPiece) {
          if (targetPiece.player !== piece.player) {
            addMove(newRow, newCol);
          }
          break;
        }
        addMove(newRow, newCol);
      }
    });
  }
  
  // Knight moves
  if (piece.type === 'knight') {
    const knightMoves = [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [1, -2], [-1, 2], [-1, -2]
    ];
    knightMoves.forEach(([dr, dc]) => {
      addMove(pos.row + dr, pos.col + dc);
    });
  }
  
  // King moves
  if (piece.type === 'king') {
    const kingMoves = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    kingMoves.forEach(([dr, dc]) => {
      addMove(pos.row + dr, pos.col + dc);
    });
  }
  
  // Pawn moves (forward + sideways for Empire Chess)
  if (piece.type === 'pawn') {
    const direction = getPlayerDirection(piece.player, numPlayers);
    
    // Forward moves
    for (let i = 1; i <= (inCheck ? 1 : 4); i++) {
      const newRow = pos.row + direction * i;
      if (!isWithinBounds({ row: newRow, col: pos.col })) break;
      const targetPiece = getPieceAt(board, { row: newRow, col: pos.col });
      if (targetPiece) break;
      addMove(newRow, pos.col);
    }
    
    // Sideways moves (Empire Chess special rule)
    if (!inCheck || 1 <= maxDistance) {
      // Left
      addMove(pos.row, pos.col - 1);
      // Right  
      addMove(pos.row, pos.col + 1);
      
      // Also allow 2-4 squares sideways
      for (let i = 2; i <= maxDistance; i++) {
        addMove(pos.row, pos.col - i);
        addMove(pos.row, pos.col + i);
      }
    }
    
    // Diagonal captures
    const captureOffsets = [[direction, 1], [direction, -1]];
    captureOffsets.forEach(([dr, dc]) => {
      const targetPiece = getPieceAt(board, { row: pos.row + dr, col: pos.col + dc });
      if (targetPiece && targetPiece.player !== piece.player) {
        addMove(pos.row + dr, pos.col + dc);
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
  // Find the king's position
  let kingPos: Position | null = null;
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col].piece;
      if (piece && piece.player === playerColor && piece.type === 'king') {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false; // King captured
  
  // Check if any enemy piece can attack the king
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
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

export function checkWinCondition(players: Player[]): PlayerColor | null {
  const alivePlayers = players.filter(p => p.alive);
  
  if (alivePlayers.length === 1) {
    return alivePlayers[0].color;
  }
  
  return null;
}

export function nextTurn(players: Player[], currentIndex: number): number {
  const nextIndex = (currentIndex + 1) % players.length;
  // Skip dead players
  if (!players[nextIndex].alive) {
    return nextTurn(players, nextIndex);
  }
  return nextIndex;
}

export function initializeGame(numPlayers: number): GameState {
  const players = createPlayers(numPlayers);
  const board = createInitialBoard();
  const setupBoardResult = setupBoard(board, players);
  
  return {
    board: setupBoardResult,
    players,
    currentPlayerIndex: 0,
    phase: 'playing',
    selectedCell: null,
    validMoves: [],
    winner: null,
  };
}
