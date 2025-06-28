/**
 * Dedicated endpoint for game score submission
 * This function handles score submission from the game client
 * and triggers the proper Telegram callback mechanism
 */

const { Bot } = require('grammy');

exports.handler = async (event, context) => {
  console.log('🎯 Game Score Submission Endpoint');
  
  // Only handle POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }
  
  try {
    // Parse the incoming score data
    const requestBody = JSON.parse(event.body || '{}');
    const { score, user_id, chat_id, message_id, game_short_name = 'buildergame' } = requestBody;
    
    console.log('📊 Score submission received:', {
      score,
      user_id,
      chat_id,
      message_id,
      game_short_name,
      timestamp: new Date().toISOString()
    });
    
    // Validate required data
    if (typeof score !== 'number' || score < 0) {
      console.error('❌ Invalid score:', score);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid score' })
      };
    }

    if (!user_id || !chat_id || !message_id) {
      console.error('❌ Missing required Telegram context:', { user_id, chat_id, message_id });
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing Telegram context' })
      };
    }
    
    // Get bot token
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.error('❌ BOT_TOKEN not configured');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Bot not configured' })
      };
    }
    
    // Create bot instance and submit score
    const bot = new Bot(BOT_TOKEN);
    
    console.log('🎯 Calling setGameScore with:', {
      user_id: parseInt(user_id),
      score: Math.floor(score),
      chat_id: parseInt(chat_id),
      message_id: parseInt(message_id),
      force: true
    });
    
    const result = await bot.api.setGameScore(
      parseInt(user_id),
      Math.floor(score),
      {
        chat_id: parseInt(chat_id),
        message_id: parseInt(message_id),
        force: true
      }
    );
    
    console.log('✅ setGameScore result:', result);
    
    // Success response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        score: Math.floor(score),
        message: 'Score submitted successfully',
        result
      })
    };
    
  } catch (error) {
    console.error('❌ Error submitting score:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Score submission failed',
        details: error.message 
      })
    };
  }
};
