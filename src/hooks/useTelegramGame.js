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
                console.log('✅ Telegram Game Proxy detected - setting isTelegramEnvironment = true');
                setIsTelegramEnvironment(true);
                setIsReady(true);
                console.log('🔍 Environment state after TelegramGameProxy detection:', {
                    TelegramGameProxy: !!window.TelegramGameProxy,
                    settingTelegramEnv: true,
                    settingReady: true
                });
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
        console.log('🎯 reportScore called with:', {
            score,
            isTelegramEnvironment,
            isReady,
            TelegramGameProxy: !!window.TelegramGameProxy
        });
        
        // Emergency override: if TelegramGameProxy is available now, proceed regardless of initial detection
        const runtimeTelegramCheck = !!window.TelegramGameProxy;
        
        if (!isTelegramEnvironment && !runtimeTelegramCheck) {
            console.log('⚠️ Not in Telegram environment, skipping score submission');
            console.log('⚠️ Environment check failed - debugging state:', {
                isTelegramEnvironment,
                isReady,
                TelegramGameProxy_available: !!window.TelegramGameProxy,
                Telegram_available: !!window.Telegram,
                WebApp_available: !!window.Telegram?.WebApp,
                current_url: window.location.href,
                in_iframe: window.parent !== window
            });
            return false;
        }
        
        if (runtimeTelegramCheck && !isTelegramEnvironment) {
            console.log('🔧 RUNTIME OVERRIDE: TelegramGameProxy available now, proceeding despite initial detection failure');
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
            console.log(`🎯 ${callId}: Attempting score submission via session bridge`);
            
            // Submit score using session-based approach
            try {
                // Get session ID from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const sessionId = urlParams.get('sessionId');
                
                if (sessionId) {
                    console.log(`🎯 ${callId}: Found session ID: ${sessionId}`);
                    
                    const sessionResponse = await fetch('/.netlify/functions/game-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'submit_score',
                            sessionId: sessionId,
                            score: finalScore
                        })
                    });
                    
                    if (sessionResponse.ok) {
                        const result = await sessionResponse.json();
                        console.log(`✅ ${callId}: Score submission successful!`, result);
                        
                        if (window.Telegram?.WebApp?.showAlert) {
                            window.Telegram.WebApp.showAlert(`🎉 Score ${finalScore} submitted to leaderboard!`);
                        }
                        return true;
                    } else {
                        const errorResult = await sessionResponse.json();
                        console.log(`❌ ${callId}: Score submission failed:`, errorResult);
                        return false;
                    }
                } else {
                    console.log(`⚠️ ${callId}: No session ID found in URL - game may not have been launched from Telegram bot`);
                    return false;
                }
            } catch (sessionError) {
                console.log(`❌ ${callId}: Session-based submission error:`, sessionError.message);
                return false;
            }

        } catch (error) {
            console.error('❌ Failed to report score:', error);
            return false;
        }
    }, [isTelegramEnvironment, isReady]);

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
