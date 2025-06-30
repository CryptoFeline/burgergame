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
  - Session persists for multiple score submissions (replay support)
  - In-memory session storage (Map)
  
- `src/hooks/useTelegramGame.js`:
  - `reportScore()` function extracts sessionId from URL
  - Calls game-session endpoint with score
  - Only method that works - DO NOT ADD FALLBACKS

- `src/App.js`:
  - `handleGameOver()` called in all 3 scenarios (FIXED ✅)
  - `startNewGame()` resets game state for replay (SIMPLIFIED ✅)
  - `useEffect` watches for lives <= 0 to trigger game over (FIXED ✅)
  - No session refresh needed - original session supports multiple games

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

## 🎮 Game Over Scenarios (ALL WORKING ✅)
1. **Stop Button** ✅ - Working
2. **Lives Lost** ✅ - Fixed with useEffect trigger  
3. **Animation Complete** ✅ - Working

## 🔄 Session Management (SIMPLIFIED ✅) 
- **Single Session Per Launch**: One session supports unlimited replays ✅
- **Persistent Session**: Session stays alive after score submission ✅ 
- **Multiple Score Submissions**: Same session can submit multiple scores ✅
- **Telegram API Compatibility**: `setGameScore` with `force: false` handles multiple submissions correctly ✅
- **No Complex Refresh Logic**: Removed unnecessary session refresh complexity ✅

## 🔧 Recent Fixes Applied
- **Lives Lost Fix**: Moved `handleGameOver()` call from inside `setLives` callback to dedicated `useEffect` watching lives state
- **Session Simplification**: Removed complex session refresh logic - original session persists for replays
- **Score Persistence**: Sessions no longer deleted after first score submission
- **Cleaner Code**: Removed unnecessary timing complexities and race condition handling

## 🔍 Testing & Debugging
- Console shows game over scenarios: "🎮 GAME OVER SCENARIO: [reason]"
- Score submissions logged: "🎯 SCORE SUBMISSION with session context"
- Session data preserved across multiple games from same launch
- URL sessionId remains constant - no refresh needed
- `setGameScore` called with `force: false` - only updates higher scores

## 🚫 NEVER MODIFY
- Session-based architecture (only working solution)
- `setGameScore` API calls in game-session.js
- URL parameter passing of sessionId
- Core reportScore logic in useTelegramGame.js
