/**
 * Emergency Button — big red push button with press animation.
 */
export class EmergencyButton {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.pressed = false;
    this.pressDepth = 0;
    this.targetDepth = 0;
  }

  press() {
    this.pressed = true;
    this.targetDepth = 4;
  }

  release() {
    this.pressed = false;
    this.targetDepth = 0;
  }

  update(dt) {
    this.pressDepth += (this.targetDepth - this.pressDepth) * dt * 10;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const radius = 16;

    // Button housing (outer ring)
    ctx.beginPath();
    ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = '#8B0000';
    ctx.fill();
    ctx.strokeStyle = '#5C0000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Button cap (moves down when pressed)
    const capY = this.pressDepth;
    const capGrad = ctx.createRadialGradient(-3, capY - 3, 2, 0, capY, radius);
    capGrad.addColorStop(0, '#FF4444');
    capGrad.addColorStop(0.7, '#CC0000');
    capGrad.addColorStop(1, '#8B0000');

    ctx.beginPath();
    ctx.arc(0, capY, radius, 0, Math.PI * 2);
    ctx.fillStyle = capGrad;
    ctx.fill();
    ctx.strokeStyle = '#5C0000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight
    ctx.beginPath();
    ctx.arc(-4, capY - 4, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();

    // Emergency icon on button
    if (!this.pressed) {
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, capY + 1);
    }

    // Wires
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, radius + 3);
    ctx.lineTo(-4, radius + 9);
    ctx.moveTo(4, radius + 3);
    ctx.lineTo(4, radius + 9);
    ctx.stroke();

    // Status indicator below
    if (this.pressed) {
      ctx.fillStyle = '#E63946';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DITEKAN', 0, radius + 16);
    }

    ctx.restore();
  }

  get status() {
    return this.pressed ? 'DITEKAN' : 'OFF';
  }

  isPressed() {
    return this.pressed;
  }
}
