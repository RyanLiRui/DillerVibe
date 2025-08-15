import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BLOCK_TYPES, COLORS } from '../../mock/gameData';

const Block = ({ position, type, hits, onClick }) => {
  const meshRef = useRef();

  const getBlockColor = (type, hits) => {
    if (type === BLOCK_TYPES.EMPTY) return null;
    if (type === BLOCK_TYPES.BROWN_X && hits > 0) {
      // Damaged brown blocks get darker
      const damage = (5 - hits) / 5;
      return new THREE.Color().setHex(0x8b4513).lerp(new THREE.Color(0x654321), damage);
    }
    return new THREE.Color(COLORS[type]);
  };

  const color = getBlockColor(type, hits);
  
  if (type === BLOCK_TYPES.EMPTY) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={(e) => e.object.scale.setScalar(1.05)}
      onPointerOut={(e) => e.object.scale.setScalar(1)}
    >
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial 
        color={color}
        transparent={type === BLOCK_TYPES.AIR_CAPSULE}
        opacity={type === BLOCK_TYPES.AIR_CAPSULE ? 0.8 : 1}
      />
      
      {/* Special block indicators */}
      {type === BLOCK_TYPES.BROWN_X && (
        <mesh position={[0, 0, 0.51]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      )}
      
      {type === BLOCK_TYPES.AIR_CAPSULE && (
        <mesh position={[0, 0, 0.51]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </mesh>
  );
};

const Player = ({ position, character }) => {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.005) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Main character body */}
      <mesh ref={meshRef} position={[0, 0.2, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color={character.color} />
      </mesh>
      
      {/* Drill */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Character indicator */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

const GameBoard = ({ gameState, onBlockClick, onPlayerMove }) => {
  const { board, player } = gameState;

  const handleKeyPress = (event) => {
    switch(event.key) {
      case 'ArrowLeft':
      case 'a':
        onPlayerMove('left');
        break;
      case 'ArrowRight':
      case 'd':
        onPlayerMove('right');
        break;
      case 'ArrowDown':
      case 's':
      case ' ':
        onPlayerMove('drill');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="w-full h-full" style={{ width: 'calc(100vw - 320px)' }}>
      <Canvas 
        camera={{ position: [0, 5, 15], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #1e1b4b, #0f172a)' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 5, 5]} intensity={0.5} />

        {/* Render blocks */}
        {board.map((row, y) =>
          row.map((block, x) => (
            <Block
              key={block.id}
              position={[x - 6, -y + 10, 0]}
              type={block.type}
              hits={block.hits}
              onClick={() => onBlockClick(x, y)}
            />
          ))
        )}

        {/* Render player */}
        <Player
          position={[player.x - 6, -player.y + 10, 0]}
          character={player.character}
        />

        {/* Grid helper for development */}
        <gridHelper args={[24, 24, '#333333', '#333333']} position={[0, -10, 0]} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Control instructions */}
      <div className="absolute bottom-4 left-4 bg-black/70 p-4 rounded-lg text-white">
        <div className="text-sm font-bold mb-2">CONTROLS:</div>
        <div className="text-xs space-y-1">
          <div>← → or A/D: Move</div>
          <div>↓ or S/Space: Drill</div>
          <div>Mouse: Rotate view</div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;