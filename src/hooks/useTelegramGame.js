import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for integrating with Telegram Games platform
 * Handles score reporting, player detection, and web app communication
 */
export const useTelegramGame = () => {
    const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
    const [telegramUser, setTelegramUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Check if we're running inside Telegram
        const checkTelegramEnvironment = () => {
            // Check for Telegram Game Proxy (old bridge)
            if (window.TelegramGameProxy) {
                setIsTelegramEnvironment(true);
                setIsReady(true);
                console.log('Telegram Game Proxy detected');
                return;
            }

            // Check for Telegram Web App (new bridge)
            if (window.Telegram?.WebApp) {
                setIsTelegramEnvironment(true);
                const tg = window.Telegram.WebApp;
                
                // Initialize the web app
                tg.ready();
                tg.expand();
                
                // Get user data if available
                if (tg.initDataUnsafe?.user) {
                    setTelegramUser(tg.initDataUnsafe.user);
                }
                
                setIsReady(true);
                console.log('Telegram Web App detected', tg.initDataUnsafe);
                return;
            }

            // Check if we're in a Telegram iframe (fallback detection)
            try {
                if (window.parent !== window && window.parent.location.hostname.includes('telegram')) {
                    setIsTelegramEnvironment(true);
                    setIsReady(true);
                    console.log('Telegram iframe detected');
                    return;
                }
            } catch (e) {
                // Cross-origin error is expected, but indicates we might be in Telegram
                if (window.parent !== window) {
                    setIsTelegramEnvironment(true);
                    setIsReady(true);
                    console.log('Likely Telegram environment (cross-origin)');
                    return;
                }
            }

            // Not in Telegram - still set ready for standalone testing
            setIsReady(true);
            console.log('Standalone environment detected');
        };

        // Wait a bit for Telegram scripts to load
        const timer = setTimeout(checkTelegramEnvironment, 100);
        return () => clearTimeout(timer);
    }, []);

    /**
     * Report the final score to Telegram
     * @param {number} score - The player's final score
     * @returns {Promise<boolean>} - Whether the score was successfully reported
     */
    const reportScore = useCallback(async (score) => {
        if (!isTelegramEnvironment) {
            console.log('Not in Telegram environment, score not reported:', score);
            return false;
        }

        try {
            // Ensure score is a positive integer
            const finalScore = Math.max(0, Math.floor(score));
            console.log(`📊 Reporting score: ${finalScore}`);

            // For Telegram Games API leaderboards, we need to trigger a callback query
            // This is the proper way for Telegram Games (not Web Apps)
            if (window.TelegramGameProxy) {
                console.log('Using TelegramGameProxy for score reporting...');
                
                // First try the direct postScore method if available
                if (typeof window.TelegramGameProxy.postScore === 'function') {
                    window.TelegramGameProxy.postScore(finalScore);
                }
                
                // Also send via postMessage for callback query handling
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        eventType: 'game_score',
                        eventData: JSON.stringify({
                            type: 'game_score',
                            score: finalScore,
                            timestamp: Date.now()
                        })
                    }, '*');
                    console.log('✅ Score sent via postMessage for leaderboard processing');
                }
                
                return true;
            }

            // Fallback to Web App API if available (for Web Apps, not Games)
            if (window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                console.log('Reporting score via Telegram Web App:', finalScore);
                
                // Send score data back to the bot
                tg.sendData(JSON.stringify({ 
                    type: 'game_score', 
                    score: finalScore,
                    timestamp: Date.now()
                }));
                
                return true;
            }

            // Final fallback: try postMessage to parent
            if (window.parent !== window) {
                console.log('Using fallback postMessage method...');
                
                // Try multiple message formats for compatibility
                const scoreData = {
                    type: 'game_score',
                    score: finalScore,
                    timestamp: Date.now()
                };
                
                // Format 1: Direct message
                window.parent.postMessage(scoreData, '*');
                
                // Format 2: Wrapped in eventType/eventData
                window.parent.postMessage({
                    eventType: 'game_score',
                    eventData: scoreData
                }, '*');
                
                // Format 3: JSON string (for some integrations)
                window.parent.postMessage(JSON.stringify(scoreData), '*');
                
                console.log('✅ Score sent via fallback postMessage methods');
                return true;
            }

        } catch (error) {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.info('🔧 Local development mode - Telegram score reporting skipped');
                console.info('📱 Deploy to test Telegram integration');
                return true; // Return true to avoid error messages in local dev
            } else {
                console.error('Failed to report score to Telegram:', error);
                return false;
            }
        }

        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.info('🔧 Local development mode - Telegram integration not available');
            return true; // Return true for local dev
        }
        
        console.warn('No Telegram communication method available');
        return false;
    }, [isTelegramEnvironment]);

    /**
     * Share score to other chats/groups
     * @param {number} score - The score to share
     * @param {string} message - Optional custom message
     */
    const shareScore = useCallback((score, message = null) => {
        if (!isTelegramEnvironment) {
            console.log('Not in Telegram environment, cannot share score');
            return false;
        }

        try {
            const finalScore = Math.max(0, Math.floor(score));
            const shareText = message || `🍔 I just scored ${finalScore} points in Boss Burger Builder! Can you beat my high score?`;
            
            // Method 1: Use TelegramGameProxy share functionality
            if (window.TelegramGameProxy && typeof window.TelegramGameProxy.shareScore === 'function') {
                console.log('Sharing score via TelegramGameProxy...');
                window.TelegramGameProxy.shareScore();
                return true;
            }

            // Method 2: Use Web App share functionality
            if (window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                
                // If switchInlineQuery is available (for inline bot sharing)
                if (typeof tg.switchInlineQuery === 'function') {
                    console.log('Sharing via Web App inline query...');
                    tg.switchInlineQuery(shareText);
                    return true;
                }
            }

            // Method 3: Fallback - try to trigger share via postMessage
            if (window.parent !== window) {
                console.log('Sharing via postMessage fallback...');
                window.parent.postMessage({
                    type: 'share_score',
                    score: finalScore,
                    text: shareText,
                    timestamp: Date.now()
                }, '*');
                return true;
            }

            console.warn('No share method available');
            return false;

        } catch (error) {
            console.error('Failed to share score:', error);
            return false;
        }
    }, [isTelegramEnvironment]);

    /**
     * Get high scores from Telegram (if available)
     * Note: This typically requires backend implementation
     */
    const getHighScores = useCallback(async () => {
        // This would typically be handled by your bot backend
        // For now, we'll return null to indicate it's not implemented client-side
        console.log('High scores should be fetched from bot backend');
        return null;
    }, []);

    /**
     * Show a native Telegram alert (if available)
     * @param {string} message - Alert message
     */
    const showAlert = useCallback((message) => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert(message);
        } else {
            // Fallback to regular alert
            alert(message);
        }
    }, []);

    /**
     * Show a native Telegram confirmation dialog (if available)
     * @param {string} message - Confirmation message
     * @returns {Promise<boolean>} - User's choice
     */
    const showConfirm = useCallback((message) => {
        return new Promise((resolve) => {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.showConfirm(message, resolve);
            } else {
                // Fallback to regular confirm
                resolve(window.confirm(message));
            }
        });
    }, []);

    /**
     * Set the main button (if in Telegram Web App)
     * @param {string} text - Button text
     * @param {function} onClick - Click handler
     */
    const setMainButton = useCallback((text, onClick) => {
        if (window.Telegram?.WebApp?.MainButton) {
            const mainButton = window.Telegram.WebApp.MainButton;
            mainButton.setText(text);
            mainButton.onClick(onClick);
            mainButton.show();
        }
    }, []);

    /**
     * Hide the main button
     */
    const hideMainButton = useCallback(() => {
        if (window.Telegram?.WebApp?.MainButton) {
            window.Telegram.WebApp.MainButton.hide();
        }
    }, []);

    return {
        isTelegramEnvironment,
        telegramUser,
        isReady,
        reportScore,
        shareScore,
        getHighScores,
        showAlert,
        showConfirm,
        setMainButton,
        hideMainButton
    };
};
