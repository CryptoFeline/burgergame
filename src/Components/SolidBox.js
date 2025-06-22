import { React } from "react";
import { useBox } from "@react-three/cannon";

export default function SolidBox({ xpos, zpos, height, width, depth, isBase, isDynamic }) {
    const [mySolidBox, api] = useBox(() => ({
        mass: isBase ? 0 : 2,
        position: [xpos, height, zpos],
        args: [width, 1, depth],
        type: isBase ? "Static" : (isDynamic ? "Dynamic" : "Static"),
    }));

    return (
        <mesh ref={mySolidBox} position={[xpos, height, zpos]}>
            <boxGeometry args={[width, 1, depth]} />
            <meshStandardMaterial color={`hsl(${200 + height * 4},100%,50%)`} />
        </mesh>
    );
}
