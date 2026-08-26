<script setup>
// Steris: el glosario y la traducción de errores.
//
// Sale como un panel flotante al pinchar un término subrayado o al pedirle que
// explique un error. Nunca sustituye al error original: se pone debajo. Leer
// errores es parte de lo que hay que aprender.
import { computed } from 'vue'
import sterisAvatar from '../recursos/steris-avatar.webp'
import { definicionDe } from '../motor/glosario.js'
import { traducir } from '../motor/traducir-errores.js'

const props = defineProps({
  // Un término del glosario…
  termino: { type: String, default: null },
  // …o un mensaje de error para traducir. Nunca los dos a la vez.
  error: { type: String, default: null },
})

const emitir = defineEmits(['cerrar'])

const entrada = computed(() => (props.termino ? definicionDe(props.termino) : null))
const traduccion = computed(() => (props.error ? traducir(props.error) : null))
const hayAlgo = computed(() => Boolean(entrada.value || traduccion.value))
</script>

<template>
  <Transition name="asomar">
    <aside v-if="hayAlgo" class="steris" role="dialog" aria-label="Explicación de Steris">
      <header>
        <img :src="sterisAvatar" alt="" class="cara" width="34" height="34" />
        <span class="nombre">Steris</span>
        <button class="cerrar" aria-label="Cerrar" @click="emitir('cerrar')">×</button>
      </header>

      <div v-if="entrada" class="cuerpo">
        <h3>{{ entrada.termino }}</h3>
        <p>{{ entrada.definicion }}</p>
        <p v-if="entrada.ojo" class="ojo"><strong>Ojo:</strong> {{ entrada.ojo }}</p>
      </div>

      <div v-else-if="traduccion" class="cuerpo">
        <h3>{{ traduccion.titulo }}</h3>
        <p>{{ traduccion.explicacion }}</p>
        <template v-if="traduccion.revisa?.length">
          <p class="repasa">Repasa:</p>
          <ul>
            <li v-for="(punto, i) in traduccion.revisa" :key="i">{{ punto }}</li>
          </ul>
        </template>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.steris {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 70;
  width: min(26rem, calc(100vw - 2.2rem));
  max-height: min(28rem, calc(100vh - 4rem));
  overflow-y: auto;
  background: var(--fondo-panel);
  border: 1px solid var(--borde);
  border-left: 3px solid var(--verde);
  border-radius: var(--redondeo);
  box-shadow: var(--sombra);
}

header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  background: var(--fondo-hueco);
  border-bottom: 1px solid var(--borde-suave);
}

.cara {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  border: 1px solid var(--verde);
  object-fit: cover;
}

.nombre {
  flex: 1;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--verde);
}

.cerrar {
  border: none;
  padding: 0.1rem 0.35rem;
  font-size: 1.1rem;
  line-height: 1;
  color: var(--texto-apagado);
}

.cerrar:hover {
  color: var(--texto);
  background: transparent;
  border-color: transparent;
}

.cuerpo {
  padding: 0.7rem 0.85rem 0.9rem;
}

h3 {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  color: var(--texto);
}

.cuerpo p {
  margin: 0 0 0.6rem;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--texto-tenue);
}

.ojo {
  border-left: 2px solid var(--oxido);
  padding-left: 0.6rem;
  margin-bottom: 0;
}

.ojo strong {
  color: var(--oxido);
}

.repasa {
  margin-bottom: 0.25rem;
  color: var(--texto-apagado);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.cuerpo ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--texto-tenue);
}

.cuerpo li {
  margin-bottom: 0.3rem;
}

.asomar-enter-active,
.asomar-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.asomar-enter-from,
.asomar-leave-to {
  opacity: 0;
  transform: translateY(0.6rem);
}
</style>
