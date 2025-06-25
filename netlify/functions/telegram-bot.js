const { Bot } = require('grammy');

// Initialize bot
let bot;

const initBot = async () => {
  if (!bot) {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN environment variable is required');
    }
    bot = new Bot(BOT_TOKEN);
    
    // Initialize the bot to avoid "Bot not initialized" error
    try {
      await bot.init();
      console.log('🤖 Bot initialized successfully');
    } catch (initError) {
      console.error('❌ Bot initialization failed:', initError);
      throw initError;
    }
    
    // Game configuration
    const GAME_SHORT_NAME = 'buildergame'; // Updated to match BotFather assignment
    
    // Start command - shows the game
    bot.command('start', async (ctx) => {
      try {
        console.log(`👤 User ${ctx.from.first_name} (${ctx.from.id}) started the bot`);
        
        await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [[
              { text: "🍔 Play BossBurger Builder!", callback_game: {} }
            ]]
          }
        });
      } catch (error) {
        console.error('❌ Error sending game:', error);
        await ctx.reply('❌ Sorry, there was an error starting the game. Please try again later.');
      }
    });

    // Help command
    bot.command('help', async (ctx) => {
      const helpText = `
🍔 *Boss Burger Builder Bot*

Welcome to the ultimate burger stacking challenge!

*How to play:*
• Tap to drop ingredients and stack them perfectly
• Build the tallest burger tower you can
• Each perfect stack increases your score
• Miss the stack and lose a life!

*Commands:*
/start - Play the game
/highscores - View the leaderboard  
/help - Show this help message

*Features:*
🏆 Built-in leaderboards for groups and private chats
🎮 Perfect stacking mechanics with physics
🎵 Immersive sound effects and music
📱 Works great on mobile and desktop

Good luck, burger boss! 🎯`;

      await ctx.reply(helpText, { parse_mode: 'Markdown' });
    });

    // Command to get game statistics
    bot.command('stats', async (ctx) => {
      try {
        const chatId = ctx.chat.id;
        const chatType = ctx.chat.type;
        
        let statsText = "📊 *Game Statistics*\n\n";
        
        if (chatType === 'private') {
          statsText += "🏠 This is your private game space.\n";
          statsText += "🎮 All your scores are tracked here.\n";
          statsText += "📤 Use the share button in-game to challenge friends!\n";
        } else {
          const chatTitle = ctx.chat.title || 'this group';
          statsText += `🏘️ Group: *${chatTitle}*\n`;
          statsText += "🏆 Leaderboards are shared among all group members.\n";
          statsText += "🎯 Compete with your friends for the highest score!\n";
        }
        
        statsText += "\n🍔 Start playing with /start\n";
        statsText += "🏆 View rankings with /highscores";
        
        await ctx.reply(statsText, { parse_mode: 'Markdown' });
        
      } catch (error) {
        console.error('❌ Error with stats command:', error);
        await ctx.reply('❌ Unable to get statistics right now.');
      }
    });

    // Handle callback queries (including game scores)
    bot.on('callback_query', async (ctx) => {
      try {
        const callbackQuery = ctx.callbackQuery;
        
        // Handle game callback (when user clicks "Play Game")
        if (callbackQuery.game_short_name) {
          console.log(`🎮 User ${ctx.from.first_name} (${ctx.from.id}) clicked to play game: ${callbackQuery.game_short_name}`);
          
          // Answer the callback query with the game URL
          await ctx.answerCallbackQuery({
            url: "https://bossburgerbuild.netlify.app"
          });
          return;
        }
        
        // Handle score submission from the game
        if (callbackQuery.data) {
          let gameData;
          try {
            gameData = JSON.parse(callbackQuery.data);
          } catch (parseError) {
            console.log('📦 Non-JSON callback data:', callbackQuery.data);
            await ctx.answerCallbackQuery();
            return;
          }
          
          console.log('📊 Received game data:', gameData);
          
          if (gameData.type === 'game_score' && typeof gameData.score === 'number') {
            const userId = ctx.from.id;
            const chatId = ctx.chat?.id;
            const messageId = callbackQuery.message?.message_id;
            const score = Math.floor(gameData.score); // Ensure integer score
            
            console.log(`🏆 Setting score ${score} for user ${ctx.from.first_name} (${userId})`);
            
            try {
              // Set the game score using Telegram's built-in leaderboard
              const setScoreResult = await ctx.api.setGameScore(userId, score, {
                chat_id: chatId,
                message_id: messageId,
                force: true, // Allow score updates even if lower
                disable_edit_message: false
              });
              
              console.log(`✅ Score ${score} successfully set for user ${userId}. Result:`, setScoreResult);
              
              // Create personalized confirmation message
              let message;
              const userName = ctx.from.first_name;
              
              if (score === 0) {
                message = `� Nice try, ${userName}! Practice makes perfect - keep building those burger towers!`;
              } else if (score < 10) {
                message = `🎯 Good start, ${userName}! You scored ${score} points. Can you build an even taller tower?`;
              } else if (score < 25) {
                message = `🏆 Impressive, ${userName}! ${score} points is a solid score! The leaderboard has been updated.`;
              } else if (score < 50) {
                message = `🌟 Amazing work, ${userName}! ${score} points - you're becoming a burger stacking master!`;
              } else {
                message = `🔥 INCREDIBLE, ${userName}! ${score} points is absolutely phenomenal! You're a true Burger Boss!`;
              }
              
              // Add chat context for groups
              if (ctx.chat.type !== 'private') {
                message += ` Check out the group leaderboard with /highscores!`;
              }
              
              await ctx.answerCallbackQuery(message, { show_alert: true });
              
            } catch (scoreError) {
              console.error('❌ Error setting game score:', scoreError);
              
              // Provide helpful error message based on error type
              let errorMessage = '❌ There was an issue saving your score.';
              
              if (scoreError.error_code === 400) {
                errorMessage = '❌ Invalid score data. Please try playing again.';
              } else if (scoreError.error_code === 403) {
                errorMessage = '❌ Permission denied. The bot might need to be re-added to this chat.';
              }
              
              // Still answer the callback query to prevent timeout
              await ctx.answerCallbackQuery(errorMessage, { show_alert: true });
            }
          } else {
            console.log('⚠️ Invalid game data format:', gameData);
            await ctx.answerCallbackQuery('❌ Invalid score data received.');
          }
        } else {
          // Generic callback query without data
          await ctx.answerCallbackQuery();
        }
        
      } catch (error) {
        console.error('❌ Error handling callback query:', error);
        
        // Always try to answer the callback query to prevent timeout
        try {
          await ctx.answerCallbackQuery('❌ An error occurred. Please try again.');
        } catch (answerError) {
          console.error('❌ Error answering callback query:', answerError);
        }
      }
    });

    // Handle high scores command
    bot.command('highscores', async (ctx) => {
      try {
        console.log(`🏆 High scores requested by ${ctx.from.first_name} (${ctx.from.id}) in chat ${ctx.chat.id}`);
        
        // For groups, show the game with a "View Leaderboard" button
        // For private chats, show the same
        await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [[
              { text: "🏆 View Leaderboard", callback_game: {} }
            ]]
          }
        });
        
        // Send additional helpful text
        const helpText = ctx.chat.type === 'private' 
          ? "🎮 Click the button above to see the leaderboard and play again!"
          : "🎮 Click the button above to see the group leaderboard and play!";
        
        await ctx.reply(helpText);
        
      } catch (error) {
        console.error('❌ Error with highscores command:', error);
        await ctx.reply('❌ Unable to show high scores right now. Please try again later.');
      }
    });

    // Handle inline queries (for sharing scores)
    bot.on('inline_query', async (ctx) => {
      try {
        const query = ctx.inlineQuery.query;
        console.log(`🔍 Inline query from ${ctx.from.first_name}: "${query}"`);
        
        // Prepare game result for sharing
        const results = [{
          type: 'game',
          id: 'share_game',
          game_short_name: GAME_SHORT_NAME,
          reply_markup: {
            inline_keyboard: [[
              { text: "🍔 Play BossBurger Builder!", callback_game: {} }
            ]]
          }
        }];
        
        await ctx.answerInlineQuery(results, {
          cache_time: 0,
          is_personal: false
        });
        
      } catch (error) {
        console.error('❌ Error handling inline query:', error);
        // Always try to answer even on error
        try {
          await ctx.answerInlineQuery([], { cache_time: 1 });
        } catch (answerError) {
          console.error('❌ Error answering inline query:', answerError);
        }
      }
    });
  }
  
  return bot;
};

