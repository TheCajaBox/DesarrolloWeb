<script setup>
// La apuesta de Wayne.
//
// Te enseña un trozo de plantilla con sus datos y apuesta a que no aciertas
// qué sale pintado. Cinco seguidas y le ganas.
//
// No puntúa, no bloquea nada y no hay reloj: esto no es un examen encubierto,
// es un rato de repaso. Al fallar se explica por qué, que si no fallar solo es
// perder.
//
// Solo salen rondas de lo que ya se ha dado; de eso se encarga motor/apuesta.
import { computed, ref } from 'vue'
import { usarColeccion } from '../almacen/coleccion.js'
import { elegirRonda, hayApuesta, RACHA_QUE_GANA } from '../motor/apuesta.js'

const props = defineProps({
  mundoActual: { type: Number, required: true },
})

const coleccion = usarColeccion()

const ronda = ref(null)
const elegida = ref(null)
const racha = ref(0)
const mejor = ref(0)
const vistas = ref([])

const jugable = computed(() => hayApuesta(props.mundoActual))
const contestada = computed(() => elegida.value !== null)
const acertada = computed(() => contestada.value && elegida.value === ronda.value?.correcta)

function siguiente() {
  elegida.value = null
  ronda.value = elegirRonda(props.mundoActual, vistas.value)
  if (ronda.value) vistas.value = [...vistas.value, ronda.value.id]
}

function responder(indice) {
  if (contestada.value) return
  elegida.value = indice

  if (indice === ronda.value.correcta) {
    racha.value += 1
    if (racha.value > mejor.value) mejor.value = racha.value
    if (racha.value >= RACHA_QUE_GANA) coleccion.encontrar('sombrero-de-la-apuesta')
  } else {
    racha.value = 0
  }
}

/** Las opciones se enseñan tal cual salen pintadas; el vacío hay que decirlo. */
function comoSeVe(opcion) {
  return opcion === 'nada' ? '(no se pinta nada)' : opcion
}

siguiente()
</script>

<template>
  <div class="apuesta">
    <div v-if="!jugable" class="pronto">
      <p class="dice">
        Todavía no. Déjame que te enseñe un par de cosas más y luego te apuesto lo que quieras.
      </p>
    </div>

    <template v-else-if="ronda">
      <header>
        <p class="encima">La apuesta de Wayne</p>
        <p class="racha">
          <span :class="{ viva: racha > 0 }">{{ racha }}</span>
          seguidas
          <span v-if="mejor" class="mejor">· tu récord: {{ mejor }}</span>
        </p>
      </header>

      <p class="pregunta">¿Qué se pinta en la página?</p>

      <pre class="codigo">{{ ronda.plantilla }}</pre>
      <pre v-if="Object.keys(ronda.datos).length" class="datos">{{ ronda.datos }}</pre>

      <ul class="opciones">
        <li v-for="(opcion, i) in ronda.opciones" :key="opcion">
          <button
            :class="{
              elegida: elegida === i,
              buena: contestada && i === ronda.correcta,
              mala: elegida === i && i !== ronda.correcta,
            }"
            :disabled="contestada"
            @click="responder(i)"
          >
            {{ comoSeVe(opcion) }}
          </button>
        </li>
      </ul>

      <div v-if="contestada" class="veredicto">
        <p v-if="acertada" class="bien">
          Esa era.
          <span v-if="racha >= RACHA_QUE_GANA">Y van {{ racha }}. Se acabó lo que se daba.</span>
        </p>
        <p v-else class="dice"><span class="quien">Wayne</span>{{ ronda.wayne }}</p>

        <button class="principal" @click="siguiente">Otra</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.apuesta {
  padding: 0.2rem 0 0.5rem;
}

header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}

.encima {
  margin: 0;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--laton-oscuro);
}

.racha {
  margin: 0;
  font-size: 0.76rem;
  color: var(--texto-apagado);
}

.racha span:first-child {
  font-family: var(--titulos);
  font-size: 1rem;
  color: var(--texto-apagado);
  font-variant-numeric: tabular-nums;
}

.racha span.viva {
  color: var(--laton);
}

.mejor {
  opacity: 0.75;
}

.pregunta {
  margin: 0 0 0.5rem;
  font-size: 0.88rem;
  color: var(--texto);
}

.codigo,
.datos {
  margin: 0 0 0.5rem;
  padding: 0.6rem 0.7rem;
  border-radius: 0.5rem;
  background: rgb(0 0 0 / 0.28);
  border: 1px solid var(--borde-suave);
  font-family: var(--mono);
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--texto-tenue);
  white-space: pre-wrap;
  word-break: break-word;
}

.datos {
  background: rgb(0 0 0 / 0.16);
  color: var(--texto-apagado);
}

.opciones {
  list-style: none;
  margin: 0.7rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.opciones button {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--borde-suave);
  border-radius: 0.5rem;
  background: rgb(0 0 0 / 0.12);
  font-family: var(--mono);
  font-size: 0.8rem;
  color: var(--texto-tenue);
  white-space: pre-wrap;
}

.opciones button:hover:not(:disabled) {
  border-color: var(--laton-oscuro);
  color: var(--texto);
}

.opciones button.buena {
  border-color: var(--verde, #6d8f5a);
  color: var(--verde, #8fbb78);
  background: color-mix(in srgb, var(--verde, #6d8f5a) 12%, transparent);
}

.opciones button.mala {
  border-color: var(--rojo, #a03e2d);
  color: var(--rojo, #d98b7a);
  background: color-mix(in srgb, var(--rojo, #a03e2d) 12%, transparent);
}

.opciones button:disabled {
  opacity: 1;
}

.veredicto {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}

.bien {
  margin: 0;
  font-size: 0.85rem;
  color: var(--verde, #8fbb78);
}

.dice {
  margin: 0;
  padding: 0.5rem 0.7rem;
  border-left: 2px solid var(--laton-oscuro);
  background: rgb(0 0 0 / 0.18);
  border-radius: 0 0.4rem 0.4rem 0;
  font-size: 0.83rem;
  line-height: 1.5;
  font-style: italic;
  color: var(--texto-apagado);
}

.quien {
  display: block;
  font-family: var(--titulos);
  font-style: normal;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--laton-oscuro);
  margin-bottom: 0.2rem;
}

.pronto {
  padding-top: 0.4rem;
}
</style>
