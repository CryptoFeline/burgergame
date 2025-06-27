#!/bin/bash

# Boss Burger Builder - Deploy Clean Implementation
# This script switches to the clean, focused implementation following the 7-step Telegram Games pattern

echo "🧹 Deploying Clean Telegram Games Implementation"
echo "================================================"

# Backup current implementation
echo "📦 Backing up current implementation..."
cp netlify/functions/telegram-bot.js netlify/functions/telegram-bot-backup-$(date +%Y%m%d-%H%M%S).js
cp src/hooks/useTelegramGame.js src/hooks/useTelegramGame-backup-$(date +%Y%m%d-%H%M%S).js

# Deploy clean implementation
echo "🚀 Deploying clean implementation..."
cp netlify/functions/telegram-bot-clean.js netlify/functions/telegram-bot.js
cp src/hooks/useTelegramGame-clean.js src/hooks/useTelegramGame.js

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Commit changes
    echo "📝 Committing changes..."
    git add -A
    git commit -m "refactor: Deploy clean Telegram Games implementation

- Simplified bot to follow exact 7-step Telegram Games pattern
- Frontend uses only TelegramGameProxy.postScore() for score submission
- Removed redundant fallback methods and complex callback handling
- Focused on reliability: answerCallbackQuery ≤ 10s, proper error handling
- Clean separation: Step 3 (frontend) → Step 4&5 (bot) → Step 6 (leaderboard)
- Follows Telegram Games API best practices exactly"
    
    # Push to trigger deployment
    echo "🚀 Pushing to trigger deployment..."
    git push
    
    echo ""
    echo "✅ Clean implementation deployed successfully!"
    echo ""
    echo "🎯 Key changes:"
    echo "  • Frontend: Only TelegramGameProxy.postScore() for score submission"
    echo "  • Bot: Clean callback handling with ≤10s acknowledgment"
    echo "  • Leaderboard: On-demand via getGameHighScores"
    echo "  • Error handling: Proper QUERY_ID_INVALID and reliability fixes"
    echo ""
    echo "🔧 To test:"
    echo "  1. /start or /play to launch game"
    echo "  2. Play game and check score submission"
    echo "  3. Use 🏆 button to view leaderboard"
    echo ""
    echo "📱 Bot URL: https://t.me/bossburger_bot"
    echo "🌐 Game URL: https://bossburgerbuild.netlify.app"
    
else
    echo "❌ Build failed! Reverting changes..."
    git checkout -- netlify/functions/telegram-bot.js src/hooks/useTelegramGame.js
    exit 1
fi
