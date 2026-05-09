# RESQ-BOX 🦉

> **Gamified STEM Disaster Education Desktop App**
>
> Drag-and-drop block coding → virtual Arduino simulator → gamified disaster mitigation quests.
> Built with Electron + SvelteKit + Google Blockly.

---

## 🚀 How to Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) **v18+** (LTS recommended)
- npm (comes with Node.js)
- Git (optional, for cloning)

### Quick Start

```bash
# 1. Navigate to the project
cd resq-box

# 2. Install dependencies
npm install

# 3. Start dev mode (Vite + Electron)
npm run dev
```

That's it! An Electron window will open with the RESQ-BOX app running in hot-reload dev mode.

### Available Scripts

| Command | What It Does |
|---|---|
| `npm run dev` | Start Vite dev server + Electron (hot reload) |
| `npm run build` | Build SvelteKit frontend to `dist/` |
| `npm run preview` | Preview the built static site in browser |
| `npm run package` | Build + package into Windows `.exe` installer |
| `npm run package:win` | Build + package Windows-only |

### Project Structure

```
resq-box/
├── electron/
│   ├── main.cjs              ← Electron main process
│   └── preload.cjs           ← IPC bridge (serial, file system)
├── src/
│   ├── routes/
│   │   ├── +layout.svelte    ← App shell (sidebar, Siaga owl, lang toggle)
│   │   ├── +page.svelte      ← Home dashboard
│   │   ├── workshop/         ← Blockly coding workspace
│   │   ├── simulator/        ← Virtual Arduino simulator
│   │   └── quests/           ← Quest board & progress
│   ├── lib/
│   │   ├── blockly/          ← Custom Blockly blocks & code generators
│   │   ├── simulator/        ← Canvas simulator engine & components
│   │   ├── quests/           ← Quest definitions & validation
│   │   ├── stores/           ← Svelte stores (project, gamification, settings)
│   │   └── i18n/             ← Bahasa Indonesia & English translations
│   └── app.css               ← Tailwind + playful theme
├── static/mascot/            ← Siaga the Owl SVG assets
├── package.json
├── vite.config.js
├── svelte.config.js
├── tailwind.config.js
└── electron-builder.yml
```

---

## 🎮 Features (Planned)

| Phase | Feature | Status |
|---|---|---|
| 1 | Electron + SvelteKit scaffold, Tailwind theme, 4 pages | ✅ Done |
| 2 | Google Blockly integration — drag & drop Arduino blocks | 🧩 Next |
| 3 | Canvas-based virtual Arduino simulator with animations | ⏳ |
| 4 | Gamification — 5 quest levels, XP, badges, progress | ⏳ |
| 5 | Real Arduino USB connection via serialport | ⏳ |
| 6 | Bilingual content (ID/EN), disaster scenarios, onboarding | ⏳ |
| 7 | Polish, animations, sound, `.exe` installer | ⏳ |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Desktop Shell | Electron |
| Frontend | SvelteKit + Svelte 5 |
| Block Coding | Google Blockly |
| Styling | Tailwind CSS 4 |
| Simulator | Canvas API |
| Arduino Upload | serialport npm → avrdude |
| Storage | IndexedDB / localStorage |
| Language | i18n (Bahasa Indonesia + English) |
| Packaging | electron-builder |

---

## 🦉 Siaga the Owl

Siaga (meaning "alert/prepared" in Indonesian) is the app's friendly mascot — a geometric SVG owl who guides kids through missions, gives hints when they're stuck, and celebrates their successes.