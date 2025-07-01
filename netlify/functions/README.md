# Netlify Functions

Serverless functions for Telegram bot functionality:

## Bot Functions
- `telegram-bot.js` - Complete Telegram bot webhook handler
  - **Game Launch**: Handles `/start` command and game button clicks
  - **Session Management**: Stores game context when launching games
  - **Multiple Commands**: `/highscores`, `/advanced_scores`, `/stats`, etc.
  - **Error Handling**: Comprehensive logging and error recovery

- `game-session.js` - Session-based score management
  - **Session Storage**: Stores user/chat/message context for score submission
  - **Score Processing**: Receives score data from game and calls `setGameScore()`
  - **Leaderboard Integration**: Updates Telegram's native leaderboard system
  - **Service Messages**: Enables automatic score announcements in group chats

## Implementation Details
- Uses Grammy.js framework for Telegram Bot API
- Session-based architecture: Bot stores context → Game submits with sessionId → Function calls setGameScore()
- Supports both regular chat and inline game messages
- Environment: Netlify Functions (Node.js serverless)

## Configuration
- Requires `BOT_TOKEN` environment variable
- Webhook URL: `https://[domain]/.netlify/functions/telegram-bot`
- Game short name: `buildergame` (must match BotFather registration)
