import { useContext, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Camera = ({ position = [0, 0, 0] }) => {
    const { camera } = useThree();

    const targetPosition = useRef(position);
    const currentPosition = useRef(camera.position.clone());

    useEffect(() => {
        targetPosition.current = position;
    }, [position]);

    useFrame(() => {
        if (camera) {
            currentPosition.current.lerp(new THREE.Vector3(...targetPosition.current), 0.1);
            camera.position.copy(currentPosition.current);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }
  });

    return null;
};

export default Camera;
