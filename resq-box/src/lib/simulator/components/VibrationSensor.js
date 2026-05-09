/**
 * Vibration Sensor — animated shaking sensor.
 */
export class VibrationSensor {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.intensity = 0; // 0–100
    this.targetIntensity = 25; // Default
    this.shakeX = 0;
    this.shakeY = 0;
  }

  setIntensity(value) {
    this.targetIntensity = Math.max(0, Math.min(100, value));
  }

  update(dt) {
    this.intensity += (this.targetIntensity - this.intensity) * dt * 4;
    if (this.intensity > 5) {
      const shake = (this.intensity / 100) * 4;
      this.shakeX = (Math.random() - 0.5) * shake;
      this.shakeY = (Math.random() - 0.5) * shake;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.shakeX, this.y + this.shakeY);

    // Sensor base
    ctx.fillStyle = '#E8E8E8';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;

    // Main body (circle)
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner spring visualization
    const coils = 4;
    const coilAmp = this.intensity / 25;
    ctx.strokeStyle = this.intensity > 30 ? '#E63946' : '#F4A261';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= coils * 8; i++) {
      const t = i / (coils * 8);
      const px = -6 + t * 12;
      const py = Math.sin(t * Math.PI * coils) * (3 + coilAmp * 2) + Math.sin(Date.now() / 50) * coilAmp;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Vibration lines
    if (this.intensity > 10) {
      ctx.strokeStyle = `rgba(230, 57, 70, ${this.intensity / 200})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Date.now() / 200;
        const sx = Math.cos(angle) * 13;
        const sy = Math.sin(angle) * 13;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * 3, sy + Math.sin(angle) * 3);
        ctx.stroke();
      }
    }

    // Pins
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(-2, 10, 1.5, 5);
    ctx.fillRect(1, 10, 1.5, 5);

    // Icon
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText('📳', -6, -15);

    ctx.restore();
  }

  get status() {
    return `${Math.round(this.intensity)}`;
  }

  read() {
    return Math.round(this.intensity);
  }
}
