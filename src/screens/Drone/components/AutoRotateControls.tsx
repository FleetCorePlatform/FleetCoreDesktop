import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from "three";
export function AutoRotateControls() {
  const controlsRef = useRef<any>(null);
  const isDragging = useRef(false);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || isDragging.current) return;

    const azimuth = controls.getAzimuthalAngle();
    const polar = controls.getPolarAngle();

    if (Math.abs(azimuth) > 0.001 || Math.abs(polar - Math.PI / 2) > 0.001) {
      controls.autoRotate = false;
      controls.setAzimuthalAngle(THREE.MathUtils.lerp(azimuth, 0, delta * 3));
      controls.setPolarAngle(THREE.MathUtils.lerp(polar, Math.PI / 2, delta * 3));
      controls.update();
    } else {
      controls.autoRotate = true;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate
      autoRotateSpeed={2}
      enableZoom={false}
      enablePan={false}
      onStart={() => {
        isDragging.current = true;
        if (controlsRef.current) controlsRef.current.autoRotate = false;
      }}
      onEnd={() => {
        isDragging.current = false;
      }}
    />
  );
}
