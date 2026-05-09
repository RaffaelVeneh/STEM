<script>
  import { onMount } from 'svelte';

  let simRunning = false;
  let simSpeed = 1;

  onMount(() => {
    // Phase 3: Canvas simulator will initialize here
  });

  function toggleSimulation() {
    simRunning = !simRunning;
  }

  function resetSimulation() {
    simRunning = false;
  }
</script>

<svelte:head>
  <title>RESQ-BOX — Simulator</title>
</svelte:head>

<div class="h-full flex flex-col space-y-4">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h2 class="font-display font-bold text-2xl text-ocean-deep">🔌 Simulator Arduino</h2>
    <div class="flex items-center gap-3">
      <!-- Speed control -->
      <div class="flex items-center gap-2 text-sm text-earth-brown/70">
        <span>🐢</span>
        <input type="range" min="0.5" max="3" step="0.5" bind:value={simSpeed}
               class="w-20 accent-safety-orange" />
        <span>🐇</span>
      </div>
      <!-- Controls -->
      <button class="btn-play" onclick={toggleSimulation}>
        {simRunning ? '⏸️ Jeda' : '▶️ Jalankan'}
      </button>
      <button class="btn-ghost text-sm" onclick={resetSimulation}>
        🔄 Reset
      </button>
    </div>
  </div>

  <!-- Simulator Area -->
  <div class="flex-1 flex gap-4 min-h-0">
    <!-- Arduino Board Canvas -->
    <div class="flex-1 bg-white rounded-2xl border-2 border-ocean-foam/20 flex items-center justify-center relative overflow-hidden">
      <!-- Placeholder Arduino Board -->
      <div class="text-center">
        <div class="w-[500px] h-[300px] bg-[#00878F] rounded-3xl mx-auto relative shadow-xl
                    border-4 border-[#006B70] flex items-center justify-center">
          <!-- Board details -->
          <div class="absolute top-4 left-4 right-4 flex justify-between text-white/60 text-xs font-mono">
            <span>DIGITAL (PWM~)</span>
            <span>ARDUINO UNO</span>
          </div>

          <!-- Pin headers (left) -->
          <div class="absolute left-4 top-12 bottom-12 flex flex-col gap-1">
            {#each Array(14) as _, i}
              <div class="w-6 h-2 rounded-full {i < 6 ? 'bg-safety-yellow' : 'bg-white/30'}"></div>
            {/each}
          </div>

          <!-- Breadboard area -->
          <div class="w-[280px] h-[180px] bg-[#F5DEB3] rounded-lg border-2 border-[#D4A574]
                      flex items-center justify-center gap-4 flex-wrap p-4">
            <!-- Simulated components (placeholder) -->
            <div class="w-8 h-8 rounded-full bg-safety-red/30 border-2 border-safety-red flex items-center justify-center text-xs"
                 title="LED Merah">
              💡
            </div>
            <div class="w-8 h-8 rounded-full bg-safety-yellow/30 border-2 border-safety-yellow flex items-center justify-center text-xs"
                 title="LED Kuning">
              💡
            </div>
            <div class="w-10 h-10 rounded-lg bg-ocean-wave/20 border-2 border-ocean-wave flex items-center justify-center text-xs"
                 title="Buzzer">
              🔊
            </div>
            <div class="w-12 h-8 rounded bg-safety-orange/20 border-2 border-safety-orange flex items-center justify-center text-xs"
                 title="Sensor Air">
              💧
            </div>
            <div class="w-10 h-10 rounded-full bg-earth-sand/20 border-2 border-earth-sand flex items-center justify-center text-xs"
                 title="Servo">
              ⚙️
            </div>
          </div>

          <!-- Pin headers (right) -->
          <div class="absolute right-4 top-12 bottom-12 flex flex-col gap-1">
            {#each Array(6) as _, i}
              <div class="w-6 h-2 rounded-full bg-ocean-foam/50"></div>
            {/each}
          </div>

          <div class="absolute bottom-4 left-4 right-4 text-center text-white/40 text-xs font-mono">
            RESQ-BOX Virtual Arduino v1.0 — Simulasi
          </div>
        </div>

        <p class="mt-4 text-earth-brown/60 text-sm">
          Simulator penuh dengan animasi akan hadir di Phase 3 ✨
        </p>
      </div>

      <!-- Status indicator -->
      <div class="absolute top-4 right-4 flex items-center gap-2">
        <div class="w-3 h-3 rounded-full {simRunning ? 'bg-safety-green animate-pulse' : 'bg-earth-brown/30'}"></div>
        <span class="text-xs text-earth-brown/60">{simRunning ? 'Running' : 'Idle'}</span>
      </div>
    </div>

    <!-- Sensor Monitor (right panel) -->
    <div class="w-56 shrink-0 space-y-3">
      <div class="card p-4">
        <h3 class="font-display font-semibold text-sm text-earth-brown/60 mb-3">📊 Monitor Sensor</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs text-earth-brown/70 mb-1">
              <span>💧 Sensor Air</span>
              <span>0%</span>
            </div>
            <div class="h-2 rounded-full bg-ocean-foam overflow-hidden">
              <div class="h-full rounded-full bg-ocean-wave" style="width:0%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs text-earth-brown/70 mb-1">
              <span>📳 Sensor Getar</span>
              <span>0</span>
            </div>
            <div class="h-2 rounded-full bg-ocean-foam overflow-hidden">
              <div class="h-full rounded-full bg-safety-yellow" style="width:0%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs text-earth-brown/70 mb-1">
              <span>🚨 Tombol Darurat</span>
              <span>OFF</span>
            </div>
            <div class="h-2 rounded-full bg-ocean-foam overflow-hidden">
              <div class="h-full rounded-full bg-safety-red" style="width:0%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <h3 class="font-display font-semibold text-sm text-earth-brown/60 mb-3">🔧 Output Status</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>💡 LED</span>
            <span class="text-earth-brown/40">OFF</span>
          </div>
          <div class="flex justify-between">
            <span>🔊 Buzzer</span>
            <span class="text-earth-brown/40">OFF</span>
          </div>
          <div class="flex justify-between">
            <span>⚙️ Servo</span>
            <span class="text-earth-brown/40">0°</span>
          </div>
          <div class="flex justify-between">
            <span>📟 LCD</span>
            <span class="text-earth-brown/40">-</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
