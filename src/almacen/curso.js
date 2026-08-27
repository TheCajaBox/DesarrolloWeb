// Estado del curso Vue en la app de escritorio.
//
// Misma forma que el almacén del taller web (almacen/mundo.js), para que los
// componentes Mapa y PanelMundo funcionen con cualquiera de los dos. Cambian
// dos cosas: el contenido (temario Vue en vez del web) y el progreso (fichero
// local en vez de la nube).

import { defineStore } from 'pinia'
import mundos, { mundoDespuesDe, mundoNumero } from '../contenido/vue/indice.js'
import { listar } from '../motor/ficheros.js'

const CLAVE_PROGRESO = 'sombrero-progreso-vue'

// El progreso se guarda en localStorage, que en Electron persiste en la carpeta
// de datos de la app. Todo envuelto en try/catch: si el almacenamiento está
// bloqueado, el curso sigue, solo que sin recordar entre sesiones.
function leerProgreso() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PROGRESO) || '{}')
  } catch {
    return {}
  }
}

function escribirProgreso(ids) {
  try {
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(ids))
  } catch {
    /* almacenamiento no disponible; el progreso vive solo en memoria */
  }
}

// Modo revisión: abre TODOS los mundos, sin pedir que se terminen los
// anteriores. Es para poder recorrer y revisar el temario de un tirón; con él
// apagado, el curso vuelve a abrirse mundo a mundo. Se recuerda entre
// sesiones, y arranca encendido mientras el temario se está revisando.
const CLAVE_REVISION = 'sombrero-revision'

function leerRevision() {
  try {
    const guardado = localStorage.getItem(CLAVE_REVISION)
    // Una instalación nueva arranca CON candados: quien viene a aprender abre
    // los mundos terminando el anterior. El modo revisión es para recorrer el
    // temario de un tirón, y se enciende desde la cabecera cuando hace falta.
    return guardado === null ? false : guardado === 'si'
  } catch {
    return false
  }
}

function escribirRevision(activa) {
  try {
    localStorage.setItem(CLAVE_REVISION, activa ? 'si' : 'no')
  } catch {
    /* sin persistencia; vale para esta sesión */
  }
}

export const usarCurso = defineStore('curso', {
  state: () => ({
    numero: 1,
    indicePaso: 0,
    resultados: {},
    elecciones: {},
    comprobando: false,
    // Con esto en true, todos los mundos están abiertos (ver estaAbierto).
    revision: leerRevision(),
  }),

  getters: {
    todos: () => mundos,
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
    siguienteMundo() {
      return mundoDespuesDe(this.numero)
    },
    mundoTerminado() {
      return (numero) => {
        const otro = mundoNumero(numero)
        if (!otro) return false
        return otro.pasos.every((paso) => this.resultados[paso.id]?.superado)
      }
    },
    // Si el mundo estaría abierto POR PROGRESO, sin contar el modo revisión.
    // Se separa de estaAbierto porque hay dos preguntas distintas: "¿puedo
    // entrar?" (donde el modo revisión manda) y "¿por dónde iba?" (donde no
    // debe mandar, o al abrir el taller aterrizarías en el último mundo).
    abiertoPorProgreso() {
      return (numero) => {
        const indice = mundos.findIndex((m) => m.numero === Number(numero))
        if (indice === -1) return false
        if (indice === 0) return true
        return this.mundoTerminado(mundos[indice - 1].numero)
      }
    },

    estaAbierto() {
      return (numero) => {
        const indice = mundos.findIndex((m) => m.numero === Number(numero))
        if (indice === -1) return false
        // En modo revisión no hay puertas cerradas.
        if (this.revision) return true
        return this.abiertoPorProgreso(numero)
      }
    },
    ultimoAbierto() {
      const abiertos = mundos.filter((m) => this.abiertoPorProgreso(m.numero))
      return abiertos.length ? abiertos[abiertos.length - 1] : mundos[0]
    },
  },

  actions: {
    // Enciende o apaga el modo revisión (todos los mundos abiertos).
    alternarRevision() {
      this.revision = !this.revision
      escribirRevision(this.revision)
      return this.revision
    },

    elegir(idPaso, indice) {
      this.elecciones = { ...this.elecciones, [idPaso]: indice }
    },

    ir(indice) {
      if (indice >= 0 && indice < this.pasos.length) this.indicePaso = indice
    },

    siguiente() {
      if (this.hayMasPasos) this.indicePaso += 1
    },

    // Lee los ficheros reales del proyecto y se los pasa a la comprobación del
    // paso. Lo que cuenta es lo guardado en disco, que es lo que ve Vite.
    async comprobar(proyecto) {
      if (!this.paso) return null

      this.comprobando = true
      try {
        const ficheros = Object.fromEntries(
          (await listar(proyecto)).map((fichero) => [fichero.ruta, fichero.contenido]),
        )

        let resultado
        try {
          resultado = await this.paso.comprobar(ficheros, this.elecciones[this.paso.id] ?? null)
        } catch (fallo) {
          resultado = {
            superado: false,
            mensaje: `La comprobación de este paso se ha roto: ${fallo.message}`,
          }
        }

        this.resultados[this.paso.id] = resultado
        if (resultado.superado) this.guardarProgreso()
        return resultado
      } finally {
        this.comprobando = false
      }
    },

    guardarProgreso() {
      const ids = {}
      for (const [id, r] of Object.entries(this.resultados)) {
        if (r?.superado) ids[id] = true
      }
      escribirProgreso(ids)
    },

    recuperarProgreso() {
      const ids = leerProgreso()
      for (const id of Object.keys(ids)) {
        if (!this.resultados[id]) this.resultados[id] = { superado: true, mensaje: null }
      }
      // Colocarse en el último mundo abierto y en su primer paso pendiente.
      const destino = this.ultimoAbierto
      this.numero = destino.numero
      const pendiente = this.pasos.findIndex((paso) => !this.resultados[paso.id]?.superado)
      this.indicePaso = pendiente === -1 ? Math.max(0, this.pasos.length - 1) : pendiente
    },

    irAlMundo(numero, { forzar = false } = {}) {
      if (!mundoNumero(numero)) return false
      if (!forzar && !this.estaAbierto(numero)) return false
      this.numero = Number(numero)
      this.indicePaso = 0
      return true
    },

    reiniciar() {
      for (const paso of this.pasos) {
        delete this.resultados[paso.id]
        delete this.elecciones[paso.id]
      }
      this.indicePaso = 0
      this.guardarProgreso()
    },
  },
})
