'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import RotatingWireSphere from '@/components/RotatingWireSphere';
import VRHeadsetRain from '@/components/VRHeadsetRain';
import Particles from '@/components/Particles';
import LoaderOverlay from '@/components/LoaderOverlay';

export default function GroupsPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <Suspense fallback={<LoaderOverlay />}>
         {/* <VRVisor /> */}
          <RotatingWireSphere />
           <VRHeadsetRain /> 
          <LoaderOverlay />
        </Suspense>
      </Canvas>
    </div>
  );
}
