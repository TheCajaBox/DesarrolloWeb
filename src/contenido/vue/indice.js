// Los mundos del temario Vue (app de escritorio), en orden.
//
// Separado del índice del taller web (contenido/mundos/indice.js) a propósito:
// son dos temarios distintos, uno vanilla y otro Vue. Comparten el motor de
// comprobaciones y los tipos de paso, no el contenido.

import mundo01 from './mundo-01.js'

const mundos = [mundo01].sort((a, b) => a.numero - b.numero)

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
