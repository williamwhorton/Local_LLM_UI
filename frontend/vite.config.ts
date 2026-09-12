/// <reference types="node" />
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  // Vitest resolves packages with Node conditions, which would pick Svelte's
  // server entrypoint. Tell it to use the `browser` entry points instead.
  resolve:
    process.env.VITEST
      ? {
          conditions: ['browser']
        }
      : undefined,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts']
  }
})