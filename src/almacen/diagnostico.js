// Lo que va mal, en un sitio.
//
// Dos cosas distintas que hasta ahora no se veían desde dentro del taller:
//
//   - Los problemas de compilación. Vite ya los pinta encima de la vista
//     previa con un cartel rojo, pero ese cartel se va solo al siguiente
//     cambio y no deja rastro. Los manda el proceso principal.
//   - Lo que dice la consola del navegador de la vista previa: los console.log
//     de ella y los errores de JavaScript que revientan en marcha. Sin esto,
//     un `console.log` es un mensaje que no lee nadie.
//
// Ninguno de los dos bloquea nada. Son para mirar.

import { defineStore } from 'pinia'

// Un taller que lleva horas abierto no puede acumular mensajes sin fin.
const CUANTOS_MENSAJES_CABEN = 300

export const usarDiagnostico = defineStore('diagnostico', {
  state: () => ({
    // El problema de compilación de ahora mismo, o null si todo compila.
    problema: null,
    // Los mensajes de la consola, el más nuevo al final.
    mensajes: [],
    // Sube con cada mensaje nuevo: sirve de identificador y para saber si hay
    // que hacer scroll al final.
    contador: 0,
  }),

  getters: {
    hayProblema: (estado) => estado.problema !== null,
    errores: (estado) => estado.mensajes.filter((m) => m.nivel === 'error').length,
    avisos: (estado) => estado.mensajes.filter((m) => m.nivel === 'aviso').length,
  },

  actions: {
    /** Lo que dice Vite. `null` significa que ya compila. */
    ponerProblema(problema) {
      this.problema = problema || null
    },

    /**
     * Un mensaje de la consola de la vista previa.
     *
     * El nivel llega de Electron y ha cambiado de forma entre versiones: antes
     * era un número y ahora es texto. Se aceptan los dos y se traduce a algo
     * que se pueda leer.
     */
    apuntarMensaje({ nivel, texto, fichero = '', linea = null }) {
      this.contador += 1

      this.mensajes = [
        ...this.mensajes,
        {
          id: this.contador,
          nivel: traducirNivel(nivel),
          texto: String(texto ?? ''),
          fichero: String(fichero || ''),
          linea: linea ?? null,
        },
      ].slice(-CUANTOS_MENSAJES_CABEN)
    },

    limpiarConsola() {
      this.mensajes = []
    },
  },
})

/** El nivel, venga como venga, en una palabra. */
export function traducirNivel(nivel) {
  // Electron nuevo: 'debug' | 'info' | 'warning' | 'error'.
  if (typeof nivel === 'string') {
    if (nivel === 'warning' || nivel === 'warn') return 'aviso'
    if (nivel === 'error') return 'error'
    if (nivel === 'debug' || nivel === 'verbose') return 'detalle'
    return 'info'
  }

  // Electron viejo: 0 verbose, 1 info, 2 warning, 3 error.
  if (nivel === 3) return 'error'
  if (nivel === 2) return 'aviso'
  if (nivel === 0) return 'detalle'
  return 'info'
}
