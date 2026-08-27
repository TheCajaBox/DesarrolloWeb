import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// La interfaz de la app de escritorio. En Electron se sirve desde aquí (Vite en
// proceso); en el navegador se abre para verificarla.
export default defineConfig({
  // Ruta ABSOLUTA, calculada desde este fichero. En relativo ('paginas/
  // escritorio') Vite la resuelve contra el directorio de trabajo del proceso,
  // y ahí estaba un fallo que solo aparecía en la app instalada: el directorio
  // de trabajo lo pone Windows, no existía esa carpeta, y la ventana salía en
  // negro con un 404 silencioso.
  root: fileURLToPath(new URL('./paginas/escritorio', import.meta.url)),
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
