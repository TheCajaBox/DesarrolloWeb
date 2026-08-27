// Comprobaciones de base de datos.
//
// Aquí no se leen ficheros: se le pregunta a SQLite. El esquema se lee con
// PRAGMA (lo que la base ENTENDIÓ, no lo que la alumna creyó escribir) y las
// consultas se ejecutan de verdad. Si su CREATE TABLE dice otra cosa de la que
// pensaba, aquí sale.
//
// El motor es inyectable (`usarMotorSql`) por una razón concreta: en la app es
// SQLite compilado a WebAssembly, y en las pruebas es el `node:sqlite` que
// trae Node. Así los mundos SQL se validan ejecutando SQL auténtico en las dos
// partes, y no a base de expresiones regulares.

import { criticar } from '../../motor/critica-esquema.js'

let motorPuesto = null

/** Cambia el motor de SQL (las pruebas ponen el de Node). */
export function usarMotorSql(motor) {
  motorPuesto = motor
}

async function motorSql() {
  if (motorPuesto) return motorPuesto
  // Import perezoso: SQLite pesa más de un mega y la mayoría de los mundos no
  // lo tocan.
  return import('../../motor/sql.js')
}

// Lo que recibe cada requisito: el esquema ya leído, atajos para buscar en él,
// y la posibilidad de consultar la base.
async function ayudasDe(base) {
  const motor = await motorSql()
  const esquema = await motor.esquema(base)

  const tabla = (nombre) =>
    esquema.find((t) => t.nombre.toLowerCase() === String(nombre || '').toLowerCase()) || null

  const columna = (nombreTabla, nombreColumna) => {
    const encontrada = tabla(nombreTabla)
    if (!encontrada) return null
    return (
      encontrada.columnas.find(
        (c) => c.nombre.toLowerCase() === String(nombreColumna || '').toLowerCase(),
      ) || null
    )
  }

  return {
    esquema,
    tabla,
    columna,
    avisos: criticar(esquema),
    consultar: (sentencia, parametros = []) => motor.ejecutar(sentencia, parametros, base),
    // Cuántas filas hay en una tabla. Devuelve null si la tabla no existe.
    async cuantasFilas(nombre) {
      if (!tabla(nombre)) return null
      const { filas } = await motor.ejecutar(`SELECT COUNT(*) AS n FROM "${nombre}"`, [], base)
      return Number(filas[0]?.n ?? 0)
    },
  }
}

/**
 * Una comprobación sobre la base de datos. Los requisitos se evalúan en orden
 * y gana el primero que falle, como en las demás.
 *
 * Cada requisito recibe las ayudas y devuelve un mensaje de problema, o null
 * si está bien. Pueden ser asíncronos (para consultar).
 */
export function comprobarSql({ requisitos, exito, base = 'taller' }) {
  if (!exito) throw new Error('comprobarSql necesita un mensaje de éxito')

  return async () => {
    let ayudas
    try {
      ayudas = await ayudasDe(base)
    } catch (fallo) {
      return {
        superado: false,
        mensaje: `No he podido leer la base de datos: ${fallo.message}`,
      }
    }

    for (const requisito of requisitos) {
      let problema
      try {
        problema = await requisito(ayudas)
      } catch (fallo) {
        // Un error de SQLite al comprobar es información, no una avería: casi
        // siempre significa que falta algo que el paso pide.
        problema = `Al comprobarlo, la base ha dicho: ${fallo.message}`
      }
      if (problema) return { superado: false, mensaje: problema }
    }

    return {
      superado: true,
      mensaje: typeof exito === 'function' ? await exito(ayudas) : exito,
    }
  }
}

// ---------------------------------------------------------------------------
// Requisitos de esquema
// ---------------------------------------------------------------------------

/** Que exista la tabla. */
export function hayTabla(nombre, { falta } = {}) {
  return ({ tabla, esquema }) => {
    if (tabla(nombre)) return null
    if (!esquema.length) {
      return falta || `Todavía no hay ninguna tabla. Este paso pide crear «${nombre}».`
    }
    const nombres = esquema.map((t) => t.nombre).join(', ')
    return (
      falta ||
      `No encuentro la tabla «${nombre}». Lo que hay ahora mismo: ${nombres}. Ojo al nombre exacto.`
    )
  }
}

/**
 * Que la tabla tenga esa columna, y si se pide, con ese tipo y obligatoria.
 *   tieneColumna('sombreros', 'precio', { tipo: /INT|REAL|NUM/, obligatoria: true })
 */
