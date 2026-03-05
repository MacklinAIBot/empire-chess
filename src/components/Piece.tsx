// Piece Component - Classic chess pieces from Wikipedia

import type { Piece as PieceType } from '../game/types';
import './Piece.css';

interface PieceProps {
  piece: PieceType;
  size: number;
}

// Classic chess piece SVG URLs (Colin Burnett's design)
// White pieces for light-colored players, black for dark
const PIECE_URLS: Record<string, Record<string, string>> = {
  white: {
    king: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
    queen: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
    rook: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rlt45.svg",
    bishop: "https://upload.wikimedia.org/wikipedia/commons/9/93/Chess_blt45.svg",
    knight: "https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt45.svg",
    pawn: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_plt45.svg",
  },
  black: {
    king: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
    queen: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
    rook: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Chess_rdt45.svg",
    bishop: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
    knight: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
    pawn: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Chess_pdt45.svg",
  },
};

// Map player colors to white/black pieces for visibility
function getPieceSet(player: string): string {
  if (player === 'blue' || player === 'red') return 'white';
  return 'black';
}

export function Piece({ piece, size }: PieceProps) {
  const pieceSet = getPieceSet(piece.player);
  const svgUrl = PIECE_URLS[pieceSet][piece.type];
  
  return (
    <div 
      className="piece-classic"
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={svgUrl}
        alt={piece.type}
        style={{
          width: '85%',
          height: '85%',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))',
        }}
      />
    </div>
  );
}
