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
     * Report score using URL navigation (most reliable method for Telegram Games)
     * This reloads the page with score in URL, triggering the bot to handle it
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

        try {
            // Validate and clean score
            const finalScore = Math.max(0, Math.floor(score));
            console.log(`🎮 GAME OVER - Player achieved score: ${finalScore}`);
            
            const callId = 'game_score_' + Date.now();
            console.log(`🎯 ${callId}: Using URL navigation method for score submission`);
            console.log(`📊 ${callId}: Score to submit: ${finalScore}`);
            
            // Method 1: Use TelegramGameProxy.postScore if available (standard method)
            if (window.TelegramGameProxy && typeof window.TelegramGameProxy.postScore === 'function') {
                console.log(`📤 ${callId}: Using TelegramGameProxy.postScore(${finalScore})`);
                try {
                    window.TelegramGameProxy.postScore(finalScore);
                    console.log(`✅ ${callId}: TelegramGameProxy.postScore called successfully`);
                    return true;
                } catch (e) {
                    console.error(`❌ ${callId}: TelegramGameProxy.postScore failed:`, e);
                }
            }
            
            // Method 2: URL reload with score (fallback that works reliably)
            console.log(`🔄 ${callId}: Using URL reload method as fallback`);
            
            // Add score to URL and reload - this will trigger the bot
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('final_score', finalScore);
            currentUrl.searchParams.set('game_over', 'true');
            currentUrl.searchParams.set('timestamp', Date.now());
            
            console.log(`📤 ${callId}: Reloading with score URL:`, currentUrl.href);
            
            // Set a flag to prevent infinite reloads
            sessionStorage.setItem('scoreSubmitted', 'true');
            
            // Navigate to URL with score - this will trigger the bot to handle it
            window.location.href = currentUrl.href;
            
            return true;

        } catch (error) {
            console.error('❌ Failed to report score:', error);
            return false;
        }
    }, []);

        try {
            // Validate and clean score
            const finalScore = Math.max(0, Math.floor(score));
            console.log(`🎮 GAME OVER - Player achieved score: ${finalScore}`);
            
            // Add a timestamp to track this specific call
            const callId = 'game_score_' + Date.now();
            console.log(`🎯 ${callId}: DIRECT BOT API CALL like writeGameScore()`);
            console.log(`📊 ${callId}: Score to submit: ${finalScore}`);
            
            // Get game context from current URL and environment
            // Extract what we can from the current Telegram environment
            const currentUrl = window.location.href;
            console.log('🔍 Current URL for context extraction:', currentUrl);
            
            // Try to get context from URL parameters or Telegram WebApp data
            let chatId, messageId, userId;
            
            // Method 1: Try URL parameters
            try {
                console.log('🔍 Checking URL hash:', window.location.hash);
                console.log('🔍 Checking URL search:', window.location.search);
                
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const searchParams = new URLSearchParams(window.location.search);
                
                chatId = hashParams.get('chat_id') || searchParams.get('chat_id');
                messageId = hashParams.get('message_id') || searchParams.get('message_id');
                userId = hashParams.get('user_id') || searchParams.get('user_id');
                
                console.log('� Extracted from URL - chatId:', chatId, 'messageId:', messageId, 'userId:', userId);
            } catch (e) {
                console.log('⚠️ URL parameter extraction failed:', e);
            }
            
            // Method 2: Try Telegram WebApp context
            if ((!chatId || !messageId || !userId) && window.Telegram?.WebApp) {
                try {
                    const tg = window.Telegram.WebApp;
                    if (tg.initDataUnsafe?.user?.id) {
                        userId = tg.initDataUnsafe.user.id.toString();
                        console.log('📱 Got userId from Telegram WebApp:', userId);
                    }
                    if (tg.initDataUnsafe?.chat?.id) {
                        chatId = tg.initDataUnsafe.chat.id.toString();
                        console.log('� Got chatId from Telegram WebApp:', chatId);
                    }
                } catch (e) {
                    console.log('⚠️ Telegram WebApp extraction failed:', e);
                }
            }
            
            // Method 3: Use direct bot endpoint with score submission
            console.log(`� ${callId}: Making direct bot API call`);
            
            const botEndpoint = 'https://bossburgerbuild.netlify.app/.netlify/functions/telegram-bot';
            
            // Create the payload exactly like writeGameScore expects
            const payload = {
                method: 'setGameScore',
                score: finalScore,
                chat_id: chatId,
                message_id: messageId,
                user_id: userId,
                force: true,
                source: 'game_over'
            };
            
            console.log(`� ${callId}: Payload to bot:`, payload);
            
            const response = await fetch(botEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const responseText = await response.text();
            console.log(`📨 ${callId}: Bot response status:`, response.status);
            console.log(`📨 ${callId}: Bot response:`, responseText);
            
            if (response.ok) {
                console.log(`✅ ${callId}: Score successfully submitted to bot!`);
                return true;
            } else {
                console.error(`❌ ${callId}: Bot rejected score submission:`, response.status, responseText);
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