export function tieneColumna(nombreTabla, nombreColumna, { tipo, obligatoria, falta, malo } = {}) {
  return ({ tabla, columna }) => {
    if (!tabla(nombreTabla)) return `Falta la tabla «${nombreTabla}».`

    const encontrada = columna(nombreTabla, nombreColumna)
    if (!encontrada) {
      const tiene = tabla(nombreTabla)
        .columnas.map((c) => c.nombre)
        .join(', ')
      return falta || `A «${nombreTabla}» le falta la columna «${nombreColumna}». Tiene: ${tiene}.`
    }

    if (tipo && !tipo.test(encontrada.tipo || '')) {
      return (
        malo ||
        `«${nombreColumna}» está declarada como ${encontrada.tipo || 'sin tipo'}, y para lo que guarda no es el tipo adecuado.`
      )
    }

    if (obligatoria && !encontrada.obligatoria) {
      return `«${nombreColumna}» admite vacíos. Si el dato es imprescindible, márcala NOT NULL.`
    }

    return null
  }
}

/** Que la tabla tenga clave primaria (y si se pide, en esa columna). */
export function tieneClavePrimaria(nombreTabla, columnaEsperada = null, { falta } = {}) {
  return ({ tabla }) => {
    const encontrada = tabla(nombreTabla)
    if (!encontrada) return `Falta la tabla «${nombreTabla}».`

    const claves = encontrada.columnas.filter((c) => c.clavePrimaria)
    if (!claves.length) {
      return (
        falta ||
        `«${nombreTabla}» no tiene clave primaria. Sin ella no hay forma segura de señalar una fila concreta.`
      )
    }

    if (columnaEsperada && !claves.some((c) => c.nombre.toLowerCase() === columnaEsperada.toLowerCase())) {
      return `La clave primaria de «${nombreTabla}» es ${claves.map((c) => c.nombre).join(', ')}, y este paso la pide en «${columnaEsperada}».`
    }

    return null
  }
}

/**
 * Que exista la clave ajena: `desde.columna` apunta a `hacia`.
 * Con `alBorrar` se exige además el comportamiento (CASCADE, SET NULL...).
 */
export function tieneClaveAjena(
  nombreTabla,
  nombreColumna,
  tablaDestino,
  { alBorrar, falta } = {},
) {
  return ({ tabla }) => {
    const encontrada = tabla(nombreTabla)
    if (!encontrada) return `Falta la tabla «${nombreTabla}».`

    const ajena = encontrada.clavesAjenas.find(
      (a) => a.columna.toLowerCase() === String(nombreColumna).toLowerCase(),
    )

    if (!ajena) {
      return (
        falta ||
        `«${nombreTabla}.${nombreColumna}» no es una clave ajena: la base no sabe que apunta a «${tablaDestino}». Declárala con REFERENCES.`
      )
    }

    if (ajena.tablaDestino.toLowerCase() !== String(tablaDestino).toLowerCase()) {
      return `«${nombreTabla}.${nombreColumna}» apunta a «${ajena.tablaDestino}», y debería apuntar a «${tablaDestino}».`
    }

    if (alBorrar && String(ajena.alBorrar || '').toUpperCase() !== alBorrar.toUpperCase()) {
      return `A esa clave ajena le falta ON DELETE ${alBorrar} (ahora hace «${ajena.alBorrar || 'NO ACTION'}»).`
    }

    return null
  }
}

/**
 * Que haya un índice escrito a mano que empiece por esa columna. El orden
 * importa: un índice sobre (a, b) sirve para buscar por `a`, uno sobre (b, a)
 * no.
 */
export function tieneIndice(nombreTabla, nombreColumna, { falta } = {}) {
  return ({ tabla }) => {
    const encontrada = tabla(nombreTabla)
    if (!encontrada) return `Falta la tabla «${nombreTabla}».`

    const suyo = encontrada.indices.filter((i) => !i.automatico)
    const bueno = suyo.some(
      (i) => (i.columnas[0] || '').toLowerCase() === String(nombreColumna).toLowerCase(),
    )

    if (bueno) return null

    if (!suyo.length) {
      return (
        falta ||
        `«${nombreTabla}» no tiene ningún índice propio. Este paso pide uno que empiece por «${nombreColumna}».`
      )
    }

    return `Hay índices en «${nombreTabla}», pero ninguno empieza por «${nombreColumna}»: ${suyo
      .map((i) => `(${i.columnas.join(', ')})`)
      .join(', ')}. El orden de las columnas importa.`
  }
}

// ---------------------------------------------------------------------------
// Requisitos de datos y de consultas
// ---------------------------------------------------------------------------

/**
 * Que exista una vista con ese nombre.
 *
 * Las vistas son la forma de comprobar que se ha aprendido a CONSULTAR: un
 * SELECT suelto no deja huella en la base, pero una vista sí, y se le puede
 * pedir sus filas para ver si la consulta dice lo que tenía que decir. Además
 * son parte del oficio: una consulta que se repite acaba siendo una vista.
 */
export function hayVista(nombre, { falta } = {}) {
  return async ({ consultar }) => {
    const { filas } = await consultar(
      "SELECT name FROM sqlite_master WHERE type = 'view' AND lower(name) = lower(?)",
      [String(nombre)],
    )
    if (filas.length) return null
    return falta || `No existe la vista «${nombre}». Se crea con CREATE VIEW ${nombre} AS SELECT …`
  }
}

