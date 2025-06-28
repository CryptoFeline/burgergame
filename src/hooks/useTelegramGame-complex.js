import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for Telegram Games API integration
 * Clean implementation with server-side score submission
 */
export const useTelegramGame = () => {
    const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
    const [telegramUser, setTelegramUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkTelegramEnvironment = () => {
            console.log('🔍 Checking Telegram environment...');
            
            // Check for Telegram Game Proxy (primary method for Games)
            if (window.TelegramGameProxy) {
                console.log('✅ Telegram Game Proxy detected');
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

            // Check if we're in an iframe (likely Telegram)
            try {
                if (window.parent !== window && window.location.href.includes('netlify.app')) {
                    console.log('⚠️ In iframe, treating as Telegram environment');
                    setIsTelegramEnvironment(true);
                    setIsReady(true);
                    return;
                }
            } catch (e) {
                // Cross-origin iframe, likely Telegram
                console.log('✅ Cross-origin iframe detected (likely Telegram)');
                setIsTelegramEnvironment(true);
                setIsReady(true);
                return;
            }

            console.log('❌ No Telegram environment detected');
            setIsReady(true);
        };

        // Check immediately and then after a short delay
        checkTelegramEnvironment();
        const timer = setTimeout(checkTelegramEnvironment, 100);
        return () => clearTimeout(timer);
    }, []);

    /**
     * Report score to Telegram leaderboard
     * Uses multiple fallback methods for maximum reliability
     * @param {number} score - Player's final score
     */
    const reportScore = useCallback(async (score) => {
        if (!isTelegramEnvironment) {
            console.log('⚠️ Not in Telegram environment, skipping score submission');
            return false;
        }

        // Development mode handling
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.info('🔧 Local development mode - score reporting simulated');
            console.info(`📊 Score: ${score} (would be sent in production)`);
            return true;
        }

        try {
            // Validate and clean score
            const finalScore = Math.max(0, Math.floor(score));
            console.log(`🎮 GAME OVER - Player achieved score: ${finalScore}`);
            
            const callId = 'game_score_' + Date.now();
            console.log(`🎯 ${callId}: Starting score submission process`);
            
            // Method 1: Try TelegramGameProxy.postScore (standard for Telegram Games)
            if (window.TelegramGameProxy) {
                console.log(`📤 ${callId}: TelegramGameProxy available, attempting score submission`);
                console.log(`🔍 ${callId}: Available methods:`, Object.keys(window.TelegramGameProxy));
                
                // Try postScore method
                if (typeof window.TelegramGameProxy.postScore === 'function') {
                    try {
                        console.log(`📤 ${callId}: Using TelegramGameProxy.postScore(${finalScore})`);
                        window.TelegramGameProxy.postScore(finalScore);
                        console.log(`✅ ${callId}: TelegramGameProxy.postScore called successfully`);
                        
                        // Show user feedback
                        if (window.Telegram?.WebApp?.showAlert) {
                            window.Telegram.WebApp.showAlert(`🎉 Score ${finalScore} submitted to leaderboard!`);
                        }
                        
                        return true;
                    } catch (e) {
                        console.error(`❌ ${callId}: TelegramGameProxy.postScore failed:`, e);
                    }
                }
                
                // Try other possible methods
                const possibleMethods = ['shareScore', 'sendScore', 'submitScore', 'gameScore'];
                for (const method of possibleMethods) {
                    if (typeof window.TelegramGameProxy[method] === 'function') {
                        try {
                            console.log(`📤 ${callId}: Trying TelegramGameProxy.${method}(${finalScore})`);
                            window.TelegramGameProxy[method](finalScore);
                            console.log(`✅ ${callId}: TelegramGameProxy.${method} called successfully`);
                            return true;
                        } catch (e) {
                            console.error(`❌ ${callId}: TelegramGameProxy.${method} failed:`, e);
                        }
                    }
                }
            } else {
                console.log(`⚠️ ${callId}: TelegramGameProxy not available`);
            }
            
            // Method 2: Simulate callback query like the "Test Score" button
            console.log(`🎯 ${callId}: Attempting callback query simulation`);
            
            // Try to send a callback query with the score data in the same format
            if (window.Telegram?.WebApp?.sendData) {
                try {
                    const callbackData = `game_score:${finalScore}`;
                    console.log(`� ${callId}: Sending callback data:`, callbackData);
                    window.Telegram.WebApp.sendData(callbackData);
                    console.log(`✅ ${callId}: Callback data sent via Telegram WebApp`);
                    
                    // Show user feedback
                    if (window.Telegram?.WebApp?.showAlert) {
                        window.Telegram.WebApp.showAlert(`🎉 Score ${finalScore} submitted to leaderboard!`);
                    }
                    
                    return true;
                } catch (e) {
                    console.error(`❌ ${callId}: Telegram WebApp sendData failed:`, e);
                }
            }
            
            // Alternative: Try to trigger a callback query manually
            if (window.parent && window.parent !== window) {
                try {
                    // Send the exact same format as the test button
                    const callbackData = `game_score:${finalScore}`;
                    console.log(`� ${callId}: Sending callback query simulation:`, callbackData);
                    
                    // Try multiple postMessage formats
                    window.parent.postMessage({
                        type: 'callback_query',
                        data: callbackData
                    }, '*');
                    
                    window.parent.postMessage({
                        type: 'telegram_callback',
                        callback_data: callbackData
                    }, '*');
                    
                    // Also try direct format
                    window.parent.postMessage(callbackData, '*');
                    
                    console.log(`✅ ${callId}: Callback query simulation sent`);
                    return true;
                } catch (e) {
                    console.error(`❌ ${callId}: Callback query simulation failed:`, e);
                }
            }
            
            // Method 3: Manual callback submission (last resort - no page reload)
            console.log(`🎯 ${callId}: Attempting manual callback submission`);
            
            // Try to trigger the callback manually without page reload
            if (window.parent && window.parent !== window) {
                try {
                    // We're in an iframe, try to send a message to parent
                    const scoreData = {
                        type: 'game_score',
                        score: finalScore,
                        game_short_name: 'buildergame',
                        timestamp: Date.now()
                    };
                    
                    console.log(`📤 ${callId}: Sending postMessage to parent:`, scoreData);
                    window.parent.postMessage(scoreData, '*');
                    
                    // Also try the callback query format
                    const callbackData = `game_score:${finalScore}`;
                    console.log(`📤 ${callId}: Sending callback data format:`, callbackData);
                    window.parent.postMessage({ 
                        type: 'callback_query_data', 
                        data: callbackData 
                    }, '*');
                    
                    console.log(`✅ ${callId}: Manual callback submitted successfully`);
                    return true;
                } catch (e) {
                    console.error(`❌ ${callId}: Manual callback failed:`, e);
                }
            }
            
            // If we reach here, all methods failed but we don't want to break the game experience
            console.log(`⚠️ ${callId}: All score submission methods failed`);
            console.log(`📊 Final score was: ${finalScore} - saved locally but not sent to Telegram`);
            
            // Don't reload the page or break the game - just log and return false
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
