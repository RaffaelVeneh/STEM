import { writable, derived } from 'svelte/store';

// Player progress
export const xp = writable(0);
export const level = writable(1);
export const badges = writable([]);

// Quest completion status: { 1: 'completed', 2: 'available', 3: 'locked', ... }
export const questStatus = writable({
  1: 'available',
  2: 'locked',
  3: 'locked',
  4: 'locked',
  5: 'locked',
});

// XP needed per level
const XP_PER_LEVEL = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
};

export const xpToNextLevel = derived([xp, level], ([$xp, $level]) => {
  const nextLevelXp = XP_PER_LEVEL[Math.min($level + 1, 5)] || XP_PER_LEVEL[5];
  return Math.max(0, nextLevelXp - $xp);
});

export const xpProgress = derived([xp, level], ([$xp, $level]) => {
  const current = XP_PER_LEVEL[$level] || 0;
  const next = XP_PER_LEVEL[Math.min($level + 1, 5)] || XP_PER_LEVEL[5];
  const range = next - current;
  if (range === 0) return 100;
  return Math.min(100, Math.round((($xp - current) / range) * 100));
});

// Actions
export function completeQuest(questId, xpEarned) {
  xp.update((x) => x + xpEarned);
  questStatus.update((status) => ({
    ...status,
    [questId]: 'completed',
    [questId + 1]: questId < 5 ? 'available' : 'completed',
  }));
}

export function addBadge(badge) {
  badges.update((b) => [...b, badge]);
}

// ─── Active Mission (sidebar mission panel) ───
// When a user selects a quest, it's stored here. Sidebar reads it to show the mission panel.
// Clicking the panel navigates to /workshop?tab=quest-{questId}
export const activeMission = writable(null);

export function setActiveMission(quest) {
  activeMission.set(quest ? { ...quest } : null);
}

export function clearActiveMission() {
  activeMission.set(null);
}
