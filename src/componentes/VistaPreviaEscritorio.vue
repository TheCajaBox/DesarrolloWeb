<script setup>
// La vista previa de la app de escritorio: un <webview> apuntando al Vite real
// que sirve el proyecto de la alumna. Proceso aparte, aislado: un bucle
// infinito suyo revienta solo esto, no el taller.
//
// En el navegador (donde verifico la interfaz) no hay webview ni Vite del
// alumno, así que se muestra un aviso en su lugar.
import { onMounted, ref } from 'vue'
import { usarDiagnostico } from '../almacen/diagnostico.js'

const diagnostico = usarDiagnostico()

// eslint-disable-next-line no-undef
const enElectron = typeof window !== 'undefined' && window.taller?.esEscritorio === true

const url = ref('')
const marco = ref(null)

onMounted(async () => {
  if (window.taller?.urlVista) url.value = (await window.taller.urlVista()) || ''
  escucharLaConsola()
})

/**
 * Lo que diga la página de la alumna, al panel de consola.
 *
 * El webview vive en otro proceso y no comparte consola con el taller, así que
 * sus mensajes se pierden salvo que se recojan aquí. El nivel llega como
 * número en unas versiones de Electron y como texto en otras; de traducirlo se
 * encarga el almacén.
 */
function escucharLaConsola() {
  const vista = marco.value
  if (!vista?.addEventListener) return

  vista.addEventListener('console-message', (evento) => {
    diagnostico.apuntarMensaje({
      nivel: evento.level,
      texto: evento.message,
      fichero: evento.sourceId || '',
      linea: evento.line || null,
    })
  })

  // Al recargar la página, lo de antes ya no viene a cuento.
  vista.addEventListener('did-start-loading', () => diagnostico.limpiarConsola())
}

function recargar() {
  if (marco.value?.reload) marco.value.reload()
}
</script>

<template>
  <div class="previa">
    <div class="barra">
      <span class="punto"></span>
      <span class="etiqueta">vista previa</span>
      <span class="url">{{ url }}</span>
      <button v-if="enElectron" class="mini" title="Recargar" @click="recargar">↻</button>
    </div>

    <webview v-if="enElectron && url" ref="marco" :src="url" class="marco"></webview>

    <div v-else class="aviso">
      <p>La vista previa en vivo se ve en la app de escritorio.</p>
      <p class="tenue">Aquí, en el navegador, se comprueba el resto de la interfaz.</p>
    </div>
  </div>
</template>

<style scoped>
.previa {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--fondo-hueco);
}

.barra {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  border-bottom: 1px solid var(--borde);
  background: var(--fondo-panel);
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--texto-apagado);
}

.punto {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--verde);
  flex: none;
}

.etiqueta {
  color: var(--texto-tenue);
}

.url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini {
  border: none;
  padding: 0.1rem 0.4rem;
  line-height: 1;
  color: var(--texto-tenue);
}

.mini:hover {
  color: var(--acento);
  background: none;
}

.marco {
  flex: 1;
  min-height: 0;
  width: 100%;
  border: none;
  background: #fff;
  display: flex;
}

.aviso {
  flex: 1;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 2rem;
  color: var(--texto-tenue);
  font-size: 0.9rem;
  gap: 0.4rem;
}

.aviso .tenue {
  color: var(--texto-apagado);
  font-size: 0.82rem;
}
</style>
