/**
 * Main Game class - handles game loop and core systems
 */

import { SceneManager } from '../scenes/SceneManager';
import { Canvas } from './Canvas';
import { Input } from './Input';
import { FIXED_TIMESTEP, DEBUG_MODE, SHOW_FPS } from '../utils/constants';

export class Game {
  private canvas: Canvas;
  private input: Input;
  private sceneManager: SceneManager;
  
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private animationFrameId: number = 0;
  
  // FPS tracking
  private frameCount: number = 0;
  private fpsTime: number = 0;
  private currentFps: number = 0;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new Canvas(canvasElement);
    this.input = new Input(canvasElement);
    this.sceneManager = new SceneManager(this);
  }

  /**
   * Get the canvas wrapper
   */
  getCanvas(): Canvas {
    return this.canvas;
  }

  /**
   * Get the input handler
   */
  getInput(): Input {
    return this.input;
  }

  /**
   * Get the scene manager
   */
  getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  /**
   * Get canvas rendering context
   */
  getContext(): CanvasRenderingContext2D {
    return this.canvas.getContext();
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.fpsTime = this.lastTime;
    this.loop(this.lastTime);

    if (DEBUG_MODE) {
      console.log('Game started');
    }
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    if (DEBUG_MODE) {
      console.log('Game stopped');
    }
  }

  /**
   * Main game loop
   */
  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= FIXED_TIMESTEP) {
      this.update(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
    }

    // Render
    this.render();

    // FPS calculation
    this.frameCount++;
    if (currentTime - this.fpsTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = currentTime;
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Update game logic
   */
  private update(deltaTime: number): void {
    // Process input
    this.input.update();

    // Update current scene
    this.sceneManager.update(deltaTime);
  }

  /**
   * Render the game
   */
  private render(): void {
    const ctx = this.canvas.getContext();

    // Clear canvas
    this.canvas.clear();

    // Render current scene
    this.sceneManager.render(ctx);

    // Render FPS counter if debug mode
    if (SHOW_FPS) {
      this.renderFps(ctx);
    }
  }

  /**
   * Render FPS counter
   */
  private renderFps(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 60, 24);
    ctx.fillStyle = '#00ff00';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`FPS: ${this.currentFps}`, 10, 17);
    ctx.restore();
  }

  /**
   * Get current FPS
   */
  getFps(): number {
    return this.currentFps;
  }
}
