/**
 * LED component for the RESQ-BOX simulator canvas.
 * Draws a glowing LED with color, on/off state, and blink animation.
 */
export class LED {
  constructor(x, y, color = 'red', pin = 9) {
    this.x = x;
    this.y = y;
    this.color = color; // 'red' | 'yellow' | 'green'
    this.pin = pin;
    this.state = false; // true = ON, false = OFF
    this.brightness = 0; // 0–1 for glow animation
    this.blinking = false;
    this.blinkTimer = 0;
    this.radius = 12;
  }

  on() {
    this.state = true;
    this.brightness = 1;
    this.blinking = false;
  }

  off() {
    this.state = false;
    this.brightness = 0;
    this.blinking = false;
  }

  async blink(times, delayFn) {
    this.blinking = true;
    for (let i = 0; i < times; i++) {
      this.state = true;
      this.brightness = 1;
      await delayFn(300);
      this.state = false;
      this.brightness = 0;
      await delayFn(300);
    }
    this.blinking = false;
  }

  update(dt) {
    if (this.state && !this.blinking) {
      // Subtle glow pulse
      this.brightness = 0.7 + Math.sin(Date.now() / 300) * 0.3;
    }
  }

  draw(ctx) {
    const colorMap = {
      red: { base: '#E63946', glow: '#FF6B6B', dark: '#8B0000' },
      yellow: { base: '#FFC107', glow: '#FFE082', dark: '#996F00' },
      green: { base: '#2EC4B6', glow: '#7FFFD4', dark: '#006B5E' },
    };
    const colors = colorMap[this.color] || colorMap.red;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow effect when on
    if (this.brightness > 0.1) {
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 12 * this.brightness;
    }

    // LED body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.state ? colors.base : colors.dark;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(-3, -3, this.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = this.state
      ? `rgba(255,255,255,${0.6 * this.brightness})`
      : 'rgba(255,255,255,0.1)';
    ctx.fill();

    ctx.restore();
  }

  get status() {
    return this.state ? 'ON' : 'OFF';
  }
}
