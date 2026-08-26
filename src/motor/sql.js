// SQLite de verdad, compilado a WebAssembly y corriendo en el navegador.
//
// Cuando el alumno escribe CREATE TABLE, se ejecuta un CREATE TABLE. No hay
// simulacion ni comprobacion por expresiones regulares: si su esquema esta mal,
// SQLite se lo dira con el mismo mensaje que le daria en produccion.
//
// PENDIENTE: esto corre en el hilo principal. Va de sobra para las consultas
// del temario, pero un CTE recursivo mal escrito congelaria la pestana. Antes
// de dar por cerrado el Mundo 6 hay que moverlo a un Web Worker. La API de
// aqui ya es asincrona precisamente para que ese cambio no toque a nadie mas.

// Sin import estatico a proposito: SQLite compilado a WebAssembly pesa mas de
// un mega, y la mayoria de los mundos no lo tocan. Se descarga la primera vez
// que alguien abre la consola, no al entrar al taller.

let sqlite3 = null
const bases = new Map()

async function motor() {
  if (!sqlite3) {
    const { default: iniciarSqlite } = await import('@sqlite.org/sqlite-wasm')
    sqlite3 = await iniciarSqlite({
      // La libreria escribe avisos por consola sobre OPFS que aqui no vienen
      // a cuento, porque persistimos nosotros en IndexedDB.
      print: () => {},
      printErr: (mensaje) => console.warn('[sqlite]', mensaje),
    })
  }
  return sqlite3
}

export async function abrir(nombre = 'taller') {
  if (bases.has(nombre)) return bases.get(nombre)

  const motorSqlite = await motor()
  const bd = new motorSqlite.oo1.DB(':memory:')
  // Sin esto SQLite acepta claves ajenas rotas sin rechistar, y el Mundo 5 va
  // justo de que las claves ajenas signifiquen algo.
  bd.exec('PRAGMA foreign_keys = ON')

  bases.set(nombre, bd)
  return bd
}

export function cerrar(nombre = 'taller') {
  const bd = bases.get(nombre)
  if (bd) {
    bd.close()
    bases.delete(nombre)
  }
}

export class ErrorSql extends Error {
  constructor(mensaje, sentencia) {
    super(mensaje)
    this.name = 'ErrorSql'
    this.sentencia = sentencia
  }
}

// Ejecuta una sentencia y devuelve columnas y filas. Los parametros van
// enlazados, nunca interpolados: el Mundo 8 explica por que.
export async function ejecutar(sentencia, parametros = [], nombre = 'taller') {
  const bd = await abrir(nombre)
  const filas = []
  let columnas = []

  try {
    bd.exec({
      sql: sentencia,
      bind: parametros.length ? parametros : undefined,
      rowMode: 'object',
      columnNames: (columnas = []),
      callback: (fila) => {
        filas.push(fila)
      },
    })
  } catch (error) {
    throw new ErrorSql(error && error.message ? error.message : String(error), sentencia)
  }

  return {
    columnas,
    filas,
    // Cuantas filas ha tocado el ultimo INSERT/UPDATE/DELETE.
    cambios: bd.changes(),
  }
}

// Varias sentencias seguidas, como el fichero de migracion que escribe el
// alumno. Si una falla, se dice cual.
export async function ejecutarGuion(guion, nombre = 'taller') {
  const bd = await abrir(nombre)
  try {
    bd.exec(guion)
  } catch (error) {
    throw new ErrorSql(error && error.message ? error.message : String(error), guion)
  }
}

// Lee el esquema real de la base: tablas, columnas y claves ajenas. Es lo que
// alimenta al visor y a la critica de Wax.
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

    // index_list solo da los nombres. Para saber que columnas cubre cada
    // indice hace falta preguntarselo uno por uno, y sin eso no se puede
    // detectar la trampa de la clave ajena sin indexar.
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
        // origin 'c' es un CREATE INDEX escrito a mano; 'u' y 'pk' son los
        // que SQLite crea solo por un UNIQUE o una clave primaria.
        automatico: indice.origin !== 'c',
        columnas: columnasPorIndice[indice.name] || [],
      })),
    })
  }

  return resultado
}

// Vuelca la base entera a bytes, para guardarla en IndexedDB entre sesiones.
export async function exportar(nombre = 'taller') {
  const motorSqlite = await motor()
  const bd = await abrir(nombre)
  return motorSqlite.capi.sqlite3_js_db_export(bd.pointer)
}

export async function importar(bytes, nombre = 'taller') {
  const motorSqlite = await motor()
  cerrar(nombre)

  const bd = new motorSqlite.oo1.DB(':memory:')
  const puntero = motorSqlite.wasm.allocFromTypedArray(bytes)

  try {
    motorSqlite.capi.sqlite3_deserialize(
      bd.pointer,
      'main',
      puntero,
      bytes.byteLength,
      bytes.byteLength,
      motorSqlite.capi.SQLITE_DESERIALIZE_FREEONCLOSE | motorSqlite.capi.SQLITE_DESERIALIZE_RESIZEABLE,
    )
  } catch (error) {
    motorSqlite.wasm.dealloc(puntero)
    throw error
  }

  bd.exec('PRAGMA foreign_keys = ON')
  bases.set(nombre, bd)
  return bd
}

// Tira la base y empieza de cero. El boton de "volver a empezar" del Mundo 5.
export async function reiniciar(nombre = 'taller') {
  cerrar(nombre)
  return abrir(nombre)
}
