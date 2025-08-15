import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import GameHUD from './GameHUD';
import { INITIAL_GAME_STATE, BLOCK_TYPES, GAME_CONFIG, generateMockGameBoard } from '../../mock/gameData';
import { useToast } from '../../hooks/use-toast';

const DrillMaster = () => {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [isPlaying, setIsPlaying] = useState(true);
  const { toast } = useToast();

  // Oxygen depletion effect
  useEffect(() => {
    if (!isPlaying || gameState.gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newOxygen = Math.max(0, prev.hud.oxygen - GAME_CONFIG.oxygenDecayRate);
        
        if (newOxygen <= 0) {
          toast({
            title: "Game Over!",
            description: "You ran out of oxygen!",
            variant: "destructive"
          });
          return { ...prev, gameStatus: 'gameOver', hud: { ...prev.hud, oxygen: 0 } };
        }

        return { ...prev, hud: { ...prev.hud, oxygen: newOxygen } };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, gameState.gameStatus, toast]);

  // Check for connected blocks of same color
  const findConnectedBlocks = useCallback((board, startX, startY, targetType) => {
    const visited = new Set();
    const connected = [];
    
    const dfs = (x, y) => {
      const key = `${x},${y}`;
      if (visited.has(key)) return;
      if (x < 0 || x >= GAME_CONFIG.boardWidth || y < 0 || y >= GAME_CONFIG.boardHeight) return;
      if (board[y][x].type !== targetType || board[y][x].type === BLOCK_TYPES.EMPTY) return;
      
      visited.add(key);
      connected.push({ x, y });
      
      // Check adjacent blocks (up, down, left, right)
      dfs(x + 1, y);
      dfs(x - 1, y);
      dfs(x, y + 1);
      dfs(x, y - 1);
    };
    
    dfs(startX, startY);
    return connected;
  }, []);

  const handleBlockClick = useCallback((x, y) => {
    if (!isPlaying || gameState.gameStatus !== 'playing') return;
    
    // Check if player is adjacent to the block
    const playerX = gameState.player.x;
    const playerY = gameState.player.y;
    const distance = Math.abs(playerX - x) + Math.abs(playerY - y);
    
    if (distance > 1) return; // Player must be adjacent to drill
    
    setGameState(prev => {
      const newBoard = [...prev.board.map(row => [...row])];
      const block = newBoard[y][x];
      
      if (block.type === BLOCK_TYPES.EMPTY) return prev;
      
      let newScore = prev.hud.score;
      let newOxygen = prev.hud.oxygen;
      
      // Handle different block types
      if (block.type === BLOCK_TYPES.BROWN_X) {
        block.hits -= 1;
        newOxygen = Math.max(0, newOxygen - 5); // Oxygen penalty
        
        if (block.hits <= 0) {
          block.type = BLOCK_TYPES.EMPTY;
          newScore += 50;
        }
      } else if (block.type === BLOCK_TYPES.AIR_CAPSULE) {
        block.type = BLOCK_TYPES.EMPTY;
        newOxygen = Math.min(prev.hud.maxOxygen, newOxygen + 20);
        newScore += 100;
        toast({
          title: "Air Refill!",
          description: "+20 Oxygen",
          className: "bg-blue-600 text-white"
        });
      } else {
        // Regular colored block - check for chain reactions
        const connected = findConnectedBlocks(newBoard, x, y, block.type);
        
        if (connected.length >= GAME_CONFIG.minConnectedBlocks) {
          // Chain reaction!
          connected.forEach(({ x: cx, y: cy }) => {
            newBoard[cy][cx].type = BLOCK_TYPES.EMPTY;
          });
          newScore += connected.length * 20;
          
          toast({
            title: `Chain Reaction!`,
            description: `${connected.length} blocks destroyed! +${connected.length * 20} points`,
            className: "bg-green-600 text-white"
          });
        } else {
          // Single block destruction
          block.type = BLOCK_TYPES.EMPTY;
          newScore += 10;
        }
      }
      
      // Calculate depth based on player position
      const newDepth = Math.max(prev.hud.depth, (playerY - 4) * 10);
      
      return {
        ...prev,
        board: newBoard,
        hud: {
          ...prev.hud,
          score: newScore,
          oxygen: newOxygen,
          depth: newDepth
        }
      };
    });
  }, [isPlaying, gameState.gameStatus, gameState.player, findConnectedBlocks, toast]);

  const handlePlayerMove = useCallback((direction) => {
    if (!isPlaying || gameState.gameStatus !== 'playing') return;
    
    setGameState(prev => {
      const { x, y } = prev.player;
      let newX = x;
      let newY = y;
      
      switch (direction) {
        case 'left':
          newX = Math.max(0, x - 1);
          break;
        case 'right':
          newX = Math.min(GAME_CONFIG.boardWidth - 1, x + 1);
          break;
        case 'drill':
          // Move player down if space below is empty or can be drilled
          if (y + 1 < GAME_CONFIG.boardHeight) {
            const blockBelow = prev.board[y + 1][x];
            if (blockBelow.type === BLOCK_TYPES.EMPTY) {
              newY = y + 1;
            } else {
              // Drill the block below
              handleBlockClick(x, y + 1);
              return prev; // Don't move player yet
            }
          }
          break;
        default:
          return prev;
      }
      
      // Check if new position is valid (not occupied by a solid block)
      if (newY < GAME_CONFIG.boardHeight && 
          prev.board[newY][newX].type === BLOCK_TYPES.EMPTY) {
        return {
          ...prev,
          player: { ...prev.player, x: newX, y: newY }
        };
      }
      
      return prev;
    });
  }, [isPlaying, gameState.gameStatus, handleBlockClick]);

  const handlePause = () => {
    setIsPlaying(!isPlaying);
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing'
    }));
  };

  const handleRestart = () => {
    setGameState({
      ...INITIAL_GAME_STATE,
      board: generateMockGameBoard()
    });
    setIsPlaying(true);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 flex">
      <GameBoard 
        gameState={gameState}
        onBlockClick={handleBlockClick}
        onPlayerMove={handlePlayerMove}
      />
      <GameHUD 
        gameState={gameState}
        onPause={handlePause}
        onRestart={handleRestart}
      />
      
      {/* Game Status Overlays */}
      {gameState.gameStatus === 'paused' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-slate-800 p-8 rounded-lg border-2 border-cyan-400">
            <h2 className="text-3xl font-bold text-white text-center mb-4">GAME PAUSED</h2>
            <button 
              onClick={handlePause}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              RESUME
            </button>
          </div>
        </div>
      )}
      
      {gameState.gameStatus === 'gameOver' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-slate-800 p-8 rounded-lg border-2 border-red-400">
            <h2 className="text-3xl font-bold text-red-400 text-center mb-4">GAME OVER</h2>
            <div className="text-white text-center mb-6">
              <div>Final Score: {gameState.hud.score.toLocaleString()}</div>
              <div>Depth Reached: {gameState.hud.depth}m</div>
            </div>
            <button 
              onClick={handleRestart}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillMaster;