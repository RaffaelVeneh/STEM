<script>
  import { onMount, onDestroy } from 'svelte';
  import * as Blockly from 'blockly';
  import { defineCustomBlocks } from '$lib/blockly/blocks/customBlocks.js';
  import { generateArduinoCode } from '$lib/blockly/generators/arduino.js';
  import toolbox from '$lib/blockly/toolbox.js';

  /** @type {Blockly.WorkspaceSvg|null} */
  let workspace = null;
  let workspaceDiv;

  // Props
  let { onCodeGenerated = () => {}, onWorkspaceChanged = () => {}, initialXml = null } = $props();

  onMount(() => {
    // Define custom blocks before injecting
    defineCustomBlocks();

    // Configure Blockly
    const config = {
      toolbox: toolbox,
      collapse: true,
      comments: true,
      disable: true,
      maxBlocks: Infinity,
      trashcan: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      media: 'https://blockly-demo.appspot.com/static/media/',
      grid: {
        spacing: 20,
        length: 3,
        colour: '#E8E8E8',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true,
        },
        drag: true,
        wheel: false,
      },
      renderer: 'zelos', // Zelos is more modern & playful than 'geras'
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
    };

    workspace = Blockly.inject(workspaceDiv, config);

    // Listen for changes → generate code + notify parent
    workspace.addChangeListener(() => {
      const code = generateArduinoCode(workspace);
      onCodeGenerated(code);
      onWorkspaceChanged(workspace);
    });

    // Load initial XML if provided
    if (initialXml) {
      try {
        const xml = Blockly.utils.xml.textToDom(initialXml);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.warn('Failed to load initial workspace XML:', e);
      }
    }

    // Initial code generation
    const code = generateArduinoCode(workspace);
    onCodeGenerated(code);
  });

  onDestroy(() => {
    if (workspace) {
      workspace.dispose();
      workspace = null;
    }
  });

  // ─── Public API (exposed via callback ref or $props) ───

  export function getWorkspace() {
    return workspace;
  }

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

  export function clearWorkspace() {
    if (workspace) workspace.clear();
  }

  export function getGeneratedCode() {
    if (!workspace) return '';
    return generateArduinoCode(workspace);
  }
</script>

<div
  bind:this={workspaceDiv}
  class="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border-2 border-ocean-foam/30"
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
