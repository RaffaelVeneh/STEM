import { writable } from 'svelte/store';

// Language: 'id' | 'en'
export const language = writable('id');

// Sound effects: on/off
export const soundEnabled = writable(true);

// Arduino mode: 'simulation' | 'hardware'
export const arduinoMode = writable('simulation');

// Hardware connection status
export const hardwareStatus = writable({
  connected: false,
  port: null,
  boardType: null,
});
