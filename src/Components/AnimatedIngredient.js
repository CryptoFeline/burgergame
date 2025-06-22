import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { Bun, Patty, Tomato, Onion, Cheese, Lettuce, TopBun } from "./Ingredients";
import bottomBunTexture from "../img/bottombun/topside.png";
import bottomBunSideTexture from "../img/bottombun/side.png";
import pattyFlatTexture from "../img/patty/flat.png";
import pattySideTexture from "../img/patty/side.png";
import tomatoFlatTexture from "../img/tomato/flat.png";
import onionFlatTexture from "../img/onion/flat.png";
import cheeseFlatTexture from "../img/cheese/flat.png";
import lettuceFlatTexture from "../img/lettuce/flat.png";
import topBunDomeTexture from "../img/topbun/dome.png";

// Shared texture configuration function
const configureTexture = (texture, rotation = 0, useDomeWrapping = false) => {
  if (texture) {
    if (useDomeWrapping) {
      // Special configuration for dome textures
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      // Rotate by 45 degrees to center texture on dome peak
      texture.rotation = Math.PI / 4;
      texture.center.set(0.5, 0.5);
    } else {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      texture.rotation = rotation;
    }
    texture.flipY = false;
    texture.needsUpdate = true;
  }
  return texture;
};

// This component renders the correct mesh for the ingredient, but without physics
export default function AnimatedIngredient({ ingredient, position }) {
  // Always call hooks at the top level
  const bunTopTextureBase = useLoader(TextureLoader, bottomBunTexture);
  const bunSideTextureBase = useLoader(TextureLoader, bottomBunSideTexture);
  const pattyFlatTextureBase = useLoader(TextureLoader, pattyFlatTexture);
  const pattySideTextureBase = useLoader(TextureLoader, pattySideTexture);
  const tomatoFlatTextureBase = useLoader(TextureLoader, tomatoFlatTexture);
  const onionFlatTextureBase = useLoader(TextureLoader, onionFlatTexture);
  const cheeseFlatTextureBase = useLoader(TextureLoader, cheeseFlatTexture);
  const lettuceFlatTextureBase = useLoader(TextureLoader, lettuceFlatTexture);
  const topBunDomeTextureBase = useLoader(TextureLoader, topBunDomeTexture);
  
  // Configure textures with useMemo
  const bunTopTexture = useMemo(() => {
    const tex = bunTopTextureBase.clone();
    return configureTexture(tex, 0);
  }, [bunTopTextureBase]);
  
  const bunSideTexture = useMemo(() => {
    const tex = bunSideTextureBase.clone();
    return configureTexture(tex, Math.PI);
  }, [bunSideTextureBase]);
  
  const pattyFlatTextureProcessed = useMemo(() => {
    const tex = pattyFlatTextureBase.clone();
    return configureTexture(tex, 0);
  }, [pattyFlatTextureBase]);
  
  const pattySideTextureProcessed = useMemo(() => {
    const tex = pattySideTextureBase.clone();
    return configureTexture(tex, 0);
  }, [pattySideTextureBase]);

  const tomatoFlatTextureProcessed = useMemo(() => {
    const tex = tomatoFlatTextureBase.clone();
    return configureTexture(tex, 0);
  }, [tomatoFlatTextureBase]);

  const onionFlatTextureProcessed = useMemo(() => {
    const tex = onionFlatTextureBase.clone();
    return configureTexture(tex, 0);
  }, [onionFlatTextureBase]);

  const cheeseFlatTextureProcessed = useMemo(() => {
    const tex = cheeseFlatTextureBase.clone();
    return configureTexture(tex, 0);
  }, [cheeseFlatTextureBase]);

  const lettuceFlatTextureProcessed = useMemo(() => {
    const tex = lettuceFlatTextureBase.clone();
    return configureTexture(tex, 0);
  }, [lettuceFlatTextureBase]);

  const topBunDomeTextureProcessed = useMemo(() => {
    const tex = topBunDomeTextureBase.clone();
    return configureTexture(tex, 0, true); // Use dome wrapping
  }, [topBunDomeTextureBase]);

  const bunTopTextureProcessed = useMemo(() => {
    const tex = bunTopTextureBase.clone();
    return configureTexture(tex, 0);
  }, [bunTopTextureBase]);

  if (!ingredient) return null;

  // Use the same geometry and textures as the physics-enabled ingredient, but no physics
  if (ingredient === Bun) {
    return (
      <group position={position}>
        {/* Main cylinder body with side texture */}
        <mesh>
          <cylinderGeometry args={[2.0, 2.0, 1, 32, 1, false]} />
          <meshStandardMaterial map={bunSideTexture} />
        </mesh>
        
        {/* Top face with texture */}
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={bunTopTexture} />
        </mesh>
        
        {/* Bottom face with solid color */}
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial color="#eec07a" />
        </mesh>
      </group>
    );
  }
  if (ingredient === TopBun) {
    return (
      <group position={position}>
        {/* Simplified dome using tapered cylinder with dome texture */}
        <mesh>
          <cylinderGeometry args={[1.8, 2.0, 1, 32]} />
          <meshStandardMaterial map={topBunDomeTextureProcessed} />
        </mesh>
        
        {/* Bottom face with bottom bun texture */}
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={bunTopTextureProcessed} />
        </mesh>
      </group>
    );
  }
  if (ingredient === Patty) {
    return (
      <group position={position}>
        {/* Main cylinder body with side texture - slightly shorter to avoid Z-fighting */}
        <mesh>
          <cylinderGeometry args={[2.0, 2.0, 0.64, 32, 1, false]} />
          <meshStandardMaterial map={pattySideTextureProcessed} />
        </mesh>
        
        {/* Top face with flat texture - positioned slightly above cylinder */}
        <mesh position={[0, 0.331, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={pattyFlatTextureProcessed} />
        </mesh>
        
        {/* Bottom face with flat texture - positioned slightly below cylinder */}
        <mesh position={[0, -0.331, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={pattyFlatTextureProcessed} />
        </mesh>
      </group>
    );
  }
  if (ingredient === Tomato) {
    return (
      <group position={position}>
        {/* Main cylinder body with side color */}
        <mesh>
          <cylinderGeometry args={[2.0, 2.0, 0.23, 32, 1, false]} />
          <meshStandardMaterial color="#872311" />
        </mesh>
        
        {/* Top face with flat texture */}
        <mesh position={[0, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={tomatoFlatTextureProcessed} />
        </mesh>
        
        {/* Bottom face with flat texture */}
        <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={tomatoFlatTextureProcessed} />
        </mesh>
      </group>
    );
  }
  if (ingredient === Onion) {
    return (
      <group position={position}>
        {/* Main cylinder body with side color */}
        <mesh>
          <cylinderGeometry args={[2.0, 2.0, 0.23, 32, 1, false]} />
          <meshStandardMaterial color="#E3D8B7" />
        </mesh>
        
        {/* Top face with flat texture */}
        <mesh position={[0, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={onionFlatTextureProcessed} />
        </mesh>
        
        {/* Bottom face with flat texture */}
        <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.0, 32]} />
          <meshStandardMaterial map={onionFlatTextureProcessed} />
        </mesh>
      </group>
    );
  }
  if (ingredient === Cheese) {
    return (
      <mesh position={position}>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial map={cheeseFlatTextureProcessed} />
      </mesh>
    );
  }
  if (ingredient === Lettuce) {
    // Lettuce: 8-sided regular cylinder with texture for flat surfaces
    const radius = 2.0;
    const sides = 8;
    return (
      <group position={position}>
        {/* Main cylinder body with side color */}
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.08, sides, 1, false]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>
        
        {/* Top face with flat texture */}
        <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={lettuceFlatTextureProcessed} />
        </mesh>
        
        {/* Bottom face with flat texture */}
        <mesh position={[0, -0.041, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={lettuceFlatTextureProcessed} />
        </mesh>
      </group>
    );
  }
  return null;
}
