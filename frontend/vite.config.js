import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// Comentamos la importación del plugin de DevTools
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Desactivamos el plugin de DevTools
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // Redirigir cualquier petición que empiece por /api al backend
      '/api': {
        target: 'http://localhost:8000', // URL de tu backend FastAPI
        changeOrigin: true, // Necesario para hosts virtuales
      }
    }
  }
})
