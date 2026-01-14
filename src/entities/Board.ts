/**
 * Board entity - manages the game board grid and tiles
 */

import { Tile } from './Tile';
import { TileType, TileState, BoardPosition, Match, MatchDirection } from '../utils/types';
import {
  BOARD_ROWS,
  BOARD_COLS,
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  TILE_SIZE,
  TILE_TYPE_COUNT,
  MIN_MATCH_LENGTH,
  SWAP_DURATION,
  FALL_DURATION_PER_CELL,
  DESTROY_DURATION,
  SPAWN_DURATION,
} from '../utils/constants';

export type BoardCallback = () => void;
export type MatchCallback = (matches: Match[], isCombo: boolean) => void;

export class Board {
  private grid: (Tile | null)[][];
  private selectedTile: Tile | null = null;
  private isProcessing: boolean = false;
  private comboCount: number = 0;
  
  // Callbacks
  private onMatchCallback: MatchCallback | null = null;
  private onBoardSettledCallback: BoardCallback | null = null;

  constructor() {
    this.grid = [];
    this.initializeBoard();
  }

  /**
   * Initialize board with random tiles (no initial matches)
   */
  initializeBoard(): void {
    this.grid = [];
    
    for (let row = 0; row < BOARD_ROWS; row++) {
      this.grid[row] = [];
      for (let col = 0; col < BOARD_COLS; col++) {
        const type = this.getRandomTileType(row, col);
        this.grid[row][col] = new Tile(type, row, col);
      }
    }
  }

