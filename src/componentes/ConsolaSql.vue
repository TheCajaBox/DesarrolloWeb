<script setup>
// La consola SQL. Lo que se escribe aqui lo ejecuta SQLite de verdad, el mismo
// motor que hay detras de D1. Los errores son los suyos, sin retocar: leerlos
// forma parte de aprender.
import { onMounted, ref } from 'vue'
import { usarSql } from '../almacen/sql.js'
import { usarColeccion } from '../almacen/coleccion.js'

// Steris traduce el error, pero el error original se sigue enseñando: leerlos
// es parte de lo que hay que aprender.
const emitir = defineEmits(['explicar-error'])

const coleccion = usarColeccion()

// Preguntarle a los datos a la cara, sin que ninguna lección lo mande.
function lanzar() {
  coleccion.encontrar('sombrero-de-las-tablas')
  sql.ejecutar()
}

const sql = usarSql()
const caja = ref(null)

onMounted(() => sql.arrancar())

function alTeclear(evento) {
  // Ctrl+Enter ejecuta, como en cualquier consola. Enter a secas hace salto de
  // linea, que en SQL hace falta constantemente.
  if (evento.key === 'Enter' && (evento.ctrlKey || evento.metaKey)) {
    evento.preventDefault()
    sql.ejecutar()
  }
}

function reusar(sentencia) {
  sql.consulta = sentencia
  if (caja.value) caja.value.focus()
}

// null y '' se ven igual en una tabla, y no son lo mismo en absoluto.
function mostrar(valor) {
  if (valor === null || valor === undefined) return null
  if (valor === '') return null
  return String(valor)
}

function etiquetaVacia(valor) {
  if (valor === null || valor === undefined) return 'NULL'
  if (valor === '') return 'vacío'
  return ''
}
</script>

<template>
  <div class="consola">
    <div class="editor-sql">
      <textarea
        ref="caja"
        v-model="sql.consulta"
        spellcheck="false"
        placeholder="CREATE TABLE sombreros (&#10;  id INTEGER PRIMARY KEY,&#10;  nombre TEXT NOT NULL&#10;);"
        @keydown="alTeclear"
      ></textarea>
      <div class="botones">
        <button class="principal" :disabled="sql.ejecutando || !sql.consulta.trim()" @click="lanzar">
          {{ sql.ejecutando ? 'Ejecutando…' : 'Ejecutar' }}
        </button>
        <span class="atajo">Ctrl+Enter</span>
        <span class="hueco"></span>
        <button class="mini" title="Vaciar la base y empezar de cero" @click="sql.reiniciar()">
          Vaciar la base
        </button>
      </div>
    </div>

    <div class="salida">
      <p v-if="sql.arrancando" class="nota">Bajando SQLite&hellip; (es más de un mega, va una sola vez)</p>

      <template v-else-if="sql.error">
        <p class="fallo">{{ sql.error }}</p>
        <button class="preguntar" @click="emitir('explicar-error', sql.error)">
          ¿Qué significa esto?
        </button>
      </template>

      <template v-else-if="sql.resultado">
        <p v-if="sql.resultado.guion" class="nota bien">Guion ejecutado entero, sin quejas.</p>

        <p v-else-if="!sql.resultado.columnas.length" class="nota bien">
          Hecho.
          <span v-if="sql.resultado.cambios">{{ sql.resultado.cambios }} fila(s) afectada(s).</span>
        </p>

        <p v-else-if="!sql.resultado.filas.length" class="nota">
          La consulta es válida, pero no ha devuelto ninguna fila.
        </p>

        <div v-else class="tabla-fuera">
          <table>
            <thead>
              <tr>
                <th v-for="col in sql.resultado.columnas" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, i) in sql.resultado.filas" :key="i">
                <td v-for="col in sql.resultado.columnas" :key="col">
                  <span v-if="mostrar(fila[col]) !== null">{{ mostrar(fila[col]) }}</span>
                  <span v-else class="nulo">{{ etiquetaVacia(fila[col]) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="cuenta">{{ sql.resultado.filas.length }} fila(s)</p>
        </div>
      </template>

      <p v-else class="nota">Escribe una consulta y dale a Ejecutar.</p>

      <details v-if="sql.historial.length" class="historial">
        <summary>Lo que ya has ejecutado ({{ sql.historial.length }})</summary>
        <ul>
          <li v-for="(sentencia, i) in sql.historial" :key="i">
            <button @click="reusar(sentencia)">{{ sentencia }}</button>
          </li>
        </ul>
      </details>
    </div>
  </div>
</template>

<style scoped>
.consola {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.editor-sql {
  border-bottom: 1px solid var(--borde);
}

textarea {
  width: 100%;
  min-height: 7rem;
  resize: vertical;
  border: none;
  background: var(--fondo-hueco);
  color: var(--texto);
  font-family: var(--mono);
  font-size: 0.82rem;
  line-height: 1.5;
  padding: 0.6rem 0.7rem;
}

textarea:focus {
  outline: none;
}

.botones {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: var(--fondo-panel);
}

.atajo {
  font-size: 0.7rem;
  color: var(--texto-apagado);
  font-family: var(--mono);
}

.hueco {
  flex: 1;
}

.mini {
  border: none;
  font-size: 0.76rem;
  color: var(--texto-apagado);
  padding: 0.3rem 0.4rem;
}

.mini:hover {
  color: var(--oxido);
  background: transparent;
}

.salida {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.7rem;
}

.nota {
  margin: 0;
  font-size: 0.83rem;
  color: var(--texto-apagado);
}

.nota.bien {
  color: var(--verde);
}

.fallo {
  margin: 0;
  font-family: var(--mono);
  font-size: 0.8rem;
  color: var(--rojo);
  border-left: 3px solid var(--rojo);
  padding-left: 0.6rem;
  white-space: pre-wrap;
}

.preguntar {
  margin-top: 0.5rem;
  font-size: 0.78rem;
  color: var(--verde);
  border-color: var(--borde);
}

.preguntar:hover {
  border-color: var(--verde);
  background: rgb(127 160 90 / 0.08);
}

/* La tabla se desplaza dentro de su caja; la pagina nunca de lado. */
.tabla-fuera {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  font-size: 0.8rem;
  font-family: var(--mono);
  min-width: 100%;
}

th,
td {
  border: 1px solid var(--borde-suave);
  padding: 0.25rem 0.5rem;
  text-align: left;
  white-space: nowrap;
}

th {
  background: var(--fondo-hueco);
  color: var(--acento);
  font-weight: 600;
}

.nulo {
  color: var(--texto-apagado);
  font-style: italic;
}

.cuenta {
  margin: 0.4rem 0 0;
  font-size: 0.72rem;
  color: var(--texto-apagado);
}

.historial {
  margin-top: 1rem;
  font-size: 0.78rem;
  color: var(--texto-apagado);
}

.historial summary {
  cursor: pointer;
}

.historial ul {
  list-style: none;
  margin: 0.4rem 0 0;
  padding: 0;
}

.historial button {
  display: block;
  width: 100%;
  border: none;
  padding: 0.2rem 0.3rem;
  text-align: left;
  font-family: var(--mono);
  font-size: 0.74rem;
  color: var(--texto-tenue);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.historial button:hover {
  background: color-mix(in srgb, var(--acento) 8%, transparent);
  border-color: transparent;
  color: var(--acento);
}
</style>
