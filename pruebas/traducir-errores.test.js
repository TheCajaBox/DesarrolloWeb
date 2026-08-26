import { describe, expect, it } from 'vitest'
import { totalTraducciones, traducir } from '../src/motor/traducir-errores.js'
import terminos, { porTermino } from '../src/contenido/glosario/terminos.js'

describe('traduccion de errores de JavaScript', () => {
  it('el clasico: propiedades de null', () => {
    const t = traducir("Cannot read properties of null (reading 'textContent')")
    expect(t).toBeTruthy()
    expect(t.titulo).toContain('no existe')
    // Cita la propiedad concreta, que es lo que lo hace util.
    expect(t.explicacion).toContain('textContent')
    expect(t.revisa.length).toBeGreaterThan(0)
  })

  it('distingue null de undefined', () => {
    const nulo = traducir('Cannot read properties of null')
    const indefinido = traducir("Cannot read properties of undefined (reading 'nombre')")
    expect(nulo.titulo).not.toBe(indefinido.titulo)
  })

  it('nombre no definido, citando el nombre', () => {
    const t = traducir('titulo is not defined')
    expect(t.explicacion).toContain('titulo')
  })

  it('no es una funcion', () => {
    expect(traducir('document.querySelectorAll is not a function').titulo).toContain('no se puede llamar')
  })

  it('reasignar una const', () => {
    expect(traducir('Assignment to constant variable.').titulo).toContain('const')
  })

  it('errores de sintaxis', () => {
    expect(traducir('Unexpected token }')).toBeTruthy()
    expect(traducir('Unexpected end of input')).toBeTruthy()
  })
})

describe('traduccion de errores de SQL', () => {
  it('tabla que no existe, citandola', () => {
    const t = traducir('SQLITE_ERROR: no such table: sombrerooos')
    expect(t.explicacion).toContain('sombrerooos')
  })

  it('columna que no existe', () => {
    const t = traducir('no such column: nombrre')
    expect(t.explicacion).toContain('nombrre')
    // La pista de las comillas dobles es justo la causa habitual.
    expect(t.revisa.join(' ')).toContain('comillas')
  })

  it('valor repetido en una columna unica', () => {
    const t = traducir('UNIQUE constraint failed: usuarios.email')
    expect(t.explicacion).toContain('usuarios.email')
  })

  it('clave ajena rota', () => {
    expect(traducir('FOREIGN KEY constraint failed').titulo).toContain('no existe')
  })

  it('falta un valor obligatorio', () => {
    const t = traducir('NOT NULL constraint failed: votos.puntuacion')
    expect(t.explicacion).toContain('votos.puntuacion')
  })

  it('error de sintaxis citando donde se atasco', () => {
    const t = traducir('near "SELEC": syntax error')
    expect(t.explicacion).toContain('SELEC')
  })
})

describe('traduccion de codigos HTTP', () => {
  it('distingue 401 de 403', () => {
    expect(traducir('401 Unauthorized').titulo).toContain('no sabe quién eres')
    expect(traducir('403 Forbidden').titulo).toContain('no te deja')
  })

  it('404 y 500 dicen cosas distintas', () => {
    expect(traducir('404 Not Found').titulo).not.toBe(traducir('500 Internal Server Error').titulo)
  })

  it('reconoce el error propio de sin_identidad', () => {
    expect(traducir('{"error":"sin_identidad"}')).toBeTruthy()
  })
})

describe('comportamiento general', () => {
  // Mejor callarse que soltar una explicacion generica que no ayuda.
  it('devuelve null si no reconoce el error', () => {
    expect(traducir('un error rarisimo que nadie ha visto')).toBeNull()
    expect(traducir('')).toBeNull()
    expect(traducir(null)).toBeNull()
    expect(traducir(undefined)).toBeNull()
  })

  it('siempre conserva el error original', () => {
    const original = "Cannot read properties of null (reading 'x')"
    expect(traducir(original).original).toBe(original)
  })

  // Lo especifico antes que lo generico: "no such table" tiene que ganar a
  // cualquier patron mas amplio que pudiera encajar tambien.
  it('lo especifico gana a lo generico', () => {
    expect(traducir('SQLITE_ERROR: no such table: x').titulo).toContain('tabla')
  })

  it('hay una cantidad razonable de traducciones', () => {
    expect(totalTraducciones).toBeGreaterThan(15)
  })
})

describe('glosario de Steris', () => {
  it('tiene bastantes terminos', () => {
    expect(terminos.length).toBeGreaterThan(30)
  })

  it('todos tienen termino y definicion', () => {
    for (const entrada of terminos) {
      expect(entrada.termino, 'entrada sin termino').toBeTruthy()
      expect(entrada.definicion, `${entrada.termino} sin definicion`).toBeTruthy()
      expect(entrada.definicion.length, `${entrada.termino}: definicion demasiado corta`).toBeGreaterThan(40)
    }
  })

  it('no hay terminos repetidos', () => {
    const nombres = terminos.map((e) => e.termino.toLowerCase())
    expect(new Set(nombres).size).toBe(nombres.length)
  })

  it('el indice encuentra por termino y por alias', () => {
    expect(porTermino.get('dom')).toBeTruthy()
    expect(porTermino.get('margen')).toBe(porTermino.get('margin'))
    expect(porTermino.get('rejilla')).toBe(porTermino.get('grid'))
    expect(porTermino.get('no existe')).toBeUndefined()
  })

  it('ningun alias pisa el termino de otra entrada', () => {
    for (const entrada of terminos) {
      for (const alias of entrada.alias || []) {
        const apunta = porTermino.get(alias.toLowerCase())
        expect(apunta, `el alias "${alias}" apunta a otra entrada`).toBe(entrada)
      }
    }
  })
})
