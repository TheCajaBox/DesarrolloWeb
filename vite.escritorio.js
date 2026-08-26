import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// La interfaz de la app de escritorio. En Electron se sirve desde aquí (Vite en
// proceso); en el navegador se abre para verificarla.
export default defineConfig({
  root: 'paginas/escritorio',
  plugins: [
    vue({
      // <webview> es un elemento de Electron, no de Vue. Sin esto, el compilador
      // avisaría de un elemento desconocido.
      template: { compilerOptions: { isCustomElement: (tag) => tag === 'webview' } },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // `root` es la carpeta de la página, pero el código vive en src/.
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] },
    port: 5275,
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/escritorio', import.meta.url)),
    emptyOutDir: true,
  },
})
