import { compile } from '@vue/compiler-dom'
import * as runtime from 'vue'
import { describe, expect, it } from 'vitest'
import rondas from '../src/contenido/apuesta.js'
import { elegirRonda, hayApuesta, rondasDisponibles } from '../src/motor/apuesta.js'

// Un banco de preguntas con una respuesta mal marcada enseña justo lo
// contrario de lo que pretende, y eso NO se ve leyéndolo: la respuesta
// equivocada suele ser la que uno creía.
//
// Así que aquí no se comprueba lo que yo creo que pinta cada plantilla: se
// compila con el compilador de Vue de verdad, se pinta con sus datos, y se
// compara con lo que la ronda dice que es la respuesta correcta.

/** Pinta una plantilla con unos datos y devuelve el texto que sale. */
function pintar(plantilla, datos) {
  const { code } = compile(`<div>${plantilla}</div>`, {
    mode: 'function',
    hoistStatic: false,
    prefixIdentifiers: true,
  })

  const render = new Function('Vue', code)(runtime)
  const donde = document.createElement('div')

  const app = runtime.createApp({
    render,
    setup: () => ({ ...datos }),
  })

  app.mount(donde)
  const texto = donde.textContent
  app.unmount()

  return texto
}

describe('cómo está montada cada ronda', () => {
  it('todas tienen id, mundo mínimo, cuatro opciones y una correcta', () => {
    for (const ronda of rondas) {
      expect(ronda.id, JSON.stringify(ronda)).toMatch(/^[a-z0-9-]+$/)
      expect(ronda.desde).toBeGreaterThan(0)
      expect(ronda.opciones, ronda.id).toHaveLength(4)
      expect(ronda.correcta, ronda.id).toBeGreaterThanOrEqual(0)
      expect(ronda.correcta, ronda.id).toBeLessThan(4)
    }
  })

  it('no hay dos con el mismo id', () => {
    const ids = rondas.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('las cuatro opciones de una ronda son distintas', () => {
    // Dos opciones iguales harían que hubiera dos respuestas buenas, y una de
    // las dos se daría por mala.
    for (const ronda of rondas) {
      expect(new Set(ronda.opciones).size, ronda.id).toBe(4)
    }
  })

  it('todas explican por qué al fallar', () => {
    // Fallar sin que nadie te diga por qué no enseña nada; es solo perder.
    for (const ronda of rondas) {
      expect(ronda.wayne, ronda.id).toBeTruthy()
      expect(ronda.wayne.length, ronda.id).toBeGreaterThan(30)
    }
  })

  it('hay rondas repartidas por varios mundos, no todas del mismo', () => {
    expect(new Set(rondas.map((r) => r.desde)).size).toBeGreaterThan(3)
  })
})

describe('la respuesta correcta es de verdad la correcta', () => {
  // Esta es LA prueba. Todo lo demás es papeleo.
  for (const ronda of rondas) {
    it(`«${ronda.id}» pinta lo que dice que pinta`, () => {
      const salido = pintar(ronda.plantilla, ronda.datos)
      const marcada = ronda.opciones[ronda.correcta]

      // «nada» es como se escribe en las opciones que no se pinta nada.
      const esperado = marcada === 'nada' ? '' : marcada

      expect(salido, `«${ronda.id}» pinta «${salido}» y dice que pinta «${marcada}»`).toBe(esperado)
    })
  }

  it('y las opciones equivocadas no son también correctas', () => {
    for (const ronda of rondas) {
      const salido = pintar(ronda.plantilla, ronda.datos)
      const otras = ronda.opciones.filter((_, i) => i !== ronda.correcta)

      for (const opcion of otras) {
        const comoTexto = opcion === 'nada' ? '' : opcion
        expect(comoTexto, `en «${ronda.id}» hay dos respuestas buenas`).not.toBe(salido)
      }
    }
  })
})

describe('qué se puede preguntar y cuándo', () => {
  it('no se pregunta por lo que aún no se ha dado', () => {
    for (const ronda of rondasDisponibles(3)) {
      expect(ronda.desde, `«${ronda.id}» se pregunta en el mundo 3`).toBeLessThanOrEqual(3)
    }
  })

  it('cuanto más lejos vas, más rondas hay', () => {
    expect(rondasDisponibles(20).length).toBeGreaterThan(rondasDisponibles(5).length)
  })

  it('con lo que se da en el primer acto ya hay partida', () => {
    // Si el juego solo apareciera a mitad del curso, llegaría cuando ya no
    // hace falta repasar lo de antes.
    expect(hayApuesta(3)).toBe(true)
  })

  it('en el mundo 1 todavía no hay nada que preguntar', () => {
    expect(hayApuesta(1)).toBe(false)
  })

  it('con un mundo raro no revienta', () => {
    expect(hayApuesta(null)).toBe(false)
    expect(hayApuesta(undefined)).toBe(false)
    expect(rondasDisponibles(0)).toEqual([])
  })
})

describe('elegir la siguiente ronda', () => {
  it('el sorteo decide, y se puede fijar', () => {
    const posibles = rondasDisponibles(30)
    expect(elegirRonda(30, [], () => 0)?.id).toBe(posibles[0].id)
    expect(elegirRonda(30, [], () => 0.999)?.id).toBe(posibles[posibles.length - 1].id)
  })

  it('no repite una que ya ha salido mientras queden nuevas', () => {
    const posibles = rondasDisponibles(30)
    const vistas = posibles.slice(0, -1).map((r) => r.id)

    // Aunque el sorteo pida la primera, solo queda una sin ver: esa sale.
    expect(elegirRonda(30, vistas, () => 0)?.id).toBe(posibles[posibles.length - 1].id)
  })

  it('cuando se acaban las nuevas, vuelve a empezar en vez de rendirse', () => {
    const todas = rondasDisponibles(30).map((r) => r.id)
    const otra = elegirRonda(30, todas, () => 0)
    expect(otra).not.toBeNull()
    expect(todas).toContain(otra.id)
  })

  it('sin rondas disponibles no inventa ninguna', () => {
    expect(elegirRonda(1, [], () => 0)).toBeNull()
  })

  it('un sorteo que devuelve 1 no se sale de la lista', () => {
    // Math.random nunca devuelve 1, pero un sorteo de pega sí puede.
    expect(elegirRonda(30, [], () => 1)).toBeTruthy()
  })
})
