import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Declarado tambien en tsconfig.json (`paths`). Hoy nadie lo usa, pero
      // los dos tienen que decir lo mismo o el editor y el bundler discrepan.
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
    strictPort: false,
    // La cartografia de `public/layers` son cientos de MB: vigilarla satura el
    // watcher y retrasa el arranque del servidor.
    watch: { ignored: ['**/*.gpkg', '**/public/layers/**'] },
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
  },
})
