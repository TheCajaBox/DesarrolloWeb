<script setup>
// Dibuja los pasos que no son de escribir código: elegir, cierto o falso,
// ordenar, rellenar huecos y emparejar.
//
// Vive aparte de PanelMundo porque son cinco formas distintas y allí no cabían
// sin convertir el fichero en un armario.
//
// Todos funcionan igual por fuera: reciben `respuesta`, emiten `responder`, y
// PanelMundo no necesita saber de qué tipo son.
import { computed, watch } from 'vue'

const props = defineProps({
  paso: { type: Object, required: true },
  respuesta: { default: null },
})

const emitir = defineEmits(['responder'])

// Cada tipo empieza con una respuesta vacía de su forma. Sin esto habría que
// comprobar null por todas partes.
function respuestaInicial(paso) {
  switch (paso.tipo) {
    case 'verdadero-falso':
      return paso.afirmaciones.map(() => null)
    case 'ordenar':
      return paso.piezas.map((_, i) => i)
    case 'completar':
      return Array.from({ length: paso.cuantosHuecos }, () => '')
    case 'emparejar':
      return paso.izquierdas.map(() => null)
    default:
      return null
  }
}

const valor = computed(() => {
  if (props.respuesta !== null && props.respuesta !== undefined) return props.respuesta
  return respuestaInicial(props.paso)
})

// Al cambiar de paso, si no había respuesta guardada se siembra la vacía. Los
// de ordenar la necesitan de verdad: si no, no hay nada que mover.
watch(
  () => props.paso.id,
  () => {
    if (props.respuesta === null || props.respuesta === undefined) {
      const inicial = respuestaInicial(props.paso)
      if (inicial !== null) emitir('responder', inicial)
    }
  },
  { immediate: true },
)

function cambiar(indice, nuevo) {
  const copia = [...valor.value]
  copia[indice] = nuevo
  emitir('responder', copia)
}

function mover(indice, salto) {
  const destino = indice + salto
  if (destino < 0 || destino >= valor.value.length) return

  const copia = [...valor.value]
  ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
  emitir('responder', copia)
}

// La plantilla de los huecos, partida en trozos de texto y huecos.
const trozos = computed(() => {
  if (props.paso.tipo !== 'completar') return []
  return String(props.paso.plantilla).split('___')
})
</script>

