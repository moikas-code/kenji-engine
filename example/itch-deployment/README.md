# Kenji Pong - itch.io Deployment Package

## 🎮 Game Description

Classic Pong game built with the Kenji Game Engine. Features:

- **Two-player gameplay** with W/S and Arrow Keys
- **AI opponent** with adjustable difficulty
- **Retro pixel-perfect graphics** with green terminal aesthetic
- **Dynamic sound effects** using Web Audio API
- **Responsive controls** with smooth paddle movement
- **Score tracking** with first-to-7 wins
- **Pause/resume functionality**

## 🚀 Deployment Instructions

### For itch.io HTML5 Upload:

1. **Zip the contents** of this directory (not the directory itself)
2. **Upload to itch.io** as an HTML5 game
3. **Set the main file** to `index.html`
4. **Recommended viewport size**: 900x600 (gives padding around 800x400 game)
5. **Enable fullscreen** for better experience

### Game Controls:

- **ENTER**: Start game / Play again
- **SPACE**: Pause/Resume
- **R**: Reset game
- **A**: Toggle AI opponent
- **W/S**: Player 1 (left paddle)
- **↑/↓**: Player 2 (right paddle, when AI is off)

## 🎯 Game Features

### Core Gameplay:

- Classic Pong mechanics with modern enhancements
- Ball physics with realistic bouncing and speed variation
- Paddle collision affects ball angle based on hit position
- Progressive ball speed increase for excitement

### AI System:

- Predictive AI that anticipates ball trajectory
- Configurable difficulty (currently set to 85% accuracy)
- Imperfection simulation for fair gameplay
- Reaction delay modeling for realistic behavior

### Audio System:

- Procedural sound generation using Web Audio API
- Different sounds for paddle hits, wall bounces, and scoring
- Game over sound sequence
- No external audio files required

### Visual Design:

- Retro terminal aesthetic with green-on-black color scheme
- Pixel-perfect rendering at 800x400 resolution
- Smooth animations and visual feedback
- Clean, minimalist UI with score display

## 🛠️ Technical Details

- **Engine**: Kenji Game Engine (ECS Architecture)
- **Language**: TypeScript
- **Bundle Size**: ~27KB minified
- **Browser Support**: Modern browsers with Canvas2D and Web Audio API
- **Performance**: 60 FPS target with efficient rendering

## 📦 Files Included

- `index.html` - Main game page with styling
- `dist/main.js` - Minified game bundle
- `README.md` - This documentation

## 🎨 Customization

The game can be easily customized by modifying the `GAME_CONFIG` object:

```typescript
const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  PADDLE_SPEED: 300,
  BALL_SPEED: 250,
  WINNING_SCORE: 7,
  AI_DIFFICULTY: 0.85, // 0.0 = impossible, 1.0 = perfect
};
```

## 🏆 Credits

Built with **Kenji Game Engine** - A modern TypeScript game engine featuring:

- Entity-Component-System (ECS) architecture
- Canvas2D and Three.js rendering support
- Built-in audio and input management
- Modular system design

---

**Ready for itch.io deployment!** 🚀
