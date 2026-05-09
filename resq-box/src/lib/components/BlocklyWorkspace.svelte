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

    // FIX 1: Flyout blocks stay at scale 1.0 when canvas zooms
    // FIX 2: Ghost scrollbar — hide flyout scrollbars when flyout is collapsed
    const lockFlyout = () => {
      const flyout = workspace.getFlyout();
      if (!flyout) return;
      const fw = flyout.getWorkspace();
      if (!fw) return;
      // Fix 1: always keep flyout at 1.0 scale
      if (fw.scale !== 1.0) fw.scale = 1.0;
      // Fix 2: if flyout width is 0 (collapsed), hide its scrollbar elements
      const flyoutEl = flyout.svgGroup_?.parentElement || flyout.svgGroup_;
      if (flyoutEl) {
        const scrollbars = flyoutEl.querySelectorAll('.blocklyScrollbarVertical, .blocklyScrollbarHorizontal');
        const isVisible = flyoutEl.style.display !== 'none' && flyout.getWidth() > 10;
        scrollbars.forEach(s => { s.style.display = isVisible ? '' : 'none'; });
      }
    };
    workspace.addChangeListener((event) => {
      if (event.type === 'viewport_change' || event.type === 'toolbox_item_select') {
        requestAnimationFrame(lockFlyout);
      }
    });
    // Also run after init
    setTimeout(lockFlyout, 500);

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
</style>
