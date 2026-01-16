'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

export default function RotatingWireSphere() {
  const ref = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.2, 2);
    return new THREE.WireframeGeometry(geo);
  }, []);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.4;
    ref.current.rotation.x += delta * 0.15;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial
        color="#7dd3fc"
        transparent
        opacity={0.85}
      />
    </lineSegments>
  );
}
