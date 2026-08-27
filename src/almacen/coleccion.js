// La colección de sombreros escondidos.
//
// Guarda cuáles se han encontrado y nada más: no hay puntos, ni niveles, ni
// nada que se pueda perder. Encontrar un sombrero no desbloquea contenido del
// curso a propósito, para que nadie se quede fuera de una lección por no haber
// curioseado.
//
// Las reglas que dependen de la hora o del día reciben la fecha por parámetro
// en vez de mirar el reloj por dentro. Así se pueden probar de verdad, sin
// falsear el reloj del sistema ni esperar a la madrugada.

import { defineStore } from 'pinia'
import sombreros, { IDS, sombreroPorId } from '../contenido/sombreros.js'

const CLAVE = 'sombrero-coleccion'
const CLAVE_DIAS = 'sombrero-dias'
const CLAVE_FALLOS = 'sombrero-fallos'

// Cuántas veces hay que fallar el MISMO paso para que sacarlo tenga mérito.
const FALLOS_QUE_YA_SON_TERQUEDAD = 5

// Cuántos días distintos hacen falta para el sombrero del que vuelve.
const DIAS_PARA_LA_COSTUMBRE = 3

// A partir de esta hora (y hasta las cinco) se considera madrugada.
const EMPIEZA_LA_MADRUGADA = 0
const ACABA_LA_MADRUGADA = 5

function leerLista(clave) {
  try {
    const guardado = JSON.parse(localStorage.getItem(clave) || '[]')
    return Array.isArray(guardado) ? guardado.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function guardarLista(clave, lista) {
  try {
    localStorage.setItem(clave, JSON.stringify(lista))
  } catch {
    /* sin persistencia: la colección vale para esta sesión */
  }
}

/** El día de una fecha como 'aaaa-mm-dd', sin husos ni sorpresas. */
export function diaDe(fecha) {
  const dos = (n) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
}

function leerCuenta() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_FALLOS) || '{}')
    return guardado && typeof guardado === 'object' ? guardado : {}
  } catch {
    return {}
  }
}

function guardarCuenta(cuenta) {
  try {
    localStorage.setItem(CLAVE_FALLOS, JSON.stringify(cuenta))
  } catch {
    /* sin persistencia */
  }
}

export const usarColeccion = defineStore('coleccion', {
  state: () => ({
    // Solo los ids conocidos: si mañana se retira un sombrero, lo guardado de
    // antes no deja basura por medio.
    encontrados: leerLista(CLAVE).filter((id) => IDS.includes(id)),
    // Los días distintos en que se ha abierto el taller (solo los últimos).
    dias: leerLista(CLAVE_DIAS),
    // Cuántas veces se ha fallado cada paso. Vive aquí y no en el curso porque
    // solo lo usan los sombreros, y porque tiene que sobrevivir a cerrar la
    // aplicación: si no, «terminar un mundo sin fallar» se conseguiría
    // reiniciando, y «insistir cinco veces» no se conseguiría nunca.
    fallos: leerCuenta(),
    // El último encontrado, para que la interfaz lo celebre y lo suelte.
    ultimo: null,
  }),

  getters: {
    todos: () => sombreros,
    total: () => sombreros.length,
    cuantos: (estado) => estado.encontrados.length,
    tiene: (estado) => (id) => estado.encontrados.includes(id),
    completa() {
      return this.cuantos === this.total
    },
    // En el orden del catálogo, con lo que la sombrerera necesita saber.
    vitrina() {
      return sombreros.map((sombrero) => ({
        ...sombrero,
        encontrado: this.encontrados.includes(sombrero.id),
      }))
    },
  },

  actions: {
    /**
     * Apunta un sombrero. Devuelve el sombrero si es nuevo, y null si ya lo
     * tenía o si el id no existe: quien llama puede así celebrar solo lo nuevo
     * sin repetir la fiesta cada vez que se pasa por el mismo sitio.
     */
    encontrar(id) {
      if (!IDS.includes(id)) return null
      if (this.encontrados.includes(id)) return null

      this.encontrados = [...this.encontrados, id]
      guardarLista(CLAVE, this.encontrados)
      this.ultimo = sombreroPorId(id)
      return this.ultimo
    },

    /** Se llama al cerrar el aviso de «has encontrado uno». */
    olvidarUltimo() {
      this.ultimo = null
    },

    /** Apunta que un paso se ha fallado una vez más. */
    apuntarFallo(idPaso) {
      if (!idPaso) return
      this.fallos = { ...this.fallos, [idPaso]: (this.fallos[idPaso] || 0) + 1 }
      guardarCuenta(this.fallos)
    },

    /**
     * El sombrero del terco: sacar un paso después de haberlo fallado cinco
     * veces. Se comprueba al superarlo, con el paso que se acaba de superar.
     */
    revisarLaTerquedad(idPaso) {
      if ((this.fallos[idPaso] || 0) >= FALLOS_QUE_YA_SON_TERQUEDAD) {
        return this.encontrar('sombrero-del-terco')
      }
      return null
    },

    /**
     * El sombrero limpio: un mundo entero sin un solo fallo. Se le pasan los
     * identificadores de todos los pasos del mundo recién terminado.
     */
    revisarElMundoLimpio(idsDePasos) {
      const pasos = Array.isArray(idsDePasos) ? idsDePasos : []
      if (!pasos.length) return null
      if (pasos.some((id) => (this.fallos[id] || 0) > 0)) return null
      return this.encontrar('sombrero-limpio')
    },

    /**
     * El sombrero de medianoche. Se comprueba al entrar, con la fecha que le
     * pasen.
     */
    revisarLaHora(fecha) {
      const hora = fecha.getHours()
      if (hora >= EMPIEZA_LA_MADRUGADA && hora < ACABA_LA_MADRUGADA) {
        return this.encontrar('sombrero-de-medianoche')
      }
      return null
    },

    /**
     * El sombrero del que vuelve: tres días DISTINTOS, no tres sesiones. Abrir
     * y cerrar el taller diez veces en una tarde no cuenta como constancia.
     */
    apuntarVisita(fecha) {
      const hoy = diaDe(fecha)
      if (!this.dias.includes(hoy)) {
        // No hace falta guardar el historial entero de por vida.
        this.dias = [...this.dias, hoy].slice(-DIAS_PARA_LA_COSTUMBRE)
        guardarLista(CLAVE_DIAS, this.dias)
      }

      if (this.dias.length >= DIAS_PARA_LA_COSTUMBRE) {
        return this.encontrar('sombrero-del-que-vuelve')
      }
      return null
    },
  },
})
