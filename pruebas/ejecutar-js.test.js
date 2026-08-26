import { describe, expect, it } from 'vitest'
import { ErrorDeCodigo, ejecutar, instrumentar, lineasDeConsola } from '../src/motor/ejecutar-js.js'
import { leerHtml } from '../src/motor/leer-html.js'

const doc = (html = '<body></body>') => leerHtml(html)

describe('instrumentar', () => {
  it('mete el contador dentro de un while', () => {
    expect(instrumentar('while (x) { y(); }')).toContain('__vuelta();')
  })

  it('lo mete tambien en for, for-of y do-while', () => {
    for (const codigo of [
      'for (let i = 0; i < 3; i++) { a(); }',
      'for (const x of lista) { a(); }',
      'do { a(); } while (x);',
    ]) {
      expect(instrumentar(codigo), codigo).toContain('__vuelta();')
    }
  })

  // Sin llaves el cuerpo es una sola sentencia, y hay que envolverla.
  it('envuelve los bucles sin llaves', () => {
    const salida = instrumentar('while (x) y();')
    expect(salida).toContain('{__vuelta();')
    expect(salida).toContain('}')
  })

  it('no toca el codigo que no tiene bucles', () => {
    const codigo = 'const a = 1; function b() { return a; }'
    expect(instrumentar(codigo)).toBe(codigo)
  })

  it('un error de sintaxis sale como ErrorDeCodigo con su linea', () => {
    try {
      instrumentar('const a = ;')
      throw new Error('deberia haber fallado')
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorDeCodigo)
      expect(error.tipo).toBe('sintaxis')
      expect(error.linea).toBe(1)
    }
  })
})

describe('ejecutar', () => {
  it('recoge lo que se imprime por consola', () => {
    const resultado = ejecutar('console.log("hola", 42)', doc())
    expect(resultado.error).toBeNull()
    expect(lineasDeConsola(resultado)).toEqual(['hola 42'])
  })

  it('deja tocar el documento de verdad', () => {
    const documento = doc('<body><h1>viejo</h1></body>')
    const resultado = ejecutar('document.querySelector("h1").textContent = "nuevo"', documento)

    expect(resultado.error).toBeNull()
    expect(documento.querySelector('h1').textContent).toBe('nuevo')
  })

  it('permite crear elementos y añadirlos', () => {
    const documento = doc('<body><ul id="lista"></ul></body>')
    ejecutar(
      `const li = document.createElement("li");
       li.textContent = "uno";
       document.querySelector("#lista").appendChild(li);`,
      documento,
    )
    expect(documento.querySelectorAll('#lista li').length).toBe(1)
  })

  // Lo que justifica todo el instrumentado: sin esto, la pestaña se cuelga.
  it('corta los bucles infinitos en vez de colgarse', () => {
    const resultado = ejecutar('while (true) { }', doc(), { limite: 1000 })

    expect(resultado.error).toBeInstanceOf(ErrorDeCodigo)
    expect(resultado.error.tipo).toBe('bucle')
    expect(resultado.error.message).toContain('bucle que no termina')
  })

  it('deja pasar los bucles normales', () => {
    const resultado = ejecutar('let s = 0; for (let i = 0; i < 100; i++) s += i; console.log(s)', doc())
    expect(resultado.error).toBeNull()
    expect(lineasDeConsola(resultado)).toEqual(['4950'])
  })

  it('los errores de ejecucion se recogen, no se propagan', () => {
    const resultado = ejecutar('noExiste()', doc())
    expect(resultado.error).toBeInstanceOf(ErrorDeCodigo)
    expect(resultado.error.tipo).toBe('ejecucion')
  })

  it('un error de sintaxis tambien se recoge', () => {
    const resultado = ejecutar('function {', doc())
    expect(resultado.error).toBeInstanceOf(ErrorDeCodigo)
    expect(resultado.error.tipo).toBe('sintaxis')
  })

  it('se pueden inyectar extras', () => {
    const resultado = ejecutar('console.log(saludo)', doc(), { extras: { saludo: 'buenas' } })
    expect(lineasDeConsola(resultado)).toEqual(['buenas'])
  })

  it('los objetos se imprimen como JSON', () => {
    const resultado = ejecutar('console.log({ a: 1 })', doc())
    expect(lineasDeConsola(resultado)).toEqual(['{"a":1}'])
  })

  // Los ciclicos no son raros al depurar; no pueden tumbar la comprobacion.
  it('un objeto ciclico no revienta la consola', () => {
    const resultado = ejecutar('const a = {}; a.yo = a; console.log(a)', doc())
    expect(resultado.error).toBeNull()
    expect(lineasDeConsola(resultado)[0]).toContain('object')
  })
})
