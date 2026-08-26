import { describe, expect, it } from 'vitest'
import {
  comparaEspecificidad,
  especificidad,
  leerCss,
  llevaImportante,
  reglasPara,
  selectores,
  tieneAlguna,
  valorDe,
} from '../src/motor/leer-css.js'

describe('leerCss', () => {
  it('lee selector y declaraciones', () => {
    const reglas = leerCss('article { border: 1px solid red; padding: 1rem; }')
    expect(reglas).toHaveLength(1)
    expect(reglas[0].selector).toBe('article')
    expect(reglas[0].declaraciones).toEqual({ border: '1px solid red', padding: '1rem' })
  })

  it('separa los selectores agrupados por comas', () => {
    const reglas = leerCss('h1, h2 { color: red; }')
    expect(selectores(reglas)).toEqual(['h1', 'h2'])
    expect(reglas[1].declaraciones.color).toBe('red')
  })

  it('se traga los comentarios', () => {
    const reglas = leerCss('/* esto no cuenta { color: azul } */ p { color: verde; }')
    expect(reglas).toHaveLength(1)
    expect(reglas[0].declaraciones.color).toBe('verde')
  })

  it('no le importa el formato', () => {
    const apretado = leerCss('article{border:1px solid red}')
    const suelto = leerCss('article\n{\n  border : 1px solid red ;\n}\n')
    expect(apretado[0].declaraciones).toEqual(suelto[0].declaraciones)
  })

  it('aguanta la ultima declaracion sin punto y coma', () => {
    expect(leerCss('p { color: red }')[0].declaraciones.color).toBe('red')
  })

  it('entra dentro de los @media y anota la condicion', () => {
    const reglas = leerCss('@media (max-width: 40rem) { .rejilla { grid-template-columns: 1fr; } }')
    expect(reglas).toHaveLength(1)
    expect(reglas[0].selector).toBe('.rejilla')
    expect(reglas[0].condicion).toContain('max-width')
  })

  it('con CSS vacio o roto no revienta', () => {
    expect(leerCss('')).toEqual([])
    expect(leerCss(null)).toEqual([])
    expect(leerCss('article { border: 1px')).toEqual([{ selector: 'article', declaraciones: { border: '1px' }, condicion: null }])
  })

  it('normaliza las propiedades a minusculas', () => {
    expect(leerCss('p { COLOR: red; }')[0].declaraciones.color).toBe('red')
  })
})

describe('reglasPara', () => {
  const reglas = leerCss(`
    article { padding: 1rem; }
    .ficha article { color: red; }
    article:hover { border-color: gold; }
    .articulos { margin: 0; }
    body > article + article { margin-top: 1rem; }
  `)

  it('encuentra el elemento en selectores compuestos', () => {
    // Cinco reglas mencionan article; .articulos no cuenta.
    expect(reglasPara(reglas, 'article')).toHaveLength(4)
  })

  it('no confunde article con .articulos', () => {
    expect(reglasPara(reglas, 'article').every((r) => r.selector !== '.articulos')).toBe(true)
  })

  it('encuentra clases', () => {
    expect(reglasPara(reglas, '.articulos')).toHaveLength(1)
  })
})

describe('especificidad', () => {
  it('cuenta ids, clases y elementos por separado', () => {
    expect(especificidad('p')).toEqual([0, 0, 1])
    expect(especificidad('.ficha')).toEqual([0, 1, 0])
    expect(especificidad('#principal')).toEqual([1, 0, 0])
    expect(especificidad('article p')).toEqual([0, 0, 2])
    expect(especificidad('.destacado p')).toEqual([0, 1, 1])
  })

  it('atributos y pseudoclases pesan como una clase', () => {
    expect(especificidad('a[href]')).toEqual([0, 1, 1])
    expect(especificidad('a:hover')).toEqual([0, 1, 1])
  })

  it('los pseudoelementos pesan como un elemento', () => {
    expect(especificidad('p::first-line')).toEqual([0, 0, 2])
  })

  it('el asterisco no cuenta', () => {
    expect(especificidad('*')).toEqual([0, 0, 0])
  })

  it('los combinadores no cuentan', () => {
    expect(especificidad('article > p + p')).toEqual([0, 0, 3])
  })
})

describe('comparaEspecificidad', () => {
  // La regla que casi nadie tiene clara: NO se suman. Una clase gana a
  // cualquier cantidad de etiquetas, por muchas que sean.
  it('una clase gana a cualquier numero de etiquetas', () => {
    expect(comparaEspecificidad('.destacado', 'html body main article p')).toBe(1)
  })

  it('un id gana a cualquier numero de clases', () => {
    expect(comparaEspecificidad('#x', '.a.b.c.d.e')).toBe(1)
  })

  it('a igualdad, empate', () => {
    expect(comparaEspecificidad('article p', 'main div')).toBe(0)
  })

  it('el caso del mundo 4: .destacado p gana a article p', () => {
    expect(comparaEspecificidad('.destacado p', 'article p')).toBe(1)
  })
})

describe('llevaImportante', () => {
  it('lo detecta con y sin espacio', () => {
    const reglas = leerCss('p { color: red !important; } h1 { color: blue ! important; }')
    expect(llevaImportante(reglas[0], 'color')).toBe(true)
    expect(llevaImportante(reglas[1], 'color')).toBe(true)
  })

  it('devuelve false si no lo lleva', () => {
    const reglas = leerCss('p { color: red; }')
    expect(llevaImportante(reglas[0], 'color')).toBe(false)
    expect(llevaImportante(reglas[0], 'margin')).toBe(false)
    expect(llevaImportante(null, 'color')).toBe(false)
  })
})

describe('valorDe y tieneAlguna', () => {
  const reglas = leerCss('article { padding: 1rem; border: 1px solid #ccc; } article { padding: 2rem; }')

  it('devuelve el ultimo valor declarado', () => {
    expect(valorDe(reglas, 'article', 'padding')).toBe('2rem')
  })

  it('devuelve null si no esta', () => {
    expect(valorDe(reglas, 'article', 'display')).toBeNull()
  })

  it('no le importan las mayusculas de la propiedad', () => {
    expect(valorDe(reglas, 'article', 'PADDING')).toBe('2rem')
  })

  it('tieneAlguna acepta cualquiera de las variantes', () => {
    expect(tieneAlguna(reglas, 'article', ['padding', 'padding-top'])).toBe(true)
    expect(tieneAlguna(reglas, 'article', ['margin', 'margin-top'])).toBe(false)
  })
})
