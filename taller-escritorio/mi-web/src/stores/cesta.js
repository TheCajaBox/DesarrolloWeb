import { defineStore } from 'pinia'

function leerGuardado() {
  try {
    return JSON.parse(localStorage.getItem('cesta') || '[]')
  } catch {
    return []
  }
}

export const usarCesta = defineStore('cesta', {
  state: () => ({
    lineas: leerGuardado(),
  }),

  getters: {
    cuantos: (state) => state.lineas.length,
    total: (state) => state.lineas.reduce((suma, linea) => suma + linea.precio, 0),
  },

  actions: {
    persistir() {
      localStorage.setItem('cesta', JSON.stringify(this.lineas))
    },
    meter(sombrero) {
      this.lineas.push(sombrero)
      this.persistir()
    },
    quitar(indice) {
      this.lineas.splice(indice, 1)
      this.persistir()
    },
    vaciar() {
      this.lineas = []
      this.persistir()
    },
  },
})
