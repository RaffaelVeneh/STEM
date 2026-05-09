<script>
  import { fly } from 'svelte/transition';
  import SimulatorCanvas from '$lib/components/SimulatorCanvas.svelte';
  import { interpretWorkspace } from '$lib/blockly/interpreter.js';
  import { loadProject } from '$lib/stores/db.js';

  let board = $state(null);
  let isRunning = $state(false);
  let waterLevel = $state(45);
  let vibrationLevel = $state(25);
  let simStatus = $state('Idle');

  // Live statuses
  let ledStatus = $state({ red: 'OFF', yellow: 'OFF', green: 'OFF' });
  let buzzerStatus = $state('OFF');
  let servoAngle = $state(90);
  let lcdText = $state('');

  function handleBoardReady(b) {
    board = b;
    // Start polling component statuses
    pollStatus();
  }

  function pollStatus() {
    if (!board) return;
    const b = board;
    ledStatus = {
      red: b.components.ledRed.status,
      yellow: b.components.ledYellow.status,
      green: b.components.ledGreen.status,
    };
    buzzerStatus = b.components.buzzer.status;
    servoAngle = parseInt(b.components.servo.status);
    lcdText = b.components.lcd.status;
    waterLevel = b.components.waterSensor.read();
    vibrationLevel = b.components.vibrationSensor.read();
    setTimeout(pollStatus, 200);
  }

  async function handleRunWorkshop() {
    if (!board || isRunning) return;
    isRunning = true;
    simStatus = 'Running...';
    try {
      const project = await loadProject('workspace-main');
      if (!project?.xml) {
        simStatus = 'No saved workspace! Go to Workshop first.';
        isRunning = false;
        return;
      }
      // Parse XML and create temp workspace
      const Blockly = await import('blockly');
      const ws = new Blockly.Workspace();
      const xml = Blockly.utils.xml.textToDom(project.xml);
      Blockly.Xml.domToWorkspace(xml, ws);
      const simCtx = board.getSimContext();
      await interpretWorkspace(ws, simCtx);
      simStatus = 'Simulation complete ✅';
    } catch (e) {
      console.error('Sim error:', e);
      simStatus = 'Error ❌';
    } finally {
      isRunning = false;
    }
  }

  function handleReset() {
    if (board) board.reset();
    simStatus = 'Reset';
  }

  function handleWaterChange(e) {
    const val = parseInt(e.target.value);
    waterLevel = val;
    if (board) board.setWaterLevel(val);
  }

  function handleVibrationChange(e) {
    const val = parseInt(e.target.value);
    vibrationLevel = val;
    if (board) board.setVibrationIntensity(val);
  }

  function handlePressButton() {
    if (board) board.pressButton();
  }

  function handleReleaseButton() {
    if (board) board.releaseButton();
  }
</script>

<svelte:head>
  <title>RESQ-BOX — Simulator</title>
</svelte:head>

<div class="h-full flex flex-col space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- Header -->
  <div class="flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <h2 class="font-display font-bold text-2xl text-ocean-deep">🔌 Simulator Arduino</h2>
      <span class="badge badge-xp text-xs">{simStatus}</span>
    </div>
    <div class="flex gap-2">
      <button class="btn-play text-sm" onclick={handleRunWorkshop} disabled={isRunning}>
        {isRunning ? '⏳ Running...' : '▶️ Run Workshop Code'}
      </button>
      <button class="btn-ghost text-sm" onclick={handleReset}>
        🔄 Reset
      </button>
    </div>
  </div>

  <!-- Simulator Area -->
  <div class="flex-1 flex gap-4 min-h-0">
    <!-- Arduino Board Canvas -->
    <div class="flex-1 min-w-0 rounded-2xl overflow-hidden border-2 border-ocean-foam/20 bg-white relative">
      <SimulatorCanvas onBoardReady={handleBoardReady} />
    </div>

    <!-- Control Panels (right) -->
    <div class="w-60 shrink-0 space-y-3 overflow-y-auto">
      <!-- Sensor Controls -->
      <div class="card p-4">
        <h3 class="font-display font-semibold text-sm text-safety-orange mb-3">🎮 Kontrol Sensor</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs text-earth-brown/70 mb-1">
              <span>💧 Air</span>
              <span>{waterLevel}%</span>
            </div>
            <input type="range" min="0" max="100" value={waterLevel}
                   oninput={handleWaterChange}
                   class="w-full accent-ocean-wave h-2 rounded-full" />
          </div>
          <div>
            <div class="flex justify-between text-xs text-earth-brown/70 mb-1">
              <span>📳 Getaran</span>
              <span>{vibrationLevel}</span>
            </div>
            <input type="range" min="0" max="100" value={vibrationLevel}
                   oninput={handleVibrationChange}
                   class="w-full accent-safety-yellow h-2 rounded-full" />
          </div>
          <div class="flex gap-2">
            <button class="btn-danger text-xs flex-1" onmousedown={handlePressButton} onmouseup={handleReleaseButton}>
              🚨 Tekan Tombol
            </button>
          </div>
        </div>
      </div>

      <!-- Output Status -->
      <div class="card p-4">
        <h3 class="font-display font-semibold text-sm text-safety-green mb-3">🔧 Status Output</h3>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center">
            <span>🔴 LED Merah</span>
            <span class="font-mono {ledStatus.red === 'ON' ? 'text-safety-red font-bold' : 'text-earth-brown/40'}">{ledStatus.red}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>🟡 LED Kuning</span>
            <span class="font-mono {ledStatus.yellow === 'ON' ? 'text-safety-yellow font-bold' : 'text-earth-brown/40'}">{ledStatus.yellow}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>🟢 LED Hijau</span>
            <span class="font-mono {ledStatus.green === 'ON' ? 'text-safety-green font-bold' : 'text-earth-brown/40'}">{ledStatus.green}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>🔊 Buzzer</span>
            <span class="font-mono {buzzerStatus.startsWith('ON') ? 'text-safety-orange font-bold' : 'text-earth-brown/40'}">{buzzerStatus}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>⚙️ Servo</span>
            <span class="font-mono text-ocean-wave">{servoAngle}°</span>
          </div>
          <div class="flex justify-between items-center">
            <span>📟 LCD</span>
            <span class="font-mono text-xs text-earth-brown truncate max-w-[100px]">{lcdText}</span>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div class="card p-4">
        <h4 class="font-display font-semibold text-xs text-earth-brown/60 mb-2">💡 Cara Pakai</h4>
        <ol class="text-xs text-earth-brown/70 space-y-1 list-decimal pl-3">
          <li>Buka <strong>Workshop</strong>, susun blok, lalu <strong>Simpan</strong></li>
          <li>Kembali ke Simulator</li>
          <li>Klik <strong>Run Workshop Code</strong></li>
          <li>Atau gerakkan slider untuk uji manual!</li>
        </ol>
      </div>
    </div>
  </div>
</div>
