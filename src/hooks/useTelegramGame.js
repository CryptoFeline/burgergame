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
            // Try the old Telegram Game Proxy first
            if (window.TelegramGameProxy) {
                console.log('Reporting score via TelegramGameProxy:', score);
                window.TelegramGameProxy.postScore(score);
                return true;
            }

            // Try the new Telegram Web App API
            if (window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                console.log('Reporting score via Telegram Web App:', score);
                
                // Send score data back to the bot via web app data
                tg.sendData(JSON.stringify({ 
                    type: 'game_score', 
                    score: score,
                    timestamp: Date.now()
                }));
                
                // Show confirmation and close after a delay
                if (score > 0) {
                    tg.showAlert(`🎉 Great job! Score: ${score}`);
                }
                
                // Don't close immediately - let user see the result
                setTimeout(() => {
                    tg.close();
                }, 2000);
                
                return true;
            }

            // Fallback: try postMessage to parent
            if (window.parent !== window) {
                console.log('Reporting score via postMessage:', score);
                window.parent.postMessage({
                    type: 'telegram_game_score',
                    score: score,
                    timestamp: Date.now()
                }, '*');
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
        getHighScores,
        showAlert,
        showConfirm,
        setMainButton,
        hideMainButton
    };
};
