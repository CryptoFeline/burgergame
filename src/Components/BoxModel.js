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

    useEffect(() => {
        const tl = gsap.timeline();
        if (myBox && animate && !animationStarted) {
            if (direction === "left") {
                setAnimationStarted(true);
                tl.fromTo(
                    myBox.current.position,
                    {
                        z: -boundary,
                    },
                    {
                        z: boundary + 2,
                        duration: getDifficulty(),
                        ease: "linear",
                    }
                );
            } else if (direction === "right") {
                setAnimationStarted(true);
                tl.fromTo(
                    myBox.current.position,
                    {
                        x: boundary,
                    },
                    {
                        x: -(boundary + 2),
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
        if (gameStarted && animate) {
            if (crossed()) {
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
            if (myBox.current.position.z > boundary) {
                return true;
            }
        } else if (direction === "right") {
            if (myBox.current.position.x < -boundary) {
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
