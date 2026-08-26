<script setup>
// La vista previa. Un iframe apuntando a /vista/<proyecto>/, que sirve el
// Service Worker leyendo de IndexedDB.
//
// Lleva una pestaña con el título de la página, y no es decoración: el primer
// paso del Mundo 1 es cambiar el <title>, y dentro de un iframe no hay ninguna
// pestaña del navegador donde verlo. Sin esto, el paso pedía comprobar algo
// invisible.
import { onMounted, ref, watch } from 'vue'
import { motivoSinServicio, refrescar, registrarServicio, urlDeVista } from '../motor/vista-previa.js'

const props = defineProps({
  proyecto: { type: String, required: true },
  // Cada cambio guardado sube este número; es la señal para recargar.
  revision: { type: Number, default: 0 },
})

const marco = ref(null)
const listo = ref(false)
const fallo = ref(null)
const url = ref(urlDeVista(props.proyecto))
const titulo = ref('')
const cargandoPagina = ref(false)

onMounted(async () => {
  const motivo = motivoSinServicio()
  if (motivo) {
    fallo.value = motivo
    return
  }

  try {
    await registrarServicio()
    listo.value = true
  } catch (error) {
    fallo.value = error.message
  }
})

// El iframe es del mismo origen (lo sirve nuestro Service Worker), así que se
// puede leer su título. Si algún día dejara de serlo, esto falla y se calla.
function alCargar() {
  cargandoPagina.value = false
  try {
    titulo.value = marco.value?.contentDocument?.title || ''
  } catch {
    titulo.value = ''
  }
}

watch(
  () => props.proyecto,
  (nuevo) => {
    url.value = urlDeVista(nuevo)
  },
)

// Se recarga sola con cada guardado, pero sin atropellarse: si se escribe
// rápido, solo cuenta la última.
let reloj = null
watch(
  () => props.revision,
  () => {
    if (!listo.value) return
    clearTimeout(reloj)
    cargandoPagina.value = true
    reloj = setTimeout(() => refrescar(marco.value), 150)
  },
)

function abrirAparte() {
  window.open(url.value, '_blank', 'noopener')
}
</script>

<template>
  <div class="previa">
    <!-- Una pestaña, como la de un navegador de verdad: es donde se ve el
         <title> de la página. -->
    <div class="pestana-falsa">
      <span class="favicon" aria-hidden="true">◧</span>
      <span class="titulo" :class="{ vacio: !titulo }">
        {{ titulo || 'Sin título' }}
      </span>
      <span v-if="cargandoPagina" class="girando" aria-hidden="true">↻</span>
    </div>

    <header class="barra">
      <span class="candado" aria-hidden="true">⌂</span>
      <span class="direccion" :title="url">{{ url }}</span>
      <span class="botones">
        <button class="mini" title="Recargar" @click="refrescar(marco)">↻</button>
        <button class="mini" title="Abrir en otra pestaña" @click="abrirAparte">↗</button>
      </span>
    </header>

    <div v-if="fallo" class="aviso">
      <p><strong>La vista previa no puede arrancar.</strong></p>
      <p>{{ fallo }}</p>
    </div>

    <iframe
      v-else-if="listo"
      ref="marco"
      :src="url"
      class="marco"
      title="Vista previa del proyecto"
      @load="alCargar"
    ></iframe>

    <div v-else class="aviso">
      <p>Preparando la vista previa&hellip;</p>
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

/* ---- La pestaña ---- */

.pestana-falsa {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  align-self: flex-start;
  max-width: min(20rem, 90%);
  margin: 0.35rem 0.5rem 0;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--borde);
  border-bottom: none;
  border-radius: 7px 7px 0 0;
  background: var(--fondo-panel);
}

.favicon {
  color: var(--acento);
  font-size: 0.7rem;
  flex: none;
}

.pestana-falsa .titulo {
  min-width: 0;
  font-size: 0.78rem;
  color: var(--texto-tenue);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pestana-falsa .titulo.vacio {
  color: var(--texto-apagado);
  font-style: italic;
}

.girando {
  flex: none;
  font-size: 0.7rem;
  color: var(--texto-apagado);
  animation: vuelta 0.9s linear infinite;
}

@keyframes vuelta {
  to {
    transform: rotate(360deg);
  }
}

/* ---- La barra de direcciones ---- */

.barra {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.4rem 0.3rem 0.6rem;
  border-top: 1px solid var(--borde);
  border-bottom: 1px solid var(--borde);
  background: var(--fondo-panel);
}

.candado {
  color: var(--texto-apagado);
  font-size: 0.75rem;
  flex: none;
}

.direccion {
  flex: 1;
  min-width: 0;
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--texto-apagado);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.botones {
  display: flex;
  gap: 0.15rem;
}

.mini {
  border: none;
  padding: 0.15rem 0.4rem;
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
  border: none;
  /* Blanco: la página del alumno decide su propio fondo, y casi siempre
     empieza sin ninguno. Sobre el fondo oscuro del taller no se vería. */
  background: #fff;
}

.aviso {
  flex: 1;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 2rem;
  color: var(--texto-apagado);
  font-size: 0.9rem;
}
</style>
