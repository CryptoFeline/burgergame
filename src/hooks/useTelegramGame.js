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
            console.log(`🎮 GAME OVER - Player achieved score: ${finalScore}`);
            console.log(`📤 Sending score to Telegram via TelegramGameProxy.postScore()`);

            // STEP 3: Use TelegramGameProxy.postScore() - THE CORRECT METHOD for score submission
            // According to Telegram documentation, postScore is for leaderboard submission
            // shareScore is only for sharing the game link, NOT for submitting scores
            
            if (window.TelegramGameProxy) {
                // Use postScore - the correct method for score submission
                if (typeof window.TelegramGameProxy.postScore === 'function') {
                    console.log(`🚀 Calling TelegramGameProxy.postScore(${finalScore})`);
                    console.log('🔍 Available TelegramGameProxy methods:', Object.keys(window.TelegramGameProxy));
                    console.log('🔍 TelegramGameProxy type check:', typeof window.TelegramGameProxy.postScore);
                    
                    try {
                        // Log the environment details before calling postScore
                        console.log('🌍 Environment details:');
                        console.log('  - URL:', window.location.href);
                        console.log('  - Parent window:', window.parent !== window ? 'YES (iframe)' : 'NO (standalone)');
                        console.log('  - User agent:', navigator.userAgent.substring(0, 100));
                        
                        window.TelegramGameProxy.postScore(finalScore);
                        console.log('✅ TelegramGameProxy.postScore() called successfully');
                        console.log('⏳ Score sent to Telegram - expecting bot to receive callback query...');
                        console.log('🎯 Next step: Bot should call setGameScore() to save to leaderboard');
                        return true;
                    } catch (error) {
                        console.error('❌ postScore failed:', error);
                    }
                } else {
                    console.error('❌ TelegramGameProxy.postScore is not available');
                    console.error('❌ Available methods:', Object.keys(window.TelegramGameProxy));
                }
            }

            // More detailed error checking
            if (window.TelegramGameProxy) {
                console.error('❌ TelegramGameProxy exists but postScore is not a function');
                console.error('❌ TelegramGameProxy methods:', Object.keys(window.TelegramGameProxy));
                console.error('❌ postScore type:', typeof window.TelegramGameProxy.postScore);
            } else {
                console.error('❌ TelegramGameProxy not available at all');
            }

            // Check if we're in Telegram but proxy not available
            if (window.parent !== window) {
                console.error('❌ In Telegram iframe but TelegramGameProxy not functional');
                console.error('🔧 Check: Game URL must exactly match what was registered with BotFather');
                console.error('🔧 Current URL:', window.location.href);
                console.error('🔧 Expected URL should match the one set in BotFather');
                return false;
            }

            console.warn('❌ TelegramGameProxy not available - not in Telegram environment');
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
