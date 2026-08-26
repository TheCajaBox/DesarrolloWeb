// Estado del mundo que se esta jugando: en que paso va, que ha superado y que
// le ha dicho la comprobacion.
//
// El progreso se manda a D1 cuando se supera un paso, no en cada pulsacion.
// Son unas pocas escrituras por sesion. Si no hay sesion (por ejemplo antes de
// activar Access) el envio falla en silencio y el juego sigue: el progreso
// local no depende del servidor.

import { defineStore } from 'pinia'
import mundos, { mundoDespuesDe, mundoNumero } from '../contenido/mundos/indice.js'
import { listar } from '../motor/sfv.js'

export const usarMundo = defineStore('mundo', {
  state: () => ({
    numero: 1,
    indicePaso: 0,
    // id de paso -> { superado, mensaje }
    resultados: {},
    // id de paso -> indice elegido, en los pasos de eleccion
    elecciones: {},
    comprobando: false,
    sincronizado: null,
  }),

  getters: {
    mundo: (estado) => mundoNumero(estado.numero),
    pasos() {
      return this.mundo ? this.mundo.pasos : []
    },
    paso() {
      return this.pasos[this.indicePaso] || null
    },
    resultado() {
      return this.paso ? this.resultados[this.paso.id] || null : null
    },
    superados() {
      return this.pasos.filter((paso) => this.resultados[paso.id]?.superado).length
    },
    completo() {
      return this.pasos.length > 0 && this.superados === this.pasos.length
    },
    hayMasPasos() {
      return this.indicePaso < this.pasos.length - 1
    },
    // El siguiente de la lista, no el de numero +1: mientras se escribe el
    // temario hay huecos entre numeros y saltar tiene que seguir funcionando.
    siguienteMundo() {
      return mundoDespuesDe(this.numero)
    },

    // Si un mundo cualquiera esta terminado. Se mira por id de paso, asi que
    // vale para mundos que no son el que se esta jugando.
    mundoTerminado() {
      return (numero) => {
        const otro = mundoNumero(numero)
        if (!otro) return false
        return otro.pasos.every((paso) => this.resultados[paso.id]?.superado)
      }
    },

    // La curva de dificultad no tiene escalones: cada mundo se apoya en el
    // anterior. Adelantarse no es una libertad, es empezar por la mitad de una
    // explicacion. Se abre uno cuando el de antes esta terminado.
    estaAbierto() {
      return (numero) => {
        const indice = mundos.findIndex((m) => m.numero === Number(numero))
        if (indice === -1) return false
        if (indice === 0) return true
        return this.mundoTerminado(mundos[indice - 1].numero)
      }
    },

    // El ultimo mundo abierto: es donde tiene sentido dejar a alguien que
    // vuelve despues de un rato.
    ultimoAbierto() {
      const abiertos = mundos.filter((m) => this.estaAbierto(m.numero))
      return abiertos.length ? abiertos[abiertos.length - 1] : mundos[0]
    },
  },

  actions: {
    elegir(idPaso, indice) {
      this.elecciones = { ...this.elecciones, [idPaso]: indice }
    },

    ir(indice) {
      if (indice >= 0 && indice < this.pasos.length) this.indicePaso = indice
    },

    siguiente() {
      if (this.hayMasPasos) this.indicePaso += 1
    },

    // Lee los ficheros de verdad del proyecto y se los pasa a la comprobacion
    // del paso. Nada de comprobar contra el borrador del editor: lo que cuenta
    // es lo que hay guardado, que es lo que ve la vista previa.
    async comprobar(proyecto) {
      if (!this.paso) return null

      this.comprobando = true
      try {
        const ficheros = Object.fromEntries(
          (await listar(proyecto)).map((fichero) => [fichero.ruta, fichero.contenido]),
        )

        let resultado
        try {
          // Se espera aunque la comprobacion sea sincrona: las de los mundos
          // que usan fetch devuelven una promesa, y await con un valor normal
          // no molesta.
          resultado = await this.paso.comprobar(ficheros, this.elecciones[this.paso.id] ?? null)
        } catch (fallo) {
          // Si peta la propia comprobacion es culpa nuestra, no del alumno.
          resultado = {
            superado: false,
            mensaje: `La comprobacion de este paso se ha roto: ${fallo.message}`,
          }
        }

        this.resultados[this.paso.id] = resultado
        if (resultado.superado) this.guardarProgreso()
        return resultado
      } finally {
        this.comprobando = false
      }
    },

    async guardarProgreso() {
      try {
        const respuesta = await fetch('/api/progreso', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mundo: this.numero, paso: this.indicePaso + 1, estado: 'superado' }),
        })
        this.sincronizado = respuesta.ok
      } catch {
        // Sin conexion o sin sesion. El progreso local ya esta puesto.
        this.sincronizado = false
      }
    },

    async recuperarProgreso() {
      try {
        const respuesta = await fetch('/api/progreso')
        if (!respuesta.ok) return
        const { progreso } = await respuesta.json()

        for (const fila of progreso) {
          if (fila.mundo !== this.numero || fila.estado !== 'superado') continue
          const paso = this.pasos[fila.paso - 1]
          // Se marca como superado sin mensaje: viene de otra sesion.
          if (paso && !this.resultados[paso.id]) {
            this.resultados[paso.id] = { superado: true, mensaje: null }
          }
        }

        // Colocarse en el primer paso que quede pendiente.
        const pendiente = this.pasos.findIndex((paso) => !this.resultados[paso.id]?.superado)
        this.indicePaso = pendiente === -1 ? this.pasos.length - 1 : pendiente
        this.sincronizado = true
      } catch {
        this.sincronizado = false
      }
    },

    // Cambia de mundo. No borra lo superado en los anteriores: el progreso
    // esta indexado por id de paso, y los ids llevan el numero de mundo.
    irAlMundo(numero, { forzar = false } = {}) {
      if (!mundoNumero(numero)) return false
      if (!forzar && !this.estaAbierto(numero)) return false
      this.numero = Number(numero)
      this.indicePaso = 0
      return true
    },

    reiniciar() {
      // Solo los pasos de este mundo; lo de los demas se queda.
      for (const paso of this.pasos) {
        delete this.resultados[paso.id]
        delete this.elecciones[paso.id]
      }
      this.indicePaso = 0
    },
  },
})

export const totalMundos = mundos.length
