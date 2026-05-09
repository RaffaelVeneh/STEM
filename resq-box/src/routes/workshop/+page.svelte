<script>
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import BlocklyWorkspace from '$lib/components/BlocklyWorkspace.svelte';
  import { interpretWorkspace } from '$lib/blockly/interpreter.js';
  import { saveProject, loadProject } from '$lib/stores/db.js';
  import { validateQuest } from '$lib/quests/validation.js';
  import { getQuest } from '$lib/quests/definitions.js';
  import { completeQuest } from '$lib/stores/gamification.js';
  import { page } from '$app/stores';

  let generatedCode = $state('');
  let workspaceRef = $state(null);
  let isRunning = $state(false);
  let saveStatus = $state('');
  let simMode = $state(true);

  // Quest mode
  let activeQuest = $state(null);
  let validationResult = $state(null);
  let showCelebration = $state(false);

  $effect(() => {
    const questId = $page.url.searchParams.get('quest');
    if (questId) {
      activeQuest = getQuest(parseInt(questId));
      validationResult = null;
      showCelebration = false;
    }
  });

  function handleCodeGenerated(code) {
    generatedCode = code;
  }

  // Simulator context — WRITES TO VISIBLE LOG, not console
  let simLog = $state([]);
  let simSensorValues = $state({ water: 45, vibration: 25, button: false });

  function addLog(msg, type = 'info') {
    simLog = [...simLog.slice(-49), { msg, type, time: Date.now() }];
  }

  function setSensorValue(key, value) {
    simSensorValues = { ...simSensorValues, [key]: value };
  }

  const sim = {
    led: {
      on(color) {
        addLog(`💡 LED ${color} NYALA`, 'led');
      },
      off(color) {
        addLog(`💡 LED ${color} MATI`, 'led');
      },
      async blink(color, times, delayFn) {
        for (let i = 0; i < times; i++) {
          addLog(`💡 LED ${color} KEDIP ${i + 1}/${times}`, 'led');
          await delayFn(300);
          addLog(`💡 LED ${color} MATI`, 'led');
          await delayFn(300);
        }
      },
    },
    buzzer: {
      beep(freq, dur) {
        addLog(`🔊 Buzzer BUNYI ${freq}Hz ${dur}ms`, 'buzzer');
      },
      off() {
        addLog('🔊 Buzzer DIAM', 'buzzer');
      },
      async pattern(type, delayFn) {
        addLog(`🔊 Buzzer POLA ${type} dimulai`, 'buzzer');
        await delayFn(1000);
        addLog('🔊 Buzzer POLA selesai', 'buzzer');
      },
    },
    servo: {
      rotate(angle) {
        addLog(`⚙️ Servo PUTAR ke ${angle}°`, 'servo');
      },
    },
    lcd: {
      print(text) {
        addLog(`📟 LCD: "${text}"`, 'lcd');
      },
      clear() {
        addLog('📟 LCD dibersihkan', 'lcd');
      },
    },
    sensors: {
      water() {
        const v = simSensorValues.water;
        addLog(`💧 Sensor Air membaca: ${v}%`, 'sensor');
        return v;
      },
      vibration() {
        const v = simSensorValues.vibration;
        addLog(`📳 Sensor Getar membaca: ${v}`, 'sensor');
        return v;
      },
      buttonPressed() {
        const v = simSensorValues.button;
        addLog(`🚨 Tombol Darurat: ${v ? 'DITEKAN' : 'TIDAK'}`, 'sensor');
        return v;
      },
    },
    delay: (ms) => new Promise((r) => setTimeout(r, ms)),
  };

  async function handleRun() {
    if (!workspaceRef || isRunning) return;
    isRunning = true;
    simLog = [];
    addLog('▶️ SIMULASI DIMULAI', 'info');
    try {
      const ws = workspaceRef.getWorkspace();
      if (!ws) return;
      await interpretWorkspace(ws, sim);
      addLog('✅ SIMULASI SELESAI', 'info');
    } catch (e) {
      addLog('❌ ERROR: ' + e.message, 'error');
    } finally {
      isRunning = false;
    }
  }

  async function handleSave() {
    if (!workspaceRef) return;
    saveStatus = 'saving';
    try {
      const xml = workspaceRef.getWorkspaceXml();
      await saveProject('workspace-main', { name: 'Proyek Workshop', xml, code: generatedCode });
      saveStatus = 'saved';
      setTimeout(() => (saveStatus = ''), 2000);
    } catch (e) {
      saveStatus = 'error';
    }
  }

  async function handleLoad() {
    if (!workspaceRef) return;
    try {
      const project = await loadProject('workspace-main');
      if (project?.xml) workspaceRef.loadWorkspaceXml(project.xml);
    } catch (e) {
      console.error('Load failed:', e);
    }
  }

  function handleClear() {
    workspaceRef?.clearWorkspace();
    validationResult = null;
    simLog = [];
  }

  function handleExportCode() {
    if (!generatedCode || generatedCode.startsWith('// Seret blok')) return;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resqbox_project.ino';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ─── Quest ───
  function handleValidateQuest() {
    if (!workspaceRef || !activeQuest) return;
    const ws = workspaceRef.getWorkspace();
    validationResult = ws ? validateQuest(ws, activeQuest) : null;
  }

  function handleCompleteQuest() {
    if (!workspaceRef || !activeQuest) return;
    const ws = workspaceRef.getWorkspace();
    const result = ws ? validateQuest(ws, activeQuest) : null;
    validationResult = result;
    if (result?.passed) {
      completeQuest(activeQuest.id, activeQuest.xp);
      showCelebration = true;
      saveProject(`quest-done-${activeQuest.id}`, {
        name: `Misi ${activeQuest.id} Selesai`,
        xml: workspaceRef.getWorkspaceXml(),
        code: generatedCode,
        doneAt: new Date().toISOString(),
      });
      setTimeout(() => { showCelebration = false; goto('/quests'); }, 4000);
    }
  }

  function handleBackToQuests() {
    activeQuest = null;
    validationResult = null;
    goto('/quests');
  }

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }
</script>

