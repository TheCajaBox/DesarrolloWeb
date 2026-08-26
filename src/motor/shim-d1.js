// Una imitación de la API de D1 montada sobre el SQLite del navegador.
//
// Sirve para que el alumno escriba EXACTAMENTE el código que escribiría en un
// Worker de verdad —`env.DB.prepare(...).bind(...).all()`— y funcione aquí sin
// cambiar una coma. Cuando lo despliegue, no habrá nada que traducir.
//
// Solo se imita lo que se usa en el temario: prepare, bind, all, first, run y
// batch. No es D1: es lo justo para que el código sea el mismo.
//
// Los parámetros van SIEMPRE enlazados, nunca pegados al texto de la consulta.
// Esa es la razón de que el mundo de seguridad pueda enseñar la diferencia
// ejecutando las dos versiones de verdad.

const asincrono = (valor) => Promise.resolve(valor)

class SentenciaPreparada {
  constructor(motor, sql, base) {
    this.motor = motor
    this.sql = sql
    this.base = base
    this.parametros = []
  }

  bind(...valores) {
    // D1 devuelve una sentencia nueva; aquí igual, para que reutilizar una
    // preparada con distintos parámetros se comporte del mismo modo.
    const copia = new SentenciaPreparada(this.motor, this.sql, this.base)
    copia.parametros = valores
    return copia
  }

  async all() {
    const salida = await this.motor.ejecutar(this.sql, this.parametros, this.base)
    return {
      success: true,
      results: salida.filas,
      meta: { changes: salida.cambios, rows_read: salida.filas.length },
    }
  }

  async first(columna = null) {
    const { results } = await this.all()
    const fila = results[0]
    if (!fila) return null
    return columna === null ? fila : fila[columna]
  }

  async run() {
    const salida = await this.motor.ejecutar(this.sql, this.parametros, this.base)
    return { success: true, meta: { changes: salida.cambios } }
  }

  async raw() {
    const { results } = await this.all()
    return results.map((fila) => Object.values(fila))
  }
}

class BaseFalsa {
  constructor(motor, base) {
    this.motor = motor
    this.base = base
  }

  prepare(sql) {
    return new SentenciaPreparada(this.motor, String(sql), this.base)
  }

  async batch(sentencias) {
    const salidas = []
    for (const sentencia of sentencias) salidas.push(await sentencia.run())
    return salidas
  }

  async exec(guion) {
    await this.motor.ejecutarGuion(String(guion), this.base)
    return { count: 0, duration: 0 }
  }
}

/**
 * Construye un `env` con su DB, listo para pasárselo al handler del alumno.
 * `base` es el nombre de la base de SQLite sobre la que trabajar.
 */
export async function crearEnv(base = 'api', extras = {}) {
  const motor = await import('./sql.js')
  return { DB: new BaseFalsa(motor, base), ...extras }
}

// Por si algún día hace falta comprobar que algo es de aquí.
export { BaseFalsa, SentenciaPreparada, asincrono }
