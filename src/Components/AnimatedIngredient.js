import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { Bun, Patty, Tomato, Onion, Cheese, Lettuce, TopBun, Ketchup, Mayo, Mustard, BBQ, Ranch } from "./Ingredients";
import bottomBunTexture from "../img/bottombun/topside.webp";
import bottomBunSideTexture from "../img/bottombun/side.webp";
import pattyFlatTexture from "../img/patty/flat.webp";
import pattySideTexture from "../img/patty/side.webp";
import tomatoFlatTexture from "../img/tomato/flat.webp";
import onionFlatTexture from "../img/onion/flat.webp";
import cheeseFlatTexture from "../img/cheese/flat.webp";
import lettuceFlatTexture from "../img/lettuce/flat.webp";
import topBunDomeTexture from "../img/topbun/dome.webp";

// Sauce textures
import ketchupTexture from "../img/sauces/ketchup.webp";
import mayoTexture from "../img/sauces/mayo.webp";
import mustardTexture from "../img/sauces/mustard.webp";
import bbqTexture from "../img/sauces/bbq.webp";
import ranchTexture from "../img/sauces/ranch.webp";

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
  
  // Load sauce textures
  const ketchupTextureBase = useLoader(TextureLoader, ketchupTexture);
  const mayoTextureBase = useLoader(TextureLoader, mayoTexture);
  const mustardTextureBase = useLoader(TextureLoader, mustardTexture);
  const bbqTextureBase = useLoader(TextureLoader, bbqTexture);
  const ranchTextureBase = useLoader(TextureLoader, ranchTexture);
  
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

  // Process all sauce textures at the top level to avoid hooks violations
  const ketchupFlatTextureProcessed = useMemo(() => {
    const tex = ketchupTextureBase.clone();
    return configureTexture(tex, 0);
  }, [ketchupTextureBase]);

  const mayoFlatTextureProcessed = useMemo(() => {
    const tex = mayoTextureBase.clone();
    return configureTexture(tex, 0);
  }, [mayoTextureBase]);

  const mustardFlatTextureProcessed = useMemo(() => {
    const tex = mustardTextureBase.clone();
    return configureTexture(tex, 0);
  }, [mustardTextureBase]);

  const bbqFlatTextureProcessed = useMemo(() => {
    const tex = bbqTextureBase.clone();
    return configureTexture(tex, 0);
  }, [bbqTextureBase]);

  const ranchFlatTextureProcessed = useMemo(() => {
    const tex = ranchTextureBase.clone();
    return configureTexture(tex, 0);
  }, [ranchTextureBase]);

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
  // SAUCE ANIMATIONS - Using tomato/onion flat cylinder pattern but smaller

  // Ketchup Animation
  if (ingredient === Ketchup) {
    const radius = 2.0; // Same as tomato/onion (2.0)
    const sides = 32;
    return (
      <group position={position}>
        {/* Main cylinder body with sauce color */}
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.13, sides, 1, false]} />
          <meshStandardMaterial color="#7B1F10" />
        </mesh>
        
        {/* Top face with sauce texture */}
        <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={ketchupFlatTextureProcessed} color="#7B1F10" />
        </mesh>
        
        {/* Bottom face with sauce texture */}
        <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={ketchupFlatTextureProcessed} color="#7B1F10" />
        </mesh>
      </group>
    );
  }

  // Mayo Animation
  if (ingredient === Mayo) {
    const radius = 2.0;
    const sides = 32;
    return (
      <group position={position}>
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.13, sides, 1, false]} />
          <meshStandardMaterial color="#DDCC9F" />
        </mesh>
        <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={mayoFlatTextureProcessed} color="#DDCC9F" />
        </mesh>
        <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={mayoFlatTextureProcessed} color="#DDCC9F" />
        </mesh>
      </group>
    );
  }

  // Mustard Animation
  if (ingredient === Mustard) {
    const radius = 2.0;
    const sides = 32;
    return (
      <group position={position}>
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.13, sides, 1, false]} />
          <meshStandardMaterial color="#C08A2F" />
        </mesh>
        <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={mustardFlatTextureProcessed} color="#C08A2F" />
        </mesh>
        <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={mustardFlatTextureProcessed} color="#C08A2F" />
        </mesh>
      </group>
    );
  }

  // BBQ Animation
  if (ingredient === BBQ) {
    const radius = 2.0;
    const sides = 32;
    return (
      <group position={position}>
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.13, sides, 1, false]} />
          <meshStandardMaterial color="#4A1A0A" />
        </mesh>
        <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={bbqFlatTextureProcessed} color="#4A1A0A" />
        </mesh>
        <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={bbqFlatTextureProcessed} color="#4A1A0A" />
        </mesh>
      </group>
    );
  }

  // Ranch Animation
  if (ingredient === Ranch) {
    const radius = 2.0;
    const sides = 32;
    return (
      <group position={position}>
        <mesh>
          <cylinderGeometry args={[radius, radius, 0.13, sides, 1, false]} />
          <meshStandardMaterial color="#D1C699" />
        </mesh>
        <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={ranchFlatTextureProcessed} color="#D1C699" />
        </mesh>
        <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radius, sides]} />
          <meshStandardMaterial map={ranchFlatTextureProcessed} color="#D1C699" />
        </mesh>
      </group>
    );
  }

  return null;
}
