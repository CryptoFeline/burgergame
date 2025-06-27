import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for Telegram Games API integration
 * Simplified implementation following the 7-step Telegram Games pattern
 */
export const useTelegramGame = () => {
    const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
    const [telegramUser, setTelegramUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Detect Telegram environment
        const checkTelegramEnvironment = () => {
            // Check for Telegram Game Proxy (primary method for Games)
            if (window.TelegramGameProxy) {
                setIsTelegramEnvironment(true);
                setIsReady(true);
                console.log('✅ Telegram Game Proxy detected');
                return;
            }

            // Check for Telegram Web App (secondary, for Mini Apps)
            if (window.Telegram?.WebApp) {
                setIsTelegramEnvironment(true);
                const tg = window.Telegram.WebApp;
                
                tg.ready();
                tg.expand();
                
                if (tg.initDataUnsafe?.user) {
                    setTelegramUser(tg.initDataUnsafe.user);
                }
                
                setIsReady(true);
                console.log('✅ Telegram Web App detected', tg.initDataUnsafe);
                return;
            }

            // Check if we're in an iframe (likely Telegram)
            try {
                if (window.parent !== window && window.parent.location.hostname.includes('telegram')) {
                    setIsTelegramEnvironment(true);
                    setIsReady(true);
                    console.log('✅ Telegram iframe detected');
                    return;
                }
            } catch (e) {
                // Cross-origin error - likely in Telegram
                if (window.parent !== window) {
                    setIsTelegramEnvironment(true);
                    setIsReady(true);
                    console.log('✅ Likely Telegram environment (cross-origin)');
                    return;
                }
            }

            // Standalone environment
            setIsReady(true);
            console.log('ℹ️ Standalone environment detected');
        };

        // Wait for Telegram scripts to load
        const timer = setTimeout(checkTelegramEnvironment, 100);
        return () => clearTimeout(timer);
    }, []);

    /**
     * STEP 3: Report score using TelegramGameProxy.postScore()
     * This is the ONLY method we use for score reporting in Telegram Games
     * @param {number} score - The player's final score
     * @returns {Promise<boolean>} - Whether the score was successfully reported
     */
    const reportScore = useCallback(async (score) => {
        // Development mode handling
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.info('🔧 Local development mode - score reporting simulated');
            console.info(`📊 Score: ${score} (would be sent in production)`);
            return true;
        }

        if (!isTelegramEnvironment) {
            console.warn('❌ Not in Telegram environment - score cannot be reported');
            return false;
        }

        try {
            // Validate and clean score
            const finalScore = Math.max(0, Math.floor(score));
            console.log(`📊 Reporting score via TelegramGameProxy.postScore(): ${finalScore}`);

            // STEP 3: Use TelegramGameProxy.postScore() - the official method
            // This will trigger a callback_query to the bot with the score
            if (window.TelegramGameProxy && typeof window.TelegramGameProxy.postScore === 'function') {
                window.TelegramGameProxy.postScore(finalScore);
                console.log('✅ Score sent via TelegramGameProxy.postScore()');
                return true;
            }

            // Check if we're in Telegram but proxy not available
            if (window.parent !== window) {
                console.error('❌ In Telegram but TelegramGameProxy not available');
                console.error('🔧 Check: Game URL must exactly match what was registered with BotFather');
                console.error('🔧 Current URL:', window.location.href);
                return false;
            }

            console.warn('❌ TelegramGameProxy not available');
            return false;

        } catch (error) {
            console.error('❌ Failed to report score:', error);
            return false;
        }
    }, [isTelegramEnvironment]);

    /**
     * Simple alert function
     * @param {string} message - Alert message
     */
    const showAlert = useCallback((message) => {
        if (window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert(message);
        } else {
            alert(message);
        }
    }, []);

    return {
        isTelegramEnvironment,
        telegramUser,
        isReady,
        reportScore,
        showAlert
    };
};
