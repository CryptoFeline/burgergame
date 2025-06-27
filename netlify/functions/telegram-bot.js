const { Bot } = require('grammy');

const GAME_SHORT_NAME = 'buildergame'; // Step 1: Already registered with BotFather

exports.handler = async (event, context) => {
  console.log('🎮 Boss Burger Builder Bot - Clean Implementation');
  
  try {
    // Environment validation
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('❌ BOT_TOKEN environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Bot token not configured' })
      };
    }
    
    // Create bot instance
    const bot = new Bot(BOT_TOKEN);
    await bot.init();
    console.log('✅ Bot initialized successfully');
    
    // Handle GET requests (webhook setup)
    if (event.httpMethod === 'GET') {
      const webhookUrl = 'https://bossburgerbuild.netlify.app/.netlify/functions/telegram-bot';
      await bot.api.setWebhook(webhookUrl);
      console.log('✅ Webhook set to:', webhookUrl);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Webhook set successfully', url: webhookUrl })
      };
    }

    // =============================================================================
    // STEP 2: Launch the game from the bot
    // =============================================================================
    
    bot.command('start', async (ctx) => {
      try {
        console.log(`🎮 User ${ctx.from.first_name} (${ctx.from.id}) wants to play`);
        
        const welcomeText = `🍔 *Welcome to Boss Burger Builder!*

Stack burger ingredients to build the tallest tower possible!

🎯 *How to play:*
• Tap to drop ingredients and stack them perfectly
• Each perfect stack increases your score
• Miss the stack and lose a life!

Ready to become the ultimate Burger Boss? 🏆`;

        await ctx.reply(welcomeText, { parse_mode: 'Markdown' });
        
        // STEP 2: Send game with sendGame (via replyWithGame)
        await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🍔 Play Boss Burger Builder!", callback_game: {} }
              ],
              [
                { text: "🏆 View Leaderboard", callback_data: "show_leaderboard" }
              ]
            ]
          }
        });
        
      } catch (error) {
        console.error('❌ Error with start command:', error);
        await ctx.reply('❌ Sorry, there was an error starting the game. Please try again later.');
      }
    });

    bot.command('play', async (ctx) => {
      // Alternative trigger for launching the game
      try {
        console.log(`🎮 User ${ctx.from.first_name} (${ctx.from.id}) requested game via /play`);
        
        // STEP 2: Send game
        await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🍔 Play Boss Burger Builder!", callback_game: {} }
              ],
              [
                { text: "🏆 View Leaderboard", callback_data: "show_leaderboard" }
              ]
            ]
          }
        });
        
      } catch (error) {
        console.error('❌ Error with play command:', error);
        await ctx.reply('❌ Sorry, there was an error launching the game.');
      }
    });

    // =============================================================================
    // STEP 4 & 5: Handle callback queries and write scores
    // =============================================================================
    
    bot.on('callback_query', async (ctx) => {
      try {
        const callbackQuery = ctx.callbackQuery;
        console.log('📞 Callback query received:', {
          id: callbackQuery.id,
          user_id: ctx.from.id,
          user_name: ctx.from.first_name,
          game_short_name: callbackQuery.game_short_name,
          data: callbackQuery.data
        });

        // Handle game launch callback (when user clicks "Play" button)
        if (callbackQuery.game_short_name) {
          console.log(`🎮 Game launch: ${callbackQuery.game_short_name} by user ${ctx.from.id}`);
          
          // STEP 4: Acknowledge callback immediately (≤ 10s)
          await ctx.answerCallbackQuery({
            url: "https://bossburgerbuild.netlify.app?v=" + Date.now()
          });
          return;
        }

        // Handle score submission from TelegramGameProxy.postScore()
        // This arrives as a callback_query after postScore() is called
        if (callbackQuery.data && callbackQuery.data.includes('score')) {
          console.log('🎯 SCORE SUBMISSION DETECTED from TelegramGameProxy.postScore()');
          console.log('📊 Raw callback data:', callbackQuery.data);
          console.log('👤 User:', callbackQuery.from.first_name, `(${callbackQuery.from.id})`);
          console.log('💬 Chat ID:', callbackQuery.message?.chat?.id);
          console.log('📧 Message ID:', callbackQuery.message?.message_id);
          console.log('🕐 Timestamp:', new Date().toISOString());
          
          // STEP 4: Acknowledge callback immediately (≤ 10s) 
          await ctx.answerCallbackQuery({
            text: "📊 Submitting score...",
            show_alert: false
          });

          // Extract score from callback data (this comes from TelegramGameProxy.postScore)
          let score;
          try {
            // Try to parse as JSON first
            const gameData = JSON.parse(callbackQuery.data);
            score = Math.floor(gameData.score);
            console.log('📊 Parsed score from JSON:', score);
          } catch (parseError) {
            // Fallback: extract number from string
            const scoreMatch = callbackQuery.data.match(/score[:\s]*(\d+)/i);
            if (scoreMatch) {
              score = parseInt(scoreMatch[1]);
              console.log('📊 Parsed score from string match:', score);
            }
          }

          if (typeof score === 'number' && score >= 0) {
            console.log(`🎯 Valid score detected: ${score} - proceeding to save to Telegram Games API`);
            // STEP 5: Write score to Telegram's table
            await writeGameScore(ctx, score, callbackQuery);
          } else {
            console.error('❌ Invalid score data in callback:', callbackQuery.data);
            console.error('❌ Parsed score value:', score, typeof score);
            // Send error feedback
            await ctx.answerCallbackQuery({
              text: "❌ Invalid score data received",
              show_alert: true
            });
          }
          return;
        }

        // Handle leaderboard button
        if (callbackQuery.data === 'show_leaderboard') {
          console.log('🏆 Leaderboard requested');
          
          // STEP 4: Acknowledge callback immediately
          await ctx.answerCallbackQuery({
            text: "📊 Loading leaderboard...",
            show_alert: false
          });

          // STEP 6: Display leaderboard
          await showLeaderboard(ctx, callbackQuery);
          return;
        }

        // Default acknowledgment for any other callbacks
        await ctx.answerCallbackQuery();
        
      } catch (error) {
        console.error('❌ Error handling callback query:', error);
        
        // STEP 7: Always acknowledge to prevent timeouts
        try {
          await ctx.answerCallbackQuery({
            text: '❌ An error occurred. Please try again.'
          });
        } catch (answerError) {
          console.error('❌ Failed to answer callback query:', answerError);
        }
      }
    });

    // =============================================================================
    // STEP 5: Write the score to Telegram's table
    // =============================================================================
    
    async function writeGameScore(ctx, score, callbackQuery) {
      try {
        const userId = ctx.from.id;
        const userName = ctx.from.first_name;
        
        console.log(`� GAME OVER - Writing final score to Telegram Games API`);
        console.log(`👤 Player: ${userName} (${userId})`);
        console.log(`📊 Final Score: ${score}`);

        // STEP 5: Call setGameScore with correct Grammy.js parameters
        // Grammy.js expects: setGameScore(chat_id, message_id, user_id, score, options)
        let result;
        
        if (callbackQuery.message) {
          const chatId = callbackQuery.message.chat.id;
          const messageId = callbackQuery.message.message_id;
          console.log(`📍 Saving to chat message - Chat: ${chatId}, Message: ${messageId}`);
          
          result = await ctx.api.setGameScore(
            chatId,     // chat_id
            messageId,  // message_id
            userId,     // user_id
            score,      // score
            { force: true } // options
          );
        } else if (callbackQuery.inline_message_id) {
          console.log(`📍 Saving to inline message - ID: ${callbackQuery.inline_message_id}`);
          
          // For inline messages, use setGameScoreInline
          result = await ctx.api.setGameScoreInline(
            callbackQuery.inline_message_id, // inline_message_id
            userId,     // user_id
            score,      // score
            { force: true } // options
          );
        } else {
          throw new Error('No valid message identifiers found for score scoping');
        }
        
        console.log(`✅ SCORE SAVED SUCCESSFULLY to Telegram Games API:`, result);
        console.log(`🏆 Score ${score} for ${userName} is now in the leaderboard!`);

        // Send success feedback
        const message = getScoreMessage(userName, score);
        await ctx.answerCallbackQuery({
          text: message,
          show_alert: true
        });

      } catch (error) {
        console.error('❌ FAILED TO SAVE SCORE to Telegram Games API:', error);
        console.error('📊 Score that failed to save:', score);
        console.error('👤 User that failed to save:', ctx.from.first_name, ctx.from.id);
        
        // STEP 7: Handle reliability issues
        let errorMessage = '❌ Failed to save score';
        
        if (error.description?.includes('USER_ID_INVALID')) {
          errorMessage = '❌ Invalid user data - please restart the game';
        } else if (error.description?.includes('Bad Request')) {
          errorMessage = '❌ Invalid game session - please play again';
        } else if (error.description?.includes('QUERY_ID_INVALID')) {
          errorMessage = '❌ Session expired - score not saved';
        }

        await ctx.answerCallbackQuery({
          text: errorMessage,
          show_alert: true
        });
      }
    }

    // =============================================================================
    // STEP 6: Display leaderboard on demand
    // =============================================================================
    
    async function showLeaderboard(ctx, callbackQuery) {
      try {
        console.log('📊 Fetching leaderboard data');

        // STEP 6: Call getGameHighScores with correct parameter structure
        // Grammy.js expects: getGameHighScores(chat_id, message_id, user_id)
        const userId = ctx.from.id;
        let highScores;
        
        if (callbackQuery.message) {
          const chatId = callbackQuery.message.chat.id;
          const messageId = callbackQuery.message.message_id;
          console.log(`📍 Fetching scores for user ${userId}, chat ${chatId}, message ${messageId}`);
          
          // Call getGameHighScores with correct Grammy.js parameter order
          // Grammy expects: getGameHighScores(chat_id, message_id, user_id)
          highScores = await ctx.api.getGameHighScores(chatId, messageId, userId);
        } else if (callbackQuery.inline_message_id) {
          console.log(`📍 Fetching scores for user ${userId}, inline message ${callbackQuery.inline_message_id}`);
          
          // For inline messages, use getGameHighScoresInline method
          highScores = await ctx.api.getGameHighScoresInline(callbackQuery.inline_message_id, userId);
        } else {
          throw new Error('No valid message identifiers for leaderboard');
        }
        console.log(`📈 Retrieved ${highScores.length} high scores`);

        if (highScores.length === 0) {
          await ctx.reply('🏆 *Leaderboard*\n\n📭 No scores yet! Be the first to play and set a score!', 
                         { parse_mode: 'Markdown' });
          return;
        }

        // Format leaderboard message
        let leaderboardText = '🏆 *LEADERBOARD*\n\n';
        
        highScores.forEach((entry, index) => {
          const position = entry.position || (index + 1);
          const user = entry.user;
          const score = entry.score;
          
          // Format user name
          let userName = user.first_name || 'Unknown';
          if (user.last_name) {
            userName += ` ${user.last_name}`;
          }
          
          // Add ranking emoji
          let emoji = '📊';
          if (position === 1) emoji = '🥇';
          else if (position === 2) emoji = '🥈';
          else if (position === 3) emoji = '🥉';
          else if (position <= 10) emoji = '🏆';
          
          leaderboardText += `${emoji} *${position}.* ${userName} - \`${score}\` pts\n`;
        });

        leaderboardText += `\n📊 Total players: ${highScores.length}`;

        // Send leaderboard
        await ctx.reply(leaderboardText, { parse_mode: 'Markdown' });

      } catch (error) {
        console.error('❌ Error fetching leaderboard:', error);
        
        let errorMessage = '📊 *Leaderboard*\n\n❌ Unable to load scores right now.';
        
        if (error.description?.includes('Bad Request')) {
          errorMessage += '\n\n💡 No scores have been submitted yet. Play the game to be the first on the leaderboard!';
        }
        
        await ctx.reply(errorMessage, { parse_mode: 'Markdown' });
      }
    }

    // =============================================================================
    // Helper Functions
    // =============================================================================
    
    function getScoreMessage(userName, score) {
      if (score === 0) {
        return `🎯 Nice try, ${userName}! Practice makes perfect!`;
      } else if (score < 10) {
        return `🎯 Good start, ${userName}! You scored ${score} points.`;
      } else if (score < 25) {
        return `🏆 Great job, ${userName}! ${score} points - well done!`;
      } else if (score < 50) {
        return `🌟 Amazing, ${userName}! ${score} points is impressive!`;
      } else {
        return `🔥 INCREDIBLE, ${userName}! ${score} points - you're a Burger Boss!`;
      }
    }

    // Help command
    bot.command('help', async (ctx) => {
      const helpText = `🍔 *Boss Burger Builder Bot*

🎮 *Commands:*
/start - Launch the game
/play - Launch the game  
/help - Show this help

🏆 *Features:*
• Stack burger ingredients to build towers
• Submit scores automatically when playing
• View leaderboards with the 🏆 button
• Compete with friends in groups!

Built with Telegram's Games API 🚀`;

      await ctx.reply(helpText, { parse_mode: 'Markdown' });
    });

    // Handle POST requests (webhook updates)
    if (event.httpMethod === 'POST') {
      let update;
      try {
        update = JSON.parse(event.body);
        console.log('📨 Webhook update received');
        
        // Check for callback queries specifically
        if (update.callback_query) {
          console.log('📞 Callback query in update:', {
            id: update.callback_query.id,
            game_short_name: update.callback_query.game_short_name,
            has_data: !!update.callback_query.data
          });
        }
        
      } catch (parseError) {
        console.error('❌ Error parsing webhook update:', parseError);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }
      
      // Process the update
      await bot.handleUpdate(update);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Update processed successfully' })
      };
    }
    
    // Handle other HTTP methods
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('❌ Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