  /**
   * Get random tile type that doesn't create an initial match
   */
  private getRandomTileType(row: number, col: number): TileType {
    const availableTypes: TileType[] = [];
    
    for (let type = 0; type < TILE_TYPE_COUNT; type++) {
      if (!this.wouldCreateMatch(row, col, type)) {
        availableTypes.push(type);
      }
    }

    // If all types would create matches, just pick random
    if (availableTypes.length === 0) {
      return Math.floor(Math.random() * TILE_TYPE_COUNT);
    }

    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * Check if placing a tile type would create a match
   */
  private wouldCreateMatch(row: number, col: number, type: TileType): boolean {
    // Check horizontal
    if (col >= 2) {
      const left1 = this.grid[row]?.[col - 1];
      const left2 = this.grid[row]?.[col - 2];
      if (left1 && left2 && left1.type === type && left2.type === type) {
        return true;
      }
    }

    // Check vertical
    if (row >= 2) {
      const up1 = this.grid[row - 1]?.[col];
      const up2 = this.grid[row - 2]?.[col];
      if (up1 && up2 && up1.type === type && up2.type === type) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get tile at position
   */
  getTile(row: number, col: number): Tile | null {
    if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) {
      return null;
    }
    return this.grid[row][col];
  }

  /**
   * Select tile at position
   */
  selectTile(row: number, col: number): void {
    const tile = this.getTile(row, col);
    if (!tile || this.isProcessing) return;

    if (this.selectedTile) {
      this.selectedTile.state = TileState.Idle;
    }

    this.selectedTile = tile;
    tile.state = TileState.Selected;
  }

  /**
   * Deselect current tile
   */
  deselectTile(): void {
    if (this.selectedTile) {
      this.selectedTile.state = TileState.Idle;
      this.selectedTile = null;
    }
  }

  /**
   * Get selected tile
   */
  getSelectedTile(): Tile | null {
    return this.selectedTile;
  }

  /**
   * Try to swap two tiles
   */
  trySwap(pos1: BoardPosition, pos2: BoardPosition): boolean {
    if (this.isProcessing) return false;

    // Check if adjacent
    const dx = Math.abs(pos1.col - pos2.col);
    const dy = Math.abs(pos1.row - pos2.row);
    
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
      return false;
    }

    const tile1 = this.getTile(pos1.row, pos1.col);
    const tile2 = this.getTile(pos2.row, pos2.col);
    
    if (!tile1 || !tile2) return false;

    // Perform logical swap first (without animation)
    this.swapTilesLogical(tile1, tile2);
    
    // Check if swap creates matches
    const matches = this.findMatches();
    
    if (matches.length > 0) {
      // Valid swap - start animation and process matches
      this.isProcessing = true;
      this.comboCount = 0;
      this.deselectTile();
      
      // Start swap animation
      tile1.startMoveAnimation(SWAP_DURATION);
      tile2.startMoveAnimation(SWAP_DURATION);
      
      // Wait for swap animation then process
      setTimeout(() => {
        this.processMatches(matches);
      }, SWAP_DURATION);
      
      return true;
    } else {
      // Invalid swap - swap back immediately (no animation needed for logic)
      this.swapTilesLogical(tile1, tile2);
      
      // Show swap and swap-back animation
      tile1.startMoveAnimation(SWAP_DURATION);
      tile2.startMoveAnimation(SWAP_DURATION);
      
      setTimeout(() => {
        // Swap animation positions to show return
        const tempX = tile1.targetX;
        const tempY = tile1.targetY;
        tile1.targetX = tile2.targetX;
        tile1.targetY = tile2.targetY;
        tile2.targetX = tempX;
        tile2.targetY = tempY;
        
        tile1.startMoveAnimation(SWAP_DURATION);
        tile2.startMoveAnimation(SWAP_DURATION);
      }, SWAP_DURATION);
      
      return false;
    }
  }

  /**
   * Swap two tiles logically (grid only, no animation)
   */
  private swapTilesLogical(tile1: Tile, tile2: Tile): void {
    // Swap in grid
    const row1 = tile1.row;
    const col1 = tile1.col;
    const row2 = tile2.row;
    const col2 = tile2.col;

    this.grid[row1][col1] = tile2;
    this.grid[row2][col2] = tile1;

    // Update tile board positions
    tile1.row = row2;
    tile1.col = col2;
    tile2.row = row1;
    tile2.col = col1;

    // Update target positions for animation
    const pos1 = tile1.calculateScreenPosition(row2, col2);
    const pos2 = tile2.calculateScreenPosition(row1, col1);
    tile1.targetX = pos1.x;
    tile1.targetY = pos1.y;
    tile2.targetX = pos2.x;
    tile2.targetY = pos2.y;
  }

  /**
   * Find all matches on the board
   */
  findMatches(): Match[] {
    const matches: Match[] = [];
    const matched: boolean[][] = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(false));

    // Find horizontal matches
    for (let row = 0; row < BOARD_ROWS; row++) {
      let matchStart = 0;
      let matchLength = 1;

      for (let col = 1; col <= BOARD_COLS; col++) {
        const currentTile = this.getTile(row, col);
        const prevTile = this.getTile(row, col - 1);

        if (currentTile && prevTile && currentTile.type === prevTile.type && 
            !currentTile.isAnimating() && !prevTile.isAnimating()) {
          matchLength++;
        } else {
          if (matchLength >= MIN_MATCH_LENGTH) {
            const tiles: BoardPosition[] = [];
            for (let i = matchStart; i < matchStart + matchLength; i++) {
              tiles.push({ row, col: i });
              matched[row][i] = true;
            }
            matches.push({
              tiles,
              direction: MatchDirection.Horizontal,
              length: matchLength,
            });
          }
          matchStart = col;
          matchLength = 1;
        }
      }
    }

    // Find vertical matches
    for (let col = 0; col < BOARD_COLS; col++) {
      let matchStart = 0;
      let matchLength = 1;

      for (let row = 1; row <= BOARD_ROWS; row++) {
        const currentTile = this.getTile(row, col);
        const prevTile = this.getTile(row - 1, col);

        if (currentTile && prevTile && currentTile.type === prevTile.type &&
            !currentTile.isAnimating() && !prevTile.isAnimating()) {
          matchLength++;
        } else {
          if (matchLength >= MIN_MATCH_LENGTH) {
            const tiles: BoardPosition[] = [];
            for (let i = matchStart; i < matchStart + matchLength; i++) {
              if (!matched[i][col]) {
                tiles.push({ row: i, col });
                matched[i][col] = true;
              }
            }
            if (tiles.length > 0) {
              matches.push({
                tiles,
                direction: MatchDirection.Vertical,
                length: matchLength,
              });
            }
          }
          matchStart = row;
          matchLength = 1;
        }
      }
    }

    return matches;
  }

