import { React, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import BoxModel from "./Components/BoxModel";
import Screen from "./Components/Screen";
import HeartIcon from "./Components/HeartIcon";
import GroundCollider from "./Components/GroundCollider";
import { Physics } from "@react-three/cannon";
import { nanoid } from "nanoid";
import { Bun, TopBun, INGREDIENTS } from "./Components/Ingredients";

function App() {
    const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
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

    const [stack, setStack] = useState([
        { x: 0, z: 0, y: 0, ingredient: Bun },
    ]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [lives, setLives] = useState(3); // Add lives system
    const [score, setScore] = useState(0); // Add score system
    const [BGColor, setBGColor] = useState("#000");
    const [topBoxPosition, setTopBoxPosition] = useState({
        x: 0,
        y: 0,
        z: 0,
    });
    const [activeBox, setActiveBox] = useState(null); // Track the current moving block
    const [fallenBlocks, setFallenBlocks] = useState([]); // Track fallen blocks
    const [towerYOffset, setTowerYOffset] = useState(0); // Track how much the entire tower has moved down
    const [successfulDrops, setSuccessfulDrops] = useState(0); // Count successful drops for scoring
    const [collisionBodies, setCollisionBodies] = useState(new Set()); // Track bodies that have collided

    const width = window.innerWidth;
    const height = window.innerHeight;

    // How high above the stack the animated mesh and placed mesh should appear
    const ANIMATION_DROP_HEIGHT = 2; // units above the stack

    const handleClick = () => {
        if (gameStarted && activeBox && !gamePaused && !gameFinished) {
            let Ingredient = activeBox.ingredient;
            let height = Ingredient.height;
            
            // Create unique ID for this drop
            const dropId = `drop-${Date.now()}-${Math.random()}`;
            
            // Drop the ingredient from its current animated position (let physics handle the fall)
            let droppedBox = {
                x: topBoxPosition.x,
                z: topBoxPosition.z,
                y: topBoxPosition.y, // Use the current animated position
                ingredient: Ingredient,
                id: dropId, // Use unique ID
            };
            
            // Add to falling blocks - physics will determine if it lands properly
            setFallenBlocks([...fallenBlocks, droppedBox]);
            
            // Score +1 will be added only if the mesh doesn't fall to the ground
            // This happens after a delay to check if mesh lands properly
            setTimeout(() => {
                // Check if this mesh still exists (hasn't fallen)
                setFallenBlocks(current => {
                    const meshStillExists = current.some(block => block.id === dropId);
                    if (meshStillExists) {
                        // Mesh landed successfully, add score
                        setScore(prev => prev + 1);
                        setSuccessfulDrops(prev => prev + 1);
                    }
                    return current;
                });
            }, 2000); // Give physics time to settle
            
            // Move the base Bun down by the height of the dropped ingredient
            setTowerYOffset(towerYOffset + height);
            
            setActiveBox(null);
            
            // Generate the next box after a delay
            setTimeout(() => {
                generateBox();
            }, 1000); // Give physics time to settle
        }
    };

    useEffect(() => {
        let bg = "#000";
        if (successfulDrops > 3) {
            bg = "#10122b";
        }
        if (successfulDrops > 10) {
            bg = "#24003b";
        }
        if (successfulDrops > 20) {
            bg = "#2b0125";
        }
        if (successfulDrops > 30) {
            bg = "#360113";
        }
        if (successfulDrops > 40) {
            bg = "#400000";
        }
        if (BGColor !== bg) {
            setBGColor(bg);
        }
        //eslint-disable-next-line
    }, [successfulDrops]);

    const generateBox = () => {
        // Don't generate new boxes if game is paused or finished (but allow if game is started)
        if (gamePaused || gameFinished) {
            return;
        }
        
        // Pick a random ingredient except Bun
        const Ingredient = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
        setActiveBox({ ingredient: Ingredient });
    };

    // Ground collision detection for lives system
    const onGroundCollision = (e) => {
        // Get the ID from the colliding body's userData
        const collidingId = e.body?.userData?.id;
        
        if (!collidingId) {
            return; // No ID found, skip
        }
        
        // Prevent multiple collisions from the same body
        if (collisionBodies.has(collidingId)) {
            return;
        }
        
        // Mark this body as having collided
        setCollisionBodies(prev => new Set([...prev, collidingId]));
        
        // Find and remove the specific colliding mesh
        setFallenBlocks(prev => {
            const collidedBlock = prev.find(block => block.id === collidingId);
            if (!collidedBlock) {
                return prev; // Block not found
            }
            
            // Lose a life for the mesh that hit the ground
            setLives(current => {
                const newLives = current - 1;
                if (newLives <= 0) {
                    // Game over - no lives left
                    setGameFinished(true);
                    setGameStarted(false);
                    setActiveBox(null); // Stop any active box
                }
                return newLives;
            });
            
            // Remove ONLY the specific colliding mesh
            return prev.filter(block => block.id !== collidingId);
        });
        
        // Clean up the collision tracking for this block after a delay
        setTimeout(() => {
            setCollisionBodies(prev => {
                const newSet = new Set(prev);
                newSet.delete(collidingId);
                return newSet;
            });
        }, 500);
    };

    const renderBoxes = () => {
        return stack.map((box, index) => {
            let key = nanoid();
            if (index === 0) {
                // Base block is static Bun - move it down by towerYOffset
                return (
                    <Bun key={key} position={[box.x, box.y - towerYOffset, box.z]} isStatic={true} id="base-bun" />
                );
            } else {
                // Other blocks in stack should keep their original positions (no towerYOffset)
                // In the new physics approach, most blocks should be in fallenBlocks instead
                const Ingredient = box.ingredient;
                return (
                    <Ingredient key={key} position={[box.x, box.y, box.z]} />
                );
            }
        });
    };

    const renderActiveBox = () => {
        if (!activeBox) {
            return null;
        }
        let prev = stack[stack.length - 1];
        // Guard against empty stack (e.g., on game over)
        if (!prev) {
            return null;
        }
        let animate = true;
        let direction = stack.length % 2 === 0 ? "left" : "right";
        let Ingredient = activeBox.ingredient;
        // Place the animated block well above the top of the previous stacked mesh
        // Use the original stack position (before tower offset) to keep animation at consistent height
        let y = prev.y + (prev.ingredient.height || 0) / 2 + Ingredient.height / 2 + ANIMATION_DROP_HEIGHT;
        return (
            <BoxModel
                key={"active"}
                xpos={prev.x}
                zpos={prev.z}
                animate={animate}
                height={y}
                direction={direction}
                gameStarted={gameStarted}
                crossedLimit={() => crossedLimit()}
                updatePosition={setTopBoxPosition}
                ingredient={Ingredient}
            />
        );
    };

    const handlePause = () => {
        if (gameFinished) {
            // Restart the game
            startNewGame();
        } else {
            // Stop the game immediately and show game over screen
            setGamePaused(true);
            setGameFinished(true);
            setGameStarted(false);
            setActiveBox(null);
            
            // Drop the top bun from above the tower
            let topBunHeight = TopBun.height;
            let stackHeight = successfulDrops > 0 ? (successfulDrops * 0.5) + towerYOffset : towerYOffset; // Estimate tower height
            
            let topBunBox = {
                x: 0,
                z: 0,
                y: stackHeight + topBunHeight + ANIMATION_DROP_HEIGHT + 2, // Drop from well above
                ingredient: TopBun,
                id: `topbun-stop-${Date.now()}`,
            };
            
            // Add top bun to falling blocks
            setFallenBlocks(prev => [...prev, topBunBox]);
            
            // Move the base Bun down by the height of the top bun
            setTowerYOffset(towerYOffset + topBunHeight);
        }
    };

    const startNewGame = () => {
        console.log("Starting new game...");
        
        // Reset all game state first
        setGamePaused(false);
        setGameFinished(false);
        setGameStarted(false); // Set to false first to clear state
        setActiveBox(null);
        setFallenBlocks([]);
        setCollisionBodies(new Set());
        
        // Reset game variables
        setStack([{ x: 0, z: 0, y: 0, ingredient: Bun }]);
        setLives(3);
        setScore(0);
        setTowerYOffset(0);
        setSuccessfulDrops(0);
        setBGColor("#000");
        
        // Start the game and generate first box with a single timeout
        setTimeout(() => {
            console.log("Setting game started to true and generating box...");
            setGameStarted(true);
            
            // Generate box immediately after setting game started
            const Ingredient = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
            setActiveBox({ ingredient: Ingredient });
        }, 300); // Increased delay to ensure all state updates
    };

    const renderFallenBlocks = () => {
        return fallenBlocks.map((box) => {
            const Ingredient = box.ingredient;
            const key = box.id || `fallen-${Date.now()}-${Math.random()}`;
            return (
                <Ingredient
                    key={key}
                    position={[box.x, box.y, box.z]}
                    id={box.id} // Pass the ID to the ingredient
                />
            );
        });
    };

    const crossedLimit = () => {
        // When the active box crosses the limit, lose a life
        if (lives > 1) {
            setLives(prev => prev - 1);
            console.log(`Block crossed limit! Lives remaining: ${lives - 1}`);
        } else {
            // Game over - no lives left
            setLives(0);
            setGameFinished(true);
            setGameStarted(false);
            console.log("Game Over - No lives remaining!");
        }
    };

    const getCameraPosition = () => {
        // Keep camera at a fixed position since we want the base to sink down
        // instead of the camera following the tower up
        if (windowSize.width < 700) {
            return [0, 3, 4];
        }
        return [0, 4, 4];
    };

    const getGameScale = () => {
        if (windowSize.width < 700) {
            return 0.5;
        }
        return 1;
    };

    return (
        <>
            <div className="app-wrapper" style={{ backgroundColor: BGColor }}>
                {(!gameStarted || gameFinished) && (
                    <Screen score={score} startGame={startNewGame} isGameOver={gameFinished} />
                )}
                <Canvas onClick={() => handleClick()}>
                    <OrthographicCamera
                        makeDefault
                        left={-width / 2}
                        right={width / 2}
                        top={height / 2}
                        bottom={-height / 2}
                        near={-5}
                        far={200}
                        zoom={100}
                        position={[0, getCameraPosition()[1], 4]}
                        rotation={[-0.5, 0, 0]}
                        lookAt={[0, 0, 0]}
                    />
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 20, 0]} intensity={0.6} />
                    <Physics defaultContactMaterial={{ restitution: 0.02 }}>
                        <group
                            scale={getGameScale()}
                            rotation={[0, Math.PI / 4, 0]}
                            position={[0, 0, 0]}
                        >
                            {renderBoxes()}
                            {renderActiveBox()}
                            {renderFallenBlocks()}
                        </group>
                        {/* Ground collision detector - moves with tower */}
                        <GroundCollider onCollision={onGroundCollision} yOffset={towerYOffset} />
                    </Physics>
                </Canvas>
                
                {/* UI Elements - only show when game is started and not finished */}
                {gameStarted && !gameFinished && (
                    <>
                        {/* Score Display - Top Left */}
                        <div className="score-display">
                            <div className="score-label">SCORE</div>
                            <div className="score-value">{score}</div>
                        </div>
                        
                        {/* Lives Display - Top Center */}
                        <div className="lives-display">
                            {[1, 2, 3].map(heartNum => (
                                <HeartIcon 
                                    key={heartNum}
                                    filled={heartNum <= lives}
                                    size={32}
                                />
                            ))}
                        </div>
                        
                        {/* Stop Button - Top Right */}
                        <button 
                            onClick={handlePause}
                            className="stop-button"
                        >
                            {gameFinished ? 'New Game' : 'Stop'}
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

export default App;
