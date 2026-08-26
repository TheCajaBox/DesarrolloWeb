import { describe, expect, it } from 'vitest'
import {
  completar,
  eleccion,
  emparejar,
  ordenar,
  verdaderoFalso,
} from '../src/contenido/mundos/tipos-de-paso.js'

// Estos constructores son la base de casi todo el temario, así que si uno se
// tuerce se tuercen cien pasos a la vez. De ahí el detalle de las pruebas.

describe('eleccion', () => {
  const paso = eleccion({
    id: '1-1',
    titulo: 'Prueba',
    enunciado: '¿Cuál?',
    opciones: [
      { texto: 'La buena', correcta: true, porque: 'Porque sí, y por esto otro.' },
      { texto: 'La mala', porque: 'No, y esto es lo que confundes.' },
    ],
  })

  it('sin contestar no se supera', () => {
    expect(paso.comprobar({}).superado).toBe(false)
    expect(paso.comprobar({}, null).superado).toBe(false)
  })

  it('la correcta lo supera y explica', () => {
    const r = paso.comprobar({}, 0)
    expect(r.superado).toBe(true)
    expect(r.mensaje).toContain('Porque sí')
  })

  it('la equivocada explica el error, no dice solo que no', () => {
    const r = paso.comprobar({}, 1)
    expect(r.superado).toBe(false)
    expect(r.mensaje).toContain('confundes')
  })

  it('un índice inexistente no revienta', () => {
    expect(paso.comprobar({}, 99).superado).toBe(false)
  })

  it('expone cuál es la correcta para las pruebas, no en las opciones', () => {
    expect(paso.respuestaCorrecta).toBe(0)
    expect(paso.opciones[0].correcta).toBeUndefined()
  })

  it('se niega a construirse mal', () => {
    expect(() =>
      eleccion({ id: 'x', titulo: 't', enunciado: 'e', opciones: [{ texto: 'a', porque: 'p' }] }),
    ).toThrow(/correcta/)

    expect(() =>
      eleccion({
        id: 'x',
        titulo: 't',
        enunciado: 'e',
        opciones: [
          { texto: 'a', correcta: true, porque: 'p' },
          { texto: 'b', correcta: true, porque: 'p' },
        ],
      }),
    ).toThrow(/más de una/)

    expect(() =>
      eleccion({
        id: 'x',
        titulo: 't',
        enunciado: 'e',
        opciones: [{ texto: 'a', correcta: true }],
      }),
    ).toThrow(/explicación/)
  })
})

describe('verdaderoFalso', () => {
  const paso = verdaderoFalso({
    id: '2-1',
    titulo: 'Repaso',
    enunciado: '¿Cierto o falso?',
    afirmaciones: [
      { texto: 'Uno', cierto: true, porque: 'Uno sí, porque tal.' },
      { texto: 'Dos', cierto: false, porque: 'Dos no, porque cual.' },
      { texto: 'Tres', cierto: true, porque: 'Tres sí.' },
    ],
  })

  it('sin contestar todas, no cuenta', () => {
    expect(paso.comprobar({}, [true, null, true]).superado).toBe(false)
    expect(paso.comprobar({}, null).superado).toBe(false)
  })

  it('solo se supera acertando TODAS', () => {
    expect(paso.comprobar({}, [true, false, true]).superado).toBe(true)
    expect(paso.comprobar({}, [true, false, false]).superado).toBe(false)
  })

  it('dice cuál has fallado y por qué', () => {
    const r = paso.comprobar({}, [false, false, true])
    expect(r.mensaje).toContain('1')
    expect(r.mensaje).toContain('porque tal')
  })

  it('con varias mal, lo dice y empieza por la primera', () => {
    const r = paso.comprobar({}, [false, true, false])
    expect(r.mensaje).toContain('3 mal')
  })

  it('no filtra las respuestas en lo que se enseña', () => {
    expect(paso.afirmaciones[0].cierto).toBeUndefined()
    expect(paso.respuestaCorrecta).toEqual([true, false, true])
  })
})

describe('ordenar', () => {
  const paso = ordenar({
    id: '3-1',
    titulo: 'Ordena',
    enunciado: 'Pon esto en orden',
    lineas: ['primero', 'segundo', 'tercero', 'cuarto'],
    porque: 'Ese es el orden en que lo lee el navegador.',
  })

  it('las piezas se enseñan desordenadas', () => {
    expect(paso.piezas).toHaveLength(4)
    expect(paso.piezas).not.toEqual(['primero', 'segundo', 'tercero', 'cuarto'])
    // Pero están todas.
    expect([...paso.piezas].sort()).toEqual(['cuarto', 'primero', 'segundo', 'tercero'])
  })

  it('la respuesta correcta reconstruye el orden bueno', () => {
    const r = paso.comprobar({}, paso.respuestaCorrecta)
    expect(r.superado).toBe(true)
    expect(r.mensaje).toContain('navegador')
  })

  it('un orden mal dice en qué posición falla y qué iba ahí', () => {
    const alReves = [...paso.respuestaCorrecta].reverse()
    const r = paso.comprobar({}, alReves)
    expect(r.superado).toBe(false)
    expect(r.mensaje).toContain('primero')
  })

  it('sin contestar, no cuenta', () => {
    expect(paso.comprobar({}, null).superado).toBe(false)
    expect(paso.comprobar({}, [0, 1]).superado).toBe(false)
  })

  // Determinista: el mismo paso enseña siempre lo mismo, o las pruebas no
  // valdrían para nada.
  it('el desorden es siempre el mismo', () => {
    const otro = ordenar({
      id: '3-2',
      titulo: 'x',
      enunciado: 'y',
      lineas: ['primero', 'segundo', 'tercero', 'cuarto'],
      porque: 'z',
    })
    expect(otro.piezas).toEqual(paso.piezas)
  })
})

