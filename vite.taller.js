import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Worker del taller: el editor, la vista previa y los mundos. Va tras Access.
export default defineConfig({
  root: 'paginas/taller',
  publicDir: fileURLToPath(new URL('./taller-estatico', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Nada de COOP/COEP: usamos SQLite en memoria y persistimos nosotros en
  // IndexedDB, asi que no hace falta SharedArrayBuffer ni OPFS. Esas cabeceras
  // habrian roto la carga de cualquier recurso de otro origen.
  server: {
    // `root` es la carpeta de la pagina, pero el codigo vive en src/.
    // Sin esto Vite se niega a servir nada de fuera de root.
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] },
    port: 5274,
    proxy: { '/api': 'http://127.0.0.1:8788' },
  },
  optimizeDeps: {
    // Trae su propio worker; que Vite no intente pre-empaquetarlo.
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/taller', import.meta.url)),
    emptyOutDir: true,
  },
})
