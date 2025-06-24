import { useState, useEffect, useCallback, useMemo } from 'react';
import { TextureLoader } from 'three';

export const usePreloader = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [loadedTextures, setLoadedTextures] = useState({});

    // List all texture paths that need to be preloaded - memoized to prevent recreation
    const texturePaths = useMemo(() => [
        '/img/bottombun/bottom-bun-diffuse.webp',
        '/img/topbun/top-bun-diffuse.webp',
        '/img/patty/patty-diffuse.webp',
        '/img/cheese/cheese-diffuse.webp',
        '/img/lettuce/lettuce-diffuse.webp',
        '/img/tomato/tomato-diffuse.webp',
        '/img/onion/onion-diffuse.webp',
    ], []);

    const preloadTextures = useCallback(async () => {
        const loader = new TextureLoader();
        const textures = {};
        let loadedCount = 0;

        const loadPromises = texturePaths.map((path) => {
            return new Promise((resolve, reject) => {
                loader.load(
                    path,
                    (texture) => {
                        // Configure texture for optimal performance
                        texture.generateMipmaps = false;
                        texture.minFilter = 1006; // LinearFilter
                        texture.magFilter = 1006; // LinearFilter
                        
                        textures[path] = texture;
                        loadedCount++;
                        
                        // Update progress
                        const progressPercent = (loadedCount / texturePaths.length) * 100;
                        setProgress(progressPercent);
                        
                        resolve(texture);
                    },
                    (progress) => {
                        // Optional: Handle individual texture loading progress
                        console.log(`Loading ${path}: ${(progress.loaded / progress.total * 100)}%`);
                    },
                    (error) => {
                        console.warn(`Failed to load texture: ${path}`, error);
                        // Don't reject - continue loading other textures
                        loadedCount++;
                        const progressPercent = (loadedCount / texturePaths.length) * 100;
                        setProgress(progressPercent);
                        resolve(null);
                    }
                );
            });
        });

        try {
            await Promise.all(loadPromises);
            setLoadedTextures(textures);
            
            // Add a small delay to show 100% briefly
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
            
        } catch (error) {
            console.error('Error preloading textures:', error);
            // Still proceed to game even if some textures failed
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    }, [texturePaths]); // Add texturePaths to dependency array

    useEffect(() => {
        preloadTextures();
    }, [preloadTextures]);

    // Function to get a preloaded texture
    const getTexture = useCallback((path) => {
        return loadedTextures[path] || null;
    }, [loadedTextures]);

    return {
        isLoading,
        progress,
        getTexture,
        loadedTextures
    };
};
