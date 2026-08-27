import { describe, expect, it } from 'vitest'
import {
  AVISO_LOCAL,
  responderEnLocal,
  terminosEn,
  titularesDe,
} from '../src/motor/armonia-local.js'
import mundoVue01 from '../src/contenido/vue/mundo-01.js'
import mundoVue12 from '../src/contenido/vue/mundo-12.js'

// La Armonía local no habla con ningún modelo: responde con el glosario y las
// lecciones. Lo que hay que asegurar es que sigue siendo el MISMO personaje
// (no da la solución) y que su material se encuentra de verdad.

describe('encontrar términos en la pregunta', () => {
  it('reconoce un término tal cual', () => {
    const encontrados = terminosEn('¿qué es un componente?')
    expect(encontrados[0].termino).toBe('componente')
  })

  it('lo reconoce con acentos, mayúsculas y signos alrededor', () => {
    const encontrados = terminosEn('¿Y la REACTIVIDAD, cómo va?')
    expect(encontrados.map((e) => e.termino)).toContain('reactividad')
  })

  it('reconoce los términos con guion, como v-for', () => {
    const encontrados = terminosEn('no me funciona el v-for')
    expect(encontrados.map((e) => e.termino)).toContain('v-for')
  })

  it('prefiere el término más específico sobre el genérico', () => {
    const encontrados = terminosEn('¿qué es una inyección SQL?', 1)
    expect(encontrados[0].termino).toBe('inyección SQL')
  })

  it('no repite el mismo término por dos alias', () => {
    // "props" y "prop" apuntan a la misma entrada.
    const encontrados = terminosEn('las props y el prop del hijo')
    expect(encontrados).toHaveLength(1)
  })

  it('con una pregunta sin vocabulario conocido, no encuentra nada', () => {
    expect(terminosEn('me he quedado en blanco y no sé por dónde tirar')).toHaveLength(0)
  })

  it('no revienta con vacío ni con nulo', () => {
    expect(terminosEn('')).toEqual([])
    expect(terminosEn(null)).toEqual([])
  })
})

describe('titulares de la lección de Wax', () => {
  it('saca los puntos en negrita del apunte', () => {
    const titulares = titularesDe(mundoVue01)
    expect(titulares.length).toBeGreaterThan(0)
    expect(titulares.join(' ')).toMatch(/cajón|orden|componente/i)
  })

  it('devuelve como mucho los que se le piden', () => {
    expect(titularesDe(mundoVue12, 2).length).toBeLessThanOrEqual(2)
  })

  it('sin mundo, lista vacía', () => {
    expect(titularesDe(null)).toEqual([])
  })
})

describe('el personaje se mantiene', () => {
  it('si le piden la solución, no la da', () => {
    const { texto, modo } = responderEnLocal({ pregunta: 'dame la solución del paso' })
    expect(modo).toBe('negativa')
    expect(texto.toLowerCase()).not.toMatch(/<template|const |function /)
  })

  it('la caza también con tildes y en otras formas', () => {
    expect(responderEnLocal({ pregunta: 'resuélvelo tú' }).modo).toBe('negativa')
    expect(responderEnLocal({ pregunta: '¿cuál es la respuesta?' }).modo).toBe('negativa')
  })

  it('no repite la misma negativa en turnos seguidos', () => {
    const primera = responderEnLocal({ pregunta: 'dame la solución', turno: 0 }).texto
    const segunda = responderEnLocal({ pregunta: 'dame la solución', turno: 1 }).texto
    expect(primera).not.toBe(segunda)
  })

  it('nunca devuelve la pista literal del paso', () => {
    const paso = mundoVue01.pasos.find((p) => p.pista)
    const { texto } = responderEnLocal({
      pregunta: 'no me sale, ayuda',
      mundo: mundoVue01,
      paso,
    })
    expect(texto).not.toContain(paso.pista)
  })
})

describe('responder con el glosario', () => {
  it('explica el término y lo marca como modo glosario', () => {
    const { texto, modo } = responderEnLocal({ pregunta: '¿qué es un ref?' })
    expect(modo).toBe('glosario')
    expect(texto).toMatch(/«ref»/)
    expect(texto).toMatch(/reactivo/i)
  })

  it('no cuela markdown, que el Narrador pinta texto plano', () => {
    const { texto } = responderEnLocal({ pregunta: '¿qué es un computed?' })
    expect(texto).not.toMatch(/\*\*/)
  })

  it('cuando el término tiene un "ojo", lo incluye', () => {
    const { texto } = responderEnLocal({ pregunta: 'no entiendo el ref' })
    expect(texto).toMatch(/ojo con esto/i)
  })

  it('con dos términos, pregunta cuál de los dos', () => {
    const { texto, modo } = responderEnLocal({ pregunta: 'diferencia entre computed y watch' })
    expect(modo).toBe('glosario')
    expect(texto).toMatch(/cuál de las dos/i)
  })
})

describe('orientar cuando no hay palabra conocida', () => {
  it('nombra el paso, la lección y la pista, sin darla', () => {
    const { texto, modo } = responderEnLocal({
      pregunta: 'llevo un rato y no avanzo',
      mundo: mundoVue01,
      paso: mundoVue01.pasos[0],
    })
    expect(modo).toBe('orientacion')
    expect(texto).toContain(mundoVue01.pasos[0].titulo)
    expect(texto).toMatch(/lección de Wax/i)
    expect(texto).toMatch(/Dame una pista/)
  })

  it('sin mundo ni paso, sigue diciendo algo útil', () => {
    const { texto } = responderEnLocal({ pregunta: 'no sé qué hacer' })
    expect(texto.length).toBeGreaterThan(40)
  })

  it('con la pregunta vacía, no revienta', () => {
    expect(responderEnLocal({ pregunta: '' }).texto).toBeTruthy()
    expect(responderEnLocal({}).texto).toBeTruthy()
    expect(responderEnLocal().texto).toBeTruthy()
  })
})

describe('el aviso de entrada', () => {
  it('dice que está en local y con qué material', () => {
    expect(AVISO_LOCAL).toMatch(/local/i)
    expect(AVISO_LOCAL).toMatch(/glosario/i)
  })
})