describe('completar', () => {
  const paso = completar({
    id: '4-1',
    titulo: 'Rellena',
    enunciado: 'Completa la regla',
    plantilla: 'article { ___: 1rem; ___: 1px solid #ddd; }',
    huecos: [
      { respuestas: ['padding'], porque: 'El hueco de dentro es el padding.' },
      { respuestas: ['border'], porque: 'Y lo que delimita la caja es el border.' },
    ],
  })

  it('acepta las respuestas buenas sin importar mayúsculas ni espacios', () => {
    expect(paso.comprobar({}, ['padding', 'border']).superado).toBe(true)
    expect(paso.comprobar({}, ['  PADDING ', 'Border']).superado).toBe(true)
  })

  it('dice qué hueco está mal y lo explica', () => {
    const r = paso.comprobar({}, ['margin', 'border'])
    expect(r.superado).toBe(false)
    expect(r.mensaje).toContain('hueco 1')
    expect(r.mensaje).toContain('padding')
  })

  it('con huecos vacíos avisa', () => {
    expect(paso.comprobar({}, ['padding', '']).superado).toBe(false)
    expect(paso.comprobar({}, null).superado).toBe(false)
  })

  it('admite varias respuestas válidas para un hueco', () => {
    const flexible = completar({
      id: '4-2',
      titulo: 't',
      enunciado: 'e',
      plantilla: 'display: ___;',
      huecos: [{ respuestas: ['grid', 'flex'], porque: 'Los dos valen aquí.' }],
    })
    expect(flexible.comprobar({}, ['grid']).superado).toBe(true)
    expect(flexible.comprobar({}, ['flex']).superado).toBe(true)
    expect(flexible.comprobar({}, ['block']).superado).toBe(false)
  })

  it('se niega si los huecos no cuadran con la plantilla', () => {
    expect(() =>
      completar({
        id: 'x',
        titulo: 't',
        enunciado: 'e',
        plantilla: 'a: ___; b: ___;',
        huecos: [{ respuestas: ['1'], porque: 'p' }],
      }),
    ).toThrow(/2 huecos/)
  })
})

describe('emparejar', () => {
  const paso = emparejar({
    id: '5-1',
    titulo: 'Empareja',
    enunciado: 'Une cada etiqueta con lo que significa',
    pares: [
      { izquierda: '<h1>', derecha: 'título principal' },
      { izquierda: '<p>', derecha: 'párrafo' },
      { izquierda: '<article>', derecha: 'algo con sentido propio', porque: 'Un article se sostiene solo.' },
    ],
    porque: 'Las etiquetas dicen qué es cada cosa, no cómo se ve.',
  })

  it('la columna derecha se enseña en otro orden', () => {
    expect(paso.derechas).not.toEqual(['título principal', 'párrafo', 'algo con sentido propio'])
    expect([...paso.derechas].sort()).toEqual(
      ['algo con sentido propio', 'párrafo', 'título principal'].sort(),
    )
  })

  it('la respuesta correcta lo supera', () => {
    const r = paso.comprobar({}, paso.respuestaCorrecta)
    expect(r.superado).toBe(true)
    expect(r.mensaje).toContain('qué es cada cosa')
  })

  it('una pareja mal usa su propia explicación si la tiene', () => {
    const mal = [...paso.respuestaCorrecta]
    ;[mal[0], mal[2]] = [mal[2], mal[0]]
    const r = paso.comprobar({}, mal)
    expect(r.superado).toBe(false)
    expect(r.mensaje).toBeTruthy()
  })

  it('sin emparejar todo, no cuenta', () => {
    expect(paso.comprobar({}, [0, null, 2]).superado).toBe(false)
  })
})

describe('todos los tipos comparten la misma forma', () => {
  const pasos = [
    eleccion({
      id: 'a-1',
      titulo: 't',
      enunciado: 'e',
      opciones: [{ texto: 'x', correcta: true, porque: 'p' }, { texto: 'y', porque: 'q' }],
    }),
    verdaderoFalso({
      id: 'a-2',
      titulo: 't',
      enunciado: 'e',
      afirmaciones: [{ texto: 'x', cierto: true, porque: 'p' }],
    }),
    ordenar({ id: 'a-3', titulo: 't', enunciado: 'e', lineas: ['1', '2', '3'], porque: 'p' }),
    completar({
      id: 'a-4',
      titulo: 't',
      enunciado: 'e',
      plantilla: '___',
      huecos: [{ respuestas: ['x'], porque: 'p' }],
    }),
    emparejar({
      id: 'a-5',
      titulo: 't',
      enunciado: 'e',
      pares: [
        { izquierda: 'a', derecha: '1' },
        { izquierda: 'b', derecha: '2' },
        { izquierda: 'c', derecha: '3' },
      ],
      porque: 'p',
    }),
  ]

  it('todos tienen id, titulo, enunciado, tipo y comprobar', () => {
    for (const paso of pasos) {
      expect(paso.id).toBeTruthy()
      expect(paso.titulo).toBeTruthy()
      expect(paso.enunciado).toBeTruthy()
      expect(paso.tipo).toBeTruthy()
      expect(typeof paso.comprobar).toBe('function')
    }
  })

  it('ninguno se supera sin respuesta, y todos dan mensaje', () => {
    for (const paso of pasos) {
      const r = paso.comprobar({})
      expect(r.superado, paso.id).toBe(false)
      expect(r.mensaje, paso.id).toBeTruthy()
    }
  })

  it('todos se superan con su respuestaCorrecta', () => {
    for (const paso of pasos) {
      expect(paso.comprobar({}, paso.respuestaCorrecta).superado, paso.id).toBe(true)
    }
  })
})
