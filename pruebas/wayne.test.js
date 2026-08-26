import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usarWayne } from '../src/almacen/wayne.js'

describe('la memoria y las reacciones de Wayne', () => {
  let wayne

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    wayne = usarWayne()
  })

  it('la primera vez se presenta; después saluda distinto', () => {
    expect(wayne.primeraVez).toBe(true)
    wayne.alEntrar()
    expect(wayne.linea).toMatch(/soy Wayne/i)
    expect(wayne.primeraVez).toBe(false)

    // Otra sesión: ya no es la primera vez.
    setActivePinia(createPinia())
    const otro = usarWayne()
    expect(otro.primeraVez).toBe(false)
    otro.alEntrar()
    expect(otro.linea).not.toMatch(/soy Wayne/i)
  })

  it('no repite la misma frase dos veces seguidas', () => {
    const dichas = new Set()
    // El banco de "vuelta" tiene varias; al rotar no debería repetir hasta
    // agotarlas.
    wayne.primeraVez = false
    for (let i = 0; i < 3; i += 1) {
      wayne.alEntrar()
      dichas.add(wayne.linea)
    }
    expect(dichas.size).toBe(3)
  })

  it('la racha de aciertos escala', () => {
    wayne.alAcertar()
    expect(wayne.rachaAciertos).toBe(1)
    wayne.alAcertar()
    expect(wayne.rachaAciertos).toBe(2)
    expect(wayne.linea).toMatch(/dos/i)

    for (let i = 0; i < 3; i += 1) wayne.alAcertar()
    expect(wayne.rachaAciertos).toBe(5)
    expect(wayne.linea).toMatch(/cinco/i)
  })

  it('un fallo corta la racha', () => {
    wayne.alAcertar()
    wayne.alAcertar()
    wayne.alFallar('1-1')
    expect(wayne.rachaAciertos).toBe(0)
  })

  it('a la tercera en el mismo paso, ofrece ayuda en vez de animar', () => {
    wayne.alFallar('1-3')
    wayne.alFallar('1-3')
    const animo = wayne.linea
    wayne.alFallar('1-3')
    // La tercera cambia de tono: menciona la pista o a Wax.
    expect(wayne.linea).not.toBe(animo)
    expect(wayne.linea).toMatch(/pista|wax/i)
  })

  it('cuenta los mundos y lo recuerda entre sesiones', () => {
    wayne.registrarMundoCompleto()
    wayne.registrarMundoCompleto()
    expect(wayne.mundosHechos).toBe(2)

    setActivePinia(createPinia())
    const otro = usarWayne()
    expect(otro.mundosHechos).toBe(2)
  })

  it('el mensaje de mundo completo mete el número (en la frase que lo lleva)', () => {
    wayne.alCompletarMundo() // 1º: "Mundo terminado…"
    wayne.alCompletarMundo() // 2º: "Y van {n}…", con n = 2
    expect(wayne.linea).toMatch(/2/)
  })

  it('decirTexto pone una frase concreta (entradilla, cierre)', () => {
    wayne.decirTexto('Bienvenida a tu primera aplicación.')
    expect(wayne.linea).toBe('Bienvenida a tu primera aplicación.')
  })

  it('si el almacenamiento está bloqueado, no revienta', () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('bloqueado')
    }
    try {
      expect(() => wayne.alAcertar()).not.toThrow()
    } finally {
      Storage.prototype.setItem = original
    }
  })
})
