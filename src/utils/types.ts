/**
 * Core type definitions for AnyPang game
 */

// ============================================================
// Position & Coordinate Types
// ============================================================

/**
 * 2D position in screen/canvas coordinates (pixels)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Position on the game board (row/column indices)
 */
export interface BoardPosition {
  row: number;
  col: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Rectangle bounds
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================
// Tile Types
// ============================================================

/**
 * Types of tiles in the game
 */
export enum TileType {
  // Standard tiles (colors)
  Red = 0,
  Blue = 1,
  Green = 2,
  Yellow = 3,
  Purple = 4,
  Orange = 5,
  
  // Special tiles (for future implementation)
  Bomb = 100,
  Lightning = 101,
  Rainbow = 102,
  
  // Empty/null tile
  Empty = -1,
}

/**
 * State of a tile
 */
export enum TileState {
  Idle = 'idle',
  Selected = 'selected',
  Swapping = 'swapping',
  Falling = 'falling',
  Destroying = 'destroying',
  Spawning = 'spawning',
}

/**
 * Tile entity data
 */
export interface TileData {
  type: TileType;
  state: TileState;
  position: BoardPosition;
  screenPosition: Position;
  targetPosition: Position;
  scale: number;
  alpha: number;
}

// ============================================================
// Match Types
// ============================================================

/**
 * Direction of a match
 */
export enum MatchDirection {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

/**
 * A matched group of tiles
 */
export interface Match {
  tiles: BoardPosition[];
  direction: MatchDirection;
  length: number;
}

// ============================================================
// Game State Types
// ============================================================

/**
 * Overall game state
 */
export enum GameState {
  Loading = 'loading',
  Menu = 'menu',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameover',
}

/**
 * State during gameplay
 */
export enum PlayState {
  Idle = 'idle',           // Waiting for player input
  Selected = 'selected',   // Tile selected, waiting for swap
  Swapping = 'swapping',   // Animating swap
  Matching = 'matching',   // Processing matches
  Falling = 'falling',     // Tiles falling after match
  Combo = 'combo',         // Chain reaction in progress
}

/**
 * Game session data
 */
export interface GameSessionData {
  score: number;
  level: number;
  moves: number;
  timeRemaining: number;
  combo: number;
  maxCombo: number;
}

// ============================================================
// Animation Types
// ============================================================

/**
 * Types of animations
 */
export enum AnimationType {
  TileSwap = 'tile_swap',
  TileDestroy = 'tile_destroy',
  TileFall = 'tile_fall',
  TileSpawn = 'tile_spawn',
  ScorePopup = 'score_popup',
  ComboEffect = 'combo_effect',
}

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Animation data
 */
export interface AnimationData {
  type: AnimationType;
  startTime: number;
  duration: number;
  from: Position;
  to: Position;
  easing: EasingFunction;
  onComplete?: () => void;
}

// ============================================================
// Input Types
// ============================================================

/**
 * Input event types
 */
export enum InputEventType {
  PointerDown = 'pointer_down',
  PointerMove = 'pointer_move',
  PointerUp = 'pointer_up',
  PointerCancel = 'pointer_cancel',
}

/**
 * Input event data
 */
export interface InputEvent {
  type: InputEventType;
  position: Position;
  timestamp: number;
}

// ============================================================
// Scene Types
// ============================================================

/**
 * Available scene names
 */
export type SceneName = 'loading' | 'menu' | 'game' | 'result';

/**
 * Scene transition types
 */
export enum TransitionType {
  None = 'none',
  Fade = 'fade',
  Slide = 'slide',
}

// ============================================================
// Asset Types
// ============================================================

/**
 * Asset loading progress
 */
export interface LoadingProgress {
  loaded: number;
  total: number;
  currentAsset: string;
}

/**
 * Image asset manifest entry
 */
export interface ImageAsset {
  key: string;
  src: string;
}

/**
 * Sound asset manifest entry
 */
export interface SoundAsset {
  key: string;
  src: string;
  volume?: number;
  loop?: boolean;
}

// ============================================================
// Utility Types
// ============================================================

/**
 * Generic callback function type
 */
export type Callback = () => void;

/**
 * Callback with generic parameter
 */
export type CallbackWithParam<T> = (param: T) => void;

/**
 * Optional type helper
 */
export type Optional<T> = T | null | undefined;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
