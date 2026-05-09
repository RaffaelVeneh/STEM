/**
 * Quest definitions for RESQ-BOX gamified STEM disaster education.
 * Each quest has: id, title, description, icon, XP reward, difficulty,
 * required blocks, hint, and success criteria for validation.
 */
export const QUESTS = [
  {
    id: 1,
    title: 'Gempa!',
    titleEn: 'Earthquake!',
    icon: '🏚️',
    desc: 'Nyalakan alarm gempa menggunakan sensor getar, LED, dan buzzer.',
    descEn: 'Activate earthquake alarm using vibration sensor, LED, and buzzer.',
    xp: 100,
    difficulty: '⭐',
    status: 'available',
    blocks: ['📳 Sensor Getar', '💡 LED', '🔊 Buzzer'],
    hint: 'Hubungkan sensor getar ke LED dan buzzer. Jika getaran terdeteksi, nyalakan alarm!',
    // Validation: must include these block types
    requiredBlocks: ['vibration_sensor', 'led_set', 'buzzer_beep'],
    // And at least one control block
    minControlBlocks: 1,
  },
  {
    id: 2,
    title: 'Jalur Evakuasi',
    titleEn: 'Evacuation Route',
    icon: '💡',
    desc: 'Buat lampu evakuasi otomatis yang menyala saat tombol darurat ditekan.',
    descEn: 'Create automatic evacuation light triggered by emergency button.',
    xp: 150,
    difficulty: '⭐⭐',
    status: 'locked',
    blocks: ['🚨 Tombol Darurat', '💡 LED', '⏱️ Tunggu'],
    hint: 'Gunakan tombol darurat sebagai pemicu. LED harus menyala dengan pola berkedip.',
    requiredBlocks: ['emergency_button', 'led_set', 'led_blink'],
    minControlBlocks: 1,
  },
  {
    id: 3,
    title: 'Banjir Terdeteksi',
    titleEn: 'Flood Detected',
    icon: '🌊',
    desc: 'Program sensor air untuk mendeteksi banjir dan membunyikan peringatan.',
    descEn: 'Program water sensor to detect flood and trigger warning buzzer.',
    xp: 200,
    difficulty: '⭐⭐',
    status: 'locked',
    blocks: ['💧 Sensor Air', '🔊 Buzzer', '🔄 Jika-Maka'],
    hint: 'Jika level air melebihi batas, buzzer harus berbunyi dengan pola SOS.',
    requiredBlocks: ['water_sensor', 'buzzer_beep', 'if_sensor'],
    minControlBlocks: 1,
  },
  {
    id: 4,
    title: 'Sistem Peringatan Dini',
    titleEn: 'Early Warning System',
    icon: '📢',
    desc: 'Gabungkan beberapa sensor untuk membuat sistem peringatan dini multi-bahaya.',
    descEn: 'Combine multiple sensors to create a multi-hazard early warning system.',
    xp: 300,
    difficulty: '⭐⭐⭐',
    status: 'locked',
    blocks: ['💧 Sensor Air', '📳 Sensor Getar', '📟 LCD', '🔊 Buzzer', '🔄 Jika-Maka'],
    hint: 'Setiap jenis bahaya harus menghasilkan pola peringatan yang berbeda di LCD dan buzzer.',
    requiredBlocks: ['water_sensor', 'vibration_sensor', 'lcd_print', 'buzzer_pattern', 'if_sensor'],
    minControlBlocks: 2,
  },
  {
    id: 5,
    title: 'Desa Tangguh',
    titleEn: 'Resilient Village',
    icon: '🏘️',
    desc: 'Bangun sistem smart village lengkap: deteksi, alarm, evakuasi, dan komunikasi.',
    descEn: 'Build complete smart village system: detection, alarm, evacuation, communication.',
    xp: 500,
    difficulty: '⭐⭐⭐⭐⭐',
    status: 'locked',
    blocks: ['Semua blok tersedia'],
    hint: 'Integrasikan semua sensor dan output. Desa harus merespon gempa, banjir, dan longsor.',
    requiredBlocks: ['water_sensor', 'vibration_sensor', 'emergency_button', 'led_set', 'buzzer_pattern', 'lcd_print', 'servo_rotate'],
    minControlBlocks: 3,
  },
];

/** Get a quest by ID */
export function getQuest(id) {
  return QUESTS.find((q) => q.id === id) || null;
}

/** Get available quests */
export function getAvailableQuests(questStatus) {
  return QUESTS.map((q) => ({
    ...q,
    status: questStatus[q.id] || 'locked',
  }));
}
