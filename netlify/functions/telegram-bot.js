const { Bot } = require('grammy');

// Initialize bot
let bot;

const initBot = () => {
  if (!bot) {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      throw new Error('BOT_TOKEN environment variable is required');
    }
    bot = new Bot(BOT_TOKEN);
    
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
/help - Show this help message

Good luck, burger boss! 🎯`;

      await ctx.reply(helpText, { parse_mode: 'Markdown' });
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
              await ctx.api.setGameScore(userId, score, {
                chat_id: chatId,
                message_id: messageId,
                force: true, // Allow score updates even if lower
                disable_edit_message: false
              });
              
              console.log(`✅ Score ${score} successfully set for user ${userId}`);
              
              // Answer callback query with confirmation
              const message = score > 0 
                ? `🎉 Amazing! Your burger tower score of ${score} has been saved!`
                : `👍 Score saved! Keep practicing to build taller burger towers!`;
              
              await ctx.answerCallbackQuery(message, { show_alert: true });
              
            } catch (scoreError) {
              console.error('❌ Error setting game score:', scoreError);
              
              // Still answer the callback query to prevent timeout
              await ctx.answerCallbackQuery(
                '❌ There was an issue saving your score. Please try again.',
                { show_alert: true }
              );
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
        // Get high scores for this chat
        await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [[
              { text: "🏆 View High Scores", callback_game: {} }
            ]]
          }
        });
      } catch (error) {
        console.error('❌ Error with highscores command:', error);
        await ctx.reply('❌ Unable to get high scores right now.');
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
    const bot = initBot();
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
