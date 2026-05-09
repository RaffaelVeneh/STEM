# RESQ-BOX — Gamified STEM Disaster Education Desktop App

> **TL;DR:** Electron + Svelte + Google Blockly desktop app. Drag-and-drop block coding → virtual Arduino simulator with animated components → gamified disaster quests (Level 1: earthquake alarm → Final: smart resilient village). Offline-capable, bilingual (ID/EN), playful UI with "Siaga" the owl mascot.

---

## 🛠️ Tech Stack (Finalized)

| Layer | Technology | Why |
|---|---|---|
| **Desktop Shell** | **Electron** | Battle-tested `serialport` npm for Arduino USB; consistent Chromium on all Windows builds |
| **Frontend** | **SvelteKit** | Compiles to vanilla JS, lightweight, fast |
| **Block Coding** | **Google Blockly** | Same engine as Scratch; custom Arduino blocks |
| **Styling** | **Tailwind CSS** | Playful theme with kid-friendly design tokens |
| **Simulator** | **Canvas API** | Animated Arduino board with LED/buzzer/sensor components |
| **Hardware Upload** | **`serialport` npm** → Arduino CLI / avrdude | Phased: (1) export .ino → open in Arduino IDE, (2) bundle avrdude for direct upload |
| **Offline Storage** | **IndexedDB** / **localStorage** | Quest progress, project saves, settings |
| **Mascot** | **"Siaga" the Owl** 🦉 | SVG mascot for guidance, hints, and celebrations |
| **Language** | **i18n**: Bahasa Indonesia + English | Full bilingual toggle |

---

## 🧱 Architecture

