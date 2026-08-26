<script setup>
// Wayne, Wax y Armonía hablando.
//
// Los retratos son los mismos que en croquetas-alomanticas, reutilizados del
// repositorio del autor. Se importan para que Vite los versione y los sirva
// como fichero estatico (gratis e ilimitado en Workers).
//
// Todo lo que dicen es texto original escrito en su registro. Nada sale de los
// libros de Sanderson.
import { computed } from 'vue'
import wayneAvatar from '../recursos/wayne-avatar.webp'
import waxAvatar from '../recursos/wax-avatar.webp'
import armoniaAvatar from '../recursos/armonia-avatar.webp'

const props = defineProps({
  quien: { type: String, default: 'wayne' },
  texto: { type: String, required: true },
  // 'normal' en el flujo de la pagina; 'suelto' dentro de un bocadillo
  // flotante, donde el retrato ya lo pone el bocadillo.
  forma: { type: String, default: 'normal' },
})

const FICHAS = {
  wayne: { nombre: 'Wayne', avatar: wayneAvatar, clase: 'wayne' },
  wax: { nombre: 'Wax', avatar: waxAvatar, clase: 'wax' },
  armonia: { nombre: 'Armonía', avatar: armoniaAvatar, clase: 'armonia' },
}

const ficha = computed(() => FICHAS[props.quien] || FICHAS.wayne)
</script>

<template>
  <div class="narrador" :class="[ficha.clase, forma]">
    <img
      v-if="forma === 'normal'"
      class="retrato"
      :src="ficha.avatar"
      :alt="`Retrato de ${ficha.nombre}`"
      width="40"
      height="40"
      loading="lazy"
    />
    <div class="bocadillo">
      <span class="nombre">{{ ficha.nombre }}</span>
      <p class="dice">{{ texto }}</p>
    </div>
  </div>
</template>

<style scoped>
.narrador {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
}

.retrato {
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid var(--borde);
  background: var(--fondo-hueco);
  object-fit: cover;
}

.wayne .retrato {
  border-color: var(--laton-oscuro);
}

.wax .retrato {
  border-color: var(--oxido);
}

.armonia .retrato {
  border-color: var(--verde);
}

.bocadillo {
  flex: 1;
  min-width: 0;
}

.narrador.normal .bocadillo {
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: var(--fondo-hueco);
  padding: 0.55rem 0.75rem;
}

.nombre {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--texto-apagado);
  margin-bottom: 0.15rem;
}

.wayne .nombre {
  color: var(--laton-oscuro);
}

.wax .nombre {
  color: var(--oxido);
}

.armonia .nombre {
  color: var(--verde);
}

.dice {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--texto-tenue);
  white-space: pre-wrap;
}

.narrador.suelto .dice {
  color: var(--texto);
}
</style>
