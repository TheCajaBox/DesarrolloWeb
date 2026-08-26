// Los mundos, en orden. Se importa desde el taller y desde el Worker: Armonía
// necesita leer títulos y enunciados para dar contexto al modelo.
//
// Cada mundo lleva su número dentro. Este fichero solo los junta y los ordena,
// para que añadir uno nuevo sea tocar una línea.

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

const mundos = [mundo01, mundo02, mundo03, mundo04, mundo05, mundo06, mundo07, mundo08, mundo09, mundo10, mundo11, mundo12, mundo13, mundo14, mundo15].sort((a, b) => a.numero - b.numero)

export default mundos

export function mundoNumero(numero) {
  return mundos.find((mundo) => mundo.numero === Number(numero)) || null
}

export function pasoDe(numeroMundo, idPaso) {
  const mundo = mundoNumero(numeroMundo)
  return mundo ? mundo.pasos.find((paso) => paso.id === idPaso) || null : null
}

// El mundo siguiente en la lista, no el de número +1: mientras se escribe el
// temario hay huecos, y saltar de un mundo a otro tiene que seguir yendo.
export function mundoDespuesDe(numero) {
  const indice = mundos.findIndex((mundo) => mundo.numero === Number(numero))
  return indice === -1 ? null : mundos[indice + 1] || null
}

// Qué panel de la derecha necesita cada mundo para que sus pasos tengan
// sentido. Existe porque el panel se puede cerrar: si un enunciado dice "mira
// la vista previa" y la tienes oculta, te está hablando de algo invisible.
//
// Por defecto la vista previa. Solo se anota lo que se sale de eso.
const PANELES = {
  10: 'sql',
  11: 'sql',
}

export function panelDe(numero) {
  return PANELES[Number(numero)] || 'vista'
}

export const actos = [...new Set(mundos.map((mundo) => mundo.acto).filter(Boolean))]

export const totalPasos = mundos.reduce((suma, mundo) => suma + mundo.pasos.length, 0)
