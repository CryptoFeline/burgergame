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
            console.log('🔍 Checking Telegram environment...');
            
            // Check for Telegram Game Proxy (primary method for Games)
            if (window.TelegramGameProxy && typeof window.TelegramGameProxy.postScore === 'function') {
                console.log('✅ Telegram Game Proxy detected with postScore method');
                setIsTelegramEnvironment(true);
                setIsReady(true);
                return;
            }

            // Check for Telegram Web App (secondary, for Mini Apps)
            if (window.Telegram?.WebApp) {
                console.log('✅ Telegram Web App detected');
                setIsTelegramEnvironment(true);
                const tg = window.Telegram.WebApp;
                
                tg.ready();
                tg.expand();
                
                if (tg.initDataUnsafe?.user) {
                    setTelegramUser(tg.initDataUnsafe.user);
                }
                
                setIsReady(true);
                return;
            }

            // Check if we're in an iframe (likely Telegram) - but be more careful
            try {
                if (window.parent !== window && window.location.href.includes('netlify.app')) {
                    // Only consider it Telegram if we're in iframe AND it's our game URL
                    console.log('⚠️ In iframe but TelegramGameProxy not fully available');
                    console.log('⚠️ Treating as Telegram environment but scores may not work');
                    setIsTelegramEnvironment(true);
                    setIsReady(true);
                    return;
                }
            } catch (e) {
                // Cross-origin error - likely in Telegram
                if (window.parent !== window) {
                    console.log('⚠️ Cross-origin iframe detected - likely Telegram');
                    console.log('⚠️ But TelegramGameProxy not confirmed functional');
                    setIsTelegramEnvironment(true);
                    setIsReady(true);
                    return;
                }
            }

            // Standalone environment
            console.log('ℹ️ Standalone environment - not in Telegram');
            setIsTelegramEnvironment(false);
            setIsReady(true);
        };

        // Wait for Telegram scripts to load
        const timer = setTimeout(checkTelegramEnvironment, 100);
        return () => clearTimeout(timer);
    }, []);

    /**
     * Report score using direct callback query method (same as test button)
     * This bypasses the unreliable TelegramGameProxy.postScore() method
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
            console.log(`🎮 GAME OVER - Player achieved score: ${finalScore}`);
            
            // Add a timestamp to track this specific call
            const callId = 'score_' + Date.now();
            console.log(`🎯 ${callId}: Starting score submission using direct callback query`);
            console.log('🔍 Environment check:');
            console.log('  - Is iframe:', window.parent !== window);
            console.log('  - URL:', window.location.href);
            console.log('  - User agent contains "Telegram":', navigator.userAgent.includes('Telegram'));
            
            // NEW APPROACH: Send score via callback query like the test button
            // This mimics exactly what the working test button does
            if (window.parent && window.parent !== window) {
                // Send score data in the format that the bot expects
                const scoreData = `game_score:${finalScore}`;
                
                console.log(`📤 ${callId}: Sending score via callback query to parent window`);
                console.log(`📊 Score data: ${scoreData}`);
                
                // Send the score as a callback query to the parent (Telegram)
                // This is the same mechanism the test button uses successfully
                window.parent.postMessage({
                    eventType: 'callback_query',
                    eventData: scoreData
                }, '*');
                
                console.log(`✅ ${callId}: Score callback query sent to Telegram`);
                console.log('⏳ Waiting for bot to receive callback query...');
                console.log('🎯 Expected bot log: "SCORE SUBMISSION DETECTED"');
                
                // Set a timeout to check if the bot received anything
                setTimeout(() => {
                    console.log(`⏰ ${callId}: 5 seconds passed - check bot logs for callback query`);
                }, 5000);
                
                return true;
            } else {
                console.warn('⚠️ Not in iframe - cannot send score to Telegram');
                return false;
            }

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
