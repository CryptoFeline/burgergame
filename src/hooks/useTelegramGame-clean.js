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
            if (window.TelegramGameProxy && typeof window.TelegramGameProxy.postScore === 'function') {
                console.log(`📤 ${callId}: Attempting TelegramGameProxy.postScore(${finalScore})`);
                try {
                    window.TelegramGameProxy.postScore(finalScore);
                    console.log(`✅ ${callId}: TelegramGameProxy.postScore called successfully`);
                    return true;
                } catch (e) {
                    console.error(`❌ ${callId}: TelegramGameProxy.postScore failed:`, e);
                }
            } else {
                console.log(`⚠️ ${callId}: TelegramGameProxy.postScore not available`);
            }
            
            // Method 2: Server-side score submission with Telegram context
            console.log(`🔧 ${callId}: Attempting server-side score submission`);
            
            // Extract Telegram context from the current environment
            let telegramContext = null;
            
            // Try to get context from URL parameters (most reliable for Telegram Games)
            try {
                const currentUrl = new URL(window.location.href);
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const searchParams = new URLSearchParams(window.location.search);
                
                telegramContext = {
                    user_id: hashParams.get('user_id') || searchParams.get('user_id'),
                    chat_id: hashParams.get('chat_id') || searchParams.get('chat_id'),
                    message_id: hashParams.get('message_id') || searchParams.get('message_id')
                };
                
                console.log(`📋 ${callId}: Extracted Telegram context from URL:`, telegramContext);
            } catch (e) {
                console.log(`⚠️ ${callId}: Failed to extract from URL:`, e);
            }
            
            // Try to get context from Telegram WebApp if available
            if ((!telegramContext?.user_id || !telegramContext?.chat_id) && window.Telegram?.WebApp) {
                try {
                    const tg = window.Telegram.WebApp;
                    const initData = tg.initDataUnsafe;
                    
                    if (initData) {
                        telegramContext = {
                            user_id: initData.user?.id?.toString() || telegramContext?.user_id,
                            chat_id: initData.chat?.id?.toString() || telegramContext?.chat_id,
                            message_id: telegramContext?.message_id // Usually not available in WebApp
                        };
                        console.log(`📱 ${callId}: Enhanced context from Telegram WebApp:`, telegramContext);
                    }
                } catch (e) {
                    console.log(`⚠️ ${callId}: Failed to extract from WebApp:`, e);
                }
            }
            
            // If we have sufficient Telegram context, try server-side submission
            if (telegramContext?.user_id && telegramContext?.chat_id && telegramContext?.message_id) {
                console.log(`📤 ${callId}: Submitting score via dedicated endpoint`);
                
                const scoreEndpoint = 'https://bossburgerbuild.netlify.app/.netlify/functions/game-score';
                const payload = {
                    score: finalScore,
                    user_id: telegramContext.user_id,
                    chat_id: telegramContext.chat_id,
                    message_id: telegramContext.message_id,
                    game_short_name: 'buildergame'
                };
                
                console.log(`📊 ${callId}: Payload:`, payload);
                
                try {
                    const response = await fetch(scoreEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    const result = await response.json();
                    console.log(`📨 ${callId}: Server response:`, { status: response.status, result });
                    
                    if (response.ok && result.success) {
                        console.log(`✅ ${callId}: Score successfully submitted via server!`);
                        return true;
                    } else {
                        console.error(`❌ ${callId}: Server-side submission failed:`, result);
                    }
                } catch (fetchError) {
                    console.error(`❌ ${callId}: Network error during server submission:`, fetchError);
                }
            } else {
                console.log(`⚠️ ${callId}: Insufficient Telegram context for server submission:`, telegramContext);
            }
            
            // Method 3: Fallback - reload with score in URL (last resort)
            console.log(`🔄 ${callId}: Using URL reload fallback method`);
            
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('final_score', finalScore);
            currentUrl.searchParams.set('game_over', 'true');
            currentUrl.searchParams.set('timestamp', Date.now());
            
            console.log(`📤 ${callId}: Reloading with score URL:`, currentUrl.href);
            
            // Prevent infinite reloads
            if (!sessionStorage.getItem('scoreSubmitted')) {
                sessionStorage.setItem('scoreSubmitted', 'true');
                window.location.href = currentUrl.href;
            } else {
                console.log(`⚠️ ${callId}: Score already submitted, skipping reload`);
            }
            
            return true;

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
