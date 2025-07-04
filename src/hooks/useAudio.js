import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

// Audio manager hook for controlling game sounds
export const useAudio = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [backgroundMusicShouldPlay, setBackgroundMusicShouldPlay] = useState(false);
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
        // Capture the current ref value at the start of the effect
        const currentAudioRefs = audioRefs.current;
        
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
            
            currentAudioRefs[key] = audio;
        });
        
        // Cleanup on unmount - use the captured ref value
        return () => {
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
            
            // If unmuting and background music should be playing, restart it
            if (!newMutedState && backgroundMusicShouldPlay && audioRefs.current.bgMusic) {
                console.log('Unmuting - restarting background music');
                try {
                    const playPromise = audioRefs.current.bgMusic.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.warn('Failed to restart background music:', error);
                        });
                    }
                } catch (error) {
                    console.warn('Error restarting background music:', error);
                }
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
    }, [backgroundMusicShouldPlay]);

    // Start background music
    const startBackgroundMusic = useCallback(() => {
        console.log('Starting background music, isMuted:', isMuted);
        setBackgroundMusicShouldPlay(true);
        if (!isMuted) {
            playSound('bgMusic');
        }
    }, [playSound, isMuted]);

    // Stop background music
    const stopBackgroundMusic = useCallback(() => {
        console.log('Stopping background music');
        setBackgroundMusicShouldPlay(false);
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
