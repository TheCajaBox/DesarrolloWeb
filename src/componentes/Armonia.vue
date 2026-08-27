<script setup>
// Armonia. Se le pregunta y ayuda a pensar; la solucion no la da.
//
// Todo lo delicado ocurre en el servidor: alli se monta el prompt con lista
// blanca (solo titulo, enunciado y leccion), alli esta la instruccion de
// sistema, y alli se filtran las peticiones de solucion. Desde aqui no se
// puede tocar nada de eso ni desde las herramientas de desarrollo.
// En la app de escritorio no hay servidor ni conexión: allí responde la
// Armonía local (glosario de Steris + lecciones de Wax), con las mismas reglas
// de personaje. Ver motor/armonia-local.js.
import { inject, nextTick, ref } from 'vue'
import { usarMundo } from '../almacen/mundo.js'
import { esEscritorio } from '../motor/ficheros.js'
import { AVISO_LOCAL, responderEnLocal } from '../motor/armonia-local.js'
import Narrador from './Narrador.vue'

// El almacén se inyecta (escritorio provee el suyo, con el temario Vue); si
// nadie lo provee, el del taller web. El mismo componente sirve para los dos.
const mundo = inject('almacenCurso', () => usarMundo(), true)

const pregunta = ref('')
const conversacion = ref([])
const esperando = ref(false)
const desconectada = ref(false)
const fondo = ref(null)

const MAXIMO = 500

async function preguntar() {
  const texto = pregunta.value.trim()
  if (!texto || esperando.value) return

  conversacion.value.push({ quien: 'yo', texto })
  pregunta.value = ''
  esperando.value = true

  try {
    // Sin servidor: responde la Armonía local y no se llama a nada.
    if (esEscritorio) {
      const dicho = conversacion.value.filter((turno) => turno.quien === 'armonia').length
      const local = responderEnLocal({
        pregunta: texto,
        mundo: mundo.mundo,
        paso: mundo.paso,
        turno: dicho,
      })
      conversacion.value.push({ quien: 'armonia', texto: local.texto, modo: local.modo })
      return
    }

    const respuesta = await fetch('/api/armonia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta: texto,
        mundo: mundo.numero,
        paso: mundo.paso ? mundo.paso.id : null,
      }),
    })

    if (respuesta.status === 401) {
      desconectada.value = true
      conversacion.value.push({
        quien: 'armonia',
        texto: 'Ahora mismo no se quien eres, y sin eso no puedo responder. Esto se arregla cuando el taller este detras de Access.',
      })
      return
    }

    const datos = await respuesta.json()
    conversacion.value.push({
      quien: 'armonia',
      texto: datos.respuesta,
      modo: datos.modo,
      // Cuando algo se rompe de verdad, el servidor manda el error autentico.
      // Se ensena: aqui quien juega es tambien quien lo construye.
      detalle: datos.detalle || null,
    })
  } catch {
    conversacion.value.push({
      quien: 'armonia',
      texto: 'No he podido contestar. Mira si tienes conexion.',
    })
  } finally {
    esperando.value = false
    await nextTick()
    if (fondo.value) fondo.value.scrollTop = fondo.value.scrollHeight
  }
}
</script>

<template>
  <div class="armonia">
    <div ref="fondo" class="hilo">
      <p v-if="!conversacion.length" class="entrada">
        {{
          esEscritorio
            ? AVISO_LOCAL
            : 'Pregúntame lo que no entiendas. La solución no te la voy a dar, pero puedo ayudarte a llegar a ella.'
        }}
      </p>

      <template v-for="(turno, i) in conversacion" :key="i">
        <p v-if="turno.quien === 'yo'" class="mio">{{ turno.texto }}</p>
        <template v-else>
          <Narrador quien="armonia" :texto="turno.texto" />
          <p v-if="turno.detalle" class="detalle" :title="turno.detalle">{{ turno.detalle }}</p>
        </template>
      </template>

      <p v-if="esperando" class="pensando">Pensando…</p>
    </div>

    <form class="entrada-texto" @submit.prevent="preguntar">
      <input
        v-model="pregunta"
        type="text"
        :maxlength="MAXIMO"
        placeholder="¿Por qué no se aplica mi CSS?"
        :disabled="esperando || desconectada"
      />
      <button class="principal" :disabled="esperando || desconectada || !pregunta.trim()">
        Preguntar
      </button>
    </form>
  </div>
</template>

<style scoped>
.armonia {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.hilo {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.entrada {
  margin: 0;
  font-size: 0.84rem;
  color: var(--texto-apagado);
  line-height: 1.55;
}

.mio {
  margin: 0;
  align-self: flex-end;
  max-width: 85%;
  font-size: 0.85rem;
  background: rgb(216 178 106 / 0.1);
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  padding: 0.4rem 0.6rem;
}

.pensando {
  margin: 0;
  font-size: 0.8rem;
  color: var(--texto-apagado);
  font-style: italic;
}

.detalle {
  margin: -0.3rem 0 0 2.5rem;
  font-family: var(--mono);
  font-size: 0.7rem;
  color: var(--oxido);
  word-break: break-word;
}

.entrada-texto {
  display: flex;
  gap: 0.35rem;
  padding: 0.5rem;
  border-top: 1px solid var(--borde-suave);
  background: var(--fondo-hueco);
}

.entrada-texto input {
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
}
</style>
