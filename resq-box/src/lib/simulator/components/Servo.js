/**
 * Servo motor — animated rotation.
 */
export class Servo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetAngle = 90; // 0–180 degrees
    this.currentAngle = 90;
  }

  rotate(angle) {
    this.targetAngle = Math.max(0, Math.min(180, angle));
  }

  update(dt) {
    // Smooth rotation
    const diff = this.targetAngle - this.currentAngle;
    this.currentAngle += diff * dt * 5;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Servo body
    const w = 28;
    const h = 20;
    ctx.fillStyle = '#2C3E50';
    ctx.strokeStyle = '#1A252F';
    ctx.lineWidth = 1.5;

    // Rounded rect body
    ctx.beginPath();
    const r = 3;
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

    // Output shaft
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(0, -h / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Horn (rotating arm)
    const rad = ((this.currentAngle - 90) * Math.PI) / 180;
    const armLength = 16;
    ctx.save();
    ctx.rotate(rad);

    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    // Arm
    ctx.fillRect(-2, -armLength, 4, armLength);
    // Horn disc
    ctx.beginPath();
    ctx.arc(0, -armLength + 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Horn hole
    ctx.beginPath();
    ctx.arc(0, -armLength + 3, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#2C3E50';
    ctx.fill();

    ctx.restore();

    // Angle text
    ctx.fillStyle = '#FFF';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(this.currentAngle)}°`, 0, 6);

    // Wires
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1;
    for (const dx of [-4, 0, 4]) {
      ctx.beginPath();
      ctx.moveTo(dx, h / 2);
      ctx.lineTo(dx, h / 2 + 6);
      ctx.stroke();
    }

    ctx.restore();
  }

  get status() {
    return `${Math.round(this.currentAngle)}°`;
  }
}