```
┌─────────────────────────────────────────────────┐
│                   ELECTRON SHELL                 │
│  ┌───────────────────────────────────────────┐  │
│  │             SVELTE FRONTEND               │  │
│  │  ┌──────────┐  ┌──────────────────┐       │  │
│  │  │  BLOCKLY  │──│    SIMULATOR     │       │  │
│  │  │  (blocks) │  │ (Canvas anims)   │       │  │
│  │  └────┬─────┘  └──────────────────┘       │  │
│  │       │                                    │  │
│  │  ┌────▼─────┐  ┌──────────────────┐       │  │
│  │  │ Arduino C│  │   GAMIFICATION   │       │  │
│  │  │ Generator│  │  (quests/badges) │       │  │
│  │  └────┬─────┘  └──────────────────┘       │  │
│  └───────┼───────────────────────────────────┘  │
│          │                                       │
│  ┌───────▼──────────┐                            │
│  │  SERIALPORT NPM  │ → Real Arduino (optional)  │
│  └──────────────────┘                            │
└─────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Blockly blocks** → JavaScript interpreter → Simulator state → Canvas render
2. **Blockly blocks** → Arduino C code generator → `.ino` file → Serial upload (real hardware)
3. **Quest progress** → IndexedDB → Gamification UI (XP, badges, levels)

---

## 📋 Implementation Phases (7 Phases)

### Phase 1: Project Foundation

| # | Step | Details |
|---|---|---|
| 1.1 | Scaffold Electron + SvelteKit | `electron-vite` or manual Electron + Vite + Svelte setup |
| 1.2 | Install & configure Tailwind CSS | Playful theme: rounded-xl, bright palette, kid-friendly font (Nunito/Fredoka) |
| 1.3 | Folder structure | `src/lib/components/`, `stores/`, `blockly/`, `simulator/`, `quests/`, `i18n/` |
| 1.4 | Base layout | Sidebar nav (Workshop / Simulator / Quests / Settings) + mascot area + main content |
| 1.5 | SvelteKit routes | `/` dashboard, `/workshop`, `/simulator`, `/quests` |
| 1.6 | Electron main process | Window config, menu, IPC setup, serialport preload |

### Phase 2: Blockly Integration (Core)

| # | Step | Details |
|---|---|---|
| 2.1 | Integrate Blockly | Wrap in `BlocklyWorkspace.svelte`, lifecycle via `onMount`/`onDestroy` |
| 2.2 | Custom Arduino blocks | Water sensor, vibration sensor, LED, buzzer, servo, LCD, emergency button |
| 2.3 | Arduino C code generator | Blockly → valid Arduino C code (`.ino`) |
| 2.4 | JavaScript interpreter | Blockly → JS execution for simulator |
| 2.5 | Toolbox config | Block categories: Sensors, Outputs, Control, Disaster — color-coded |
| 2.6 | Workspace management | Save/Load/Reset as JSON → IndexedDB |
| 2.7 | Code preview panel | Split-pane: blocks left, generated C code right |

### Phase 3: Virtual Arduino Simulator

| # | Step | Details |
|---|---|---|
| 3.1 | Canvas Arduino board | Draw Uno board + breadboard area |
| 3.2 | Animated components | `LED.js`, `Buzzer.js`, `WaterSensor.js`, `VibrationSensor.js`, `Servo.js`, `LCD.js`, `EmergencyButton.js` |
| 3.3 | Simulator engine | Read interpreter output → update component states → animation loop |
| 3.4 | Blockly → Simulator wire-up | "Run" button: compile → execute → render |
| 3.5 | Pre-built scenario boards | Flood, earthquake, landslide, tsunami board layouts |
| 3.6 | Simulator controls | Play / Pause / Stop / Reset / Speed slider / Step-through |

### Phase 4: Gamification System

| # | Step | Details |
|---|---|---|
| 4.1 | Quest data model | id, title, description, required blocks, success criteria, hints, XP, badge |
| 4.2 | Level 1: **"Gempa!"** | Vibration sensor → LED + buzzer alarm |
| 4.3 | Level 2: **"Jalur Evakuasi"** | Emergency button → auto evacuation light pattern |
| 4.4 | Level 3: **"Banjir Terdeteksi"** | Water sensor threshold → buzzer warning |
| 4.5 | Level 4: **"Sistem Peringatan Dini"** | Multi-sensor → LCD + buzzer SOS pattern |
| 4.6 | Final: **"Desa Tangguh"** | All components → smart disaster-resilient village |
| 4.7 | Quest UI | Mission cards (locked/unlocked/completed), XP bar, difficulty stars |
| 4.8 | Badge system | Speed, efficiency, creativity, all-disaster-type badges |
| 4.9 | Progress persistence | IndexedDB: quest progress, XP, unlocked levels |
| 4.10 | Validation engine | Check if blocks + behavior match success criteria |

### Phase 5: Real Arduino Connection

| # | Step | Details |
|---|---|---|
| 5.1 | Integrate `serialport` npm | Via Electron preload/IPC for Arduino COM port detection |
| 5.2 | Board detection | Auto-detect Arduino on USB, show connection status indicator |
| 5.3 | **MVP: Export .ino** | Save `.ino` file → one-click "Open in Arduino IDE" button |
| 5.4 | **v1.5: Bundle avrdude** | Direct upload from app (~5 MB, no Arduino CLI needed) |
| 5.5 | **v2: Optional Arduino CLI** | Prompt download on first hardware use (~200 MB) |
| 5.6 | Serial monitor | Read/write serial data for debugging |
| 5.7 | Mode toggle | Switch between "Simulation" ↔ "Hardware" mode |

### Phase 6: Content & Localization

| # | Step | Details |
|---|---|---|
| 6.1 | Bilingual system | `src/lib/i18n/id.js` + `en.js`, language toggle in settings |
| 6.2 | Disaster scenario stories | Merapi, Jakarta flood, Padang earthquake, Palu tsunami, Banjarnegara landslide |
| 6.3 | Onboarding tutorial | "Siaga" owl guides first launch, walks through first quest |
| 6.4 | Comic mitigation guides | Illustrated SVG/PDF panels explaining preparedness |
| 6.5 | Jobsheet integration | Printable worksheet templates for teachers |

### Phase 7: Polish & Distribution

| # | Step | Details |
|---|---|---|
| 7.1 | UI animations | Page transitions, confetti on quest complete, mascot reactions, micro-interactions |
| 7.2 | Sound effects | Optional toggle: correct/wrong beeps, level complete celebration |
| 7.3 | Perf optimization | Test on 4 GB RAM Windows, optimize Canvas, lazy-load routes |
| 7.4 | Electron builder | `.exe` / `.msi` installer, app icon, auto-updater |
| 7.5 | Offline testing | Zero network calls, all assets bundled, IndexedDB works offline |
| 7.6 | Beta testing | All 5 quests, simulator accuracy, real Arduino upload, language switch |

---

## 📁 Project Structure

```
resq-box/
├── electron/
│   ├── main.js                    ← Electron main process
│   ├── preload.js                 ← IPC bridge (serialport, file system)
│   └── menu.js                    ← App menu config
├── src/
│   ├── lib/
│   │   ├── blockly/
│   │   │   ├── blocks/
│   │   │   │   └── customBlocks.js      ← Arduino sensor/output blocks
│   │   │   ├── generators/
│   │   │   │   └── arduino.js           ← Blockly → Arduino C code
│   │   │   ├── interpreter.js            ← Blockly → JS (for simulator)
│   │   │   └── toolbox.js               ← Block categories & colors
│   │   ├── simulator/
│   │   │   ├── engine.js                 ← Simulation loop
│   │   │   ├── ArduinoBoard.js           ← Canvas board renderer
│   │   │   └── components/
│   │   │       ├── LED.js
│   │   │       ├── Buzzer.js
│   │   │       ├── WaterSensor.js
│   │   │       ├── VibrationSensor.js
│   │   │       ├── Servo.js
│   │   │       ├── LCD.js
│   │   │       └── EmergencyButton.js
│   │   ├── quests/
│   │   │   ├── definitions.js            ← All 5+ quest data
│   │   │   └── progress.js              ← Validation & tracking
│   │   ├── stores/
│   │   │   ├── project.js               ← Current workspace state
│   │   │   ├── gamification.js          ← XP, levels, badges
│   │   │   └── settings.js              ← Language, sound, mode
│   │   └── i18n/
│   │       ├── id.js                    ← Bahasa Indonesia
│   │       └── en.js                    ← English
│   ├── routes/
│   │   ├── +layout.svelte               ← App shell (sidebar, mascot, theme)
│   │   ├── +page.svelte                 ← Home dashboard
│   │   ├── workshop/
│   │   │   └── +page.svelte             ← Blockly workspace + code preview
│   │   ├── simulator/
│   │   │   └── +page.svelte             ← Full simulator view
│   │   └── quests/
│   │       └── +page.svelte             ← Quest browser
│   ├── app.html
│   └── app.css
├── static/
│   └── mascot/                          ← Siaga the Owl SVG assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── electron-builder.yml
```

---

## ✅ Verification Checklist

- [ ] `npm run dev` — Electron window opens, sidebar nav works, playful theme visible
- [ ] Drag block from toolbox → snaps into workspace → "Generate Code" outputs valid Arduino C
- [ ] Click "Run" → simulator canvas animates (LED glows, buzzer ripples, sensor reacts)
- [ ] Complete Level 1 quest → XP increases, Level 2 unlocks, badge earned, survives app restart
- [ ] Plug Arduino USB → detected in app → `.ino` file exported → opens in Arduino IDE
- [ ] Toggle Bahasa Indonesia ↔ English → all UI text switches
- [ ] Install from `.exe` on clean Windows → runs offline, all features work

---

## 🔑 Key Decisions

| Decision | Rationale |
|---|---|
| **Electron** over Tauri | `serialport` npm is battle-tested (used by Arduino IDE itself). Serial reliability is critical for hardware connection. |
| **Svelte** over React | Lighter compile output, faster on school laptops, simpler mental model |
| **Google Blockly** over custom | Same engine as Scratch. Building block coding from scratch = ~6 months saved |
| **Phased Arduino upload** | MVP: export `.ino` → open in Arduino IDE. v1.5: bundle avrdude. v2: optional Arduino CLI |
| **Simulation-first** | Full learning value without hardware. Hardware enhances, doesn't gate |
| **"Siaga" the Owl mascot** | Friendly SVG guide. "Siaga" = "alert/prepared" in Indonesian. Geometric SVG, easy to animate |
| **Teacher dashboard (v2)** | Data model designed for multi-user. MVP ships student-only |
| **Windows MVP** | `.exe`/`.msi` only. Linux/macOS can follow |
| **Target: tech-ready schools** | Schools with existing tech access and knowledge |

---

## ⚠️ Open Considerations

1. **Arduino CLI bundling** (~200 MB) — skip for MVP. Export `.ino` → open in Arduino IDE. Bundle lightweight `avrdude` (~5 MB) in v1.5 for direct upload.
2. **Mascot design** — "Siaga" geometric SVG owl. Code-able without a designer. Can upgrade artwork later.
3. **Teacher dashboard** — out of scope for MVP. Design student progress data model to support future multi-profile teacher view.
4. **Electron auto-update** — configure `electron-updater` for seamless updates once distributed.
