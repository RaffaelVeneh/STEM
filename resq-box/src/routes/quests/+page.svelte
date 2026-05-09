<script>
  import { fly } from 'svelte/transition';

  const quests = [
    {
      id: 1,
      title: 'Gempa!',
      titleEn: 'Earthquake!',
      icon: '🏚️',
      desc: 'Nyalakan alarm gempa menggunakan sensor getar, LED, dan buzzer.',
      descEn: 'Activate earthquake alarm using vibration sensor, LED, and buzzer.',
      xp: 100,
      difficulty: '⭐',
      status: 'available', // 'locked' | 'available' | 'completed'
      blocks: ['📳 Sensor Getar', '💡 LED', '🔊 Buzzer'],
      hint: 'Hubungkan sensor getar ke LED dan buzzer. Jika getaran terdeteksi, nyalakan alarm!'
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
      hint: 'Gunakan tombol darurat sebagai pemicu. LED harus menyala dengan pola berkedip.'
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
      hint: 'Jika level air melebihi batas, buzzer harus berbunyi dengan pola SOS.'
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
      hint: 'Setiap jenis bahaya harus menghasilkan pola peringatan yang berbeda di LCD dan buzzer.'
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
      hint: 'Integrasikan semua sensor dan output. Desa harus merespon gempa, banjir, dan longsor.'
    },
  ];

  let selectedQuest = null;
  let currentLang = 'id';

  function selectQuest(quest) {
    if (quest.status !== 'locked') {
      selectedQuest = quest;
    }
  }

  function startQuest(quest) {
    // Will navigate to workshop with quest context (Phase 4)
    console.log('Starting quest:', quest.id);
  }
</script>

<svelte:head>
  <title>RESQ-BOX — Misi</title>
</svelte:head>

<div class="h-full flex flex-col space-y-6" in:fly={{ y: 20, duration: 400 }}>
  <!-- Header -->
  <div>
    <h2 class="font-display font-bold text-2xl text-ocean-deep">🎯 Papan Misi</h2>
    <p class="text-earth-brown/60 mt-1">Selesaikan misi untuk menjadi Pahlawan Tangguh Bencana!</p>
  </div>

  <div class="flex-1 flex gap-6 min-h-0">
    <!-- Quest Grid -->
    <div class="flex-1 grid grid-cols-2 gap-4 auto-rows-min content-start overflow-y-auto pr-2">
      {#each quests as quest}
        <div
          class="quest-card p-5 {quest.status}"
          onclick={() => selectQuest(quest)}
          onkeydown={(e) => e.key === 'Enter' && selectQuest(quest)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-start gap-4">
            <div class="text-4xl shrink-0">{quest.icon}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge-xp text-xs">{quest.xp} XP</span>
                <span class="text-xs text-earth-brown/50">{quest.difficulty}</span>
                {#if quest.status === 'completed'}
                  <span class="text-safety-green text-sm">✅</span>
                {:else if quest.status === 'locked'}
                  <span class="text-earth-brown/30 text-sm">🔒</span>
                {/if}
              </div>
              <h3 class="font-display font-bold text-lg text-ocean-deep">
                Level {quest.id}: {currentLang === 'id' ? quest.title : quest.titleEn}
              </h3>
              <p class="text-sm text-earth-brown/60 mt-1 line-clamp-2">
                {currentLang === 'id' ? quest.desc : quest.descEn}
              </p>
              <!-- Blocks needed -->
              <div class="flex flex-wrap gap-1 mt-3">
                {#each quest.blocks as block}
                  <span class="text-xs px-2 py-0.5 rounded-full bg-ocean-foam/40 text-earth-brown/70">{block}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Quest Detail Panel -->
    <div class="w-80 shrink-0">
      {#if selectedQuest}
        <div class="card p-6 sticky top-0" in:fly={{ x: 20, duration: 300 }}>
          <div class="text-5xl text-center mb-4">{selectedQuest.icon}</div>
          <h3 class="font-display font-bold text-xl text-ocean-deep text-center">
            Level {selectedQuest.id}: {currentLang === 'id' ? selectedQuest.title : selectedQuest.titleEn}
          </h3>
          <div class="flex justify-center gap-2 my-3">
            <span class="badge-xp">{selectedQuest.xp} XP</span>
            <span class="text-sm text-earth-brown/50">{selectedQuest.difficulty}</span>
          </div>
          <p class="text-sm text-earth-brown/70 mb-4">
            {currentLang === 'id' ? selectedQuest.desc : selectedQuest.descEn}
          </p>

          <!-- Hint -->
          <div class="bg-safety-yellow/10 border border-safety-yellow/30 rounded-xl p-3 mb-4">
            <div class="flex items-center gap-2 mb-1">
              <span>💡</span>
              <span class="font-display font-semibold text-xs text-safety-orange uppercase">Hint dari Siaga</span>
            </div>
            <p class="text-xs text-earth-brown/70">{selectedQuest.hint}</p>
          </div>

          <!-- Blocks needed -->
          <div class="mb-4">
            <h4 class="font-display font-semibold text-xs text-earth-brown/60 uppercase mb-2">Blok Tersedia</h4>
            <div class="flex flex-wrap gap-1">
              {#each selectedQuest.blocks as block}
                <span class="text-xs px-2 py-1 rounded-lg bg-ocean-foam/30 text-ocean-deep font-medium">{block}</span>
              {/each}
            </div>
          </div>

          {#if selectedQuest.status === 'available'}
            <button class="btn-play w-full text-center" onclick={() => startQuest(selectedQuest)}>
              🚀 Mulai Misi!
            </button>
          {:else if selectedQuest.status === 'locked'}
            <button class="btn w-full bg-ocean-foam/30 text-earth-brown/40 cursor-not-allowed" disabled>
              🔒 Selesaikan misi sebelumnya
            </button>
          {:else}
            <div class="text-center text-safety-green font-display font-semibold">
              ✅ Misi Selesai! 🎉
            </div>
          {/if}
        </div>
      {:else}
        <div class="card p-6 text-center text-earth-brown/40">
          <div class="text-5xl mb-3">🦉</div>
          <p class="font-display font-semibold">Pilih misi untuk melihat detail</p>
          <p class="text-sm mt-1">Siaga siaga akan membantumu!</p>
        </div>
      {/if}
    </div>
  </div>
</div>
