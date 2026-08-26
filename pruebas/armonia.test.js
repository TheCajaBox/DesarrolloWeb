import { describe, expect, it } from 'vitest'
import {
  contextoPermitido,
  esCuotaAgotada,
  pareceQuePideSolucion,
  taparCodigo,
} from '../servidor/armonia.js'
import mundoUno from '../src/contenido/mundos/mundo-01.js'

describe('rechazo de peticiones de solucion', () => {
  it('caza las formas habituales de pedirla', () => {
    const pidiendo = [
      'dame la solucion',
      'Dame el codigo del paso 1',
      'escribeme la respuesta',
      'resuelvemelo',
      'resuelve el paso',
      'como se hace el ejercicio',
      'cual es la respuesta',
      'copiame el codigo',
    ]
    for (const texto of pidiendo) {
      expect(pareceQuePideSolucion(texto), texto).toBe(true)
    }
  })

  // Lo importante es que no se coma preguntas legitimas: si Armonia se niega
  // a explicar cosas, deja de servir para nada.
  it('deja pasar las preguntas de verdad', () => {
    const legitimas = [
      'que es CSS',
      'por que no se aplica mi CSS',
      'es posible que el h1 sea mas pequeno',
      'para que sirve un article',
      'que diferencia hay entre padding y margin',
      'no entiendo el modelo de cajas',
      'como funciona display grid',
      'me he atascado, no se por donde seguir',
    ]
    for (const texto of legitimas) {
      expect(pareceQuePideSolucion(texto), texto).toBe(false)
    }
  })
})

describe('distinguir cuota agotada de averia', () => {
  it('reconoce lo que suena a limite alcanzado', () => {
    for (const mensaje of [
      'Daily neuron quota exceeded',
      'Capacity temporarily exceeded',
      'Error 3040: account limited',
      'Too Many Requests',
      'rate limit reached',
    ]) {
      expect(esCuotaAgotada(mensaje), mensaje).toBe(true)
    }
  })

  // Este es el caso que nos mordio: el modelo no existia y Armonia decia
  // "vuelve manana", que es mentira y no lleva a ningun sitio.
  it('NO confunde una averia con la cuota', () => {
    for (const mensaje of [
      'No such model: @cf/meta/llama-3.1-8b-instruct',
      'respuesta vacia',
      'Invalid model name',
      'fetch failed',
      'Unexpected token in JSON',
    ]) {
      expect(esCuotaAgotada(mensaje), mensaje).toBe(false)
    }
  })

  it('con mensaje vacio o nulo no revienta', () => {
    expect(esCuotaAgotada(null)).toBe(false)
    expect(esCuotaAgotada('')).toBe(false)
    expect(esCuotaAgotada(undefined)).toBe(false)
  })
})

describe('lista blanca de contexto', () => {
  const contexto = contextoPermitido(1, '1-1')

  it('incluye titulo y enunciado del paso', () => {
    // Sin codificar textos a mano: el temario cambia y la prueba tiene que
    // seguir comprobando lo mismo, no romperse porque se reescriba un paso.
    expect(contexto).toContain(mundoUno.titulo)
    expect(contexto).toContain(mundoUno.pasos[0].titulo)
  })

  // La proteccion de verdad: la solucion no se filtra despues, es que nunca
  // llega a estar en el texto que sale hacia el modelo.
  it('NO incluye pistas ni codigo de comprobacion', () => {
    const paso = mundoUno.pasos.find((p) => p.id === '1-1')
    expect(contexto).not.toContain(paso.pista)
    expect(contexto).not.toContain('comprobar')
    expect(contexto).not.toContain('superado')
  })

  it('el enunciado va sin etiquetas HTML', () => {
    expect(contexto).not.toMatch(/<\/?(code|strong|em)>/)
  })

  it('devuelve null si el mundo no existe', () => {
    expect(contextoPermitido(99, 'x')).toBeNull()
  })

  it('aguanta un paso inexistente sin romperse', () => {
    const soloMundo = contextoPermitido(1, 'no-existe')
    expect(soloMundo).toContain(mundoUno.titulo)
    expect(soloMundo).not.toContain('Paso:')
  })
})

describe('filtrado de salida', () => {
  it('tapa los bloques con acentos graves', () => {
    const salida = taparCodigo('Mira esto:\n```html\n<article></article>\n```\ny ya')
    expect(salida).not.toContain('<article>')
    expect(salida).toContain('Aqui habia codigo')
  })

  it('tapa el codigo indentado con cuatro espacios', () => {
    const salida = taparCodigo('Prueba:\n\n    article { padding: 1rem; }\n\nY listo')
    expect(salida).not.toContain('padding: 1rem')
  })

  it('deja en paz el texto normal', () => {
    const texto = 'El padding va dentro del borde y el margin fuera. Esa es toda la diferencia.'
    expect(taparCodigo(texto)).toBe(texto)
  })
})
