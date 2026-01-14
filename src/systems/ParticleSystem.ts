/**
 * Particle System - handles visual particle effects
 */

import { Position } from '../utils/types';
import { TILE_COLORS } from '../utils/constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  /**
   * Create explosion particles at position
   */
  createExplosion(x: number, y: number, color: string, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 100 + Math.random() * 100;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 400 + Math.random() * 200,
      });
    }
  }

  /**
   * Create sparkle particles
   */
  createSparkle(x: number, y: number, count: number = 5): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 50;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 2 + Math.random() * 3,
        color: '#ffffff',
        alpha: 1,
        lifetime: 0,
        maxLifetime: 300 + Math.random() * 200,
      });
    }
  }

  /**
   * Create combo burst effect
   */
  createComboBurst(x: number, y: number, comboCount: number): void {
    const count = Math.min(comboCount * 5, 30);
    const colors = Object.values(TILE_COLORS);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 5,
        color,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 600 + Math.random() * 300,
      });
    }
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    const gravity = 200;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.lifetime += deltaTime;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += gravity * dt;
      p.alpha = 1 - p.lifetime / p.maxLifetime;
      p.size *= 0.99;

      if (p.lifetime >= p.maxLifetime) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Get particle count
   */
  getCount(): number {
    return this.particles.length;
  }
}