<svelte:head>
  <title>RESQ-BOX — Workshop</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="h-full flex flex-col space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- Mission Header (shown when quest is active) -->
  {#if activeQuest}
    <div class="shrink-0 rounded-2xl p-4 flex items-center gap-4" style="background: linear-gradient(135deg, var(--color-ocean-deep), var(--color-ocean-wave));">
      <button class="btn-ghost text-white text-sm shrink-0" onclick={handleBackToQuests} style="color: #fff;">
        ← Kembali
      </button>
      <div class="text-3xl">{activeQuest.icon}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="badge-xp text-xs">{activeQuest.xp} XP</span>
          <span class="text-xs" style="color: var(--color-ocean-foam);">{activeQuest.difficulty}</span>
        </div>
        <h3 class="font-display font-bold text-lg" style="color: #fff;">
          Level {activeQuest.id}: {activeQuest.title}
        </h3>
        <p class="text-xs mt-0.5" style="color: var(--color-ocean-foam);">{activeQuest.desc}</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button class="btn-ghost text-sm" style="color: var(--color-ocean-foam); border: 1px solid var(--color-ocean-foam);" onclick={handleValidateQuest}>
          🔍 Cek
        </button>
        <button class="btn-play text-sm" onclick={handleCompleteQuest}>
          🏆 Selesaikan Misi
        </button>
      </div>
    </div>

    <!-- Hint bar -->
    <div class="shrink-0 rounded-xl p-3 flex items-start gap-2" style="background: color-mix(in srgb, var(--color-safety-yellow) 15%, transparent); border: 1px solid color-mix(in srgb, var(--color-safety-yellow) 40%, transparent);">
      <span class="text-sm">💡</span>
      <div class="flex-1">
        <span class="font-display font-semibold text-xs" style="color: var(--color-safety-orange);">HINT DARI SIAGA:</span>
        <span class="text-xs ml-2" style="color: var(--color-earth-brown);">{activeQuest.hint}</span>
      </div>
    </div>
  {/if}

  <!-- Validation result bar -->
  {#if validationResult}
    <div class="shrink-0 rounded-xl p-3" style="background: {validationResult.passed ? 'color-mix(in srgb, var(--color-safety-green) 15%, transparent)' : 'color-mix(in srgb, var(--color-safety-red) 15%, transparent)'}; border: 1px solid {validationResult.passed ? 'var(--color-safety-green)' : 'var(--color-safety-red)'};">
      <div class="flex items-center gap-2">
        <span class="text-lg">{validationResult.passed ? '✅' : '❌'}</span>
        <span class="text-sm font-display font-semibold" style="color: {validationResult.passed ? 'var(--color-safety-green)' : 'var(--color-safety-red)'};">
          {validationResult.feedback}
        </span>
      </div>
    </div>
  {/if}
  <!-- Toolbar -->
  <div style="display:flex; align-items:center; justify-content:space-between; flex-shrink:0; padding:0.75rem 1.25rem; border-radius:1.25rem; background: linear-gradient(135deg, var(--color-ocean-deep), var(--color-ocean-wave));">
    <div style="display:flex; align-items:center; gap:0.75rem;">
      <h2 style="font-family:var(--font-display); font-weight:800; font-size:1.25rem; color:#fff; margin:0;">
        🧩 Workshop Coding
      </h2>
      <span class="badge-xp" style="font-size:0.7rem; background:rgba(255,255,255,0.15); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:0.2rem 0.7rem;">
        🔌 Simulasi
      </span>
      {#if activeQuest}
        <span class="badge-gold" style="font-size:0.7rem; background:rgba(255,183,3,0.2); color:var(--color-safety-yellow); border:1px solid var(--color-safety-yellow);">
          🎯 Misi Aktif
        </span>
      {/if}
    </div>
    <div style="display:flex; gap:0.5rem;">
      <button class="btn-ghost" style="color:#fff; font-size:0.8rem;" onclick={handleLoad}>📂 Buka</button>
      <button class="btn-ghost" style="color:#fff; font-size:0.8rem;" onclick={handleSave} disabled={saveStatus === 'saving'}>
        {saveStatus === 'saving' ? '⏳ ...' : saveStatus === 'saved' ? '✅ Tersimpan!' : '💾 Simpan'}
      </button>
      <button class="btn-ghost" style="color:#fff; font-size:0.8rem;" onclick={handleClear}>🗑️</button>
      <button class="btn-ghost" style="color:#fff; font-size:0.8rem;" onclick={handleExportCode}>📥 .ino</button>
      <button class="btn-play" style="font-size:0.85rem; padding:0.6rem 1.25rem;" onclick={handleRun} disabled={isRunning}>
        {isRunning ? '⏳ Running...' : '▶️ Jalankan'}
      </button>
    </div>
  </div>

  <!-- Main Workshop Area -->
  <div class="flex-1 flex gap-4 min-h-0">
    <!-- Blockly Canvas -->
    <div class="flex-1 min-w-0">
      <BlocklyWorkspace
        bind:this={workspaceRef}
        onCodeGenerated={handleCodeGenerated}
      />
    </div>

    <!-- RIGHT PANEL: Sim Log + Sensors + Code -->
    <div style="width:300px; flex-shrink:0; display:flex; flex-direction:column; gap:0.65rem;">
      
      <!-- SIMULATION OUTPUT LOG -->
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; border-radius:1.25rem; overflow:hidden; background:#1D3557; box-shadow:0 4px 16px rgba(0,0,0,0.1);">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.7rem 1rem; background:rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.08); flex-shrink:0;">
          <h3 style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--color-ocean-foam); margin:0;">
            📟 Output Simulasi
          </h3>
          <span style="font-size:0.65rem; color:var(--color-ocean-foam); opacity:0.5;">{simLog.length} events</span>
        </div>
        <div style="flex:1; overflow-y:auto; padding:0.5rem;">
          {#if simLog.length === 0}
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.4; text-align:center; padding:1rem;">
              <div style="font-size:2rem; margin-bottom:0.5rem;">▶️</div>
              <p style="font-size:0.75rem; color:var(--color-ocean-foam); margin:0;">Klik <strong style="color:var(--color-safety-green);">▶️ Jalankan</strong> untuk melihat simulasi</p>
            </div>
          {:else}
            {#each simLog as entry}
              {@const colors = { led: '#FFC107', buzzer: '#FF6B35', sensor: '#A8DADC', servo: '#2EC4B6', lcd: '#FFD60A', error: '#E63946', info: '#457B9D' }}
              <div style="padding:0.35rem 0.5rem; margin-bottom:0.2rem; border-radius:0.5rem; font-size:0.72rem; font-family:monospace; color:{colors[entry.type] || '#A8DADC'}; background:rgba(255,255,255,0.03); border-left:3px solid {colors[entry.type] || '#A8DADC'};">
                {entry.msg}
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- SENSOR CONTROLS -->
      <div style="flex-shrink:0; border-radius:1rem; padding:0.85rem; background:#fff; border:2px solid color-mix(in srgb, var(--color-ocean-foam) 40%, transparent); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <h3 style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--color-safety-orange); margin:0 0 0.6rem;">
          🎮 Sensor Simulasi
        </h3>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.65rem; font-weight:600; color:var(--color-earth-brown); margin-bottom:0.15rem;">
              <span>💧 Air</span><span>{simSensorValues.water}%</span>
            </div>
            <input type="range" min="0" max="100" value={simSensorValues.water}
              oninput={(e) => setSensorValue('water', parseInt(e.target.value))}
              style="width:100%; height:5px; accent-color:var(--color-ocean-wave); cursor:pointer;" />
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.65rem; font-weight:600; color:var(--color-earth-brown); margin-bottom:0.15rem;">
              <span>📳 Getaran</span><span>{simSensorValues.vibration}</span>
            </div>
            <input type="range" min="0" max="100" value={simSensorValues.vibration}
              oninput={(e) => setSensorValue('vibration', parseInt(e.target.value))}
              style="width:100%; height:5px; accent-color:var(--color-safety-yellow); cursor:pointer;" />
          </div>
          <button
            style="width:100%; padding:0.5rem; border-radius:0.6rem; border:2px solid var(--color-safety-red); background:{simSensorValues.button ? 'var(--color-safety-red)' : 'transparent'}; color:{simSensorValues.button ? '#fff' : 'var(--color-safety-red)'}; font-family:var(--font-display); font-weight:700; font-size:0.7rem; cursor:pointer; transition:all 0.15s;"
            onmousedown={() => setSensorValue('button', true)}
            onmouseup={() => setSensorValue('button', false)}
            onmouseleave={() => setSensorValue('button', false)}
          >
            🚨 Tombol Darurat {simSensorValues.button ? 'DITEKAN' : ''}
          </button>
        </div>
      </div>

      <!-- CODE PREVIEW (compact) -->
      <div style="flex-shrink:0; border-radius:1rem; padding:0.75rem; background:#1D3557; max-height:150px; overflow-y:auto;">
        <h3 style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--color-ocean-foam); margin:0 0 0.4rem; display:flex; justify-content:space-between;">
          📝 .ino
          <button onclick={handleExportCode} style="background:none; border:none; color:var(--color-ocean-foam); cursor:pointer; font-size:0.75rem; opacity:0.6;">📥</button>
        </h3>
        {#if generatedCode && !generatedCode.startsWith('// Seret blok')}
          <pre style="font-size:0.65rem; color:var(--color-ocean-foam); font-family:monospace; white-space:pre-wrap; margin:0; opacity:0.8;">{generatedCode}</pre>
        {:else}
          <p style="font-size:0.7rem; color:var(--color-ocean-foam); opacity:0.4; margin:0;">Seret blok untuk melihat kode Arduino...</p>
        {/if}
      </div>

    </div>
  </div>

  <!-- Celebration Overlay -->
  {#if showCelebration}
    <button type="button" class="fixed inset-0 z-50 flex items-center justify-center w-full border-none cursor-pointer" style="background: rgba(0,0,0,0.5);" onclick={() => { showCelebration = false; goto('/quests'); }}>
      <div style="background: #fff; border-radius: 1.5rem; padding: 2rem; text-align: center; max-width: 24rem; margin: 0 1rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25); animation: popIn 0.5s ease-out;">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="font-display font-bold text-2xl mb-2" style="color: var(--color-safety-green);">Misi Selesai!</h2>
        <p class="text-sm mb-4" style="color: var(--color-earth-brown);">Level {activeQuest?.id}: {activeQuest?.title}</p>
        <div class="inline-flex items-center gap-2 rounded-xl px-4 py-2 mb-4" style="background: linear-gradient(135deg, var(--color-safety-orange), var(--color-safety-yellow)); color: #fff;">
          <span class="text-xl">⭐</span>
          <span class="font-display font-bold">+{activeQuest?.xp} XP</span>
        </div>
        <p class="text-xs" style="color: var(--color-earth-brown); opacity: 0.6;">Klik di mana saja untuk lanjut</p>
      </div>
    </button>
    {#each Array(20) as _, i}
      <div class="confetti-piece" style="position: fixed; top: 0; left: {Math.random() * 100}%; z-index: 40; animation-delay: {Math.random() * 0.5}s; width: {6 + Math.random() * 8}px; height: {6 + Math.random() * 8}px; background: {['#FF6B35','#FFC107','#2EC4B6','#E63946','#FFD60A'][i % 5]}; border-radius: {Math.random() > 0.5 ? '50%' : '2px'};"></div>
    {/each}
  {/if}
</div>
