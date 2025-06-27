# 🎯 Boss Burger Builder - Score Tracking & User Management Analysis

## Overview

This document provides a comprehensive analysis of how the Boss Burger Builder project handles scores, tracks users, and manages leaderboards across different components.

## 🏗️ Architecture Overview

The score tracking system involves three main components:

1. **Frontend Game** (`src/hooks/useTelegramGame.js`) - Detects game environment and sends scores
2. **Telegram Bot** (`netlify/functions/telegram-bot.js`) - Processes scores and manages leaderboards  
3. **Telegram's Infrastructure** - Stores and manages the actual score data

## 📊 Score Flow Process

### 1. Score Generation (Frontend)
```javascript
// Location: src/hooks/useTelegramGame.js
const reportScore = useCallback(async (score) => {
    const finalScore = Math.max(0, Math.floor(score));
    
    // Multiple fallback methods for score submission:
    // Method 1: TelegramGameProxy.postScore()
    // Method 2: window.parent.postMessage() 
    // Method 3: Telegram.WebApp.sendData()
});
```

**Key Points:**
- Score is validated (positive integer)
- Multiple submission methods for reliability
- Environment detection (Telegram vs standalone)

### 2. Score Reception (Bot Backend)
```javascript
// Location: netlify/functions/telegram-bot.js
bot.on('callback_query', async (ctx) => {
    if (gameData.type === 'game_score' && typeof gameData.score === 'number') {
        const userId = ctx.from.id;
        const chatId = ctx.chat?.id;
        const messageId = callbackQuery.message?.message_id;
        const score = Math.floor(gameData.score);
    }
});
```

**Key Points:**
- Receives scores via callback queries with JSON data
- Extracts user ID, chat ID, and message ID
- Validates score data format

### 3. Score Storage (Telegram's setGameScore API)
```javascript
await ctx.api.setGameScore({
    user_id: userId,      // Telegram user ID
    score: score,         // Integer score value
    chat_id: chatId,      // Chat where game was played
    message_id: messageId, // Specific game message ID
    force: true,          // Allow score updates
    disable_edit_message: false // Let Telegram update message
});
```

## 🔗 User-Score Relationship

### How Scores Are Tied to Users

