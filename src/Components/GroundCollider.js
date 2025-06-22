import React, { useEffect } from "react";
import { useBox } from "@react-three/cannon";

const GroundCollider = ({ onCollision, yOffset = 0 }) => {
  const [ref, api] = useBox(() => ({
    position: [0, -10 - yOffset, 0], // Much lower, and follows tower offset
    args: [20, 0.1, 20], // Wide, thin ground plane
    type: "Static",
    material: {
      friction: 0,
      restitution: 0
    },
    onCollide: (e) => {
      // Only trigger if the colliding object has a physics body
      if (e.body && onCollision) {
        // Pass the entire collision event to help identify which mesh hit the ground
        onCollision(e);
      }
    }
  }));

  // Update position when yOffset changes
  useEffect(() => {
    api.position.set(0, -10 - yOffset, 0);
  }, [api, yOffset]);

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[20, 0.1, 20]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
};

export default GroundCollider;
