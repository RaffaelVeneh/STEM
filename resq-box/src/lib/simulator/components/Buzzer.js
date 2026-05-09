/**
 * Buzzer component — draws a piezo buzzer with sound wave ripples.
 */
export class Buzzer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.active = false;
    this.frequency = 1000;
    this.ripples = [];
    this.timer = 0;
  }

  beep(freq, duration) {
    this.active = true;
    this.frequency = freq;
    this.timer = duration;
    // Add initial ripple
    this.ripples.push({ radius: 8, opacity: 1 });
  }

  off() {
    this.active = false;
    this.timer = 0;
  }

  update(dt) {
    if (this.active) {
      this.timer -= dt * 1000;
      if (this.timer <= 0) {
        this.active = false;
      }

      // Spawn ripples at frequency rate
      const rippleInterval = 1000 / Math.min(this.frequency, 20);
      if (Math.random() < dt * (20 / rippleInterval)) {
        this.ripples.push({ radius: 8, opacity: 1 });
      }
    }

    // Update ripples
    for (const ripple of this.ripples) {
      ripple.radius += dt * 60;
      ripple.opacity -= dt * 2;
    }
    // Cull dead ripples
    this.ripples = this.ripples.filter((r) => r.opacity > 0 && r.radius < 40);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Buzzer body (piezo disc)
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner metal disc
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#C0C0C0';
    ctx.fill();

    // Plus sign
    ctx.fillStyle = '#333';
    ctx.fillRect(-1, -4, 2, 8);
    ctx.fillRect(-4, -1, 8, 2);

    // Sound wave ripples
    for (const ripple of this.ripples) {
      ctx.beginPath();
      ctx.arc(0, 0, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 107, 53, ${ripple.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Vibration lines when active
    if (this.active) {
      ctx.strokeStyle = '#FF6B35';
      ctx.lineWidth = 1;
      const shake = Math.sin(Date.now() / 30) * 2;
      for (let i = 0; i < 3; i++) {
        const ly = -14 - i * 4 + shake;
        ctx.beginPath();
        ctx.moveTo(-6, ly);
        ctx.lineTo(6, ly);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  get status() {
    return this.active ? `ON (${this.frequency}Hz)` : 'OFF';
  }

  async pattern(type, delayFn) {
    const patterns = {
      SOS: [
        [200, 200], [200, 200], [200, 400],
        [500, 200], [500, 200], [500, 400],
        [200, 200], [200, 200], [200, 600],
      ],
      FAST: [[100, 100], [100, 100], [100, 100], [100, 100], [100, 100]],
      SLOW: [[500, 500], [500, 500], [500, 500]],
      SHORT_3: [[100, 200], [100, 200], [100, 500]],
    };
    const seq = patterns[type] || patterns.SOS;
    for (const [onTime, offTime] of seq) {
      this.beep(1000, onTime);
      await delayFn(onTime + offTime);
    }
    this.off();
  }
}
