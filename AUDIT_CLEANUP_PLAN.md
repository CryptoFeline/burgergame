# 🧹 BurgerGame Codebase Audit & Cleanup Plan

## 📁 DOCUMENTATION REORGANIZATION

### Files to Move to `/Telegram Game/Documentation/` (Outside BurgerGame):
```
✅ MOVE THESE MD FILES:
- DEPLOYMENT_COMPLETE.md
- TESTING_GUIDE_CURRENT.md  
- LEADERBOARD_SOLUTION.md
- CLEAN_IMPLEMENTATION.md
- TESTING_GUIDE.md
- SCORE_TRACKING_ANALYSIS.md
- DOCUMENTATION_UPDATE.md
- LEADERBOARD_IMPLEMENTATION.md
- SCORE_SUBMISSION_FIX.md
- IMPLEMENTATION_COMPLETE.md
- CLEANUP_PLAN.md
- ADVANCED_LEADERBOARD.md
- TELEGRAM_GAMES_API.md

✅ ALREADY OUTSIDE (Keep):
- LOCAL_DEV_EXPLANATION.md
- WEBHOOK_FIX_GUIDE.md  
- GAMES_API_SETUP_GUIDE.md
- GAME_TESTING_GUIDE.md
- POST_DEPLOYMENT_CHECKLIST.md
- SETUP_INSTRUCTIONS.md
- DEPLOYMENT_READY.md
- WEB_APP_TESTING_GUIDE.md

✅ KEEP IN PROJECT (Folder-specific README):
- README.md (main project readme)
```

## 🗑️ FILES MARKED FOR REMOVAL

### 1. Backup/Duplicate Files:
```
❌ REMOVE THESE BACKUP FILES:
/src/hooks/
- useTelegramGame-clean.js
- useTelegramGame-backup-20250627-132556.js

/src/Components/
- Ingredients_backup.js
- ShapeDemo.js (demo component)

/netlify/functions/
- telegram-bot-backup-20250627-132556.js
- telegram-bot-backup.js
- telegram-bot-clean.js
- telegram-bot-fixed.js

/public/
- test-score.html (development testing)
- bot-diagnostics.html (development testing)
- setup-webhook.html (development testing)

/root/
- test-bot.js (standalone test file)
- deploy-clean.sh (old deployment script)
- setup-netlify-bot.sh (old setup script)
- package-new.json (duplicate package.json)

/.lh/ (entire folder - Lighthouse history)
```

### 2. Demo/Test Components:
```
❌ REMOVE DEMO FILES:
- src/DemoApp.js (unused demo app)
- src/Components/ShapeDemo.js (development demo)
```

### 3. Development Tools:
```
❌ REMOVE DEV TOOLS:
- public/test-score.html
- public/bot-diagnostics.html  
- public/setup-webhook.html
- test-bot.js
```

## ✅ KEEP - PRODUCTION FILES

### Core Game Files:
```
✅ ESSENTIAL GAME FILES:
/src/
- App.js (main game app)
- index.js (React entry point)
- index.scss (styles)

/src/Components/ (all except backups):
- AnimatedIngredient.js
- BoxModel.js
- FallingBox.js
- FallingIngredient.js
- Ground.js
- GroundCollider.js
- HeartIcon.js
- Ingredients.js
- MuteButton.js
- Preloader.js
- Screen.js
- SolidBox.js

/src/hooks/:
- useAudio.js
- usePreloader.js
- useTelegramGame.js (main one only)

/src/contexts/:
- TextureContext.js

/src/img/ (all image assets):
- All ingredient images (.webp files)
- title.svg
```

### Configuration & Build:
```
✅ KEEP CONFIG FILES:
- package.json
- package-lock.json
- .gitignore
- netlify.toml
- README.md (project-specific)

/public/ (production files only):
- index.html
- favicon.ico
- logo192.png, logo512.png
- manifest.json
- robots.txt
- telegram-games.js (fallback implementation)
- audio/ (all audio files)

/netlify/functions/:
- telegram-bot.js (main bot function only)
```

## 📋 FOLDER-SPECIFIC README FILES TO CREATE

### 1. `/src/Components/README.md`:
```markdown
# Game Components

Core React components for the Burger Builder game:

## Physics Components
- `FallingIngredient.js` - Falling ingredient physics
- `Ground.js` - Ground collision detection
- `GroundCollider.js` - Ground physics handler

## Game Elements  
- `Ingredients.js` - Main ingredient management
- `AnimatedIngredient.js` - Ingredient animations
- `Screen.js` - Game screen container

## UI Components
- `HeartIcon.js` - Life indicator
- `MuteButton.js` - Audio toggle
- `Preloader.js` - Loading screen

## 3D Models
- `BoxModel.js`, `SolidBox.js`, `FallingBox.js` - 3D physics boxes
```

### 2. `/src/hooks/README.md`:
```markdown
# React Hooks

Custom hooks for game functionality:

- `useAudio.js` - Audio management and sound effects
- `usePreloader.js` - Asset loading and preloader logic  
- `useTelegramGame.js` - Telegram Games API integration
```

### 3. `/netlify/functions/README.md`:
```markdown
# Netlify Functions

Serverless functions for bot functionality:

- `telegram-bot.js` - Main Telegram bot webhook handler
  - Handles game launches
  - Processes score submissions
  - Manages leaderboards via setGameScore API
  - Implements full Telegram Games API flow
```

### 4. `/public/README.md`:
```markdown
# Public Assets

Static files served with the game:

## Core Files
- `index.html` - Main HTML entry point
- `telegram-games.js` - Telegram Games API fallback implementation

## PWA Assets  
- `manifest.json` - Progressive Web App configuration
- `favicon.ico`, `logo192.png`, `logo512.png` - App icons

## Audio
- `audio/` - Sound effects and background music
```

## 🚀 CLEANUP EXECUTION PLAN

1. **Create Documentation folder** outside BurgerGame
2. **Move all .md files** (except README.md)
3. **Remove backup/test files**
4. **Create folder-specific README files**
5. **Commit cleaned codebase**

This will result in a clean, production-ready codebase with organized documentation.
