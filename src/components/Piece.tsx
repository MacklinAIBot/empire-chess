// Piece Component - Traditional styled chess pieces with player colors

import type { Piece as PieceType } from '../game/types';
import { PLAYER_COLOR_HEX } from '../game/types';
import './Piece.css';

interface PieceProps {
  piece: PieceType;
  size: number;
}

// Better crafted chess piece paths - outlines with player colors
const PIECE_SVGS: Record<string, string> = {
  // King - crown with cross
  king: "M50 8 C55 8 58 12 58 18 C58 22 55 25 52 27 L58 27 C62 27 65 30 65 35 L58 35 C58 40 62 42 65 45 L58 48 C58 55 65 58 70 62 L65 65 C70 68 72 72 72 78 L72 88 C72 92 68 95 60 95 L60 88 L40 88 L40 95 C32 95 28 92 28 88 L28 78 C28 72 30 68 35 65 L30 62 C35 58 42 55 42 48 L35 45 C38 42 42 40 42 35 L35 35 C35 30 38 27 42 27 L48 27 C45 25 42 22 42 18 C42 12 45 8 50 8 Z M46 18 L54 18 L54 22 L46 22 Z M45 48 L55 48 L55 52 L45 52 Z",
  
  // Queen - crown with pearls
  queen: "M50 10 C56 10 60 14 60 20 C60 24 58 27 55 29 L60 29 C64 29 66 32 66 36 L60 36 C62 40 65 42 68 45 L62 48 C64 54 68 56 72 60 L65 62 C68 66 68 70 68 75 L68 85 C68 90 64 92 58 92 L58 86 L42 86 L42 92 C36 92 32 90 32 85 L32 75 C32 70 32 66 35 62 L28 60 C32 56 36 54 38 48 L32 45 C35 42 38 40 40 36 L34 36 C34 32 36 29 40 29 L45 29 C42 27 40 24 40 20 C40 14 44 10 50 10 Z M45 20 L55 20 L55 24 L45 24 Z M40 52 L60 52 L60 56 L40 56 Z",
  
  // Rook - castle tower
  rook: "M25 20 L75 20 L75 28 L68 28 L68 24 L60 24 L60 28 L53 28 L53 24 L47 24 L47 28 L40 28 L40 24 L32 24 L32 28 L25 28 Z M22 32 L78 32 L78 42 L22 42 Z M18 46 L82 46 L82 88 L18 88 Z M25 52 L35 52 L35 56 L25 56 Z M45 52 L55 52 L55 56 L45 56 Z M65 52 L75 52 L75 56 L65 56 Z",
  
  // Bishop - mitre shape
  bishop: "M50 8 C56 8 60 14 60 22 L55 22 C55 18 54 16 52 16 C56 18 58 22 58 28 C58 32 55 35 52 37 L58 37 C62 37 65 40 65 46 L58 46 C60 50 62 52 65 55 L58 58 C60 64 62 68 62 74 L62 82 C62 88 58 92 52 92 L52 86 C56 86 58 84 58 80 L58 74 C56 70 52 68 50 68 C48 68 44 70 42 74 L42 80 C42 84 44 86 48 86 L48 92 C42 92 38 88 38 82 L38 74 C38 68 40 64 42 58 L35 55 C38 52 40 50 42 46 L35 46 C35 40 38 37 42 37 L48 37 C45 35 42 32 42 28 C42 22 44 18 48 16 C46 16 45 18 45 22 L40 22 C40 14 44 8 50 8 Z",
  
  // Knight - horse head
  knight: "M18 20 C25 15 35 12 45 12 C52 12 58 14 62 18 L65 14 C60 8 52 5 42 5 C30 5 20 10 12 18 L18 25 C22 22 28 20 35 20 C38 20 40 21 42 22 L38 28 C36 26 32 25 28 25 C22 25 18 28 15 32 L22 38 C20 42 18 46 18 50 L25 48 C25 52 28 55 32 58 L28 62 C30 65 35 68 42 70 C48 72 55 72 62 70 L68 75 C65 80 58 84 48 84 C38 84 28 80 22 72 L18 72 C12 68 8 62 8 55 C8 45 12 35 22 25 C20 22 18 20 18 20 Z M35 32 C38 32 40 34 40 37 C40 40 38 42 35 42 C32 42 30 40 30 37 C30 34 32 32 35 32 Z",
  
  // Pawn - simple shape
  pawn: "M50 10 C56 10 60 15 60 22 L56 22 C56 18 55 16 52 16 C55 18 56 20 56 24 C56 28 54 31 50 33 L54 33 C58 33 62 36 62 42 L56 42 C58 45 58 48 58 52 L62 52 C62 58 58 62 52 65 L52 88 C52 92 48 95 42 95 L42 88 C38 88 35 85 35 80 L35 65 C30 62 28 58 28 52 L22 52 C22 58 22 62 26 65 C20 62 18 58 18 52 L18 48 C18 45 22 42 24 42 L18 42 C18 36 22 33 26 33 L30 33 C26 31 24 28 24 24 C24 20 25 18 28 16 C25 16 24 18 24 22 L20 22 C20 15 24 10 30 10 L50 10 Z",
};

export function Piece({ piece, size }: PieceProps) {
  const color = PLAYER_COLOR_HEX[piece.player];
  const path = PIECE_SVGS[piece.type];
  
  return (
    <div 
      className="piece-colored"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          width: '80%',
          height: '80%',
          fill: color,
          stroke: color,
          strokeWidth: 2,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
        }}
      >
        <path d={path} />
      </svg>
    </div>
  );
}
