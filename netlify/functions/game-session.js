/**
 * Game session endpoint to store and retrieve game context
 * This bridges the gap between game launch (when we have Telegram context) 
 * and score submission (when we need that context)
 */

const sessions = new Map(); // In-memory storage (would use Redis/DB in production)

exports.handler = async (event, context) => {
  console.log('🎮 GAME SESSION endpoint called');
  console.log('Method:', event.httpMethod);
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      
      if (body.action === 'store') {
        // Store game session data when game launches
        const sessionId = body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionData = {
          userId: body.userId,
          chatId: body.chatId,
          messageId: body.messageId,
          gameShortName: body.gameShortName,
          timestamp: new Date().toISOString()
        };
        
        sessions.set(sessionId, sessionData);
        console.log('💾 Stored game session:', sessionId, sessionData);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            sessionId: sessionId,
            message: 'Game session stored'
          })
        };
      }
      
      if (body.action === 'retrieve') {
        // Retrieve game session data for score submission
        const sessionData = sessions.get(body.sessionId);
        console.log('🔍 Retrieved game session:', body.sessionId, sessionData);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            sessionData: sessionData || null,
            message: sessionData ? 'Session found' : 'Session not found'
          })
        };
      }
      
      if (body.action === 'submit_score') {
        // Submit score using stored session data
        const sessionData = sessions.get(body.sessionId);
        
        if (!sessionData) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Game session not found'
            })
          };
        }
        
        console.log('🎯 SCORE SUBMISSION with session context:', {
          sessionId: body.sessionId,
          score: body.score,
          sessionData
        });
        
        // Now we have the context needed to call setGameScore
        const { Bot } = require('grammy');
        const BOT_TOKEN = process.env.BOT_TOKEN;
        
        if (!BOT_TOKEN) {
          throw new Error('BOT_TOKEN not configured');
        }
        
        const bot = new Bot(BOT_TOKEN);
        await bot.init();
        
        try {
          const result = await bot.api.setGameScore(
            parseInt(sessionData.chatId),     // chat_id
            parseInt(sessionData.messageId),  // message_id  
            parseInt(sessionData.userId),     // user_id
            parseInt(body.score),             // score
            { force: false } // Don't force - only update if higher
          );
          
          console.log('✅ SCORE SUBMITTED SUCCESSFULLY via session bridge:', result);
          
          // Clean up session after successful submission
          sessions.delete(body.sessionId);
          
          // Send service message to chat
          try {
            if (sessionData.chatId !== sessionData.userId) { // Only in group chats
              await bot.api.sendMessage(sessionData.chatId, 
                `🎮 Player just scored ${body.score} points in Boss Burger Builder!`, {
                reply_to_message_id: parseInt(sessionData.messageId)
              });
              console.log('📢 Service message sent to chat');
            }
          } catch (serviceError) {
            console.log('⚠️ Could not send service message:', serviceError.message);
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Score submitted successfully',
              result: result
            })
          };
          
        } catch (scoreError) {
          console.error('❌ Failed to submit score:', scoreError);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: scoreError.message
            })
          };
        }
      }
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid action'
        })
      };
      
    } catch (error) {
      console.error('❌ Game session error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: error.message
        })
      };
    }
  }
  
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
