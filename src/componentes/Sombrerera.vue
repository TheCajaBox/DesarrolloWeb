<script setup>
// La sombrerera: dónde se ven los sombreros encontrados y las siluetas de los
// que faltan.
//
// Las siluetas se enseñan a propósito, con su pista. Una colección donde no se
// ve lo que falta se abandona a los cinco: si no sabes cuántos hay, cada uno
// que encuentras parece el último. Las pistas insinúan, no resuelven.
//
// Nada de aquí bloquea el curso. Es un motivo para curiosear, no un examen.
import { computed, ref } from 'vue'
import { usarColeccion } from '../almacen/coleccion.js'
import { hayApuesta } from '../motor/apuesta.js'
import Apuesta from './Apuesta.vue'

const props = defineProps({
  mundoActual: { type: Number, default: 1 },
})

const coleccion = usarColeccion()

// El minijuego vive aquí y no en otra pestaña: son la misma cosa, coleccionar
// y picarse con Wayne, y cuatro pestañas ya son suficientes.
const jugando = ref(false)
const sePuedeJugar = computed(() => hayApuesta(props.mundoActual))

const cuantos = computed(() => coleccion.cuantos)
const total = computed(() => coleccion.total)
</script>

<template>
  <div class="sombrerera">
    <header>
      <p class="cuenta">
        <strong>{{ cuantos }}</strong> de {{ total }}
      </p>
      <p v-if="coleccion.completa" class="wayne-cierre">
        Los tienes todos. Todos. Yo he tardado años en juntar la mitad y tú vienes aquí y me
        vacías el perchero en un rato. Enhorabuena, de verdad.
      </p>
      <p v-else class="explica">
        Hay sombreros escondidos por el taller. No hacen falta para nada, que quede claro. Se
        ganan haciendo cosas, no buscando píxeles raros.
      </p>
    </header>

    <div v-if="sePuedeJugar" class="timba">
      <button v-if="!jugando" class="proponer" @click="jugando = true">
        Wayne quiere apostarte algo
      </button>
      <template v-else>
        <Apuesta :mundo-actual="mundoActual" />
        <button class="dejarlo" @click="jugando = false">Dejar la partida</button>
      </template>
    </div>

    <ul v-if="!jugando" class="vitrina">
      <li v-for="sombrero in coleccion.vitrina" :key="sombrero.id" :class="{ tengo: sombrero.encontrado }">
        <svg class="silueta" viewBox="0 0 48 32" aria-hidden="true">
          <!-- Un bombín: copa, ala y cinta. Relleno si está, contorno si falta. -->
          <path d="M14 20 V11 a10 8 0 0 1 20 0 v9" />
          <path d="M4 21 q20 6 40 0 q-4 5 -20 5 q-16 0 -20 -5 z" />
          <path d="M14 18 h20" class="cinta" />
        </svg>

        <div class="texto">
          <h3>{{ sombrero.encontrado ? sombrero.nombre : 'Sin encontrar' }}</h3>
          <p v-if="sombrero.encontrado" class="dice">{{ sombrero.wayne }}</p>
          <p v-else class="pista">{{ sombrero.pista }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sombrerera {
  padding: 0.9rem 1rem 1.4rem;
}

header {
  margin-bottom: 1rem;
}

.cuenta {
  margin: 0;
  font-family: var(--titulos);
  font-size: 1.4rem;
  color: var(--texto-apagado);
}

.cuenta strong {
  color: var(--laton);
  font-size: 1.9rem;
  font-variant-numeric: tabular-nums;
}

.explica,
.wayne-cierre {
  margin: 0.3rem 0 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--texto-apagado);
}

.wayne-cierre {
  font-style: italic;
  color: var(--laton);
}

.timba {
  margin-bottom: 1rem;
  padding: 0.8rem 0.9rem;
  border: 1px dashed var(--laton-oscuro);
  border-radius: 0.7rem;
  background: rgb(0 0 0 / 0.14);
}

.proponer {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: none;
  font-family: var(--titulos);
  font-size: 0.88rem;
  color: var(--laton);
}

.proponer:hover {
  background: color-mix(in srgb, var(--laton) 10%, transparent);
  border-radius: 0.4rem;
}

.dejarlo {
  margin-top: 0.8rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--borde-suave);
  background: none;
  font-size: 0.76rem;
  color: var(--texto-apagado);
}

.vitrina {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.vitrina li {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.6rem 0.7rem;
  border: 1px solid var(--borde-suave);
  border-radius: 0.6rem;
  background: rgb(0 0 0 / 0.12);
}

.vitrina li.tengo {
  border-color: var(--laton-oscuro);
  background: color-mix(in srgb, var(--laton) 8%, transparent);
}

.silueta {
  width: 2.2rem;
  flex: none;
  margin-top: 0.15rem;
  fill: none;
  stroke: var(--borde);
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.tengo .silueta {
  stroke: var(--laton);
  fill: color-mix(in srgb, var(--laton) 18%, transparent);
}

.silueta .cinta {
  stroke-width: 2.4;
}

.texto {
  min-width: 0;
}

h3 {
  margin: 0 0 0.15rem;
  font-family: var(--titulos);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--texto-apagado);
}

.tengo h3 {
  color: var(--laton);
}

.dice,
.pista {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--texto-tenue);
}

.dice {
  font-style: italic;
}

.pista {
  color: var(--texto-apagado);
}
</style>
