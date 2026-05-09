/**
 * Arduino C code generator for RESQ-BOX custom Blockly blocks.
 * Converts visual blocks into valid Arduino .ino code.
 */
import * as Blockly from 'blockly';

// Create a custom generator based on the Arduino language
// We use Blockly's generator infrastructure to walk blocks
export const ArduinoGenerator = new Blockly.Generator('Arduino');

// ─── Per-block generators ───

ArduinoGenerator.forBlock['water_sensor'] = function (block, generator) {
  return ['analogRead(A0)', ArduinoGenerator.ORDER_ATOMIC];
};

ArduinoGenerator.forBlock['water_sensor_value'] = function (block, generator) {
  const value = block.getFieldValue('VALUE');
  return [String(value), ArduinoGenerator.ORDER_ATOMIC];
};

ArduinoGenerator.forBlock['vibration_sensor'] = function (block, generator) {
  return ['analogRead(A1)', ArduinoGenerator.ORDER_ATOMIC];
};

ArduinoGenerator.forBlock['vibration_sensor_value'] = function (block, generator) {
  const value = block.getFieldValue('VALUE');
  return [String(value), ArduinoGenerator.ORDER_ATOMIC];
};

ArduinoGenerator.forBlock['emergency_button'] = function (block, generator) {
  const state = block.getFieldValue('STATE');
  return [state === 'PRESSED' ? 'HIGH' : 'LOW', ArduinoGenerator.ORDER_ATOMIC];
};

ArduinoGenerator.forBlock['led_set'] = function (block, generator) {
  const color = block.getFieldValue('COLOR');
  const state = block.getFieldValue('STATE');
  const pinMap = { RED: '9', YELLOW: '10', GREEN: '11' };
  const pin = pinMap[color] || '9';
  const val = state === 'ON' ? 'HIGH' : 'LOW';
  return `digitalWrite(${pin}, ${val});\n`;
};

ArduinoGenerator.forBlock['led_blink'] = function (block, generator) {
  const color = block.getFieldValue('COLOR');
  const times = block.getFieldValue('TIMES');
  const pinMap = { RED: '9', YELLOW: '10', GREEN: '11' };
  const pin = pinMap[color] || '9';
  return (
    `for (int i = 0; i < ${times}; i++) {\n` +
    `  digitalWrite(${pin}, HIGH);\n` +
    `  delay(300);\n` +
    `  digitalWrite(${pin}, LOW);\n` +
    `  delay(300);\n` +
    `}\n`
  );
};

ArduinoGenerator.forBlock['buzzer_beep'] = function (block, generator) {
  const freq = block.getFieldValue('FREQ');
  const duration = block.getFieldValue('DURATION');
  return `tone(8, ${freq}, ${duration});\ndelay(${duration});\n`;
};

ArduinoGenerator.forBlock['buzzer_pattern'] = function (block, generator) {
  const pattern = block.getFieldValue('PATTERN');
  switch (pattern) {
    case 'SOS':
      return (
        `// SOS pattern\n` +
        `for (int i = 0; i < 3; i++) { tone(8, 1000, 200); delay(250); }\n` +
        `delay(200);\n` +
        `for (int i = 0; i < 3; i++) { tone(8, 1000, 600); delay(650); }\n` +
        `delay(200);\n` +
        `for (int i = 0; i < 3; i++) { tone(8, 1000, 200); delay(250); }\n`
      );
    case 'FAST':
      return `for (int i = 0; i < 10; i++) { tone(8, 2000, 100); delay(150); }\n`;
    case 'SLOW':
      return `for (int i = 0; i < 5; i++) { tone(8, 500, 500); delay(1000); }\n`;
    case 'SHORT_3':
      return `for (int i = 0; i < 3; i++) { tone(8, 1500, 100); delay(200); }\n`;
    default:
      return `tone(8, 1000, 500);\n`;
  }
};

ArduinoGenerator.forBlock['servo_rotate'] = function (block, generator) {
  const angle = block.getFieldValue('ANGLE');
  return `myservo.write(${angle});\ndelay(500);\n`;
};

ArduinoGenerator.forBlock['lcd_print'] = function (block, generator) {
  const text = block.getFieldValue('TEXT');
  return `lcd.clear();\nlcd.setCursor(0, 0);\nlcd.print("${text}");\n`;
};

ArduinoGenerator.forBlock['lcd_clear'] = function (block, generator) {
  return `lcd.clear();\n`;
};

ArduinoGenerator.forBlock['if_sensor'] = function (block, generator) {
  const sensor = generator.valueToCode(block, 'SENSOR', ArduinoGenerator.ORDER_ATOMIC) || '0';
  const op = block.getFieldValue('OP');
  const threshold = generator.valueToCode(block, 'THRESHOLD', ArduinoGenerator.ORDER_ATOMIC) || '0';
  const doBranch = generator.statementToCode(block, 'DO');

  const opMap = { GT: '>', LT: '<', GTE: '>=', LTE: '<=', EQ: '==' };
  const opStr = opMap[op] || '>';

  return `if (${sensor} ${opStr} ${threshold}) {\n${ArduinoGenerator.prefixLines(doBranch, '  ')}\n}\n`;
};

