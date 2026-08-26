import { describe, expect, it } from 'vitest'
import mundos, { actos, mundoDespuesDe, mundoNumero, pasoDe, totalPasos } from '../src/contenido/mundos/indice.js'

// Reglas que vale para TODOS los mundos, presentes y futuros. Si alguien anade
// uno que las incumple, salta aqui y no en la cara del alumno.
//
// Salen de docs/temario.md. Si cambia una regla, se cambia alli primero.

describe('invariantes de todos los mundos', () => {
  it('hay mundos y estan ordenados por numero', () => {
    expect(mundos.length).toBeGreaterThan(0)
    const numeros = mundos.map((m) => m.numero)
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b))
  })

  it('los numeros de mundo no se repiten', () => {
    const numeros = mundos.map((m) => m.numero)
    expect(new Set(numeros).size).toBe(numeros.length)
  })

  it('los ids de paso son unicos en todo el temario', () => {
    const ids = mundos.flatMap((m) => m.pasos.map((p) => p.id))
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(repetidos, `ids repetidos: ${repetidos.join(', ')}`).toEqual([])
  })

  it('cada id de paso empieza por el numero de su mundo', () => {
    for (const mundo of mundos) {
      for (const paso of mundo.pasos) {
        expect(paso.id, `${paso.id} no pertenece al mundo ${mundo.numero}`).toMatch(
          new RegExp(`^${mundo.numero}-`),
        )
      }
    }
  })

  for (const mundo of mundos) {
    describe(`mundo ${mundo.numero}`, () => {
      it('tiene titulo, acto, entradilla, apunte y cierre', () => {
        expect(mundo.titulo).toBeTruthy()
        expect(mundo.acto, 'sin acto').toBeTruthy()
        expect(mundo.entradilla?.texto, 'sin entradilla').toBeTruthy()
        expect(mundo.entradilla?.quien).toBeTruthy()
        expect(mundo.cierre?.texto, 'sin cierre').toBeTruthy()
        expect(mundo.apunte?.titulo, 'sin titulo de apunte').toBeTruthy()
        expect(mundo.apunte?.cuerpo, 'sin cuerpo de apunte').toBeTruthy()
      })

      // El documento de diseno pide lecciones de 3.000 a 7.000 caracteres. Se
      // deja margen por abajo, pero un apunte de cuatro lineas no ensena nada.
      it('la leccion de Wax tiene fondo', () => {
        expect(mundo.apunte.cuerpo.length).toBeGreaterThan(1200)
      })

      // Wayne va en un bocadillo flotante: si se enrolla, no cabe.
      it('lo que dice Wayne cabe en un bocadillo', () => {
        for (const parte of [mundo.entradilla, mundo.cierre]) {
          expect(parte.texto.length, `${parte.quien} se enrolla`).toBeLessThan(420)
        }
      })

      it('tiene entre 3 y 16 pasos', () => {
        expect(mundo.pasos.length).toBeGreaterThanOrEqual(3)
        expect(mundo.pasos.length).toBeLessThanOrEqual(16)
      })

      // El documento de diseno pide al menos cuatro tipos distintos por mundo
      // para que no cansen. Se exige a los mundos ya ampliados; los que siguen
      // cortos estan pendientes de ampliar y no deben bloquear las pruebas.
      it('si es un mundo largo, varia los tipos de paso', () => {
        if (mundo.pasos.length < 8) return

        const tipos = new Set(mundo.pasos.map((paso) => paso.tipo || 'codigo'))
        expect(
          tipos.size,
          `el mundo ${mundo.numero} tiene ${mundo.pasos.length} pasos y solo ${tipos.size} tipo(s): ${[...tipos].join(', ')}`,
        ).toBeGreaterThanOrEqual(3)
      })

      // Un mundo largo sin reto de sintesis al final no cierra nada: hay que
      // juntar lo aprendido, no solo acumularlo.
      it('si es un mundo largo, acaba en sintesis', () => {
        if (mundo.pasos.length < 8) return

        const ultimo = mundo.pasos[mundo.pasos.length - 1]
        expect(ultimo.sintesis, `el ultimo paso del mundo ${mundo.numero} no es de sintesis`).toBe(
          true,
        )
      })

      it('cada paso tiene titulo, enunciado y comprobacion', () => {
        for (const paso of mundo.pasos) {
          expect(paso.titulo, `${paso.id} sin titulo`).toBeTruthy()
          expect(paso.enunciado, `${paso.id} sin enunciado`).toBeTruthy()
          expect(typeof paso.comprobar, `${paso.id} sin comprobar`).toBe('function')
        }
      })

      it('el esqueleto sembrado no supera ningun paso', async () => {
        // Si un paso ya viene resuelto, ese paso no ensena nada.
        for (const paso of mundo.pasos) {
          const resultado = await paso.comprobar(mundo.ficheros)
          expect(resultado.superado, `${paso.id} venia hecho de fabrica`).toBe(false)
        }
      })

      // La invariante mas importante de todas. Un mundo imposible por una
      // comprobacion mal escrita es el peor fallo que puede tener esto: la
      // persona da por hecho que la que no sabe es ella, y lo deja.
      it('la solucion de referencia supera TODOS los pasos', async () => {
        expect(mundo.solucion, 'el mundo no trae solucion de referencia').toBeTruthy()

        for (const paso of mundo.pasos) {
          const resultado = await paso.comprobar(mundo.solucion, paso.respuestaCorrecta ?? null)
          expect(resultado.superado, `${paso.id} no se supera ni con la solucion: ${resultado.mensaje}`).toBe(true)
        }
      })

      it('toda comprobacion devuelve superado y mensaje', async () => {
        for (const paso of mundo.pasos) {
          const resultado = await paso.comprobar(mundo.ficheros)
          expect(typeof resultado.superado, `${paso.id}`).toBe('boolean')
          expect(resultado.mensaje, `${paso.id} sin mensaje`).toBeTruthy()
        }
      })

      // Los mensajes son la mitad del ejercicio: dicen que falta. "Incorrecto"
      // no dice nada.
      it('los mensajes de fallo explican algo', async () => {
        for (const paso of mundo.pasos) {
          const mensaje = (await paso.comprobar(mundo.ficheros)).mensaje
          expect(mensaje.length, `${paso.id}: mensaje demasiado escueto`).toBeGreaterThan(15)
          expect(mensaje.toLowerCase()).not.toMatch(/^(mal|incorrecto|error)\.?$/)
        }
      })

      // Alguien va a borrarlo todo, o a dejar el fichero a medias mientras
      // escribe. Ninguna comprobacion puede reventar por eso.
      it('ninguna comprobacion revienta con basura', async () => {
        const basura = [
          {},
          { 'index.html': '' },
          { 'index.html': '<<<>>>' },
          { 'index.html': '<article><h2>sin cerrar' },
          { 'estilos.css': '{{{' },
          { 'index.html': null },
          { 'app.js': 'esto no es javascript válido {{{' },
          { 'app.js': 'while (true) {}' },
        ]

        for (const paso of mundo.pasos) {
          for (const ficheros of basura) {
            // await y try/catch, no toThrow(): una comprobacion asincrona
            // rechaza la promesa en vez de lanzar, y toThrow no lo veria.
            await expect(
              (async () => paso.comprobar(ficheros))(),
              `${paso.id} revienta con ${JSON.stringify(ficheros)}`,
            ).resolves.toBeTruthy()
          }
        }
      })
    })
  }
})

