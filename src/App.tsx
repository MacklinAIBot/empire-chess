// Main App

import { useState, useCallback } from 'react';
import { Board } from './components/Board';
import { GameInfo } from './components/GameInfo';
import type { GameState, Position } from './game/types';
import { 
  initializeGame,
  getValidMoves,
  checkForCheck,
  checkWinCondition,
  nextTurn,
} from './game/gameLogic';
import './App.css';

function App() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(2));
  
  const handleCellClick = useCallback((position: Position) => {
    setGameState((prev) => {
      // If game is over, ignore clicks
      if (prev.phase === 'finished') return prev;
      
      const clickedCell = prev.board[position.row][position.col];
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      
      // If a piece is already selected
      if (prev.selectedCell) {
        // Check if clicked cell is a valid move
        const isValidMove = prev.validMoves.some(
          m => m.row === position.row && m.col === position.col
        );
        
        if (isValidMove) {
          // Move the piece
          const newBoard = prev.board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
          const selectedPiece = newBoard[prev.selectedCell.row][prev.selectedCell.col].piece;
          
          // Capture if target has piece
          if (clickedCell.piece) {
            currentPlayer.capturedPieces.push(clickedCell.piece);
            
            // Check if a king was captured - eliminate that player
            if (clickedCell.piece.type === 'king') {
              const capturedPlayerIndex = prev.players.findIndex(p => p.color === clickedCell.piece!.player);
              if (capturedPlayerIndex !== -1) {
                prev.players[capturedPlayerIndex].alive = false;
              }
            }
          }
          
          // Move piece
          newBoard[position.row][position.col].piece = selectedPiece;
          newBoard[prev.selectedCell.row][prev.selectedCell.col].piece = null;
          
          if (selectedPiece) {
            selectedPiece.hasMoved = true;
          }
          
          // Check for check on next player
          const nextPlayerIndex = nextTurn(prev.players, prev.currentPlayerIndex);
          
          // Update check status for all players
          const updatedPlayers = prev.players.map((player, idx) => ({
            ...player,
            inCheck: idx === nextPlayerIndex ? checkForCheck(newBoard, player.color, prev.players) : player.inCheck,
          }));
          
          // Check win condition
          const winner = checkWinCondition(updatedPlayers);
          
          return {
            ...prev,
            board: newBoard,
            players: updatedPlayers,
            currentPlayerIndex: nextPlayerIndex,
            selectedCell: null,
            validMoves: [],
            phase: winner ? 'finished' : 'playing',
            winner,
          };
        }
        
        // If clicked on own piece, select it instead
        if (clickedCell.piece && clickedCell.piece.player === currentPlayer.color) {
          const moves = getValidMoves(
            prev.board,
            clickedCell.piece,
            position,
            prev.players,
            currentPlayer
          );
          
          return {
            ...prev,
            selectedCell: position,
            validMoves: moves,
          };
        }
        
        // Deselect
        return {
          ...prev,
          selectedCell: null,
          validMoves: [],
        };
      }
      
      // No piece selected - try to select one
      if (clickedCell.piece && clickedCell.piece.player === currentPlayer.color) {
        const moves = getValidMoves(
          prev.board,
          clickedCell.piece,
          position,
          prev.players,
          currentPlayer
        );
        
        return {
          ...prev,
          selectedCell: position,
          validMoves: moves,
        };
      }
      
      return prev;
    });
  }, []);
  
  const handleNewGame = useCallback((numPlayers: number) => {
    setGameState(initializeGame(numPlayers));
  }, []);
  
  return (
    <div className="app">
      <div className="game-area">
        <Board gameState={gameState} onCellClick={handleCellClick} />
      </div>
      <div className="sidebar">
        <GameInfo gameState={gameState} onNewGame={handleNewGame} />
      </div>
    </div>
  );
}

export default App;
