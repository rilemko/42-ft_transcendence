import React, { useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const Earth = () => {
    const texture = useLoader(THREE.TextureLoader, '/textures/Earth.jpeg');
    const ref = useRef();

    const memo = useMemo(() => {
        return (
            <mesh
                ref={ref}
                position={[7, 0, -14]}
            >
                <sphereGeometry args={[3, 32, 32]} />
                <meshStandardMaterial map={texture} />
            </mesh>
        );
    }, [texture]);

    return memo;
};

export default Earth;
