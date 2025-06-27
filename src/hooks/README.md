# React Hooks

Custom hooks for game functionality:

## Audio Management
- `useAudio.js` - Audio management, sound effects, and background music control

## Asset Loading  
- `usePreloader.js` - Asset loading management, preloader logic, and loading states

## Telegram Integration
- `useTelegramGame.js` - Telegram Games API integration
  - Environment detection (Telegram vs standalone)
  - Score submission via `TelegramGameProxy.postScore()`
  - User data and game state management
  - Telegram-specific UI adaptations

The hooks follow React patterns and provide clean interfaces for game systems.
