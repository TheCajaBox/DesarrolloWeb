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
  <aside class="wayne" :class="{ dice: parpadeo }">
    <div class="retrato">
      <img :src="wayneAvatar" alt="Wayne" width="52" height="52" />
      <span class="chapa">Wayne</span>
    </div>

    <div class="globo">
      <!-- El texto es siempre el prop actual (sin máquina de estados de
           Transition, que con cambios rápidos al arrancar se quedaba atascada
           mostrando la primera línea). La animación de "ha dicho algo nuevo" la
           da la clase `dice`, que reponemos en cada cambio. -->
      <p class="linea">{{ texto || 'Tú ve haciendo, que yo te miro desde aquí.' }}</p>
    </div>
  </aside>
</template>

<style scoped>
.wayne {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  max-width: min(26rem, calc(100vw - 2rem));
  pointer-events: none;
}

.retrato {
  position: relative;
  flex: none;
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
  border-bottom-left-radius: 0.2rem;
  border-radius: 0.9rem;
  padding: 0.6rem 0.8rem;
  box-shadow: var(--sombra);
  transition: border-color 0.3s var(--curva);
}

.wayne.dice .globo {
  border-color: var(--laton-oscuro);
}

/* El pico del bocadillo, hacia el retrato. */
.globo::before {
  content: '';
  position: absolute;
  left: -6px;
  bottom: 0.8rem;
  width: 11px;
  height: 11px;
  background: var(--fondo-panel);
  border-left: 1px solid var(--borde);
  border-bottom: 1px solid var(--borde);
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
