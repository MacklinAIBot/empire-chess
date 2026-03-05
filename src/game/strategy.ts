// AI Strategy Configuration

import type { PieceType } from './types';

// Default piece values (traditional)
export const DEFAULT_PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
};

export interface AIStrategy {
  name: string;
  description: string;
  pieceValues: Record<PieceType, number>;
  captureBonus: number;        // Multiply piece value by this when capturing
  centerBonus: number;        // Bonus for being near center
  kingSafetyBonus: number;    // Bonus for moving king to safety
  developmentBonus: number;   // Bonus for moving pieces from start
  pressureBonus: number;      // Bonus for pressuring enemy king
}

// Predefined strategies
export const STRATEGIES: Record<string, AIStrategy> = {
  balanced: {
    name: 'Balanced',
    description: 'Traditional play - values material and position equally',
    pieceValues: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 },
    captureBonus: 10,
    centerBonus: 5,
    kingSafetyBonus: 20,
    developmentBonus: 3,
    pressureBonus: 5,
  },
  
  aggressive: {
    name: 'Aggressive',
    description: 'Prioritizes captures and attacks',
    pieceValues: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 },
    captureBonus: 20,
    centerBonus: 3,
    kingSafetyBonus: 5,
    developmentBonus: 5,
    pressureBonus: 15,
  },
  
  defensive: {
    name: 'Defensive',
    description: 'Prioritizes king safety and position',
    pieceValues: { pawn: 2, knight: 3, bishop: 4, rook: 5, queen: 8, king: 200 },
    captureBonus: 8,
    centerBonus: 8,
    kingSafetyBonus: 50,
    developmentBonus: 8,
    pressureBonus: 2,
  },
  
  material: {
    name: 'Material',
    description: 'Focuses on piece value, ignores position',
    pieceValues: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 },
    captureBonus: 15,
    centerBonus: 1,
    kingSafetyBonus: 10,
    developmentBonus: 1,
    pressureBonus: 1,
  },
  
  center: {
    name: 'Center Control',
    description: 'Controls the center of the board',
    pieceValues: { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 },
    captureBonus: 8,
    centerBonus: 15,
    kingSafetyBonus: 15,
    developmentBonus: 5,
    pressureBonus: 3,
  },
};

export const STRATEGY_KEYS = Object.keys(STRATEGIES);
