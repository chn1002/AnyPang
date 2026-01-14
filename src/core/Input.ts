/**
 * Input handler - manages mouse and touch input
 */

import { Position, BoardPosition } from '../utils/types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  BOARD_OFFSET_X, 
  BOARD_OFFSET_Y, 
  TILE_SIZE, 
  BOARD_ROWS, 
  BOARD_COLS,
  MIN_SWAP_DISTANCE 
} from '../utils/constants';

export type InputCallback = (position: Position) => void;
export type SwipeCallback = (start: BoardPosition, end: BoardPosition) => void;

export class Input {
  private canvas: HTMLCanvasElement;
  private scale: number = 1;
  
  // Current state
  private isPointerDown: boolean = false;
  private pointerStartPosition: Position | null = null;
  private currentPosition: Position | null = null;
  
  // Callbacks
  private onClickCallback: InputCallback | null = null;
  private onSwipeCallback: SwipeCallback | null = null;
  private onPointerDownCallback: InputCallback | null = null;
  private onPointerMoveCallback: InputCallback | null = null;
  private onPointerUpCallback: InputCallback | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.updateScale();
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handlePointerDown);
    this.canvas.addEventListener('mousemove', this.handlePointerMove);
    this.canvas.addEventListener('mouseup', this.handlePointerUp);
    this.canvas.addEventListener('mouseleave', this.handlePointerCancel);

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.handlePointerCancel);

    // Update scale on resize
    window.addEventListener('resize', () => this.updateScale());
  }

  /**
   * Update scale from canvas
   */
  private updateScale(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.scale = rect.width / CANVAS_WIDTH;
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  private screenToCanvas(screenX: number, screenY: number): Position {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left) / this.scale,
      y: (screenY - rect.top) / this.scale,
    };
  }

  /**
   * Convert canvas position to board position
   */
  canvasToBoardPosition(canvasPos: Position): BoardPosition | null {
    const col = Math.floor((canvasPos.x - BOARD_OFFSET_X) / TILE_SIZE);
    const row = Math.floor((canvasPos.y - BOARD_OFFSET_Y) / TILE_SIZE);

    if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
      return { row, col };
    }
    return null;
  }

  /**
   * Handle pointer down (mouse)
   */
  private handlePointerDown = (event: MouseEvent): void => {
    const pos = this.screenToCanvas(event.clientX, event.clientY);
    this.onPointerDownInternal(pos);
  };

  /**
   * Handle pointer move (mouse)
   */
  private handlePointerMove = (event: MouseEvent): void => {
    const pos = this.screenToCanvas(event.clientX, event.clientY);
    this.onPointerMoveInternal(pos);
  };

  /**
   * Handle pointer up (mouse)
   */
  private handlePointerUp = (event: MouseEvent): void => {
    const pos = this.screenToCanvas(event.clientX, event.clientY);
    this.onPointerUpInternal(pos);
  };

  /**
   * Handle touch start
   */
  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const pos = this.screenToCanvas(touch.clientX, touch.clientY);
      this.onPointerDownInternal(pos);
    }
  };

  /**
   * Handle touch move
   */
  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      const pos = this.screenToCanvas(touch.clientX, touch.clientY);
      this.onPointerMoveInternal(pos);
    }
  };

  /**
   * Handle touch end
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    event.preventDefault();
    if (this.currentPosition) {
      this.onPointerUpInternal(this.currentPosition);
    }
  };

  /**
   * Handle pointer cancel
   */
  private handlePointerCancel = (): void => {
    this.isPointerDown = false;
    this.pointerStartPosition = null;
    this.currentPosition = null;
  };

  /**
   * Internal pointer down handler
   */
  private onPointerDownInternal(pos: Position): void {
    this.isPointerDown = true;
    this.pointerStartPosition = { ...pos };
    this.currentPosition = { ...pos };

    if (this.onPointerDownCallback) {
      this.onPointerDownCallback(pos);
    }
  }

  /**
   * Internal pointer move handler
   */
  private onPointerMoveInternal(pos: Position): void {
    this.currentPosition = { ...pos };

    if (this.onPointerMoveCallback) {
      this.onPointerMoveCallback(pos);
    }
  }

  /**
   * Internal pointer up handler
   */
  private onPointerUpInternal(pos: Position): void {
    if (!this.isPointerDown || !this.pointerStartPosition) {
      return;
    }

    const startPos = this.pointerStartPosition;
    const dx = pos.x - startPos.x;
    const dy = pos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if it's a swipe
    if (distance >= MIN_SWAP_DISTANCE && this.onSwipeCallback) {
      const startBoardPos = this.canvasToBoardPosition(startPos);
      
      if (startBoardPos) {
        // Determine swipe direction
        let endBoardPos: BoardPosition;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          endBoardPos = {
            row: startBoardPos.row,
            col: startBoardPos.col + (dx > 0 ? 1 : -1),
          };
        } else {
          // Vertical swipe
          endBoardPos = {
            row: startBoardPos.row + (dy > 0 ? 1 : -1),
            col: startBoardPos.col,
          };
        }

        // Validate end position
        if (endBoardPos.row >= 0 && endBoardPos.row < BOARD_ROWS &&
            endBoardPos.col >= 0 && endBoardPos.col < BOARD_COLS) {
          this.onSwipeCallback(startBoardPos, endBoardPos);
        }
      }
    } else if (this.onClickCallback) {
      // It's a click/tap
      this.onClickCallback(pos);
    }

    if (this.onPointerUpCallback) {
      this.onPointerUpCallback(pos);
    }

    // Reset state
    this.isPointerDown = false;
    this.pointerStartPosition = null;
  }

  /**
   * Update method (called each frame)
   */
  update(): void {
    // Can be used for input buffering if needed
  }

  /**
   * Set click callback
   */
  onClick(callback: InputCallback): void {
    this.onClickCallback = callback;
  }

  /**
   * Set swipe callback
   */
  onSwipe(callback: SwipeCallback): void {
    this.onSwipeCallback = callback;
  }

  /**
   * Set pointer down callback
   */
  onPointerDown(callback: InputCallback): void {
    this.onPointerDownCallback = callback;
  }

  /**
   * Set pointer move callback
   */
  onPointerMove(callback: InputCallback): void {
    this.onPointerMoveCallback = callback;
  }

  /**
   * Set pointer up callback
   */
  onPointerUp(callback: InputCallback): void {
    this.onPointerUpCallback = callback;
  }

  /**
   * Check if pointer is currently down
   */
  isDown(): boolean {
    return this.isPointerDown;
  }

  /**
   * Get current pointer position
   */
  getPosition(): Position | null {
    return this.currentPosition;
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.handlePointerDown);
    this.canvas.removeEventListener('mousemove', this.handlePointerMove);
    this.canvas.removeEventListener('mouseup', this.handlePointerUp);
    this.canvas.removeEventListener('mouseleave', this.handlePointerCancel);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handlePointerCancel);
  }
}
