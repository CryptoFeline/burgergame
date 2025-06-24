import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

// Audio manager hook for controlling game sounds
export const useAudio = () => {
    const [isMuted, setIsMuted] = useState(false);
    const audioRefs = useRef({});

    // Preload and manage audio files - memoize to prevent recreation
    const audioFiles = useMemo(() => ({
        bgMusic: '/audio/background.mp3',
        ingredientSpawn: '/audio/ingredient-spawn.mp3',
        drop: '/audio/drop.mp3',
        impact: '/audio/impact.mp3',
        lifeInteloss: '/audio/life-loss.mp3',
        gameOver: '/audio/game-over.mp3',
    }), []);

    // Initialize audio objects
    useEffect(() => {
        Object.entries(audioFiles).forEach(([key, src]) => {
            const audio = new Audio();
            audio.src = src;
            audio.preload = 'auto';
            
            // Set properties for different audio types
            if (key === 'bgMusic') {
                audio.loop = true;
                audio.volume = 0.3; // Background music should be quieter
            } else {
                audio.volume = 0.6; // Sound effects
            }
            
            // Handle loading errors gracefully
            audio.addEventListener('error', () => {
                console.warn(`Failed to load audio: ${src}`);
            });
            
            audioRefs.current[key] = audio;
        });
        
        // Cleanup on unmount - capture current ref value
        return () => {
            const currentAudioRefs = audioRefs.current;
            Object.values(currentAudioRefs).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, [audioFiles]);

    // Play a specific sound effect
    const playSound = useCallback((soundName) => {
        console.log(`Attempting to play sound: ${soundName}, isMuted: ${isMuted}`);
        
        if (isMuted) {
            console.log(`Sound ${soundName} not played - muted`);
            return;
        }
        
        if (!audioRefs.current[soundName]) {
            console.warn(`Audio not found for: ${soundName}`);
            return;
        }
        
        const audio = audioRefs.current[soundName];
        console.log(`Playing ${soundName}, audio object:`, audio);
        
        try {
            // Reset to beginning for sound effects
            if (soundName !== 'bgMusic') {
                audio.currentTime = 0;
            }
            
            const playPromise = audio.play();
            
            // Handle browsers that require user interaction first
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Failed to play ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing ${soundName}:`, error);
        }
    }, [isMuted]);

    // Stop a specific sound
    const stopSound = useCallback((soundName) => {
        if (!audioRefs.current[soundName]) return;
        
        const audio = audioRefs.current[soundName];
        audio.pause();
        
        // Reset to beginning for sound effects
        if (soundName !== 'bgMusic') {
            audio.currentTime = 0;
        }
    }, []);

    // Toggle mute state
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMutedState = !prev;
            
            // If unmuting, resume background music if it was playing
            if (!newMutedState && audioRefs.current.bgMusic) {
                // Check if bg music should be playing (implement game state check if needed)
                // For now, we'll handle this in the game logic
            }
            
            // If muting, pause all currently playing audio
            if (newMutedState) {
                Object.values(audioRefs.current).forEach(audio => {
                    if (!audio.paused) {
                        audio.pause();
                    }
                });
            }
            
            return newMutedState;
        });
    }, []);

    // Start background music
    const startBackgroundMusic = useCallback(() => {
        if (!isMuted) {
            playSound('bgMusic');
        }
    }, [playSound, isMuted]);

    // Stop background music
    const stopBackgroundMusic = useCallback(() => {
        stopSound('bgMusic');
    }, [stopSound]);

    return {
        isMuted,
        toggleMute,
        playSound,
        stopSound,
        startBackgroundMusic,
        stopBackgroundMusic,
    };
};
