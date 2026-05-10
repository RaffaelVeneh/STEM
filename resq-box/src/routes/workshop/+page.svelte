<script>
  import { fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import BlocklyWorkspace from '$lib/components/BlocklyWorkspace.svelte';
  import { interpretWorkspace } from '$lib/blockly/interpreter.js';
  import { saveProject, loadProject } from '$lib/stores/db.js';
  import { validateQuest } from '$lib/quests/validation.js';
  import { getQuest } from '$lib/quests/definitions.js';
  import { completeQuest, activeMission, setActiveMission } from '$lib/stores/gamification.js';
  import { workspaceTabs, activeWorkspaceTab, allTabs } from '$lib/stores/workspaceTabs.js';
  import { saveDraft, restoreDrafts, deleteDraft, loadDraft, saveAllDrafts } from '$lib/stores/draft.js';
  import { page } from '$app/stores';

  let workspaceRefs = $state({});      // tabId → BlocklyWorkspace instance
  let tabCodes = $state({});           // tabId → generated Arduino C code
  let activeTabId = $state(null);
  let isRunning = $state(false);
  let saveStatus = $state('');
  let simMode = $state(true);

  // Quest mode (derived from active tab)
  let activeQuest = $state(null);
  let validationResult = $state(null);
  let showCelebration = $state(false);

  // Derive activeQuest from the active tab
  $effect(() => {
    const tab = $activeWorkspaceTab;
    if (tab && tab.questId) {
      activeQuest = getQuest(tab.questId);
    } else if ($activeMission) {
      const q = $activeMission;
      workspaceTabs.openTab(`Level ${q.id}`, q.icon || '🎯', q.id);
      activeQuest = q;
    } else {
      activeQuest = null;
    }
  });

  // ─── INIT: Open first tab + handle URL params on EVERY mount ───
  let hasInitialized = $state(false);

  $effect(() => {
    // Reset store state fresh on every mount
    if (!hasInitialized) {
      hasInitialized = true;
      
      // Always ensure exactly 1 free workspace tab on first visit
      const tabs = workspaceTabs.getAllTabs();
      
      // Check URL for &tab= → open that specific tab
      const tabParam = $page.url.searchParams.get('tab');
      if (tabParam) {
        const questIdMatch = tabParam.match(/^quest-(\d+)$/);
        if (questIdMatch) {
          const qId = parseInt(questIdMatch[1]);
          const quest = getQuest(qId);
          if (quest) {
            setActiveMission(quest);
            // Open mission tab first
            workspaceTabs.openTab(`Level ${qId}`, quest.icon || '🎯', qId);
            // Also ensure a free workshop tab exists
            if (!tabs.some(t => t.questId === null)) {
              workspaceTabs.openTab('Workshop', '🧩', null);
            }
            return;
          }
        }
      }

      // No URL param → restore drafts or create default tab
      restoreDrafts().then(() => {
        const currentTabs = workspaceTabs.getAllTabs();
        if (currentTabs.length === 0) {
          workspaceTabs.openTab('Workshop', '🧩', null);
        }
      });
    }
  });

  // Auto-save ALL tabs as drafts when leaving page
  onDestroy(() => {
    const tabs = workspaceTabs.getAllTabs();
    saveAllDrafts(tabs);
    // Reset store so next mount starts fresh
    workspaceTabs.reset();
  });

  // Track active tab ID
  $effect(() => {
    activeTabId = $workspaceTabs.activeTabId;
  });

  function handleCodeGenerated(code) {
    if (activeTabId) {
      tabCodes = { ...tabCodes, [activeTabId]: code };
      workspaceTabs.saveTabCode(activeTabId, code);
    }
  }

  function getWorkspaceRef(tabId) {
    return workspaceRefs[tabId] || null;
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
    const ref = getWorkspaceRef(activeTabId);
    if (!ref || isRunning) return;
    isRunning = true;
    simLog = [];
    addLog('▶️ SIMULASI DIMULAI', 'info');
    try {
      const ws = ref.getWorkspace();
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
    const ref = getWorkspaceRef(activeTabId);
    if (!ref) return;
    saveStatus = 'saving';
    try {
      const xml = ref.getWorkspaceXml();
      await saveProject('workspace-main', { name: 'Proyek Workshop', xml, code: tabCodes[activeTabId] || '' });
      saveStatus = 'saved';
      setTimeout(() => (saveStatus = ''), 2000);
    } catch (e) {
      saveStatus = 'error';
    }
  }

  async function handleLoad() {
    const ref = getWorkspaceRef(activeTabId);
    if (!ref) return;
    try {
      const draft = await loadDraft(activeTabId);
      if (draft?.xml) ref.loadWorkspaceXml(draft.xml);
    } catch (e) {
      console.error('Load failed:', e);
    }
  }

  function handleClear() {
    const ref = getWorkspaceRef(activeTabId);
    ref?.clearWorkspace();
    validationResult = null;
    simLog = [];
    workspaceTabs.saveTabXml(activeTabId, null);
    workspaceTabs.saveTabCode(activeTabId, '');
  }

  function handleExportCode() {
    const code = tabCodes[activeTabId] || '';
    if (!code || code.startsWith('// Seret blok')) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resqbox_project.ino';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleNewTab() {
    workspaceTabs.openTab('Workshop', '🧩', null);
  }

  function handleCloseTab(tabId, e) {
    e.stopPropagation();
    deleteDraft(tabId);
    workspaceTabs.closeTab(tabId);
  }

  function handleSelectTab(tabId) {
    workspaceTabs.setActiveTab(tabId);
  }

  // ─── Quest validation ───
  function handleValidateQuest() {
    const ref = getWorkspaceRef(activeTabId);
    if (!ref || !activeQuest) return;
    const ws = ref.getWorkspace();
    validationResult = ws ? validateQuest(ws, activeQuest) : null;
  }

  function handleCompleteQuest() {
    const ref = getWorkspaceRef(activeTabId);
    if (!ref || !activeQuest) return;
    const ws = ref.getWorkspace();
    const result = ws ? validateQuest(ws, activeQuest) : null;
    validationResult = result;
    if (result?.passed) {
      completeQuest(activeQuest.id, activeQuest.xp);
      showCelebration = true;
      saveProject(`quest-done-${activeQuest.id}`, {
        name: `Misi ${activeQuest.id} Selesai`,
        xml: ref.getWorkspaceXml(),
        code: tabCodes[activeTabId] || '',
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

  <!-- Tab Bar -->
  <div class="shrink-0 flex items-center gap-1 overflow-x-auto pb-1" style="border-bottom:2px solid color-mix(in srgb, var(--color-ocean-foam) 30%, transparent);">
    {#each $allTabs as tab}
      <button
        class="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-display font-semibold transition-all duration-150 cursor-pointer"
        style="
          background: {activeTabId === tab.id ? '#fff' : 'transparent'};
          color: {activeTabId === tab.id ? 'var(--color-ocean-deep)' : 'var(--color-earth-brown)'};
          border: 2px solid {activeTabId === tab.id ? 'color-mix(in srgb, var(--color-ocean-foam) 50%, transparent)' : 'transparent'};
          border-bottom: {activeTabId === tab.id ? '2px solid #fff' : '2px solid transparent'};
          margin-bottom: -2px;
        "
        onclick={() => handleSelectTab(tab.id)}
      >
        <span class="text-sm">{tab.icon}</span>
        <span class="max-w-[120px] truncate">{tab.label}</span>
        {#if tab.questId}
          <span style="font-size:0.55rem; padding:0.05rem 0.35rem; border-radius:9999px; background:color-mix(in srgb, var(--color-safety-orange) 15%, transparent); color:var(--color-safety-orange); font-weight:700;">L{tab.questId}</span>
        {/if}
        <span
          class="ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[0.55rem] hover:bg-safety-red/10 cursor-pointer"
          style="color: var(--color-earth-brown); opacity:0.5;"
          onclick={(e) => handleCloseTab(tab.id, e)}
          title="Tutup tab"
        >✕</span>
      </button>
    {/each}
    <button
      class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110"
      style="background: color-mix(in srgb, var(--color-ocean-foam) 20%, transparent); color: var(--color-ocean-deep);"
      onclick={handleNewTab}
      title="Tab baru"
    >+</button>
  </div>
  <div style="display:flex; align-items:center; justify-content:space-between; flex-shrink:0; padding:0.75rem 1.25rem; border-radius:1.5rem; background: linear-gradient(135deg, var(--color-ocean-deep) 0%, var(--color-ocean-wave) 60%, #5BA4CF 100%); border:2px solid rgba(255,255,255,0.12); box-shadow:0 6px 24px rgba(29,53,87,0.25);">
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
      <button onclick={handleLoad}
        style="
          padding:0.55rem 0.9rem;
          border-radius:2rem;
          border:2px solid rgba(255,255,255,0.25);
          background:rgba(255,255,255,0.1);
          color:#fff;
          font-family:var(--font-display);
          font-weight:600;
          font-size:0.78rem;
          cursor:pointer;
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
          transition:all 0.2s;
        "
        onmouseenter={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.22)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.45)'; e.currentTarget.style.transform='translateY(-1px)'; }}
        onmouseleave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; e.currentTarget.style.transform='translateY(0)'; }}
      >📂 Buka</button>
      <button onclick={handleSave} disabled={saveStatus === 'saving'}
        style="
          padding:0.55rem 0.9rem;
          border-radius:2rem;
          border:2px solid {saveStatus === 'saved' ? 'var(--color-safety-green)' : 'rgba(255,255,255,0.25)'};
          background:{saveStatus === 'saved' ? 'color-mix(in srgb, var(--color-safety-green) 30%, transparent)' : 'rgba(255,255,255,0.1)'};
          color:{saveStatus === 'saved' ? 'var(--color-safety-green)' : '#fff'};
          font-family:var(--font-display);
          font-weight:600;
          font-size:0.78rem;
          cursor:{saveStatus === 'saving' ? 'wait' : 'pointer'};
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
          transition:all 0.2s;
          opacity:{saveStatus === 'saving' ? '0.6' : '1'};
        "
      >
        {saveStatus === 'saving' ? '⏳ ...' : saveStatus === 'saved' ? '✅ Tersimpan!' : '💾 Simpan'}
      </button>
      <button onclick={handleClear}
        style="
          width:2.3rem;height:2.3rem;
          padding:0;
          border-radius:50%;
          border:2px solid rgba(255,255,255,0.25);
          background:rgba(255,255,255,0.1);
          color:#fff;
          font-size:0.9rem;
          cursor:pointer;
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
          transition:all 0.2s;
          display:flex;align-items:center;justify-content:center;
        "
        onmouseenter={(e) => { e.currentTarget.style.background='rgba(230,57,70,0.3)'; e.currentTarget.style.borderColor='var(--color-safety-red)'; }}
        onmouseleave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; }}
      >🗑️</button>
      <button onclick={handleExportCode}
        style="
          padding:0.55rem 0.9rem;
          border-radius:2rem;
          border:2px solid rgba(255,255,255,0.3);
          background:rgba(255,183,3,0.18);
          color:var(--color-safety-yellow);
          font-family:var(--font-display);
          font-weight:700;
          font-size:0.78rem;
          cursor:pointer;
          backdrop-filter:blur(6px);
          -webkit-backdrop-filter:blur(6px);
          transition:all 0.2s;
        "
        onmouseenter={(e) => { e.currentTarget.style.background='rgba(255,183,3,0.3)'; e.currentTarget.style.borderColor='var(--color-safety-yellow)'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(255,183,3,0.25)'; }}
        onmouseleave={(e) => { e.currentTarget.style.background='rgba(255,183,3,0.18)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
      >📥 .ino</button>
      <button onclick={handleRun} disabled={isRunning}
        style="
          padding:0.55rem 1.3rem;
          border-radius:2rem;
          border:none;
          background:{isRunning ? 'color-mix(in srgb, var(--color-safety-green) 50%, #999)' : 'linear-gradient(135deg, var(--color-safety-green), var(--color-ocean-wave))'};
          color:#fff;
          font-family:var(--font-display);
          font-weight:800;
          font-size:0.85rem;
          cursor:{isRunning ? 'wait' : 'pointer'};
          box-shadow:0 4px 18px {isRunning ? 'rgba(0,0,0,0.1)' : 'rgba(46,196,182,0.4)'};
          transition:all 0.2s;
          opacity:{isRunning ? '0.7' : '1'};
          letter-spacing:0.02em;
        "
        onmouseenter={isRunning ? null : (e) => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(46,196,182,0.5)'; e.currentTarget.style.filter='brightness(1.08)'; }}
        onmouseleave={isRunning ? null : (e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 18px rgba(46,196,182,0.4)'; e.currentTarget.style.filter='brightness(1)'; }}
      >
        {isRunning ? '⏳ Running...' : '▶️ Jalankan'}
      </button>
    </div>
  </div>

  <!-- Main Workshop Area -->
  <div class="flex-1 flex gap-4 min-h-0" style="overflow: hidden;">
    <!-- Blockly Canvas per active tab -->
    <div class="flex-1 min-w-0" style="position: relative; height: 100%;">
      {#each $allTabs as tab}
        <div style="display: {activeTabId === tab.id ? 'block' : 'none'}; width: 100%; height: 100%; position: absolute; top: 0; left: 0; right: 0; bottom: 0;">
          <BlocklyWorkspace
            bind:this={workspaceRefs[tab.id]}
            onCodeGenerated={(code) => handleCodeGenerated(code)}
          />
        </div>
      {/each}

      <!-- FLOATING SENSOR BOX — top-right of the canvas -->
      <div style="
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        width: 220px;
        border-radius: 1rem;
        padding: 0.85rem;
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 2px solid color-mix(in srgb, var(--color-ocean-foam) 50%, transparent);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        z-index: 10;
      ">
        <h3 style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--color-safety-orange); margin:0 0 0.2rem;">
          🎮 Simulasi Sensor
        </h3>
        <p style="font-size:0.58rem; color:var(--color-earth-brown); opacity:0.6; margin:0 0 0.6rem; line-height:1.3;">
          Atur nilai sebelum klik ▶️ Jalankan
        </p>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.63rem; font-weight:600; color:var(--color-earth-brown); margin-bottom:0.15rem;">
              <span>💧 Sensor Air</span><span style="color:var(--color-ocean-wave);">{simSensorValues.water}%</span>
            </div>
            <input type="range" min="0" max="100" value={simSensorValues.water}
              oninput={(e) => setSensorValue('water', parseInt(e.target.value))}
              style="width:100%; height:5px; accent-color:var(--color-ocean-wave); cursor:pointer;" />
            <div style="display:flex; justify-content:space-between; font-size:0.5rem; color:var(--color-earth-brown); opacity:0.4;">
              <span>Aman</span><span>Siaga</span><span>Bahaya</span>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.63rem; font-weight:600; color:var(--color-earth-brown); margin-bottom:0.15rem;">
              <span>📳 Sensor Getar</span><span style="color:var(--color-safety-yellow);">{simSensorValues.vibration}</span>
            </div>
            <input type="range" min="0" max="100" value={simSensorValues.vibration}
              oninput={(e) => setSensorValue('vibration', parseInt(e.target.value))}
              style="width:100%; height:5px; accent-color:var(--color-safety-yellow); cursor:pointer;" />
          </div>
          <button
            style="width:100%; padding:0.5rem; border-radius:0.6rem; border:2px solid var(--color-safety-red); background:{simSensorValues.button ? 'var(--color-safety-red)' : 'transparent'}; color:{simSensorValues.button ? '#fff' : 'var(--color-safety-red)'}; font-family:var(--font-display); font-weight:700; font-size:0.65rem; cursor:pointer; transition:all 0.15s;"
            onmousedown={() => setSensorValue('button', true)}
            onmouseup={() => setSensorValue('button', false)}
            onmouseleave={() => setSensorValue('button', false)}
          >
            🚨 {simSensorValues.button ? 'DITEKAN!' : 'Tahan untuk tekan'}
          </button>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: .ino (50%) + Output Log (50%) -->
    <div style="width:300px; flex-shrink:0; display:flex; flex-direction:column; gap:0.65rem; min-height:0;">

      <!-- 1. CODE PREVIEW (.ino) — 50% height -->
      <div style="flex:1; min-height:0; overflow-y:auto; border-radius:1rem; padding:0.85rem; background:#1D3557; display:flex; flex-direction:column;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem; flex-shrink:0;">
          <h3 style="font-family:var(--font-display); font-weight:700; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--color-ocean-foam); margin:0;">
            📝 Kode Arduino (.ino)
          </h3>
          <button onclick={handleExportCode} style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:var(--color-ocean-foam); cursor:pointer; font-size:0.68rem; padding:0.2rem 0.5rem; border-radius:0.35rem; transition:all 0.2s;"
            onmouseenter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onmouseleave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >📥 .ino</button>
        </div>
        {#if tabCodes[activeTabId] && !tabCodes[activeTabId].startsWith('// Seret blok')}
          <pre style="font-size:0.7rem; color:var(--color-ocean-foam); font-family:'Consolas','Courier New',monospace; white-space:pre-wrap; margin:0; line-height:1.45; opacity:0.9; flex:1; overflow-y:auto;">{tabCodes[activeTabId]}</pre>
        {:else}
          <div style="flex:1; display:flex; align-items:center; justify-content:center; text-align:center; padding:1rem;">
            <p style="font-size:0.75rem; color:var(--color-ocean-foam); opacity:0.35; margin:0; font-style:italic; line-height:1.5;">
              🧩 Seret blok dari toolbox ke canvas untuk melihat kode Arduino
            </p>
          </div>
        {/if}
      </div>

      <!-- 2. SIMULATION OUTPUT LOG — 50% height -->
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; border-radius:1rem; overflow:hidden; background:#1D3557; box-shadow:0 4px 16px rgba(0,0,0,0.1);">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.7rem 1rem; background:rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.08); flex-shrink:0;">
          <h3 style="font-family:var(--font-display); font-weight:700; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--color-ocean-foam); margin:0;">
            📟 Output Simulasi
          </h3>
          <span style="font-size:0.65rem; color:var(--color-ocean-foam); opacity:0.5;">{simLog.length} langkah</span>
        </div>
        <div style="flex:1; overflow-y:auto; padding:0.5rem; min-height:0;">
          {#if simLog.length === 0}
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.4; text-align:center; padding:1rem;">
              <div style="font-size:2rem; margin-bottom:0.5rem;">▶️</div>
              <p style="font-size:0.75rem; color:var(--color-ocean-foam); margin:0;">Susun blok lalu klik <strong style="color:var(--color-safety-green);">▶️ Jalankan</strong></p>
              <p style="font-size:0.65rem; color:var(--color-ocean-foam); margin:0.3rem 0 0; opacity:0.6;">Output simulasi akan muncul di sini</p>
            </div>
          {:else}
            {#each simLog as entry}
              {@const colors = { led: '#FFC107', buzzer: '#FF6B35', sensor: '#A8DADC', servo: '#2EC4B6', lcd: '#FFD60A', error: '#E63946', info: '#457B9D' }}
              <div style="padding:0.3rem 0.5rem; margin-bottom:0.15rem; border-radius:0.4rem; font-size:0.68rem; font-family:'Courier New',monospace; color:{colors[entry.type] || '#A8DADC'}; background:rgba(255,255,255,0.03); border-left:3px solid {colors[entry.type] || '#A8DADC'}; line-height:1.4;">
                {entry.msg}
              </div>
            {/each}
          {/if}
        </div>
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
