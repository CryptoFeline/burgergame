# 🎯 Boss Burger Builder - Clean Telegram Games Implementation

## Overview

This document outlines the **clean, focused implementation** that follows the exact 7-step Telegram Games API pattern. All redundant code has been removed, leaving only the essential components for reliable score tracking and leaderboards.

## 📋 The 7-Step Implementation

### ✅ Step 1: Game Registration [COMPLETED]
- Game registered with BotFather
- Short name: `buildergame`
- Game URL: `https://bossburgerbuild.netlify.app`

### 🎮 Step 2: Launch Game from Bot
```javascript
// netlify/functions/telegram-bot-clean.js
bot.command('start', async (ctx) => {
    await ctx.replyWithGame(GAME_SHORT_NAME, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🍔 Play Boss Burger Builder!", callback_game: {} }],
                [{ text: "🏆 View Leaderboard", callback_data: "show_leaderboard" }]
            ]
        }
    });
});
```

### 📊 Step 3: Frontend Score Reporting
```javascript
// src/hooks/useTelegramGame-clean.js
const reportScore = useCallback(async (score) => {
    const finalScore = Math.max(0, Math.floor(score));
    
    // ONLY method used: TelegramGameProxy.postScore()
    if (window.TelegramGameProxy && typeof window.TelegramGameProxy.postScore === 'function') {
        window.TelegramGameProxy.postScore(finalScore);
        return true;
    }
    
    return false;
}, [isTelegramEnvironment]);
```

### ⚡ Step 4: Bot Acknowledges Callback (≤ 10s)
```javascript
bot.on('callback_query', async (ctx) => {
    // CRITICAL: Acknowledge immediately to prevent QUERY_ID_INVALID
    await ctx.answerCallbackQuery({
        text: "📊 Submitting score...",
        show_alert: false
    });
    
    // Then process score...
});
```

### 💾 Step 5: Write Score to Telegram's Table
```javascript
async function writeGameScore(ctx, score, callbackQuery) {
    let scoreParams = {
        user_id: ctx.from.id,
        score: score,
        force: true // Allow score updates
    };

    // Chat message launch: use chat_id + message_id
    if (callbackQuery.message) {
        scoreParams.chat_id = callbackQuery.message.chat.id;
        scoreParams.message_id = callbackQuery.message.message_id;
    }
    // Inline mode launch: use inline_message_id
    else if (callbackQuery.inline_message_id) {
        scoreParams.inline_message_id = callbackQuery.inline_message_id;
    }

    await ctx.api.setGameScore(scoreParams);
}
```

### 🏆 Step 6: Display Leaderboard on Demand
```javascript
async function showLeaderboard(ctx, callbackQuery) {
    // Use same identifiers as setGameScore
    let scoreParams = { user_id: ctx.from.id };
    
    if (callbackQuery.message) {
        scoreParams.chat_id = callbackQuery.message.chat.id;
        scoreParams.message_id = callbackQuery.message.message_id;
    }
    
    const highScores = await ctx.api.getGameHighScores(scoreParams);
    
    // Format and send leaderboard...
}
```

### 🛡️ Step 7: Reliability Measures
```javascript
// Error handling for common issues
try {
    await ctx.api.setGameScore(scoreParams);
} catch (error) {
    if (error.description?.includes('USER_ID_INVALID')) {
        errorMessage = '❌ Invalid user data - please restart the game';
    } else if (error.description?.includes('QUERY_ID_INVALID')) {
        errorMessage = '❌ Session expired - score not saved';
    }
    
    await ctx.answerCallbackQuery({ text: errorMessage, show_alert: true });
}
```

## 🧹 What Was Removed

### Frontend Cleanup
- ❌ Multiple postMessage fallbacks
- ❌ Telegram WebApp API mixing  
- ❌ Complex JSON parsing in score submission
- ❌ Redundant environment detection methods
- ❌ Unused share/alert/confirm methods

### Bot Cleanup  
- ❌ Manual score submission commands (`/submitscore`)
- ❌ Complex JSON callback data parsing
- ❌ Multiple score submission pathways
- ❌ Advanced analytics commands
- ❌ Redundant error handling branches

