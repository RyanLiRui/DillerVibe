// Mock data for Drill Master game

export const BLOCK_TYPES = {
  EMPTY: 'empty',
  GREEN: 'green',
  PINK: 'pink',
  BLUE: 'blue',
  YELLOW: 'yellow',
  BROWN_X: 'brown_x', // Requires 5 hits
  AIR_CAPSULE: 'air_capsule' // Refills oxygen
};

export const COLORS = {
  [BLOCK_TYPES.GREEN]: '#4ade80',
  [BLOCK_TYPES.PINK]: '#f472b6',
  [BLOCK_TYPES.BLUE]: '#60a5fa',
  [BLOCK_TYPES.YELLOW]: '#facc15',
  [BLOCK_TYPES.BROWN_X]: '#8b4513',
  [BLOCK_TYPES.AIR_CAPSULE]: '#06b6d4'
};

export const CHARACTERS = [
  {
    id: 1,
    name: 'Red Driller',
    color: '#dc2626',
    ability: 'Standard Drilling',
    oxygenRate: 1,
    speed: 1
  },
  {
    id: 2,
    name: 'Blue Speedster',
    color: '#2563eb',
    ability: 'Fast Movement',
    oxygenRate: 1.2,
    speed: 1.5
  },
  {
    id: 3,
    name: 'Green Saver',
    color: '#059669',
    ability: 'Oxygen Conservation',
    oxygenRate: 0.7,
    speed: 0.9
  }
];

// Generate initial game board (12x20 grid)
export const generateMockGameBoard = () => {
  const board = [];
  const width = 12;
  const height = 20;
  
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      // Top 5 rows are mostly empty for player movement
      if (y < 5) {
        if (Math.random() > 0.8) {
          row.push({
            type: Math.random() > 0.7 ? BLOCK_TYPES.AIR_CAPSULE : 
                  [BLOCK_TYPES.GREEN, BLOCK_TYPES.PINK, BLOCK_TYPES.BLUE, BLOCK_TYPES.YELLOW][Math.floor(Math.random() * 4)],
            hits: 0,
            id: `${x}-${y}-${Date.now()}`
          });
        } else {
          row.push({ type: BLOCK_TYPES.EMPTY, hits: 0, id: `${x}-${y}-${Date.now()}` });
        }
      } else {
        // Dense block formation in lower rows
        const randomType = Math.random();
        let blockType;
        
        if (randomType > 0.95) {
          blockType = BLOCK_TYPES.BROWN_X;
        } else if (randomType > 0.9) {
          blockType = BLOCK_TYPES.AIR_CAPSULE;
        } else {
          blockType = [BLOCK_TYPES.GREEN, BLOCK_TYPES.PINK, BLOCK_TYPES.BLUE, BLOCK_TYPES.YELLOW][Math.floor(Math.random() * 4)];
        }
        
        row.push({
          type: blockType,
          hits: blockType === BLOCK_TYPES.BROWN_X ? 5 : 0,
          id: `${x}-${y}-${Date.now()}`
        });
      }
    }
    board.push(row);
  }
  
  return board;
};

export const INITIAL_GAME_STATE = {
  board: generateMockGameBoard(),
  player: {
    x: 5,
    y: 4,
    character: CHARACTERS[0]
  },
  hud: {
    oxygen: 100,
    maxOxygen: 100,
    score: 0,
    depth: 0,
    level: 1,
    lives: 3
  },
  gameStatus: 'playing', // 'playing', 'paused', 'gameOver', 'levelComplete'
  targetDepth: 1000
};

export const GAME_CONFIG = {
  boardWidth: 12,
  boardHeight: 20,
  blockSize: 1,
  oxygenDecayRate: 0.5, // per second
  chainReactionDelay: 200, // ms
  minConnectedBlocks: 4
};