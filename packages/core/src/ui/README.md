# Kuuzuki Game Engine UI System

A comprehensive UI system for the Kuuzuki Game Engine that follows ECS (Entity-Component-System) architecture and integrates seamlessly with the Canvas2D renderer.

## Overview

The UI system provides a complete set of components and systems for creating interactive user interfaces in games. It includes text rendering, buttons, panels, and a complete screen management system.

## Components

### UIText

Renders text with extensive styling options.

```typescript
const textEntity = new Entity()
  .addComponent(new Transform2D(x, y))
  .addComponent(
    new UIText("Hello World", {
      fontSize: 24,
      color: "#FFFFFF",
      textAlign: "center",
      strokeColor: "#000000",
      strokeWidth: 2,
      shadow: {
        color: "#000000",
        offsetX: 2,
        offsetY: 2,
        blur: 3,
      },
    })
  );
```

**Features:**

- Font family and size control
- Text color and alignment
- Stroke (outline) support
- Drop shadow effects
- Layer-based rendering
- Dynamic text updates

### UIButton

Interactive button component with hover and click states.

```typescript
const buttonEntity = new Entity()
  .addComponent(new Transform2D(x, y))
  .addComponent(
    new UIButton(
      "Click Me",
      120,
      40,
      {
        fontSize: 16,
        color: "#FFFFFF",
      },
      {
        backgroundColor: "#006600",
        hoverBackgroundColor: "#008800",
        pressedBackgroundColor: "#004400",
        borderColor: "#00FF00",
        borderWidth: 2,
        borderRadius: 6,
      }
    )
  );

buttonEntity.getComponent(UIButton)!.onClick = () => {
  console.log("Button clicked!");
};
```

**Features:**

- Hover, pressed, and disabled states
- Customizable styling for each state
- Click event callbacks
- Rounded corners and borders
- Enable/disable functionality

### UIPanel

Background panels and containers for UI layouts.

```typescript
const panelEntity = new Entity()
  .addComponent(new Transform2D(x, y))
  .addComponent(
    new UIPanel(width, height, {
      backgroundColor: "#333333",
      borderColor: "#FFFFFF",
      borderWidth: 2,
      borderRadius: 8,
      opacity: 0.9,
      shadow: {
        color: "#000000",
        offsetX: 3,
        offsetY: 3,
        blur: 5,
      },
    })
  );
```

**Features:**

- Background colors and opacity
- Borders with customizable width and color
- Rounded corners
- Drop shadows
- Layer-based rendering

### GameState

Manages overall game state and statistics.

```typescript
const gameStateEntity = new Entity().addComponent(new GameState("menu"));

const gameState = gameStateEntity.getComponent(GameState)!;
gameState.onStateChange = (newState, oldState) => {
  console.log(`State changed: ${oldState} -> ${newState}`);
};

gameState.setState("playing");
gameState.addScore(100);
```

**Features:**

- State management (menu, playing, paused, gameOver, victory)
- Score and lives tracking
- High score persistence
- State change callbacks

## Systems

### UIRenderSystem

Renders all UI components using Canvas2D.

```typescript
const uiRenderSystem = new UIRenderSystem(canvas);
engine.world.addSystem(uiRenderSystem);
```

**Features:**

- Layer-based rendering order
- Visibility culling
- Rounded rectangle drawing
- Text shadows and strokes
- Opacity support

### UIInputSystem

Handles mouse input for UI interactions.

```typescript
const uiInputSystem = new UIInputSystem(engine.inputManager, canvas);
engine.world.addSystem(uiInputSystem);
```

**Features:**

- Mouse position tracking
- Button hover detection
- Click event handling
- UI interaction prevention during game

### GameScreenSystem

Complete screen management system with pre-built game screens.

```typescript
const gameScreenSystem = new GameScreenSystem(canvas);

// Setup callbacks
gameScreenSystem.onStartGame = () => startNewGame();
gameScreenSystem.onRestartGame = () => restartGame();
gameScreenSystem.onResumeGame = () => resumeGame();
gameScreenSystem.onPauseGame = () => pauseGame();
gameScreenSystem.onQuitGame = () => quitToMenu();

engine.world.addSystem(gameScreenSystem);
gameScreenSystem.addScreenEntitiesToWorld(engine.world);
```

**Built-in Screens:**

- **Menu Screen**: Title, start button, instructions
- **Game HUD**: Score, lives, high score display
- **Pause Screen**: Resume and quit options
- **Game Over Screen**: Final score, restart button
- **Victory Screen**: Celebration, play again option

