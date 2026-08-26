// Subrayado de términos del glosario.
//
// Recibe el HTML ya formateado de una lección y envuelve los términos que
// Steris tiene fichados, para que se puedan pinchar sin salir de donde estabas.
//
// Tres cosas que hay que hacer bien o queda peor que no hacerlo:
//
// 1. **No tocar el interior de <code> ni <pre>.** Ahí dentro hay código, y
//    marcar la palabra "función" en medio de un ejemplo lo destroza.
// 2. **No entrar dentro de las etiquetas.** Un término que coincida con un
//    nombre de atributo rompería el HTML.
// 3. **Marcar cada término una sola vez por lección.** Un texto con la misma
//    palabra subrayada nueve veces es ruido, no ayuda.

import { porTermino } from '../contenido/glosario/terminos.js'

// Los más largos primero: así "clave primaria" gana a "clave ajena" y ninguno
// se come al otro por empezar igual.
const CLAVES_ORDENADAS = [...porTermino.keys()].sort((a, b) => b.length - a.length)

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Los límites de palabra de JavaScript no funcionan con acentos ni con eñes,
// así que se comprueba a mano lo que hay a los lados.
const PATRON = new RegExp(
  `(^|[^\\p{L}\\p{N}_-])(${CLAVES_ORDENADAS.map(escaparRegex).join('|')})(?![\\p{L}\\p{N}_-])`,
  'giu',
)

// Dentro de <code> y <pre> hay código; dentro de <a> ya hay algo pulsable y
// no se pueden anidar botones. En <strong> sí se marca: es justo donde Wax
// pone los términos importantes.
const SIN_MARCAR = new Set(['code', 'pre', 'a'])

/**
 * Devuelve el HTML con los términos envueltos en un <button class="termino">.
 * Es un botón y no un <span> a propósito: se tiene que poder usar con el
 * teclado, no solo con el ratón.
 */
export function marcarTerminos(html, { limitePorTermino = 1 } = {}) {
  const fuente = String(html ?? '')
  if (!fuente) return ''

  const vistos = new Map()
  const pila = []
  let salida = ''
  let posicion = 0

  // Se recorre el HTML separando etiquetas de texto. Las etiquetas se copian
  // tal cual; solo se toca el texto de en medio.
  const etiquetas = /<\/?([a-zA-Z][\w-]*)[^>]*>/g
  let etiqueta

  const procesar = (texto) => {
    if (pila.some((nombre) => SIN_MARCAR.has(nombre))) return texto

    return texto.replace(PATRON, (todo, antes, palabra) => {
      const clave = palabra.toLowerCase()
      const entrada = porTermino.get(clave)
      if (!entrada) return todo

      const cuantas = vistos.get(entrada.termino) || 0
      if (cuantas >= limitePorTermino) return todo
      vistos.set(entrada.termino, cuantas + 1)

      return `${antes}<button type="button" class="termino" data-termino="${entrada.termino}">${palabra}</button>`
    })
  }

  while ((etiqueta = etiquetas.exec(fuente)) !== null) {
    salida += procesar(fuente.slice(posicion, etiqueta.index))
    salida += etiqueta[0]

    const nombre = etiqueta[1].toLowerCase()
    if (etiqueta[0].startsWith('</')) {
      const indice = pila.lastIndexOf(nombre)
      if (indice !== -1) pila.splice(indice, 1)
    } else if (!etiqueta[0].endsWith('/>')) {
      pila.push(nombre)
    }

    posicion = etiquetas.lastIndex
  }

  salida += procesar(fuente.slice(posicion))
  return salida
}

export function definicionDe(termino) {
  return porTermino.get(String(termino || '').toLowerCase()) || null
}