/**
 * Que una vista (o tabla) devuelva exactamente estos valores en una columna,
 * en cualquier orden salvo que se pida ordenado.
 */
export function laVistaDevuelve(nombre, columna, esperados, { ordenado = false, mensaje } = {}) {
  return async ({ consultar }) => {
    const { filas } = await consultar(`SELECT * FROM "${nombre}"`)

    if (!filas.length) {
      return `La vista «${nombre}» no devuelve ninguna fila, y debería devolver ${esperados.length}.`
    }

    if (!(columna in filas[0])) {
      return `«${nombre}» no trae la columna «${columna}». Trae: ${Object.keys(filas[0]).join(', ')}.`
    }

    const salieron = filas.map((fila) => String(fila[columna]))
    const querido = esperados.map(String)

    const iguales = ordenado
      ? salieron.length === querido.length && salieron.every((v, i) => v === querido[i])
      : salieron.length === querido.length &&
        [...salieron].sort().every((v, i) => v === [...querido].sort()[i])

    if (iguales) return null

    return (
      mensaje ||
      `«${nombre}» devuelve ${salieron.length} fila${salieron.length === 1 ? '' : 's'} (${salieron
        .slice(0, 5)
        .join(', ')}) y se esperaban ${querido.length}: ${querido.slice(0, 5).join(', ')}.${
        ordenado ? ' Y el orden importa en este paso.' : ''
      }`
    )
  }
}

/**
 * Que la vista devuelva LO MISMO que esta consulta de referencia.
 *
 * Es más robusto que esperar una lista fija de nombres: los pasos siguientes
 * del mundo cambian los datos (un DELETE, un UPDATE), y una lista escrita a
 * mano se quedaría vieja. Comparando contra la consulta equivalente se
 * comprueba lo que importa —que la vista PREGUNTA bien— con independencia de
 * lo que haya dentro de la tabla en ese momento.
 */
export function laVistaEquivaleA(nombre, consulta, { columna, ordenado = false, mensaje } = {}) {
  return async ({ consultar }) => {
    const suya = await consultar(`SELECT * FROM "${nombre}"`)
    const referencia = await consultar(consulta)

    const clave = columna || referencia.columnas[0]

    if (suya.filas.length && !(clave in suya.filas[0])) {
      return `«${nombre}» no trae la columna «${clave}». Trae: ${Object.keys(suya.filas[0]).join(', ')}.`
    }

    const valores = (filas) => filas.map((fila) => String(fila[clave]))
    const salieron = valores(suya.filas)
    const querido = valores(referencia.filas)

    const iguales = ordenado
      ? salieron.length === querido.length && salieron.every((v, i) => v === querido[i])
      : salieron.length === querido.length &&
        [...salieron].sort().every((v, i) => v === [...querido].sort()[i])

    if (iguales) return null

    return (
      mensaje ||
      `«${nombre}» devuelve ${salieron.length} fila${salieron.length === 1 ? '' : 's'}${
        salieron.length ? ` (${salieron.slice(0, 4).join(', ')})` : ''
      } y debería devolver ${querido.length}${
        querido.length ? ` (${querido.slice(0, 4).join(', ')})` : ''
      }.${ordenado ? ' Y en ese orden.' : ''}`
    )
  }
}

/** Que la tabla tenga al menos tantas filas. */
export function hayFilas(nombreTabla, minimo, { pocas } = {}) {
  return async ({ cuantasFilas }) => {
    const cuantas = await cuantasFilas(nombreTabla)
    if (cuantas === null) return `Falta la tabla «${nombreTabla}».`
    if (cuantas < minimo) {
      return pocas
        ? pocas(cuantas, minimo)
        : `«${nombreTabla}» tiene ${cuantas} fila${cuantas === 1 ? '' : 's'} y hacen falta ${minimo}.`
    }
    return null
  }
}

/**
 * Comprueba el resultado de una consulta propia (no la de la alumna): sirve
 * para verificar que los DATOS quedaron como pide el paso.
 *   comprobando('SELECT COUNT(*) AS n FROM cesta', (filas) => filas[0].n === 3 ? null : '…')
 */
export function comprobando(sentencia, revisar) {
  return async ({ consultar }) => {
    const { filas, columnas } = await consultar(sentencia)
    return revisar(filas, columnas)
  }
}

/**
 * Que el esquema no tenga avisos graves de los que Wax señala (fechas en
 * columna sin tipo, claves ajenas sin índice, booleanos como texto...).
 */
export function esquemaLimpio({ mensaje } = {}) {
  return ({ avisos }) => {
    const graves = avisos.filter((aviso) => aviso.gravedad === 'alta')
    if (!graves.length) return null

    const primero = graves[0]
    return (
      mensaje ||
      `El esquema funciona, pero Wax ve algo que dolerá dentro de seis meses: ${primero.titulo}. Míralo en la pestaña Esquema.`
    )
  }
}
