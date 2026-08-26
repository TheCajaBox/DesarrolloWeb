import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AppTaller from './AppTaller.vue'
import './estilos/base.css'

createApp(AppTaller).use(createPinia()).mount('#app')
