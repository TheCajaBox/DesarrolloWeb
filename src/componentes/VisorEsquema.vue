<script setup>
// El esquema que hay ahora mismo en la base, leido con PRAGMA, y lo que Wax
// opina de el.
//
// No es un diagrama con lineas: son fichas por tabla mas la lista explicita de
// relaciones. Un diagrama autocolocado con cuatro tablas sale bonito y con
// nueve sale ilegible, y aqui lo que importa es entender que apunta a que.
import { computed } from 'vue'
import { usarSql } from '../almacen/sql.js'
import Narrador from './Narrador.vue'

const sql = usarSql()

const relaciones = computed(() =>
  sql.esquema.flatMap((tabla) =>
    tabla.clavesAjenas.map((ajena) => ({
      desde: `${tabla.nombre}.${ajena.columna}`,
      hasta: `${ajena.tablaDestino}.${ajena.columnaDestino || 'id'}`,
      alBorrar: ajena.alBorrar,
    })),
  ),
)

const COLOR = { alta: 'grave', media: 'medio', baja: 'leve' }

function esAjena(tabla, nombreColumna) {
  return tabla.clavesAjenas.some((ajena) => ajena.columna === nombreColumna)
}
</script>

<template>
  <div class="visor">
    <p v-if="!sql.hayTablas" class="vacio">
      La base está vacía. En cuanto ejecutes un <code>CREATE TABLE</code>, aparecerá aquí.
    </p>

    <template v-else>
      <section class="tablas">
        <article v-for="tabla in sql.esquema" :key="tabla.nombre" class="ficha-tabla">
          <h3>{{ tabla.nombre }}</h3>
          <ul>
            <li v-for="columna in tabla.columnas" :key="columna.nombre">
              <span class="marcas">
                <span v-if="columna.clavePrimaria" class="marca pk" title="Clave primaria">PK</span>
                <span v-else-if="esAjena(tabla, columna.nombre)" class="marca fk" title="Clave ajena">FK</span>
              </span>
              <span class="col">{{ columna.nombre }}</span>
              <span class="tipo">{{ columna.tipo || 'sin tipo' }}</span>
              <span v-if="columna.obligatoria" class="obligatoria" title="NOT NULL">•</span>
            </li>
          </ul>
          <p v-if="tabla.indices.filter((i) => !i.automatico).length" class="indices">
            índices:
            {{ tabla.indices.filter((i) => !i.automatico).map((i) => i.columnas.join(', ')).join(' | ') }}
          </p>
        </article>
      </section>

      <section v-if="relaciones.length" class="relaciones">
        <h4>Relaciones</h4>
        <ul>
          <li v-for="(rel, i) in relaciones" :key="i">
            <code>{{ rel.desde }}</code> → <code>{{ rel.hasta }}</code>
            <span v-if="rel.alBorrar && rel.alBorrar !== 'NO ACTION'" class="al-borrar">
              al borrar: {{ rel.alBorrar }}
            </span>
          </li>
        </ul>
      </section>

      <section class="critica">
        <Narrador quien="wax" :texto="sql.veredicto" />

        <ul v-if="sql.avisos.length" class="avisos">
          <li v-for="(aviso, i) in sql.avisos" :key="i" :class="COLOR[aviso.gravedad]">
            <strong>{{ aviso.titulo }}</strong>
            <p>{{ aviso.explicacion }}</p>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.visor {
  height: 100%;
  overflow-y: auto;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.vacio {
  margin: 0;
  color: var(--texto-apagado);
  font-size: 0.85rem;
}

.vacio code {
  color: var(--acento);
}

.tablas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 0.6rem;
}

.ficha-tabla {
  border: 1px solid var(--borde);
  border-radius: var(--redondeo);
  background: var(--fondo-hueco);
  padding: 0.5rem 0.6rem;
}

.ficha-tabla h3 {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  color: var(--acento);
  font-family: var(--mono);
}

.ficha-tabla ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.ficha-tabla li {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-family: var(--mono);
  font-size: 0.74rem;
}

.marcas {
  flex: none;
  width: 1.5rem;
}

.marca {
  font-size: 0.6rem;
  padding: 0.05rem 0.2rem;
  border-radius: 2px;
}

.marca.pk {
  background: color-mix(in srgb, var(--acento) 20%, transparent);
  color: var(--acento);
}

.marca.fk {
  background: rgb(181 97 58 / 0.2);
  color: var(--oxido);
}

.col {
  color: var(--texto-tenue);
}

.tipo {
  margin-left: auto;
  color: var(--texto-apagado);
  font-size: 0.68rem;
}

.obligatoria {
  color: var(--verde);
  flex: none;
}

.indices {
  margin: 0.4rem 0 0;
  font-size: 0.66rem;
  color: var(--texto-apagado);
  font-family: var(--mono);
}

.relaciones h4,
.critica h4 {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--texto-apagado);
}

.relaciones ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.78rem;
}

.relaciones code {
  color: var(--texto-tenue);
}

.al-borrar {
  color: var(--texto-apagado);
  font-size: 0.7rem;
  margin-left: 0.4rem;
}

.critica {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.avisos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.avisos li {
  border-left: 3px solid var(--borde);
  padding-left: 0.6rem;
}

.avisos li.grave {
  border-color: var(--rojo);
}

.avisos li.medio {
  border-color: var(--oxido);
}

.avisos li.leve {
  border-color: var(--borde);
}

.avisos strong {
  font-size: 0.83rem;
  color: var(--texto);
  font-weight: 600;
}

.avisos p {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--texto-tenue);
}
</style>
