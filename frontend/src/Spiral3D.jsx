import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Helper: Convert MM.DD or MM.DD-MM.DD to day-of-year
function dateToDayOfYear(dateStr) {
  // Use first date if range
  const [main] = dateStr.split('-');
  const [mm, dd] = main.split('.').map(Number);
  if (!mm || !dd) return null;
  const date = new Date(2024, mm - 1, dd); // Leap year safe
  const start = new Date(2024, 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Custom spiral curve for tube geometry
class SpiralCurve extends THREE.Curve {
  constructor(turns, radius, height) {
    super();
    this.turns = turns;
    this.radius = radius;
    this.height = height;
  }
  getPoint(t) {
    const angle = t * Math.PI * 2 * this.turns;
    const x = Math.cos(angle) * this.radius;
    const y = t * this.height - this.height / 2;
    const z = Math.sin(angle) * this.radius;
    return new THREE.Vector3(x, y, z);
  }
}

function SpiralDots({ milestones }) {
  console.log('SpiralDots received milestones:', milestones);
  console.log('Milestones length:', milestones?.length);
  
  // Spiral parameters
  const turns = 3;
  const radius = 3;
  const height = 8;
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Parse dates to day-of-year
  const days = milestones.map(m => dateToDayOfYear(m.date));
  console.log('Parsed days:', days);
  
  // Fallback: evenly spaced if any date is missing
  const valid = days.every(d => typeof d === 'number' && !isNaN(d));
  console.log('All dates valid:', valid);
  
  let tVals;
  if (valid) {
    // Normalize to [0, 1]
    const min = Math.min(...days);
    const max = Math.max(...days);
    tVals = days.map(d => (d - min) / (max - min || 1));
    console.log('Using chronological positioning');
  } else {
    tVals = milestones.map((_, i) => i / (milestones.length - 1));
    console.log('Using evenly spaced positioning');
  }
  
  console.log('tVals:', tVals);

  // Group milestones by date
  const dateGroups = [];
  milestones.forEach((m, i) => {
    const last = dateGroups[dateGroups.length - 1];
    if (last && last.date === m.date) {
      last.descs.push(m.desc);
      last.indices.push(i);
    } else {
      dateGroups.push({ date: m.date, descs: [m.desc], indices: [i] });
    }
  });

  // Calculate spiral positions
  const spiral = tVals.map(t => {
    const angle = t * Math.PI * 2 * turns;
    const x = Math.cos(angle) * radius;
    const y = t * height - height / 2;
    const z = Math.sin(angle) * radius;
    return { x, y, z };
  });

  // Create spiral curve instance
  const spiralCurve = React.useMemo(() => new SpiralCurve(turns, radius, height), [turns, radius, height]);

  return (
    <>
      {/* Spiral line */}
      <mesh>
        <tubeGeometry args={[spiralCurve, 100, 0.018, 16, false]} />
        <meshPhysicalMaterial
          color="#888"
          transparent={true}
          opacity={0.38}
          roughness={0.25}
          metalness={0.08}
          transmission={0}
          thickness={0.1}
          emissive="#888"
          emissiveIntensity={0.18}
        />
      </mesh>
      {/* Milestone plates */}
      {console.log('Rendering', spiral.length, 'dots')}
      {spiral.map((pos, i) => (
        <group
          key={i}
          position={[pos.x, pos.y, pos.z]}
        >
          <mesh
            onPointerOver={() => setHoveredIdx(i)}
            onPointerOut={() => setHoveredIdx(null)}
          >
            <cylinderGeometry args={[0.07, 0.07, 0.018, 32]} />
            <meshPhysicalMaterial
              color="#fffbe6"
              emissive="#ffae42"
              emissiveIntensity={80}
              transmission={0.7}
              thickness={0.5}
              roughness={0.1}
              metalness={0.2}
              transparent={true}
              opacity={0.95}
            />
          </mesh>
        </group>
      ))}
      {/* Date + joined descriptions, only once per date */}
      {dateGroups.map(group => {
        const firstIdx = group.indices[0];
        const pos = spiral[firstIdx];
        const isHovered = group.indices.some(idx => hoveredIdx === idx);
        return (
          <Html
            key={group.date + firstIdx}
            center
            position={[pos.x, pos.y + 0.5, pos.z]}
            distanceFactor={8}
            style={{ pointerEvents: 'auto', userSelect: 'none', zIndex: isHovered ? 10 : 1 }}
            onPointerEnter={() => setHoveredIdx(firstIdx)}
            onPointerLeave={() => setHoveredIdx(null)}
          >
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#fff',
              fontSize: isHovered ? 18 : 7,
              fontWeight: isHovered ? 700 : 400,
              textAlign: 'center',
              textShadow: isHovered
                ? '0 0 8px #fff, 0 0 16px #fff, 0 0 24px #fff, 0 2px 8px #000'
                : '0 0 4px #fff, 0 2px 8px #000',
              whiteSpace: 'nowrap',
              padding: 0,
              margin: 0,
            }}>
              {group.date}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#fff',
              fontSize: isHovered ? 18 : 7,
              fontWeight: isHovered ? 400 : 300,
              textAlign: 'center',
              textShadow: isHovered
                ? '0 0 8px #fff, 0 0 16px #fff, 0 0 24px #fff, 0 2px 8px #000'
                : '0 0 4px #fff, 0 2px 8px #000',
              maxWidth: isHovered ? 160 : 40,
              margin: '0 auto',
              whiteSpace: 'pre-line',
              padding: 0,
            }}>
              {group.descs.join(';\n')}
            </div>
          </Html>
        );
      })}
    </>
  );
}

export default function Spiral3D({ milestones }) {
  console.log('Spiral3D component received milestones:', milestones);
  console.log('Milestones type:', typeof milestones);
  console.log('Milestones is array:', Array.isArray(milestones));
  
  return (
    <div style={{
      width: '100vw',
      minHeight: 550,
      background: 'linear-gradient(180deg, #f5ecd7 0%, #e8dbc3 100%)', // beige gradient
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100vw', height: 550, background: 'black', position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', zIndex: 1 }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} shadows style={{ background: 'black', width: '100vw', height: 550, display: 'block' }}>
          <Stars radius={40} depth={60} count={800} factor={1.5} saturation={0} fade={false} speed={0} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 7]} intensity={0.7} />
          <SpiralDots milestones={milestones} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.2} intensity={2.5} />
          </EffectComposer>
          <OrbitControls
            enableZoom={true}
            enableRotate={true}
            enablePan={true}
            mouseButtons={{
              LEFT: 0, // ROTATE
              MIDDLE: 1, // ZOOM
              RIGHT: 2, // PAN
              // But we'll use modifier keys for pan
            }}
            touches={{
              ONE: 0, // ROTATE
              TWO: 1, // ZOOM
              THREE: 2, // PAN
            }}
            // Only allow pan with ctrl/cmd + drag
            onStart={(e) => {
              if (e.target && e.target instanceof window.Event && e.target.ctrlKey) {
                e.target.object.enablePan = true;
              } else {
                e.target.object.enablePan = false;
              }
            }}
          />
        </Canvas>
      </div>
    </div>
  );
} 