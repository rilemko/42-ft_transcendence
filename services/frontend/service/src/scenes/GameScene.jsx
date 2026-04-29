import React, { useContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage } from '@react-three/drei';

import { GameContext } from '../contexts/GameContext';

import Camera from './Camera';
import Ball from '../assets/Ball';
import Board from '../assets/Board';
import PlayerOne from '../assets/PlayerOne';
import PlayerTwo from '../assets/PlayerTwo';

const GameScene = () => {

    const { cameraPosition, ballPosition, playerOnePosition, playerTwoPosition, paddleColor, ballColor, wallColor, floorColor, players} = useContext(GameContext);

    return (
        <Canvas style={{ touchAction: 'none' }} >
            <Camera position={cameraPosition} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
                <Stage contactShadow shadows adjustCamera intensity={1} preset="rembrandt" environment="forest">
                <Board
                    wallColor={wallColor}
                    floorColor={floorColor}
                />
                <Ball
                    position={ballPosition}
                    color={ballColor}
                />
                <PlayerOne
                    position={playerOnePosition}
                    suitColor={players[0]?.info.suitColor}
                    visColor={players[0]?.info.visColor}
                    ringsColor={players[0]?.info.ringsColor}
                    bpColor={players[0]?.info.bpColor}
                    paddleColor={paddleColor}
                    flatness={players[0]?.info.flatness}
                    horizontalPosition={players[0]?.info.horizontalPosition}
                    verticalPosition={players[0]?.info.verticalPosition}
                    visTexture={players[0]?.info.profile_picture_url}
                />
                <PlayerTwo
                    position={playerTwoPosition}
                    suitColor={players[1]?.info.suitColor}
                    visColor={players[1]?.info.visColor}
                    ringsColor={players[1]?.info.ringsColor}
                    bpColor={players[1]?.info.bpColor}
                    paddleColor={paddleColor}
                    flatness={players[1]?.info.flatness}
                    horizontalPosition={players[1]?.info.horizontalPosition}
                    verticalPosition={players[1]?.info.verticalPosition}
                    visTexture={players[1]?.info.profile_picture_url}
                />
            </Stage>
        </Canvas>
    );
};

export default GameScene;
