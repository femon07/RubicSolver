/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), visualizer({ filename: 'dist/stats.html', open: false })],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'three'
            if (id.includes('react')) return 'react'
            if (id.includes('gsap')) return 'gsap'
            return 'vendor'
          }
        },
      },
    },
  },
})
