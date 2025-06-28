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
            
            // DETAILED LOGGING TO ANSWER THE 4 QUESTIONS
            console.log('🔍 === TELEGRAM ENVIRONMENT ANALYSIS ===');
            
            // Question 3: Log TelegramGameProxy and Telegram.WebApp objects
            console.log('📊 Available Telegram objects:', {
                TelegramGameProxy: !!window.TelegramGameProxy,
                Telegram: !!window.Telegram,
                TelegramWebApp: !!window.Telegram?.WebApp,
                window_parent_different: window.parent !== window
            });
            
            if (window.TelegramGameProxy) {
                console.log('🎮 TelegramGameProxy details:', {
                    methods: Object.getOwnPropertyNames(window.TelegramGameProxy),
                    postScore: typeof window.TelegramGameProxy.postScore,
                    postEvent: typeof window.TelegramGameProxy.postEvent,
                    prototype: Object.getOwnPropertyNames(Object.getPrototypeOf(window.TelegramGameProxy))
                });
            }
            
            if (window.Telegram?.WebApp) {
                console.log('📱 Telegram.WebApp details:', {
                    initDataUnsafe: window.Telegram.WebApp.initDataUnsafe,
                    initData: window.Telegram.WebApp.initData,
                    version: window.Telegram.WebApp.version,
                    platform: window.Telegram.WebApp.platform,
                    colorScheme: window.Telegram.WebApp.colorScheme,
                    isExpanded: window.Telegram.WebApp.isExpanded,
                    viewportHeight: window.Telegram.WebApp.viewportHeight,
                    viewportStableHeight: window.Telegram.WebApp.viewportStableHeight
                });
                
                // Question 3: Detailed initDataUnsafe logging
                if (window.Telegram.WebApp.initDataUnsafe) {
                    console.log('🔍 initDataUnsafe breakdown:', {
                        user: window.Telegram.WebApp.initDataUnsafe.user,
                        chat: window.Telegram.WebApp.initDataUnsafe.chat,
                        chat_type: window.Telegram.WebApp.initDataUnsafe.chat_type,
                        chat_instance: window.Telegram.WebApp.initDataUnsafe.chat_instance,
                        start_param: window.Telegram.WebApp.initDataUnsafe.start_param,
                        auth_date: window.Telegram.WebApp.initDataUnsafe.auth_date,
                        hash: window.Telegram.WebApp.initDataUnsafe.hash ? 'present' : 'missing'
                    });
                }
            }
            
            // Question 2: Check for query parameters
            console.log('🔍 URL Analysis:', {
                href: window.location.href,
                search: window.location.search,
                hash: window.location.hash,
                pathname: window.location.pathname,
                hostname: window.location.hostname
            });
            
            // Question 2: Look for specific Telegram query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            
            console.log('🔍 Query Parameters Analysis:', {
                search_params: Object.fromEntries(urlParams.entries()),
                hash_params: Object.fromEntries(hashParams.entries()),
                has_tgWebAppData: urlParams.has('tgWebAppData') || hashParams.has('tgWebAppData'),
                has_tgGameQueryId: urlParams.has('tgGameQueryId') || hashParams.has('tgGameQueryId'),
                has_user_id: urlParams.has('user_id') || hashParams.has('user_id'),
                has_chat_id: urlParams.has('chat_id') || hashParams.has('chat_id'),
                has_message_id: urlParams.has('message_id') || hashParams.has('message_id')
            });
            
            console.log('🔍 === END TELEGRAM ANALYSIS ===');
            
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
                console.log(`📤 ${callId}: === TESTING QUESTION 1: TelegramGameProxy.postScore() ===`);
                console.log(`📤 ${callId}: Calling TelegramGameProxy.postScore(${finalScore})`);
                console.log(`📤 ${callId}: Current URL:`, window.location.href);
                console.log(`📤 ${callId}: Window parent:`, window.parent !== window ? 'in iframe' : 'not in iframe');
                
                try {
                    // Call the official method (Question 1 - using exactly as documented)
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
                
                // Question 1: Try alternative method - postEvent
                if (typeof window.TelegramGameProxy.postEvent === 'function') {
                    console.log(`📤 ${callId}: === TESTING QUESTION 1: TelegramGameProxy.postEvent() ===`);
                    try {
                        console.log(`📤 ${callId}: Trying postEvent('web_app_send_data', {score: ${finalScore}})`);
                        const eventResult = window.TelegramGameProxy.postEvent('web_app_send_data', {score: finalScore});
                        console.log(`✅ ${callId}: TelegramGameProxy.postEvent called, result:`, eventResult);
                        return true;
                    } catch (eventError) {
                        console.error(`❌ ${callId}: TelegramGameProxy.postEvent failed:`, eventError);
                    }
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
