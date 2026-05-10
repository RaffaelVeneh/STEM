<script>
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { QUESTS } from '$lib/quests/definitions.js';
  import { questStatus, setActiveMission } from '$lib/stores/gamification.js';

  let quests = $state(QUESTS.map(q => ({ ...q, status: 'locked' })));
  let selectedQuest = $state(null);
  let selectedProject = $state(null);
  let currentLang = $state('id');
  let activeTab = $state('quests');

  // Group quests by disaster type with visual theming
  const disasterGroups = [
    {
      id: 'gempa',
      title: 'Gempa Bumi',
      titleEn: 'Earthquake',
      icon: '🏚️',
      color: 'var(--color-safety-red)',
      quests: QUESTS.filter(q => [1, 2].includes(q.id)),
    },
    {
      id: 'banjir',
      title: 'Banjir',
      titleEn: 'Flood',
      icon: '🌊',
      color: 'var(--color-ocean-wave)',
      quests: QUESTS.filter(q => [3].includes(q.id)),
    },
    {
      id: 'multi',
      title: 'Multi-Bencana',
      titleEn: 'Multi-Hazard',
      icon: '📢',
      color: 'var(--color-safety-orange)',
      quests: QUESTS.filter(q => [4].includes(q.id)),
    },
    {
      id: 'tangguh',
      title: 'Desa Tangguh',
      titleEn: 'Resilient Village',
      icon: '🏘️',
      color: 'var(--color-safety-green)',
      quests: QUESTS.filter(q => [5].includes(q.id)),
    },
  ];

  const FINAL_PROJECTS = [
    {
      id: 'project-1',
      title: 'Sistem Peringatan Dini Terpadu',
      titleEn: 'Integrated Early Warning System',
      icon: '🔔',
      desc: 'Gabungkan semua sensor dan aktuator untuk membuat sistem peringatan dini lengkap dengan LCD, buzzer, dan LED.',
      hardwareSteps: [
        'Pasang sensor getar pada pin D2',
        'Pasang sensor air pada pin A0',
        'Pasang LED merah pada pin D13',
        'Pasang buzzer pada pin D9',
        'Pasang LCD I2C pada pin SDA/SCL',
        'Pasang tombol darurat pada pin D3',
      ],
    },
    {
      id: 'project-2',
      title: 'Smart Evacuation System',
      titleEn: 'Smart Evacuation System',
      icon: '🚨',
      desc: 'Bangun jalur evakuasi pintar dengan LED indikator arah, servo sebagai palang, dan tombol darurat.',
      hardwareSteps: [
        'Pasang 3 LED (merah, kuning, hijau) pada pin D11, D12, D13',
        'Pasang servo pada pin D5 sebagai palang evakuasi',
        'Pasang tombol darurat pada pin D2',
        'Pasang LCD untuk menampilkan arah evakuasi',
      ],
    },
    {
      id: 'project-3',
      title: 'Smart Flood Barrier',
      titleEn: 'Smart Flood Barrier',
      icon: '🛡️',
      desc: 'Deteksi ketinggian air dan aktifkan penghalang banjir otomatis menggunakan servo.',
      hardwareSteps: [
        'Pasang sensor air pada pin A0',
        'Pasang servo sebagai penghalang pada pin D6',
        'Pasang LED peringatan pada pin D13',
        'Pasang buzzer alarm pada pin D9',
        'Pasang LCD untuk menampilkan level air',
      ],
    },
  ];

  // Sync quest statuses from store — reads only, no writes to selectedQuest
  $effect(() => {
    quests = QUESTS.map(q => ({ ...q, status: $questStatus[q.id] || 'locked' }));
  });

  // When selected quest's status changes externally, refresh it
  $effect(() => {
    if (selectedQuest) {
      const updated = quests.find(q => q.id === selectedQuest.id);
      if (updated && updated.status !== selectedQuest.status) {
        selectedQuest = { ...updated };
      }
    }
  });

  function selectQuest(quest) {
    if (quest.status !== 'locked') {
      selectedQuest = quest;
      selectedProject = null;
    }
  }

  function startQuest(quest) {
    // Store active mission in sidebar — it stays pinned there
    setActiveMission(quest);
    // Navigate to workshop, opening the quest's tab
    goto(`/workshop?tab=quest-${quest.id}`);
  }

  function handleGroupKeydown(e, group) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Expand/collapse or focus first quest
      const firstAvailable = group.quests.find(q => q.status !== 'locked');
      if (firstAvailable) selectQuest(firstAvailable);
    }
  }
</script>

<svelte:head>
  <title>RESQ-BOX — Misi</title>
</svelte:head>

