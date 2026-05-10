import { writable, derived } from 'svelte/store';

/**
 * Workspace Tabs Store
 *
 * Each tab = one Blockly canvas. User can have multiple tabs open
 * like browser tabs inside the workshop page.
 *
 * Tab shape:
 *   {
 *     id: string,           // unique tab id
 *     label: string,         // display name
 *     icon: string,          // emoji icon
 *     questId: number|null,  // linked quest (for mission tabs)
 *     xml: string|null,      // Blockly workspace XML
 *     code: string,          // generated Arduino C
 *     dirty: boolean,        // unsaved changes?
 *     createdAt: string,     // ISO timestamp
 *   }
 */

function createWorkspaceTabs() {
  const { subscribe, set, update } = writable({
    tabs: [],
    activeTabId: null,
    nextId: 1,
  });

  return {
    subscribe,

    /** Open a new tab, or focus it if already open */
    openTab(label, icon = '🧩', questId = null) {
      update((state) => {
        // If a tab with this questId already exists, just focus it
        if (questId !== null) {
          const existing = state.tabs.find((t) => t.questId === questId);
          if (existing) return { ...state, activeTabId: existing.id };
        }
        const id = `tab-${questId ? `quest-${questId}` : `free-${state.nextId}`}`;
        // Check if tab with this id already exists
        const existingById = state.tabs.find((t) => t.id === id);
        if (existingById) return { ...state, activeTabId: id };

        const tab = {
          id,
          label,
          icon,
          questId,
          xml: null,
          code: '',
          dirty: false,
          createdAt: new Date().toISOString(),
        };
        return {
          tabs: [...state.tabs, tab],
          activeTabId: id,
          nextId: state.nextId + 1,
        };
      });
    },

    /** Close a tab, switch to neighbor */
    closeTab(tabId) {
      update((state) => {
        const idx = state.tabs.findIndex((t) => t.id === tabId);
        if (idx === -1) return state;
        const newTabs = state.tabs.filter((t) => t.id !== tabId);
        let newActive = state.activeTabId;
        if (state.activeTabId === tabId) {
          if (newTabs.length === 0) {
            newActive = null;
          } else if (idx >= newTabs.length) {
            newActive = newTabs[newTabs.length - 1].id;
          } else {
            newActive = newTabs[idx]?.id ?? newTabs[0]?.id ?? null;
          }
        }
        return { ...state, tabs: newTabs, activeTabId: newActive };
      });
    },

    /** Switch active tab */
    setActiveTab(tabId) {
      update((state) => ({ ...state, activeTabId: tabId }));
    },

    /** Save workspace XML to a tab */
    saveTabXml(tabId, xml) {
      update((state) => ({
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, xml, dirty: false, code: t.code } : t
        ),
      }));
    },

    /** Save generated code to a tab */
    saveTabCode(tabId, code) {
      update((state) => ({
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, code, dirty: true } : t
        ),
      }));
    },

    /** Mark a tab dirty */
    markDirty(tabId) {
      update((state) => ({
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, dirty: true } : t
        ),
      }));
    },

    /** Get all tabs */
    getAllTabs() {
      let result;
      subscribe((state) => (result = state.tabs))();
      return result;
    },

    /** Reset the store */
    reset() {
      set({ tabs: [], activeTabId: null, nextId: 1 });
    },
  };
}

export const workspaceTabs = createWorkspaceTabs();

// Derived: the currently active tab
export const activeWorkspaceTab = derived(workspaceTabs, ($store) => {
  if (!$store.activeTabId) return null;
  return $store.tabs.find((t) => t.id === $store.activeTabId) ?? null;
});

// Derived: all tabs
export const allTabs = derived(workspaceTabs, ($store) => $store.tabs);
