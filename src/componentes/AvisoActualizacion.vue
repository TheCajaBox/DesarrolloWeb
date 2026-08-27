<script setup>
// «Hay una versión nueva. ¿La pongo?»
//
// La aplicación NO se cierra sola. Se descarga la versión nueva en segundo
// plano y se avisa aquí; instalar significa cerrar el taller, y eso lo decide
// quien está trabajando, no el programa. Mientras no se pulse el botón, no
// pasa nada.
//
// Solo sale cuando la versión ya está descargada y esperando: mientras baja no
// se interrumpe a nadie para decir «voy por el 12%».
//
// Se puede aparcar («luego»): el aviso se va y vuelve a ofrecerse la próxima
// vez que se abra el taller.
import { ref } from 'vue'

defineProps({
  version: { type: String, default: '' },
})

const emitir = defineEmits(['luego'])

const instalando = ref(false)
const fallo = ref('')

async function instalar() {
  if (!window.taller?.instalarActualizacion) return

  instalando.value = true
  fallo.value = ''

  const resultado = await window.taller.instalarActualizacion()

  // Si no había nada descargado no habrá reinicio: mejor decirlo que dejarla
  // mirando un «cerrando…» eterno.
  if (!resultado?.ok) {
    instalando.value = false
    fallo.value = 'No he encontrado la versión descargada. Prueba a cerrar y abrir el taller.'
  }
  // Si va bien, la aplicación se cierra en un instante y vuelve sola.
}
</script>

<template>
  <aside class="aviso" role="status">
    <header>
      <p class="encima">Versión nueva</p>
      <h2 v-if="version">La {{ version }} está lista</h2>
      <h2 v-else>Hay una versión nueva</h2>
    </header>

    <p class="que-pasa">
      Al instalarla, el taller se cierra y vuelve a abrirse solo. Tu proyecto y tu progreso se
      quedan donde están.
    </p>

    <p class="wayne">
      <span class="quien">Wayne</span>
      Han traído una versión nueva. Cuando tú digas, cierro un segundo y vuelvo. No pienso
      hacerlo sin avisar, que eso queda fatal.
    </p>

    <p v-if="fallo" class="fallo">{{ fallo }}</p>

    <footer>
      <button class="luego" :disabled="instalando" @click="emitir('luego')">Luego</button>
      <button class="principal" :disabled="instalando" @click="instalar">
        {{ instalando ? 'Cerrando…' : 'Instalar y reabrir' }}
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.aviso {
  width: min(26rem, calc(100vw - 2.4rem));
  padding: 1rem 1.1rem;
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

.encima {
  margin: 0;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--laton-oscuro);
}

header h2 {
  margin: 0.15rem 0 0.6rem;
  font-family: var(--titulos);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--laton);
}

.que-pasa {
  margin: 0;
  font-size: 0.87rem;
  line-height: 1.5;
  color: var(--texto-tenue);
}

.wayne {
  margin: 0.7rem 0 0;
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

.fallo {
  margin: 0.7rem 0 0;
  font-size: 0.84rem;
  line-height: 1.45;
  color: var(--rojo, #d98b7a);
}

footer {
  margin-top: 0.9rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.luego {
  background: none;
  border: 1px solid var(--borde-suave);
  color: var(--texto-apagado);
}

.luego:hover:not(:disabled) {
  color: var(--texto);
  border-color: var(--laton-oscuro);
}

</style>
