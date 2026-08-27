import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import novedades, {
  comparar,
  novedadesDeLaVersion,
  novedadesDesde,
  yaHabiaTaller,
} from '../src/contenido/novedades.js'

// El aviso de novedades tiene una regla dura: solo se enseña lo que ha pasado
// entre la versión que se vio y la que corre ahora. Si se equivoca, o cuenta
// cosas viejas cada vez que se abre, o se calla justo cuando debería hablar.

describe('las entradas', () => {
  it('van de más nueva a más vieja', () => {
    for (let i = 1; i < novedades.length; i += 1) {
      expect(comparar(novedades[i - 1].version, novedades[i].version)).toBeGreaterThan(0)
    }
  })

  it('cada una tiene versión, título y al menos un punto', () => {
    for (const entrada of novedades) {
      expect(entrada.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(entrada.titulo.length).toBeGreaterThan(3)
      expect(entrada.puntos.length).toBeGreaterThan(0)
      for (const punto of entrada.puntos) expect(punto.length).toBeGreaterThan(15)
    }
  })

  it('todas traen su comentario de Wayne, que es lo que se lee de verdad', () => {
    for (const entrada of novedades) {
      expect(entrada.wayne, `la ${entrada.version} no tiene línea de Wayne`).toBeTruthy()
      expect(entrada.wayne.length).toBeGreaterThan(20)
    }
  })

  it('no repite dos veces la misma versión', () => {
    const cuales = novedades.map((e) => e.version)
    expect(new Set(cuales).size).toBe(cuales.length)
  })
})

describe('comparar versiones', () => {
  it('compara número a número, no como texto', () => {
    // Alfabéticamente '0.1.10' va ANTES de '0.1.9'. Como número, después.
    expect(comparar('0.1.10', '0.1.9')).toBeGreaterThan(0)
    expect(comparar('0.2.0', '0.10.0')).toBeLessThan(0)
  })

  it('la misma versión da cero', () => {
    expect(comparar('1.2.3', '1.2.3')).toBe(0)
  })

  it('sobrevive a basura', () => {
    expect(comparar('', '')).toBe(0)
    expect(comparar(null, undefined)).toBe(0)
    expect(comparar('1.0', '1.0.0')).toBe(0)
  })
})

describe('qué se enseña', () => {
  it('en una instalación nueva, nada', () => {
    // Sin versión vista antes: quien acaba de instalar no tiene «novedades».
    expect(novedadesDesde(null, '0.1.3')).toEqual([])
    expect(novedadesDesde('', '0.1.3')).toEqual([])
  })

  it('si ya se vio esta versión, nada', () => {
    expect(novedadesDesde('0.1.3', '0.1.3')).toEqual([])
  })

  it('al saltar dos versiones, se cuentan las dos', () => {
    const hay = novedadesDesde('0.1.1', '0.1.3')
    expect(hay.map((e) => e.version)).toEqual(['0.1.3', '0.1.2'])
  })

  it('no cuenta la versión que ya se vio', () => {
    const hay = novedadesDesde('0.1.2', '0.1.3')
    expect(hay.map((e) => e.version)).toEqual(['0.1.3'])
  })

  it('no cuenta versiones futuras que aún no se han instalado', () => {
    // Con una lista que va por delante de la app instalada (puede pasar en
    // desarrollo), no se anuncia lo que todavía no está.
    const hay = novedadesDesde('0.1.0', '0.1.1')
    expect(hay.map((e) => e.version)).toEqual(['0.1.1'])
  })

  it('si la versión actual no está en la lista, no revienta', () => {
    expect(() => novedadesDesde('0.1.0', '9.9.9')).not.toThrow()
    expect(novedadesDesde('9.9.8', '9.9.9')).toEqual([])
  })
})

describe('quien venía de una versión anterior al aviso', () => {
  it('ve lo que trae la versión que le acaba de llegar', () => {
    // No tiene «última vista» porque el aviso no existía cuando instaló, pero
    // no es una instalación nueva: se le cuenta esta versión y nada más.
    const hay = novedadesDeLaVersion('0.1.3')
    expect(hay.map((e) => e.version)).toEqual(['0.1.3'])
  })

  it('y si esa versión no trae nada anotado, se calla', () => {
    expect(novedadesDeLaVersion('9.9.9')).toEqual([])
    expect(novedadesDeLaVersion(undefined)).toEqual([])
  })
})

describe('distinguir una instalación nueva de una que ya se usaba', () => {
  const almacenCon = (claves) => ({ getItem: (c) => (c in claves ? claves[c] : null) })

  it('un taller recién instalado no ha dejado rastro', () => {
    expect(yaHabiaTaller(almacenCon({}))).toBe(false)
  })

  it('la memoria de Wayne basta: existe desde el primer arranque', () => {
    // Es el rastro importante. El progreso solo aparece al superar un paso, así
    // que quien abrió el taller y no llegó a completar nada también cuenta.
    expect(yaHabiaTaller(almacenCon({ 'sombrero-wayne': '{}' }))).toBe(true)
  })

  it('el progreso, la revisión o los anchos también valen', () => {
    expect(yaHabiaTaller(almacenCon({ 'sombrero-progreso-vue': '[]' }))).toBe(true)
    expect(yaHabiaTaller(almacenCon({ 'sombrero-revision': 'no' }))).toBe(true)
    expect(yaHabiaTaller(almacenCon({ 'sombrero-anchos': '{}' }))).toBe(true)
  })

  it('sin almacén, o con uno que revienta, dice que no', () => {
    expect(yaHabiaTaller(null)).toBe(false)
    expect(yaHabiaTaller(undefined)).toBe(false)
    expect(
      yaHabiaTaller({
        getItem() {
          throw new Error('modo incógnito y sin permiso')
        },
      }),
    ).toBe(false)
  })
})

describe('los rastros no se quedan obsoletos', () => {
  // Si mañana se renombra una clave de localStorage, la lista de rastros
  // dejaría de detectar nada y el aviso se callaría justo cuando debe hablar,
  // sin que ninguna prueba se queje. Esto lo ata: cada rastro tiene que
  // seguir escribiéndose en algún sitio del código.
  it('cada rastro sigue existiendo en el código que lo escribe', () => {
    // Las rutas van desde la raíz, que es donde vitest corre.
    const fuentes = ['src/almacen/curso.js', 'src/almacen/wayne.js', 'src/AppEscritorio.vue']
      .map((fichero) => readFileSync(fichero, 'utf8'))
      .join('\n')

    // Los mismos que usa yaHabiaTaller. Si se añade uno, se añade aquí.
    for (const rastro of [
      'sombrero-wayne',
      'sombrero-progreso-vue',
      'sombrero-revision',
      'sombrero-anchos',
    ]) {
      expect(fuentes, `el rastro ${rastro} ya no lo escribe nadie`).toContain(rastro)
    }
  })
})
