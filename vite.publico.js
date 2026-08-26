import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Worker publico: portada, catalogo real de sombreros y paginas publicadas.
export default defineConfig({
  root: 'paginas/publico',
  publicDir: fileURLToPath(new URL('./publico-estatico', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/publico', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    // `root` es la carpeta de la pagina, pero el codigo vive en src/.
    // Sin esto Vite se niega a servir nada de fuera de root.
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] },
    port: 5273,
    // Las llamadas a /api/* las atiende `wrangler dev` en 8787.
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
})
