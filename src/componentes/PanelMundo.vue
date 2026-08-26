<script setup>
// El panel de la lección: dónde estás, qué toca, y la teoría de Wax.
//
// La entradilla y el cierre ya no salen aquí: los dice Wayne en el bocadillo
// flotante, que es lo que no roba sitio a lo que hay que leer.
import { computed, ref, watch } from 'vue'
import { usarMundo } from '../almacen/mundo.js'
import { formatear } from '../motor/formato.js'
import { marcarTerminos } from '../motor/glosario.js'
import waxAvatar from '../recursos/wax-avatar.webp'

const props = defineProps({
  proyecto: { type: String, required: true },
  // Sube con cada guardado. Sirve para marcar como caducado un veredicto
  // anterior en cuanto el alumno toca algo.
  revision: { type: Number, default: 0 },
  // En modo lectura la lección se abre sola y se lee más grande.
  ancho: { type: Boolean, default: false },
})

const emitir = defineEmits(['cambiar-mundo', 'explicar'])

const mundo = usarMundo()
const verApunte = ref(false)
const verPista = ref(false)
const caducado = ref(false)

const apunteAbierto = computed(() => verApunte.value || props.ancho)
// Formatear primero y marcar después: así el subrayado del glosario nunca
// entra dentro de un bloque de código, porque ya está envuelto en <pre>.
const apunteHtml = computed(() =>
  mundo.mundo?.apunte ? marcarTerminos(formatear(mundo.mundo.apunte.cuerpo)) : '',
)

// Delegación: los botones del glosario los pinta v-html, así que no se les
// puede poner @click uno a uno. Se escucha en el contenedor.
function alPinchar(evento) {
  const boton = evento.target.closest('.termino')
  if (boton) emitir('explicar', boton.dataset.termino)
}

async function comprobar() {
  caducado.value = false
  await mundo.comprobar(props.proyecto)
}

watch(
  () => props.revision,
  () => {
    // Solo en los pasos que dependen de los ficheros. En uno de elegir, tocar
    // un fichero no invalida nada, y avisar de lo contrario despista.
    if (mundo.resultado && mundo.paso?.tipo !== 'eleccion') caducado.value = true
  },
)

watch(
  () => mundo.paso && mundo.paso.id,
  () => {
    verPista.value = false
    caducado.value = false
  },
)
</script>

