import { defineConfig } from 'vite'

export default defineConfig({
  base: '/tarot-cards/',
  root: 'src/client',
  build: {
    outDir: '../../dist/public',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
