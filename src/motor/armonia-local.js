// Armonía sin internet: la que responde en la app de escritorio.
//
// La Armonía del taller web habla con un modelo en Workers AI. Aquí no hay
// servidor ni conexión, así que en vez de fingir que piensa, hace algo que
// puede hacer de verdad y bien: buscar en el glosario de Steris lo que no se
// entiende, y orientar hacia la lección de Wax y hacia la pista del paso.
//
// Las reglas del personaje se mantienen intactas: no da la solución, no
// escribe el código del ejercicio, y cuando se la piden devuelve la pelota con
// una pregunta. Lo que cambia es de dónde saca el material, no quién es.
//
// Es determinista a propósito (nada de azar): así se puede probar.

import terminos, { porTermino } from '../contenido/glosario/terminos.js'
import { NEGATIVAS, pareceQuePideSolucion, sinAcentos, taparCodigo } from './armonia-comun.js'

// Lo primero que dice al abrirla, para que se sepa con quién se habla.
export const AVISO_LOCAL =
  'Estoy en modo local: sin conexión, con el glosario de Steris y las lecciones de Wax delante. ' +
  'Pregúntame por una palabra que no entiendas, o cuéntame dónde te has atascado.'

// Las claves del glosario (términos y alias) ordenadas de más larga a más
// corta: así "inyección SQL" gana a "SQL", y no se responde lo genérico
// cuando se ha preguntado por lo concreto.
// Se miden SIN los espacios envolventes: hay alias que son solo signos («{{ }}»)
// y al normalizarlos no queda nada, con lo que casarían con cualquier pregunta.
const CLAVES = [...porTermino.keys()]
  .map((clave) => ({ clave, llana: normalizar(clave) }))
  .filter((entrada) => entrada.llana.trim().length >= 2)
  .sort((a, b) => b.llana.length - a.llana.length)

// Todo a minúsculas, sin acentos y con la puntuación convertida en espacios,
// para que «¿Qué es un "ref"?» y «v-if` encuentren su término igual.
function normalizar(texto) {
  return ` ${sinAcentos(texto).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `
}

/**
 * Los términos del glosario que aparecen en la pregunta, sin repetir el mismo
 * término por dos alias distintos. Como mucho dos: tres definiciones seguidas
 * ya no se leen.
 */
export function terminosEn(pregunta, cuantos = 2) {
  const llana = normalizar(pregunta)
  if (!llana.trim()) return []

  const encontrados = []

  for (const { clave, llana: aguja } of CLAVES) {
    if (!llana.includes(aguja)) continue

    const entrada = porTermino.get(clave)
    if (entrada && !encontrados.includes(entrada)) encontrados.push(entrada)
    if (encontrados.length >= cuantos) break
  }

  return encontrados
}

/**
 * Los titulares en negrita de la lección de Wax: son los que le dan a la
 * persona un sitio concreto donde mirar, en vez de "vuelve a leerlo todo".
 */
export function titularesDe(mundo, cuantos = 3) {
  const cuerpo = String(mundo?.apunte?.cuerpo || '')
  const encontrados = [...cuerpo.matchAll(/\*\*(.+?)\*\*/g)]
    .map((coincidencia) => coincidencia[1].replace(/[.:]+$/, '').trim())
    .filter((titular) => titular.length > 3 && titular.length < 90)

  return [...new Set(encontrados)].slice(0, cuantos)
}

// Sin asteriscos ni markdown: el Narrador pinta texto plano y los `**` se
// verían tal cual.
function explicar(entrada) {
  const partes = [`«${entrada.termino}»: ${entrada.definicion}`]
  if (entrada.ojo) partes.push(`Y ojo con esto: ${entrada.ojo}`)
  return partes.join('\n\n')
}

/**
 * La respuesta de Armonía en local.
 *
 *   pregunta — lo que ha escrito la persona
 *   mundo    — el mundo actual (para su lección), puede faltar
 *   paso     — el paso actual (para su título), puede faltar
 *   turno    — cuántas veces ha respondido ya, para no repetir la misma
 *              negativa dos veces seguidas
 *
 * Devuelve { texto, modo }, donde modo es 'negativa', 'glosario' u
 * 'orientacion'. Nunca devuelve null: siempre hay algo que decir.
 */
export function responderEnLocal({ pregunta, mundo = null, paso = null, turno = 0 } = {}) {
  const texto = String(pregunta || '').trim()

  if (!texto) {
    return { texto: 'Escríbeme la duda y le damos una vuelta.', modo: 'orientacion' }
  }

  // Igual que en el servidor: si piden la solución, no la hay.
  if (pareceQuePideSolucion(texto)) {
    return { texto: NEGATIVAS[turno % NEGATIVAS.length], modo: 'negativa' }
  }

  // ¿Hay alguna palabra del glosario en la pregunta? Eso es lo que mejor sé
  // responder sin conexión.
  const encontrados = terminosEn(texto)
  if (encontrados.length) {
    const partes = encontrados.map(explicar)
    partes.push(
      encontrados.length > 1
        ? '¿Cuál de las dos se te está atravesando? Dime qué esperabas que pasara y qué pasa, y seguimos por ahí.'
        : 'Si con eso no se destraba, cuéntame qué has escrito y qué esperabas que hiciera.',
    )
    return { texto: taparCodigo(partes.join('\n\n')), modo: 'glosario' }
  }

  // Sin palabra reconocida: se orienta. Hacia la lección, hacia la pista, y
  // con la pregunta de siempre. La pista NO se copia aquí: está a un botón, y
  // es tu decisión usarla.
  const partes = []

  if (paso?.titulo) {
    partes.push(
      `Estamos en «${paso.titulo}». Sin conexión no puedo darle vueltas a tu texto, pero sí ayudarte a buscar.`,
    )
  } else {
    partes.push('Sin conexión no puedo darle vueltas a tu texto, pero sí ayudarte a buscar.')
  }

  const titulares = titularesDe(mundo)
  if (titulares.length) {
    partes.push(
      `En la lección de Wax de este mundo hay tres sitios donde mirar: ${titulares
        .map((titular) => `«${titular}»`)
        .join(', ')}.`,
    )
  }

  partes.push(
    'Si sigue sin salir, tienes «Dame una pista» ahí mismo: no es hacer trampa, es pedir el siguiente paso pequeño. ' +
      'Y si lo que falla es una palabra, dímela y te la explico del glosario.',
  )

  return { texto: partes.join('\n\n'), modo: 'orientacion' }
}

// Cuántos términos tiene el glosario a mano. Lo usa la interfaz para decir con
// qué material cuenta esta Armonía.
export const CUANTOS_TERMINOS = terminos.length
