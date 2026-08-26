import { describe, expect, it } from 'vitest'
import { definicionDe, marcarTerminos } from '../src/motor/glosario.js'
import { formatear } from '../src/motor/formato.js'

describe('marcarTerminos', () => {
  it('envuelve un termino conocido', () => {
    const salida = marcarTerminos('<p>El DOM es un arbol.</p>')
    expect(salida).toContain('data-termino="DOM"')
    expect(salida).toContain('>DOM</button>')
  })

  it('respeta el texto que lo rodea', () => {
    const salida = marcarTerminos('<p>El DOM es un arbol.</p>')
    expect(salida).toContain('<p>El ')
    expect(salida).toContain(' es un arbol.</p>')
  })

  // Lo mas importante: dentro de un ejemplo de codigo no se toca nada.
  it('no toca el interior de <code>', () => {
    const salida = marcarTerminos('<p>Usa <code>una función aquí</code> y ya.</p>')
    expect(salida).not.toContain('data-termino="función"')
  })

  it('no toca el interior de <pre>', () => {
    const salida = marcarTerminos('<pre><code>const evento = 1;</code></pre>')
    expect(salida).not.toContain('data-termino')
  })

  it('no marca dentro de los atributos de una etiqueta', () => {
    const salida = marcarTerminos('<p class="evento">texto</p>')
    expect(salida).toContain('class="evento"')
    expect(salida).not.toContain('data-termino="evento"')
  })

  it('marca cada termino una sola vez por leccion', () => {
    const salida = marcarTerminos('<p>El DOM y otra vez el DOM y el DOM.</p>')
    expect((salida.match(/data-termino="DOM"/g) || []).length).toBe(1)
  })

  it('encuentra los alias y apunta al termino canonico', () => {
    const salida = marcarTerminos('<p>El margen de la caja.</p>')
    expect(salida).toContain('data-termino="margin"')
    expect(salida).toContain('>margen</button>')
  })

  it('no parte palabras por dentro', () => {
    // "evento" esta dentro de "eventual", y no debe marcarse.
    expect(marcarTerminos('<p>eventualmente pasara</p>')).not.toContain('data-termino')
  })

  it('funciona con acentos y enes alrededor', () => {
    const salida = marcarTerminos('<p>una función, ¿no?</p>')
    expect(salida).toContain('data-termino="función"')
  })

  it('los terminos largos ganan a los cortos', () => {
    const salida = marcarTerminos('<p>Una clave primaria basta.</p>')
    expect(salida).toContain('data-termino="clave primaria"')
  })

  it('con texto vacio devuelve vacio', () => {
    expect(marcarTerminos('')).toBe('')
    expect(marcarTerminos(null)).toBe('')
  })

  it('un texto sin terminos sale igual que entro', () => {
    const html = '<p>xyz abc qwerty</p>'
    expect(marcarTerminos(html)).toBe(html)
  })

  // Es lo que hace de verdad la aplicacion: formatear y despues marcar.
  it('encaja con la salida de formatear', () => {
    const html = formatear('El **DOM** es un árbol.\n\n    const evento = 1;')
    const salida = marcarTerminos(html)

    expect(salida).toContain('data-termino="DOM"')
    expect(salida).toContain('<pre><code>const evento = 1;</code></pre>')
    expect(salida).not.toContain('data-termino="evento"')
  })
})

describe('definicionDe', () => {
  it('encuentra por termino y por alias', () => {
    expect(definicionDe('DOM').termino).toBe('DOM')
    expect(definicionDe('margen').termino).toBe('margin')
  })

  it('no le importan las mayusculas', () => {
    expect(definicionDe('dom')).toBe(definicionDe('DOM'))
  })

  it('devuelve null si no lo conoce', () => {
    expect(definicionDe('sombrero')).toBeNull()
    expect(definicionDe('')).toBeNull()
  })
})