// Netlify Function handler
exports.handler = async (event, context) => {
  console.log('Function called with method:', event.httpMethod);
  console.log('Environment check - BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
  
  // Handle CORS for preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const bot = await initBot();
    console.log('Bot initialized successfully');
    
    if (event.httpMethod === 'POST') {
      // Handle Telegram webhook
      const update = JSON.parse(event.body);
      console.log('📨 Received webhook update:', JSON.stringify(update, null, 2));
      
      await bot.handleUpdate(update);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ok: true })
      };
    }
    
    if (event.httpMethod === 'GET') {
      // Handle webhook setup and info
      const webhookUrl = `https://${event.headers.host}/.netlify/functions/telegram-bot`;
      
      // Check if this is a bot info request
      if (event.queryStringParameters?.action === 'botinfo') {
        try {
          const botInfo = await bot.api.getMe();
          console.log('🤖 Bot info:', botInfo);
          
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              bot_info: botInfo,
              status: 'active'
            })
          };
        } catch (botInfoError) {
          console.error('❌ Failed to get bot info:', botInfoError);
          return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              error: 'Failed to get bot info',
              details: botInfoError.message 
            })
          };
        }
      }
      
      // Check if this is a webhook info request
      if (event.queryStringParameters?.action === 'info') {
        try {
          const webhookInfo = await bot.api.getWebhookInfo();
          console.log('📊 Webhook info:', webhookInfo);
          
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              webhook_info: webhookInfo,
              expected_url: webhookUrl,
              status: webhookInfo.url === webhookUrl ? 'correct' : 'mismatch'
            })
          };
        } catch (webhookInfoError) {
          console.error('❌ Failed to get webhook info:', webhookInfoError);
          return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              error: 'Failed to get webhook info',
              details: webhookInfoError.message 
            })
          };
        }
      }
      
      // Default: Set up webhook
      try {
        await bot.api.setWebhook(webhookUrl);
        console.log(`✅ Webhook set to: ${webhookUrl}`);
        
        // Also get current webhook info for verification
        const webhookInfo = await bot.api.getWebhookInfo();
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            message: 'Webhook set successfully',
            webhook_url: webhookUrl,
            webhook_info: webhookInfo
          })
        };
      } catch (webhookError) {
        console.error('❌ Failed to set webhook:', webhookError);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Failed to set webhook',
            details: webhookError.message 
          })
        };
      }
    }
    
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('❌ Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