ArduinoGenerator.forBlock['if_emergency'] = function (block, generator) {
  const state = block.getFieldValue('STATE');
  const val = state === 'PRESSED' ? 'HIGH' : 'LOW';
  const doBranch = generator.statementToCode(block, 'DO');
  return `if (digitalRead(2) == ${val}) {\n${ArduinoGenerator.prefixLines(doBranch, '  ')}\n}\n`;
};

ArduinoGenerator.forBlock['wait'] = function (block, generator) {
  const duration = block.getFieldValue('DURATION');
  return `delay(${duration});\n`;
};

ArduinoGenerator.forBlock['repeat_times'] = function (block, generator) {
  const times = block.getFieldValue('TIMES');
  const doBranch = generator.statementToCode(block, 'DO');
  return `for (int i = 0; i < ${times}; i++) {\n${ArduinoGenerator.prefixLines(doBranch, '  ')}\n}\n`;
};

ArduinoGenerator.forBlock['repeat_forever'] = function (block, generator) {
  const doBranch = generator.statementToCode(block, 'DO');
  return `while (1) {\n${ArduinoGenerator.prefixLines(doBranch, '  ')}\n}\n`;
};

ArduinoGenerator.forBlock['disaster_alarm'] = function (block, generator) {
  const color = block.getFieldValue('LED_COLOR');
  const pattern = block.getFieldValue('PATTERN');
  const pinMap = { RED: '9', YELLOW: '10' };
  const pin = pinMap[color] || '9';
  return (
    `// DISASTER ALARM\n` +
    `digitalWrite(${pin}, HIGH);\n` +
    `tone(8, 1000, 500);\n` +
    `delay(500);\n` +
    `digitalWrite(${pin}, LOW);\n` +
    `noTone(8);\n`
  );
};

ArduinoGenerator.forBlock['evacuation_route'] = function (block, generator) {
  const color = block.getFieldValue('LED_COLOR');
  const pinMap = { GREEN: '11', YELLOW: '10' };
  const pin = pinMap[color] || '11';
  return (
    `// EVACUATION ROUTE SIGNAL\n` +
    `for (int i = 0; i < 5; i++) {\n` +
    `  digitalWrite(${pin}, HIGH);\n` +
    `  delay(200);\n` +
    `  digitalWrite(${pin}, LOW);\n` +
    `  delay(200);\n` +
    `}\n`
  );
};

ArduinoGenerator.forBlock['warning_lcd'] = function (block, generator) {
  const text = block.getFieldValue('TEXT');
  return (
    `// WARNING DISPLAY\n` +
    `lcd.clear();\n` +
    `lcd.setCursor(0, 0);\n` +
    `lcd.print("${text}");\n` +
    `tone(8, 2000, 200);\n` +
    `delay(250);\n` +
    `noTone(8);\n`
  );
};

ArduinoGenerator.forBlock['setup_loop'] = function (block, generator) {
  const setupCode = generator.statementToCode(block, 'SETUP');
  const loopCode = generator.statementToCode(block, 'LOOP');

  const includes =
    `#include <LiquidCrystal.h>\n` +
    `#include <Servo.h>\n\n` +
    `LiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n` +
    `Servo myservo;\n\n`;

  const setup =
    `void setup() {\n` +
    `  pinMode(9, OUTPUT);   // LED Merah\n` +
    `  pinMode(10, OUTPUT);  // LED Kuning\n` +
    `  pinMode(11, OUTPUT);  // LED Hijau\n` +
    `  pinMode(8, OUTPUT);   // Buzzer\n` +
    `  pinMode(2, INPUT_PULLUP);  // Tombol Darurat\n` +
    `  lcd.begin(16, 2);\n` +
    `  myservo.attach(6);\n` +
    `  Serial.begin(9600);\n` +
    `${ArduinoGenerator.prefixLines(setupCode, '  ')}` +
    `}\n\n`;

  const loop =
    `void loop() {\n` +
    `${ArduinoGenerator.prefixLines(loopCode, '  ')}` +
    `}\n`;

  return includes + setup + loop;
};

// ─── Helper: generate complete .ino from workspace ───

export function generateArduinoCode(workspace) {
  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) return '// Seret blok ke workspace untuk menghasilkan kode Arduino\n';

  let code = '// ==================================\n';
  code += '//  RESQ-BOX — Arduino Code Generator\n';
  code += '// ==================================\n\n';

  for (const block of topBlocks) {
    code += ArduinoGenerator.blockToCode(block);
  }

  return code || '// Tidak ada kode yang dihasilkan.\n';
}