  /**
   * Process matched tiles
   */
  private processMatches(matches: Match[]): void {
    this.comboCount++;
    
    // Notify callback
    if (this.onMatchCallback) {
      this.onMatchCallback(matches, this.comboCount > 1);
    }

    // Collect all matched positions
    const toDestroy: Set<string> = new Set();
    for (const match of matches) {
      for (const pos of match.tiles) {
        toDestroy.add(`${pos.row},${pos.col}`);
      }
    }

    // Start destroy animations
    for (const key of toDestroy) {
      const [row, col] = key.split(',').map(Number);
      const tile = this.getTile(row, col);
      if (tile) {
        tile.startDestroyAnimation(DESTROY_DURATION);
      }
    }

    // Wait for destroy animation then apply gravity
    setTimeout(() => {
      this.removeDestroyedTiles();
      this.applyGravity();
    }, DESTROY_DURATION);
  }

  /**
   * Remove destroyed tiles from grid
   */
  private removeDestroyedTiles(): void {
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const tile = this.grid[row][col];
        if (tile && tile.isDestroying()) {
          this.grid[row][col] = null;
        }
      }
    }
  }

  /**
   * Apply gravity - make tiles fall down
   */
  private applyGravity(): void {
    let maxFallDistance = 0;

    for (let col = 0; col < BOARD_COLS; col++) {
      let emptySpaces = 0;

      // Process from bottom to top
      for (let row = BOARD_ROWS - 1; row >= 0; row--) {
        const tile = this.grid[row][col];
        
        if (tile === null) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          // Move tile down
          const newRow = row + emptySpaces;
          this.grid[newRow][col] = tile;
          this.grid[row][col] = null;
          
          tile.setBoardPosition(newRow, col);
          tile.startFallAnimation(FALL_DURATION_PER_CELL * emptySpaces);
          
          maxFallDistance = Math.max(maxFallDistance, emptySpaces);
        }
      }

      // Spawn new tiles at top
      for (let i = 0; i < emptySpaces; i++) {
        const row = emptySpaces - 1 - i;
        const type = Math.floor(Math.random() * TILE_TYPE_COUNT);
        const tile = new Tile(type, row, col);
        
        this.grid[row][col] = tile;
        tile.startSpawnAnimation(SPAWN_DURATION + i * 50, -1 - i);
        
        maxFallDistance = Math.max(maxFallDistance, emptySpaces);
      }
    }

    // Wait for all animations then check for new matches
    const waitTime = Math.max(
      FALL_DURATION_PER_CELL * maxFallDistance + 100,
      SPAWN_DURATION + (BOARD_ROWS - 1) * 50 + 100
    );

    setTimeout(() => {
      this.checkCascade();
    }, waitTime);
  }

  /**
   * Check for cascade matches after gravity
   */
  private checkCascade(): void {
    const matches = this.findMatches();
    
    if (matches.length > 0) {
      // Continue cascade
      this.processMatches(matches);
    } else {
      // Board settled
      this.isProcessing = false;
      this.comboCount = 0;
      
      if (this.onBoardSettledCallback) {
        this.onBoardSettledCallback();
      }
    }
  }

  /**
   * Check if board is currently processing
   */
  getIsProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Update all tiles
   */
  update(deltaTime: number): void {
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const tile = this.grid[row][col];
        if (tile) {
          tile.update(deltaTime);
        }
      }
    }
  }

  /**
   * Render the board
   */
  render(ctx: CanvasRenderingContext2D): void {
    // Draw board background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(
      BOARD_OFFSET_X - 10,
      BOARD_OFFSET_Y - 10,
      BOARD_COLS * TILE_SIZE + 20,
      BOARD_ROWS * TILE_SIZE + 20,
      16
    );
    ctx.fill();

    // Draw grid background
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const x = BOARD_OFFSET_X + col * TILE_SIZE;
        const y = BOARD_OFFSET_Y + row * TILE_SIZE;
        
        ctx.fillStyle = (row + col) % 2 === 0 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw tiles (sort by state for proper rendering order)
    const tilesToRender: Tile[] = [];
    
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const tile = this.grid[row][col];
        if (tile) {
          tilesToRender.push(tile);
        }
      }
    }

    // Render normal tiles first, then selected/animating tiles
    for (const tile of tilesToRender) {
      if (tile.state === TileState.Idle) {
        tile.render(ctx);
      }
    }
    
    for (const tile of tilesToRender) {
      if (tile.state !== TileState.Idle) {
        tile.render(ctx);
      }
    }
  }

  /**
   * Set match callback
   */
  onMatch(callback: MatchCallback): void {
    this.onMatchCallback = callback;
  }

  /**
   * Set board settled callback
   */
  onBoardSettled(callback: BoardCallback): void {
    this.onBoardSettledCallback = callback;
  }

  /**
   * Get current combo count
   */
  getComboCount(): number {
    return this.comboCount;
  }

  /**
   * Check if any valid moves exist
   */
  hasValidMoves(): boolean {
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        // Check swap right
        if (col < BOARD_COLS - 1) {
          if (this.wouldMatchAfterSwap({ row, col }, { row, col: col + 1 })) {
            return true;
          }
        }
        // Check swap down
        if (row < BOARD_ROWS - 1) {
          if (this.wouldMatchAfterSwap({ row, col }, { row: row + 1, col })) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Check if swapping two positions would create a match
   */
  private wouldMatchAfterSwap(pos1: BoardPosition, pos2: BoardPosition): boolean {
    const tile1 = this.getTile(pos1.row, pos1.col);
    const tile2 = this.getTile(pos2.row, pos2.col);
    
    if (!tile1 || !tile2) return false;

    // Temporarily swap
    this.grid[pos1.row][pos1.col] = tile2;
    this.grid[pos2.row][pos2.col] = tile1;

    // Check for matches at both positions
    const hasMatch = 
      this.checkMatchAt(pos1.row, pos1.col, tile2.type) ||
      this.checkMatchAt(pos2.row, pos2.col, tile1.type);

    // Swap back
    this.grid[pos1.row][pos1.col] = tile1;
    this.grid[pos2.row][pos2.col] = tile2;

    return hasMatch;
  }

  /**
   * Check if there's a match at a specific position
   */
  private checkMatchAt(row: number, col: number, type: TileType): boolean {
    // Check horizontal
    let hCount = 1;
    for (let c = col - 1; c >= 0 && this.getTile(row, c)?.type === type; c--) hCount++;
    for (let c = col + 1; c < BOARD_COLS && this.getTile(row, c)?.type === type; c++) hCount++;
    
    if (hCount >= MIN_MATCH_LENGTH) return true;

    // Check vertical
    let vCount = 1;
    for (let r = row - 1; r >= 0 && this.getTile(r, col)?.type === type; r--) vCount++;
    for (let r = row + 1; r < BOARD_ROWS && this.getTile(r, col)?.type === type; r++) vCount++;
    
    return vCount >= MIN_MATCH_LENGTH;
  }

  /**
   * Shuffle board if no valid moves
   */
  shuffle(): void {
    // Collect all tile types
    const types: TileType[] = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const tile = this.getTile(row, col);
        if (tile) {
          types.push(tile.type);
        }
      }
    }

    // Shuffle types
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }

    // Reassign types
    let index = 0;
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const tile = this.getTile(row, col);
        if (tile) {
          tile.type = types[index++];
        }
      }
    }
  }
}
