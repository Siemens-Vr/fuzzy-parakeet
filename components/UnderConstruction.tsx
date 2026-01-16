'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import RotatingWireSphere from '@/components/RotatingWireSphere';
import VRHeadsetRain from './VRHeadsetRain';
import VRVisor from './VRVisor';
import Particles from '@/components/Particles';
import LoaderOverlay from '@/components/LoaderOverlay';

export default function GroupsPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 6, 5]} intensity={1.2} />
        <Suspense fallback={<LoaderOverlay />}>
         <VRVisor />
          <VRHeadsetRain /> 
          {/* <RotatingWireSphere /> */}
          {/* <Particles /> */}
          <LoaderOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
}
