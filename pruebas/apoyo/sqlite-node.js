// El mismo motor de SQL, pero sobre el SQLite que trae Node.
//
// La app usa SQLite compilado a WebAssembly (src/motor/sql.js). Eso no arranca
// cómodamente en vitest, y sin embargo los mundos de base de datos hay que
// probarlos ejecutando SQL DE VERDAD: comprobarlos con expresiones regulares
// sería exactamente lo que este taller predica que no se haga.
//
// Solución: `node:sqlite` (Node 22+) detrás de la MISMA interfaz que el motor
// de la app —ejecutar, ejecutarGuion, esquema, reiniciar—, y las pruebas lo
// inyectan con usarMotorSql(). Si algún día divergen las dos, las pruebas de
// los mundos lo cantan.

import { DatabaseSync } from 'node:sqlite'

const bases = new Map()

function base(nombre = 'taller') {
  if (!bases.has(nombre)) {
    const bd = new DatabaseSync(':memory:')
    bd.exec('PRAGMA foreign_keys = ON')
    bases.set(nombre, bd)
  }
  return bases.get(nombre)
}

export class ErrorSql extends Error {
  constructor(mensaje, sentencia) {
    super(mensaje)
    this.name = 'ErrorSql'
    this.sentencia = sentencia
  }
}

export async function abrir(nombre = 'taller') {
  return base(nombre)
}

export function cerrar(nombre = 'taller') {
  const bd = bases.get(nombre)
  if (bd) {
    bd.close()
    bases.delete(nombre)
  }
}

export async function ejecutar(sentencia, parametros = [], nombre = 'taller') {
  const bd = base(nombre)

  try {
    const preparada = bd.prepare(sentencia)

    // node:sqlite distingue lectura de escritura por si la sentencia devuelve
    // filas; `all()` vale para las dos, pero `run()` da los cambios.
    const devuelveFilas = /^\s*(select|pragma|with|explain)/i.test(sentencia)

    if (devuelveFilas) {
      const filas = preparada.all(...parametros).map((fila) => ({ ...fila }))
      return {
        columnas: filas.length ? Object.keys(filas[0]) : [],
        filas,
        cambios: 0,
      }
    }

    const resultado = preparada.run(...parametros)
    return { columnas: [], filas: [], cambios: Number(resultado.changes || 0) }
  } catch (error) {
    throw new ErrorSql(error && error.message ? error.message : String(error), sentencia)
  }
}

export async function ejecutarGuion(guion, nombre = 'taller') {
  const bd = base(nombre)
  try {
    bd.exec(guion)
  } catch (error) {
    throw new ErrorSql(error && error.message ? error.message : String(error), guion)
  }
}

// Lee el esquema con los mismos PRAGMA y devuelve la MISMA forma que el motor
// de la app: si esto se desvía, las comprobaciones de los mundos mentirían.
export async function esquema(nombre = 'taller') {
  const { filas: tablas } = await ejecutar(
    "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    [],
    nombre,
  )

  const resultado = []

  for (const tabla of tablas) {
    const { filas: columnas } = await ejecutar(`PRAGMA table_info("${tabla.name}")`, [], nombre)
    const { filas: ajenas } = await ejecutar(`PRAGMA foreign_key_list("${tabla.name}")`, [], nombre)
    const { filas: indices } = await ejecutar(`PRAGMA index_list("${tabla.name}")`, [], nombre)

    const columnasPorIndice = {}
    for (const indice of indices) {
      const { filas } = await ejecutar(`PRAGMA index_info("${indice.name}")`, [], nombre)
      columnasPorIndice[indice.name] = filas.map((fila) => fila.name)
    }

    resultado.push({
      nombre: tabla.name,
      sql: tabla.sql,
      columnas: columnas.map((columna) => ({
        nombre: columna.name,
        tipo: columna.type || '',
        obligatoria: columna.notnull === 1,
        porDefecto: columna.dflt_value,
        clavePrimaria: columna.pk > 0,
        ordenEnClave: columna.pk,
      })),
      clavesAjenas: ajenas.map((ajena) => ({
        columna: ajena.from,
        tablaDestino: ajena.table,
        columnaDestino: ajena.to,
        alBorrar: ajena.on_delete,
      })),
      indices: indices.map((indice) => ({
        nombre: indice.name,
        unico: indice.unique === 1,
        automatico: indice.origin !== 'c',
        columnas: columnasPorIndice[indice.name] || [],
      })),
    })
  }

  return resultado
}

export async function reiniciar(nombre = 'taller') {
  cerrar(nombre)
  return abrir(nombre)
}
