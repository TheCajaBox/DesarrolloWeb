import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['pruebas/**/*.test.js'],
    // happy-dom, no node: las comprobaciones de HTML usan DOMParser, que es
    // como lo lee el navegador de verdad. Asi las pruebas ven exactamente lo
    // mismo que vera el alumno.
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        // Al parsear el HTML del alumno aparecen <link> y <script>, y happy-dom
        // intenta descargarlos de verdad contra localhost:3000. Es ruido, es
        // lento y falla. En el navegador esto no pasa: DOMParser nunca pide
        // recursos ni ejecuta scripts.
        settings: {
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableCSSFileLoading: true,
          disableIframePageLoading: true,
          // Sin esto, "deshabilitado" se trata como error y sigue ensuciando
          // la salida con excepciones de red.
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
  },
})
