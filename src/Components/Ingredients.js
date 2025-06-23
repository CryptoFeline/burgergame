import React, { useEffect, useState, useMemo } from "react";
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

// Cheese: light, box, thin, yellow
export const Cheese = ({ position, id }) => {
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

  const [ref] = useBox(() => ({
    mass: 1,
    position,
    args: [3, 0.1, 3],
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 1.0,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.7,
    angularDamping: 0.7,
    userData: { id: id || `cheese-${Date.now()}` }
  }));
  
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[3, 0.1, 3]} />
      <meshStandardMaterial map={flatTexture} />
    </mesh>
  );
};
Cheese.height = 0.1;
Cheese.type = "cheese";

// Lettuce: light, 8-sided green cylinder, as thin as cheese
export const Lettuce = ({ position, id }) => {
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

  const [ref] = useCylinder(() => ({
    mass: 1,
    position,
    args: [2.0, 2.0, 0.1, 8],
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 1.0,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.7,
    angularDamping: 0.7,
    userData: { id: id || `lettuce-${Date.now()}` }
  }));
  
  return (
    <group ref={ref} position={position}>
      {/* Main cylinder body with side color */}
      <mesh>
        <cylinderGeometry args={[2.0, 2.0, 0.08, 8, 1, false]} />
        <meshStandardMaterial color="#4caf50" />
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
    position,
    args: [2.0, 2.0, 1, 32], // Physics shape uses cylinder for stability
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
TopBun.height = 1;
TopBun.type = "topbun";

export const INGREDIENTS = [Patty, Tomato, Onion, Cheese, Lettuce];
