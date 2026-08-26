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

createApp(AppEscritorio).use(createPinia()).mount('#app')
