import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Define publicDir to static assets
  publicDir: 'public',
  build: {
    outDir: 'build'
  }
});