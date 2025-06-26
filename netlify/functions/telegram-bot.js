const { Bot } = require('grammy');

const GAME_SHORT_NAME = 'buildergame';

exports.handler = async (event, context) => {
  console.log('Function called with method:', event.httpMethod);
  
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
    
    console.log('Environment check - BOT_TOKEN exists:', !!BOT_TOKEN);
    
    // Create bot instance and initialize it
    const bot = new Bot(BOT_TOKEN);
    await bot.init(); // Initialize the bot before using it
    console.log('🤖 Bot initialized successfully');
    
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
    
    // Start command - launch the game
    bot.command('start', async (ctx) => {
      try {
        console.log(`👤 User ${ctx.from.first_name} (${ctx.from.id}) started the bot`);
        
        const welcomeText = `
🍔 *Welcome to Boss Burger Builder!*

Stack burger ingredients to build the tallest tower possible!

🎯 *How to play:*
• Tap to drop ingredients
• Stack them perfectly to build higher
• Each perfect stack increases your score
• Miss the stack and lose a life!

Ready to become the ultimate Burger Boss? 🏆`;

        await ctx.reply(welcomeText, { parse_mode: 'Markdown' });
        
        // Send the game with multiple buttons (first button must launch the game)
        await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🍔 Play BossBurger Builder!", callback_game: {} }
              ],
              [
                { text: "🏆 View Leaderboard", callback_data: "show_leaderboard" },
                { text: "❓ How to Play", callback_data: "show_rules" }
              ],
              [
                { text: "📤 Share Game", switch_inline_query: "Check out this awesome burger stacking game! 🍔" }
              ]
            ]
          }
        });
        
      } catch (error) {
        console.error('❌ Error with start command:', error);
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
/scores - Lookup actual score data
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

    // Command to show leaderboard for current chat
    bot.command('leaderboard', async (ctx) => {
      try {
        console.log(`📊 Leaderboard requested by ${ctx.from.first_name} (${ctx.from.id}) in chat ${ctx.chat.id}`);
        
        // Send a simple text-based leaderboard request
        let responseText = "🏆 *LEADERBOARD*\n\n";
        
        if (ctx.chat.type === 'private') {
          responseText += "This is your private leaderboard.\n";
          responseText += "Scores from games you've played will appear here.\n\n";
        } else {
          const chatTitle = ctx.chat.title || 'this group';
          responseText += `Group: *${chatTitle}*\n`;
          responseText += "Showing scores from all group members.\n\n";
        }
        
        responseText += "🎮 Use /start to play and set your score!\n";
        responseText += "📈 Use /highscores to see live rankings!";
        
        await ctx.reply(responseText, { parse_mode: 'Markdown' });
        
      } catch (error) {
        console.error('❌ Error with leaderboard command:', error);
        await ctx.reply('❌ Unable to show leaderboard right now.');
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
          // Handle special button callbacks
          if (callbackQuery.data === 'show_leaderboard') {
            await ctx.answerCallbackQuery();
            // Trigger the highscores command
            return await bot.handleUpdate({
              message: {
                text: '/highscores',
                chat: ctx.chat,
                from: ctx.from,
                message_id: Date.now()
              }
            });
          }
          
          if (callbackQuery.data === 'show_rules') {
            const rulesText = `
🍔 *How to Play Boss Burger Builder*

🎯 *Objective:* Build the tallest burger tower possible!

🎮 *Controls:*
• Tap anywhere to drop ingredients
• Time your taps perfectly to stack ingredients
• Each perfect stack increases your score

🏆 *Scoring:*
• Perfect stacks = Maximum points
• Near misses = Partial points  
• Complete misses = Lost life
• 3 lives total

💡 *Pro Tips:*
• Watch the swinging ingredient carefully
• Time your tap when it's perfectly aligned
• Build higher for bigger scores
• Practice makes perfect!

Good luck, Burger Boss! 🍔`;

            await ctx.answerCallbackQuery();
            await ctx.reply(rulesText, { parse_mode: 'Markdown' });
            return;
          }
          
          if (callbackQuery.data === 'refresh_leaderboard') {
            await ctx.answerCallbackQuery('🔄 Leaderboard refreshed!');
            // The game message itself will show updated scores automatically
            return;
          }
          
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
              // According to the documentation, this will automatically update the game message with high scores
              const setScoreResult = await ctx.api.setGameScore(userId, score, {
                chat_id: chatId,
                message_id: messageId,
                force: true, // Allow score updates even if lower
                disable_edit_message: false // Let Telegram automatically update the message with leaderboard
              });
              
              console.log(`✅ Score ${score} successfully set for user ${userId}. Result:`, setScoreResult);
              
              // Create personalized confirmation message
              let message;
              const userName = ctx.from.first_name;
              
              if (score === 0) {
                message = `🎯 Nice try, ${userName}! Practice makes perfect - keep building those burger towers!`;
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
                message += ` The game message has been updated with the latest leaderboard!`;
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
            console.log('📦 Invalid game data structure:', gameData);
            await ctx.answerCallbackQuery('❌ Invalid score data received.');
          }
        } else {
          console.log('📦 Unknown callback query type');
          await ctx.answerCallbackQuery();
        }
        
      } catch (error) {
        console.error('❌ Error handling callback query:', error);
        
        // Always answer the callback query to prevent timeout
        try {
          await ctx.answerCallbackQuery('❌ An error occurred. Please try again.');
        } catch (answerError) {
          console.error('❌ Error answering callback query:', answerError);
        }
      }
    });

    // Handle high scores command - Create a game message that shows the leaderboard
    bot.command('highscores', async (ctx) => {
      try {
        console.log(`🏆 High scores requested by ${ctx.from.first_name} (${ctx.from.id}) in chat ${ctx.chat.id}`);
        
        // According to Telegram's Games API documentation:
        // "A game message will also display high scores for the current chat"
        // So we create a game message, and Telegram automatically shows the leaderboard
        
        // Send game message - Telegram will automatically add high scores to this message when scores exist
        await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🎮 Play & Set Your Score!", callback_game: {} }
              ],
              [
                { text: "🔄 Refresh", callback_data: "refresh_leaderboard" },
                { text: "📤 Share", switch_inline_query: "Join me in Boss Burger Builder! 🍔" }
              ]
            ]
          }
        });
        
        // Send explanation message
        let explanationText;
        if (ctx.chat.type === 'private') {
          explanationText = "🏆 *Your Personal Leaderboard*\n\n";
          explanationText += "High scores from your games will appear in the game message above.\n\n";
        } else {
          const chatTitle = ctx.chat.title || 'this group';
          explanationText = `🏆 *${chatTitle} Leaderboard*\n\n`;
          explanationText += "Top scores from all group members will appear in the game message above.\n\n";
        }
        
        explanationText += "ℹ️ *How the leaderboard works:*\n";
        explanationText += "• Play the game above to submit your score\n";
        explanationText += "• Telegram automatically updates the game message with high scores\n";
        explanationText += "• Only your best score for this chat is displayed\n";
        explanationText += "• Scores are persistent and tied to the game message\n\n";
        
        if (ctx.chat.type === 'private') {
          explanationText += "🏠 This is your personal leaderboard\n";
          explanationText += "📤 Share your scores with friends using the share button in-game!";
        } else {
          explanationText += "🏆 All group members compete on the same leaderboard\n";
          explanationText += "🥇 May the best burger builder win!";
        }
        
        await ctx.reply(explanationText, { parse_mode: 'Markdown' });
        
      } catch (error) {
        console.error('❌ Error with highscores command:', error);
        await ctx.reply('❌ Unable to show leaderboard right now. Please try again later.');
      }
    });

    // Alternative scores command to try fetching actual leaderboard data
    bot.command('scores', async (ctx) => {
      try {
        console.log(`📊 Scores lookup requested by ${ctx.from.first_name} (${ctx.from.id}) in chat ${ctx.chat.id}`);
        
        // This command attempts to demonstrate getGameHighScores functionality
        let statusText = "📊 *SCORE LOOKUP*\n\n";
        statusText += "This command demonstrates how to fetch actual game scores.\n\n";
        
        if (ctx.chat.type === 'private') {
          statusText += "🏠 Searching your personal game history\n";
        } else {
          const chatTitle = ctx.chat.title || 'this group';
          statusText += `🏘️ Searching *${chatTitle}* game history\n`;
        }
        
        statusText += "\n💡 Note: Scores can only be retrieved from game messages that have received score submissions.\n";
        statusText += "📈 Use /highscores for the main leaderboard display";
        
        await ctx.reply(statusText, { parse_mode: 'Markdown' });
        
        // Create a game message that could potentially show scores if they exist
        const gameMessage = await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🎯 Play to Submit Score!", callback_game: {} }
              ]
            ]
          }
        });
        
        // Try to get scores (this will likely fail unless there are existing scores)
        try {
          const testScores = await ctx.api.getGameHighScores(
            ctx.from.id,
            {
              chat_id: ctx.chat.id,
              message_id: gameMessage.message_id
            }
          );
          
          if (testScores && testScores.length > 0) {
            let scoresText = "🎯 *Found scores:*\n\n";
            testScores.forEach((score, index) => {
              const userName = score.user.first_name + (score.user.last_name ? ` ${score.user.last_name}` : '');
              scoresText += `${index + 1}. ${userName}: ${score.score} pts\n`;
            });
            await ctx.reply(scoresText, { parse_mode: 'Markdown' });
          } else {
            await ctx.reply("🤔 No scores found for this message. Scores only appear after players submit them!");
          }
        } catch (scoresError) {
          console.log('Expected error fetching scores for new message:', scoresError.message);
          await ctx.reply("ℹ️ No existing scores found. Play the game above to submit scores!");
        }
        
      } catch (error) {
        console.error('❌ Error with scores command:', error);
        await ctx.reply('❌ Unable to lookup scores right now.');
      }
    });

    // Handle inline queries (for sharing scores)
    bot.on('inline_query', async (ctx) => {
      try {
        const query = ctx.inlineQuery.query;
        console.log(`🔍 Inline query from ${ctx.from.first_name}: "${query}"`);
        
        // Provide a default game result for inline sharing
        const gameResult = {
          type: 'game',
          id: 'burger_game_share',
          game_short_name: GAME_SHORT_NAME
        };
        
        await ctx.answerInlineQuery([gameResult], {
          cache_time: 30,
          is_personal: true
        });
        
      } catch (error) {
        console.error('❌ Error handling inline query:', error);
        await ctx.answerInlineQuery([]);
      }
    });

    // Handle POST requests (webhook updates)
    if (event.httpMethod === 'POST') {
      let update;
      try {
        update = JSON.parse(event.body);
        console.log('📨 Received webhook update:', JSON.stringify(update, null, 2));
      } catch (parseError) {
        console.error('❌ Error parsing webhook update:', parseError);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }
      
      // Process the update using grammy
      console.log('Bot initialized successfully');
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
