// Sonda de la Fase 0: prueba, sin Electron de por medio, que Vite arranca en
// proceso contra el proyecto de la alumna y compila su App.vue a JavaScript.
//
// Es el mayor riesgo del plan entero. Si esto funciona, el resto es montar la
// ventana alrededor.

import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const PROYECTO = fileURLToPath(new URL('./mi-web', import.meta.url))

const servidor = await createServer({
  root: PROYECTO,
  configFile: false,
  logLevel: 'warn',
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5199 },
})

await servidor.listen()
const puerto = servidor.config.server.port
const base = `http://127.0.0.1:${puerto}`
console.log('Vite escuchando en', base)

// 1. La página base.
const indice = await fetch(`${base}/`).then((r) => r.text())
console.log('index.html:', indice.includes('<div id="app">') ? 'OK' : 'FALLA')

// 2. El main.js, que importa el .vue.
const main = await fetch(`${base}/src/main.js`).then((r) => r.text())
console.log('main.js servido:', main.includes('createApp') ? 'OK' : 'FALLA')

// 3. LO IMPORTANTE: App.vue compilado a JavaScript.
const app = await fetch(`${base}/src/App.vue`).then((r) => r.text())
const compilado =
  app.includes('_sfc_main') || app.includes('createElementBlock') || app.includes('_createBlock')
console.log('App.vue COMPILADO a JS:', compilado ? 'OK' : 'FALLA')
console.log('--- primeras líneas del .vue compilado ---')
console.log(app.split('\n').slice(0, 8).join('\n'))

// 4. El <style scoped> se sirve aparte, con su marca de scope.
const estilo = await fetch(`${base}/src/App.vue?vue&type=style&index=0&scoped=true&lang.css`)
  .then((r) => (r.ok ? r.text() : ''))
  .catch(() => '')
console.log('\n<style scoped> servido:', estilo && estilo.includes('font-family') ? 'OK' : '(se inyecta por JS, normal)')

await servidor.close()
console.log('\nVite cerrado. Sonda terminada.')