<div class="h-full flex flex-col space-y-6" in:fly={{ y: 20, duration: 400 }}>
  <!-- Header -->
  <div style="display:flex; align-items:center; justify-content:space-between;">
    <div>
      <h2 style="font-family:var(--font-display); font-weight:800; font-size:1.5rem; color:var(--color-ocean-deep); margin:0;">🎯 Papan Misi</h2>
      <p style="font-size:0.85rem; color:var(--color-earth-brown); opacity:0.7; margin:0.25rem 0 0;">Selesaikan misi untuk menjadi Pahlawan Tangguh Bencana!</p>
    </div>
    <div style="display:flex; gap:0.5rem;">
      <button onclick={() => activeTab = 'quests'} style="padding:0.5rem 1rem; border-radius:0.75rem; border:2px solid {activeTab==='quests'?'var(--color-safety-orange)':'transparent'}; background:{activeTab==='quests'?'var(--color-safety-orange)':'transparent'}; color:{activeTab==='quests'?'#fff':'var(--color-earth-brown)'}; font-family:var(--font-display); font-weight:700; font-size:0.8rem; cursor:pointer;">📋 Misi</button>
      <button onclick={() => activeTab = 'projects'} style="padding:0.5rem 1rem; border-radius:0.75rem; border:2px solid {activeTab==='projects'?'var(--color-safety-green)':'transparent'}; background:{activeTab==='projects'?'var(--color-safety-green)':'transparent'}; color:{activeTab==='projects'?'#fff':'var(--color-earth-brown)'}; font-family:var(--font-display); font-weight:700; font-size:0.8rem; cursor:pointer;">🔧 Projek Akhir</button>
    </div>
  </div>

  <div class="flex-1 flex gap-6 min-h-0">
    <!-- Quest Grid — grouped by disaster -->
    <div class="flex-1 overflow-y-auto pr-2" style="display:flex; flex-direction:column; gap:1rem;">
      {#if activeTab === 'quests'}
        {#each disasterGroups as group}
          <div style="border-radius:1.25rem; padding:1.25rem; border:2px solid {group.color}20; background: linear-gradient(135deg, {group.color}08, {group.color}03);">
            <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
              <div style="font-size:2rem;">{group.icon}</div>
              <div>
                <h3 style="font-family:var(--font-display); font-weight:800; font-size:1.1rem; color:{group.color}; margin:0;">{currentLang === 'id' ? group.title : group.titleEn}</h3>
                <p style="font-size:0.75rem; color:var(--color-earth-brown); opacity:0.6; margin:0.15rem 0 0;">{group.quests.length} sub-misi</p>
              </div>
            </div>
            <div style="display:flex; gap:0.65rem;">
              {#each group.quests as quest}
                <button
                  onclick={() => selectQuest(quest)}
                  disabled={quest.status === 'locked'}
                  style="
                    flex:1;
                    padding:0.85rem;
                    border-radius:1rem;
                    border:2px solid {quest.status === 'completed' ? 'var(--color-safety-green)' : quest.status === 'locked' ? 'transparent' : group.color}40;
                    background: {quest.status === 'completed' ? 'color-mix(in srgb, var(--color-safety-green) 10%, #fff)' : quest.status === 'locked' ? '#f5f5f5' : '#fff'};
                    cursor: {quest.status === 'locked' ? 'not-allowed' : 'pointer'};
                    opacity: {quest.status === 'locked' ? '0.4' : '1'};
                    text-align:center;
                    font-family:inherit;
                    transition: all 0.2s;
                  "
                >
                  <div style="font-size:1.5rem; margin-bottom:0.25rem;">{quest.icon}</div>
                  <div style="font-family:var(--font-display); font-weight:700; font-size:0.75rem; color:var(--color-ocean-deep); margin-bottom:0.15rem;">
                    {currentLang === 'id' ? quest.title : quest.titleEn}
                  </div>
                  <div style="display:flex; align-items:center; justify-content:center; gap:0.3rem;">
                    <span style="font-size:0.6rem; padding:0.15rem 0.45rem; border-radius:9999px; background:{quest.status==='completed'?'var(--color-safety-green)20':group.color}15; color:{quest.status==='completed'?'var(--color-safety-green)':group.color}; font-weight:600;">{quest.xp} XP</span>
                    {#if quest.status === 'completed'}
                      <span style="font-size:0.7rem;">✅</span>
                    {:else if quest.status === 'locked'}
                      <span style="font-size:0.7rem;">🔒</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/each}
      {:else}
        <!-- Final Projects Tab -->
        {#each FINAL_PROJECTS as project}
          <button type="button"
            style="width:100%; border-radius:1.25rem; padding:1.5rem; border:2px solid color-mix(in srgb, var(--color-safety-green) 30%, transparent); background:linear-gradient(135deg, color-mix(in srgb, var(--color-safety-green) 5%, transparent), color-mix(in srgb, var(--color-ocean-deep) 3%, transparent)); cursor:pointer; font-family:inherit; text-align:left;"
            onclick={() => selectedProject = project}>
            <div style="display:flex; align-items:center; gap:1rem;">
              <div style="font-size:2.5rem;">{project.icon}</div>
              <div class="flex-1">
                <h3 style="font-family:var(--font-display); font-weight:800; font-size:1.1rem; color:var(--color-ocean-deep); margin:0;">{currentLang === 'id' ? project.title : project.titleEn}</h3>
                <p style="font-size:0.8rem; color:var(--color-earth-brown); opacity:0.7; margin:0.25rem 0 0;">{project.desc}</p>
              </div>
              <span style="font-size:1.5rem;">→</span>
            </div>
          </button>
        {/each}
      {/if}
    </div>

    <!-- Quest Detail Panel -->
    <div class="w-80 shrink-0" style="overflow-y:auto;">
      {#if selectedQuest}
        <div class="card p-6 sticky top-0" in:fly={{ x: 20, duration: 300 }} style="max-height:calc(100vh - 180px); overflow-y:auto;">
          <div style="font-size:3rem; text-align:center; margin-bottom:0.75rem;">{selectedQuest.icon}</div>
          <h3 style="font-family:var(--font-display); font-weight:800; font-size:1.1rem; color:var(--color-ocean-deep); text-align:center; margin:0;">
            {currentLang === 'id' ? selectedQuest.title : selectedQuest.titleEn}
          </h3>
          <div style="display:flex; justify-content:center; gap:0.5rem; margin:0.75rem 0;">
            <span class="badge-xp">{selectedQuest.xp} XP</span>
            <span style="font-size:0.75rem; color:var(--color-earth-brown); opacity:0.5;">{selectedQuest.difficulty}</span>
          </div>
          <p style="font-size:0.8rem; color:var(--color-earth-brown); opacity:0.7; margin:0 0 0.75rem; line-height:1.4;">
            {currentLang === 'id' ? selectedQuest.desc : selectedQuest.descEn}
          </p>

          <!-- Hint -->
          <div style="border-radius:0.75rem; padding:0.75rem; margin-bottom:0.75rem; background:color-mix(in srgb, var(--color-safety-yellow) 12%, transparent); border:1px solid color-mix(in srgb, var(--color-safety-yellow) 30%, transparent);">
            <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.3rem;">
              <span>💡</span>
              <span style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; color:var(--color-safety-orange);">Hint dari Siaga</span>
            </div>
            <p style="font-size:0.75rem; color:var(--color-earth-brown); margin:0; line-height:1.4;">{selectedQuest.hint}</p>
          </div>

          <!-- STEP-BY-STEP INSTRUCTIONS -->
          <div style="margin-bottom:0.75rem;">
            <h4 style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; color:var(--color-safety-orange); margin:0 0 0.5rem;">📝 Langkah Kerja</h4>
            <ol style="margin:0; padding-left:1.25rem; font-size:0.72rem; color:var(--color-earth-brown); line-height:1.6;">
              {#each selectedQuest.steps as step}
                <li style="margin-bottom:0.3rem;">{step}</li>
              {/each}
            </ol>
          </div>

          {#if selectedQuest.status === 'available'}
            <button class="btn-play" style="width:100%; text-align:center;" onclick={() => startQuest(selectedQuest)}>
              🚀 Mulai Misi!
            </button>
          {:else if selectedQuest.status === 'locked'}
            <button class="btn" style="width:100%; background:#ddd; color:#999; cursor:not-allowed;" disabled>
              🔒 Selesaikan misi sebelumnya
            </button>
          {:else}
            <div style="text-align:center; color:var(--color-safety-green); font-family:var(--font-display); font-weight:700;">
              ✅ Misi Selesai! 🎉
            </div>
          {/if}
        </div>
      {:else if selectedProject}
        <div class="card p-6 sticky top-0" in:fly={{ x: 20, duration: 300 }} style="max-height:calc(100vh - 180px); overflow-y:auto;">
          <div style="font-size:3rem; text-align:center; margin-bottom:0.75rem;">🔧</div>
          <h3 style="font-family:var(--font-display); font-weight:800; font-size:1.1rem; color:var(--color-ocean-deep); text-align:center; margin:0;">
            {currentLang === 'id' ? selectedProject.title : selectedProject.titleEn}
          </h3>
          <p style="font-size:0.8rem; color:var(--color-earth-brown); opacity:0.7; margin:0.75rem 0; line-height:1.4;">{selectedProject.desc}</p>
          
          <h4 style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; color:var(--color-safety-orange); margin:0 0 0.5rem;">🔩 Langkah Perakitan Hardware</h4>
          <ol style="margin:0; padding-left:1.25rem; font-size:0.72rem; color:var(--color-earth-brown); line-height:1.6;">
            {#each selectedProject.hardwareSteps as step}
              <li style="margin-bottom:0.35rem;">{step}</li>
            {/each}
          </ol>

          <button class="btn-play" style="width:100%; text-align:center; margin-top:1rem;" onclick={() => goto('/workshop')}>
            🧩 Buka Workshop
          </button>
        </div>
      {:else}
        <div class="card p-6 text-center" style="color:var(--color-earth-brown); opacity:0.5;">
          <div style="font-size:4rem; margin-bottom:0.75rem;">🦉</div>
          <p style="font-family:var(--font-display); font-weight:700; margin:0;">Pilih misi atau projek</p>
          <p style="font-size:0.8rem; margin:0.25rem 0 0;">untuk melihat detail dan langkah kerja</p>
        </div>
      {/if}
    </div>
  </div>
</div>
