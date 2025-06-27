# Game Components

Core React components for the Burger Builder game:

## Physics Components
- `FallingIngredient.js` - Falling ingredient physics and collision detection
- `Ground.js` - Ground plane with collision boundaries  
- `GroundCollider.js` - Ground physics collision handler

## Game Elements  
- `Ingredients.js` - Main ingredient management and spawning system
- `AnimatedIngredient.js` - Ingredient animations and visual effects
- `Screen.js` - Main game screen container and layout

## UI Components
- `HeartIcon.js` - Life/health indicator display
- `MuteButton.js` - Audio toggle control
- `Preloader.js` - Asset loading screen and progress display

## 3D Models & Physics
- `BoxModel.js` - Basic 3D box model component
- `SolidBox.js` - Static physics box for platforms
- `FallingBox.js` - Dynamic falling physics boxes

All components use React Three Fiber for 3D rendering and Cannon.js for physics simulation.
