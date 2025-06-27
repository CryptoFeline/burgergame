# Public Assets

Static files served with the game:

## Core Application Files
- `index.html` - Main HTML entry point with Telegram Games integration
- `telegram-games.js` - Telegram Games API fallback implementation for development/testing

## Progressive Web App (PWA) Assets  
- `manifest.json` - PWA configuration (app name, icons, display mode)
- `favicon.ico` - Browser tab icon
- `logo192.png`, `logo512.png` - App icons for various contexts
- `robots.txt` - Search engine crawling instructions

## Game Assets
- `audio/` - Sound effects and background music files
  - Background music, collision sounds, game over sounds
  - Various ingredient drop and impact audio

## Build Output
During build, additional optimized assets are generated in `/build` for production deployment.

Note: The `telegram-games.js` file provides a fallback implementation of `TelegramGameProxy` for when the official Telegram Games API is not available (development mode).
