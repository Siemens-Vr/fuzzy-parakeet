'use client';

import { Points } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

type RainParticlesProps = {
  count?: number;
  area?: number;        // spread on X/Z
  height?: number;      // vertical span
  speed?: number;       // fall speed
  size?: number;        // point size
};

export default function Particles({
  count = 900,
  area = 18,
  height = 14,
  speed = 2.2,
  size = 0.085,
}: RainParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, colors, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    // Nice palette for white background + VR vibe
    const palette = [
      new THREE.Color('#38bdf8'), // cyan
      new THREE.Color('#8b5cf6'), // violet
      new THREE.Color('#22c55e'), // green
      new THREE.Color('#fb7185'), // pink
      new THREE.Color('#f59e0b'), // amber
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // random positions
      positions[i3 + 0] = (Math.random() - 0.5) * area;       // x
      positions[i3 + 1] = (Math.random() - 0.5) * height;     // y
      positions[i3 + 2] = (Math.random() - 0.5) * area;       // z

      // per-particle color
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3 + 0] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      // seed controls flicker timing & drift variation
      seeds[i] = Math.random() * 1000;
    }

    return { positions, colors, seeds };
  }, [count, area, height]);

  useFrame(({ clock }, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const geom = pts.geometry as THREE.BufferGeometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;

    const t = clock.getElapsedTime();

    // Animate positions: falling rain + tiny sideways drift
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      let x = posAttr.array[i3 + 0] as number;
      let y = posAttr.array[i3 + 1] as number;
      let z = posAttr.array[i3 + 2] as number;

      // fall down
      y -= (speed * (0.6 + (seeds[i] % 1) * 0.8)) * delta;

      // gentle drift
      x += Math.sin(t * 0.35 + seeds[i]) * 0.015 * delta * 60;
      z += Math.cos(t * 0.28 + seeds[i] * 1.3) * 0.012 * delta * 60;

      // wrap to top when below range
      if (y < -height / 2) {
        y = height / 2;
        x = (Math.random() - 0.5) * area;
        z = (Math.random() - 0.5) * area;
      }

      posAttr.array[i3 + 0] = x;
      posAttr.array[i3 + 1] = y;
      posAttr.array[i3 + 2] = z;
    }

    posAttr.needsUpdate = true;

    // Appear/disappear effect: pulse material opacity smoothly
    // (global pulse looks great; cheap vs per-point alpha)
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.6));
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      colors={colors}
      stride={3}
      frustumCulled={false}
    >
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
        sizeAttenuation
      />
    </Points>
  );
}
