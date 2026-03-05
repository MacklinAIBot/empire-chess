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

// Terrain colors
const TERRAIN_COLORS: Record<string, string> = {
  normal: '#2d2d44',
  mountain: '#6b6b7a',
  water: '#5dade2',
  forest: '#1e6b1e',
  lava: '#e74c3c',
};

export function Cell({ cell, isSelected, isValidMove, onClick, cellSize }: CellProps) {
  const { row, col } = cell.position;
  const isDark = (row + col) % 2 === 1;
  
  // Get terrain color
  const terrainType = cell.terrain?.type || 'normal';
  const terrainColor = TERRAIN_COLORS[terrainType] || TERRAIN_COLORS.normal;
  
  // Blend with checkerboard pattern
  let backgroundColor = terrainColor;
  if (terrainType === 'normal') {
    backgroundColor = isDark ? '#1a1a2e' : '#2d2d44';
  }
  
  return (
    <div
      className={`cell ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''}`}
      style={{
        backgroundColor,
        width: cellSize,
        height: cellSize,
      }}
      onClick={onClick}
    >
      {cell.piece && (
        <Piece piece={cell.piece} size={cellSize * 0.85} />
      )}
      {isValidMove && !cell.piece && (
        <div className="move-indicator" />
      )}
      {isValidMove && cell.piece && (
        <div className="capture-indicator" />
      )}
    </div>
  );
}
