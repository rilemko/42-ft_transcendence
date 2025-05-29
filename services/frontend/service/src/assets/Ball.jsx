import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Ball = ({ position = [0, 0, 0], color = '#e48d2d'}) => {

    const ref = useRef();
    const targetPos = new THREE.Vector3(...position);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.copy(targetPos);
        }
    });

    return (
        <mesh
            ref={ref}
            position={position}
            scale={[0.5, 0.5, 0.5]}
        >
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={color} metalness={0} roughness={5} />
        </mesh>
    );

};

export default Ball;
