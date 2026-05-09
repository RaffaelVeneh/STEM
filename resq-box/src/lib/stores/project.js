import { writable } from 'svelte/store';

// Current Blockly workspace state (JSON)
export const workspaceData = writable(null);

// Project metadata
export const projectMeta = writable({
  name: 'Proyek Baru',
  lastSaved: null,
  questId: null, // If opened from a quest
});

// Generated Arduino C code
export const generatedCode = writable('');

// Simulator state
export const simRunning = writable(false);
export const simSpeed = writable(1);
