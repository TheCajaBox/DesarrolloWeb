<script setup>
// «Has encontrado un sombrero».
//
// Sale abajo, junto a los demás avisos, y se va solo a los pocos segundos: es
// una celebración, no una tarea pendiente. También se puede cerrar a mano, y
// se cierra igualmente al pulsar en él para ir a la sombrerera.
import { onBeforeUnmount, onMounted } from 'vue'

defineProps({
  sombrero: { type: Object, required: true },
  cuantos: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
})

const emitir = defineEmits(['cerrar', 'ver'])

// Lo justo para leer la frase sin que se quede ahí molestando.
const SE_VA_A_LOS = 9000
let reloj = null

onMounted(() => {
  reloj = setTimeout(() => emitir('cerrar'), SE_VA_A_LOS)
})

onBeforeUnmount(() => {
  if (reloj) clearTimeout(reloj)
})
</script>

<template>
  <aside class="hallazgo" role="status">
    <svg class="sombrero" viewBox="0 0 48 32" aria-hidden="true">
      <path d="M14 20 V11 a10 8 0 0 1 20 0 v9" />
      <path d="M4 21 q20 6 40 0 q-4 5 -20 5 q-16 0 -20 -5 z" />
      <path d="M14 18 h20" class="cinta" />
    </svg>

    <div class="texto">
      <p class="encima">Sombrero encontrado · {{ cuantos }} de {{ total }}</p>
      <h2>{{ sombrero.nombre }}</h2>
      <p class="dice">{{ sombrero.wayne }}</p>
      <button class="enlace" @click="emitir('ver')">Ver la sombrerera</button>
    </div>

    <button class="cerrar" title="Cerrar" @click="emitir('cerrar')">×</button>
  </aside>
</template>

<style scoped>
.hallazgo {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  width: min(26rem, calc(100vw - 2.4rem));
  padding: 0.9rem 1rem;
  background: var(--fondo-panel);
  border: 1px solid var(--laton);
  border-radius: 0.9rem;
  box-shadow: 0 10px 40px rgb(0 0 0 / 0.45);
  animation: llega 0.4s var(--curva);
}

@keyframes llega {
  from {
    opacity: 0;
    transform: translateY(14px) rotate(-3deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}

.sombrero {
  width: 2.6rem;
  flex: none;
  margin-top: 0.2rem;
  fill: color-mix(in srgb, var(--laton) 20%, transparent);
  stroke: var(--laton);
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.sombrero .cinta {
  stroke-width: 2.4;
}

.texto {
  min-width: 0;
  flex: 1;
}

.encima {
  margin: 0;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--laton-oscuro);
}

h2 {
  margin: 0.15rem 0 0.35rem;
  font-family: var(--titulos);
  font-size: 1rem;
  font-weight: 600;
  color: var(--laton);
}

.dice {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.5;
  font-style: italic;
  color: var(--texto-tenue);
}

.enlace {
  margin-top: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.78rem;
  color: var(--laton-oscuro);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.enlace:hover {
  color: var(--laton);
  background: none;
}

.cerrar {
  flex: none;
  border: none;
  background: none;
  padding: 0 0.1rem;
  font-size: 1.2rem;
  line-height: 1;
  color: var(--texto-apagado);
}

.cerrar:hover {
  color: var(--texto);
  background: none;
}
</style>
