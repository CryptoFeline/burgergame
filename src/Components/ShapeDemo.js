import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Demo component for top bun - half sphere flattened to match original height
const TopBun = ({ position, color = "#eec07a" }) => {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    // Create half sphere (top hemisphere only)
    const sphereGeometry = new THREE.SphereGeometry(
      1.5,    // radius 
      32,     // widthSegments
      16,     // heightSegments 
      0,      // phiStart
      Math.PI * 2,  // phiLength - full circle
      0,      // thetaStart - start from top
      Math.PI / 2   // thetaLength - only top half
    );

    // Scale it down vertically to match original bun height (0.75)
    // Since sphere radius is 1.5, half sphere height is 1.5
    // We want final height of 0.75, so scale Y by 0.75/1.5 = 0.5
    sphereGeometry.scale(1, 0.5, 1);

    // Add flat bottom cap
    const bottomCapGeometry = new THREE.CircleGeometry(1.5, 32);
    bottomCapGeometry.rotateX(Math.PI / 2); // Face up
    bottomCapGeometry.translate(0, -0.375, 0); // Bottom of flattened bun

    // Merge geometries
    const geometries = [sphereGeometry, bottomCapGeometry];
    const mergedGeometry = mergeBufferGeometries(geometries);
    
    setGeometry(mergedGeometry);
  }, []);

  // Rotate to see the shape better
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Demo component for bottom bun - same as top bun but flipped upside down
const BottomBun = ({ position, color = "#eec07a" }) => {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    // Create half sphere (top hemisphere only)
    const sphereGeometry = new THREE.SphereGeometry(
      1.5,    // radius 
      32,     // widthSegments
      16,     // heightSegments 
      0,      // phiStart
      Math.PI * 2,  // phiLength - full circle
      0,      // thetaStart - start from top
      Math.PI / 2   // thetaLength - only top half
    );

    // Scale it down vertically to match original bun height (0.75)
    sphereGeometry.scale(1, 0.5, 1);

    // For bottom bun, we want the flat part on top and dome on bottom
    // So we flip the sphere first
    sphereGeometry.rotateX(Math.PI);

    // Add flat top cap (after rotation, this will be the top)
    const topCapGeometry = new THREE.CircleGeometry(1.5, 32);
    topCapGeometry.rotateX(-Math.PI / 2); // Face down 
    topCapGeometry.translate(0, 0.375, 0); // Top of flipped bun

    // Merge geometries
    const geometries = [sphereGeometry, topCapGeometry];
    const mergedGeometry = mergeBufferGeometries(geometries);
    
    setGeometry(mergedGeometry);
  }, []);

  // Rotate to see the shape better
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Demo scene component
const ShapeDemo = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCameraPosition = () => {
    // Same as game camera logic
    if (windowSize.width < 700) {
      return [0, 3, 4];
    }
    return [0, 4, 4];
  };

  const getGameScale = () => {
    // Same as game scale logic
    if (windowSize.width < 700) {
      return 0.5;
    }
    return 1;
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
        Top & Bottom Bun Shape Demo
      </h1>
      
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        height: '80vh',
        gap: '20px'
      }}>
        {/* Top Bun Demo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>
            Top Bun (Domed)
          </h2>
          <div style={{ flex: 1, border: '2px solid #333' }}>
            <Canvas>
              <OrthographicCamera
                makeDefault
                left={-windowSize.width / 2}
                right={windowSize.width / 2}
                top={windowSize.height / 2}
                bottom={-windowSize.height / 2}
                near={-5}
                far={200}
                zoom={100}
                position={[0, getCameraPosition()[1], 4]}
                rotation={[-0.5, 0, 0]}
                lookAt={[0, 0, 0]}
              />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 20, 0]} intensity={0.6} />
              
              <group
                scale={getGameScale()}
                rotation={[0, Math.PI / 4, 0]}
                position={[0, 0, 0]}
              >
                {/* Show original cylinder for comparison */}
                <mesh position={[-2, 0, 0]}>
                  <cylinderGeometry args={[1.5, 1.5, 0.75, 32]} />
                  <meshStandardMaterial color="#eec07a" opacity={0.6} transparent />
                </mesh>
                
                {/* Show new top bun */}
                <TopBun position={[2, 0, 0]} />
              </group>
              
            </Canvas>
          </div>
          <p style={{ color: '#ccc', textAlign: 'center', margin: '10px', fontSize: '16px' }}>
            Left: Original Cylinder | Right: Domed Top Bun<br/>
            <span style={{ color: '#888', fontSize: '12px' }}>Rounded dome top, flat bottom for stacking</span>
          </p>
        </div>

        {/* Bottom Bun Demo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>
            Bottom Bun (Inverted Dome)
          </h2>
          <div style={{ flex: 1, border: '2px solid #333' }}>
            <Canvas>
              <OrthographicCamera
                makeDefault
                left={-windowSize.width / 2}
                right={windowSize.width / 2}
                top={windowSize.height / 2}
                bottom={-windowSize.height / 2}
                near={-5}
                far={200}
                zoom={100}
                position={[0, getCameraPosition()[1], 4]}
                rotation={[-0.5, 0, 0]}
                lookAt={[0, 0, 0]}
              />
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 20, 0]} intensity={0.6} />
              
              <group
                scale={getGameScale()}
                rotation={[0, Math.PI / 4, 0]}
                position={[0, 0, 0]}
              >
                {/* Show original cylinder for comparison */}
                <mesh position={[-2, 0, 0]}>
                  <cylinderGeometry args={[1.5, 1.5, 0.75, 32]} />
                  <meshStandardMaterial color="#d4a574" opacity={0.6} transparent />
                </mesh>
                
                {/* Show new bottom bun */}
                <BottomBun position={[2, 0, 0]} color="#d4a574" />
              </group>
              
            </Canvas>
          </div>
          <p style={{ color: '#ccc', textAlign: 'center', margin: '10px', fontSize: '16px' }}>
            Left: Original Cylinder | Right: Inverted Bottom Bun<br/>
            <span style={{ color: '#888', fontSize: '12px' }}>Flat top for stacking, curved bottom</span>
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Using the same camera angle and rotation as the burger game<br/>
          Top bun: dome up, flat down | Bottom bun: flat up, dome down
        </p>
      </div>
    </div>
  );
};

export default ShapeDemo;
