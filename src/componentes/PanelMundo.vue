<script setup>
// El panel de la lección.
//
// Reordenado a propósito: **primero la teoría de Wax, después el ejercicio**.
// Antes estaba al revés y no tenía sentido: te pedía hacer algo y la
// explicación quedaba debajo, como una nota al pie.
//
// Y cada bloque tiene ahora su propio aspecto. Antes el enunciado, la lista de
// pasos y la lección eran el mismo gris del mismo tamaño, así que no se
// distinguía qué era teoría y qué era tarea.
import { computed, inject, ref, watch } from 'vue'
import { usarMundo } from '../almacen/mundo.js'
import { formatear } from '../motor/formato.js'
import { marcarTerminos } from '../motor/glosario.js'
import PasoInteractivo from './PasoInteractivo.vue'
import waxAvatar from '../recursos/wax-avatar.webp'

const props = defineProps({
  proyecto: { type: String, required: true },
  revision: { type: Number, default: 0 },
  ancho: { type: Boolean, default: false },
  // Si el panel de la derecha está a la vista, y cuál necesita este mundo.
  // Los enunciados hablan de la vista previa o de la consola SQL; si están
  // cerradas, hay que decirlo en vez de dejar la frase colgando.
  panelVisible: { type: Boolean, default: true },
  panelNecesario: { type: String, default: 'vista' },
})

const emitir = defineEmits(['cambiar-mundo', 'explicar', 'abrir-panel'])

const NOMBRE_PANEL = { vista: 'Vista previa', sql: 'SQL', esquema: 'Esquema' }
const nombrePanel = computed(() => NOMBRE_PANEL[props.panelNecesario] || 'Resultado')

// Inyectable: la app de escritorio provee su almacén (contenido Vue); el taller
// web usa el suyo por defecto. Mismo componente, dos temarios.
const mundo = inject('almacenCurso', () => usarMundo(), true)
// La lección empieza abierta: es lo primero que hay que leer, no un extra.
const verApunte = ref(true)
const verPista = ref(false)
const caducado = ref(false)

const apunteHtml = computed(() =>
  mundo.mundo?.apunte ? marcarTerminos(formatear(mundo.mundo.apunte.cuerpo)) : '',
)

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

// Al cambiar de mundo, la lección vuelve a abrirse: hay teoría nueva que leer.
watch(
  () => mundo.numero,
  () => {
    verApunte.value = true
  },
)
</script>

