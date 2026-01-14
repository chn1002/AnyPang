/**
 * Base Scene class - abstract class for all game scenes
 */

import type { Game } from '../core/Game';

export abstract class Scene {
  protected game: Game;
  protected isActive: boolean = false;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Called when scene becomes active
   */
  abstract enter(): void;

  /**
   * Called every frame to update game logic
   * @param deltaTime Time since last frame in milliseconds
   */
  abstract update(deltaTime: number): void;

  /**
   * Called every frame to render the scene
   * @param ctx Canvas rendering context
   */
  abstract render(ctx: CanvasRenderingContext2D): void;

  /**
   * Called when leaving the scene
   */
  abstract exit(): void;

  /**
   * Check if scene is currently active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Set scene active state
   */
  setIsActive(active: boolean): void {
    this.isActive = active;
  }
}
