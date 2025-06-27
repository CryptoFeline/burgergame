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
        
        // Check if this is a score submission from the game
        const commandText = ctx.message.text;
        const scoreMatch = commandText.match(/\/start score_(\d+)/);
        
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1]);
          console.log(`🎯 Score submission via start command: ${score} from user ${ctx.from.first_name} (${ctx.from.id})`);
          
          // Create a game message and set the score
          const gameMessage = await ctx.replyWithGame(GAME_SHORT_NAME, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🎮 Play Again!", callback_game: {} }
                ],
                [
                  { text: "🏆 View Leaderboard", callback_data: "show_leaderboard" },
                  { text: "📤 Share Score", switch_inline_query: `I scored ${score} points in Boss Burger Builder! 🍔` }
                ]
              ]
            }
          });
          
          // Submit the score
          try {
            await ctx.api.setGameScore({
              user_id: ctx.from.id,
              score: score,
              chat_id: ctx.chat.id,
              message_id: gameMessage.message_id,
              force: true,
              disable_edit_message: false
            });
            
            let message = `🏆 Score ${score} submitted successfully!`;
            if (score === 0) {
              message = `🎯 Score submitted! Practice makes perfect - keep building those burger towers!`;
            } else if (score < 10) {
              message = `🎯 Score ${score} submitted! Not bad for a start. Can you build an even taller tower?`;
            } else if (score < 25) {
              message = `🏆 Great job! Score ${score} has been added to the leaderboard!`;
            } else if (score < 50) {
              message = `🌟 Amazing! ${score} points - you're becoming a burger stacking master!`;
            } else {
              message = `🔥 INCREDIBLE! ${score} points is absolutely phenomenal! You're a true Burger Boss!`;
            }
            
            await ctx.reply(message);
            return;
            
          } catch (scoreError) {
            console.error('❌ Error setting score from start command:', scoreError);
            await ctx.reply('❌ Error submitting score. Please try the /submitscore command instead.');
          }
        }
        
        // Regular start command
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
/advanced_scores - Detailed leaderboard with statistics
/submitscore [score] - Manually submit a score
/help - Show this help message

