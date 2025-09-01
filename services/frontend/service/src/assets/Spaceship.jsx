import React, { forwardRef, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const Spaceship = forwardRef((props, ref) => {
    const { scene } = useGLTF('/gltf/Spaceship.gltf') || {};

    const reference = useRef();

    useEffect(() => {
        if (reference) {
            ref.current = reference.current;
        }
    }, [reference]);

    return (
        <primitive
            object={scene}
            ref={reference}
            {...props}
        />
    );
});

export default Spaceship;

useGLTF.preload('/gltf/Spaceship.gltf');
