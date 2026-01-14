/**
 * Menu Scene - main menu screen
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

export class MenuScene extends Scene {
  private buttons: Button[] = [];
  private highScore: number = 0;
  private titleScale: number = 1;
  private titleScaleDirection: number = 1;
  private hoverButton: Button | null = null;

  constructor(game: Game) {
    super(game);
    this.setupButtons();
    this.loadHighScore();
  }

  /**
   * Setup menu buttons
   */
  private setupButtons(): void {
    const centerX = CANVAS_WIDTH / 2;
    const buttonWidth = 200;
    const buttonHeight = 60;

    this.buttons = [
      {
        x: centerX - buttonWidth / 2,
        y: 450,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Play',
        action: () => this.startGame(),
      },
    ];
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
   * Start the game
   */
  private startGame(): void {
    this.game.getSceneManager().switchTo('game');
  }

  enter(): void {
    this.loadHighScore();
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
    // Animate title
    this.titleScale += this.titleScaleDirection * 0.0005 * deltaTime;
    if (this.titleScale > 1.05) {
      this.titleScaleDirection = -1;
    } else if (this.titleScale < 0.95) {
      this.titleScaleDirection = 1;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw decorative circles
    this.drawDecorations(ctx);

    // Draw title
    this.drawTitle(ctx);

    // Draw high score
    this.drawHighScore(ctx);

    // Draw buttons
    this.drawButtons(ctx);

    // Draw instructions
    this.drawInstructions(ctx);
  }

  /**
   * Draw decorative background elements
   */
  private drawDecorations(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.1;

    // Draw some circles
    const colors = ['#e94560', '#4a90d9', '#4ecdc4', '#f9ca24', '#9b59b6'];
    const positions = [
      { x: 100, y: 150, r: 80 },
      { x: CANVAS_WIDTH - 80, y: 200, r: 60 },
      { x: 150, y: CANVAS_HEIGHT - 200, r: 70 },
      { x: CANVAS_WIDTH - 120, y: CANVAS_HEIGHT - 150, r: 50 },
    ];

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw game title
   */
  private drawTitle(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 200);
    ctx.scale(this.titleScale, this.titleScale);

    // Title shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AnyPang', 4, 4);

    // Title gradient
    const titleGradient = ctx.createLinearGradient(-150, 0, 150, 0);
    titleGradient.addColorStop(0, COLOR_PRIMARY);
    titleGradient.addColorStop(0.5, COLOR_SECONDARY);
    titleGradient.addColorStop(1, COLOR_PRIMARY);
    ctx.fillStyle = titleGradient;
    ctx.fillText('AnyPang', 0, 0);

    ctx.restore();

    // Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Match-3 Puzzle Game', CANVAS_WIDTH / 2, 280);
  }

  /**
   * Draw high score
   */
  private drawHighScore(ctx: CanvasRenderingContext2D): void {
    if (this.highScore > 0) {
      ctx.fillStyle = '#f9ca24';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`High Score: ${this.highScore.toLocaleString()}`, CANVAS_WIDTH / 2, 350);
    }
  }

  /**
   * Draw menu buttons
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
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
  }

  /**
   * Draw instructions
   */
  private drawInstructions(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    
    ctx.fillText('Swipe to swap adjacent tiles', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
    ctx.fillText('Match 3 or more to score!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 75);
  }

  exit(): void {
    // Clear input handlers
    const input = this.game.getInput();
    input.onClick(() => {});
    input.onPointerMove(() => {});
  }
}
