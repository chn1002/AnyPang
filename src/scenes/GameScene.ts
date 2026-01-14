/**
 * Game Scene - main gameplay screen
 */

import { Scene } from './Scene';
import type { Game } from '../core/Game';
import { Board } from '../entities/Board';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { Match, BoardPosition } from '../utils/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  TILE_SIZE,
  BOARD_COLS,
  BOARD_ROWS,
  DEFAULT_TIME_LIMIT,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  TILE_COLORS,
} from '../utils/constants';

export class GameScene extends Scene {
  private board: Board;
  private scoreSystem: ScoreSystem;
  private particleSystem: ParticleSystem;
  
  private timeRemaining: number = DEFAULT_TIME_LIMIT;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private comboDisplay: { count: number; alpha: number } | null = null;

  constructor(game: Game) {
    super(game);
    this.board = new Board();
    this.scoreSystem = new ScoreSystem();
    this.particleSystem = new ParticleSystem();
  }

  enter(): void {
    // Reset game state
    this.board = new Board();
    this.scoreSystem.reset();
    this.particleSystem.clear();
    this.timeRemaining = DEFAULT_TIME_LIMIT;
    this.isGameOver = false;
    this.isPaused = false;
    this.comboDisplay = null;

    // Setup board callbacks
    this.board.onMatch((matches, isCombo) => {
      this.handleMatches(matches, isCombo);
    });

    this.board.onBoardSettled(() => {
      this.handleBoardSettled();
    });

    // Setup input
    this.setupInput();
  }

  /**
   * Setup input handlers
   */
  private setupInput(): void {
    const input = this.game.getInput();

    input.onSwipe((start: BoardPosition, end: BoardPosition) => {
      if (this.isGameOver || this.isPaused) return;
      this.board.trySwap(start, end);
    });

    input.onClick((pos) => {
      if (this.isGameOver || this.isPaused) return;
      
      const boardPos = input.canvasToBoardPosition(pos);
      if (boardPos) {
        const selectedTile = this.board.getSelectedTile();
        
        if (selectedTile) {
          // Try to swap with selected tile
          const success = this.board.trySwap(selectedTile.getBoardPosition(), boardPos);
          if (!success) {
            // Select new tile if swap failed
            this.board.selectTile(boardPos.row, boardPos.col);
          }
        } else {
          // Select tile
          this.board.selectTile(boardPos.row, boardPos.col);
        }
      }
    });
  }

  /**
   * Handle match events
   */
  private handleMatches(matches: Match[], isCombo: boolean): void {
    // Calculate center position for score popup
    let totalX = 0;
    let totalY = 0;
    let count = 0;

    for (const match of matches) {
      for (const pos of match.tiles) {
        totalX += BOARD_OFFSET_X + pos.col * TILE_SIZE + TILE_SIZE / 2;
        totalY += BOARD_OFFSET_Y + pos.row * TILE_SIZE + TILE_SIZE / 2;
        count++;
      }
    }

    const centerX = totalX / count;
    const centerY = totalY / count;

    // Add score
    this.scoreSystem.addMatchScore(matches, this.board.getComboCount(), centerX, centerY);

    // Create particles for each match
    for (const match of matches) {
      for (const pos of match.tiles) {
        const x = BOARD_OFFSET_X + pos.col * TILE_SIZE + TILE_SIZE / 2;
        const y = BOARD_OFFSET_Y + pos.row * TILE_SIZE + TILE_SIZE / 2;
        const tile = this.board.getTile(pos.row, pos.col);
        const color = tile ? TILE_COLORS[tile.type] || '#ffffff' : '#ffffff';
        this.particleSystem.createExplosion(x, y, color);
      }
    }

    // Show combo display
    if (isCombo) {
      this.comboDisplay = {
        count: this.board.getComboCount(),
        alpha: 1,
      };
      this.particleSystem.createComboBurst(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, this.board.getComboCount());
    }

    // Add time bonus
    this.timeRemaining = Math.min(this.timeRemaining + 1, DEFAULT_TIME_LIMIT + 30);
  }

  /**
   * Handle board settled event
   */
  private handleBoardSettled(): void {
    // Check for valid moves
    if (!this.board.hasValidMoves()) {
      this.board.shuffle();
    }
  }

