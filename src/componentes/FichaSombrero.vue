<script setup>
// Una ficha del catálogo. Esta es, exactamente, la pieza que el alumno aprende
// a construir: en el Mundo 2 con HTML pelado, y en el 14 ya como componente con
// sus transiciones.
import { computed, ref } from 'vue'

const props = defineProps({
  sombrero: { type: Object, required: true },
})

const emitir = defineEmits(['votar'])

const encima = ref(0)
const enviando = ref(false)
const acabaDeVotar = ref(false)

const media = computed(() =>
  props.sombrero.media === null ? null : props.sombrero.media.toFixed(1),
)

const resumenVotos = computed(() => {
  const n = props.sombrero.votos
  if (!n) return 'sin votos todavía'
  return n === 1 ? '1 voto' : `${n} votos`
})

// Lo que se pinta encendido: lo que señala el ratón, o tu voto, o la media.
const encendidas = computed(() => {
  if (encima.value) return encima.value
  if (props.sombrero.miVoto) return props.sombrero.miVoto
  return Math.round(props.sombrero.media || 0)
})

async function votar(puntuacion) {
  if (enviando.value) return
  enviando.value = true

  try {
    await emitir('votar', { id: props.sombrero.id, puntuacion })
    acabaDeVotar.value = true
    setTimeout(() => (acabaDeVotar.value = false), 900)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <article class="ficha" :class="{ votada: acabaDeVotar }">
    <header>
      <h2>{{ sombrero.nombre }}</h2>

      <p class="nota" :title="resumenVotos">
        <strong v-if="media">{{ media }}</strong>
        <span v-else class="sin">—</span>
      </p>
    </header>

    <p class="descripcion">{{ sombrero.descripcion }}</p>

    <footer>
      <div
        class="estrellas"
        role="group"
        :aria-label="`Puntuar ${sombrero.nombre} del 1 al 5`"
        @mouseleave="encima = 0"
      >
        <button
          v-for="n in 5"
          :key="n"
          class="estrella"
          :class="{ encendida: n <= encendidas, mia: sombrero.miVoto === n }"
          :disabled="enviando"
          :aria-label="`${n} de 5`"
          @mouseenter="encima = n"
          @focus="encima = n"
          @click="votar(n)"
        >
          ★
        </button>
      </div>

      <span class="votos">
        <template v-if="sombrero.miVoto">tu voto: {{ sombrero.miVoto }}</template>
        <template v-else>{{ resumenVotos }}</template>
      </span>
    </footer>
  </article>
</template>

<style scoped>
.ficha {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  border: 1px solid var(--borde);
  border-radius: var(--redondeo);
  background: linear-gradient(180deg, var(--fondo-panel), var(--fondo-hueco));
  padding: 1rem 1.1rem 0.85rem;
  transition: border-color 0.2s var(--curva), transform 0.2s var(--curva),
    box-shadow 0.2s var(--curva);
}

.ficha:hover {
  border-color: var(--laton-oscuro);
  transform: translateY(-3px);
  box-shadow: var(--sombra);
}

/* Un destello corto al votar: confirma que se ha registrado sin sacar un
   cartel por delante. */
.ficha.votada {
  border-color: var(--laton);
  box-shadow: 0 0 0 3px rgb(223 185 111 / 0.14);
}

header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

h2 {
  margin: 0;
  font-family: var(--titulos);
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--texto);
}

.nota {
  margin: 0;
  flex: none;
  font-variant-numeric: tabular-nums;
}

.nota strong {
  font-family: var(--titulos);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--laton);
}

.sin {
  color: var(--texto-apagado);
  font-size: 1.2rem;
}

.descripcion {
  margin: 0;
  flex: 1;
  color: var(--texto-tenue);
  font-size: 0.9rem;
  line-height: 1.55;
}

footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.15rem;
}

.estrellas {
  display: flex;
  gap: 0.05rem;
}

.estrella {
  border: none;
  padding: 0.1rem 0.15rem;
  font-size: 1.2rem;
  line-height: 1;
  color: var(--borde);
  transition: color 0.12s var(--curva), transform 0.12s var(--curva);
}

.estrella:hover:not(:disabled) {
  background: transparent;
  transform: scale(1.22);
}

.estrella.encendida {
  color: var(--laton);
}

/* Tu propio voto se marca aparte de la media, que si no no se distingue
   "esto vale 4" de "yo le he puesto un 4". */
.estrella.mia {
  color: var(--verde);
}

.votos {
  font-size: 0.72rem;
  color: var(--texto-apagado);
  white-space: nowrap;
}
</style>
