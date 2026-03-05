// Quick 2-Player Benchmark
import { initializeGame, getValidMoves, nextTurn, checkForCheck, checkWinCondition } from '../src/game/gameLogic';
import { getAIMove } from '../src/game/ai';
import type { GameState, Position } from '../src/game/types';

function makeMove(gameState: GameState, from: Position, to: Position): GameState {
  const newBoard = gameState.board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const selectedPiece = newBoard[from.row][from.col].piece;
  const clickedCell = newBoard[to.row][to.col].piece;
  
  if (clickedCell) {
    currentPlayer.capturedPieces.push(clickedCell);
    if (clickedCell.type === 'king') {
      const capturedPlayerIndex = gameState.players.findIndex(p => p.color === clickedCell.player);
      if (capturedPlayerIndex !== -1) {
        gameState.players[capturedPlayerIndex].alive = false;
      }
    }
  }
  
  newBoard[to.row][to.col].piece = selectedPiece;
  newBoard[from.row][from.col].piece = null;
  if (selectedPiece) selectedPiece.hasMoved = true;
  
  const nextPlayerIndex = nextTurn(gameState.players, gameState.currentPlayerIndex);
  const updatedPlayers = gameState.players.map((player, idx) => ({
    ...player,
    inCheck: idx === nextPlayerIndex ? checkForCheck(newBoard, player.color, gameState.players) : player.inCheck,
  }));
  
  const winner = checkWinCondition(updatedPlayers);
  
  return {
    ...gameState,
    board: newBoard,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    phase: winner ? 'finished' : 'playing',
    winner,
  };
}

function runGame(): string | null {
  let gameState = initializeGame(2);
  let moves = 0;
  const maxMoves = 1000;
  
  while (gameState.phase !== 'finished' && moves < maxMoves) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.alive) {
      gameState = { ...gameState, currentPlayerIndex: nextTurn(gameState.players, gameState.currentPlayerIndex) };
      continue;
    }
    
    const aiMove = getAIMove(gameState);
    if (aiMove) {
      gameState = makeMove(gameState, aiMove.from, aiMove.to);
      moves++;
    } else {
      break;
    }
  }
  
  return gameState.winner;
}

// Run 10 quick games
console.log('Running 10 quick 2-player games...\n');
const wins = { blue: 0, red: 0, draws: 0 };

for (let i = 0; i < 10; i++) {
  const winner = runGame();
  if (winner) {
    wins[winner as keyof typeof wins]++;
  } else {
    wins.draws++;
  }
  console.log(`Game ${i + 1}: ${winner || 'draw'}`);
}

console.log('\nResults:');
console.log(`Blue: ${wins.blue} wins`);
console.log(`Red: ${wins.red} wins`);
console.log(`Draws: ${wins.draws}`);
