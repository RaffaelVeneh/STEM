/**
 * JavaScript interpreter for RESQ-BOX simulator.
 * Walks the Blockly workspace and executes blocks step-by-step
 * against the simulator engine (LEDs, buzzer, servo, LCD, sensors).
 *
 * This is NOT a full JS code generator — it directly interprets
 * blocks for real-time simulation with visual feedback.
 */

/**
 * Execute a workspace against a simulator context.
 * @param {Blockly.Workspace} workspace
 * @param {object} sim - Simulator context with component methods
 * @param {object} sim.led - { on(color), off(color), blink(color, times) }
 * @param {object} sim.buzzer - { beep(freq, duration), pattern(type) }
 * @param {object} sim.servo - { rotate(angle) }
 * @param {object} sim.lcd - { print(text), clear() }
 * @param {object} sim.sensors - { water(), vibration(), buttonPressed() }
 * @param {function} sim.delay - async delay(ms) → Promise
 */
export async function interpretWorkspace(workspace, sim) {
  const topBlocks = workspace.getTopBlocks(true);

  for (const block of topBlocks) {
    if (block.type === 'setup_loop') {
      // Run setup once
      const setupBlock = block.getInputTargetBlock('SETUP');
      if (setupBlock) {
        let current = setupBlock;
        while (current) {
          await executeBlock(current, sim);
          current = current.getNextBlock();
        }
      }

      // Run loop — execute once per "Run" click (not infinite)
      const loopBlock = block.getInputTargetBlock('LOOP');
      if (loopBlock) {
        let current = loopBlock;
        while (current) {
          await executeBlock(current, sim);
          current = current.getNextBlock();
        }
      }
    } else {
      // Standalone blocks — execute in order
      await executeBlock(block, sim);
    }
  }
}

/**
 * Execute a single block against the simulator.
 */
async function executeBlock(block, sim) {
  switch (block.type) {
    // ─── Output ───
    case 'led_set': {
      const color = block.getFieldValue('COLOR').toLowerCase();
      const state = block.getFieldValue('STATE');
      if (state === 'ON') sim.led.on(color);
      else sim.led.off(color);
      break;
    }
    case 'led_blink': {
      const color = block.getFieldValue('COLOR').toLowerCase();
      const times = parseInt(block.getFieldValue('TIMES'), 10);
      await sim.led.blink(color, times, sim.delay);
      break;
    }
    case 'buzzer_beep': {
      const freq = parseInt(block.getFieldValue('FREQ'), 10);
      const duration = parseInt(block.getFieldValue('DURATION'), 10);
      sim.buzzer.beep(freq, duration);
      await sim.delay(duration);
      sim.buzzer.off();
      break;
    }
    case 'buzzer_pattern': {
      const pattern = block.getFieldValue('PATTERN');
      await sim.buzzer.pattern(pattern, sim.delay);
      break;
    }
    case 'servo_rotate': {
      const angle = parseInt(block.getFieldValue('ANGLE'), 10);
      sim.servo.rotate(angle);
      await sim.delay(500);
      break;
    }
    case 'lcd_print': {
      const text = block.getFieldValue('TEXT');
      sim.lcd.print(text);
      await sim.delay(200);
      break;
    }
    case 'lcd_clear': {
      sim.lcd.clear();
      break;
    }

    // ─── Control ───
    case 'wait': {
      const duration = parseInt(block.getFieldValue('DURATION'), 10);
      await sim.delay(duration);
      break;
    }
    case 'repeat_times': {
      const times = parseInt(block.getFieldValue('TIMES'), 10);
      const doBlock = block.getInputTargetBlock('DO');
      for (let i = 0; i < times; i++) {
        let current = doBlock;
        while (current) {
          await executeBlock(current, sim);
          current = current.getNextBlock();
        }
      }
      break;
    }
    case 'repeat_forever': {
      const doBlock = block.getInputTargetBlock('DO');
      // Safety: cap at 10 iterations for simulator
      for (let i = 0; i < 10; i++) {
        let current = doBlock;
        while (current) {
          await executeBlock(current, sim);
          current = current.getNextBlock();
        }
      }
      break;
    }
    case 'if_sensor': {
      const op = block.getFieldValue('OP');
      const threshold = getBlockNumber(block.getInputTargetBlock('THRESHOLD'));
      const sensorVal = getSensorValue(block.getInputTargetBlock('SENSOR'), sim);
      if (compareValues(sensorVal, op, threshold)) {
        const doBlock = block.getInputTargetBlock('DO');
        let current = doBlock;
        while (current) {
          await executeBlock(current, sim);
          current = current.getNextBlock();
        }
      }
      break;
    }
    case 'if_emergency': {
      const expectedState = block.getFieldValue('STATE');
      const pressed = sim.sensors.buttonPressed();
      if (
        (expectedState === 'PRESSED' && pressed) ||
        (expectedState === 'NOT_PRESSED' && !pressed)
      ) {
        const doBlock = block.getInputTargetBlock('DO');
        let current = doBlock;
        while (current) {
          await executeBlock(current, sim);
          current = current.getNextBlock();
        }
      }
      break;
    }

    // ─── Disaster ───
    case 'disaster_alarm': {
      const color = block.getFieldValue('LED_COLOR').toLowerCase();
      const pattern = block.getFieldValue('PATTERN');
      sim.led.on(color);
      await sim.buzzer.pattern(pattern, sim.delay);
      sim.led.off(color);
      break;
    }
    case 'evacuation_route': {
      const color = block.getFieldValue('LED_COLOR').toLowerCase();
      await sim.led.blink(color, 5, sim.delay);
      break;
    }
    case 'warning_lcd': {
      const text = block.getFieldValue('TEXT');
      sim.lcd.print(text);
      sim.buzzer.beep(2000, 200);
      await sim.delay(250);
      sim.buzzer.off();
      break;
    }

    default:
      // Skip unknown blocks or those already handled by parent
      break;
  }
}

// ─── Helpers ───

function getBlockNumber(block) {
  if (!block) return 0;
  if (block.type === 'water_sensor_value') return parseInt(block.getFieldValue('VALUE'), 10);
  if (block.type === 'vibration_sensor_value') return parseInt(block.getFieldValue('VALUE'), 10);
  if (block.type === 'water_sensor') return 50; // default simulation value
  if (block.type === 'vibration_sensor') return 30;
  return 0;
}

function getSensorValue(block, sim) {
  if (!block) return 0;
  if (block.type === 'water_sensor') return sim.sensors.water();
  if (block.type === 'vibration_sensor') return sim.sensors.vibration();
  if (block.type === 'water_sensor_value') return parseInt(block.getFieldValue('VALUE'), 10);
  if (block.type === 'vibration_sensor_value') return parseInt(block.getFieldValue('VALUE'), 10);
  return 0;
}

function compareValues(a, op, b) {
  switch (op) {
    case 'GT': return a > b;
    case 'LT': return a < b;
    case 'GTE': return a >= b;
    case 'LTE': return a <= b;
    case 'EQ': return a === b;
    default: return false;
  }
}
