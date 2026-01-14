# AnyPang Game Development Guidelines

## Table of Contents
1. [Game Overview](#game-overview)
2. [Architecture](#architecture)
3. [Core Systems](#core-systems)
4. [Match-3 Game Logic](#match-3-game-logic)
5. [Animation System](#animation-system)
6. [Scene Management](#scene-management)
7. [Input Handling](#input-handling)
8. [Asset Management](#asset-management)
9. [Performance Optimization](#performance-optimization)
10. [Deployment](#deployment)

---

## Game Overview

### Game Type
AnyPang is a **Match-3 Puzzle Game** where players swap adjacent tiles to create matches of 3 or more identical tiles in a row or column.

### Core Mechanics
- **Tile Swapping**: Players swap two adjacent tiles
- **Match Detection**: System detects matches of 3+ identical tiles
- **Tile Destruction**: Matched tiles are removed from the board
- **Cascade/Gravity**: Remaining tiles fall down, new tiles fill from top
- **Combo System**: Consecutive matches increase score multiplier
- **Time/Move Limit**: Game ends when time runs out or moves are exhausted

### Game Flow
```
[Start] → [Menu Scene] → [Game Scene] → [Result Scene] → [Menu Scene]
                              ↓
                    [Pause/Resume]
```

---

## Architecture

### Directory Structure
```
src/
├── core/                    # Engine fundamentals
│   ├── Game.ts             # Main game class, game loop
│   ├── Canvas.ts           # Canvas wrapper, rendering context
│   └── Input.ts            # Input event handling
│
├── entities/               # Game objects
│   ├── Board.ts           # Game board (grid of tiles)
│   ├── Tile.ts            # Individual tile entity
│   └── Effect.ts          # Visual effects (particles, etc.)
│
├── scenes/                 # Game screens
│   ├── Scene.ts           # Base scene class
│   ├── MenuScene.ts       # Main menu
│   ├── GameScene.ts       # Main gameplay
│   └── ResultScene.ts     # Game over / score display
│
├── systems/               # Game logic systems
│   ├── MatchSystem.ts     # Match detection algorithm
│   ├── ScoreSystem.ts     # Score calculation
│   └── AnimationSystem.ts # Animation management
│
├── utils/                 # Utilities
│   ├── constants.ts       # Game constants
│   ├── types.ts          # TypeScript type definitions
│   └── helpers.ts        # Helper functions
│
├── assets/               # Asset management
│   └── AssetLoader.ts    # Preloading images, sounds
│
└── main.ts               # Application entry point
```

### Class Diagram
```
Game
├── Canvas
├── Input
├── AssetLoader
├── SceneManager
│   ├── MenuScene
│   ├── GameScene
│   │   ├── Board
│   │   │   └── Tile[]
│   │   ├── MatchSystem
│   │   ├── ScoreSystem
│   │   └── AnimationSystem
│   └── ResultScene
```

---

## Core Systems

### Game Loop
The game loop follows a fixed timestep pattern:

```typescript
class Game {
    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly FIXED_TIMESTEP: number = 1000 / 60; // 60 FPS

    private loop(currentTime: number): void {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;

        // Fixed timestep updates
        while (this.accumulator >= this.FIXED_TIMESTEP) {
            this.update(this.FIXED_TIMESTEP);
            this.accumulator -= this.FIXED_TIMESTEP;
        }

        // Render with interpolation
        this.render();
        
        requestAnimationFrame(this.loop.bind(this));
    }
}
```

### Canvas Management
```typescript
class Canvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    // Handle high-DPI displays
    setupHiDPI(): void {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
    }
    
    // Responsive resize
    resize(): void {
        // Maintain aspect ratio
        // Fit to container
    }
}
```

---

## Match-3 Game Logic

### Board Representation
```typescript
interface BoardConfig {
    rows: number;      // Default: 8
    cols: number;      // Default: 8
    tileTypes: number; // Default: 6 (different colors)
}

// Board is a 2D array of tiles
type BoardGrid = (Tile | null)[][];
```

### Tile Types
```typescript
enum TileType {
    Red = 0,
    Blue = 1,
    Green = 2,
    Yellow = 3,
    Purple = 4,
    Orange = 5,
    // Special tiles
    Bomb = 100,
    Lightning = 101,
}
```

### Match Detection Algorithm
```typescript
class MatchSystem {
    // Find all matches on the board
    findMatches(board: BoardGrid): Match[] {
        const matches: Match[] = [];
        
        // Check horizontal matches
        for (let row = 0; row < BOARD_ROWS; row++) {
            let matchLength = 1;
            for (let col = 1; col < BOARD_COLS; col++) {
                if (this.tilesMatch(board[row][col-1], board[row][col])) {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        matches.push(this.createMatch(row, col - matchLength, matchLength, 'horizontal'));
                    }
                    matchLength = 1;
                }
            }
            // Check end of row
            if (matchLength >= 3) {
                matches.push(this.createMatch(row, BOARD_COLS - matchLength, matchLength, 'horizontal'));
            }
        }
        
        // Check vertical matches (similar logic)
        // ...
        
        return matches;
    }
}
```

### Swap Validation
```typescript
// Only adjacent tiles can be swapped
isValidSwap(tile1: Position, tile2: Position): boolean {
    const dx = Math.abs(tile1.col - tile2.col);
    const dy = Math.abs(tile1.row - tile2.row);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

// Swap must result in a match
wouldCreateMatch(board: BoardGrid, tile1: Position, tile2: Position): boolean {
    // Temporarily swap
    // Check for matches
    // Swap back
    // Return result
}
```

### Cascade Logic
```typescript
// After matches are removed, tiles fall down
applyGravity(board: BoardGrid): void {
    for (let col = 0; col < BOARD_COLS; col++) {
        let emptyRow = BOARD_ROWS - 1;
        
        // Move tiles down
        for (let row = BOARD_ROWS - 1; row >= 0; row--) {
            if (board[row][col] !== null) {
                if (row !== emptyRow) {
                    board[emptyRow][col] = board[row][col];
                    board[row][col] = null;
                    // Trigger fall animation
                }
                emptyRow--;
            }
        }
        
        // Fill empty spaces with new tiles
        for (let row = emptyRow; row >= 0; row--) {
            board[row][col] = this.createRandomTile(row, col);
            // Trigger spawn animation
        }
    }
}
```

---

## Animation System

### Animation Types
```typescript
enum AnimationType {
    TileSwap,      // Two tiles swapping positions
    TileDestroy,   // Tile being removed (scale down, fade)
    TileFall,      // Tile falling due to gravity
    TileSpawn,     // New tile appearing from top
    ScorePopup,    // Score number floating up
    ComboEffect,   // Special effect for combos
}
```

### Animation Queue
```typescript
class AnimationSystem {
    private animations: Animation[] = [];
    
    // Add animation to queue
    add(animation: Animation): void {
        this.animations.push(animation);
    }
    
    // Update all active animations
    update(deltaTime: number): void {
        for (const anim of this.animations) {
            anim.update(deltaTime);
        }
        
        // Remove completed animations
        this.animations = this.animations.filter(a => !a.isComplete);
    }
    
    // Check if any animations are playing
    isAnimating(): boolean {
        return this.animations.length > 0;
    }
}
```

### Easing Functions
```typescript
// Common easing functions for smooth animations
const Easing = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutBounce: (t: number) => {
        // Bounce effect for tile landing
    },
};
```

---

## Scene Management

### Base Scene Class
```typescript
abstract class Scene {
    protected game: Game;
    
    constructor(game: Game) {
        this.game = game;
    }
    
    // Called when scene becomes active
    abstract enter(): void;
    
    // Called every frame
    abstract update(deltaTime: number): void;
    
    // Called every frame after update
    abstract render(ctx: CanvasRenderingContext2D): void;
    
    // Called when leaving scene
    abstract exit(): void;
}
```

### Scene Manager
```typescript
class SceneManager {
    private currentScene: Scene | null = null;
    private scenes: Map<string, Scene> = new Map();
    
    register(name: string, scene: Scene): void {
        this.scenes.set(name, scene);
    }
    
    switchTo(name: string): void {
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        this.currentScene = this.scenes.get(name) || null;
        
        if (this.currentScene) {
            this.currentScene.enter();
        }
    }
}
```

---

## Input Handling

### Mouse Events
```typescript
class Input {
    private canvas: HTMLCanvasElement;
    
    // Convert screen coordinates to game coordinates
    screenToGame(screenX: number, screenY: number): Position {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: screenX - rect.left,
            y: screenY - rect.top
        };
    }
    
    // Convert game coordinates to board position
    gameToBoardPosition(gameX: number, gameY: number): BoardPosition | null {
        const col = Math.floor((gameX - BOARD_OFFSET_X) / TILE_SIZE);
        const row = Math.floor((gameY - BOARD_OFFSET_Y) / TILE_SIZE);
        
        if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
            return { row, col };
        }
        return null;
    }
}
```

### Touch Support
```typescript
// Prevent default touch behaviors on canvas
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    this.handlePointerDown(touch.clientX, touch.clientY);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    this.handlePointerMove(touch.clientX, touch.clientY);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.handlePointerUp();
}, { passive: false });
```

### Drag to Swap
```typescript
// Player drags tile to swap with adjacent tile
handleDragSwap(startPos: BoardPosition, endPos: BoardPosition): void {
    if (!this.isValidSwap(startPos, endPos)) {
        return;
    }
    
    if (this.board.wouldCreateMatch(startPos, endPos)) {
        this.board.swap(startPos, endPos);
        this.processMatches();
    } else {
        // Invalid swap - animate tiles returning
        this.animateInvalidSwap(startPos, endPos);
    }
}
```

---

## Asset Management

### Asset Loader
```typescript
class AssetLoader {
    private images: Map<string, HTMLImageElement> = new Map();
    private sounds: Map<string, HTMLAudioElement> = new Map();
    
    async loadAll(): Promise<void> {
        const imagePromises = [
            this.loadImage('tiles', '/images/tiles.png'),
            this.loadImage('background', '/images/background.png'),
            // ...
        ];
        
        const soundPromises = [
            this.loadSound('match', '/sounds/match.mp3'),
            this.loadSound('swap', '/sounds/swap.mp3'),
            // ...
        ];
        
        await Promise.all([...imagePromises, ...soundPromises]);
    }
    
    private loadImage(key: string, src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    }
}
```

### Sprite Sheet
```typescript
// Tiles are stored in a sprite sheet
// Each tile is TILE_SIZE x TILE_SIZE pixels
// Arranged horizontally by type

drawTile(ctx: CanvasRenderingContext2D, type: TileType, x: number, y: number): void {
    const spriteX = type * TILE_SIZE;
    const spriteY = 0;
    
    ctx.drawImage(
        this.spriteSheet,
        spriteX, spriteY, TILE_SIZE, TILE_SIZE,  // Source
        x, y, TILE_SIZE, TILE_SIZE                // Destination
    );
}
```

---

## Performance Optimization

### Object Pooling
```typescript
class TilePool {
    private pool: Tile[] = [];
    private readonly POOL_SIZE = 100;
    
    init(): void {
        for (let i = 0; i < this.POOL_SIZE; i++) {
            this.pool.push(new Tile());
        }
    }
    
    acquire(): Tile {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }
        return new Tile(); // Expand pool if needed
    }
    
    release(tile: Tile): void {
        tile.reset();
        this.pool.push(tile);
    }
}
```

### Dirty Flag Pattern
```typescript
class Board {
    private isDirty: boolean = true;
    private cachedRender: ImageData | null = null;
    
    markDirty(): void {
        this.isDirty = true;
    }
    
    render(ctx: CanvasRenderingContext2D): void {
        if (this.isDirty || !this.cachedRender) {
            // Perform full render
            this.renderBoard(ctx);
            this.cachedRender = ctx.getImageData(/* ... */);
            this.isDirty = false;
        } else {
            // Use cached render
            ctx.putImageData(this.cachedRender, 0, 0);
        }
        
        // Always render animated elements on top
        this.renderAnimations(ctx);
    }
}
```

### Memory Management
- Avoid creating new objects in the game loop
- Reuse arrays and objects where possible
- Clean up event listeners when scenes change
- Use `WeakMap` for metadata that should be garbage collected

---

## Deployment

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Build Optimization
```javascript
// vite.config.ts
export default defineConfig({
    build: {
        target: 'es2020',
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate vendor code if needed
                }
            }
        }
    }
});
```

### Environment Variables
- `VITE_DEBUG_MODE` - Enable debug features
- Configure in `.env.local` for development
- Set in Netlify dashboard for production

---

## Best Practices Checklist

### Before Committing
- [ ] All code comments in English
- [ ] No `console.log` statements (use debug system)
- [ ] TypeScript strict mode passes
- [ ] Tested on desktop and mobile browsers
- [ ] Assets optimized and compressed

### Before Deployment
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] Game plays correctly in production build
- [ ] Performance acceptable on target devices
