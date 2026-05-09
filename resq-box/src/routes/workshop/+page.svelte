<script>
  import { fly } from 'svelte/transition';
  import BlocklyWorkspace from '$lib/components/BlocklyWorkspace.svelte';
  import { interpretWorkspace } from '$lib/blockly/interpreter.js';
  import { saveProject, loadProject } from '$lib/stores/db.js';

  let generatedCode = $state('');
  let workspaceRef = $state(null);
  let isRunning = $state(false);
  let saveStatus = $state('');
  let simMode = $state(true);

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
</div>
