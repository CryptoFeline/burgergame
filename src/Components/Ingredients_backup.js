import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox, useCylinder, useConvexPolyhedron } from "@react-three/cannon";
import * as THREE from "three";

// Ground collision detection hook
const useGroundCollision = (ref, enablePhysics, onGroundHit) => {
  const positionRef = useRef();
  const hasHitGround = useRef(false);

  useEffect(() => {
    if (enablePhysics && ref.current) {
      const unsubscribe = ref.current.api.position.subscribe((pos) => {
        positionRef.current = pos;
      });
      return unsubscribe;
    }
  }, [enablePhysics, ref]);

  useFrame(() => {
    if (enablePhysics && positionRef.current && onGroundHit && !hasHitGround.current) {
      const groundLevel = -2;
      if (positionRef.current[1] <= groundLevel) {
        hasHitGround.current = true;
        onGroundHit();
      }
    }
  });
};

// Onion: light, thin, pale white, regular cylinder
export const Onion = ({ position, onGroundHit, enablePhysics = false }) => {
  const [ref] = useCylinder(() => ({
    mass: 2, // Light
    position,
    args: [2.0, 2.0, 0.25, 32], // Regular cylinder, same radius as bun
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.95, // Higher friction for thin objects
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.6, // Higher damping for thin objects
    angularDamping: 0.6,
  }));

  useGroundCollision(ref, enablePhysics, onGroundHit);lyhedron } from "@react-three/cannon";
import * as THREE from "three";

// Ground collision detection hook
const useGroundCollision = (ref, enablePhysics, onGroundHit) => {
  const positionRef = useRef();
  const hasHitGround = useRef(false);

  useEffect(() => {
    if (enablePhysics && ref.current) {
      const unsubscribe = ref.current.api.position.subscribe((pos) => {
        positionRef.current = pos;
      });
      return unsubscribe;
    }
  }, [enablePhysics, ref]);

  useFrame(() => {
    if (enablePhysics && positionRef.current && onGroundHit && !hasHitGround.current) {
      const groundLevel = -2;
      if (positionRef.current[1] <= groundLevel) {
        hasHitGround.current = true;
        onGroundHit();
      }
    }
  });
};

// Bun: base, thick, light brown, regular cylinder with large radius
export const Bun = ({ position, isStatic, onGroundHit, enablePhysics = false }) => {
  const [ref] = useCylinder(() => ({
    mass: isStatic ? 0 : 2,
    position,
    args: [2.0, 2.0, 1, 32], // Regular cylinder, keep large radius
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
  }));

  useGroundCollision(ref, enablePhysics, onGroundHit);
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[2.0, 2.0, 1, 32]} />
      <meshStandardMaterial color="#eec07a" />
    </mesh>
  );
};
Bun.height = 1;
Bun.type = "bun";

// Patty: heavy, regular cylinder, dark brown
export const Patty = ({ position, onGroundHit, enablePhysics = false }) => {
  const [ref] = useCylinder(() => ({
    mass: 8, // Heavy
    position,
    args: [2.0, 2.0, 0.66, 32], // Regular cylinder, same radius as bun
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
  }));

  useGroundCollision(ref, enablePhysics, onGroundHit);
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[2.0, 2.0, 0.66, 32]} />
      <meshStandardMaterial color="#6b3e26" />
    </mesh>
  );
};
Patty.height = 0.66;
Patty.type = "patty";

// Tomato: medium heavy, thin, red, regular cylinder
export const Tomato = ({ position, onGroundHit, enablePhysics = false }) => {
  const [ref] = useCylinder(() => ({
    mass: 4, // Medium heavy
    position,
    args: [2.0, 2.0, 0.25, 32], // Regular cylinder, same radius as bun
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.95, // Higher friction for thin objects
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.6, // Higher damping for thin objects
    angularDamping: 0.6,
  }));

  useGroundCollision(ref, enablePhysics, onGroundHit);
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[2.0, 2.0, 0.25, 32]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
  );
};
Tomato.height = 0.25;
Tomato.type = "tomato";

// Onion: medium heavy, thin, dirty white, regular cylinder
export const Onion = ({ position }) => {
  const [ref] = useCylinder(() => ({
    mass: 4, // Medium heavy
    position,
    args: [2.0, 2.0, 0.25, 32], // Regular cylinder, same radius as bun
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 0.95, // Higher friction for thin objects
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.6, // Higher damping for thin objects
    angularDamping: 0.6,
  }));
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[2.0, 2.0, 0.25, 32]} />
      <meshStandardMaterial color="#f8f4e3" />
    </mesh>
  );
};
Onion.height = 0.25;
Onion.type = "onion";

// Cheese: light, box, thin, yellow
export const Cheese = ({ position }) => {
  const [ref] = useBox(() => ({
    mass: 1, // Light
    position,
    args: [3, 0.1, 3],
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 1.0, // Very high friction for ultra-thin objects
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.7, // Very high damping for ultra-thin objects
    angularDamping: 0.7,
  }));
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[3, 0.1, 3]} />
      <meshStandardMaterial color="#ffe066" />
    </mesh>
  );
};
Cheese.height = 0.1;
Cheese.type = "cheese";

// Lettuce: light, special 8-sided green cylinder, as thin as cheese
export const Lettuce = ({ position }) => {
  const radius = 2.0;
  const height = 0.1; // Made as thin as cheese
  const sides = 8;
  const [ref] = useCylinder(() => ({
    mass: 1, // Light
    position,
    args: [radius, radius, height, sides], // Regular cylinder
    type: "Dynamic",
    material: { 
      restitution: 0,
      friction: 1.0, // Very high friction for ultra-thin objects
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 3,
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3
    },
    linearDamping: 0.7, // Very high damping for ultra-thin objects
    angularDamping: 0.7,
  }));
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[radius, radius, height, sides]} />
      <meshStandardMaterial color="#4caf50" />
    </mesh>
  );
};
Lettuce.height = 0.1;
Lettuce.type = "lettuce";

// TopBun: dome-shaped top bun, light brown, tapered cylinder for dome effect
export const TopBun = ({ position, isStatic }) => {
  const [ref] = useCylinder(() => ({
    mass: isStatic ? 0 : 2,
    position,
    args: [1.8, 2.0, 1, 32], // Tapered for dome shape - smaller top, larger bottom
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
  }));
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[1.8, 2.0, 1, 32]} />
      <meshStandardMaterial color="#eec07a" />
    </mesh>
  );
};
TopBun.height = 1;
TopBun.type = "topbun";

export const INGREDIENTS = [Patty, Tomato, Onion, Cheese, Lettuce];
