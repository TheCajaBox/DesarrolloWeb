import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import mundos from '../src/contenido/vue/indice.js'
import { usarMotorSql } from '../src/contenido/mundos/comprobaciones-sql.js'
import * as motor from './apoyo/sqlite-node.js'

// Los mundos de base de datos se prueban ejecutando SQL DE VERDAD (el SQLite
// que trae Node), no comprobando textos. Es la misma exigencia que el taller
// le pide a quien aprende.

const mundosSql = mundos.filter((mundo) => mundo.sql)

beforeAll(() => {
  usarMotorSql(motor)
})

describe('el temario de base de datos existe', () => {
  it('hay mundos SQL y todos declaran su solución', () => {
    expect(mundosSql.length).toBeGreaterThan(0)
    for (const mundo of mundosSql) {
      expect(mundo.solucionSql, `mundo ${mundo.numero} sin solucionSql`).toBeTruthy()
      expect(mundo.ficheros, `mundo ${mundo.numero}: los mundos SQL no llevan ficheros`).toEqual({})
    }
  })
})

for (const mundo of mundosSql) {
  describe(`mundo ${mundo.numero} · ${mundo.titulo}`, () => {
    beforeEach(async () => {
      await motor.reiniciar()
      if (mundo.semilla) await motor.ejecutarGuion(mundo.semilla)
    })

    it('la semilla es SQL válido y deja la base en pie', async () => {
      const esquema = await motor.esquema()
      expect(Array.isArray(esquema)).toBe(true)
    })

    it('la base de partida no supera ningún paso', async () => {
      for (const paso of mundo.pasos) {
        const resultado = await paso.comprobar({}, null)
        expect(resultado.superado, `${paso.id} venía hecho`).toBe(false)
        expect(resultado.mensaje.length, `${paso.id} sin mensaje`).toBeGreaterThan(15)
      }
    })

    it('la solución de referencia supera TODOS los pasos', async () => {
      await motor.ejecutarGuion(mundo.solucionSql)

      for (const paso of mundo.pasos) {
        const resultado = await paso.comprobar({}, paso.respuestaCorrecta ?? null)
        expect(
          resultado.superado,
          `${paso.id} no se supera ni con la solución: ${resultado.mensaje}`,
        ).toBe(true)
      }
    })

    it('ninguna comprobación revienta con la base vacía o a medias', async () => {
      await motor.reiniciar()
      for (const paso of mundo.pasos) {
        await expect((async () => paso.comprobar({}, null))()).resolves.toBeTruthy()
      }

      // Y con una tabla que no es la que esperan.
      await motor.ejecutarGuion('CREATE TABLE cualquiera (x TEXT)')
      for (const paso of mundo.pasos) {
        await expect((async () => paso.comprobar({}, null))()).resolves.toBeTruthy()
      }
    })

    it('el esquema que deja la solución no tiene avisos graves de Wax', async () => {
      await motor.ejecutarGuion(mundo.solucionSql)
      const { criticar } = await import('../src/motor/critica-esquema.js')
      const graves = criticar(await motor.esquema()).filter((aviso) => aviso.gravedad === 'alta')
      expect(
        graves.map((aviso) => aviso.titulo),
        `la solución del mundo ${mundo.numero} deja un esquema que Wax criticaría`,
      ).toEqual([])
    })
  })
}
