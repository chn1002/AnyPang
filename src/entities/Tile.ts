/**
 * Tile entity - represents a single tile on the game board
 */

import { TileType, TileState, Position, BoardPosition } from '../utils/types';
import { TILE_SIZE, TILE_COLORS, BOARD_OFFSET_X, BOARD_OFFSET_Y } from '../utils/constants';

export class Tile {
  public type: TileType;
  public state: TileState;
  public row: number;
  public col: number;
  
  // Visual properties
  public x: number;
  public y: number;
  public targetX: number;
  public targetY: number;
  public scale: number;
  public alpha: number;
  public rotation: number;

  // Animation properties
  private animationProgress: number = 0;
  private animationDuration: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  constructor(type: TileType, row: number, col: number) {
    this.type = type;
    this.state = TileState.Idle;
    this.row = row;
    this.col = col;
    
    // Calculate position
    const pos = this.calculateScreenPosition(row, col);
    this.x = pos.x;
    this.y = pos.y;
    this.targetX = pos.x;
    this.targetY = pos.y;
    
    this.scale = 1;
    this.alpha = 1;
    this.rotation = 0;
  }

  /**
   * Calculate screen position from board position
   */
  calculateScreenPosition(row: number, col: number): Position {
    return {
      x: BOARD_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2,
      y: BOARD_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  /**
   * Update tile position on board
   */
  setBoardPosition(row: number, col: number): void {
    this.row = row;
    this.col = col;
    const pos = this.calculateScreenPosition(row, col);
    this.targetX = pos.x;
    this.targetY = pos.y;
  }

  /**
   * Start move animation
   */
  startMoveAnimation(duration: number): void {
    this.state = TileState.Swapping;
    this.animationProgress = 0;
    this.animationDuration = duration;
    this.startX = this.x;
    this.startY = this.y;
  }

  /**
   * Start fall animation
   */
  startFallAnimation(duration: number): void {
    this.state = TileState.Falling;
    this.animationProgress = 0;
    this.animationDuration = duration;
    this.startX = this.x;
    this.startY = this.y;
  }

  /**
   * Start spawn animation (from above the board)
   */
  startSpawnAnimation(duration: number, startRow: number): void {
    this.state = TileState.Spawning;
    this.animationProgress = 0;
    this.animationDuration = duration;
    
    // Start from above the board
    const startPos = this.calculateScreenPosition(startRow, this.col);
    this.startX = startPos.x;
    this.startY = startPos.y;
    this.x = this.startX;
    this.y = this.startY;
    this.scale = 0.5;
    this.alpha = 0;
  }

  /**
   * Start destroy animation
   */
  startDestroyAnimation(duration: number): void {
    this.state = TileState.Destroying;
    this.animationProgress = 0;
    this.animationDuration = duration;
  }

  /**
   * Update tile animations
   */
  update(deltaTime: number): boolean {
    if (this.state === TileState.Idle || this.state === TileState.Selected) {
      return false;
    }

    this.animationProgress += deltaTime;
    const t = Math.min(this.animationProgress / this.animationDuration, 1);

    switch (this.state) {
      case TileState.Swapping:
        this.updateMoveAnimation(t);
        break;
      case TileState.Falling:
        this.updateFallAnimation(t);
        break;
      case TileState.Spawning:
        this.updateSpawnAnimation(t);
        break;
      case TileState.Destroying:
        this.updateDestroyAnimation(t);
        break;
    }

    // Check if animation is complete
    if (t >= 1) {
      this.finishAnimation();
      return true;
    }

    return false;
  }

  /**
   * Update move/swap animation
   */
  private updateMoveAnimation(t: number): void {
    // Ease out quad
    const eased = 1 - (1 - t) * (1 - t);
    this.x = this.startX + (this.targetX - this.startX) * eased;
    this.y = this.startY + (this.targetY - this.startY) * eased;
  }

  /**
   * Update fall animation
   */
  private updateFallAnimation(t: number): void {
    // Ease out bounce
    const eased = this.easeOutBounce(t);
    this.x = this.startX + (this.targetX - this.startX) * eased;
    this.y = this.startY + (this.targetY - this.startY) * eased;
  }

  /**
   * Update spawn animation
   */
  private updateSpawnAnimation(t: number): void {
    const eased = this.easeOutBack(t);
    this.x = this.startX + (this.targetX - this.startX) * eased;
    this.y = this.startY + (this.targetY - this.startY) * eased;
    this.scale = 0.5 + 0.5 * eased;
    this.alpha = t;
  }

  /**
   * Update destroy animation
   */
  private updateDestroyAnimation(t: number): void {
    this.scale = 1 - t * 0.5;
    this.alpha = 1 - t;
    this.rotation = t * Math.PI * 0.5;
  }

  /**
   * Finish animation and reset state
   */
  private finishAnimation(): void {
    if (this.state !== TileState.Destroying) {
      this.state = TileState.Idle;
      this.x = this.targetX;
      this.y = this.targetY;
      this.scale = 1;
      this.alpha = 1;
      this.rotation = 0;
    }
  }

  /**
   * Ease out bounce function
   */
  private easeOutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  /**
   * Ease out back function (overshoot)
   */
  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /**
   * Render the tile
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.alpha <= 0) return;

    ctx.save();
    
    // Apply transformations
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = this.alpha;

    // Draw tile
    const halfSize = (TILE_SIZE - 8) / 2;
    const color = TILE_COLORS[this.type] || '#888888';

    // Background with rounded corners
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-halfSize, -halfSize, TILE_SIZE - 8, TILE_SIZE - 8, 12);
    ctx.fill();

    // Highlight effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-halfSize + 4, -halfSize + 4, TILE_SIZE - 20, (TILE_SIZE - 8) / 2 - 4, 8);
    ctx.fill();

    // Selection highlight
    if (this.state === TileState.Selected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-halfSize - 2, -halfSize - 2, TILE_SIZE - 4, TILE_SIZE - 4, 14);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Check if tile is animating
   */
  isAnimating(): boolean {
    return this.state !== TileState.Idle && this.state !== TileState.Selected;
  }

  /**
   * Check if tile is being destroyed
   */
  isDestroying(): boolean {
    return this.state === TileState.Destroying;
  }

  /**
   * Get board position
   */
  getBoardPosition(): BoardPosition {
    return { row: this.row, col: this.col };
  }

  /**
   * Reset tile for reuse (object pooling)
   */
  reset(type: TileType, row: number, col: number): void {
    this.type = type;
    this.state = TileState.Idle;
    this.row = row;
    this.col = col;
    
    const pos = this.calculateScreenPosition(row, col);
    this.x = pos.x;
    this.y = pos.y;
    this.targetX = pos.x;
    this.targetY = pos.y;
    
    this.scale = 1;
    this.alpha = 1;
    this.rotation = 0;
    this.animationProgress = 0;
  }
}
