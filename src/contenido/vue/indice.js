// Los mundos del temario Vue (app de escritorio), en orden.
//
// Separado del índice del taller web (contenido/mundos/indice.js) a propósito:
// son dos temarios distintos, uno vanilla y otro Vue. Comparten el motor de
// comprobaciones y los tipos de paso, no el contenido.

import mundo01 from './mundo-01.js'
import mundo02 from './mundo-02.js'
import mundo03 from './mundo-03.js'
import mundo04 from './mundo-04.js'
import mundo05 from './mundo-05.js'
import mundo06 from './mundo-06.js'
import mundo07 from './mundo-07.js'
import mundo08 from './mundo-08.js'
import mundo09 from './mundo-09.js'
import mundo10 from './mundo-10.js'
import mundo11 from './mundo-11.js'
import mundo12 from './mundo-12.js'
import mundo13 from './mundo-13.js'
import mundo14 from './mundo-14.js'
import mundo15 from './mundo-15.js'
import mundo16 from './mundo-16.js'
import mundo17 from './mundo-17.js'
import mundo18 from './mundo-18.js'
import mundo19 from './mundo-19.js'
import mundo20 from './mundo-20.js'
import mundo21 from './mundo-21.js'
import mundo22 from './mundo-22.js'
import mundo23 from './mundo-23.js'
import mundo24 from './mundo-24.js'
import mundo25 from './mundo-25.js'
import mundo26 from './mundo-26.js'
import mundo27 from './mundo-27.js'
import mundo28 from './mundo-28.js'
import mundo29 from './mundo-29.js'
import mundo30 from './mundo-30.js'
import mundo31 from './mundo-31.js'
import mundo32 from './mundo-32.js'

const mundos = [
  mundo01,
  mundo02,
  mundo03,
  mundo04,
  mundo05,
  mundo06,
  mundo07,
  mundo08,
  mundo09,
  mundo10,
  mundo11,
  mundo12,
  mundo13,
  mundo14,
  mundo15,
  mundo16,
  mundo17,
  mundo18,
  mundo19,
  mundo20,
  mundo21,
  mundo22,
  mundo23,
  mundo24,
  mundo25,
  mundo26,
  mundo27,
  mundo28,
  mundo29,
  mundo30,
  mundo31,
  mundo32,
].sort((a, b) => a.numero - b.numero)

export default mundos

export function mundoNumero(numero) {
  return mundos.find((m) => m.numero === Number(numero)) || null
}

export function mundoDespuesDe(numero) {
  const i = mundos.findIndex((m) => m.numero === Number(numero))
  return i === -1 ? null : mundos[i + 1] || null
}

export const actos = [...new Set(mundos.map((m) => m.acto).filter(Boolean))]
export const totalPasos = mundos.reduce((suma, m) => suma + m.pasos.length, 0)
