// Terrain System for Empire Chess

export type TerrainType = 'normal' | 'mountain' | 'water' | 'forest' | 'lava';

export interface TerrainCell {
  type: TerrainType;
}

// Terrain movement rules
export const TERRAIN_RULES = {
  normal: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 8, // Full movement range
    moveType: 'normal', // Can move through multiple normal spaces
  },
  mountain: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 1, // Can only move 1 space at a time in mountains
    moveType: 'king', // Like a king - one space at a time
  },
  water: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 4, // Max 4 spaces through water
    moveType: 'slow',
  },
  forest: {
    canEnter: true,
    canTraverse: true,
    maxSpaces: 2, // Max 2 spaces through forest
    moveType: 'slow',
  },
  lava: {
    canEnter: false, // Can't enter lava
    canTraverse: false, // Can't pass through lava (except knights jumping over)
    maxSpaces: 0,
    moveType: 'blocked',
  },
};

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  normal: '#2d2d44', // Default board color
  mountain: '#6b6b7a', // Gray
  water: '#5dade2', // Light blue
  forest: '#1e6b1e', // Dark green
  lava: '#e74c3c', // Orange/red
};

// Seeded random number generator (like Minecraft)
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // Simple seeded random - returns 0-1
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  
  // Returns random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Generate terrain for the board using seed
export function generateTerrain(boardSize: number, seed: number): TerrainCell[][] {
  // Seed 0 = blank board (all normal terrain)
  if (seed === 0) {
    const terrain: TerrainCell[][] = [];
    for (let row = 0; row < boardSize; row++) {
      terrain[row] = [];
      for (let col = 0; col < boardSize; col++) {
        terrain[row][col] = { type: 'normal' };
      }
    }
    return terrain;
  }
  
  const rng = new SeededRandom(seed);
  const terrain: TerrainCell[][] = [];
  
  // Initialize all as normal
  for (let row = 0; row < boardSize; row++) {
    terrain[row] = [];
    for (let col = 0; col < boardSize; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Generate terrain clusters - target ~15% coverage
  const numSeeds = Math.floor(boardSize / 6); // ~5-6 seeds for 32x32
  
  const seeds: { x: number; y: number; type: TerrainType; strength: number }[] = [];
  
  // Mountain ranges
  for (let i = 0; i < numSeeds * 2; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'mountain',
      strength: rng.next() * 0.4 + 0.4,
    });
  }
  
  // Lakes
  for (let i = 0; i < numSeeds; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'water',
      strength: rng.next() * 0.35 + 0.35,
    });
  }
  
  // Forests
  for (let i = 0; i < numSeeds * 1.5; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'forest',
      strength: rng.next() * 0.35 + 0.35,
    });
  }
  
  // Lava pools (fewer)
  for (let i = 0; i < numSeeds * 0.5; i++) {
    seeds.push({
      x: rng.nextInt(0, boardSize - 1),
      y: rng.nextInt(0, boardSize - 1),
      type: 'lava',
      strength: rng.next() * 0.3 + 0.4,
    });
  }
  
  // Apply terrain based on distance to seeds
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      let bestTerrain: TerrainType = 'normal';
      let bestScore = 0.45; // Higher threshold = less terrain (~2-5%)
      
      for (const seed of seeds) {
        const dist = Math.sqrt((row - seed.y) ** 2 + (col - seed.x) ** 2);
        const maxDist = boardSize / 5; // Influence radius
        const score = seed.strength * (1 - dist / maxDist);
        
        if (score > bestScore) {
          bestScore = score;
          bestTerrain = seed.type;
        }
      }
      
      terrain[row][col] = { type: bestTerrain };
    }
  }
  
  // Clear starting zones for all players (works for both 2-player and 4-player)
  // Blue: top middle (M1-T4)
  for (let row = 0; row < 4; row++) {
    for (let col = 12; col < 20; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Red: bottom middle (M29-T32)
  for (let row = 28; row < 32; row++) {
    for (let col = 12; col < 20; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Yellow: middle left (A13-D20)
  for (let row = 12; row < 20; row++) {
    for (let col = 0; col < 4; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  // Green: middle right (CC13-FF20)
  for (let row = 12; row < 20; row++) {
    for (let col = 28; col < 32; col++) {
      terrain[row][col] = { type: 'normal' };
    }
  }
  
  return terrain;
}
