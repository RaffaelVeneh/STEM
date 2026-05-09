import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    include: ['blockly'],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/blockly/, /node_modules/]
    }
  }
});
