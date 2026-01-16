'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

type Props = {
  count?: number;
  area?: number;
  height?: number;
  speed?: number;
};

export default function VRHeadsetRain({
  count = 80,
  area = 14,
  height = 12,
  speed = 1.4,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Per-instance data
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * area,
        y: Math.random() * height,
        z: (Math.random() - 0.5) * area,
        rot: Math.random() * Math.PI,
        rotSpeed: 0.2 + Math.random() * 0.6,
        scale: 0.22 + Math.random() * 0.15,
      })),
    [count, area, height]
  );

  useFrame((_, delta) => {
    data.forEach((p, i) => {
      p.y -= speed * delta;
      p.rot += p.rotSpeed * delta;

      if (p.y < -height / 2) {
        p.y = height / 2;
        p.x = (Math.random() - 0.5) * area;
        p.z = (Math.random() - 0.5) * area;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(0, p.rot, 0);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Abstract VR headset geometry */}
      <boxGeometry args={[1.8, 0.6, 0.5]} />
      <meshStandardMaterial
        color="#38bdf8"
        transparent
        opacity={0.75}
        roughness={0.25}
        metalness={0.6}
      />
    </instancedMesh>
  );
}