<template>
  <div v-if="mundo.mundo" class="panel" :class="{ ancho }">
    <header class="titular">
      <h2>{{ mundo.mundo.titulo }}</h2>
      <div class="barra" :title="`${mundo.superados} de ${mundo.pasos.length}`">
        <span :style="{ width: `${(mundo.superados / mundo.pasos.length) * 100}%` }"></span>
      </div>
      <p class="avance">
        {{ mundo.superados }} de {{ mundo.pasos.length }} pasos
        <span v-if="mundo.sincronizado === false" class="sin-nube" title="No se está guardando en la nube">
          · solo en este navegador
        </span>
      </p>
    </header>

    <ol class="pasos">
      <li v-for="(paso, indice) in mundo.pasos" :key="paso.id">
        <button
          class="paso"
          :class="{ activo: indice === mundo.indicePaso, hecho: mundo.resultados[paso.id]?.superado }"
          @click="mundo.ir(indice)"
        >
          <span class="marca">{{ mundo.resultados[paso.id]?.superado ? '✓' : indice + 1 }}</span>
          <span class="nombre">{{ paso.titulo }}</span>
        </button>
      </li>
    </ol>

    <section v-if="mundo.paso" class="actual">
      <!-- El enunciado lleva marcado a propósito (etiquetas en <code>), y es
           contenido nuestro, no del alumno. -->
      <p class="enunciado" v-html="mundo.paso.enunciado"></p>

      <!-- Pasos de entender, no de teclear. No todo puede ser picar código. -->
      <fieldset v-if="mundo.paso.tipo === 'eleccion'" class="opciones">
        <legend class="oculto">Elige una respuesta</legend>
        <label
          v-for="(opcion, indice) in mundo.paso.opciones"
          :key="indice"
          class="opcion"
          :class="{ elegida: mundo.elecciones[mundo.paso.id] === indice }"
        >
          <input
            type="radio"
            :name="`opcion-${mundo.paso.id}`"
            :value="indice"
            :checked="mundo.elecciones[mundo.paso.id] === indice"
            @change="mundo.elegir(mundo.paso.id, indice)"
          />
          <span>{{ opcion.texto }}</span>
        </label>
      </fieldset>

      <div class="acciones">
        <button class="principal" :disabled="mundo.comprobando" @click="comprobar">
          {{ mundo.comprobando ? 'Mirando…' : 'Comprobar' }}
        </button>
        <button v-if="mundo.paso.pista && !verPista" class="mini" @click="verPista = true">
          Dame una pista
        </button>
      </div>

      <p v-if="verPista && mundo.paso.pista" class="pista" v-html="mundo.paso.pista"></p>

      <p
        v-if="mundo.resultado"
        class="veredicto"
        :class="{ bien: mundo.resultado.superado, mal: !mundo.resultado.superado, viejo: caducado }"
      >
        {{ mundo.resultado.mensaje }}
        <span v-if="caducado" class="nota">— has cambiado algo, vuelve a comprobar</span>
      </p>

      <button
        v-if="mundo.resultado?.superado && mundo.hayMasPasos && !caducado"
        class="principal siguiente"
        @click="mundo.siguiente()"
      >
        Siguiente paso →
      </button>
    </section>

    <section v-if="mundo.completo" class="cierre">
      <p class="enhorabuena">Mundo completo.</p>
      <button
        v-if="mundo.siguienteMundo"
        class="principal"
        @click="emitir('cambiar-mundo', mundo.siguienteMundo.numero)"
      >
        {{ mundo.siguienteMundo.titulo }} →
      </button>
      <p v-else class="ultimo">Se acabó lo que hay escrito. Vuelve cuando haya más mundos.</p>
    </section>

    <section v-if="mundo.mundo.apunte" class="apunte">
      <button class="cabecera-apunte" :aria-expanded="apunteAbierto" @click="verApunte = !verApunte">
        <img :src="waxAvatar" alt="" class="cara" width="28" height="28" />
        <span class="titulo-apunte">{{ mundo.mundo.apunte.titulo }}</span>
        <span v-if="!ancho" class="flecha">{{ apunteAbierto ? '▾' : '▸' }}</span>
      </button>

      <div v-if="apunteAbierto" class="cuerpo-apunte" v-html="apunteHtml" @click="alPinchar"></div>
    </section>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.9rem 0.9rem 3rem;
}

.panel.ancho {
  padding: 1.6rem 1.4rem 4rem;
  gap: 1.4rem;
}

.titular h2 {
  margin: 0 0 0.4rem;
  font-size: 1rem;
  color: var(--texto);
}

.panel.ancho .titular h2 {
  font-size: 1.35rem;
}

.barra {
  height: 3px;
  background: var(--borde-suave);
  border-radius: 2px;
  overflow: hidden;
}

.barra span {
  display: block;
  height: 100%;
  background: var(--verde);
  transition: width 0.3s ease;
}

.avance {
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
  color: var(--texto-apagado);
}

.sin-nube {
  color: var(--oxido);
}

.pasos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.paso {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  border: none;
  padding: 0.32rem 0.45rem;
  text-align: left;
  font-size: 0.85rem;
  color: var(--texto-apagado);
  border-radius: var(--redondeo);
}

.paso:hover {
  background: color-mix(in srgb, var(--acento) 7%, transparent);
  border-color: transparent;
  color: var(--texto);
}

.paso.activo {
  color: var(--texto);
  background: color-mix(in srgb, var(--acento) 11%, transparent);
}

.paso.hecho .marca {
  color: var(--verde);
  border-color: var(--verde);
}

.marca {
  flex: none;
  width: 1.3rem;
  height: 1.3rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--borde);
  border-radius: 50%;
  font-size: 0.7rem;
}

.actual {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  border-top: 1px solid var(--borde-suave);
  padding-top: 0.9rem;
}

.enunciado {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
}

.panel.ancho .enunciado {
  font-size: 1rem;
}

.enunciado :deep(code),
.pista :deep(code) {
  background: var(--fondo-hueco);
  padding: 0.1em 0.35em;
  border-radius: 3px;
  color: var(--acento);
}

