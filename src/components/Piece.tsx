// Piece Component

import type { Piece as PieceType } from '../game/types';
import { PIECE_SYMBOLS, PLAYER_COLOR_HEX } from '../game/types';
import './Piece.css';

interface PieceProps {
  piece: PieceType;
  size: number;
}

export function Piece({ piece, size }: PieceProps) {
  const symbol = PIECE_SYMBOLS[piece.type];
  const color = PLAYER_COLOR_HEX[piece.player];
  
  return (
    <div 
      className="piece"
      style={{
        fontSize: `${size * 0.7}px`,
        color: color,
        textShadow: `0 0 3px rgba(0,0,0,0.5), 0 0 10px ${color}40`,
      }}
    >
      {symbol}
    </div>
  );
}
