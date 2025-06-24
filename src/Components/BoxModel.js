import { React, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import AnimatedIngredient from "./AnimatedIngredient";

export default function BoxModel({
    xpos,
    zpos,
    height,
    animate,
    direction,
    ingredient,
    crossedLimit,
    updatePosition,
    gameStarted,
}) {
    const boundary = 15;
    const myBox = useRef();
    const [animationStarted, setAnimationStarted] = useState(false);
    const [hasCrossedLimit, setHasCrossedLimit] = useState(false);

    useEffect(() => {
        const tl = gsap.timeline();
        if (myBox && animate && !animationStarted) {
            if (direction === "left") {
                setAnimationStarted(true);
                // Move from viewer's top-left (corrected Z coordinate)
                // Start from top-left, move to bottom-right
                tl.fromTo(
                    myBox.current.position,
                    {
                        x: boundary * 0.2,
                        z: -boundary * 0.6,
                    },
                    {
                        x: -boundary * 0.2,
                        z: boundary * 0.6,
                        duration: getDifficulty(),
                        ease: "linear",
                    }
                );
            } else if (direction === "right") {
                setAnimationStarted(true);
                // Move from viewer's top-right (more balanced angle)
                // Emphasize coming from the right side more than diagonal
                tl.fromTo(
                    myBox.current.position,
                    {
                        x: boundary * 0.6,
                        z: -boundary * 0.2,
                    },
                    {
                        x: -boundary * 0.6,
                        z: boundary * 0.2,
                        duration: getDifficulty(),
                        ease: "linear",
                    }
                );
            }
        }
        return () => {
            tl.kill();
        };
        //eslint-disable-next-line
    }, [myBox, animate]);

    useFrame(() => {
        if (gameStarted && animate && !hasCrossedLimit) {
            if (crossed()) {
                setHasCrossedLimit(true); // Prevent multiple calls
                crossedLimit();
            } else {
                updatePosition({
                    x: myBox.current.position.x,
                    y: myBox.current.position.y,
                    z: myBox.current.position.z,
                });
            }
        }
    });

    const getDifficulty = () => {
        return 5.5 - height / 9.75;
    };

    const crossed = () => {
        if (direction === "left") {
            // For left direction, animation ends at x: -boundary * 0.2, z: boundary * 0.6
            // Check if reached or passed the end position
            if (myBox.current.position.x <= -boundary * 0.15 || myBox.current.position.z >= boundary * 0.55) {
                return true;
            }
        } else if (direction === "right") {
            // For right direction, animation ends at x: -boundary * 0.6, z: boundary * 0.2
            // Check if reached or passed the end position
            if (myBox.current.position.x <= -boundary * 0.55 || myBox.current.position.z >= boundary * 0.15) {
                return true;
            }
        }
        return false;
    };

    // Render the animated ingredient mesh at the animated position
    return (
        <group ref={myBox} position={[xpos, height, zpos]}>
            <AnimatedIngredient ingredient={ingredient} position={[0, 0, 0]} />
        </group>
    );
}
