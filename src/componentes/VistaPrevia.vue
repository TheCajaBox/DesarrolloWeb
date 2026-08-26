<script setup>
// La vista previa. Un iframe apuntando a /vista/<proyecto>/, que sirve el
// Service Worker leyendo de IndexedDB.
import { onMounted, ref, watch } from 'vue'
import { motivoSinServicio, refrescar, registrarServicio, urlDeVista } from '../motor/vista-previa.js'

const props = defineProps({
  proyecto: { type: String, required: true },
  // Cada cambio guardado sube este numero; es la senal para recargar.
  revision: { type: Number, default: 0 },
})

const marco = ref(null)
const listo = ref(false)
const fallo = ref(null)
const url = ref(urlDeVista(props.proyecto))

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

watch(
  () => props.proyecto,
  (nuevo) => {
    url.value = urlDeVista(nuevo)
  },
)

// Se recarga sola con cada guardado, pero sin atropellarse: si el alumno
// escribe rapido, solo cuenta la ultima.
let reloj = null
watch(
  () => props.revision,
  () => {
    if (!listo.value) return
    clearTimeout(reloj)
    reloj = setTimeout(() => refrescar(marco.value), 150)
  },
)

function abrirAparte() {
  window.open(url.value, '_blank', 'noopener')
}
</script>

<template>
  <div class="previa">
    <header class="barra">
      <span class="direccion" :title="url">{{ url }}</span>
      <span class="botones">
        <button class="mini" title="Recargar" @click="refrescar(marco)">↻</button>
        <button class="mini" title="Abrir en otra pestana" @click="abrirAparte">↗</button>
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
  background: var(--fondo-panel);
}

.barra {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.4rem 0.3rem 0.7rem;
  border-bottom: 1px solid var(--borde-suave);
  background: var(--fondo-hueco);
}

.direccion {
  flex: 1;
  min-width: 0;
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--texto-apagado);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.botones {
  display: flex;
  gap: 0.2rem;
}

.mini {
  border: none;
  padding: 0.15rem 0.4rem;
  line-height: 1;
  color: var(--texto-tenue);
}

.mini:hover {
  color: var(--laton);
  background: transparent;
}

.marco {
  flex: 1;
  min-height: 0;
  border: none;
  /* Blanco: la pagina del alumno decide su propio fondo, y casi siempre
     empieza sin ninguno. Sobre el fondo oscuro del taller no se veria. */
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
