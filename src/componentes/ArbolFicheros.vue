<script setup>
// El panel lateral de ficheros. Recursivo: una carpeta se dibuja a si misma.
import { ref } from 'vue'

const props = defineProps({
  nodo: { type: Object, required: true },
  rutaActiva: { type: String, default: null },
  nivel: { type: Number, default: 0 },
})

const emitir = defineEmits(['abrir', 'borrar', 'renombrar'])

const plegadas = ref(new Set())

function alternar(ruta) {
  const copia = new Set(plegadas.value)
  copia.has(ruta) ? copia.delete(ruta) : copia.add(ruta)
  plegadas.value = copia
}

const ICONOS = {
  html: '◧',
  css: '◑',
  js: '◈',
  json: '◇',
  sql: '▤',
  md: '▭',
  svg: '◬',
}

const iconoDe = (extension) => ICONOS[extension] || '·'
</script>

<template>
  <ul class="arbol" :style="{ '--nivel': nivel }">
    <li v-for="hijo in nodo.hijos" :key="hijo.ruta">
      <template v-if="hijo.tipo === 'carpeta'">
        <button class="fila carpeta" @click="alternar(hijo.ruta)">
          <span class="flecha">{{ plegadas.has(hijo.ruta) ? '▸' : '▾' }}</span>
          <span class="nombre">{{ hijo.nombre }}</span>
        </button>
        <ArbolFicheros
          v-if="!plegadas.has(hijo.ruta)"
          :nodo="hijo"
          :ruta-activa="rutaActiva"
          :nivel="nivel + 1"
          @abrir="emitir('abrir', $event)"
          @borrar="emitir('borrar', $event)"
          @renombrar="emitir('renombrar', $event)"
        />
      </template>

      <div v-else class="fila-fichero" :class="{ activa: hijo.ruta === rutaActiva }">
        <button class="fila" @click="emitir('abrir', hijo.ruta)">
          <span class="icono">{{ iconoDe(hijo.extension) }}</span>
          <span class="nombre">{{ hijo.nombre }}</span>
        </button>
        <span class="acciones">
          <button class="mini" title="Renombrar" @click="emitir('renombrar', hijo.ruta)">✎</button>
          <button class="mini" title="Borrar" @click="emitir('borrar', hijo.ruta)">×</button>
        </span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.arbol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.fila {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  border: none;
  border-radius: 0;
  padding: 0.22rem 0.5rem 0.22rem calc(0.5rem + var(--nivel) * 0.85rem);
  text-align: left;
  font-size: 0.88rem;
  color: var(--texto-tenue);
}

.fila:hover {
  background: color-mix(in srgb, var(--acento) 7%, transparent);
  border-color: transparent;
  color: var(--texto);
}

.fila-fichero {
  display: flex;
  align-items: center;
}

.fila-fichero.activa .fila {
  background: color-mix(in srgb, var(--acento) 12%, transparent);
  color: var(--acento);
}

.icono,
.flecha {
  width: 1em;
  flex: none;
  color: var(--texto-apagado);
  font-size: 0.8em;
}

.fila-fichero.activa .icono {
  color: var(--acento);
}

.nombre {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.acciones {
  display: flex;
  gap: 0.15rem;
  padding-right: 0.35rem;
  opacity: 0;
}

.fila-fichero:hover .acciones,
.fila-fichero:focus-within .acciones {
  opacity: 1;
}

.mini {
  border: none;
  padding: 0.1rem 0.3rem;
  font-size: 0.85rem;
  line-height: 1;
  color: var(--texto-apagado);
}

.mini:hover {
  color: var(--oxido);
  background: transparent;
  border-color: transparent;
}
</style>