## Quick Start

### 1. Basic Setup

```typescript
import {
  GameEngine,
  Entity,
  Transform2D,
  UIRenderSystem,
  UIInputSystem,
  GameScreenSystem,
  GameState,
} from "@kenji-engine/core";

// Initialize engine
const engine = new GameEngine({ canvas, mode: "2d" });
await engine.initialize();

// Add UI systems
engine.world.addSystem(new UIInputSystem(engine.inputManager, canvas));
engine.world.addSystem(new UIRenderSystem(canvas));

const gameScreenSystem = new GameScreenSystem(canvas);
engine.world.addSystem(gameScreenSystem);

// Create game state
const gameStateEntity = new Entity().addComponent(new GameState("menu"));
engine.world.addEntity(gameStateEntity);

// Add screen entities
gameScreenSystem.addScreenEntitiesToWorld(engine.world);

engine.start();
```

### 2. Custom UI Elements

```typescript
// Create a custom panel with text and button
const panel = new Entity().addComponent(new Transform2D(100, 100)).addComponent(
  new UIPanel(300, 200, {
    backgroundColor: "#333333",
    borderColor: "#FFFFFF",
    borderWidth: 2,
    borderRadius: 10,
  })
);

const title = new Entity().addComponent(new Transform2D(250, 130)).addComponent(
  new UIText("Settings", {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
  })
);

const closeButton = new Entity()
  .addComponent(new Transform2D(200, 250))
  .addComponent(new UIButton("Close", 100, 30));

closeButton.getComponent(UIButton)!.onClick = () => {
  panel.active = false;
  title.active = false;
  closeButton.active = false;
};

engine.world.addEntity(panel);
engine.world.addEntity(title);
engine.world.addEntity(closeButton);
```

## Styling Guide

### Colors

Use hex color codes for consistent styling:

```typescript
{
  color: "#FFFFFF",           // White text
  backgroundColor: "#333333", // Dark gray background
  borderColor: "#00FF00",     // Bright green border
  hoverBackgroundColor: "#444444" // Lighter gray on hover
}
```

### Typography

```typescript
{
  font: "Arial",              // Font family
  fontSize: 16,               // Size in pixels
  textAlign: "center",        // left, center, right
  textBaseline: "middle"      // top, middle, bottom
}
```

### Effects

```typescript
{
  shadow: {
    color: "#000000",
    offsetX: 2,
    offsetY: 2,
    blur: 3
  },
  strokeColor: "#000000",
  strokeWidth: 1
}
```

## Responsive Design

The UI system supports responsive design through:

1. **Canvas Scaling**: Automatic canvas resizing while maintaining aspect ratio
2. **Relative Positioning**: Use canvas dimensions for positioning
3. **Dynamic Sizing**: Components can be resized based on screen size

```typescript
// Responsive positioning
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const button = new Entity()
  .addComponent(new Transform2D(centerX - 50, centerY))
  .addComponent(new UIButton("Center Button", 100, 40));
```

## Performance Considerations

- **Layer Ordering**: Use layer property to control render order
- **Visibility Culling**: Set `visible: false` to skip rendering
- **Entity Pooling**: Reuse entities instead of creating new ones
- **Batch Updates**: Update multiple UI elements in single frame

## Integration with Game Logic

### State Management

```typescript
const gameState = gameStateEntity.getComponent(GameState)!;

// Update score
gameState.addScore(points);

// Change state
gameState.setState("gameOver");

// Check state
if (gameState.isState("playing")) {
  // Game logic
}
```

### Event Handling

```typescript
// Button callbacks
button.getComponent(UIButton)!.onClick = () => {
  // Handle button click
};

// State change callbacks
gameState.onStateChange = (newState, oldState) => {
  // Handle state transitions
};
```

## Examples

See the complete implementation in:

- `/example/main-with-ui.ts` - Full Breakout game with UI
- `/example/test-ui.ts` - Simple UI test
- `/example/index-ui.html` - Styled HTML page

## Architecture

The UI system follows these principles:

1. **ECS Compliance**: All UI elements are entities with components
2. **Separation of Concerns**: Rendering, input, and logic are separate systems
3. **Composability**: Components can be mixed and matched
4. **Extensibility**: Easy to add new components and systems
5. **Performance**: Efficient rendering with layer-based culling

## Browser Compatibility

- Modern browsers with Canvas2D support
- ES6+ JavaScript features
- Mouse event handling
- Local storage for persistence
