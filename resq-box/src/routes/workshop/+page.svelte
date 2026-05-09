<script>
  import { onMount } from 'svelte';

  let blocklyReady = false;
  let generatedCode = '';
  let blocklyWorkspace = null;

  onMount(() => {
    // Phase 2: Blockly integration will go here
    // For now: placeholder UI
    blocklyReady = false;
  });

  function handleRunSimulation() {
    // Phase 3: Wire up to simulator
    console.log('Run simulation clicked');
  }
</script>

<svelte:head>
  <title>RESQ-BOX — Workshop</title>
</svelte:head>

<div class="h-full flex flex-col space-y-4">
  <!-- Toolbar -->
  <div class="flex items-center justify-between">
    <h2 class="font-display font-bold text-2xl text-ocean-deep">🧩 Workshop Coding</h2>
    <div class="flex gap-3">
      <button class="btn-ghost text-sm" disabled>📂 Buka Proyek</button>
      <button class="btn-ghost text-sm" disabled>💾 Simpan</button>
      <button class="btn-play text-sm" onclick={handleRunSimulation}>
        ▶️ Jalankan
      </button>
    </div>
  </div>

  <!-- Main Workshop Area -->
  <div class="flex-1 flex gap-4 min-h-0">
    <!-- Blockly Toolbox (left sidebar) -->
    <div class="w-56 shrink-0 bg-white rounded-2xl border-2 border-ocean-foam/20 p-3 overflow-y-auto">
      <h3 class="font-display font-semibold text-sm text-earth-brown/60 mb-3 uppercase tracking-wide">
        Blok Sensor
      </h3>
      <div class="space-y-2">
        <div class="p-2 rounded-lg bg-ocean-foam/30 text-sm font-medium text-ocean-deep cursor-grab hover:bg-ocean-foam/50 transition-colors">
          💧 Sensor Air
        </div>
        <div class="p-2 rounded-lg bg-safety-yellow/20 text-sm font-medium text-earth-brown cursor-grab hover:bg-safety-yellow/30 transition-colors">
          📳 Sensor Getar
        </div>
        <div class="p-2 rounded-lg bg-safety-red/10 text-sm font-medium text-safety-red cursor-grab hover:bg-safety-red/20 transition-colors">
          🚨 Tombol Darurat
        </div>
      </div>

      <h3 class="font-display font-semibold text-sm text-earth-brown/60 mb-3 mt-5 uppercase tracking-wide">
        Blok Output
      </h3>
      <div class="space-y-2">
        <div class="p-2 rounded-lg bg-safety-green/20 text-sm font-medium text-safety-green cursor-grab hover:bg-safety-green/30 transition-colors">
          💡 LED
        </div>
        <div class="p-2 rounded-lg bg-safety-orange/20 text-sm font-medium text-safety-orange cursor-grab hover:bg-safety-orange/30 transition-colors">
          🔊 Buzzer
        </div>
        <div class="p-2 rounded-lg bg-ocean-wave/20 text-sm font-medium text-ocean-wave cursor-grab hover:bg-ocean-wave/30 transition-colors">
          ⚙️ Servo
        </div>
        <div class="p-2 rounded-lg bg-earth-sand/30 text-sm font-medium text-earth-brown cursor-grab hover:bg-earth-sand/50 transition-colors">
          📟 LCD
        </div>
      </div>

      <h3 class="font-display font-semibold text-sm text-earth-brown/60 mb-3 mt-5 uppercase tracking-wide">
        Blok Kontrol
      </h3>
      <div class="space-y-2">
        <div class="p-2 rounded-lg bg-white border-2 border-ocean-foam/50 text-sm font-medium text-ocean-deep cursor-grab hover:border-safety-yellow/50 transition-colors">
          🔄 Jika-Maka
        </div>
        <div class="p-2 rounded-lg bg-white border-2 border-ocean-foam/50 text-sm font-medium text-ocean-deep cursor-grab hover:border-safety-yellow/50 transition-colors">
          🔁 Ulangi
        </div>
        <div class="p-2 rounded-lg bg-white border-2 border-ocean-foam/50 text-sm font-medium text-ocean-deep cursor-grab hover:border-safety-yellow/50 transition-colors">
          ⏱️ Tunggu
        </div>
      </div>
    </div>

    <!-- Blockly Canvas (center) -->
    <div class="flex-1 bg-white rounded-2xl border-2 border-dashed border-ocean-foam/50 flex items-center justify-center">
      {#if !blocklyReady}
        <div class="text-center text-earth-brown/40">
          <div class="text-6xl mb-4">🧩</div>
          <p class="font-display font-semibold text-xl">Seret blok ke sini!</p>
          <p class="text-sm mt-1">Blockly akan dimuat di sini (Phase 2)</p>
        </div>
      {/if}
    </div>

    <!-- Code Preview (right panel) -->
    <div class="w-72 shrink-0 bg-ocean-deep rounded-2xl p-4 overflow-y-auto">
      <h3 class="font-display font-semibold text-sm text-ocean-foam mb-3 uppercase tracking-wide flex items-center gap-2">
        📝 Kode Arduino
      </h3>
      {#if generatedCode}
        <pre class="text-xs text-ocean-foam font-mono whitespace-pre-wrap">{generatedCode}</pre>
      {:else}
        <div class="text-ocean-foam/40 text-sm text-center mt-8">
          <p>Kode C akan muncul di sini setelah blok disusun</p>
        </div>
      {/if}
    </div>
  </div>
</div>
