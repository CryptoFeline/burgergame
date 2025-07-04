import { React, useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import BoxModel from "./Components/BoxModel";
import Screen from "./Components/Screen";
import HeartIcon from "./Components/HeartIcon";
import MuteButton from "./Components/MuteButton";
import Preloader from "./Components/Preloader";
import GroundCollider from "./Components/GroundCollider";
import { Physics } from "@react-three/cannon";
import { nanoid } from "nanoid";
import { Bun, TopBun, getRandomIngredient } from "./Components/Ingredients";
import { useAudio } from "./hooks/useAudio";
import { usePreloader } from "./hooks/usePreloader";
import { useTelegramGame } from "./hooks/useTelegramGame";

// Global storage for Telegram game context
let gameContext = null;

// Function to store game context when game launches
window.storeGameContext = function(context) {
    console.log('📦 Storing game context:', context);
    gameContext = context;
};

// Function to get stored game context
window.getGameContext = function() {
    return gameContext;
};

function App() {
    // Preloader system
    const { isLoading, progress } = usePreloader();
    
    // Telegram integration
    const { 
        isTelegramEnvironment, 
        telegramUser, 
        isReady: telegramReady, 
        reportScore,
        showAlert 
    } = useTelegramGame();
    
    // Audio system
    const { isMuted, toggleMute, playSound, startBackgroundMusic, stopBackgroundMusic } = useAudio();
    
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
    const [spawnCounter, setSpawnCounter] = useState(0); // Track spawns for alternating directions
    const [collisionBodies, setCollisionBodies] = useState(new Set()); // Track bodies that have collided
    const [stickyJoints, setStickyJoints] = useState(new Map()); // Track sticky connections between ingredients
    
    // Ref to capture score at the moment of life loss (to avoid race conditions)
    const scoreAtLifeLoss = useRef(null);

    const width = window.innerWidth;
    const height = window.innerHeight;

    // How high above the stack the animated mesh and placed mesh should appear
    const ANIMATION_DROP_HEIGHT = 2; // units above the stack

    const handleClick = () => {
        if (gameStarted && activeBox && !gamePaused && !gameFinished) {
            // Play drop sound
            playSound('drop');
            
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
            
            // Play impact sound immediately for better feedback
            // (We'll play it regardless of whether it lands successfully)
            setTimeout(() => {
                playSound('impact');
            }, 750); // Half second longer delay to sync with visual impact
            
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
    }, [successfulDrops, BGColor]);

    const generateBox = () => {
        // Don't generate new boxes if game is paused or finished (but allow if game is started)
        if (gamePaused || gameFinished) {
            return;
        }
        
        // Play ingredient spawn sound
        playSound('ingredientSpawn');
        
        // Pick a random ingredient based on rarity weights
        const Ingredient = getRandomIngredient();
        setActiveBox({ ingredient: Ingredient });
        
        // Increment spawn counter for alternating directions
        setSpawnCounter(prev => prev + 1);
    };

    // Ground collision detection for lives system
    const onGroundCollision = (e) => {
        // Skip if game is finished or paused to prevent post-game effects
        if (gameFinished || gamePaused) {
            console.log('⏸️ Game over - ignoring ground collision effects');
            return;
        }
        
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
                
                // Deduct 1 point from score when life is lost (ingredient fell after hitting tower)
                setScore(prevScore => {
                    const newScore = Math.max(0, prevScore - 1); // Don't go below 0
                    console.log('💔 Score deducted for life loss! Score before:', prevScore, 'Score after:', newScore);
                    
                    // Capture score for final life loss (after deduction)
                    if (newLives <= 0) {
                        scoreAtLifeLoss.current = newScore;
                        console.log('💔 FINAL LIFE LOST - Captured score after deduction:', newScore);
                    }
                    
                    return newScore;
                });
                
                // Play life loss sound
                playSound('lifeInteloss');
                
                console.log('💔 Life lost! Lives before:', current, 'Lives after:', newLives);
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

    // Handle collisions between ingredients for sticky behavior
    const handleIngredientCollision = useCallback((e) => {
        console.log('🔍 Ingredient collision event received:', e);
        
        const bodyA = e.body;
        const bodyB = e.target;
        
        console.log('🔍 Collision bodies:', { 
            bodyA: bodyA?.userData?.id || 'unknown',
            bodyAType: bodyA?.userData?.type || 'unknown',
            bodyB: bodyB?.userData?.id || 'unknown',
            bodyBType: bodyB?.userData?.type || 'unknown'
        });
        
        // Get ingredient data from collision bodies
        const ingredientA = bodyA?.userData;
        const ingredientB = bodyB?.userData;
        
        if (!ingredientA || !ingredientB) {
            console.log('⚠️ Missing ingredient data, skipping collision');
            return;
        }
        
        // Check if either ingredient is sticky (cheese)
        const stickyIngredient = ingredientA.isSticky ? ingredientA : (ingredientB.isSticky ? ingredientB : null);
        const otherIngredient = ingredientA.isSticky ? ingredientB : ingredientA;
        const stickyBody = ingredientA.isSticky ? bodyA : bodyB;
        const otherBody = ingredientA.isSticky ? bodyB : bodyA;
        
        if (stickyIngredient && otherIngredient && !gameFinished && !gamePaused) {
            console.log('🧀 STICKY COLLISION:', stickyIngredient.id, 'melting onto', otherIngredient.id);
            
            // Create a unique connection key
            const jointKey = `${stickyIngredient.id}-${otherIngredient.id}`;
            
            // Check if this connection already exists to avoid duplicate effects
            if (stickyJoints.has(jointKey)) {
                return;
            }
            
            // Apply realistic melting/sticking physics based on ingredient strength
            const stickyStrength = stickyIngredient.stickyStrength || 1.0;
            const meltingForce = 2.0 + (stickyStrength * 2.0); // 2.0-4.0 range
            const dampingForce = 0.8 + (stickyStrength * 0.15); // 0.8-0.95 range
            
            console.log('🔧 Applying sticky physics:', { stickyStrength, meltingForce, dampingForce });
            
            // Apply downward "melting/sticking" force and reduce movement
            stickyBody.applyImpulse([0, -meltingForce, 0], [0, 0, 0]);
            
            // Adjust damping based on stickiness strength
            stickyBody.linearDamping = dampingForce;
            stickyBody.angularDamping = dampingForce;
            
            // Adjust mass based on stickiness (cheese gets lighter, lettuce stays normal)
            if (stickyStrength > 0.8) {
                stickyBody.mass = 0.5; // Only for very sticky ingredients like cheese
            }
            
            // Set friction based on stickiness strength
            const frictionLevel = 2.0 + (stickyStrength * 3.0); // 2.0-5.0 range
            stickyBody.material.friction = frictionLevel;
            stickyBody.material.frictionEquationStiffness = 1e9 * stickyStrength;
            
            // Store the sticky connection with enhanced properties
            setStickyJoints(prev => {
                const newJoints = new Map(prev);
                newJoints.set(jointKey, {
                    stickyId: stickyIngredient.id,
                    otherId: otherIngredient.id,
                    stickyBody: stickyBody,
                    otherBody: otherBody,
                    timestamp: Date.now(),
                    strength: stickyIngredient.stickyStrength || 1.0
                });
                return newJoints;
            });
            
            // Play a special sticky/melting sound effect
            playSound('impact'); // Could add a special "sizzle" sound for melting cheese
            
            // Apply ongoing sticky forces to maintain connection
            const maintainStickiness = () => {
                if (gameFinished || gamePaused) return;
                
                // Get current positions
                const stickyPos = stickyBody.position;
                const otherPos = otherBody.position;
                
                // Calculate distance and direction
                const dx = otherPos.x - stickyPos.x;
                const dy = otherPos.y - stickyPos.y;
                const dz = otherPos.z - stickyPos.z;
                const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                // If ingredients are separating, apply attractive force (cheese stretching)
                if (distance > 0.5) { // Only if they're getting too far apart
                    const attractiveForce = 2.0;
                    const normalizedForce = attractiveForce / Math.max(distance, 0.1);
                    
                    stickyBody.applyForce([
                        dx * normalizedForce,
                        dy * normalizedForce * 0.5, // Less upward pull, more lateral
                        dz * normalizedForce
                    ], [0, 0, 0]);
                }
            };
            
            // Set up periodic force application to maintain stickiness
            const stickyInterval = setInterval(maintainStickiness, 100); // Every 100ms
            
            // Clean up interval after some time or when game ends
            setTimeout(() => {
                clearInterval(stickyInterval);
            }, 10000); // Stop after 10 seconds
        }
    }, [gameFinished, gamePaused, playSound, stickyJoints]);

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
        let direction = spawnCounter % 2 === 0 ? "left" : "right";
        console.log(`Spawn counter: ${spawnCounter}, Direction: ${direction}`); // Debug log
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
        console.log('🔘 STOP/PAUSE BUTTON CLICKED');
        console.log('🔍 Current game state:');
        console.log('  - gameFinished:', gameFinished);
        console.log('  - gameStarted:', gameStarted);
        console.log('  - score:', score);
        console.log('  - successfulDrops:', successfulDrops);
        
        if (gameFinished) {
            // Restart the game
            console.log('🔄 Game already finished - restarting game');
            startNewGame();
        } else {
            // Stop the game immediately and show game over screen
            console.log('🎮 GAME OVER SCENARIO: Stop button pressed during active game');
            console.log('⏹️ STOPPING ACTIVE GAME - should trigger handleGameOver()');
            playSound('gameOver');
            stopBackgroundMusic();
            
            // If there's an active ingredient spawning/moving, drop it immediately
            if (activeBox) {
                // Play drop sound for the active ingredient
                playSound('drop');
                
                let Ingredient = activeBox.ingredient;
                let height = Ingredient.height;
                
                // Create unique ID for this drop
                const dropId = `stop-drop-${Date.now()}-${Math.random()}`;
                
                // Drop the ingredient from its current animated position
                let droppedBox = {
                    x: topBoxPosition.x,
                    z: topBoxPosition.z,
                    y: topBoxPosition.y,
                    ingredient: Ingredient,
                    id: dropId,
                };
                
                // Add to falling blocks
                setFallenBlocks(prev => [...prev, droppedBox]);
                
                // Clear the active box to make the animated ingredient disappear
                setActiveBox(null);
                
                // Play impact sound for the dropped ingredient
                setTimeout(() => {
                    playSound('impact');
                }, 750);
                
                // Move the base Bun down by the height of the dropped ingredient
                setTowerYOffset(current => current + height);
            }
            
            setGamePaused(true);
            handleGameOver();
            
            // Drop the top bun from above the tower (no spawn sound)
            let topBunHeight = TopBun.height;
            let stackHeight = successfulDrops > 0 ? (successfulDrops * 0.5) + towerYOffset : towerYOffset; // Estimate tower height
            
            let topBunBox = {
                x: 0,
                z: 0,
                y: stackHeight + topBunHeight + ANIMATION_DROP_HEIGHT + 2, // Drop from well above
                ingredient: TopBun,
                id: `topbun-stop-${Date.now()}`,
            };
            
            // Add top bun to falling blocks (no spawn sound for top bun)
            setFallenBlocks(prev => [...prev, topBunBox]);
            
            // Move the base Bun down by the height of the top bun
            setTowerYOffset(current => current + topBunHeight);
        }
    };

    const startNewGame = () => {
        console.log("Starting new game...");
        
        // Stop any playing audio
        stopBackgroundMusic();
        
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
        setSpawnCounter(0); // Reset spawn counter for alternating directions
        setBGColor("#000");
        
        // Clear captured score from previous game
        scoreAtLifeLoss.current = null;
        
        // Start the game immediately - no session refresh needed
        // The original session from game launch supports multiple score submissions
        startGameAfterSessionSetup();
    };

    // Helper function to start the game after session setup is complete
    const startGameAfterSessionSetup = () => {
        // Start the game and generate first box with a single timeout
        setTimeout(() => {
            console.log("Setting game started to true and generating box...");
            setGameStarted(true);
            
            // Start background music
            startBackgroundMusic();
            
            // Generate box immediately after setting game started
            const Ingredient = getRandomIngredient();
            setActiveBox({ ingredient: Ingredient });
            setSpawnCounter(1); // Set to 1 for the first spawn
        }, 300); // Increased delay to ensure all state updates
    };

    const renderFallenBlocks = () => {
        return fallenBlocks.map((box) => {
            const Ingredient = box.ingredient;
            const key = box.id || `fallen-${Date.now()}-${Math.random()}`;
            
            // Pass collision handler to sticky ingredients (like cheese)
            const ingredientProps = {
                key,
                position: [box.x, box.y, box.z],
                id: box.id
            };
            
            // Add collision handler for sticky ingredients
            if (Ingredient.type === 'cheese' || Ingredient.type === 'lettuce' || 
                Ingredient.type === 'ketchup' || Ingredient.type === 'mayo' || 
                Ingredient.type === 'mustard' || Ingredient.type === 'bbq' || 
                Ingredient.type === 'ranch') {
                ingredientProps.onCollide = handleIngredientCollision;
            }
            
            return <Ingredient {...ingredientProps} />;
        });
    };

    const crossedLimit = () => {
        // Prevent multiple calls if game is already finished
        if (gameFinished || gamePaused) {
            console.log("crossedLimit called but game already finished/paused");
            return;
        }
        
        console.log('🎮 GAME OVER SCENARIO: Animation crossed limit');
        console.log('📊 Current state - gameFinished:', gameFinished, 'gamePaused:', gamePaused);
        
        // Drop active ingredient if there is one (similar to stop button behavior)
        if (activeBox) {
            console.log('🎯 Dropping active ingredient on animation overflow');
            playSound('drop');
            
            let Ingredient = activeBox.ingredient;
            let height = Ingredient.height;
            
            // Create unique ID for this drop
            const dropId = `overflow-drop-${Date.now()}-${Math.random()}`;
            
            // Drop the ingredient from its current animated position
            let droppedBox = {
                x: topBoxPosition.x,
                z: topBoxPosition.z,
                y: topBoxPosition.y,
                ingredient: Ingredient,
                id: dropId,
            };
            
            // Add to falling blocks
            setFallenBlocks(prev => [...prev, droppedBox]);
            
            // Clear the active box to make the animated ingredient disappear
            setActiveBox(null);
            
            // Play impact sound for the dropped ingredient
            setTimeout(() => {
                playSound('impact');
            }, 750);
            
            // Move the base Bun down by the height of the dropped ingredient
            setTowerYOffset(current => current + height);
        }
        
        // Set lives to 0 - this will trigger the useEffect to call handleGameOver()
        setLives(0);
        
        // Drop the top bun from above the tower to complete the burger
        let topBunHeight = TopBun.height;
        let stackHeight = successfulDrops > 0 ? (successfulDrops * 0.5) + towerYOffset : towerYOffset;
        
        let topBunBox = {
            x: 0,
            z: 0,
            y: stackHeight + topBunHeight + ANIMATION_DROP_HEIGHT + 2,
            ingredient: TopBun,
            id: `topbun-crossed-${Date.now()}`,
        };
        
        // Add top bun to falling blocks
        setFallenBlocks(prev => [...prev, topBunBox]);
        
        // Move the base Bun down by the height of the top bun
        setTowerYOffset(current => current + topBunHeight);
        
        // Mark that we've already handled the top bun drop for this game over
        setGameFinished(true);
    };

    // Handle game over and report score to Telegram
    const handleGameOver = useCallback(async (scoreOverride = null) => {
        // Play audio and stop music
        playSound('gameOver');
        stopBackgroundMusic();
        
        // Use provided score or fall back to current state
        const finalScore = scoreOverride !== null ? scoreOverride : score;
        
        console.log('🎮 GAME OVER TRIGGERED!');
        console.log('📊 Final Score:', finalScore);
        console.log('📊 Score Override:', scoreOverride);
        console.log('📊 State Score:', score);
        console.log('📊 Successful Drops:', successfulDrops);
        console.log('🔍 Environment Check:');
        console.log('  - isTelegramEnvironment:', isTelegramEnvironment);
        console.log('  - telegramReady:', telegramReady);
        console.log('  - window.TelegramGameProxy:', !!window.TelegramGameProxy);
        console.log('  - typeof window.TelegramGameProxy.postScore:', typeof window.TelegramGameProxy?.postScore);
        console.log('  - Current URL:', window.location.href);
        console.log('  - URL hash:', window.location.hash);
        
        // Enhanced TelegramGameProxy debugging
        if (window.TelegramGameProxy) {
            console.log('🔍 TelegramGameProxy object inspection:');
            console.log('  - Object keys:', Object.keys(window.TelegramGameProxy));
            console.log('  - Object methods:', Object.getOwnPropertyNames(window.TelegramGameProxy));
            console.log('  - Constructor:', window.TelegramGameProxy.constructor.name);
            console.log('  - Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.TelegramGameProxy)));
            
            // Try different possible method names
            const possibleMethods = ['postScore', 'shareScore', 'sendScore', 'submitScore', 'reportScore', 'gameScore'];
            possibleMethods.forEach(method => {
                console.log(`  - ${method}:`, typeof window.TelegramGameProxy[method]);
            });
        }
        
        // Set game state
        setGameFinished(true);
        setGameStarted(false);
        setActiveBox(null);
        
        // Report score to Telegram if in Telegram environment
        if (isTelegramEnvironment && telegramReady) {
            try {
                console.log('✅ Telegram environment detected - attempting to report score');
                console.log('Reporting final score to Telegram:', finalScore);
                const success = await reportScore(finalScore);
                
                if (success) {
                    console.log('Score successfully reported to Telegram');
                    // Optionally show a confirmation
                    if (finalScore > 0) {
                        showAlert(`Great job! Your score of ${finalScore} has been saved!`);
                    }
                } else {
                    console.warn('Failed to report score to Telegram');
                }
            } catch (error) {
                console.error('Error reporting score to Telegram:', error);
            }
        } else {
            console.log('❌ NOT in Telegram environment or not ready - score not reported');
            console.log('  - isTelegramEnvironment:', isTelegramEnvironment);
            console.log('  - telegramReady:', telegramReady);
            console.log('Final score (standalone mode):', finalScore);
        }
    }, [isTelegramEnvironment, telegramReady, reportScore, score, successfulDrops, playSound, stopBackgroundMusic, showAlert]);

    // Watch for lives reaching 0 and trigger game over
    useEffect(() => {
        if (lives <= 0 && gameStarted && !gameFinished) {
            console.log('🎮 GAME OVER SCENARIO: All lives lost (useEffect trigger)');
            console.log('📊 Current score state:', score);
            console.log('📊 Captured score at life loss:', scoreAtLifeLoss.current);
            console.log('📊 Lives:', lives);
            
            // Drop active ingredient if there is one (similar to stop button behavior)
            if (activeBox) {
                console.log('🎯 Dropping active ingredient on lives lost');
                playSound('drop');
                
                let Ingredient = activeBox.ingredient;
                let height = Ingredient.height;
                
                // Create unique ID for this drop
                const dropId = `lives-drop-${Date.now()}-${Math.random()}`;
                
                // Drop the ingredient from its current animated position
                let droppedBox = {
                    x: topBoxPosition.x,
                    z: topBoxPosition.z,
                    y: topBoxPosition.y,
                    ingredient: Ingredient,
                    id: dropId,
                };
                
                // Add to falling blocks
                setFallenBlocks(prev => [...prev, droppedBox]);
                
                // Clear the active box to make the animated ingredient disappear
                setActiveBox(null);
                
                // Play impact sound for the dropped ingredient
                setTimeout(() => {
                    playSound('impact');
                }, 750);
                
                // Move the base Bun down by the height of the dropped ingredient
                setTowerYOffset(current => current + height);
            }
            
            // Only drop TopBun if it hasn't been dropped already (prevent double drop from overflow scenario)
            const hasTopBun = fallenBlocks.some(block => block.ingredient === TopBun);
            if (!hasTopBun) {
                console.log('🍞 Dropping TopBun for lives lost scenario');
                // Drop the top bun from above the tower (same as other scenarios)
                let topBunHeight = TopBun.height;
                let stackHeight = successfulDrops > 0 ? (successfulDrops * 0.5) + towerYOffset : towerYOffset;
                
                let topBunBox = {
                    x: 0,
                    z: 0,
                    y: stackHeight + topBunHeight + ANIMATION_DROP_HEIGHT + 2,
                    ingredient: TopBun,
                    id: `topbun-lives-${Date.now()}`,
                };
                
                // Add top bun to falling blocks
                setFallenBlocks(prev => [...prev, topBunBox]);
                
                // Move the base Bun down by the height of the top bun
                setTowerYOffset(current => current + topBunHeight);
            } else {
                console.log('🍞 TopBun already dropped, skipping duplicate');
            }
            
            // Use captured score to avoid race condition
            const scoreToUse = scoreAtLifeLoss.current !== null ? scoreAtLifeLoss.current : score;
            console.log('🔍 LIVES LOST - Using score:', scoreToUse);
            
            handleGameOver(scoreToUse);
        }
    }, [lives, gameStarted, gameFinished, handleGameOver, score, activeBox, topBoxPosition, successfulDrops, towerYOffset, playSound, fallenBlocks]);

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
            {/* Preloader - shows while textures are loading */}
            <Preloader isLoading={isLoading} progress={progress} />
            
            <div className="app-wrapper" style={{ backgroundColor: BGColor }}>
                {(!gameStarted || gameFinished) && !isLoading && (
                    <Screen 
                        score={score} 
                        startGame={startNewGame} 
                        isGameOver={gameFinished}
                        telegramUser={telegramUser}
                        isTelegramEnvironment={isTelegramEnvironment}
                    />
                )}
                {!isLoading && (
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
                )}
                
                {/* UI Elements - only show when game is started and not finished and not loading */}
                {gameStarted && !gameFinished && !isLoading && (
                    <>
                        {/* Desktop UI - individual positioned elements */}
                        <div className="desktop-ui">
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
                            
                            {/* Mute Button - Top Right (left of stop button) */}
                            <MuteButton 
                                isMuted={isMuted}
                                onToggle={toggleMute}
                            />
                            
                            {/* Stop Button - Top Right */}
                            <button 
                                onClick={handlePause}
                                className="stop-button"
                            >
                                {gameFinished ? 'New Game' : 'Stop'}
                            </button>
                        </div>

                        {/* Mobile UI - grid layout */}
                        <div className="mobile-ui-grid">
                            {/* Score Display */}
                            <div className="score-display">
                                <div className="score-label">SCORE</div>
                                <div className="score-value">{score}</div>
                            </div>
                            
                            {/* Lives Display */}
                            <div className="lives-display">
                                {[1, 2, 3].map(heartNum => (
                                    <HeartIcon 
                                        key={heartNum}
                                        filled={heartNum <= lives}
                                        size={28}
                                    />
                                ))}
                            </div>
                            
                            {/* Mute Button */}
                            <MuteButton 
                                isMuted={isMuted}
                                onToggle={toggleMute}
                            />
                            
                            {/* Stop Button */}
                            <button 
                                onClick={handlePause}
                                className="stop-button"
                            >
                                {gameFinished ? 'New Game' : 'Stop'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default App;
