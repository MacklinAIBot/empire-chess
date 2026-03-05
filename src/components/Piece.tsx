// Piece Component - Unicode chess pieces with player colors

import type { Piece as PieceType } from '../game/types';
import { PLAYER_COLOR_HEX } from '../game/types';
import './Piece.css';

interface PieceProps {
  piece: PieceType;
  size: number;
}

// Unicode chess pieces
const PIECE_SYMBOLS: Record<string, string> = {
  king: '♚',
  queen: '♛',
  rook: '♜',
  bishop: '♝',
  knight: '♞',
  pawn: '♟',
};

export function Piece({ piece, size }: PieceProps) {
  const color = PLAYER_COLOR_HEX[piece.player];
  const symbol = PIECE_SYMBOLS[piece.type];
  
  return (
    <div 
      className="piece-unicode"
      style={{
        fontSize: `${size * 0.7}px`,
        color: color,
        lineHeight: 1,
      }}
    >
      {symbol}
    </div>
  );
}
