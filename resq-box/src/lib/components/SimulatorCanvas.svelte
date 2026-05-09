<script>
  import { onMount, onDestroy } from 'svelte';
  import { ArduinoBoard } from '$lib/simulator/ArduinoBoard.js';

  let { onBoardReady = () => {} } = $props();

  let canvasEl;
  let board = null;

  onMount(() => {
    if (!canvasEl) return;

    // Set canvas size (responsive to container)
    const resize = () => {
      const rect = canvasEl.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = rect.width * dpr;
      canvasEl.height = rect.height * dpr;
      canvasEl.style.width = rect.width + 'px';
      canvasEl.style.height = rect.height + 'px';
    };

    resize();
    window.addEventListener('resize', resize);

    // Create board
    board = new ArduinoBoard(canvasEl);
    board.start();
    onBoardReady(board);

    return () => {
      window.removeEventListener('resize', resize);
      if (board) board.stop();
    };
  });

  onDestroy(() => {
    if (board) board.stop();
  });
</script>

<canvas
  bind:this={canvasEl}
  class="w-full h-full rounded-2xl"
  aria-label="Virtual Arduino simulator with breadboard and components"
></canvas>
