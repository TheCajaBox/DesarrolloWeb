// Arranque de la interfaz de la app de escritorio.
//
// El mock se importa EL PRIMERO, antes que nada que use motor/ficheros.js: en
// el navegador instala un puente de mentira para que yo pueda ver la interfaz;
// en Electron no hace nada, porque el puente real ya está.
import './motor/mock-escritorio.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AppEscritorio from './AppEscritorio.vue'
import './estilos/base.css'

const app = createApp(AppEscritorio)

// Un error suelto en un componente dejaba la app medio muerta hasta recargar
// con Ctrl+R. Con este manejador, el fallo se registra y la aplicación sigue
// en pie: se pierde lo que ese trozo estuviera haciendo, no la sesión entera.
app.config.errorHandler = (error, _instancia, donde) => {
  console.error(`[taller] error en ${donde || 'algún sitio'}:`, error)
}

// Y lo mismo para lo que se escape del ciclo de Vue (promesas sin capturar).
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (evento) => {
    console.error('[taller] promesa sin capturar:', evento.reason)
  })
}

app.use(createPinia()).mount('#app')
