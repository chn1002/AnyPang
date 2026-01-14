/**
 * Scene Manager - handles scene transitions and lifecycle
 */

import type { Scene } from './Scene';
import type { SceneName } from '../utils/types';

export class SceneManager {
  private scenes: Map<SceneName, Scene> = new Map();
  private currentScene: Scene | null = null;
  private currentSceneName: SceneName | null = null;

  constructor(_game: unknown) {
    // Game reference reserved for future use
  }

  /**
   * Register a scene with a name
   */
  register(name: SceneName, scene: Scene): void {
    this.scenes.set(name, scene);
  }

  /**
   * Switch to a different scene
   */
  switchTo(name: SceneName): void {
    const newScene = this.scenes.get(name);
    
    if (!newScene) {
      console.error(`Scene "${name}" not found`);
      return;
    }

    // Exit current scene
    if (this.currentScene) {
      this.currentScene.setIsActive(false);
      this.currentScene.exit();
    }

    // Enter new scene
    this.currentScene = newScene;
    this.currentSceneName = name;
    this.currentScene.setIsActive(true);
    this.currentScene.enter();
  }

  /**
   * Update current scene
   */
  update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Render current scene
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.currentScene) {
      this.currentScene.render(ctx);
    }
  }

  /**
   * Get current scene name
   */
  getCurrentSceneName(): SceneName | null {
    return this.currentSceneName;
  }

  /**
   * Get current scene
   */
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  /**
   * Get a registered scene by name
   */
  getScene(name: SceneName): Scene | undefined {
    return this.scenes.get(name);
  }
}