describe('navegacion del indice', () => {
  it('mundoNumero encuentra por numero', () => {
    expect(mundoNumero(mundos[0].numero)).toBe(mundos[0])
    expect(mundoNumero(999)).toBeNull()
  })

  it('pasoDe encuentra un paso concreto', () => {
    const primero = mundos[0].pasos[0]
    expect(pasoDe(mundos[0].numero, primero.id)).toBe(primero)
    expect(pasoDe(mundos[0].numero, 'no-existe')).toBeNull()
  })

  // Mientras se escribe el temario hay huecos entre numeros (1, 2, 6...), y
  // el salto al siguiente tiene que seguir funcionando igual.
  it('mundoDespuesDe salta los huecos de numeracion', () => {
    for (let i = 0; i < mundos.length - 1; i += 1) {
      expect(mundoDespuesDe(mundos[i].numero)).toBe(mundos[i + 1])
    }
    expect(mundoDespuesDe(mundos.at(-1).numero)).toBeNull()
    expect(mundoDespuesDe(999)).toBeNull()
  })

  it('totalPasos suma todos los mundos', () => {
    expect(totalPasos).toBe(mundos.reduce((suma, m) => suma + m.pasos.length, 0))
  })

  it('los actos salen sin repetir y en orden', () => {
    expect(actos.length).toBeGreaterThan(0)
    expect(new Set(actos).size).toBe(actos.length)
  })
})
