import { describe, expect, it } from 'vitest'
import { escapar, formatear } from '../src/motor/formato.js'

describe('escapar', () => {
  it('neutraliza el marcado', () => {
    expect(escapar('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
  })

  it('escapa el ampersand primero, para no romper las demas entidades', () => {
    expect(escapar('&lt;')).toBe('&amp;lt;')
  })

  it('con nulo devuelve cadena vacia', () => {
    expect(escapar(null)).toBe('')
    expect(escapar(undefined)).toBe('')
  })
})

describe('formatear', () => {
  it('envuelve los parrafos', () => {
    expect(formatear('Hola')).toBe('<p>Hola</p>')
  })

  it('separa parrafos por linea en blanco', () => {
    expect(formatear('Uno\n\nDos')).toBe('<p>Uno</p>\n<p>Dos</p>')
  })

  it('funde los saltos sueltos dentro de un parrafo', () => {
    // En el fuente se parte la linea para no pasarse de ancho; al leerlo
    // tiene que salir un parrafo continuo.
    expect(formatear('Una frase\npartida en dos')).toBe('<p>Una frase partida en dos</p>')
  })

  it('hace negrita y codigo en linea', () => {
    expect(formatear('esto es **importante**')).toContain('<strong>importante</strong>')
    expect(formatear('usa `padding` aqui')).toContain('<code>padding</code>')
  })

  it('convierte los bloques indentados en codigo', () => {
    const salida = formatear('Mira:\n\n    article { padding: 1rem; }')
    expect(salida).toContain('<pre><code>article { padding: 1rem; }</code></pre>')
  })

  // Lo que importa de verdad: que una leccion sobre HTML pueda hablar de
  // etiquetas sin que el navegador se las coma.
  it('el codigo con etiquetas HTML se ve, no se ejecuta', () => {
    const salida = formatear('    <article>hola</article>')
    expect(salida).toContain('&lt;article&gt;')
    expect(salida).not.toContain('<article>')
  })

  it('escapa tambien dentro del codigo en linea', () => {
    expect(formatear('la etiqueta `<h2>` sirve para eso')).toContain('<code>&lt;h2&gt;</code>')
  })

  it('hace listas con guiones', () => {
    const salida = formatear('- uno\n- dos')
    expect(salida).toBe('<ul><li>uno</li><li>dos</li></ul>')
  })

  it('hace listas numeradas', () => {
    const salida = formatear('1. primero\n2. segundo')
    expect(salida).toBe('<ol><li>primero</li><li>segundo</li></ol>')
  })

  it('las listas tambien admiten negrita', () => {
    expect(formatear('- esto es **clave**')).toContain('<strong>clave</strong>')
  })

  it('con texto vacio no devuelve nada', () => {
    expect(formatear('')).toBe('')
    expect(formatear(null)).toBe('')
  })

  it('no deja pasar etiquetas escritas en un parrafo normal', () => {
    expect(formatear('un <b>intento</b>')).toBe('<p>un &lt;b&gt;intento&lt;/b&gt;</p>')
  })
})
