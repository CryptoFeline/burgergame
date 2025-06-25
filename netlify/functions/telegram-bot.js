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
    const GAME_SHORT_NAME = 'builder';
    
    // Start command - shows the web app
    bot.command('start', async (ctx) => {
      try {
        console.log(`👤 User ${ctx.from.first_name} (${ctx.from.id}) started the bot`);
        
        // For Web Apps, we send a message with an inline keyboard
        await ctx.reply('🍔 Welcome to Boss Burger Builder!\n\nReady to stack some burgers?', {
          reply_markup: {
            inline_keyboard: [[
              { 
                text: "🍔 Play BossBurger Builder!", 
                web_app: { 
                  url: "https://bossburgerbuild.netlify.app" 
                } 
              }
            ]]
          }
        });
      } catch (error) {
        console.error('❌ Error sending web app:', error);
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

    // Handle callback queries and web app data
    bot.on('callback_query', async (ctx) => {
      try {
        await ctx.answerCallbackQuery();
      } catch (error) {
        console.error('❌ Error answering callback query:', error);
      }
    });

    // Handle web app data (scores from the game)
    bot.on('message:web_app_data', async (ctx) => {
      try {
        const webAppData = ctx.message.web_app_data;
        console.log('📊 Received web app data:', webAppData);
        
        let gameData;
        try {
          gameData = JSON.parse(webAppData.data);
        } catch (parseError) {
          console.log('📦 Invalid JSON in web app data:', webAppData.data);
          return;
        }
        
        if (gameData.type === 'game_score' && typeof gameData.score === 'number') {
          const score = Math.floor(gameData.score);
          const userName = ctx.from.first_name;
          
          console.log(`🏆 Score ${score} received from ${userName} (${ctx.from.id})`);
          
          // Send confirmation to user
          const message = score > 0 
            ? `🎉 Amazing, ${userName}! Your burger tower score of ${score} has been recorded!`
            : `👍 Thanks for playing, ${userName}! Keep practicing to build taller burger towers!`;
          
          await ctx.reply(message);
          
          // Here you could save the score to a database
          // For now, we just log it
          console.log(`💾 Score saved: User ${ctx.from.id} (${userName}) scored ${score}`);
          
        } else {
          console.log('⚠️ Invalid game data format:', gameData);
        }
        
      } catch (error) {
        console.error('❌ Error handling web app data:', error);
      }
    });

    // Handle high scores command
    bot.command('highscores', async (ctx) => {
      try {
        await ctx.reply('🏆 To see high scores, start the game first with /start!');
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
      // Handle webhook setup
      const webhookUrl = `https://${event.headers.host}/.netlify/functions/telegram-bot`;
      
      try {
        await bot.api.setWebhook(webhookUrl);
        console.log(`✅ Webhook set to: ${webhookUrl}`);
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            message: 'Webhook set successfully',
            webhook_url: webhookUrl 
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
