import { workspaceTabs } from './workspaceTabs.js';
import { saveProject, loadProject, listProjects, deleteProject } from './db.js';

const DRAFT_PREFIX = 'draft-tab-';

/**
 * Auto-save a tab's workspace to IndexedDB as a draft.
 * Called when user navigates away or closes a tab.
 */
export async function saveDraft(tabId, xml, code, questId = null) {
  try {
    await saveProject(`${DRAFT_PREFIX}${tabId}`, {
      tabId,
      xml,
      code,
      questId,
      label: `Draft ${tabId}`,
    });
  } catch (e) {
    console.warn('Draft save failed:', e);
  }
}

/**
 * Save ALL open tabs as drafts at once (for page unload).
 */
export async function saveAllDrafts(tabs) {
  const promises = tabs.map((tab) =>
    saveDraft(tab.id, tab.xml, tab.code, tab.questId)
  );
  await Promise.allSettled(promises);
}

/**
 * Load a draft for a specific tab ID.
 */
export async function loadDraft(tabId) {
  return loadProject(`${DRAFT_PREFIX}${tabId}`);
}

/**
 * Restore all saved drafts into the workspace tabs store.
 * Called on app startup or when navigating to workshop.
 */
export async function restoreDrafts() {
  try {
    const keys = await listProjects();
    const draftKeys = keys.filter((k) => k.startsWith(DRAFT_PREFIX));

    for (const key of draftKeys) {
      const draft = await loadProject(key);
      if (!draft || !draft.tabId) continue;

      const label = draft.questId
        ? `Level ${draft.questId}`
        : 'Workshop';

      workspaceTabs.openTab(label, '🧩', draft.questId ?? null);

      if (draft.xml) {
        workspaceTabs.saveTabXml(draft.tabId, draft.xml);
      }
      if (draft.code) {
        workspaceTabs.saveTabCode(draft.tabId, draft.code);
      }
    }
  } catch (e) {
    console.warn('Draft restore failed:', e);
  }
}

/**
 * Delete a draft (when user manually closes a tab).
 */
export async function deleteDraft(tabId) {
  try {
    await deleteProject(`${DRAFT_PREFIX}${tabId}`);
  } catch (e) {
    console.warn('Draft delete failed:', e);
  }
}
