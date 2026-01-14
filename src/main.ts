/**
 * AnyPang - Main Entry Point
 * Web-based Match-3 Puzzle Game
 */

import { Game } from './core/Game';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { DEBUG_MODE } from './utils/constants';

/**
 * Update loading progress UI
 */
function updateLoadingProgress(
  loadingBar: HTMLElement | null,
  loadingText: HTMLElement | null,
  percent: number,
  text: string
): void {
  if (loadingBar) {
    loadingBar.style.width = `${percent}%`;
  }
  if (loadingText) {
    loadingText.textContent = text;
  }
}

/**
 * Show error screen
 */
function showError(message: string): void {
  const loadingScreen = document.getElementById('loading-screen');
  const errorScreen = document.getElementById('error-screen');
  const errorMessage = document.getElementById('error-message');

  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  if (errorScreen && errorMessage) {
    errorMessage.textContent = message;
    errorScreen.classList.add('visible');
  }
}

/**
 * Utility function for delays
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initialize the game application
 */
async function init(): Promise<void> {
  // Get DOM elements
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const loadingText = document.getElementById('loading-text');

  if (!canvas) {
    showError('Canvas element not found');
    return;
  }

  try {
    // Update loading progress
    updateLoadingProgress(loadingBar, loadingText, 10, 'Initializing...');

    // Create game instance
    const game = new Game(canvas);

    updateLoadingProgress(loadingBar, loadingText, 30, 'Creating scenes...');
    await delay(100);

    // Register scenes
    const sceneManager = game.getSceneManager();
    sceneManager.register('menu', new MenuScene(game));
    sceneManager.register('game', new GameScene(game));
    sceneManager.register('result', new ResultScene(game));

    updateLoadingProgress(loadingBar, loadingText, 60, 'Loading assets...');
    await delay(200);

    // TODO: Add actual asset loading here
    // await assetLoader.loadAll((progress) => {
    //   updateLoadingProgress(loadingBar, loadingText, 60 + progress * 30, 'Loading assets...');
    // });

    updateLoadingProgress(loadingBar, loadingText, 90, 'Starting game...');
    await delay(100);

    // Start with menu scene
    sceneManager.switchTo('menu');

    // Start game loop
    game.start();

    updateLoadingProgress(loadingBar, loadingText, 100, 'Ready!');
    await delay(300);

    // Hide loading screen
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }

    if (DEBUG_MODE) {
      console.log('AnyPang initialized successfully');
      
      // Expose game instance for debugging
      (window as any).game = game;
    }

  } catch (error) {
    console.error('Failed to initialize game:', error);
    showError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
}

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Game is hidden - could pause here if needed
    if (DEBUG_MODE) {
      console.log('Game hidden');
    }
  } else {
    // Game is visible again
    if (DEBUG_MODE) {
      console.log('Game visible');
    }
  }
});

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
