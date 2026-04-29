import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255];
};

const PlayerTwo = ({ position = [0, 0, 0], suitColor = "#ffffff", visColor = "#ffffff", ringsColor = "#ffffff", bpColor = "#ffffff", paddleColor = '#ffffff', flatness = 7.0, horizontalPosition = 7.5, verticalPosition = 0.0, visTexture = '' }) => {
    const { scene } = useGLTF('/gltf/PlayerTwo.gltf') || {};

    const ref = useRef();
    const targetPos = new THREE.Vector3(...position);

    const texture = useMemo(() => {
        if (visTexture) {
            const textureLoader = new THREE.TextureLoader();
            return textureLoader.load(visTexture, (texture) => {
                texture.repeat.set(2, flatness);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.rotation = -Math.PI / 2;
                texture.center.set(0.5, 0.5);
                texture.offset.set(horizontalPosition / 10, verticalPosition / 10);
            });
        }
    }, [visTexture, flatness, horizontalPosition, verticalPosition]);

    useEffect(() => {
        const applyMaterial = (child) => {
            if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {
                if (child.name.includes('Suit')) {
                    child.material.color.setRGB(...hexToRgb(suitColor));
                } else if (child.name.includes('Visor')) {
                    if (texture) {
                        child.material.map = texture;
                        child.material.needsUpdate = true;
                        child.material.metalness = 0;
                        child.material.roughness = 1;
                    }
                    child.material.color.setRGB(...hexToRgb(visColor));
                } else if (child.name.includes('Rings1') || child.name.includes('Rings2')) {
                    child.material.color.setRGB(...hexToRgb(ringsColor));
                } else if (child.name.includes('Backpack')) {
                    child.material.color.setRGB(...hexToRgb(bpColor));
                } else if (child.name.includes('Paddle')) {
                    child.material.color.setRGB(...hexToRgb(paddleColor));
                }
            }
        };

        scene.traverse(applyMaterial);
    }, [scene, suitColor, visColor, ringsColor, bpColor, texture]);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.copy(targetPos);
        }
    });

    return (
        <primitive ref={ref} object={scene} position={position} />
    );
};

export default PlayerTwo;

useGLTF.preload('/gltf/PlayerTwo.gltf');
