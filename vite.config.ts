import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
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
    // `public/` son cientos de MB entre cartografia e imagenes: vigilarlo
    // satura el watcher y retrasa el arranque. Los .gpkg y .mp4 se listan
    // aparte porque tambien pueden vivir fuera de public/.
    watch: { ignored: ['**/*.gpkg', '**/*.mp4', '**/public/**'] },
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5173'),
  },
})
