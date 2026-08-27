<script setup>
// El aviso de «esto es lo que ha cambiado».
//
// Aparece cuando la aplicación se ha actualizado, cuenta lo que cambia para
// quien la usa, y se cierra. No es una ventana modal: no bloquea nada, se
// puede seguir trabajando con él abierto, y se va con el botón o con Esc.
//
// Solo sale una vez por versión: al cerrarlo se apunta cuál se ha visto.
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  // [{ version, titulo, puntos: [] }], la más nueva primero.
  entradas: { type: Array, required: true },
  version: { type: String, default: '' },
})

const emitir = defineEmits(['cerrar'])

const visible = ref(true)

function cerrar() {
  visible.value = false
  emitir('cerrar')
}

function alPulsarTecla(evento) {
  if (evento.key === 'Escape') cerrar()
}

onMounted(() => window.addEventListener('keydown', alPulsarTecla))
onBeforeUnmount(() => window.removeEventListener('keydown', alPulsarTecla))
</script>

<template>
  <aside v-if="visible" class="novedades" role="dialog" aria-label="Novedades de esta versión">
    <header>
      <div>
        <p class="encima">Novedades</p>
        <h2>Versión {{ version }}</h2>
      </div>
      <button class="cerrar" title="Cerrar (Esc)" @click="cerrar">×</button>
    </header>

    <div class="cuerpo">
      <section v-for="entrada in entradas" :key="entrada.version" class="entrada">
        <h3>
          {{ entrada.titulo }}
          <span v-if="entradas.length > 1" class="cual">{{ entrada.version }}</span>
        </h3>
        <ul>
          <li v-for="(punto, i) in entrada.puntos" :key="i">{{ punto }}</li>
        </ul>
        <p v-if="entrada.wayne" class="wayne">
          <span class="quien">Wayne</span>
          {{ entrada.wayne }}
        </p>
      </section>
    </div>

    <footer>
      <button class="principal" @click="cerrar">Entendido</button>
    </footer>
  </aside>
</template>

<style scoped>
.novedades {
  position: fixed;
  left: 1.2rem;
  bottom: 1.2rem;
  z-index: 60;
  width: min(30rem, calc(100vw - 2.4rem));
  max-height: min(30rem, calc(100vh - 6rem));
  display: flex;
  flex-direction: column;
  background: var(--fondo-panel);
  border: 1px solid var(--laton-oscuro);
  border-radius: 0.9rem;
  box-shadow: 0 10px 40px rgb(0 0 0 / 0.45);
  animation: asoma 0.28s var(--curva);
}

@keyframes asoma {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem 0.7rem;
  border-bottom: 1px solid var(--borde-suave);
}

.encima {
  margin: 0;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--laton-oscuro);
}

header h2 {
  margin: 0.15rem 0 0;
  font-family: var(--titulos);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--laton);
}

.cerrar {
  border: none;
  background: none;
  padding: 0 0.2rem;
  font-size: 1.3rem;
  line-height: 1;
  color: var(--texto-apagado);
}

.cerrar:hover {
  color: var(--texto);
  background: none;
}

.cuerpo {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.9rem 1.1rem;
}

.entrada + .entrada {
  margin-top: 1.1rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--borde-suave);
}

.entrada h3 {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0 0 0.45rem;
  font-family: var(--titulos);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--texto);
}

.cual {
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 400;
  color: var(--texto-apagado);
}

.entrada ul {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.entrada li {
  font-size: 0.87rem;
  line-height: 1.5;
  color: var(--texto-tenue);
}

.wayne {
  margin: 0.6rem 0 0;
  padding: 0.5rem 0.7rem;
  border-left: 2px solid var(--laton-oscuro);
  background: rgb(0 0 0 / 0.18);
  border-radius: 0 0.4rem 0.4rem 0;
  font-size: 0.84rem;
  line-height: 1.5;
  font-style: italic;
  color: var(--texto-apagado);
}

.quien {
  display: block;
  font-family: var(--titulos);
  font-style: normal;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--laton-oscuro);
  margin-bottom: 0.2rem;
}

footer {
  padding: 0.7rem 1.1rem 1rem;
  display: flex;
  justify-content: flex-end;
}
</style>