  update(deltaTime: number): void {
    if (this.isGameOver || this.isPaused) return;

    // Update timer
    this.timeRemaining -= deltaTime / 1000;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/22845485-8f4a-4699-8df5-df420e89716b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:update',message:'Timer reached 0, calling endGame',data:{timeRemaining:this.timeRemaining,score:this.scoreSystem.getScore()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      this.endGame();
      return;
    }

    // Update systems
    this.board.update(deltaTime);
    this.scoreSystem.update(deltaTime);
    this.particleSystem.update(deltaTime);

    // Update combo display
    if (this.comboDisplay) {
      this.comboDisplay.alpha -= deltaTime / 1000;
      if (this.comboDisplay.alpha <= 0) {
        this.comboDisplay = null;
      }
    }
  }

  /**
   * End the game
   */
  private endGame(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/22845485-8f4a-4699-8df5-df420e89716b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:endGame',message:'endGame called',data:{score:this.scoreSystem.getScore(),isGameOver:this.isGameOver},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    this.isGameOver = true;
    
    // Switch to result scene after a short delay
    setTimeout(() => {
      const resultScene = this.game.getSceneManager().getScene('result');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/22845485-8f4a-4699-8df5-df420e89716b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GameScene.ts:endGame:setTimeout',message:'Switching to result scene',data:{resultSceneFound:!!resultScene,finalScore:this.scoreSystem.getScore()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (resultScene) {
        (resultScene as any).setScore(this.scoreSystem.getScore());
      }
      this.game.getSceneManager().switchTo('result');
    }, 1000);
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw UI
    this.drawUI(ctx);

    // Draw board
    this.board.render(ctx);

    // Draw particles
    this.particleSystem.render(ctx);

    // Draw score popups
    this.scoreSystem.renderPopups(ctx);

    // Draw combo display
    if (this.comboDisplay) {
      this.drawComboDisplay(ctx);
    }

    // Draw game over overlay
    if (this.isGameOver) {
      this.drawGameOverOverlay(ctx);
    }
  }

  /**
   * Draw UI elements
   */
  private drawUI(ctx: CanvasRenderingContext2D): void {
    // Score display
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Score', 30, 50);
    
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = COLOR_SECONDARY;
    ctx.fillText(this.scoreSystem.getScore().toLocaleString(), 30, 90);

    // Timer display
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Time', CANVAS_WIDTH - 30, 50);
    
    const timeColor = this.timeRemaining <= 10 ? '#e94560' : COLOR_SECONDARY;
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = timeColor;
    ctx.fillText(Math.ceil(this.timeRemaining).toString(), CANVAS_WIDTH - 30, 90);

    // Timer bar
    const barWidth = 200;
    const barHeight = 8;
    const barX = (CANVAS_WIDTH - barWidth) / 2;
    const barY = 70;
    const progress = this.timeRemaining / DEFAULT_TIME_LIMIT;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 4);
    ctx.fill();

    ctx.fillStyle = progress <= 0.2 ? '#e94560' : COLOR_PRIMARY;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * Math.min(progress, 1), barHeight, 4);
    ctx.fill();

    // High score
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`Best: ${this.scoreSystem.getHighScore().toLocaleString()}`, CANVAS_WIDTH / 2, 50);
  }

  /**
   * Draw combo display
   */
  private drawComboDisplay(ctx: CanvasRenderingContext2D): void {
    if (!this.comboDisplay) return;

    ctx.save();
    ctx.globalAlpha = this.comboDisplay.alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const scale = 1 + (1 - this.comboDisplay.alpha) * 0.5;
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 100);
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${this.comboDisplay.count}x COMBO!`, 3, 3);

    // Text
    const comboGradient = ctx.createLinearGradient(-100, 0, 100, 0);
    comboGradient.addColorStop(0, '#f9ca24');
    comboGradient.addColorStop(0.5, '#ffffff');
    comboGradient.addColorStop(1, '#f9ca24');
    ctx.fillStyle = comboGradient;
    ctx.fillText(`${this.comboDisplay.count}x COMBO!`, 0, 0);

    ctx.restore();
  }

  /**
   * Draw game over overlay
   */
  private drawGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Time's Up!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.restore();
  }

  exit(): void {
    // Clear input handlers
    const input = this.game.getInput();
    input.onSwipe(() => {});
    input.onClick(() => {});
  }

  /**
   * Get current score (for result scene)
   */
  getScore(): number {
    return this.scoreSystem.getScore();
  }
}
