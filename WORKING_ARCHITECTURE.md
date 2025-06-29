# Working Score System Architecture

## 🏗️ CRITICAL: DO NOT MODIFY THESE WORKING COMPONENTS

### Session-Based Score Flow (WORKING ✅)
1. **Game Launch**: `telegram-bot.js` stores session context when user clicks "Play"
2. **Session Storage**: `game-session.js` stores userId, chatId, messageId with unique sessionId  
3. **Game URL**: Bot passes sessionId as URL parameter: `?v=timestamp&sessionId=session_xxx`
4. **Score Submission**: Game calls `/game-session` endpoint with sessionId + score
5. **Bot Integration**: Session endpoint calls `bot.api.setGameScore()` with stored context
6. **Result**: Score appears on leaderboard + service message sent

### Key Files & Functions (DO NOT BREAK)
- `netlify/functions/telegram-bot.js`:
  - Game launch handler stores session context
  - Session storage via fetch to game-session endpoint
  - URL generation with sessionId parameter
  
- `netlify/functions/game-session.js`:
  - `action: 'store'` - stores game context when launched
  - `action: 'submit_score'` - retrieves context and calls setGameScore
  - In-memory session storage (Map)
  
- `src/hooks/useTelegramGame.js`:
  - `reportScore()` function extracts sessionId from URL
  - Calls game-session endpoint with score
  - Only method that works - DO NOT ADD FALLBACKS

### Critical Code Sections
```javascript
// telegram-bot.js - Session storage on game launch
const sessionData = {
  action: 'store',
  userId: ctx.from.id,
  chatId: callbackQuery.message?.chat?.id,
  messageId: callbackQuery.message?.message_id,
  gameShortName: callbackQuery.game_short_name,
  userName: ctx.from.first_name
};

// game-session.js - Score submission
await bot.api.setGameScore(
  parseInt(sessionData.chatId),
  parseInt(sessionData.messageId), 
  parseInt(sessionData.userId),
  parseInt(body.score),
  { force: false }
);

// useTelegramGame.js - Score reporting
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('sessionId');
await fetch('/.netlify/functions/game-session', {
  method: 'POST',
  body: JSON.stringify({
    action: 'submit_score',
    sessionId: sessionId,
    score: finalScore
  })
});
```

## 🎮 Game Over Scenarios (NEED FIXING)
1. **Stop Button** ✅ - Currently working
2. **Lives Lost** ❌ - handleGameOver not called  
3. **Animation Complete** ❌ - handleGameOver not called

## 🔄 Session Issues (NEED FIXING) 
- First play works, replay fails (sessionId not refreshed)
- Need session refresh mechanism for multiple plays

## 🚫 NEVER MODIFY
- Session-based architecture (only working solution)
- `setGameScore` API calls in game-session.js
- URL parameter passing of sessionId
- Core reportScore logic in useTelegramGame.js
