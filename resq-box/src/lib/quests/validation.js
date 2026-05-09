/**
 * Quest validation engine — checks if a Blockly workspace
 * meets the success criteria for a given quest.
 */

/**
 * Validate a workspace against a quest's requirements.
 * @param {Blockly.Workspace} workspace
 * @param {object} quest — from definitions.js
 * @returns {{ passed: boolean, feedback: string, missing: string[] }}
 */
export function validateQuest(workspace, quest) {
  if (!workspace || !quest) {
    return { passed: false, feedback: 'No workspace or quest data.', missing: [] };
  }

  const allBlocks = workspace.getAllBlocks(false);
  const blockTypes = allBlocks.map((b) => b.type);

  // Check required blocks
  const missing = [];
  for (const required of quest.requiredBlocks) {
    if (!blockTypes.includes(required)) {
      missing.push(required);
    }
  }

  // Check minimum control blocks
  const controlTypes = ['if_sensor', 'if_emergency', 'wait', 'repeat_times', 'repeat_forever'];
  const controlCount = blockTypes.filter((t) => controlTypes.includes(t)).length;

  if (controlCount < (quest.minControlBlocks || 0)) {
    if (quest.minControlBlocks > 0) {
      missing.push(`Need at least ${quest.minControlBlocks} control block(s)`);
    }
  }

  // Check minimum total blocks (at least the setup + some logic)
  if (allBlocks.length < 3) {
    missing.push('Need more blocks to complete the mission');
  }

  if (missing.length > 0) {
    const blockNames = {
      vibration_sensor: '📳 Sensor Getar',
      water_sensor: '💧 Sensor Air',
      emergency_button: '🚨 Tombol Darurat',
      led_set: '💡 LED',
      led_blink: '💡 LED Berkedip',
      buzzer_beep: '🔊 Buzzer Bunyi',
      buzzer_pattern: '🔊 Buzzer Pola',
      servo_rotate: '⚙️ Servo',
      lcd_print: '📟 LCD Tulis',
      lcd_clear: '📟 LCD Bersihkan',
      if_sensor: '🔄 Jika-Maka',
      if_emergency: '🔄 Jika Darurat',
      wait: '⏱️ Tunggu',
      repeat_times: '🔁 Ulangi',
      repeat_forever: '🔁 Ulangi Terus',
      setup_loop: '▶️ Setup',
    };

    const missingNames = missing
      .map((m) => blockNames[m] || m)
      .filter(Boolean);

    return {
      passed: false,
      feedback: `Belum lengkap! Blok yang kurang: ${missingNames.join(', ')}`,
      missing: missing,
    };
  }

  return {
    passed: true,
    feedback: 'Misi selesai! Keren banget! 🎉',
    missing: [],
  };
}
