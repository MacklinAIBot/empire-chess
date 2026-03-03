// Board Component

import { useRef, useEffect, useState } from 'react';
import type { GameState, Position } from '../game/types';
import { Cell } from './Cell';
import './Board.css';

interface BoardProps {
  gameState: GameState;
  onCellClick: (position: Position) => void;
}

const BOARD_SIZE = 32;

export function Board({ gameState, onCellClick }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(20);
  
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const maxCellSize = Math.min(
          Math.floor(containerWidth / BOARD_SIZE),
          Math.floor(containerHeight / BOARD_SIZE)
        );
        setCellSize(Math.max(12, Math.min(maxCellSize, 24)));
      }
    };
    
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);
  
  const boardWidth = BOARD_SIZE * cellSize;
  const boardHeight = BOARD_SIZE * cellSize;
  
  return (
    <div className="board-container" ref={containerRef}>
      <div 
        className="board-scroll"
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
      >
        <div 
          className="board"
          style={{ 
            width: boardWidth, 
            height: boardHeight,
            minWidth: boardWidth,
            minHeight: boardHeight,
          }}
        >
          {gameState.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = 
                gameState.selectedCell?.row === rowIndex && 
                gameState.selectedCell?.col === colIndex;
              const isValidMove = gameState.validMoves.some(
                m => m.row === rowIndex && m.col === colIndex
              );
              
              return (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  isSelected={isSelected}
                  isValidMove={isValidMove}
                  onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                  cellSize={cellSize}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
