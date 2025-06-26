# 🍔 Boss Burger Builder - Telegram Game

A 3D physics-based burger stacking game with full Telegram integration, native leaderboards, and cross-platform compatibility.

## 🎮 Game Features

- **3D Physics Engine**: Built with Three.js and Cannon.js for realistic ingredient stacking
- **High-Quality Textures**: Custom textures for all burger ingredients (buns, patty, lettuce, tomato, onion, cheese)
- **Lives System**: 3 heart-based lives with visual feedback
- **Dynamic Scoring**: Progressive scoring with color-changing backgrounds
- **Cross-Platform**: Optimized for Telegram clients and all web browsers  
- **Audio System**: Background music and sound effects with user controls
- **Native Integration**: Full Telegram Games API with automatic leaderboards

## 🤖 Telegram Bot Features

- **Native Leaderboards**: Uses Telegram's built-in game leaderboard system
- **Multi-Chat Support**: Separate leaderboards for groups and private chats
- **Score Sharing**: Share achievements via inline queries
- **Multiple Commands**: `/start`, `/help`, `/highscores`, `/stats`, `/scores`
- **Enhanced Game Messages**: Multiple action buttons and sharing options
- **Automatic Updates**: Real-time leaderboard updates via Telegram's API

## 🛠️ Technologies Used

### Frontend
- **React** - UI framework
- **Three.js** - 3D graphics and rendering
- **React Three Fiber** - React bindings for Three.js
- **React Three Cannon** - Physics simulation
- **GSAP** - Smooth animations
- **SCSS** - Styling

### Backend
- **Netlify Functions** - Serverless bot hosting
- **Grammy** - Modern Telegram bot framework  
- **Telegram Games API** - Native leaderboard integration

## 🚀 Live Game

- **Web Version**: [https://bossburgerbuild.netlify.app](https://bossburgerbuild.netlify.app)
- **Telegram Bot**: [@bossburger_bot](https://t.me/bossburger_bot)

## 🎯 How to Play

1. **Via Telegram**: Send `/start` to [@bossburger_bot](https://t.me/bossburger_bot)
2. **Web**: Visit [bossburgerbuild.netlify.app](https://bossburgerbuild.netlify.app)
3. Click to drop ingredients and stack your burger
4. Perfect stacks = maximum points
5. Build higher for bigger scores
6. Don't run out of lives!

## 🏆 Telegram Bot Commands

- `/start` - Launch the game
- `/help` - Show game instructions
- `/highscores` - View leaderboard for current chat
- `/stats` - View game statistics
- `/scores` - Lookup detailed score data

## 🏗️ Architecture

```
BurgerGame/
├── src/                    # React game source code
│   ├── Components/         # Game components (Screen, FallingIngredient, etc.)
│   ├── hooks/             # Custom hooks (useTelegramGame, useAudio)
│   ├── contexts/          # React contexts (TextureContext)
│   └── img/               # High-quality ingredient textures
├── public/                # Static assets
│   └── audio/            # Complete audio system (6 sound files)
├── netlify/functions/     # Serverless backend
│   └── telegram-bot.js   # Complete bot with leaderboard integration
└── build/                # Production deployment
```

## 🎵 Audio System

The game includes a complete audio system with:
- Background music with loop functionality
- Sound effects for all game events
- Mute/unmute controls
- Browser autoplay policy compliance

## 📱 Cross-Platform Support

- ✅ Telegram Mobile (iOS/Android)
- ✅ Telegram Desktop
- ✅ Telegram Web
- ✅ Direct web browser access
- ✅ Mobile browsers
- ✅ Desktop browsers

## 🚀 Deployment & Architecture

**Production Stack:**
- **Frontend**: React + Three.js hosted on Netlify
- **Backend**: Serverless functions (Netlify Functions)
- **Bot Framework**: Grammy.js for Telegram integration
- **Leaderboards**: Native Telegram Games API
- **Domain**: Custom domain with HTTPS

**Automatic Deployment:**
- GitHub → Netlify CI/CD pipeline
- Zero-downtime deployments
- Environment variable management

## 🎮 Game Mechanics

- **Physics**: Realistic ingredient dropping and stacking
- **Scoring**: Points awarded for precision and height
- **Lives**: 3 chances with visual heart indicators  
- **Difficulty**: Alternating spawn directions for challenge
- **Textures**: High-quality ingredient visuals

Built with ❤️ for the Telegram Games platform

---

## 📚 Additional Documentation

- **[Complete Implementation Guide](IMPLEMENTATION_COMPLETE.md)** - Detailed technical documentation
- **[Testing Guide](TESTING_GUIDE.md)** - Comprehensive testing checklist  
- **[Telegram Games API Guide](TELEGRAM_GAMES_API.md)** - API implementation details
- **[Audio System Documentation](public/audio/README.md)** - Audio features and integration

*Last updated: June 2025*
