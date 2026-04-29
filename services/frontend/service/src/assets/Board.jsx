import React, { useEffect } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255];
};


const Board = ({ position = [0, 0, 0], wallColor = '#e48d2d', floorColor = '#ffffff' }) => {
    const { scene } = useGLTF('/gltf/Board.gltf') || {};

    useEffect(() => {
        const applyMaterial = (child) => {
            if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {
                if (child.name.includes('Floor')) {
                    child.material.color.setRGB(...hexToRgb(floorColor));
                } else if (child.name.includes('LWall') || child.name.includes('RWall')) {
                    child.material.color.setRGB(...hexToRgb(wallColor));
                }
            }
        };

        scene.traverse(applyMaterial);
    }, [scene, wallColor, floorColor]);

    return (
        <Clone object={scene} position={position} scale={[1, 1, 1]} />
    );

};

export default Board;

useGLTF.preload('/gltf/Board.gltf');
