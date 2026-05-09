/**
 * Water Sensor — animated water level indicator.
 */
export class WaterSensor {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.level = 0; // 0–100
    this.targetLevel = 45; // Default simulation value
  }

  setLevel(value) {
    this.targetLevel = Math.max(0, Math.min(100, value));
  }

  update(dt) {
    // Smooth fill animation
    this.level += (this.targetLevel - this.level) * dt * 3;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = 24;
    const h = 40;

    // Sensor body
    ctx.fillStyle = '#E8E8E8';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;

    // Rounded rectangle body
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + r, r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.arcTo(w / 2, h / 2, w / 2 - r, h / 2, r);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.arcTo(-w / 2, h / 2, -w / 2, h / 2 - r, r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.arcTo(-w / 2, -h / 2, -w / 2 + r, -h / 2, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Water fill
    const fillHeight = (h - 6) * (this.level / 100);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w / 2 + 3, h / 2 - 3 - fillHeight, w - 6, fillHeight);
    ctx.clip();

    // Water gradient
    const grad = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
    grad.addColorStop(0, '#457B9D');
    grad.addColorStop(1, '#A8DADC');
    ctx.fillStyle = grad;
    ctx.fillRect(-w / 2, h / 2 - fillHeight, w, fillHeight);

    // Water surface wave
    if (this.level > 5) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const waveY = h / 2 - 3 - fillHeight;
      const t = Date.now() / 800;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 3, waveY);
      for (let px = -w / 2 + 3; px <= w / 2 - 3; px += 2) {
        ctx.lineTo(px, waveY + Math.sin(px / 4 + t) * 2);
      }
      ctx.lineTo(w / 2 - 3, h / 2);
      ctx.lineTo(-w / 2 + 3, h / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Sensor pins at bottom
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(-3, h / 2, 2, 6);
    ctx.fillRect(1, h / 2, 2, 6);

    // Water droplet icon
    ctx.font = '10px sans-serif';
    ctx.fillStyle = this.level > 50 ? '#457B9D' : '#A8DADC';
    ctx.fillText('💧', -5, -h / 2 - 10);

    ctx.restore();
  }

  get status() {
    return `${Math.round(this.level)}%`;
  }

  read() {
    return Math.round(this.level);
  }
}