<template>
  <div v-if="mundo.mundo" class="panel" :class="{ ancho }">
    <!-- ---- Dónde estás ---- -->
    <header class="titular">
      <p class="acto">{{ mundo.mundo.acto }}</p>
      <h2>{{ mundo.mundo.titulo.replace(/^Mundo \d+ · /, '') }}</h2>

      <div class="avance">
        <ol class="fichas" :aria-label="`${mundo.superados} de ${mundo.pasos.length} pasos`">
          <li v-for="(paso, indice) in mundo.pasos" :key="paso.id">
            <button
              class="pastilla"
              :class="{
                activa: indice === mundo.indicePaso,
                hecha: mundo.resultados[paso.id]?.superado,
              }"
              :title="paso.titulo"
              @click="mundo.ir(indice)"
            >
              {{ mundo.resultados[paso.id]?.superado ? '✓' : indice + 1 }}
            </button>
          </li>
        </ol>

        <span class="cuenta">{{ mundo.superados }}/{{ mundo.pasos.length }}</span>
      </div>
    </header>

    <!-- ---- PRIMERO: la teoría ---- -->
    <section v-if="mundo.mundo.apunte" class="teoria" :class="{ plegada: !verApunte }">
      <header class="cabecera-teoria">
        <img :src="waxAvatar" alt="" class="cara" width="44" height="44" />

        <div class="quien">
          <p class="etiqueta">Lección de Wax</p>
          <h3>{{ mundo.mundo.apunte.titulo }}</h3>
        </div>

        <button class="plegar" :aria-expanded="verApunte" @click="verApunte = !verApunte">
          {{ verApunte ? 'Ocultar' : 'Leer' }}
        </button>
      </header>

      <div v-if="verApunte" class="cuerpo-teoria" v-html="apunteHtml" @click="alPinchar"></div>

      <button v-else class="reabrir" @click="verApunte = true">
        La lección está plegada. Ábrela cuando quieras releerla.
      </button>
    </section>

    <!-- ---- DESPUÉS: el ejercicio ---- -->
    <section v-if="mundo.paso" class="ejercicio">
      <header class="cabecera-ejercicio">
        <p class="etiqueta">
          Ejercicio · paso {{ mundo.indicePaso + 1 }} de {{ mundo.pasos.length }}
        </p>
        <h3>{{ mundo.paso.titulo }}</h3>
      </header>

      <!-- Si el panel que hace falta está cerrado, el enunciado habla de algo
           invisible. Mejor decirlo con un botón que arregle. -->
      <button v-if="!panelVisible" class="falta-panel" @click="emitir('abrir-panel')">
        <span class="icono" aria-hidden="true">◧</span>
        <span>
          Tienes cerrado el panel <strong>{{ nombrePanel }}</strong>, y este paso te va a hablar
          de él. <em>Ábrelo →</em>
        </span>
      </button>

      <!-- El enunciado lleva marcado a propósito (etiquetas en <code>), y es
           contenido nuestro, no del alumno. -->
      <p class="enunciado" v-html="mundo.paso.enunciado"></p>

      <!-- Pasos de entender, no de teclear: elegir, cierto o falso, ordenar,
           rellenar huecos, emparejar. -->
      <PasoInteractivo
        v-if="mundo.paso.tipo && mundo.paso.tipo !== 'codigo'"
        :paso="mundo.paso"
        :respuesta="mundo.elecciones[mundo.paso.id] ?? null"
        @responder="mundo.elegir(mundo.paso.id, $event)"
      />

      <div class="acciones">
        <button class="principal" :disabled="mundo.comprobando" @click="comprobar">
          {{ mundo.comprobando ? 'Mirando…' : 'Comprobar' }}
        </button>
        <button v-if="mundo.paso.pista && !verPista" class="mini" @click="verPista = true">
          Dame una pista
        </button>
      </div>

      <p v-if="verPista && mundo.paso.pista" class="pista" v-html="mundo.paso.pista"></p>

      <Transition name="veredicto">
        <p
          v-if="mundo.resultado"
          class="veredicto"
          :class="{ bien: mundo.resultado.superado, mal: !mundo.resultado.superado, viejo: caducado }"
        >
          <span class="senal">{{ mundo.resultado.superado ? '✓' : '·' }}</span>
          <span>
            {{ mundo.resultado.mensaje }}
            <em v-if="caducado"> — has cambiado algo, vuelve a comprobar</em>
          </span>
        </p>
      </Transition>

      <button
        v-if="mundo.resultado?.superado && mundo.hayMasPasos && !caducado"
        class="principal siguiente"
        @click="mundo.siguiente()"
      >
        Siguiente paso →
      </button>
    </section>

    <!-- ---- Cierre del mundo ---- -->
    <section v-if="mundo.completo" class="cierre">
      <p class="enhorabuena">Mundo completo</p>
      <button
        v-if="mundo.siguienteMundo"
        class="principal"
        @click="emitir('cambiar-mundo', mundo.siguienteMundo.numero)"
      >
        {{ mundo.siguienteMundo.titulo.replace(/^Mundo \d+ · /, '') }} →
      </button>
      <p v-else class="ultimo">Se acabó lo que hay escrito. Vuelve cuando haya más mundos.</p>
    </section>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
  padding: 1.1rem 1.1rem 3rem;
}

.panel.ancho {
  padding: 2rem 1.6rem 4rem;
}

/* ---- Dónde estás ---- */

.acto {
  margin: 0;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--acento);
}

