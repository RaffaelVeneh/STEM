/**
 * ArduinoBoard — Canvas renderer for the Arduino Uno + breadboard + all components.
 */
import { LED } from './components/LED.js';
import { Buzzer } from './components/Buzzer.js';
import { WaterSensor } from './components/WaterSensor.js';
import { VibrationSensor } from './components/VibrationSensor.js';
import { Servo } from './components/Servo.js';
import { LCD } from './components/LCD.js';
import { EmergencyButton } from './components/EmergencyButton.js';

export class ArduinoBoard {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = window.devicePixelRatio || 1;

    // Component instances
    this.components = {
      ledRed: new LED(170, 135, 'red', 9),
      ledYellow: new LED(210, 135, 'yellow', 10),
      ledGreen: new LED(250, 135, 'green', 11),
      buzzer: new Buzzer(330, 135),
      waterSensor: new WaterSensor(170, 250),
      vibrationSensor: new VibrationSensor(260, 250),
      servo: new Servo(350, 250),
      lcd: new LCD(220, 90),
      emergencyButton: new EmergencyButton(130, 250),
    };

    // Component list for easy iteration
    this.compList = Object.values(this.components);

    // Bind update/render
    this._tick = this._tick.bind(this);
    this._running = false;
  }

  // ─── LED helpers ───
  ledOn(color) {
    const map = { red: 'ledRed', yellow: 'ledYellow', green: 'ledGreen' };
    const key = map[color];
    if (key && this.components[key]) this.components[key].on();
  }

  ledOff(color) {
    const map = { red: 'ledRed', yellow: 'ledYellow', green: 'ledGreen' };
    const key = map[color];
    if (key && this.components[key]) this.components[key].off();
  }

  async ledBlink(color, times, delayFn) {
    const map = { red: 'ledRed', yellow: 'ledYellow', green: 'ledGreen' };
    const key = map[color];
    if (key && this.components[key]) {
      await this.components[key].blink(times, delayFn);
    }
  }

  // ─── Buzzer helpers ───
  buzzerBeep(freq, duration) {
    this.components.buzzer.beep(freq, duration);
  }

  buzzerOff() {
    this.components.buzzer.off();
  }

  async buzzerPattern(type, delayFn) {
    await this.components.buzzer.pattern(type, delayFn);
  }

  // ─── Servo ───
  servoRotate(angle) {
    this.components.servo.rotate(angle);
  }

  // ─── LCD ───
  lcdPrint(text) {
    this.components.lcd.print(text);
  }

  lcdClear() {
    this.components.lcd.clear();
  }

  // ─── Sensor reads ───
  waterRead() {
    return this.components.waterSensor.read();
  }

  vibrationRead() {
    return this.components.vibrationSensor.read();
  }

  buttonPressed() {
    return this.components.emergencyButton.isPressed();
  }

  // ─── Sim control ───
  setWaterLevel(v) {
    this.components.waterSensor.setLevel(v);
  }

  setVibrationIntensity(v) {
    this.components.vibrationSensor.setIntensity(v);
  }

  pressButton() {
    this.components.emergencyButton.press();
  }

  releaseButton() {
    this.components.emergencyButton.release();
  }

  reset() {
    this.ledOff('red');
    this.ledOff('yellow');
    this.ledOff('green');
    this.buzzerOff();
    this.lcdClear();
    this.servoRotate(90);
    this.setWaterLevel(45);
    this.setVibrationIntensity(25);
    this.releaseButton();
  }

  // ─── Animation loop ───
  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
  }

  _tick(now) {
    if (!this._running) return;
    const dt = Math.min((now - this._lastTime) / 1000, 0.1); // cap delta
    this._lastTime = now;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this._tick);
  }

  update(dt) {
    for (const comp of this.compList) {
      comp.update(dt);
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background — desk/mat
    ctx.fillStyle = '#FEFAE0';
    ctx.fillRect(0, 0, w, h);

    // Grid dots on mat
    ctx.fillStyle = '#E8E0D0';
    for (let gx = 20; gx < w; gx += 20) {
      for (let gy = 20; gy < h; gy += 20) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this._drawArduinoBoard(ctx);
    this._drawBreadboard(ctx);

    // Draw all components
    for (const comp of this.compList) {
      comp.draw(ctx);
    }

    // Legend
    ctx.fillStyle = '#6C584C';
    ctx.font = '10px Nunito, sans-serif';
    ctx.fillText('RESQ-BOX Virtual Arduino Simulator', 15, h - 10);
  }

  _drawArduinoBoard(ctx) {
    const bx = 30; // board x
    const by = 50; // board y
    const bw = 80; // board width
    const bh = 280; // board height

    // Board body
    ctx.fillStyle = '#00878F';
    ctx.strokeStyle = '#006B70';
    ctx.lineWidth = 3;

    // Rounded rect
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
    ctx.lineTo(bx + r, by + bh);
    ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
    ctx.lineTo(bx, by + r);
    ctx.arcTo(bx, by, bx + r, by, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Board label
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARDUINO', bx + bw / 2, by + 15);
    ctx.fillText('UNO', bx + bw / 2, by + 28);

    // Left pin headers (digital)
    ctx.fillStyle = '#333';
    for (let i = 0; i < 14; i++) {
      const py = by + 45 + i * 16;
      ctx.fillRect(bx + 5, py, 10, 4);
      ctx.fillStyle = i < 6 ? '#FFC107' : '#666'; // PWM pins highlighted
      ctx.fillRect(bx + 5, py, 10, 4);
      ctx.fillStyle = '#333';
    }

    // Right pin headers (analog/power)
    for (let i = 0; i < 8; i++) {
      const py = by + 45 + i * 20;
      ctx.fillRect(bx + bw - 15, py, 10, 4);
    }

    // Atmega chip
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(bx + 15, by + 100, bw - 30, 80);
    ctx.fillStyle = '#FFF';
    ctx.font = '7px monospace';
    ctx.fillText('ATmega328P', bx + bw / 2, by + 145);

    // USB port
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(bx + bw / 2 - 12, by + bh - 20, 24, 12);

    // Power LED
    ctx.beginPath();
    ctx.arc(bx + bw / 2, by + 40, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#2ECC40';
    ctx.fill();
    ctx.shadowColor = '#2ECC40';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawBreadboard(ctx) {
    const bx = 140;
    const by = 165;
    const bw = 260;
    const bh = 140;

    // Breadboard body
    ctx.fillStyle = '#F5DEB3';
    ctx.strokeStyle = '#D4A574';
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // Power rails (top and bottom)
    ctx.fillStyle = '#E63946';
    ctx.fillRect(bx, by, bw, 5);
    ctx.fillStyle = '#457B9D';
    ctx.fillRect(bx, by + bh - 5, bw, 5);

    // Center gap
    ctx.fillStyle = '#E8D5B0';
    ctx.fillRect(bx, by + 55, bw, 30);

    // Tie points (grid of small circles)
    ctx.fillStyle = '#D4A574';
    for (let col = 0; col < 30; col++) {
      for (let row = 0; row < 10; row++) {
        const px = bx + 8 + col * 8.5;
        const py = by + 10 + row * 12;
        // Skip center gap
        if (row >= 4 && row <= 5) continue;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ─── Get sim context for interpreter ───
  getSimContext() {
    return {
      led: {
        on: (color) => this.ledOn(color),
        off: (color) => this.ledOff(color),
        blink: (color, times, delayFn) => this.ledBlink(color, times, delayFn),
      },
      buzzer: {
        beep: (freq, dur) => this.buzzerBeep(freq, dur),
        off: () => this.buzzerOff(),
        pattern: (type, delayFn) => this.buzzerPattern(type, delayFn),
      },
      servo: {
        rotate: (angle) => this.servoRotate(angle),
      },
      lcd: {
        print: (text) => this.lcdPrint(text),
        clear: () => this.lcdClear(),
      },
      sensors: {
        water: () => this.waterRead(),
        vibration: () => this.vibrationRead(),
        buttonPressed: () => this.buttonPressed(),
      },
      delay: (ms) => new Promise((r) => setTimeout(r, ms)),
    };
  }
}
