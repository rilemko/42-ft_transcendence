import React, { useEffect , useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import Spaceship from '../assets/Spaceship';
import Earth from '../assets/Earth';
import SpaceBackground from '../components/SpaceBackground';

const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

const useAnimation = (onFinish = () => {}, ref, startPosition, startRotation, startScale, endPosition, endRotation, endScale, duration) => {

    useEffect(() => {
        if (ref.current) {
            ref.current.position.copy(startPosition);
            ref.current.rotation.copy(startRotation);
            ref.current.scale.copy(startScale);
        }

        const startTime = Date.now();

        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);
            const easedT = easeInOutQuad(t);

            if (ref.current) {
                ref.current.position.lerpVectors(startPosition, endPosition, easedT);
                ref.current.rotation.set(
                THREE.MathUtils.lerp(startRotation.x, endRotation.x, easedT),
                THREE.MathUtils.lerp(startRotation.y, endRotation.y, easedT),
                THREE.MathUtils.lerp(startRotation.z, endRotation.z, easedT)
                );
                ref.current.scale.lerpVectors(startScale, endScale, easedT);
            }

            if (t < 1) requestAnimationFrame(animate);
            else onFinish();
        };

        animate();
    }, [ref, startPosition, startRotation, startScale, endPosition, endRotation, endScale, duration]);
};

const SpaceshipScene = ({ onFinish = () => {}}) => {

    const spaceshipRef = useRef();

    useAnimation(
        onFinish,
        spaceshipRef,
        new THREE.Vector3(5, 1.2, -10),
        new THREE.Vector3(-0.3, -0.5, 0.4),
        new THREE.Vector3(0.3, 0.3, 0.3),
        new THREE.Vector3(0.45, -6.8, 3.2),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2, 2, 2),
        4000
    );

    return (
        <div className={`scene spaceship`}>
            <SpaceBackground />
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <Spaceship ref={spaceshipRef} />
                <Earth />
            </Canvas>
        </div>
    );
};

export default SpaceshipScene;
