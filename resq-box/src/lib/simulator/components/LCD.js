/**
 * LCD Display — 16x2 character LCD with green backlight.
 */
export class LCD {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.text = '';
    this.backlight = true;
    this.cursorBlink = 0;
  }

  print(text) {
    this.text = text.substring(0, 32); // Max 16x2 = 32 chars
  }

  clear() {
    this.text = '';
  }

  update(dt) {
    this.cursorBlink += dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = 80;
    const h = 34;

    // PCB border
    ctx.fillStyle = '#1A5C1A';
    ctx.strokeStyle = '#0D3B0D';
    ctx.lineWidth = 2;

    // Rounded rect
    const r = 3;
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

    // Screen area
    const sx = -w / 2 + 6;
    const sy = -h / 2 + 6;
    const sw = w - 12;
    const sh = h - 12;

    // Backlight glow
    if (this.backlight) {
      const bgGrad = ctx.createLinearGradient(0, sy, 0, sy + sh);
      bgGrad.addColorStop(0, '#2ECC40');
      bgGrad.addColorStop(1, '#01FF70');
      ctx.fillStyle = bgGrad;
    } else {
      ctx.fillStyle = '#1A3A1A';
    }
    ctx.fillRect(sx, sy, sw, sh);

    // Screen border
    ctx.strokeStyle = '#0D3B0D';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, sw, sh);

    // Text (16x2)
    ctx.fillStyle = '#001A00';
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const line1 = this.text.substring(0, 16).padEnd(16, ' ');
    const line2 = this.text.substring(16, 32).padEnd(16, ' ');

    ctx.fillText(line1, sx + 3, sy + 3);
    ctx.fillText(line2, sx + 3, sy + 3 + 11);

    // Cursor blink
    if (Math.floor(this.cursorBlink * 2) % 2 === 0 && this.text.length > 0) {
      const cursorX = sx + 3 + (this.text.length % 16) * 5.5;
      const cursorY = sy + 3 + (this.text.length >= 16 ? 11 : 0);
      ctx.fillStyle = '#001A00';
      ctx.fillRect(cursorX, cursorY, 5, 10);
    }

    // Pin headers
    ctx.fillStyle = '#C0C0C0';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(-w / 2 + 4 + i * 9, h / 2 + 1, 3, 4);
    }

    ctx.restore();
  }

  get status() {
    return this.text ? `"${this.text}"` : 'Empty';
  }
}
