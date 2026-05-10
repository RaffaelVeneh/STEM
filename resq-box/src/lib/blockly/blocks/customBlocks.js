/**
 * Custom Blockly blocks for RESQ-BOX Arduino disaster education kit.
 * These define the visual blocks kids drag and drop.
 */
import * as Blockly from 'blockly';

// ─── Color palette for block categories ───
const COLORS = {
  sensor: 210,   // Blue-ish (water, vibration, button)
  output: 120,   // Green (LED, buzzer, servo, LCD)
  control: 330,  // Orange/pink (if, wait, repeat)
  disaster: 0,   // Red (alarm, evacuation, warning)
};

export function defineCustomBlocks() {
  // ============================================================
  // SENSOR BLOCKS
  // ============================================================

  Blockly.Blocks['water_sensor'] = {
    init: function () {
      this.jsonInit({
        message0: '💧 baca sensor air',
        args0: [],
        output: 'Number',
        colour: COLORS.sensor,
        tooltip: 'Membaca level air (0–100)',
        helpUrl: '',
      });
    },
  };

  Blockly.Blocks['water_sensor_value'] = {
    init: function () {
      this.jsonInit({
        message0: '💧 level air %1',
        args0: [{ type: 'field_number', name: 'VALUE', value: 50, min: 0, max: 100 }],
        output: 'Number',
        colour: COLORS.sensor,
        tooltip: 'Nilai level air tertentu',
      });
    },
  };

  Blockly.Blocks['vibration_sensor'] = {
    init: function () {
      this.jsonInit({
        message0: '📳 baca sensor getar',
        args0: [],
        output: 'Number',
        colour: COLORS.sensor,
        tooltip: 'Membaca intensitas getaran (0–100)',
      });
    },
  };

  Blockly.Blocks['vibration_sensor_value'] = {
    init: function () {
      this.jsonInit({
        message0: '📳 getaran %1',
        args0: [{ type: 'field_number', name: 'VALUE', value: 30, min: 0, max: 100 }],
        output: 'Number',
        colour: COLORS.sensor,
        tooltip: 'Nilai getaran tertentu untuk simulasi',
      });
    },
  };

  Blockly.Blocks['emergency_button'] = {
    init: function () {
      this.jsonInit({
        message0: '🚨 tombol darurat %1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'STATE',
            options: [
              ['ditekan', 'PRESSED'],
              ['tidak ditekan', 'NOT_PRESSED'],
            ],
          },
        ],
        output: 'Boolean',
        colour: COLORS.sensor,
        tooltip: 'Status tombol darurat',
      });
    },
  };

  // ─── NEW: Temperature sensor ───
  Blockly.Blocks['temperature_sensor'] = {
    init: function () {
      this.jsonInit({
        message0: '🌡️ baca suhu',
        args0: [],
        output: 'Number',
        colour: COLORS.sensor,
        tooltip: 'Membaca suhu lingkungan (°C)',
      });
    },
  };

  Blockly.Blocks['temperature_sensor_value'] = {
    init: function () {
      this.jsonInit({
        message0: '🌡️ suhu %1 °C',
        args0: [{ type: 'field_number', name: 'VALUE', value: 30, min: -10, max: 60 }],
        output: 'Number',
        colour: COLORS.sensor,
        tooltip: 'Nilai suhu tertentu untuk simulasi',
      });
    },
  };

  // ============================================================
  // OUTPUT BLOCKS
  // ============================================================

  Blockly.Blocks['led_set'] = {
    init: function () {
      this.jsonInit({
        message0: '💡 LED %1 %2',
        args0: [
          {
            type: 'field_dropdown',
            name: 'COLOR',
            options: [
              ['merah', 'RED'],
              ['kuning', 'YELLOW'],
              ['hijau', 'GREEN'],
            ],
          },
          {
            type: 'field_dropdown',
            name: 'STATE',
            options: [
              ['nyala', 'ON'],
              ['mati', 'OFF'],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.output,
        tooltip: 'Nyalakan atau matikan LED',
      });
    },
  };

  Blockly.Blocks['led_blink'] = {
    init: function () {
      this.jsonInit({
        message0: '💡 LED %1 berkedip %2 kali',
        args0: [
          {
            type: 'field_dropdown',
            name: 'COLOR',
            options: [
              ['merah', 'RED'],
              ['kuning', 'YELLOW'],
              ['hijau', 'GREEN'],
            ],
          },
          { type: 'field_number', name: 'TIMES', value: 3, min: 1, max: 20 },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.output,
        tooltip: 'LED berkedip beberapa kali',
      });
    },
  };

  Blockly.Blocks['buzzer_beep'] = {
    init: function () {
      this.jsonInit({
        message0: '🔊 buzzer bunyi %1 Hz selama %2 ms',
        args0: [
          { type: 'field_number', name: 'FREQ', value: 1000, min: 100, max: 10000 },
          { type: 'field_number', name: 'DURATION', value: 500, min: 50, max: 10000 },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.output,
        tooltip: 'Bunyikan buzzer dengan frekuensi dan durasi tertentu',
      });
    },
  };

  Blockly.Blocks['buzzer_pattern'] = {
    init: function () {
      this.jsonInit({
        message0: '🔊 buzzer pola %1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PATTERN',
            options: [
              ['SOS (...---...)', 'SOS'],
              ['alarm cepat', 'FAST'],
              ['alarm lambat', 'SLOW'],
              ['bip pendek 3x', 'SHORT_3'],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.output,
        tooltip: 'Mainkan pola suara buzzer',
      });
    },
  };

  Blockly.Blocks['servo_rotate'] = {
    init: function () {
      this.jsonInit({
        message0: '⚙️ servo putar ke %1 derajat',
        args0: [{ type: 'field_angle', name: 'ANGLE', value: 90 }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.output,
        tooltip: 'Putar motor servo ke sudut tertentu (0–180°)',
      });
    },
  };

  Blockly.Blocks['lcd_print'] = {
    init: function () {
      this.jsonInit({
        message0: '📟 LCD tulis %1',
        args0: [{ type: 'field_input', name: 'TEXT', text: 'Siaga!' }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.output,
        tooltip: 'Tampilkan teks di layar LCD',
      });
    },
  };

  Blockly.Blocks['lcd_clear'] = {
    init: function () {
      this.jsonInit({
        message0: '📟 LCD bersihkan',
        args0: [],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.output,
        tooltip: 'Bersihkan layar LCD',
      });
    },
  };

  // ============================================================
  // CONTROL BLOCKS
  // ============================================================

  Blockly.Blocks['if_sensor'] = {
    init: function () {
      this.jsonInit({
        message0: '🔄 jika %1 %2 %3',
        args0: [
          { type: 'input_value', name: 'SENSOR' },
          {
            type: 'field_dropdown',
            name: 'OP',
            options: [
              ['>', 'GT'],
              ['<', 'LT'],
              ['≥', 'GTE'],
              ['≤', 'LTE'],
              ['=', 'EQ'],
            ],
          },
          { type: 'input_value', name: 'THRESHOLD' },
        ],
        message1: 'lakukan %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.control,
        tooltip: 'Jika kondisi terpenuhi, lakukan aksi',
      });
    },
  };

  Blockly.Blocks['if_emergency'] = {
    init: function () {
      this.jsonInit({
        message0: '🔄 jika %1 %2',
        args0: [
          { type: 'input_value', name: 'CONDITION' },
          {
            type: 'field_dropdown',
            name: 'STATE',
            options: [
              ['ditekan', 'PRESSED'],
              ['tidak ditekan', 'NOT_PRESSED'],
            ],
          },
        ],
        message1: 'lakukan %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.control,
        tooltip: 'Jika kondisi darurat terpenuhi, lakukan aksi',
      });
    },
  };

  Blockly.Blocks['wait'] = {
    init: function () {
      this.jsonInit({
        message0: '⏱️ tunggu %1 ms',
        args0: [{ type: 'field_number', name: 'DURATION', value: 1000, min: 100, max: 30000 }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.control,
        tooltip: 'Tunggu selama waktu tertentu (milidetik)',
      });
    },
  };

  Blockly.Blocks['repeat_times'] = {
    init: function () {
      this.jsonInit({
        message0: '🔁 ulangi %1 kali',
        args0: [{ type: 'field_number', name: 'TIMES', value: 3, min: 1, max: 50 }],
        message1: 'lakukan %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.control,
        tooltip: 'Ulangi aksi beberapa kali',
      });
    },
  };

  Blockly.Blocks['repeat_forever'] = {
    init: function () {
      this.jsonInit({
        message0: '🔁 ulangi terus',
        message1: 'lakukan %1',
        args1: [{ type: 'input_statement', name: 'DO' }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.control,
        tooltip: 'Ulangi aksi terus menerus',
      });
    },
  };

  // ─── NEW: Logic & Math blocks ───
  Blockly.Blocks['logic_and'] = {
    init: function () {
      this.jsonInit({
        message0: '%1 DAN %2',
        args0: [
          { type: 'input_value', name: 'A' },
          { type: 'input_value', name: 'B' },
        ],
        output: 'Boolean',
        colour: COLORS.control,
        tooltip: 'TRUE jika kedua kondisi TRUE',
      });
    },
  };

  Blockly.Blocks['logic_or'] = {
    init: function () {
      this.jsonInit({
        message0: '%1 ATAU %2',
        args0: [
          { type: 'input_value', name: 'A' },
          { type: 'input_value', name: 'B' },
        ],
        output: 'Boolean',
        colour: COLORS.control,
        tooltip: 'TRUE jika salah satu kondisi TRUE',
      });
    },
  };

  Blockly.Blocks['math_compare'] = {
    init: function () {
      this.jsonInit({
        message0: 'bandingkan %1 %2 %3',
        args0: [
          { type: 'input_value', name: 'A' },
          {
            type: 'field_dropdown',
            name: 'OP',
            options: [['>', 'GT'], ['<', 'LT'], ['=', 'EQ'], ['≥', 'GTE'], ['≤', 'LTE']],
          },
          { type: 'input_value', name: 'B' },
        ],
        output: 'Boolean',
        colour: COLORS.control,
        tooltip: 'Bandingkan dua nilai angka',
      });
    },
  };

  // ============================================================
  // DISASTER COMPOSITE BLOCKS
  // ============================================================

  Blockly.Blocks['disaster_alarm'] = {
    init: function () {
      this.jsonInit({
        message0: '🚨 ALARM BENCANA',
        message1: 'LED %1 + buzzer %2',
        args1: [
          {
            type: 'field_dropdown',
            name: 'LED_COLOR',
            options: [
              ['merah', 'RED'],
              ['kuning', 'YELLOW'],
            ],
          },
          {
            type: 'field_dropdown',
            name: 'PATTERN',
            options: [
              ['SOS', 'SOS'],
              ['cepat', 'FAST'],
              ['lambat', 'SLOW'],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.disaster,
        tooltip: 'Aktifkan alarm bencana: LED + buzzer menyala bersamaan',
      });
    },
  };

  Blockly.Blocks['evacuation_route'] = {
    init: function () {
      this.jsonInit({
        message0: '🏃 JALUR EVAKUASI',
        message1: 'arah %1, LED %2',
        args1: [
          {
            type: 'field_dropdown',
            name: 'DIRECTION',
            options: [
              ['➡️ kanan', 'RIGHT'],
              ['⬅️ kiri', 'LEFT'],
              ['⬆️ depan', 'FORWARD'],
            ],
          },
          {
            type: 'field_dropdown',
            name: 'LED_COLOR',
            options: [
              ['hijau', 'GREEN'],
              ['kuning', 'YELLOW'],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.disaster,
        tooltip: 'Tampilkan arah jalur evakuasi dengan LED',
      });
    },
  };

  Blockly.Blocks['warning_lcd'] = {
    init: function () {
      this.jsonInit({
        message0: '⚠️ PERINGATAN',
        message1: 'LCD tulis %1',
        args1: [{ type: 'field_input', name: 'TEXT', text: 'BAHAYA! SEGERA EVAKUASI!' }],
        previousStatement: null,
        nextStatement: null,
        colour: COLORS.disaster,
        tooltip: 'Tampilkan peringatan bencana di LCD',
      });
    },
  };

  // ============================================================
  // SETUP / START BLOCK
  // ============================================================

  Blockly.Blocks['setup_loop'] = {
    init: function () {
      this.jsonInit({
        message0: '▶️ saat program mulai',
        message1: 'jalankan %1',
        args1: [{ type: 'input_statement', name: 'SETUP' }],
        message2: 'ulangi terus %1',
        args2: [{ type: 'input_statement', name: 'LOOP' }],
        colour: 290,
        tooltip: 'Blok utama: setup dijalankan sekali, loop diulang terus',
      });
    },
  };
}

export { COLORS };
