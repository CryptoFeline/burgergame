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
     * Report score by directly calling the bot's webhook (bypassing TelegramGameProxy)
     * This ensures the score reaches the bot exactly like the test button does
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
            const callId = 'game_score_' + Date.now();
            console.log(`🎯 ${callId}: DIRECT BOT WEBHOOK APPROACH for game score submission`);
            console.log(`📊 ${callId}: Score to submit: ${finalScore}`);
            
            // Get the game context from URL or Telegram data
            let chatId, messageId, userId;
            
            // Try to extract from URL hash parameters (Telegram games pass these)
            try {
                const urlParams = new URLSearchParams(window.location.hash.substring(1));
                chatId = urlParams.get('chat_id');
                messageId = urlParams.get('message_id');
                userId = urlParams.get('user_id');
                
                console.log('🔍 URL params extracted:');
                console.log('  - chat_id:', chatId);
                console.log('  - message_id:', messageId);
                console.log('  - user_id:', userId);
            } catch (e) {
                console.log('⚠️ Could not extract URL params:', e);
            }
            
            // If we have the necessary data, call the bot webhook directly
            if (chatId && messageId && userId) {
                const webhookUrl = 'https://bossburgerbuild.netlify.app/.netlify/functions/telegram-bot';
                
                // Create a callback query update like Telegram would send
                const update = {
                    update_id: Date.now(),
                    callback_query: {
                        id: callId,
                        from: {
                            id: parseInt(userId),
                            first_name: 'Player' // Will be overridden by bot if needed
                        },
                        message: {
                            message_id: parseInt(messageId),
                            chat: {
                                id: parseInt(chatId)
                            }
                        },
                        data: `game_score:${finalScore}`,
                        game_short_name: 'buildergame'
                    }
                };
                
                console.log(`📤 ${callId}: Sending direct webhook call to bot`);
                console.log(`📊 ${callId}: Update data:`, update);
                
                // Send to bot webhook
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(update)
                });
                
                if (response.ok) {
                    console.log(`✅ ${callId}: Bot webhook called successfully`);
                    console.log(`🎯 ${callId}: Score should now be processed by bot`);
                    return true;
                } else {
                    console.error(`❌ ${callId}: Bot webhook failed:`, response.status, response.statusText);
                    return false;
                }
            } else {
                // Fallback: try TelegramGameProxy.postScore if available
                console.log(`🔄 ${callId}: Missing context data, trying TelegramGameProxy fallback`);
                
                if (window.TelegramGameProxy && typeof window.TelegramGameProxy.postScore === 'function') {
                    console.log(`📤 ${callId}: Using TelegramGameProxy.postScore(${finalScore})`);
                    window.TelegramGameProxy.postScore(finalScore);
                    return true;
                } else {
                    console.error(`❌ ${callId}: No valid method available for score submission`);
                    return false;
                }
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
