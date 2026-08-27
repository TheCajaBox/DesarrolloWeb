<script setup>
// El panel de Wayne: no un bocadillo que aparece y se va, sino una presencia
// fija. Está siempre en la esquina, con su retrato, y su frase cambia según lo
// que va pasando (aciertas, fallas, terminas un mundo, te quedas parada).
//
// Se le pasa la línea desde fuera (el almacén de Wayne la decide). Aquí solo se
// pinta, con una animación cortita al cambiar para que se note que ha dicho
// algo nuevo.
import { ref, watch } from 'vue'
import wayneAvatar from '../recursos/wayne-avatar.webp'

const props = defineProps({
  texto: { type: String, default: '' },
})

const parpadeo = ref(false)
// Se puede plegar: cuando estorba, se queda solo el retrato. Un clic y vuelve.
const plegado = ref(false)

watch(
  () => props.texto,
  (nuevo) => {
    if (!nuevo) return
    // Reponemos la clase `dice` para que la animación de "algo nuevo" se
    // vuelva a disparar en cada cambio de línea.
    parpadeo.value = false
    requestAnimationFrame(() => {
      parpadeo.value = true
      setTimeout(() => (parpadeo.value = false), 700)
    })
  },
)
</script>

<template>
  <aside class="wayne" :class="{ dice: parpadeo, plegado }">
    <button
      class="retrato"
      :title="plegado ? 'Que Wayne vuelva a hablar' : 'Callar a Wayne (sigue ahí)'"
      @click="plegado = !plegado"
    >
      <img :src="wayneAvatar" alt="Wayne" width="52" height="52" />
      <span class="chapa">Wayne</span>
    </button>

    <div v-if="!plegado" class="globo">
      <!-- El texto es siempre el prop actual (sin máquina de estados de
           Transition, que con cambios rápidos al arrancar se quedaba atascada
           mostrando la primera línea). La animación de "ha dicho algo nuevo" la
           da la clase `dice`, que reponemos en cada cambio. -->
      <p class="linea">{{ texto || 'Tú ve haciendo, que yo te miro desde aquí.' }}</p>
    </div>
  </aside>
</template>

<style scoped>
/* Abajo a la DERECHA: en la izquierda tapaba el formulario de Armonía y el
   final de la lección. Aquí queda sobre la vista previa, que casi siempre
   tiene aire, y el retrato se puede pulsar para plegarlo. */
.wayne {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 50;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-end;
  gap: 0.6rem;
  max-width: min(26rem, calc(100vw - 2rem));
}

.retrato {
  position: relative;
  flex: none;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  line-height: 0;
}

.retrato img {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  border: 2px solid var(--laton-oscuro);
  background: var(--fondo-hueco);
  box-shadow: var(--sombra);
  object-fit: cover;
  transition: border-color 0.3s var(--curva), transform 0.3s var(--curva);
}

.wayne.dice .retrato img {
  border-color: var(--laton);
  transform: translateY(-2px);
}

.chapa {
  position: absolute;
  bottom: -0.3rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--laton);
  background: var(--fondo-hueco);
  border: 1px solid var(--borde);
  border-radius: 99px;
  padding: 0.05rem 0.4rem;
}

.globo {
  position: relative;
  background: var(--fondo-panel);
  border: 1px solid var(--borde);
  border-radius: 0.9rem;
  border-bottom-right-radius: 0.2rem;
  padding: 0.7rem 0.9rem;
  box-shadow: var(--sombra);
  transition: border-color 0.3s var(--curva);
  /* El globo no roba clics a lo que haya debajo (la vista previa). */
  pointer-events: none;
}

.wayne.dice .globo {
  border-color: var(--laton-oscuro);
}

/* El pico del bocadillo, hacia el retrato (que ahora está a la derecha). */
.globo::before {
  content: '';
  position: absolute;
  right: -6px;
  bottom: 0.8rem;
  width: 11px;
  height: 11px;
  background: var(--fondo-panel);
  border-right: 1px solid var(--borde);
  border-top: 1px solid var(--borde);
  transform: rotate(45deg);
}

.wayne.dice .globo::before {
  border-color: var(--laton-oscuro);
}

.globo p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--texto);
}

/* Al decir algo nuevo, la línea entra con un pequeño desvanecido. Se dispara
   con la clase `dice`, que el componente repone en cada cambio de texto. */
.wayne.dice .linea {
  animation: dice-linea 0.28s var(--curva);
}

@keyframes dice-linea {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