.titular h2 {
  margin: 0.2rem 0 0.7rem;
  font-family: var(--titulos);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--texto);
}

.panel.ancho .titular h2 {
  font-size: 1.9rem;
}

.avance {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.fichas {
  list-style: none;
  display: flex;
  gap: 0.3rem;
  margin: 0;
  padding: 0;
}

/* Los pasos, en pastillas horizontales. La lista vertical de antes ocupaba
   media pantalla y competía con la lección por la atención. */
.pastilla {
  width: 1.75rem;
  height: 1.75rem;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  border-color: var(--borde);
  font-size: 0.76rem;
  color: var(--texto-apagado);
}

.pastilla:hover {
  border-color: var(--acento);
  color: var(--acento);
}

.pastilla.hecha {
  border-color: var(--verde);
  color: var(--verde);
}

.pastilla.activa {
  border-color: var(--acento);
  color: var(--acento);
  background: color-mix(in srgb, var(--acento) 14%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--acento) 12%, transparent);
}

.cuenta {
  font-size: 0.74rem;
  color: var(--texto-apagado);
  font-variant-numeric: tabular-nums;
}

/* ---- La teoría ---- */

.teoria {
  border: 1px solid var(--borde);
  border-left: 3px solid var(--oxido);
  border-radius: var(--redondeo);
  background: linear-gradient(180deg, var(--fondo-alto), var(--fondo-panel));
  overflow: hidden;
}

.cabecera-teoria {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 0.95rem;
  background: rgb(192 104 64 / 0.07);
  border-bottom: 1px solid var(--borde-suave);
}

.teoria.plegada .cabecera-teoria {
  border-bottom: none;
}

.cara {
  flex: none;
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 50%;
  border: 2px solid var(--oxido);
  object-fit: cover;
}

.quien {
  flex: 1;
  min-width: 0;
}

.etiqueta {
  margin: 0;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--oxido);
}

.cabecera-teoria h3 {
  margin: 0.1rem 0 0;
  font-family: var(--titulos);
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--texto);
}

.plegar {
  flex: none;
  font-size: 0.74rem;
  color: var(--texto-apagado);
  border-color: transparent;
}

.plegar:hover {
  border-color: var(--oxido);
  color: var(--oxido);
  background: none;
}

.cuerpo-teoria {
  padding: 1rem 1.1rem 1.1rem;
  /* Tipografía de leer, no de interfaz: más grande, más aire entre líneas y
     una columna con un ancho cómodo. */
  font-size: 0.97rem;
  line-height: 1.75;
  color: var(--texto-tenue);
  max-width: 42rem;
}

.panel.ancho .cuerpo-teoria {
  font-size: 1.05rem;
  line-height: 1.8;
}

.reabrir {
  display: block;
  width: 100%;
  border: none;
  border-radius: 0;
  padding: 0.6rem 1rem 0.8rem;
  text-align: left;
  font-size: 0.8rem;
  font-style: italic;
  color: var(--texto-apagado);
}

.reabrir:hover {
  background: rgb(192 104 64 / 0.06);
  color: var(--oxido);
}

.cuerpo-teoria :deep(p) {
  margin: 0 0 1rem;
}

.cuerpo-teoria :deep(strong) {
  color: var(--texto);
  font-weight: 600;
}

.cuerpo-teoria :deep(code) {
  background: var(--fondo-hueco);
  border: 1px solid var(--borde-suave);
  padding: 0.08em 0.35em;
  border-radius: 3px;
  color: var(--laton);
  font-size: 0.88em;
}

.cuerpo-teoria :deep(pre) {
  background: var(--fondo-hueco);
  border: 1px solid var(--borde-suave);
  border-left: 2px solid var(--oxido);
  border-radius: var(--redondeo);
  padding: 0.8rem 0.95rem;
  overflow-x: auto;
  margin: 0 0 1rem;
}

.cuerpo-teoria :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: var(--texto-tenue);
  font-size: 0.86em;
  line-height: 1.6;
}

