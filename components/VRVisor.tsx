'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

export default function VRVisor() {
  const ref = useRef<THREE.Group>(null!);

  const geometry = useMemo(() => {
    // Wide, shallow shape → visor feel
    const geo = new THREE.TorusGeometry(1.1, 0.18, 16, 80, Math.PI);
    return new THREE.WireframeGeometry(geo);
  }, []);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.35;
    ref.current.rotation.x = Math.sin(performance.now() * 0.0004) * 0.15;
  });

  return (
    <group ref={ref}>
      {/* Main visor curve */}
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.85}
        />
      </lineSegments>

      {/* Inner depth line (gives headset thickness illusion) */}
      <lineSegments geometry={geometry} position={[0, 0, -0.15]}>
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.45}
        />
      </lineSegments>
    </group>
  );
}
