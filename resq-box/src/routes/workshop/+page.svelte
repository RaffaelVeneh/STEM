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

  // Simulator context (logs to console; Phase 3 will wire to Canvas)
  const sim = {
    led: {
      on(color) { console.log(`💡 LED ${color} ON`); },
      off(color) { console.log(`💡 LED ${color} OFF`); },
      async blink(color, times, delayFn) {
        for (let i = 0; i < times; i++) {
          console.log(`💡 LED ${color} BLINK ${i + 1}/${times}`);
          await delayFn(300);
        }
      },
    },
    buzzer: {
      beep(freq, dur) { console.log(`🔊 Buzzer ${freq}Hz ${dur}ms`); },
      off() { console.log('🔊 Buzzer OFF'); },
      async pattern(type, delayFn) {
        console.log(`🔊 Buzzer pattern: ${type}`);
        await delayFn(1000);
      },
    },
    servo: {
      rotate(angle) { console.log(`⚙️ Servo → ${angle}°`); },
    },
    lcd: {
      print(text) { console.log(`📟 LCD: "${text}"`); },
      clear() { console.log('📟 LCD clear'); },
    },
    sensors: {
      water() { return 45; },
      vibration() { return 25; },
      buttonPressed() { return false; },
    },
    delay: (ms) => new Promise((r) => setTimeout(r, ms)),
  };

  async function handleRun() {
    if (!workspaceRef || isRunning) return;
    isRunning = true;
    try {
      const ws = workspaceRef.getWorkspace();
      if (!ws) return;
      await interpretWorkspace(ws, sim);
    } catch (e) {
      console.error('Sim error:', e);
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
  <div class="flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <h2 class="font-display font-bold text-2xl text-ocean-deep">🧩 Workshop Coding</h2>
      <span class="badge {simMode ? 'badge-xp' : 'badge-gold'} text-xs">
        {simMode ? '🔌 Simulasi' : '🔧 Hardware'}
      </span>
    </div>
    <div class="flex gap-2">
      <button class="btn-ghost text-sm" onclick={handleLoad}>📂 Buka</button>
      <button class="btn-ghost text-sm" onclick={handleSave} disabled={saveStatus === 'saving'}>
        {saveStatus === 'saving' ? '⏳ ...' : saveStatus === 'saved' ? '✅ Tersimpan!' : saveStatus === 'error' ? '❌ Gagal' : '💾 Simpan'}
      </button>
      <button class="btn-ghost text-sm" onclick={handleClear}>🗑️ Bersihkan</button>
      <button class="btn-ghost text-sm" onclick={handleExportCode}>📥 Export .ino</button>
      <button class="btn-play text-sm" onclick={handleRun} disabled={isRunning}>
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

    <!-- Code Preview -->
    <div class="w-80 shrink-0 flex flex-col gap-3">
      <div class="flex-1 bg-[#1D3557] rounded-2xl p-4 overflow-y-auto flex flex-col min-h-0">
        <h3 class="font-display font-semibold text-sm text-ocean-foam mb-3 uppercase tracking-wide flex items-center gap-2 shrink-0">
          📝 Kode Arduino (.ino)
          <button
            class="ml-auto text-xs bg-ocean-foam/20 hover:bg-ocean-foam/40 text-ocean-foam px-2 py-0.5 rounded-lg transition-colors"
            onclick={handleExportCode}
          >📥</button>
        </h3>
        {#if generatedCode && !generatedCode.startsWith('// Seret blok')}
          <pre class="text-xs text-ocean-foam font-mono whitespace-pre-wrap flex-1 overflow-y-auto">{generatedCode}</pre>
        {:else}
          <div class="flex-1 flex items-center justify-center text-ocean-foam/40 text-sm text-center">
            <div>
              <div class="text-4xl mb-2">🧩</div>
              <p>Seret blok dari toolbox ke canvas untuk melihat kode Arduino</p>
            </div>
          </div>
        {/if}
      </div>

      <div class="card p-4 shrink-0">
        <h4 class="font-display font-semibold text-sm text-safety-orange mb-2">💡 Tips dari Siaga</h4>
        <ul class="text-xs text-earth-brown/70 space-y-1">
          <li>🖱️ <strong>Seret</strong> blok dari toolbox</li>
          <li>🔗 <strong>Sambungkan</strong> seperti puzzle</li>
          <li>▶️ Klik <strong>Jalankan</strong> untuk simulasi</li>
          <li>💾 <strong>Ctrl+S</strong> untuk menyimpan</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Celebration Overlay -->
  {#if showCelebration}
    <div class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.5);" onclick={() => { showCelebration = false; goto('/quests'); }}>
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
    </div>
    {#each Array(20) as _, i}
      <div class="confetti-piece" style="position: fixed; top: 0; left: {Math.random() * 100}%; z-index: 40; animation-delay: {Math.random() * 0.5}s; width: {6 + Math.random() * 8}px; height: {6 + Math.random() * 8}px; background: {['#FF6B35','#FFC107','#2EC4B6','#E63946','#FFD60A'][i % 5]}; border-radius: {Math.random() > 0.5 ? '50%' : '2px'};"></div>
    {/each}
  {/if}
</div>
