<script setup>
// La consola del navegador de la vista previa, dentro del taller.
//
// Un `console.log` que nadie lee no sirve de nada, y hasta ahora había que
// abrir las herramientas de desarrollo para verlo. Aquí salen los mensajes de
// la página de la alumna y los errores que revientan en marcha, que son los
// que no aparecen en el panel de problemas porque compilan perfectamente y
// fallan luego.
import { nextTick, ref, watch } from 'vue'
import { usarDiagnostico } from '../almacen/diagnostico.js'

const diagnostico = usarDiagnostico()

const lista = ref(null)

// Scroll al final con cada mensaje nuevo, como cualquier consola. Si se está
// mirando algo más arriba, no se secuestra la vista.
watch(
  () => diagnostico.contador,
  async () => {
    const donde = lista.value
    if (!donde) return

    const alFinal = donde.scrollHeight - donde.scrollTop - donde.clientHeight < 60
    if (!alFinal) return

    await nextTick()
    donde.scrollTop = donde.scrollHeight
  },
)
</script>

<template>
  <div class="consola">
    <div class="barra">
      <span class="cuenta">
        {{ diagnostico.mensajes.length }}
        {{ diagnostico.mensajes.length === 1 ? 'mensaje' : 'mensajes' }}
      </span>
      <button
        class="mini"
        :disabled="!diagnostico.mensajes.length"
        title="Vaciar la consola"
        @click="diagnostico.limpiarConsola()"
      >
        Limpiar
      </button>
    </div>

    <div ref="lista" class="lineas">
      <p v-if="!diagnostico.mensajes.length" class="vacia">
        Aquí sale lo que tu página diga con console.log, y los errores que le pasen mientras
        funciona.
      </p>

      <p v-for="mensaje in diagnostico.mensajes" :key="mensaje.id" class="linea" :class="mensaje.nivel">
        <span class="nivel">{{ mensaje.nivel }}</span>
        <span class="texto">{{ mensaje.texto }}</span>
        <span v-if="mensaje.linea" class="sitio">{{ mensaje.fichero }}:{{ mensaje.linea }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.consola {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.3rem 0.6rem;
  border-bottom: 1px solid var(--borde-suave);
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--texto-apagado);
}

.lineas {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.4rem 0.6rem 0.7rem;
  font-family: var(--mono);
  font-size: 0.76rem;
  line-height: 1.5;
}

.vacia {
  margin: 0.3rem 0;
  color: var(--texto-apagado);
  opacity: 0.75;
}

.linea {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  margin: 0;
  padding: 0.12rem 0;
  border-bottom: 1px solid rgb(255 255 255 / 0.04);
  color: var(--texto-tenue);
}

.nivel {
  flex: none;
  width: 3.6rem;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.7;
}

.texto {
  flex: 1;
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.sitio {
  flex: none;
  font-size: 0.68rem;
  opacity: 0.5;
}

.linea.error {
  color: var(--rojo, #d98b7a);
}

.linea.aviso {
  color: var(--laton, #dfb96f);
}

.linea.detalle {
  opacity: 0.65;
}
</style>
