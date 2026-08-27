// Estado de la consola SQL: la consulta, lo que devolvio, el esquema que hay
// ahora mismo en la base y lo que Wax opina de el.

import { defineStore } from 'pinia'
import { criticar, veredicto } from '../motor/critica-esquema.js'

const MAXIMO_HISTORIAL = 30

export const usarSql = defineStore('sql', {
  state: () => ({
    consulta: '',
    resultado: null,
    error: null,
    esquema: [],
    avisos: [],
    veredicto: '',
    ejecutando: false,
    // El motor son mas de un mega de WebAssembly; se avisa mientras baja.
    arrancando: false,
    listo: false,
    historial: [],
  }),

  getters: {
    hayTablas: (estado) => estado.esquema.length > 0,
    avisosGraves: (estado) => estado.avisos.filter((aviso) => aviso.gravedad === 'alta').length,
  },

  actions: {
    async arrancar() {
      if (this.listo || this.arrancando) return
      this.arrancando = true
      try {
        const motor = await import('../motor/sql.js')
        await motor.abrir()
        this.listo = true
        await this.refrescarEsquema()
      } catch (fallo) {
        this.error = `No ha podido arrancar SQLite: ${fallo.message}`
      } finally {
        this.arrancando = false
      }
    },

    async ejecutar(texto = this.consulta) {
      const sentencia = String(texto || '').trim()
      if (!sentencia || this.ejecutando) return null

      await this.arrancar()
      if (!this.listo) return null

      this.ejecutando = true
      this.error = null

      try {
        const motor = await import('../motor/sql.js')

        // Varias sentencias separadas por punto y coma se ejecutan como guion:
        // es lo que pasa cuando el alumno pega su fichero de migracion entero.
        const varias = sentencia.replace(/;\s*$/, '').includes(';')

        if (varias) {
          await motor.ejecutarGuion(sentencia)
          this.resultado = { columnas: [], filas: [], cambios: 0, guion: true }
        } else {
          this.resultado = await motor.ejecutar(sentencia)
        }

        this.recordar(sentencia)
        await this.refrescarEsquema()
        return this.resultado
      } catch (fallo) {
        // El mensaje que da SQLite es el mismo que daria en produccion. No se
        // reescribe: forma parte de aprender a leerlos.
        this.error = fallo.message
        this.resultado = null
        return null
      } finally {
        this.ejecutando = false
      }
    },

    recordar(sentencia) {
      this.historial = [sentencia, ...this.historial.filter((s) => s !== sentencia)].slice(
        0,
        MAXIMO_HISTORIAL,
      )
    },

    async refrescarEsquema() {
      const motor = await import('../motor/sql.js')
      this.esquema = await motor.esquema()
      this.avisos = criticar(this.esquema)
      this.veredicto = veredicto(this.avisos)
    },

    async reiniciar() {
      const motor = await import('../motor/sql.js')
      await motor.reiniciar()
      this.resultado = null
      this.error = null
      await this.refrescarEsquema()
    },

    // La base de partida de un mundo. Solo se siembra si la base esta VACIA:
    // si ya hay tablas, son SUS tablas y no se tocan. Igual que con los
    // ficheros, un mundo nuevo puede necesitar que algo exista, pero no puede
    // reescribir lo que ya habia.
    async sembrar(guion) {
      if (!guion) return false

      await this.arrancar()
      if (!this.listo) return false

      await this.refrescarEsquema()
      if (this.esquema.length) return false

      const motor = await import('../motor/sql.js')
      try {
        await motor.ejecutarGuion(guion)
      } catch (fallo) {
        this.error = fallo.message
        return false
      }

      await this.refrescarEsquema()
      return true
    },

    // Volver a empezar el mundo: base limpia y la semilla otra vez.
    async reiniciarCon(guion) {
      await this.reiniciar()
      if (!guion) return

      const motor = await import('../motor/sql.js')
      try {
        await motor.ejecutarGuion(guion)
      } catch (fallo) {
        this.error = fallo.message
      }
      await this.refrescarEsquema()
    },
  },
})