### What Remains
- ✅ **Only** `TelegramGameProxy.postScore()` for frontend
- ✅ **Only** callback_query handling for bot
- ✅ **Only** `setGameScore`/`getGameHighScores` for persistence
- ✅ **Only** essential error handling
- ✅ **Only** core commands: `/start`, `/play`, `/help`

## 📁 File Structure

### Core Files
```
netlify/functions/
├── telegram-bot.js              # Clean implementation (deployed)
├── telegram-bot-clean.js        # Clean source
└── telegram-bot-backup-*.js     # Backups of complex version

src/hooks/
├── useTelegramGame.js           # Clean implementation (deployed)  
├── useTelegramGame-clean.js     # Clean source
└── useTelegramGame-backup-*.js  # Backups of complex version
```

### Deployment
```bash
./deploy-clean.sh    # Deploy clean implementation
```

## 🔧 Key Implementation Details

### Score Flow
1. **Game Over** → `reportScore(finalScore)` 
2. **Frontend** → `TelegramGameProxy.postScore(finalScore)`
3. **Telegram** → Fires `callback_query` to bot
4. **Bot** → `answerCallbackQuery()` ≤ 10s
5. **Bot** → `setGameScore()` with proper identifiers
6. **Telegram** → Stores score permanently

### Leaderboard Flow
1. **User** → Clicks "🏆 View Leaderboard" button
2. **Bot** → `answerCallbackQuery()` immediately  
3. **Bot** → `getGameHighScores()` with same identifiers
4. **Bot** → Format and send leaderboard message

### Error Prevention
- **QUERY_ID_INVALID**: Always `answerCallbackQuery()` ≤ 10s
- **USER_ID_INVALID**: Use exact same identifiers for set/get operations
- **URL Mismatch**: Verify game URL matches BotFather registration exactly
- **Force Parameter**: Set `force: true` to allow score updates during testing

## 🎯 Testing Checklist

### Basic Flow
- [ ] `/start` launches game correctly
- [ ] Game loads in Telegram iframe
- [ ] Score submission works via `TelegramGameProxy.postScore()`
- [ ] Bot receives callback within 10s
- [ ] Score appears in leaderboard
- [ ] Multiple users can submit scores
- [ ] Leaderboard shows correct rankings

### Error Scenarios  
- [ ] Handle callback timeouts gracefully
- [ ] Handle invalid user data
- [ ] Handle missing game identifiers
- [ ] Handle API rate limits
- [ ] Handle network failures

### Cross-Platform
- [ ] Works in Telegram Mobile (iOS/Android)
- [ ] Works in Telegram Desktop
- [ ] Works in Telegram Web
- [ ] Graceful degradation in standalone mode

## 🚀 Deployment Process

1. **Test Locally**: Ensure game works in development
2. **Run Clean Deploy**: `./deploy-clean.sh`
3. **Verify Build**: Check for compilation errors
4. **Test in Telegram**: Full end-to-end testing
5. **Monitor Logs**: Watch for callback/score issues

## 📊 Monitoring

### Key Metrics to Watch
- **Callback Response Time**: Must be ≤ 10s
- **Score Submission Success Rate**: Should be >95%
- **Leaderboard Fetch Success Rate**: Should be >95%
- **Error Patterns**: Watch for QUERY_ID_INVALID spikes

### Logging
```javascript
// Frontend
console.log('📊 Reporting score via TelegramGameProxy:', finalScore);

// Bot  
console.log('📞 Callback query received:', callbackQuery.id);
console.log('🏆 Writing score for user:', ctx.from.id);
console.log('📈 Retrieved high scores:', highScores.length);
```

## 🎯 Success Criteria

The clean implementation is successful when:

1. **Simplicity**: Code is minimal and focused
2. **Reliability**: >95% score submission success rate
3. **Performance**: All callbacks answered ≤ 10s
4. **Maintainability**: Easy to understand and debug
5. **Scalability**: Handles unlimited users/scores
6. **Compliance**: Follows Telegram Games API exactly

This clean implementation removes all complexity and focuses solely on the proven Telegram Games API pattern for maximum reliability and maintainability.

---

*Last updated: June 27, 2025*
