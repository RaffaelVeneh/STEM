<script>
  import { onMount } from 'svelte';
  import * as Blockly from 'blockly';
  import { defineCustomBlocks } from '$lib/blockly/blocks/customBlocks.js';
  import { generateArduinoCode } from '$lib/blockly/generators/arduino.js';
  import toolbox from '$lib/blockly/toolbox.js';

  let workspace = null;
  let workspaceDiv;

  let { onCodeGenerated = () => {}, onWorkspaceChanged = () => {}, initialXml = null } = $props();

  onMount(() => {
    if (!workspaceDiv) return;

    defineCustomBlocks();

    workspace = Blockly.inject(workspaceDiv, {
      toolbox,
      collapse: true,
      comments: true,
      disable: true,
      maxBlocks: Infinity,
      trashcan: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      media: 'https://blockly-demo.appspot.com/static/media/',
      grid: { spacing: 20, length: 3, colour: '#E8E8E8', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2, pinch: true },
      move: { scrollbars: true, drag: true, wheel: true },
      renderer: 'zelos',
      theme: Blockly.Theme.defineTheme('resqbox', {
        base: Blockly.Themes.Zelos,
        componentStyles: {
          workspaceBackgroundColour: '#FEFAE0',
          toolboxBackgroundColour: '#FFFFFF',
          toolboxForegroundColour: '#1D3557',
          flyoutBackgroundColour: '#FFFFFF',
          flyoutForegroundColour: '#1D3557',
          flyoutOpacity: 0.95,
          scrollbarColour: '#FF6B35',
          scrollbarOpacity: 0.5,
        },
      }),
    });

    workspace.addChangeListener(() => {
      const code = generateArduinoCode(workspace);
      onCodeGenerated(code);
      onWorkspaceChanged(workspace);
    });

    // ── FIX: flyout .blocklyBlockCanvas must NEVER inherit canvas zoom ──
    // Blockly writes `transform="translate(x,y) scale(N)"` directly onto
    // the SVG element `.blocklyFlyout .blocklyBlockCanvas` every time the
    // main workspace zooms. We use a MutationObserver to intercept that
    // attribute write and strip the scale() part, keeping translate() intact.
    let flyoutObserver = null;

    const attachFlyoutObserver = () => {
      // The flyout SVG may live inside workspaceDiv or be appended to body
      const root = workspaceDiv.closest('svg') ?? document;
      const canvas = root.querySelector?.('.blocklyFlyout .blocklyBlockCanvas')
        ?? document.querySelector('.blocklyFlyout .blocklyBlockCanvas');
      if (!canvas || canvas._resqbox_observed) return false;

      flyoutObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          const el = /** @type {Element} */ (m.target);
          const t = el.getAttribute('transform') ?? '';
          // Strip scale(N) — leave translate(x y) untouched
          const fixed = t.replace(/\s*scale\([^)]*\)/g, '');
          if (fixed !== t) el.setAttribute('transform', fixed);
        }
      });
      flyoutObserver.observe(canvas, { attributes: true, attributeFilter: ['transform'] });
      canvas._resqbox_observed = true;
      return true;
    };

    // Poll until the flyout canvas appears in the DOM (lazy init)
    let pollId;
    let polls = 0;
    const pollForFlyout = () => {
      if (attachFlyoutObserver()) return; // done
      if (polls++ < 60) pollId = setTimeout(pollForFlyout, 200); // up to 12 s
    };
    pollForFlyout();

    if (initialXml) {
      try {
        const xml = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.warn('Failed to load initial workspace XML:', e);
      }
    }

    onCodeGenerated(generateArduinoCode(workspace));

    return () => {
      flyoutObserver?.disconnect();
      clearTimeout(pollId);
      if (workspace) {
        workspace.dispose();
        workspace = null;
      }
    };
  });

  // Public API (via bind:this on component)
  export function getWorkspace() { return workspace; }
  export function getWorkspaceXml() {
    if (!workspace) return null;
    const xml = Blockly.Xml.workspaceToDom(workspace);
    return Blockly.Xml.domToText(xml);
  }
  export function loadWorkspaceXml(xmlText) {
    if (!workspace || !xmlText) return;
    try {
      const xml = Blockly.utils.xml.textToDom(xmlText);
      workspace.clear();
      Blockly.Xml.domToWorkspace(xml, workspace);
    } catch (e) {
      console.warn('Failed to load workspace XML:', e);
    }
  }
  export function clearWorkspace() { if (workspace) workspace.clear(); }
  export function getGeneratedCode() { return workspace ? generateArduinoCode(workspace) : ''; }
</script>

<div
  bind:this={workspaceDiv}
  class="w-full h-full min-h-[400px]"
  style="min-height: 400px; height: 100%; width: 100%; border-radius: 1rem; overflow: hidden; border: 2px solid color-mix(in srgb, var(--color-ocean-foam, #A8DADC) 30%, transparent);"
  role="application"
  aria-label="Blockly coding workspace"
>
</div>

<style>
  @reference "tailwindcss";

  :global(.blocklyToolboxDiv) {
    border-right: 2px solid var(--color-ocean-foam, #A8DADC);
  }

  :global(.blocklyFlyout) {
    border-right: 2px solid var(--color-ocean-foam, #A8DADC);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  :global(.blocklyMainBackground) {
    border-radius: 1rem;
  }

  :global(.blocklyScrollbarHandle) {
    border-radius: 9999px;
  }

  :global(.blocklyZoom > image) {
    border-radius: 0.5rem;
  }

  /* GHOST SCROLLBAR FIX: .blocklyFlyoutScrollbar is a SIBLING div, not child.
     It's non-functional. Just hide it always. */
  :global(.blocklyFlyoutScrollbar) {
    display: none !important;
  }
</style>
