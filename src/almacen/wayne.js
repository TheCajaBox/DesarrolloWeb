// La memoria y las reacciones de Wayne.
//
// Wayne no es solo bocadillos sueltos: es un acompañante que recuerda. Sabe
// cuántos mundos llevas, si es tu primera vez, si te acabas de atascar tres
// veces en el mismo paso, y no repite la misma frase dos veces seguidas.
//
// Las frases se eligen rotando (no al azar): así no se repiten y las pruebas
// son deterministas. Todo lo que hay que recordar entre sesiones se guarda en
// localStorage, envuelto en try/catch por si el almacenamiento está bloqueado.
//
// Dialogos originales, en el registro de Wayne. Nada de los libros.

import { defineStore } from 'pinia'

const CLAVE = 'sombrero-wayne'

function leerMemoria() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || '{}')
  } catch {
    return {}
  }
}

function guardarMemoria(datos) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos))
  } catch {
    /* sin persistencia; Wayne recuerda solo esta sesión */
  }
}

// Bancos de frases. Cada evento tiene su repertorio, y se van gastando por
// turnos para no repetir.
const FRASES = {
  bienvenida: [
    'Bienvenida. Yo soy Wayne, y voy a estar por aquí molestando lo justo. Tú toca cosas, que para eso están.',
  ],
  vuelta: [
    'Otra vez por aquí. Me gusta la gente constante. Es rara, pero me gusta.',
    'Anda, has vuelto. Pues venga, que lo dejamos a medias.',
    'Ya estás aquí. Perfecto, porque esto solo no se hace.',
  ],
  acierto: [
    'Bien. Siguiente.',
    'Eso es. Fíjate qué poco dolía.',
    'Correcto. No te acostumbres a que te felicite, que se me gasta.',
    'Ahí está. Vas pillándole el aire.',
  ],
  rachaCorta: [
    'Van dos seguidas. Ojo, que esto engancha.',
    'Dos sin fallar. Cuidado, que te vas a creer que sabes.',
  ],
  rachaLarga: [
    '¡Cinco seguidas! Vale, ya lo admito: sabes lo que haces.',
    'Racha de las buenas. A este paso me quedo sin trabajo.',
  ],
  fallo: [
    'Casi. Lee otra vez lo que pide, sin prisa.',
    'No pasa nada. Fallar es la mitad de esto; la otra mitad es volver a intentarlo.',
  ],
  atascada: [
    'Oye, que llevas un rato con esto. Si quieres, dale a la pista, que no es hacer trampa.',
    'Este se te está resistiendo. Respira, mira la lección de Wax otra vez, y a por él.',
  ],
  mundoCompleto: [
    'Mundo terminado. Uno menos, y sin despeinarte.',
    'Y van {n}. Esto ya no es suerte, es que le has cogido el truco.',
    'Otro mundo cerrado. A este ritmo acabas montándome una web a mí.',
  ],
  inactividad: [
    '¿Sigues ahí? Sin prisa, pero por si acaso.',
    'Me he quedado mirándote y no te movías. Cuando quieras, seguimos.',
  ],
}

export const usarWayne = defineStore('wayne', {
  state: () => {
    const m = leerMemoria()
    return {
      primeraVez: m.primeraVez !== false,
      mundosHechos: m.mundosHechos || 0,
      rachaAciertos: 0,
      vecesAtascada: {},
      // índice de rotación por banco, para no repetir frase
      indices: m.indices || {},
      // lo que Wayne dice ahora mismo
      linea: '',
    }
  },

  actions: {
    persistir() {
      guardarMemoria({
        primeraVez: this.primeraVez,
        mundosHechos: this.mundosHechos,
        indices: this.indices,
      })
    },

    // Coge la siguiente frase del banco, rotando. Sustituye {n} por el número.
    siguiente(banco, n) {
      const lista = FRASES[banco]
      if (!lista?.length) return ''
      const i = (this.indices[banco] || 0) % lista.length
      this.indices = { ...this.indices, [banco]: i + 1 }
      return lista[i].replace('{n}', String(n ?? ''))
    },

    decir(banco, n) {
      this.linea = this.siguiente(banco, n)
      this.persistir()
      return this.linea
    },

    // Para las frases específicas de un mundo (la entradilla, el cierre), que no
    // salen de un banco: las escribe el contenido.
    decirTexto(texto) {
      this.linea = texto
    },

    // Cuenta un mundo terminado en la memoria, sin cambiar lo que dice.
    registrarMundoCompleto() {
      this.mundosHechos += 1
      this.persistir()
    },

    alEntrar() {
      if (this.primeraVez) {
        this.primeraVez = false
        this.decir('bienvenida')
      } else {
        this.decir('vuelta')
      }
    },

    alAcertar() {
      this.rachaAciertos += 1
      if (this.rachaAciertos >= 5) this.decir('rachaLarga')
      else if (this.rachaAciertos === 2) this.decir('rachaCorta')
      else this.decir('acierto')
    },

    alFallar(idPaso) {
      this.rachaAciertos = 0
      const veces = (this.vecesAtascada[idPaso] || 0) + 1
      this.vecesAtascada = { ...this.vecesAtascada, [idPaso]: veces }
      // A la tercera en el mismo paso, deja de animar y ofrece ayuda.
      this.decir(veces >= 3 ? 'atascada' : 'fallo')
    },

    alCompletarMundo() {
      this.mundosHechos += 1
      this.decir('mundoCompleto', this.mundosHechos)
    },

    alInactividad() {
      this.decir('inactividad')
    },
  },
})
