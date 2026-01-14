/**
 * Score System - handles score calculation and tracking
 */

import { Match } from '../utils/types';
import {
  BASE_MATCH_SCORE,
  EXTRA_TILE_MULTIPLIER,
  COMBO_MULTIPLIER_INCREMENT,
  MAX_COMBO_MULTIPLIER,
  STORAGE_KEY_HIGH_SCORE,
} from '../utils/constants';

export interface ScorePopup {
  x: number;
  y: number;
  score: number;
  alpha: number;
  offsetY: number;
  lifetime: number;
}

export class ScoreSystem {
  private score: number = 0;
  private highScore: number = 0;
  private comboMultiplier: number = 1;
  private scorePopups: ScorePopup[] = [];

  constructor() {
    this.loadHighScore();
  }

  /**
   * Reset score for new game
   */
  reset(): void {
    this.score = 0;
    this.comboMultiplier = 1;
    this.scorePopups = [];
  }

  /**
   * Calculate and add score for matches
   */
  addMatchScore(matches: Match[], comboCount: number, centerX: number, centerY: number): number {
    let totalScore = 0;

    // Calculate combo multiplier
    this.comboMultiplier = Math.min(
      1 + (comboCount - 1) * COMBO_MULTIPLIER_INCREMENT,
      MAX_COMBO_MULTIPLIER
    );

    for (const match of matches) {
      // Base score
      let matchScore = BASE_MATCH_SCORE;

      // Extra tiles bonus
      if (match.length > 3) {
        const extraTiles = match.length - 3;
        matchScore *= Math.pow(EXTRA_TILE_MULTIPLIER, extraTiles);
      }

      // Apply combo multiplier
      matchScore *= this.comboMultiplier;

      totalScore += Math.floor(matchScore);
    }

    this.score += totalScore;

    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }

    // Create score popup
    this.createScorePopup(centerX, centerY, totalScore);

    return totalScore;
  }

  /**
   * Create a floating score popup
   */
  private createScorePopup(x: number, y: number, score: number): void {
    this.scorePopups.push({
      x,
      y,
      score,
      alpha: 1,
      offsetY: 0,
      lifetime: 0,
    });
  }

  /**
   * Update score popups
   */
  update(deltaTime: number): void {
    const popupDuration = 1000;
    const popupSpeed = 50;

    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const popup = this.scorePopups[i];
      popup.lifetime += deltaTime;
      popup.offsetY -= (popupSpeed * deltaTime) / 1000;
      popup.alpha = 1 - popup.lifetime / popupDuration;

      if (popup.lifetime >= popupDuration) {
        this.scorePopups.splice(i, 1);
      }
    }
  }

  /**
   * Render score popups
   */
  renderPopups(ctx: CanvasRenderingContext2D): void {
    for (const popup of this.scorePopups) {
      ctx.save();
      ctx.globalAlpha = popup.alpha;
      ctx.fillStyle = '#ffff00';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = `+${popup.score}`;
      const x = popup.x;
      const y = popup.y + popup.offsetY;

      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      ctx.restore();
    }
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Get high score
   */
  getHighScore(): number {
    return this.highScore;
  }

  /**
   * Get current combo multiplier
   */
  getComboMultiplier(): number {
    return this.comboMultiplier;
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
      // localStorage not available
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
}
