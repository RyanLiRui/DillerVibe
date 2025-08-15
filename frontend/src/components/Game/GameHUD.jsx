import React from 'react';
import { Progress } from '../ui/progress';

const GameHUD = ({ gameState, onPause, onRestart }) => {
  const { oxygen, maxOxygen, score, depth, level, lives } = gameState.hud;
  const oxygenPercentage = (oxygen / maxOxygen) * 100;

  const getOxygenColor = (percentage) => {
    if (percentage > 60) return '#4ade80'; // Green
    if (percentage > 30) return '#facc15'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-gradient-to-b from-slate-800 to-slate-900 border-l-4 border-cyan-400 p-4 z-10">
      {/* Depth Display */}
      <div className="mb-6">
        <div className="text-orange-400 font-bold text-lg mb-1">DEPTH</div>
        <div className="bg-slate-700 rounded-lg p-3 border-2 border-orange-400">
          <div className="flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{depth}</span>
            <span className="text-lg text-orange-300 ml-1">m</span>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="mb-6">
        <div className="text-pink-400 font-bold text-lg mb-1">SCORE</div>
        <div className="bg-slate-700 rounded-lg p-3 border-2 border-pink-400">
          <div className="text-2xl font-bold text-white text-center">
            {score.toLocaleString()}
          </div>
          <div className="text-sm text-pink-300 text-center">pts.</div>
        </div>
      </div>

      {/* Air/Oxygen Display */}
      <div className="mb-6">
        <div className="text-blue-400 font-bold text-lg mb-1">AIR</div>
        <div className="bg-slate-700 rounded-lg p-4 border-2 border-blue-400">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <div className="w-full h-full rounded-full border-4 border-gray-600 relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 w-full transition-all duration-200 rounded-full"
                style={{
                  height: `${oxygenPercentage}%`,
                  backgroundColor: getOxygenColor(oxygenPercentage)
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {Math.round(oxygen)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Display */}
      <div className="mb-6">
        <div className="text-purple-400 font-bold text-lg mb-1">LEVEL</div>
        <div className="bg-slate-700 rounded-lg p-3 border-2 border-purple-400">
          <div className="flex items-center justify-center">
            <div className="text-2xl font-bold text-white">{level}</div>
            <div className="ml-3 flex">
              {Array.from({ length: lives }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-blue-400 mr-1" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3 mt-8">
        <button 
          onClick={onPause}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          PAUSE
        </button>
        <button 
          onClick={onRestart}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          RESTART
        </button>
      </div>

      {/* Game Info */}
      <div className="mt-6 text-xs text-gray-400">
        <div>Target: {gameState.targetDepth}m</div>
        <div>Character: {gameState.player.character.name}</div>
      </div>
    </div>
  );
};

export default GameHUD;