1. **Primary Key**: `user_id` (Telegram's unique user identifier)
2. **Secondary Keys**: 
   - `chat_id` - Separates scores by chat (private vs groups)
   - `message_id` - Ties scores to specific game instances

### Data Storage Location
- **NOT stored locally** - All score data lives in Telegram's infrastructure
- **Persistent** - Scores survive bot restarts, redeployments, etc.
- **Chat-specific** - Each chat maintains separate leaderboards
- **Message-bound** - Scores are tied to specific game message instances

## 🏆 Leaderboard System

### Standard Leaderboard (`/highscores`)
```javascript
// Creates game message - Telegram automatically shows leaderboard
await ctx.replyWithGame(GAME_SHORT_NAME, {
    reply_markup: {
        inline_keyboard: [
            [{ text: "🎮 Play & Set Your Score!", callback_game: {} }]
        ]
    }
});
```

**How it works:**
- Creates a game message with unique `message_id`
- Telegram automatically displays high scores when they exist
- Updates in real-time as new scores are submitted
- No manual leaderboard management required

### Advanced Leaderboard (`/advanced_scores`)
```javascript
// Retrieves detailed score data using lower-level API
const highScoresResult = await ctx.api.raw.getGameHighScores({
    user_id: ctx.from.id,
    chat_id: ctx.chat.id,
    message_id: gameMessage.message_id
});
```

**Returns detailed data:**
```javascript
{
    "result": [
        {
            "position": 1,
            "user": {
                "id": 123456789,
                "first_name": "John",
                "last_name": "Doe", 
                "username": "johndoe"
            },
            "score": 150
        }
    ]
}
```

## 🔍 Score Tracking Implementation Details

### Multiple Submission Methods

The system supports several score submission pathways for maximum reliability:

#### Method 1: TelegramGameProxy (Primary)
```javascript
if (window.TelegramGameProxy) {
    window.TelegramGameProxy.postScore(finalScore);
    
    // Also send via postMessage for callback handling
    window.parent.postMessage({
        eventType: 'game_score',
        eventData: JSON.stringify({
            type: 'game_score',
            score: finalScore,
            timestamp: Date.now()
        })
    }, '*');
}
```

#### Method 2: Telegram WebApp API
```javascript
if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ 
        type: 'game_score', 
        score: finalScore,
        timestamp: Date.now()
    }));
}
```

#### Method 3: PostMessage Fallbacks
```javascript
// Multiple postMessage formats for compatibility
window.parent.postMessage(scoreData, '*');
window.parent.postMessage({
    eventType: 'game_score',
    eventData: scoreData
}, '*');
window.parent.postMessage(JSON.stringify(scoreData), '*');
```

### Manual Score Submission (`/submitscore`)
```javascript
bot.command('submitscore', async (ctx) => {
    const score = parseInt(scoreMatch[1]);
    
    // Create game message and immediately set score
    const gameMessage = await ctx.replyWithGame(GAME_SHORT_NAME, {...});
    
    await ctx.api.setGameScore({
        user_id: ctx.from.id,
        score: score,
        chat_id: ctx.chat.id,
        message_id: gameMessage.message_id,
        force: true,
        disable_edit_message: false
    });
});
```

## 🏪 Data Persistence & Storage

### Where Scores Are Held

1. **Telegram's Servers** (Primary storage)
   - All score data stored in Telegram's infrastructure
   - Accessed via `setGameScore` and `getGameHighScores` APIs
   - Tied to specific `chat_id + message_id` combinations
   - Survives bot restarts and redeployments

2. **No Local Database** 
   - Bot does not maintain its own score database
   - Relies entirely on Telegram's native leaderboard system
   - Reduces complexity and maintenance overhead

3. **Message-Bound Storage**
   - Each game message acts as a leaderboard container
   - Scores are permanently tied to the message that created them
   - Multiple game messages = multiple independent leaderboards

### User Identification Process

1. **User Object Structure**:
```javascript
const user = {
    id: 123456789,           // Unique Telegram user ID
    first_name: "John",      // Required field
    last_name: "Doe",        // Optional
    username: "johndoe",     // Optional  
    is_bot: false           // Always false for game players
};
```

2. **Score Attribution Process**:
   - User plays game → Frontend sends score with timestamp
   - Bot receives callback → Extracts `ctx.from.id` (user ID)
   - Bot calls `setGameScore` → Telegram links score to user ID
   - Leaderboard displays → Shows user's name and best score

3. **Privacy & Security**:
   - User IDs are unique but don't reveal personal info
   - Display names come from user's Telegram profile
   - Users control their own display name/username visibility

## 🎮 Game Integration Points

### Frontend Score Reporting
```javascript
// Called when game ends in src/Components/Screen.js
const { reportScore } = useTelegramGame();

// On game over:
await reportScore(finalScore);
```

### Bot Score Processing
```javascript
// Multiple entry points for score data:

// 1. Direct game score callback
if (gameData.type === 'game_score') {
    await ctx.api.setGameScore({...});
}

// 2. Manual submission command
bot.command('submitscore', async (ctx) => {...});

// 3. Start command with score parameter  
const scoreMatch = commandText.match(/\/start score_(\d+)/);
```

## 📈 Analytics & Statistics

### Basic Score Analytics
```javascript
// Calculated from getGameHighScores result
const scores = highScoresResult.result.map(entry => entry.score);
const maxScore = Math.max(...scores);
const minScore = Math.min(...scores);
const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
```

### User Statistics Available
- **Position/Rank**: Automatic ranking by Telegram
- **Best Score**: Highest score for each user per chat
- **User Profile**: Name, username, user ID
- **Participation**: Total players count
- **Score Distribution**: Min, max, average calculations

## 🔧 Error Handling & Edge Cases

### Score Validation
```javascript
// Frontend validation
const finalScore = Math.max(0, Math.floor(score));

// Backend validation  
if (score < 0 || score > 10000) {
    await ctx.reply('❌ Invalid score. Please enter a score between 0 and 10000.');
    return;
}
```

### API Error Handling
```javascript
try {
    await ctx.api.setGameScore({...});
} catch (scoreError) {
    if (scoreError.error_code === 400) {
        errorMessage = '❌ Invalid score data. Please try playing again.';
    } else if (scoreError.error_code === 403) {
        errorMessage = '❌ Permission denied. The bot might need to be re-added to this chat.';
    }
}
```

### Environment Detection
```javascript
// Handles different environments gracefully
if (window.location.hostname === 'localhost') {
    console.info('🔧 Local development mode - Telegram score reporting skipped');
    return true; // Prevent errors in development
}
```

## 🌐 Multi-Platform Support

### Environment Detection
1. **Telegram Game Environment**: Uses TelegramGameProxy
2. **Telegram Web App**: Uses Telegram.WebApp API  
3. **Standalone Web**: Graceful degradation, no score submission
4. **Development**: Mock behavior for local testing

### Cross-Chat Functionality
- **Private Chats**: Personal leaderboards for individual users
- **Group Chats**: Shared leaderboards for all group members
- **Multiple Groups**: Each group maintains separate leaderboards
- **Message-Specific**: Each game message has its own leaderboard

## 📝 Summary

The Boss Burger Builder score tracking system is built on Telegram's native infrastructure, providing:

1. **Reliable Score Storage**: Uses Telegram's proven infrastructure
2. **User Privacy**: Respects Telegram's user privacy model
3. **Zero Maintenance**: No database to maintain or backup
4. **Real-time Updates**: Automatic leaderboard updates
5. **Multi-Platform**: Works across all Telegram clients
6. **Scalable**: Handles unlimited users and scores
7. **Persistent**: Scores survive any system changes

The system elegantly leverages Telegram's built-in capabilities while providing a seamless gaming experience with comprehensive analytics and user management.

*Last updated: June 27, 2025*
