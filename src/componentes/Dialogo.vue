<script setup>
// El diálogo del taller. Se monta una vez y escucha a motor/dialogos.js.
//
// Detalles que lo separan de un cartel del navegador y que hay que hacer bien
// o es peor el remedio: Escape cierra, Enter confirma, el foco entra al abrir
// y no se puede escapar con el tabulador mientras está abierto.
import { nextTick, ref, watch } from 'vue'
import { abierto, aceptar, descartar } from '../motor/dialogos.js'
import wayneAvatar from '../recursos/wayne-avatar.webp'

const texto = ref('')
const caja = ref(null)
const marco = ref(null)

watch(abierto, async (config) => {
  if (!config) return

  texto.value = config.valor || ''
  await nextTick()

  // El foco va al campo si hay que escribir; si no, al propio diálogo, para
  // que Escape y Enter funcionen sin tener que pinchar nada.
  if (config.tipo === 'texto' && caja.value) {
    caja.value.focus()
    caja.value.select()
  } else if (marco.value) {
    marco.value.focus()
  }
})

function confirmar() {
  const config = abierto.value
  if (!config) return

  if (config.tipo === 'texto') {
    const valor = texto.value.trim()
    if (!valor) return
    aceptar(valor)
  } else {
    aceptar(true)
  }
}

function alTeclear(evento) {
  if (evento.key === 'Escape') {
    evento.preventDefault()
    descartar()
  }
  // En un campo de texto, Enter confirma; en el resto también.
  if (evento.key === 'Enter' && !evento.shiftKey) {
    evento.preventDefault()
    confirmar()
  }
}
</script>

<template>
  <Transition name="velo">
    <div v-if="abierto" class="velo" @click.self="descartar">
      <div
        ref="marco"
        class="cartel"
        :class="{ peligro: abierto.peligro }"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        @keydown="alTeclear"
      >
        <header>
          <img :src="wayneAvatar" alt="" width="36" height="36" />
          <h2>{{ abierto.titulo }}</h2>
        </header>

        <p v-if="abierto.texto" class="cuerpo">{{ abierto.texto }}</p>

        <label v-if="abierto.tipo === 'texto'" class="campo">
          <span v-if="abierto.etiqueta">{{ abierto.etiqueta }}</span>
          <input ref="caja" v-model="texto" type="text" spellcheck="false" />
        </label>

        <footer>
          <button v-if="abierto.tipo !== 'aviso'" class="suave" @click="descartar">
            {{ abierto.cancelar }}
          </button>
          <button
            class="principal"
            :disabled="abierto.tipo === 'texto' && !texto.trim()"
            @click="confirmar"
          >
            {{ abierto.confirmar }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.velo {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgb(8 7 6 / 0.62);
  backdrop-filter: blur(3px);
}

.cartel {
  width: min(30rem, 100%);
  background: var(--fondo-panel);
  border: 1px solid var(--borde);
  border-top: 3px solid var(--laton-oscuro);
  border-radius: var(--redondeo);
  box-shadow: var(--sombra-alta);
  padding: 1.1rem 1.2rem 1rem;
  outline: none;
}

.cartel.peligro {
  border-top-color: var(--oxido);
}

header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.6rem;
}

header img {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 1px solid var(--laton-oscuro);
  object-fit: cover;
}

h2 {
  margin: 0;
  font-family: var(--titulos);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--texto);
}

.cuerpo {
  margin: 0 0 0.9rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--texto-tenue);
}

.campo {
  display: block;
  margin-bottom: 1rem;
}

.campo span {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--texto-apagado);
}

.campo input {
  width: 100%;
  font-family: var(--mono);
  font-size: 0.9rem;
  padding: 0.45rem 0.6rem;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.suave {
  border-color: transparent;
  color: var(--texto-apagado);
}

.suave:hover {
  border-color: var(--borde);
  color: var(--texto-tenue);
  background: none;
}

.peligro .principal {
  border-color: var(--oxido);
  color: var(--oxido);
  background: linear-gradient(180deg, rgb(192 104 64 / 0.14), rgb(192 104 64 / 0.05));
}

.peligro .principal:hover:not(:disabled) {
  border-color: var(--rojo);
  color: var(--rojo);
}

.velo-enter-active,
.velo-leave-active {
  transition: opacity 0.18s var(--curva);
}

.velo-enter-active .cartel,
.velo-leave-active .cartel {
  transition: transform 0.22s var(--curva), opacity 0.22s var(--curva);
}

.velo-enter-from,
.velo-leave-to {
  opacity: 0;
}

.velo-enter-from .cartel,
.velo-leave-to .cartel {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}
</style>
