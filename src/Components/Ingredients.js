import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useBox, useCylinder } from "@react-three/cannon";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
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
const configureTexture = (texture, rotation = 0) => {
  if (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.flipY = false;
    texture.rotation = rotation;
    texture.needsUpdate = true;
  }
  return texture;
};

// Bun: base, thick, light brown, regular cylinder with large radius
export const Bun = ({ position, isStatic, id }) => {
  // Load textures at top level
  const topTextureBase = useLoader(TextureLoader, bottomBunTexture);
  const sideTextureBase = useLoader(TextureLoader, bottomBunSideTexture);
  
  // Configure textures with useMemo
  const topTexture = useMemo(() => {
    const tex = topTextureBase.clone();
    return configureTexture(tex, 0);
  }, [topTextureBase]);
  
  const sideTexture = useMemo(() => {
    const tex = sideTextureBase.clone();
    return configureTexture(tex, Math.PI); // 180 degree rotation
  }, [sideTextureBase]);

  const [ref] = useCylinder(() => ({
    mass: isStatic ? 0 : 2,
    position,
    args: [2.0, 2.0, 1, 32],
    type: isStatic ? "Static" : "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.8,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.4,
    angularDamping: 0.4,
    userData: { id: id || `bun-${Date.now()}` }
  }));

  return (
    <group ref={ref} position={position}>
      {/* Main cylinder body with side texture */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 1, 32, 1, false]} />
        <meshStandardMaterial map={sideTexture} />
      </mesh>
      
      {/* Top face with texture */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={topTexture} />
      </mesh>
      
      {/* Bottom face with solid color */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial color="#eec07a" />
      </mesh>
    </group>
  );
};
Bun.height = 1;
Bun.type = "bun";

// Patty: heavy, regular cylinder, dark brown
export const Patty = ({ position, id }) => {
  // Load textures at top level
  const flatTextureBase = useLoader(TextureLoader, pattyFlatTexture);
  const sideTextureBase = useLoader(TextureLoader, pattySideTexture);
  
  // Configure textures with useMemo
  const flatTexture = useMemo(() => {
    const tex = flatTextureBase.clone();
    return configureTexture(tex, 0);
  }, [flatTextureBase]);
  
  const sideTexture = useMemo(() => {
    const tex = sideTextureBase.clone();
    return configureTexture(tex, 0);
  }, [sideTextureBase]);

  const [ref] = useCylinder(() => ({
    mass: 8,
    position,
    args: [2.0, 2.0, 0.66, 32],
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.9,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.4,
    angularDamping: 0.4,
    userData: { id: id || `patty-${Date.now()}` }
  }));
  
  return (
    <group ref={ref} position={position}>
      {/* Main cylinder body with side texture - slightly shorter to avoid Z-fighting */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.64, 32, 1, false]} />
        <meshStandardMaterial map={sideTexture} />
      </mesh>
      
      {/* Top face with flat texture - positioned slightly above cylinder */}
      <mesh position={[0, 0.331, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
      
      {/* Bottom face with flat texture - positioned slightly below cylinder */}
      <mesh position={[0, -0.331, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
    </group>
  );
};
Patty.height = 0.66;
Patty.type = "patty";
Patty.rarity = 1.0; // 100% spawn chance (common)

// Tomato: medium heavy, thin, red, regular cylinder
export const Tomato = ({ position, id }) => {
  // Load texture for top and bottom faces
  const tomatoFlatTextureBase = useLoader(TextureLoader, tomatoFlatTexture);
  
  // Configure texture with useMemo
  const flatTexture = useMemo(() => {
    const tex = tomatoFlatTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [tomatoFlatTextureBase]);

  const [ref] = useCylinder(() => ({
    mass: 4,
    position,
    args: [2.0, 2.0, 0.25, 32],
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.95,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.6,
    angularDamping: 0.6,
    userData: { id: id || `tomato-${Date.now()}` }
  }));
  
  return (
    <group ref={ref} position={position}>
      {/* Main cylinder body with side color */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.23, 32, 1, false]} />
        <meshStandardMaterial color="#872311" />
      </mesh>
      
      {/* Top face with flat texture */}
      <mesh position={[0, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
      
      {/* Bottom face with flat texture */}
      <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
    </group>
  );
};
Tomato.height = 0.25;
Tomato.type = "tomato";
Tomato.rarity = 0.8; // 80% spawn chance (common)

// Onion: medium heavy, thin, dirty white, regular cylinder
export const Onion = ({ position, id }) => {
  // Load texture for top and bottom faces
  const onionFlatTextureBase = useLoader(TextureLoader, onionFlatTexture);
  
  // Configure texture with useMemo
  const flatTexture = useMemo(() => {
    const tex = onionFlatTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [onionFlatTextureBase]);

  const [ref] = useCylinder(() => ({
    mass: 4,
    position,
    args: [2.0, 2.0, 0.25, 32],
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.95,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.6,
    angularDamping: 0.6,
    userData: { id: id || `onion-${Date.now()}` }
  }));
  
  return (
    <group ref={ref} position={position}>
      {/* Main cylinder body with side color */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.23, 32, 1, false]} />
        <meshStandardMaterial color="#E3D8B7" />
      </mesh>
      
      {/* Top face with flat texture */}
      <mesh position={[0, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
      
      {/* Bottom face with flat texture */}
      <mesh position={[0, -0.126, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
    </group>
  );
};
Onion.height = 0.25;
Onion.type = "onion";
Onion.rarity = 0.8; // 80% spawn chance (common)

// Cheese: light, box, thin, yellow - STICKY ingredient
export const Cheese = ({ position, id, onCollide }) => {
  const [isMelting, setIsMelting] = useState(false);
  
  // Load texture for the cheese
  const cheeseFlatTextureBase = useLoader(TextureLoader, cheeseFlatTexture);
  
  // Configure texture with useMemo
  const flatTexture = useMemo(() => {
    const tex = cheeseFlatTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [cheeseFlatTextureBase]);

  // Enhanced collision handler that triggers melting visual effect
  const handleCollision = useCallback((e) => {
    console.log('🧀 Cheese collision detected!', { 
      target: e.target?.userData?.id || 'unknown',
      body: e.body?.userData?.id || 'unknown'
    });
    
    // Trigger melting visual effect
    setIsMelting(true);
    console.log('🔥 Cheese is now melting!');
    
    // Call the parent collision handler if provided
    if (onCollide) {
      onCollide(e);
    }
    
    // Reset melting effect after some time
    setTimeout(() => {
      setIsMelting(false);
      console.log('❄️ Cheese melting effect ended');
    }, 3000); // Melting effect lasts 3 seconds
  }, [onCollide]);

  const [ref] = useBox(() => ({
    mass: 1,
    position,
    args: [3, 0.1, 3],
    type: "Dynamic",
    onCollide: handleCollision,       // Use enhanced collision handler
    material: { 
      restitution: 0,           // No bounce - cheese sticks
      friction: 3.0,            // Very high friction - melted cheese is sticky
      frictionEquationStiffness: 1e9,  // Higher stiffness for better sticking
      frictionEquationRelaxation: 2,   // Lower relaxation for stronger grip
      contactEquationStiffness: 1e9,
      contactEquationRelaxation: 2
    },
    linearDamping: 0.9,         // High damping - cheese doesn't slide much
    angularDamping: 0.9,        // High angular damping - less spinning
    userData: { 
      id: id || `cheese-${Date.now()}`,
      isSticky: true,           // Mark cheese as sticky ingredient
      stickyStrength: 1.0       // How strongly it sticks (0-1)
    }
  }));
  
  // Dynamic material that changes when melting
  const cheeseColor = isMelting ? "#FFD700" : "#FFF8DC"; // Gold when melting, cream when normal
  const emissive = isMelting ? "#FF6600" : "#000000"; // Orange glow when melting
  const emissiveIntensity = isMelting ? 0.3 : 0;
  
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[3, 0.1, 3]} />
      <meshStandardMaterial 
        map={flatTexture} 
        color={cheeseColor}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent={isMelting}
        opacity={isMelting ? 0.8 : 1.0}
      />
    </mesh>
  );
};
Cheese.height = 0.1;
Cheese.type = "cheese";
Cheese.rarity = 0.6; // 60% spawn chance (common)
Cheese.isSticky = true;  // Mark cheese as sticky for gameplay mechanics

// Lettuce: light, 8-sided green cylinder, as thin as cheese - MILDLY STICKY ingredient
export const Lettuce = ({ position, id, onCollide }) => {
  const [isSticking, setIsSticking] = useState(false);
  
  // Load texture for top and bottom faces
  const lettuceFlatTextureBase = useLoader(TextureLoader, lettuceFlatTexture);
  
  // Configure texture with useMemo
  const flatTexture = useMemo(() => {
    const tex = lettuceFlatTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [lettuceFlatTextureBase]);

  // Enhanced collision handler for mild stickiness
  const handleCollision = useCallback((e) => {
    console.log('🥬 Lettuce collision detected!', { 
      target: e.target?.userData?.id || 'unknown',
      body: e.body?.userData?.id || 'unknown'
    });
    
    // Trigger mild sticking visual effect
    setIsSticking(true);
    console.log('🌿 Lettuce is sticking slightly!');
    
    // Call the parent collision handler if provided
    if (onCollide) {
      onCollide(e);
    }
    
    // Reset sticking effect after shorter time than cheese
    setTimeout(() => {
      setIsSticking(false);
      console.log('🌱 Lettuce sticking effect ended');
    }, 1500); // Shorter effect than cheese
  }, [onCollide]);

  const [ref] = useCylinder(() => ({
    mass: 1,
    position,
    args: [2.0, 2.0, 0.1, 8],
    type: "Dynamic",
    onCollide: handleCollision,
    material: { 
      restitution: 0.1,      // Reduced bounce for slight stickiness
      friction: 2.5,         // Increased friction
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.8,      // Slightly higher damping
    angularDamping: 0.8,
    userData: { 
      id: id || `lettuce-${Date.now()}`,
      isSticky: true,        // Mark lettuce as mildly sticky
      stickyStrength: 0.3    // Much weaker than cheese (0.3 vs 1.0)
    }
  }));
  
  // Dynamic material that changes when sticking (subtle effect for lettuce)
  const lettuceColor = isSticking ? "#66BB6A" : "#4CAF50"; // Slightly brighter green when sticking
  const emissive = isSticking ? "#2E7D32" : "#000000"; // Subtle green glow when sticking
  const emissiveIntensity = isSticking ? 0.1 : 0; // Much subtler than cheese
  
  return (
    <group ref={ref} position={position}>
      {/* Main cylinder body with side color */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.08, 8, 1, false]} />
        <meshStandardMaterial 
          color={lettuceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Top face with flat texture */}
      <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 8]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
      
      {/* Bottom face with flat texture */}
      <mesh position={[0, -0.041, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 8]} />
        <meshStandardMaterial map={flatTexture} />
      </mesh>
    </group>
  );
};
Lettuce.height = 0.1;
Lettuce.type = "lettuce";
Lettuce.rarity = 0.7; // 70% spawn chance (common)

// TopBun: domed top bun with realistic half-sphere shape
export const TopBun = ({ position, isStatic, id }) => {
  const [geometry, setGeometry] = useState(null);

  // Load textures
  const domeTextureBase = useLoader(TextureLoader, topBunDomeTexture);
  const bottomTextureBase = useLoader(TextureLoader, bottomBunTexture);
  
  // Configure textures with useMemo
  const domeTexture = useMemo(() => {
    const tex = domeTextureBase.clone();
    if (tex) {
      // Use ClampToEdgeWrapping for better edge handling with triangle texture
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1);
      tex.offset.set(0, 0);
      tex.rotation = 0;
      tex.center.set(0.5, 0.5);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [domeTextureBase]);

  const bottomTexture = useMemo(() => {
    const tex = bottomTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [bottomTextureBase]);

  // Physics hook must run first - don't conditionally return null before this
  const [ref] = useCylinder(() => ({
    mass: isStatic ? 0 : 2,
    position: [position[0], position[1] + 0.25, position[2]], // Offset physics shape up by half its height
    args: [2.0, 2.0, 0.5, 32], // Reduced height from 1.0 to 0.5 to match visual
    type: isStatic ? "Static" : "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.8,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.4,
    angularDamping: 0.4,
    userData: { id: id || `topbun-${Date.now()}` }
  }));

  // Create the domed geometry
  useEffect(() => {
    // Create half sphere (top hemisphere only)
    const sphereGeometry = new THREE.SphereGeometry(
      2.0,    // radius to match other ingredients
      32,     // widthSegments
      16,     // heightSegments 
      0,      // phiStart
      Math.PI * 2,  // phiLength - full circle
      0,      // thetaStart - start from top
      Math.PI / 2   // thetaLength - only top half
    );

    // Scale it down vertically to match original bun height (1.0)
    sphereGeometry.scale(1, 0.5, 1);

    // Create custom UV mapping for triangle texture
    const positions = sphereGeometry.attributes.position;
    const uvs = new Float32Array(positions.count * 2);
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Convert 3D position to planar UV coordinates
      // Map the dome to a circular area that uses the triangle texture better
      const distance = Math.sqrt(x * x + z * z) / 2.0; // Distance from center (0-1)
      const angle = Math.atan2(z, x); // Angle around center
      
      // Map to UV coordinates in a way that uses the triangle texture area
      // Instead of sphere mapping, use a radial projection
      const u = 0.5 + (distance * Math.cos(angle)) * 0.5; // X projection to UV
      const v = 0.5 + (distance * Math.sin(angle)) * 0.5; // Y projection to UV
      
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
    
    sphereGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    setGeometry(sphereGeometry);
  }, []);

  // Render with fallback geometry while custom geometry loads
  return (
    <group ref={ref} position={position}>
      {/* Domed top with dome texture */}
      <mesh geometry={geometry || undefined} rotation={[0, Math.PI, 0]}>
        {!geometry && <cylinderGeometry args={[2.0, 2.0, 1, 32]} />}
        <meshStandardMaterial map={domeTexture} />
      </mesh>
      
      {/* Bottom face with bottom bun texture */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={bottomTexture} />
      </mesh>
    </group>
  );
};
TopBun.height = 0.5; // Updated to match actual visual height (half-sphere scaled to 0.5)
TopBun.type = "topbun";

// SAUCE INGREDIENTS - Based on tomato/onion flat cylinder shape but smaller and stickier

// Ketchup: Red sauce, very sticky
export const Ketchup = ({ position, id, onCollide }) => {
  const [isSticking, setIsSticking] = useState(false);
  
  // Load ketchup texture
  const ketchupTextureBase = useLoader(TextureLoader, ketchupTexture);
  
  // Configure texture
  const flatTexture = useMemo(() => {
    const tex = ketchupTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [ketchupTextureBase]);

  // Enhanced collision handler for maximum stickiness
  const handleCollision = useCallback((e) => {
    console.log('🍅 Ketchup collision detected!');
    setIsSticking(true);
    if (onCollide) onCollide(e);
    setTimeout(() => setIsSticking(false), 2000);
  }, [onCollide]);

  const [ref] = useCylinder(() => ({
    mass: 2, // Lighter than tomato (4)
    position,
    args: [2.0, 2.0, 0.15, 32], // Same radius as tomato/onion (2.0), thinner (0.15 vs 0.25)
    type: "Dynamic",
    onCollide: handleCollision,
    material: {
      restitution: 0,           // No bounce at all
      friction: 4.0,            // Much higher than tomato (0.95)
      frictionEquationStiffness: 1e10,
      frictionEquationRelaxation: 1,
      contactEquationStiffness: 1e10,
      contactEquationRelaxation: 1
    },
    linearDamping: 0.95,        // Much higher than tomato (0.6)
    angularDamping: 0.95,
    userData: { 
      id: id || `ketchup-${Date.now()}`,
      isSticky: true,
      stickyStrength: 1.0
    }
  }));
  
  // Dynamic visual effects
  const sauceColor = isSticking ? "#7B1F10" : "#7B1F10";
  const emissive = isSticking ? "#5A0000" : "#000000";
  const emissiveIntensity = isSticking ? 0.2 : 0;
  
  return (
    <group ref={ref} position={position}>
      {/* Main cylinder body with side color */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.13, 32, 1, false]} />
        <meshStandardMaterial 
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Top face with sauce texture */}
      <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      
      {/* Bottom face with sauce texture */}
      <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
};
Ketchup.height = 0.15;
Ketchup.type = "ketchup";
Ketchup.rarity = 0.15; // 15% spawn chance (rare)

// Mayo: White sauce, extremely sticky
export const Mayo = ({ position, id, onCollide }) => {
  const [isSticking, setIsSticking] = useState(false);
  
  const mayoTextureBase = useLoader(TextureLoader, mayoTexture);
  
  const flatTexture = useMemo(() => {
    const tex = mayoTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [mayoTextureBase]);

  const handleCollision = useCallback((e) => {
    console.log('🤍 Mayo collision detected!');
    setIsSticking(true);
    if (onCollide) onCollide(e);
    setTimeout(() => setIsSticking(false), 2500);
  }, [onCollide]);

  const [ref] = useCylinder(() => ({
    mass: 1.8,
    position,
    args: [2.0, 2.0, 0.15, 32],
    type: "Dynamic",
    onCollide: handleCollision,
    material: {
      restitution: 0,
      friction: 5.0,            // Even higher friction
      frictionEquationStiffness: 1e10,
      frictionEquationRelaxation: 1,
      contactEquationStiffness: 1e10,
      contactEquationRelaxation: 1
    },
    linearDamping: 0.98,        // Extremely high damping
    angularDamping: 0.98,
    userData: { 
      id: id || `mayo-${Date.now()}`,
      isSticky: true,
      stickyStrength: 1.2
    }
  }));
  
  const sauceColor = isSticking ? "#DDCC9F" : "#DDCC9F";
  const emissive = isSticking ? "#C8B082" : "#000000";
  const emissiveIntensity = isSticking ? 0.15 : 0;
  
  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.13, 32, 1, false]} />
        <meshStandardMaterial 
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
};
Mayo.height = 0.15;
Mayo.type = "mayo";
Mayo.rarity = 0.15; // 15% spawn chance (rare)

// Mustard: Yellow sauce, moderately sticky
export const Mustard = ({ position, id, onCollide }) => {
  const [isSticking, setIsSticking] = useState(false);
  
  const mustardTextureBase = useLoader(TextureLoader, mustardTexture);
  
  const flatTexture = useMemo(() => {
    const tex = mustardTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [mustardTextureBase]);

  const handleCollision = useCallback((e) => {
    console.log('💛 Mustard collision detected!');
    setIsSticking(true);
    if (onCollide) onCollide(e);
    setTimeout(() => setIsSticking(false), 1500);
  }, [onCollide]);

  const [ref] = useCylinder(() => ({
    mass: 2.2,
    position,
    args: [2.0, 2.0, 0.15, 32],
    type: "Dynamic",
    onCollide: handleCollision,
    material: {
      restitution: 0,
      friction: 3.0,            // Moderate stickiness
      frictionEquationStiffness: 1e9,
      frictionEquationRelaxation: 2,
      contactEquationStiffness: 1e9,
      contactEquationRelaxation: 2
    },
    linearDamping: 0.85,
    angularDamping: 0.85,
    userData: { 
      id: id || `mustard-${Date.now()}`,
      isSticky: true,
      stickyStrength: 0.7
    }
  }));
  
  const sauceColor = isSticking ? "#C08A2F" : "#C08A2F";
  const emissive = isSticking ? "#B8791F" : "#000000";
  const emissiveIntensity = isSticking ? 0.1 : 0;
  
  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.13, 32, 1, false]} />
        <meshStandardMaterial 
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
};
Mustard.height = 0.15;
Mustard.type = "mustard";
Mustard.rarity = 0.15; // 15% spawn chance (rare)

// BBQ: Dark brown sauce, very sticky
export const BBQ = ({ position, id, onCollide }) => {
  const [isSticking, setIsSticking] = useState(false);
  
  const bbqTextureBase = useLoader(TextureLoader, bbqTexture);
  
  const flatTexture = useMemo(() => {
    const tex = bbqTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [bbqTextureBase]);

  const handleCollision = useCallback((e) => {
    console.log('🟤 BBQ sauce collision detected!');
    setIsSticking(true);
    if (onCollide) onCollide(e);
    setTimeout(() => setIsSticking(false), 2200);
  }, [onCollide]);

  const [ref] = useCylinder(() => ({
    mass: 2,
    position,
    args: [2.0, 2.0, 0.15, 32],
    type: "Dynamic",
    onCollide: handleCollision,
    material: {
      restitution: 0,
      friction: 4.5,            // High stickiness
      frictionEquationStiffness: 1e10,
      frictionEquationRelaxation: 1,
      contactEquationStiffness: 1e10,
      contactEquationRelaxation: 1
    },
    linearDamping: 0.92,
    angularDamping: 0.92,
    userData: { 
      id: id || `bbq-${Date.now()}`,
      isSticky: true,
      stickyStrength: 1.1
    }
  }));
  
  const sauceColor = isSticking ? "#200D03" : "#200D03";
  const emissive = isSticking ? "#1A0802" : "#000000";
  const emissiveIntensity = isSticking ? 0.18 : 0;
  
  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.13, 32, 1, false]} />
        <meshStandardMaterial 
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
};
BBQ.height = 0.15;
BBQ.type = "bbq";
BBQ.rarity = 0.10; // 10% spawn chance (very rare)

// Ranch: Light green sauce, sticky
export const Ranch = ({ position, id, onCollide }) => {
  const [isSticking, setIsSticking] = useState(false);
  
  const ranchTextureBase = useLoader(TextureLoader, ranchTexture);
  
  const flatTexture = useMemo(() => {
    const tex = ranchTextureBase.clone();
    if (tex) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.flipY = false;
      tex.needsUpdate = true;
    }
    return tex;
  }, [ranchTextureBase]);

  const handleCollision = useCallback((e) => {
    console.log('🥗 Ranch collision detected!');
    setIsSticking(true);
    if (onCollide) onCollide(e);
    setTimeout(() => setIsSticking(false), 1800);
  }, [onCollide]);

  const [ref] = useCylinder(() => ({
    mass: 2,
    position,
    args: [2.0, 2.0, 0.15, 32],
    type: "Dynamic",
    onCollide: handleCollision,
    material: {
      restitution: 0,
      friction: 3.5,            // Good stickiness
      frictionEquationStiffness: 1e9,
      frictionEquationRelaxation: 1,
      contactEquationStiffness: 1e9,
      contactEquationRelaxation: 1
    },
    linearDamping: 0.88,
    angularDamping: 0.88,
    userData: { 
      id: id || `ranch-${Date.now()}`,
      isSticky: true,
      stickyStrength: 0.9
    }
  }));
  
  const sauceColor = isSticking ? "#D1C699" : "#D1C699";
  const emissive = isSticking ? "#C5BA88" : "#000000";
  const emissiveIntensity = isSticking ? 0.12 : 0;
  
  return (
    <group ref={ref} position={position}>
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.13, 32, 1, false]} />
        <meshStandardMaterial 
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, 0.066, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
      <mesh position={[0, -0.066, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial 
          map={flatTexture}
          color={sauceColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
};
Ranch.height = 0.15;
Ranch.type = "ranch";
Ranch.rarity = 0.10; // 10% spawn chance (very rare)

export const INGREDIENTS = [Patty, Tomato, Onion, Cheese, Lettuce, Ketchup, Mayo, Mustard, BBQ, Ranch];

// Weighted random selection based on ingredient rarity
export const getRandomIngredient = () => {
  // Create a pool of ingredients based on their rarity weights
  const weightedPool = [];
  
  INGREDIENTS.forEach(ingredient => {
    const weight = Math.round((ingredient.rarity || 1.0) * 100); // Convert to integer weight
    for (let i = 0; i < weight; i++) {
      weightedPool.push(ingredient);
    }
  });
  
  // Pick a random ingredient from the weighted pool
  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex];
};
