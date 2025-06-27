# Netlify Functions

Serverless functions for Telegram bot functionality:

## Main Bot Function
- `telegram-bot.js` - Complete Telegram bot webhook handler
  - **Game Launch**: Handles `/start` command and game button clicks
  - **Score Processing**: Receives callback queries from `TelegramGameProxy.postScore()`
  - **Leaderboard Management**: Calls `setGameScore()` API to update Telegram's leaderboard
  - **Service Messages**: Enables automatic score announcements in group chats
  - **Error Handling**: Comprehensive logging and error recovery

## Implementation Details
- Uses Grammy.js framework for Telegram Bot API
- Follows official Telegram Games API flow:
  1. User clicks "Play" → callback query → bot returns game URL
  2. Game calls `postScore()` → callback query with score data → bot calls `setGameScore()`
  3. Telegram automatically updates leaderboard and posts service messages
- Supports both regular chat and inline game messages
- Environment: Netlify Functions (Node.js serverless)

## Configuration
- Requires `BOT_TOKEN` environment variable
- Webhook URL: `https://[domain]/.netlify/functions/telegram-bot`
- Game short name: `buildergame` (must match BotFather registration)
