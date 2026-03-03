// Game Types

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'pink' | 'cyan';

export interface Position {
  row: number;
  col: number;
}

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface Piece {
  id: string;
  type: PieceType;
  player: PlayerColor;
  hasMoved?: boolean;
}

export interface Cell {
  position: Position;
  piece: Piece | null;
}

export interface Player {
  color: PlayerColor;
  alive: boolean;
  inCheck: boolean;
  capturedPieces: Piece[];
}

export type GamePhase = 'setup' | 'playing' | 'finished';

export interface GameState {
  board: Cell[][];
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  selectedCell: Position | null;
  validMoves: Position[];
  winner: PlayerColor | null;
}

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

export const PIECE_SYMBOLS: Record<PieceType, string> = {
  king: '♔',
  queen: '♕',
  rook: '♖',
  bishop: '♗',
  knight: '♘',
  pawn: '♙',
};

export const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#27ae60',
  yellow: '#f1c40f',
  purple: '#9b59b6',
  orange: '#e67e22',
  pink: '#e91e63',
  cyan: '#00bcd4',
};