*Features:*
🏆 Built-in leaderboards for groups and private chats
🎮 Perfect stacking mechanics with physics
🎵 Immersive sound effects and music
📱 Works great on mobile and desktop
🔬 Advanced score analytics using Telegram's API

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

    // Command to submit score manually
    bot.command('submitscore', async (ctx) => {
      try {
        console.log(`🎯 Manual score submission requested by ${ctx.from.first_name} (${ctx.from.id})`);
        
        // Extract score from command text
        const commandText = ctx.message.text;
        const scoreMatch = commandText.match(/\/submitscore\s+(\d+)/);
        
        if (!scoreMatch) {
          await ctx.reply('🎯 *Submit Your Score*\n\nUsage: `/submitscore [your_score]`\n\nExample: `/submitscore 25`\n\nThis will submit your score to the leaderboard!', { parse_mode: 'Markdown' });
          return;
        }
        
        const score = parseInt(scoreMatch[1]);
        
        if (score < 0 || score > 10000) {
          await ctx.reply('❌ Invalid score. Please enter a score between 0 and 10000.');
          return;
        }
        
        // Create a game message and immediately set the score
        const gameMessage = await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🎮 Play Again!", callback_game: {} }
              ],
              [
                { text: "🏆 View Leaderboard", callback_data: "show_leaderboard" },
                { text: "📤 Share", switch_inline_query: "I scored " + score + " points in Boss Burger Builder! 🍔" }
              ]
            ]
          }
        });
        
        // Submit the score to this game message
        try {
          console.log(`🎯 Attempting to set score ${score} for user ${ctx.from.id} in chat ${ctx.chat.id}, message ${gameMessage.message_id}`);
          
          const setScoreResult = await ctx.api.setGameScore({
            user_id: ctx.from.id,
            score: score,
            chat_id: ctx.chat.id,
            message_id: gameMessage.message_id,
            force: true,
            disable_edit_message: false
          });
          
          console.log(`✅ Manual score ${score} set successfully for user ${ctx.from.id}. Result:`, setScoreResult);
          
          let message = `🏆 Score ${score} submitted successfully!`;
          if (score === 0) {
            message = `🎯 Score submitted! Practice makes perfect - keep building those burger towers!`;
          } else if (score < 10) {
            message = `🎯 Score ${score} submitted! Not bad for a start. Can you build an even taller tower?`;
          } else if (score < 25) {
            message = `🏆 Great job! Score ${score} has been added to the leaderboard!`;
          } else if (score < 50) {
            message = `🌟 Amazing! ${score} points - you're becoming a burger stacking master!`;
          } else {
            message = `🔥 INCREDIBLE! ${score} points is absolutely phenomenal! You're a true Burger Boss!`;
          }
          
          await ctx.reply(message);
          
        } catch (scoreError) {
          console.error('❌ Error setting manual score:', scoreError);
          await ctx.reply('❌ Error submitting score. Please try again.');
        }
        
      } catch (error) {
        console.error('❌ Error with submitscore command:', error);
        await ctx.reply('❌ Unable to submit score right now.');
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
            // Show a helpful message about the leaderboard
            await ctx.answerCallbackQuery({
              text: '🏆 Leaderboard will appear here after players submit scores!',
              show_alert: true
            });
            return;
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
            await ctx.answerCallbackQuery({
              text: '🔄 Leaderboard refreshed!'
            });
            // The game message itself will show updated scores automatically
            return;
          }
          
          if (callbackQuery.data === 'refresh_advanced_scores') {
            try {
              const messageId = callbackQuery.message?.message_id;
              const chatId = callbackQuery.message?.chat?.id;
              
              if (!messageId || !chatId) {
                await ctx.answerCallbackQuery({
                  text: '❌ Unable to refresh - invalid message data'
                });
                return;
              }
              
              // Call getGameHighScores for the current message
              const highScoresResult = await ctx.api.raw.getGameHighScores({
                user_id: ctx.from.id,
                chat_id: chatId,
                message_id: messageId
              });
              
              console.log('🔄 Refreshed advanced scores:', JSON.stringify(highScoresResult, null, 2));
              
              let refreshText = "🔄 *Advanced Scores Refreshed*\n\n";
              
              if (highScoresResult.result && highScoresResult.result.length > 0) {
                const playerCount = highScoresResult.result.length;
                const topScore = highScoresResult.result[0]?.score || 0;
                const topPlayer = highScoresResult.result[0]?.user?.first_name || 'Unknown';
                
                refreshText += `👑 Leader: ${topPlayer} (${topScore} pts)\n`;
                refreshText += `🏆 Total players: ${playerCount}\n`;
                refreshText += `📊 Data updated from Telegram API`;
              } else {
                refreshText += "📭 No scores available yet.\n";
                refreshText += "🎮 Play the game to set the first score!";
              }
              
              await ctx.answerCallbackQuery({
                text: refreshText,
                show_alert: true
              });
              
            } catch (refreshError) {
              console.error('❌ Error refreshing advanced scores:', refreshError);
              await ctx.answerCallbackQuery({
                text: '❌ Unable to refresh scores data'
              });
            }
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
              const setScoreResult = await ctx.api.setGameScore({
                user_id: userId,
                score: score,
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
              
              await ctx.answerCallbackQuery({
                text: message,
                show_alert: true
              });
              
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
              await ctx.answerCallbackQuery({
                text: errorMessage,
                show_alert: true
              });
            }
          } else {
            console.log('📦 Invalid game data structure:', gameData);
            await ctx.answerCallbackQuery({
              text: '❌ Invalid score data received.'
            });
          }
        } else {
          console.log('📦 Unknown callback query type');
          await ctx.answerCallbackQuery();
        }
        
      } catch (error) {
        console.error('❌ Error handling callback query:', error);
        
        // Always answer the callback query to prevent timeout
        try {
          await ctx.answerCallbackQuery({
            text: '❌ An error occurred. Please try again.'
          });
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
          explanationText = "🏆 *Personal Leaderboard*\n\n";
          explanationText += "Play the game above to submit your score! High scores will appear in the game message when available.";
        } else {
          const chatTitle = ctx.chat.title || 'this group';
          explanationText = `🏆 *${chatTitle} Leaderboard*\n\n`;
          explanationText += "Compete with group members! High scores will appear in the game message when players submit scores.";
        }
        
        await ctx.reply(explanationText, { parse_mode: 'Markdown' });
        
      } catch (error) {
        console.error('❌ Error with highscores command:', error);
        await ctx.reply('❌ Unable to show leaderboard right now. Please try again later.');
      }
    });

    // Simplified scores command 
    bot.command('scores', async (ctx) => {
      try {
        console.log(`📊 Scores lookup requested by ${ctx.from.first_name} (${ctx.from.id}) in chat ${ctx.chat.id}`);
        
        // Simply redirect to the main leaderboard functionality
        let statusText = "📊 *SCORE STATUS*\n\n";
        
        if (ctx.chat.type === 'private') {
          statusText += "🏠 Your personal scores are tracked in game messages.\n";
        } else {
          const chatTitle = ctx.chat.title || 'this group';
          statusText += `🏘️ ${chatTitle} scores are tracked in game messages.\n`;
        }
        
        statusText += "\n💡 Scores appear automatically in game messages after players submit them.\n";
        statusText += "🎮 Use /start to play and submit scores\n";
        statusText += "🏆 Use /highscores to see the leaderboard";
        
        await ctx.reply(statusText, { parse_mode: 'Markdown' });
        
      } catch (error) {
        console.error('❌ Error with scores command:', error);
        await ctx.reply('❌ Unable to lookup scores right now.');
      }
    });

    // Advanced scores command using lower-level API for detailed leaderboard information
    bot.command('advanced_scores', async (ctx) => {
      try {
        console.log(`🔍 Advanced scores lookup requested by ${ctx.from.first_name} (${ctx.from.id}) in chat ${ctx.chat.id}`);
        
        // First, create a game message to get a message_id for the API call
        const gameMessage = await ctx.replyWithGame(GAME_SHORT_NAME, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🎮 Play Game", callback_game: {} }
              ],
              [
                { text: "🔄 Refresh Advanced Scores", callback_data: "refresh_advanced_scores" }
              ]
            ]
          }
        });
        
        // Use the lower-level getGameHighScores API method
        try {
          console.log(`🔍 Calling getGameHighScores for chat ${ctx.chat.id}, message ${gameMessage.message_id}, user ${ctx.from.id}`);
          
          const highScoresResult = await ctx.api.raw.getGameHighScores({
            user_id: ctx.from.id,
            chat_id: ctx.chat.id,
            message_id: gameMessage.message_id
          });
          
          console.log('📊 Raw high scores result:', JSON.stringify(highScoresResult, null, 2));
          
          // Format the advanced scores information
          let advancedText = "🔬 *ADVANCED LEADERBOARD*\n\n";
          
          if (highScoresResult.result && highScoresResult.result.length > 0) {
            advancedText += "📈 *Detailed Score Data:*\n\n";
            
            highScoresResult.result.forEach((scoreEntry, index) => {
              const position = index + 1;
              const user = scoreEntry.user;
              const score = scoreEntry.score;
              
              // Format user name
              let userName = user.first_name || 'Unknown';
              if (user.last_name) {
                userName += ` ${user.last_name}`;
              }
              if (user.username) {
                userName += ` (@${user.username})`;
              }
              
              // Add ranking emoji
              let rankEmoji = '🥇';
              if (position === 2) rankEmoji = '🥈';
              else if (position === 3) rankEmoji = '🥉';
              else if (position <= 10) rankEmoji = '🏆';
              else rankEmoji = '📊';
              
              advancedText += `${rankEmoji} *#${position}* - ${userName}\n`;
              advancedText += `   Score: \`${score}\` points\n`;
              advancedText += `   User ID: \`${user.id}\`\n\n`;
            });
            
            advancedText += `📊 Total players: ${highScoresResult.result.length}\n`;
            
            // Add statistics
            const scores = highScoresResult.result.map(entry => entry.score);
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);
            const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
            
            advancedText += `\n📈 *Statistics:*\n`;
            advancedText += `• Highest: ${maxScore} points\n`;
            advancedText += `• Lowest: ${minScore} points\n`;
            advancedText += `• Average: ${avgScore} points\n`;
            
          } else {
            advancedText += "📭 No scores found for this game.\n\n";
            advancedText += "🎮 Play the game above to be the first on the leaderboard!\n";
          }
          
          advancedText += "\n🔬 This data is retrieved using Telegram's `getGameHighScores` API method.";
          
          await ctx.reply(advancedText, { parse_mode: 'Markdown' });
          
        } catch (apiError) {
          console.error('❌ Error calling getGameHighScores:', apiError);
          
          let errorText = "❌ *Advanced Scores Unavailable*\n\n";
          
          if (apiError.error_code === 400) {
            errorText += "🔍 No score data available yet.\n";
            errorText += "This could mean:\n";
            errorText += "• No scores have been submitted\n";
            errorText += "• The game message is too old\n";
            errorText += "• API parameters need adjustment\n\n";
          } else if (apiError.error_code === 403) {
            errorText += "🚫 Permission denied accessing score data.\n\n";
          } else {
            errorText += `🔧 API Error: ${apiError.description || 'Unknown error'}\n\n`;
          }
          
          errorText += "💡 Try using `/highscores` for the standard leaderboard.";
          
          await ctx.reply(errorText, { parse_mode: 'Markdown' });
        }
        
      } catch (error) {
        console.error('❌ Error with advanced_scores command:', error);
        await ctx.reply('❌ Unable to retrieve advanced scores right now.');
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
        
        // Check if this might be a score submission in a different format
        if (update.message && update.message.web_app_data) {
          console.log('📊 Potential Web App score data:', update.message.web_app_data);
        }
        
        if (update.callback_query && update.callback_query.data) {
          console.log('📊 Callback query data received:', update.callback_query.data);
        }
        
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
