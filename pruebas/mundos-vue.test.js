import { describe, expect, it } from 'vitest'
import mundos, { actos, mundoDespuesDe, mundoNumero, totalPasos } from '../src/contenido/vue/indice.js'

// Las mismas invariantes que el temario web, aplicadas al temario Vue. Si algún
// mundo Vue no se puede terminar por una comprobación mal escrita, salta aquí y
// no en la cara de quien aprende.

describe('invariantes del temario Vue', () => {
  it('hay mundos, ordenados y sin repetir número', () => {
    expect(mundos.length).toBeGreaterThan(0)
    const numeros = mundos.map((m) => m.numero)
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b))
    expect(new Set(numeros).size).toBe(numeros.length)
  })

  it('los ids de paso son únicos y empiezan por el número de su mundo', () => {
    const ids = mundos.flatMap((m) => m.pasos.map((p) => p.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const m of mundos) {
      for (const p of m.pasos) expect(p.id).toMatch(new RegExp(`^${m.numero}-`))
    }
  })

  for (const mundo of mundos) {
    describe(`mundo ${mundo.numero}`, () => {
      it('tiene título, acto, entradilla, apunte y cierre', () => {
        expect(mundo.titulo).toBeTruthy()
        expect(mundo.acto).toBeTruthy()
        expect(mundo.entradilla?.texto).toBeTruthy()
        expect(mundo.cierre?.texto).toBeTruthy()
        expect(mundo.apunte?.cuerpo.length).toBeGreaterThan(1200)
      })

      it('lo que dice Wayne cabe en un bocadillo', () => {
        for (const parte of [mundo.entradilla, mundo.cierre]) {
          expect(parte.texto.length).toBeLessThan(430)
        }
      })

      it('tiene entre 3 y 16 pasos, cada uno con título, enunciado y comprobar', () => {
        expect(mundo.pasos.length).toBeGreaterThanOrEqual(3)
        expect(mundo.pasos.length).toBeLessThanOrEqual(16)
        for (const p of mundo.pasos) {
          expect(p.titulo, p.id).toBeTruthy()
          expect(p.enunciado, p.id).toBeTruthy()
          expect(typeof p.comprobar, p.id).toBe('function')
        }
      })

      it('el esqueleto sembrado no supera ningún paso', async () => {
        for (const p of mundo.pasos) {
          const r = await p.comprobar(mundo.ficheros)
          expect(r.superado, `${p.id} venía hecho`).toBe(false)
        }
      })

      // Los mundos de base de datos no tienen ficheros ni solución en
      // ficheros: su estado vive en SQLite y los prueba mundos-sql.test.js,
      // ejecutando SQL de verdad.
      const deFicheros = !mundo.sql

      it.skipIf(!deFicheros)('la solución de referencia supera TODOS los pasos', async () => {
        expect(mundo.solucion).toBeTruthy()
        for (const p of mundo.pasos) {
          const r = await p.comprobar(mundo.solucion, p.respuestaCorrecta ?? null)
          expect(r.superado, `${p.id} no se supera ni con la solución: ${r.mensaje}`).toBe(true)
        }
      })

      it('toda comprobación da superado booleano y mensaje con fondo', async () => {
        for (const p of mundo.pasos) {
          const r = await p.comprobar(mundo.ficheros)
          expect(typeof r.superado).toBe('boolean')
          expect(r.mensaje.length, `${p.id}`).toBeGreaterThan(15)
        }
      })

      it('ninguna comprobación revienta con basura', async () => {
        const basura = [{}, { 'src/App.vue': '' }, { 'src/App.vue': '<<<' }, { 'src/App.vue': null }]
        for (const p of mundo.pasos) {
          for (const ficheros of basura) {
            await expect((async () => p.comprobar(ficheros))()).resolves.toBeTruthy()
          }
        }
      })

      it('si es largo, varía los tipos y acaba en síntesis', () => {
        if (mundo.pasos.length < 8) return
        const tipos = new Set(mundo.pasos.map((p) => p.tipo || 'codigo'))
        expect(tipos.size, [...tipos].join(', ')).toBeGreaterThanOrEqual(3)
        expect(mundo.pasos.at(-1).sintesis).toBe(true)
      })
    })
  }
})

describe('navegación del índice', () => {
  it('mundoNumero y mundoDespuesDe se comportan', () => {
    expect(mundoNumero(mundos[0].numero)).toBe(mundos[0])
    expect(mundoNumero(999)).toBeNull()
    expect(mundoDespuesDe(mundos.at(-1).numero)).toBeNull()
  })

  it('totalPasos y actos cuadran', () => {
    expect(totalPasos).toBe(mundos.reduce((s, m) => s + m.pasos.length, 0))
    expect(actos.length).toBeGreaterThan(0)
  })
})
