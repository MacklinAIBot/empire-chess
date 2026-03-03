// Cell Component

import type { Cell as CellType } from '../game/types';
import { Piece } from './Piece';
import './Cell.css';

interface CellProps {
  cell: CellType;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
  cellSize: number;
}

export function Cell({ cell, isSelected, isValidMove, onClick, cellSize }: CellProps) {
  const isDark = (cell.position.row + cell.position.col) % 2 === 1;
  
  return (
    <div
      className={`cell ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''}`}
      style={{ width: cellSize, height: cellSize }}
      onClick={onClick}
    >
      {cell.piece && (
        <Piece piece={cell.piece} size={cellSize} />
      )}
      {isValidMove && !cell.piece && (
        <div className="valid-indicator" />
      )}
      {isValidMove && cell.piece && (
        <div className="capture-indicator" />
      )}
    </div>
  );
}
