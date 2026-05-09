/**
 * Blockly toolbox configuration for RESQ-BOX.
 * Defines the block palette categories and their contents.
 */

const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '⚡ Setup',
      colour: 290,
      contents: [
        {
          kind: 'block',
          type: 'setup_loop',
        },
      ],
    },
    {
      kind: 'category',
      name: '💧 Sensor',
      colour: 210,
      contents: [
        {
          kind: 'block',
          type: 'water_sensor',
        },
        {
          kind: 'block',
          type: 'water_sensor_value',
        },
        {
          kind: 'block',
          type: 'vibration_sensor',
        },
        {
          kind: 'block',
          type: 'vibration_sensor_value',
        },
        {
          kind: 'block',
          type: 'emergency_button',
        },
      ],
    },
    {
      kind: 'category',
      name: '🔌 Output',
      colour: 120,
      contents: [
        {
          kind: 'block',
          type: 'led_set',
        },
        {
          kind: 'block',
          type: 'led_blink',
        },
        {
          kind: 'block',
          type: 'buzzer_beep',
        },
        {
          kind: 'block',
          type: 'buzzer_pattern',
        },
        {
          kind: 'block',
          type: 'servo_rotate',
        },
        {
          kind: 'block',
          type: 'lcd_print',
        },
        {
          kind: 'block',
          type: 'lcd_clear',
        },
      ],
    },
    {
      kind: 'category',
      name: '🔄 Kontrol',
      colour: 330,
      contents: [
        {
          kind: 'block',
          type: 'if_sensor',
        },
        {
          kind: 'block',
          type: 'if_emergency',
        },
        {
          kind: 'block',
          type: 'wait',
        },
        {
          kind: 'block',
          type: 'repeat_times',
        },
        {
          kind: 'block',
          type: 'repeat_forever',
        },
      ],
    },
    {
      kind: 'category',
      name: '🚨 Bencana',
      colour: 0,
      contents: [
        {
          kind: 'block',
          type: 'disaster_alarm',
        },
        {
          kind: 'block',
          type: 'evacuation_route',
        },
        {
          kind: 'block',
          type: 'warning_lcd',
        },
      ],
    },
  ],
};

export default toolbox;
