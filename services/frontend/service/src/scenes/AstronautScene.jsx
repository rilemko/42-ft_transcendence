import React, { useContext } from 'react';
import { PresentationControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { UserContext } from '../contexts/UserContext';

import Astronaut from '../assets/Astronaut';

const AstronautScene = () => {

    const { bpColor, ringsColor, suitColor, visColor, flatness, horizontalPosition, verticalPosition, profilePicture } = useContext(UserContext);

    return (
        <Canvas style={{ touchAction: 'none' }} >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
            <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
                <Astronaut
                    suitColor={suitColor}
                    visColor={visColor}
                    ringsColor={ringsColor}
                    bpColor={bpColor}
                    flatness={flatness}
                    horizontalPosition={horizontalPosition}
                    verticalPosition={verticalPosition}
                    visTexture={profilePicture}
                />
            </PresentationControls>
        </Canvas>
    );
};

export default AstronautScene;
