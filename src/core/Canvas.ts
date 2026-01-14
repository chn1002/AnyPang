/**
 * Canvas wrapper class - handles rendering context and responsive sizing
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_BACKGROUND } from '../utils/constants';

export class Canvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale: number = 1;
  private dpr: number = 1;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;

    this.setupCanvas();
    this.setupResizeHandler();
  }

  /**
   * Initial canvas setup
   */
  private setupCanvas(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
  }

  /**
   * Setup window resize handler
   */
  private setupResizeHandler(): void {
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Resize canvas to fit container while maintaining aspect ratio
   */
  resize(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale to fit container
    const scaleX = containerWidth / CANVAS_WIDTH;
    const scaleY = containerHeight / CANVAS_HEIGHT;
    this.scale = Math.min(scaleX, scaleY);

    // Set display size (CSS)
    const displayWidth = CANVAS_WIDTH * this.scale;
    const displayHeight = CANVAS_HEIGHT * this.scale;
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    // Set actual canvas size (accounting for DPI)
    this.canvas.width = displayWidth * this.dpr;
    this.canvas.height = displayHeight * this.dpr;

    // Reset and apply transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr * this.scale, this.dpr * this.scale);
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.fillStyle = COLOR_BACKGROUND;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Get the rendering context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get the canvas element
   */
  getElement(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get current scale
   */
  getScale(): number {
    return this.scale;
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left) / this.scale,
      y: (screenY - rect.top) / this.scale,
    };
  }

  /**
   * Get canvas width (logical)
   */
  getWidth(): number {
    return CANVAS_WIDTH;
  }

  /**
   * Get canvas height (logical)
   */
  getHeight(): number {
    return CANVAS_HEIGHT;
  }
}
