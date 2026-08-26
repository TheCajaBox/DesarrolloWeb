// Puente de mentira, SOLO para el navegador.
//
// En Electron, window.taller ya lo pone el preload antes de que corra nada.
// Aquí, en un navegador normal (donde yo verifico la interfaz), no existe, así
// que se instala uno de pantomima respaldado por memoria. Sembrado con el mismo
// proyecto Vue que sirve la app, para que el taller tenga qué mostrar.
//
// Se importa EL PRIMERO en la entrada del escritorio, antes que nada que use
// motor/ficheros.js, para que el adaptador lo vea ya instalado.

const APP_VUE = `<script setup>
// Aqui va la logica del componente. De momento, nada.
</script>

<template>
  <main>
    <h1>Cambia esto</h1>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`

if (typeof window !== 'undefined' && !window.taller) {
  const ficheros = new Map(
    Object.entries({
      'index.html':
        '<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><title>Cambia esto</title></head>\n<body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>\n',
      'src/main.js': "import { createApp } from 'vue'\nimport App from './App.vue'\ncreateApp(App).mount('#app')\n",
      'src/App.vue': APP_VUE,
    }),
  )

  const norm = (r) => String(r || '').replace(/^\/+/, '')

  window.taller = {
    esEscritorio: false,
    leer: async (r) => (ficheros.has(norm(r)) ? ficheros.get(norm(r)) : null),
    escribir: async (r, c) => {
      ficheros.set(norm(r), String(c))
      return true
    },
    borrar: async (r) => {
      ficheros.delete(norm(r))
      return true
    },
    renombrar: async (d, h) => {
      ficheros.set(norm(h), ficheros.get(norm(d)))
      ficheros.delete(norm(d))
      return true
    },
    listar: async () => [...ficheros.keys()],
    urlVista: async () => '',
  }
}