.cuerpo-teoria :deep(ul),
.cuerpo-teoria :deep(ol) {
  margin: 0 0 1rem;
  padding-left: 1.4rem;
}

.cuerpo-teoria :deep(li) {
  margin-bottom: 0.45rem;
}

.cuerpo-teoria :deep(.termino) {
  border: none;
  border-radius: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  text-decoration: underline dotted var(--verde);
  text-underline-offset: 0.22em;
  cursor: help;
}

.cuerpo-teoria :deep(.termino:hover) {
  color: var(--verde);
  background: rgb(134 169 94 / 0.12);
}

/* ---- El ejercicio ---- */

.ejercicio {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border: 1px solid color-mix(in srgb, var(--acento) 35%, var(--borde));
  border-radius: var(--redondeo);
  background: color-mix(in srgb, var(--acento) 4%, var(--fondo-panel));
  padding: 1rem 1.1rem 1.1rem;
}

.cabecera-ejercicio .etiqueta {
  color: var(--acento);
}

.cabecera-ejercicio h3 {
  margin: 0.15rem 0 0;
  font-family: var(--titulos);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--texto);
}

.falta-panel {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  border-color: color-mix(in srgb, var(--oxido) 45%, transparent);
  background: rgb(192 104 64 / 0.09);
  padding: 0.6rem 0.75rem;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--texto-tenue);
}

.falta-panel:hover {
  border-color: var(--oxido);
  background: rgb(192 104 64 / 0.16);
}

.falta-panel .icono {
  flex: none;
  color: var(--oxido);
}

.falta-panel strong {
  color: var(--texto);
}

.falta-panel em {
  color: var(--oxido);
  font-style: normal;
  white-space: nowrap;
}

.enunciado {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.65;
  color: var(--texto);
  max-width: 42rem;
}

.enunciado :deep(code),
.pista :deep(code) {
  background: var(--fondo-hueco);
  border: 1px solid var(--borde-suave);
  padding: 0.08em 0.35em;
  border-radius: 3px;
  color: var(--acento);
  font-size: 0.88em;
}

.acciones {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.acciones .principal {
  font-size: 0.95rem;
  padding: 0.45rem 1.1rem;
}

.mini {
  border: none;
  font-size: 0.8rem;
  color: var(--texto-apagado);
  padding: 0.35rem 0.4rem;
}

.mini:hover {
  color: var(--acento);
  background: none;
}

.pista {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--texto-tenue);
  border-left: 2px solid var(--acento);
  padding-left: 0.7rem;
}

.veredicto {
  display: flex;
  gap: 0.6rem;
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  border-radius: var(--redondeo);
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-suave);
  background: var(--fondo-hueco);
}

.senal {
  flex: none;
  font-weight: 700;
}

.veredicto.bien {
  border-color: color-mix(in srgb, var(--verde) 45%, transparent);
  background: rgb(134 169 94 / 0.09);
  color: var(--verde);
}

.veredicto.mal {
  border-color: color-mix(in srgb, var(--oxido) 40%, transparent);
  color: var(--texto-tenue);
}

.veredicto.mal .senal {
  color: var(--oxido);
}

.veredicto.viejo {
  opacity: 0.55;
}

.veredicto em {
  color: var(--texto-apagado);
}

.siguiente {
  align-self: flex-start;
}

.veredicto-enter-active {
  animation: asomar-abajo 0.28s var(--curva) both;
}

/* ---- Cierre ---- */

.cierre {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: flex-start;
  border: 1px solid color-mix(in srgb, var(--verde) 40%, transparent);
  border-radius: var(--redondeo);
  background: rgb(134 169 94 / 0.07);
  padding: 0.9rem 1rem;
}

.enhorabuena {
  margin: 0;
  font-family: var(--titulos);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--verde);
}

.ultimo {
  margin: 0;
  font-size: 0.86rem;
  color: var(--texto-apagado);
  font-style: italic;
}
</style>
