import React, { useEffect, useMemo } from 'react';
import { Clone, useGLTF, Stage } from '@react-three/drei';
import * as THREE from 'three';

const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255];
};

const Astronaut = ({ suitColor = "#ffffff", visColor = "#ffffff", ringsColor = "#ffffff", bpColor = "#ffffff", flatness = 7.0, horizontalPosition = 7.5, verticalPosition = 0.0, visTexture = '' }) => {
    const { scene } = useGLTF('/gltf/Astronaut.gltf') || {};

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
                } else if (child.name.includes('Rings')) {
                    child.material.color.setRGB(...hexToRgb(ringsColor));
                } else if (child.name.includes('Backpack')) {
                    child.material.color.setRGB(...hexToRgb(bpColor));
                }
            }
        };

        scene.traverse(applyMaterial);
    }, [scene, suitColor, visColor, ringsColor, bpColor, texture]);

    return (
        <Stage contactShadow shadows adjustCamera intensity={1} preset="rembrandt" environment="forest">
            <Clone object={scene} />
        </Stage>
    );
};

export default Astronaut;

useGLTF.preload('/gltf/Astronaut.gltf');
