// El punto de arranque de TU aplicación.
//
// Coge el componente principal (App.vue) y lo monta dentro del <div id="app">
// que hay en index.html. Esto casi nunca se toca: lo interesante pasa en los
// componentes.
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
