/**
 * Result Scene - game over / score display screen
 */

import { Scene } from './Scene';
import type { Game } from '../core/Game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_PRIMARY, COLOR_SECONDARY, STORAGE_KEY_HIGH_SCORE } from '../utils/constants';

interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  action: () => void;
}

export class ResultScene extends Scene {
  private score: number = 0;
  private highScore: number = 0;
  private isNewHighScore: boolean = false;
  private buttons: Button[] = [];
  private hoverButton: Button | null = null;
  private animationTime: number = 0;
  private displayedScore: number = 0;

  constructor(game: Game) {
    super(game);
    this.setupButtons();
  }

  /**
   * Setup menu buttons
   */
  private setupButtons(): void {
    const centerX = CANVAS_WIDTH / 2;
    const buttonWidth = 180;
    const buttonHeight = 50;

    this.buttons = [
      {
        x: centerX - buttonWidth - 20,
        y: 550,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Play Again',
        action: () => this.playAgain(),
      },
      {
        x: centerX + 20,
        y: 550,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Menu',
        action: () => this.goToMenu(),
      },
    ];
  }

  /**
   * Set the final score
   */
  setScore(score: number): void {
    this.score = score;
    this.displayedScore = 0;
    this.loadHighScore();
    this.isNewHighScore = score > this.highScore;
    
    if (this.isNewHighScore) {
      this.highScore = score;
      this.saveHighScore();
    }
  }

  /**
   * Load high score from storage
   */
  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
      if (saved) {
        this.highScore = parseInt(saved, 10);
      }
    } catch {
      this.highScore = 0;
    }
  }

  /**
   * Save high score to storage
   */
  private saveHighScore(): void {
    try {
      localStorage.setItem(STORAGE_KEY_HIGH_SCORE, this.highScore.toString());
    } catch {
      // localStorage not available
    }
  }

  /**
   * Play again
   */
  private playAgain(): void {
    this.game.getSceneManager().switchTo('game');
  }

  /**
   * Go back to menu
   */
  private goToMenu(): void {
    this.game.getSceneManager().switchTo('menu');
  }

  enter(): void {
    this.animationTime = 0;
    this.displayedScore = 0;
    this.setupInput();
  }

  /**
   * Setup input handlers
   */
  private setupInput(): void {
    const input = this.game.getInput();

    input.onClick((pos) => {
      for (const button of this.buttons) {
        if (this.isPointInButton(pos.x, pos.y, button)) {
          button.action();
          break;
        }
      }
    });

    input.onPointerMove((pos) => {
      this.hoverButton = null;
      for (const button of this.buttons) {
        if (this.isPointInButton(pos.x, pos.y, button)) {
          this.hoverButton = button;
          break;
        }
      }
    });
  }

  /**
   * Check if point is inside button
   */
  private isPointInButton(x: number, y: number, button: Button): boolean {
    return (
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    );
  }

  update(deltaTime: number): void {
    this.animationTime += deltaTime;

    // Animate score counting up
    if (this.displayedScore < this.score) {
      const increment = Math.max(1, Math.floor(this.score / 50));
      this.displayedScore = Math.min(this.displayedScore + increment, this.score);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw decorations
    this.drawDecorations(ctx);

    // Draw title
    this.drawTitle(ctx);

    // Draw score
    this.drawScore(ctx);

    // Draw high score
    this.drawHighScore(ctx);

    // Draw new high score badge
    if (this.isNewHighScore) {
      this.drawNewHighScoreBadge(ctx);
    }

    // Draw buttons
    this.drawButtons(ctx);
  }

  /**
   * Draw decorative elements
   */
  private drawDecorations(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.1;

    // Animated circles
    const time = this.animationTime / 1000;
    const colors = ['#e94560', '#4a90d9', '#4ecdc4', '#f9ca24', '#9b59b6'];
    
    for (let i = 0; i < 5; i++) {
      const x = CANVAS_WIDTH / 2 + Math.cos(time + i * 1.2) * 200;
      const y = CANVAS_HEIGHT / 2 + Math.sin(time + i * 1.2) * 200;
      const r = 40 + Math.sin(time * 2 + i) * 20;
      
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw title
   */
  private drawTitle(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', CANVAS_WIDTH / 2, 150);
  }

  /**
   * Draw score
   */
  private drawScore(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Your Score', CANVAS_WIDTH / 2, 280);

    // Animated score number
    const scale = 1 + Math.sin(this.animationTime / 200) * 0.02;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 350);
    ctx.scale(scale, scale);

    const scoreGradient = ctx.createLinearGradient(-100, 0, 100, 0);
    scoreGradient.addColorStop(0, COLOR_PRIMARY);
    scoreGradient.addColorStop(0.5, COLOR_SECONDARY);
    scoreGradient.addColorStop(1, COLOR_PRIMARY);
    
    ctx.fillStyle = scoreGradient;
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(this.displayedScore.toLocaleString(), 0, 0);
    
    ctx.restore();
  }

  /**
   * Draw high score
   */
  private drawHighScore(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f9ca24';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Best: ${this.highScore.toLocaleString()}`, CANVAS_WIDTH / 2, 450);
  }

  /**
   * Draw new high score badge
   */
  private drawNewHighScoreBadge(ctx: CanvasRenderingContext2D): void {
    const bounce = Math.abs(Math.sin(this.animationTime / 300)) * 10;
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 420 - bounce);
    
    // Badge background
    ctx.fillStyle = '#f9ca24';
    ctx.beginPath();
    ctx.roundRect(-80, -15, 160, 30, 15);
    ctx.fill();

    // Badge text
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEW HIGH SCORE!', 0, 0);
    
    ctx.restore();
  }

  /**
   * Draw buttons
   */
  private drawButtons(ctx: CanvasRenderingContext2D): void {
    for (const button of this.buttons) {
      const isHovered = button === this.hoverButton;
      
      // Button background
      ctx.fillStyle = isHovered ? COLOR_SECONDARY : COLOR_PRIMARY;
      ctx.beginPath();
      ctx.roundRect(button.x, button.y, button.width, button.height, 12);
      ctx.fill();

      // Button highlight
      if (isHovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(button.x + 4, button.y + 4, button.width - 8, button.height / 2 - 4, 8);
        ctx.fill();
      }

      // Button text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
  }

  exit(): void {
    // Clear input handlers
    const input = this.game.getInput();
    input.onClick(() => {});
    input.onPointerMove(() => {});
  }
}