<template>
  <!-- ---- Elegir una ---- -->
  <fieldset v-if="paso.tipo === 'eleccion'" class="grupo">
    <legend class="oculto">Elige una respuesta</legend>

    <pre v-if="paso.codigo" class="codigo">{{ paso.codigo }}</pre>

    <label
      v-for="(opcion, i) in paso.opciones"
      :key="i"
      class="opcion"
      :class="{ elegida: respuesta === i }"
    >
      <input
        type="radio"
        :name="`op-${paso.id}`"
        :checked="respuesta === i"
        @change="emitir('responder', i)"
      />
      <span>{{ opcion.texto }}</span>
    </label>
  </fieldset>

  <!-- ---- Cierto o falso ---- -->
  <fieldset v-else-if="paso.tipo === 'verdadero-falso'" class="grupo">
    <legend class="oculto">Marca cada una como cierta o falsa</legend>

    <div v-for="(af, i) in paso.afirmaciones" :key="i" class="afirmacion">
      <span class="texto">{{ af.texto }}</span>
      <span class="botones">
        <button
          class="opcion-vf"
          :class="{ elegida: valor[i] === true }"
          @click="cambiar(i, true)"
        >
          Cierto
        </button>
        <button
          class="opcion-vf"
          :class="{ elegida: valor[i] === false }"
          @click="cambiar(i, false)"
        >
          Falso
        </button>
      </span>
    </div>
  </fieldset>

  <!-- ---- Ordenar ---- -->
  <ol v-else-if="paso.tipo === 'ordenar'" class="grupo lista-orden">
    <li v-for="(indice, posicion) in valor" :key="indice" class="pieza">
      <span class="posicion">{{ posicion + 1 }}</span>
      <code class="texto">{{ paso.piezas[indice] }}</code>
      <span class="flechas">
        <button :disabled="posicion === 0" title="Subir" @click="mover(posicion, -1)">↑</button>
        <button
          :disabled="posicion === valor.length - 1"
          title="Bajar"
          @click="mover(posicion, 1)"
        >
          ↓
        </button>
      </span>
    </li>
  </ol>

  <!-- ---- Rellenar huecos ---- -->
  <div v-else-if="paso.tipo === 'completar'" class="grupo huecos">
    <pre><template v-for="(trozo, i) in trozos" :key="i"><span>{{ trozo }}</span><input
        v-if="i < trozos.length - 1"
        class="hueco"
        type="text"
        spellcheck="false"
        :value="valor[i]"
        :aria-label="`Hueco ${i + 1}`"
        :size="Math.max(6, String(valor[i] || '').length + 2)"
        @input="cambiar(i, $event.target.value)"
      /></template></pre>
  </div>

  <!-- ---- Emparejar ---- -->
  <div v-else-if="paso.tipo === 'emparejar'" class="grupo parejas">
    <div v-for="(izq, i) in paso.izquierdas" :key="i" class="pareja">
      <code class="texto">{{ izq }}</code>
      <span class="une" aria-hidden="true">→</span>
      <select
        :value="valor[i] === null ? '' : valor[i]"
        :aria-label="`Qué va con ${izq}`"
        @change="cambiar(i, $event.target.value === '' ? null : Number($event.target.value))"
      >
        <option value="">elige…</option>
        <option v-for="(der, j) in paso.derechas" :key="j" :value="j">{{ der }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.grupo {
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.codigo {
  margin: 0 0 0.3rem;
  background: var(--fondo-hueco);
  border: 1px solid var(--borde-suave);
  border-left: 2px solid var(--acento);
  border-radius: var(--redondeo);
  padding: 0.7rem 0.85rem;
  overflow-x: auto;
  font-size: 0.84rem;
  line-height: 1.6;
  color: var(--texto-tenue);
}

/* ---- Elegir ---- */

.opcion {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: var(--fondo-hueco);
  font-size: 0.92rem;
  line-height: 1.5;
  cursor: pointer;
  transition: border-color 0.15s var(--curva), background 0.15s var(--curva),
    transform 0.12s var(--curva);
}

.opcion:hover {
  border-color: var(--acento);
  transform: translateX(2px);
}

.opcion.elegida {
  border-color: var(--acento);
  background: color-mix(in srgb, var(--acento) 10%, var(--fondo-hueco));
}

.opcion input {
  margin-top: 0.3rem;
  accent-color: var(--acento);
  flex: none;
}

/* ---- Cierto o falso ---- */

.afirmacion {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: var(--fondo-hueco);
}

.afirmacion .texto {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.45;
}

.botones {
  display: flex;
  gap: 0.25rem;
  flex: none;
}

.opcion-vf {
  font-size: 0.76rem;
  padding: 0.22rem 0.6rem;
  color: var(--texto-apagado);
}

.opcion-vf.elegida {
  color: var(--acento);
  border-color: var(--acento);
  background: color-mix(in srgb, var(--acento) 12%, transparent);
}

/* ---- Ordenar ---- */

.lista-orden {
  list-style: none;
}

.pieza {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: var(--fondo-hueco);
  transition: border-color 0.15s var(--curva);
}

.pieza:hover {
  border-color: var(--borde);
}

.posicion {
  flex: none;
  width: 1.4rem;
  height: 1.4rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid var(--borde);
  font-size: 0.68rem;
  color: var(--texto-apagado);
}

.pieza .texto {
  flex: 1;
  min-width: 0;
  font-family: var(--mono);
  font-size: 0.82rem;
  color: var(--texto-tenue);
  white-space: pre-wrap;
}

.flechas {
  display: flex;
  gap: 0.15rem;
  flex: none;
}

.flechas button {
  border: none;
  padding: 0.1rem 0.35rem;
  font-size: 0.85rem;
  color: var(--texto-apagado);
}

.flechas button:hover:not(:disabled) {
  color: var(--acento);
  background: none;
}

/* ---- Huecos ---- */

.huecos pre {
  margin: 0;
  background: var(--fondo-hueco);
  border: 1px solid var(--borde-suave);
  border-left: 2px solid var(--acento);
  border-radius: var(--redondeo);
  padding: 0.8rem 0.9rem;
  overflow-x: auto;
  font-size: 0.86rem;
  line-height: 2;
  color: var(--texto-tenue);
  white-space: pre-wrap;
}

.hueco {
  font-family: var(--mono);
  font-size: 0.86rem;
  padding: 0.05rem 0.35rem;
  margin: 0 0.1rem;
  border: none;
  border-bottom: 2px solid var(--acento);
  border-radius: 3px 3px 0 0;
  background: color-mix(in srgb, var(--acento) 10%, transparent);
  color: var(--texto);
}

.hueco:focus {
  outline: none;
  background: color-mix(in srgb, var(--acento) 20%, transparent);
}

/* ---- Emparejar ---- */

.parejas {
  gap: 0.35rem;
}

.pareja {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--borde-suave);
  border-radius: var(--redondeo);
  background: var(--fondo-hueco);
}

.pareja .texto {
  flex: none;
  min-width: 8rem;
  font-family: var(--mono);
  font-size: 0.84rem;
  color: var(--acento);
}

.une {
  color: var(--texto-apagado);
  flex: none;
}

.pareja select {
  flex: 1;
  min-width: 0;
  font-size: 0.86rem;
  color: var(--texto-tenue);
  background: var(--fondo-panel);
  border: 1px solid var(--borde);
  border-radius: var(--redondeo);
  padding: 0.25rem 0.4rem;
}

.pareja select:hover {
  border-color: var(--acento);
}
</style>
