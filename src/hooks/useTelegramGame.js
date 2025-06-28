import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for Telegram Games API integration
 * Focused only on testing TelegramGameProxy.postScore()
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
     * SIMPLIFIED VERSION - only tests TelegramGameProxy.postScore()
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
            console.log(`🎯 ${callId}: TESTING TelegramGameProxy.postScore() ONLY`);
            
            // Check if TelegramGameProxy is available
            console.log('🔍 TelegramGameProxy availability:', {
                exists: !!window.TelegramGameProxy,
                postScore: typeof window.TelegramGameProxy?.postScore,
                methods: window.TelegramGameProxy ? Object.getOwnPropertyNames(window.TelegramGameProxy) : 'not available'
            });
            
            // Try TelegramGameProxy.postScore (the official method)
            if (window.TelegramGameProxy && typeof window.TelegramGameProxy.postScore === 'function') {
                console.log(`📤 ${callId}: Calling TelegramGameProxy.postScore(${finalScore})`);
                console.log(`📤 ${callId}: Current URL:`, window.location.href);
                console.log(`📤 ${callId}: Window parent:`, window.parent !== window ? 'in iframe' : 'not in iframe');
                
                try {
                    // Call the official method
                    const result = window.TelegramGameProxy.postScore(finalScore);
                    console.log(`✅ ${callId}: TelegramGameProxy.postScore called, result:`, result);
                    
                    // Show user feedback
                    if (window.Telegram?.WebApp?.showAlert) {
                        window.Telegram.WebApp.showAlert(`🎉 Score ${finalScore} submitted!`);
                    }
                    
                    return true;
                } catch (e) {
                    console.error(`❌ ${callId}: TelegramGameProxy.postScore failed:`, e);
                    console.error(`❌ ${callId}: Error details:`, {
                        message: e.message,
                        stack: e.stack,
                        name: e.name
                    });
                }
            } else {
                console.log(`⚠️ ${callId}: TelegramGameProxy.postScore not available`);
                console.log(`🔍 ${callId}: Available objects:`, {
                    TelegramGameProxy: !!window.TelegramGameProxy,
                    Telegram: !!window.Telegram,
                    TelegramWebApp: !!window.Telegram?.WebApp
                });
            }
            
            // If we reach here, TelegramGameProxy.postScore didn't work
            console.log(`⚠️ ${callId}: TelegramGameProxy.postScore failed or unavailable`);
            console.log(`📊 Final score was: ${finalScore} - not sent to Telegram`);
            
            return false;

        } catch (error) {
            console.error('❌ Failed to report score:', error);
            return false;
        }
    }, [isTelegramEnvironment]);

    /**
     * Simple alert function
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