.opciones {
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.opcion {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: var(--fondo-hueco);
  font-size: 0.87rem;
  line-height: 1.5;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.opcion:hover {
  border-color: var(--laton-oscuro);
}

.opcion.elegida {
  border-color: var(--acento);
  background: color-mix(in srgb, var(--acento) 10%, transparent);
}

.opcion input {
  margin-top: 0.25rem;
  accent-color: var(--acento);
  flex: none;
}

.acciones {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.mini {
  border: none;
  font-size: 0.78rem;
  color: var(--texto-apagado);
  padding: 0.35rem 0.4rem;
}

.mini:hover {
  color: var(--acento);
  background: transparent;
}

.pista {
  margin: 0;
  font-size: 0.83rem;
  color: var(--texto-tenue);
  border-left: 2px solid var(--laton-oscuro);
  padding-left: 0.65rem;
}

.veredicto {
  margin: 0;
  font-size: 0.86rem;
  border-left: 3px solid var(--borde);
  padding-left: 0.65rem;
}

.veredicto.bien {
  border-color: var(--verde);
  color: var(--verde);
}

.veredicto.mal {
  border-color: var(--oxido);
  color: var(--texto-tenue);
}

.veredicto.viejo {
  opacity: 0.55;
}

.nota {
  color: var(--texto-apagado);
  font-style: italic;
}

.siguiente {
  align-self: flex-start;
}

.cierre {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: flex-start;
  border-top: 1px solid var(--borde-suave);
  padding-top: 0.9rem;
}

.enhorabuena {
  margin: 0;
  color: var(--verde);
  font-size: 0.9rem;
}

.ultimo {
  margin: 0;
  font-size: 0.83rem;
  color: var(--texto-apagado);
  font-style: italic;
}

.apunte {
  border-top: 1px solid var(--borde-suave);
  padding-top: 0.8rem;
}

.cabecera-apunte {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  border: none;
  padding: 0.25rem 0;
  text-align: left;
}

.cabecera-apunte:hover {
  background: transparent;
  border-color: transparent;
}

.cara {
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 1px solid var(--oxido);
  object-fit: cover;
}

.titulo-apunte {
  flex: 1;
  font-size: 0.87rem;
  color: var(--oxido);
}

.cabecera-apunte:hover .titulo-apunte {
  color: var(--acento);
}

.flecha {
  color: var(--texto-apagado);
  font-size: 0.75rem;
}

.cuerpo-apunte {
  margin-top: 0.7rem;
  font-size: 0.87rem;
  line-height: 1.7;
  color: var(--texto-tenue);
}

.panel.ancho .cuerpo-apunte {
  font-size: 1rem;
  line-height: 1.75;
}

.cuerpo-apunte :deep(p) {
  margin: 0 0 0.9rem;
}

.cuerpo-apunte :deep(strong) {
  color: var(--texto);
  font-weight: 600;
}

.cuerpo-apunte :deep(code) {
  background: var(--fondo-hueco);
  padding: 0.1em 0.35em;
  border-radius: 3px;
  color: var(--acento);
  font-size: 0.9em;
}

.cuerpo-apunte :deep(pre) {
  background: var(--fondo-hueco);
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  padding: 0.7rem 0.85rem;
  overflow-x: auto;
  margin: 0 0 0.9rem;
}

.cuerpo-apunte :deep(pre code) {
  background: none;
  padding: 0;
  color: var(--texto-tenue);
  font-size: 0.85em;
  line-height: 1.5;
}

.cuerpo-apunte :deep(ul),
.cuerpo-apunte :deep(ol) {
  margin: 0 0 0.9rem;
  padding-left: 1.3rem;
}

.cuerpo-apunte :deep(li) {
  margin-bottom: 0.35rem;
}

/* Los términos del glosario. Subrayado de puntos, como una nota al pie: se ve
   que hay algo, pero no compite con el texto ni parece un enlace. */
.cuerpo-apunte :deep(.termino) {
  border: none;
  border-radius: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  text-decoration: underline dotted var(--verde);
  text-underline-offset: 0.2em;
  cursor: help;
}

.cuerpo-apunte :deep(.termino:hover) {
  color: var(--verde);
  background: rgb(127 160 90 / 0.1);
}
</style>
