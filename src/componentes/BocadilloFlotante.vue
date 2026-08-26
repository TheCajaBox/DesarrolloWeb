<script setup>
// El bocadillo flotante de Wayne, como en croquetas.
//
// Va por encima de todo, en una esquina, y no empuja el contenido. Se cierra
// solo pasado un rato o pulsando, y no vuelve a salir con lo mismo: un
// narrador que insiste acaba siendo un mosquito.
import { onBeforeUnmount, ref, watch } from 'vue'
import wayneAvatar from '../recursos/wayne-avatar.webp'
import waxAvatar from '../recursos/wax-avatar.webp'
import armoniaAvatar from '../recursos/armonia-avatar.webp'

const props = defineProps({
  quien: { type: String, default: 'wayne' },
  texto: { type: String, default: '' },
  // Milisegundos antes de irse solo. 0 lo deja fijo hasta que lo cierren.
  duracion: { type: Number, default: 14000 },
})

const AVATARES = { wayne: wayneAvatar, wax: waxAvatar, armonia: armoniaAvatar }
const NOMBRES = { wayne: 'Wayne', wax: 'Wax', armonia: 'Armonía' }

const visible = ref(false)
let reloj = null

function cerrar() {
  visible.value = false
  clearTimeout(reloj)
}

watch(
  () => props.texto,
  (nuevo) => {
    clearTimeout(reloj)
    if (!nuevo) {
      visible.value = false
      return
    }
    visible.value = true
    if (props.duracion > 0) reloj = setTimeout(cerrar, props.duracion)
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(reloj))
</script>

<template>
  <Transition name="asomar">
    <aside v-if="visible && texto" class="flotante" :class="quien" role="status">
      <img class="retrato" :src="AVATARES[quien] || AVATARES.wayne" :alt="`Retrato de ${NOMBRES[quien]}`" />

      <div class="globo">
        <button class="cerrar" title="Vale, ya" aria-label="Cerrar" @click="cerrar">×</button>
        <span class="nombre">{{ NOMBRES[quien] || 'Wayne' }}</span>
        <p>{{ texto }}</p>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.flotante {
  position: fixed;
  left: 1.1rem;
  bottom: 1.1rem;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  gap: 0.6rem;
  max-width: min(30rem, calc(100vw - 2.2rem));
  pointer-events: auto;
}

.retrato {
  flex: none;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  border: 2px solid var(--laton-oscuro);
  background: var(--fondo-hueco);
  box-shadow: var(--sombra);
  object-fit: cover;
}

.wax .retrato {
  border-color: var(--oxido);
}

.armonia .retrato {
  border-color: var(--verde);
}

.globo {
  position: relative;
  background: var(--fondo-panel);
  border: 1px solid var(--laton-oscuro);
  border-radius: 0.9rem;
  border-bottom-left-radius: 0.2rem;
  padding: 0.6rem 1.8rem 0.7rem 0.85rem;
  box-shadow: var(--sombra);
}

.wax .globo {
  border-color: var(--oxido);
}

.armonia .globo {
  border-color: var(--verde);
}

/* El pico del bocadillo, apuntando al retrato. */
.globo::before {
  content: '';
  position: absolute;
  left: -7px;
  bottom: 0.9rem;
  width: 12px;
  height: 12px;
  background: var(--fondo-panel);
  border-left: 1px solid var(--laton-oscuro);
  border-bottom: 1px solid var(--laton-oscuro);
  transform: rotate(45deg);
}

.wax .globo::before {
  border-color: var(--oxido);
}

.armonia .globo::before {
  border-color: var(--verde);
}

.nombre {
  display: block;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--laton);
  margin-bottom: 0.15rem;
}

.wax .nombre {
  color: var(--oxido);
}

.armonia .nombre {
  color: var(--verde);
}

.globo p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--texto);
}

.cerrar {
  position: absolute;
  top: 0.15rem;
  right: 0.2rem;
  border: none;
  padding: 0.1rem 0.3rem;
  font-size: 1rem;
  line-height: 1;
  color: var(--texto-apagado);
}

.cerrar:hover {
  color: var(--texto);
  background: transparent;
  border-color: transparent;
}

.asomar-enter-active,
.asomar-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.asomar-enter-from,
.asomar-leave-to {
  opacity: 0;
  transform: translateY(0.8rem) scale(0.97);
}

@media (max-width: 40rem) {
  .flotante {
    left: 0.6rem;
    right: 0.6rem;
    bottom: 0.6rem;
    max-width: none;
  }
}
</style>
