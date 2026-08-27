// La apuesta de Wayne: las reglas del juego.
//
// El banco de rondas está en contenido/apuesta.js. Aquí solo se decide cuáles
// se pueden preguntar y en qué orden salen.
//
// El sorteo entra por parámetro en vez de llamar a Math.random por dentro: así
// las pruebas pueden fijar qué sale y comprobar el reparto de verdad, en lugar
// de cruzar los dedos.

import rondas from '../contenido/apuesta.js'

/** Cuántas seguidas hay que acertar para ganarle la apuesta. */
export const RACHA_QUE_GANA = 5

/** Con menos rondas que esto no hay partida: se repetirían enseguida. */
const MINIMO_PARA_JUGAR = 4

/**
 * Las rondas que se pueden preguntar con lo que ya se ha dado.
 *
 * Preguntar por algo que aún no se ha explicado sería destripar la lección y
 * dar por perdido lo que nadie te ha contado todavía.
 */
export function rondasDisponibles(mundoActual) {
  return rondas.filter((ronda) => ronda.desde <= Number(mundoActual || 0))
}

/** Si hay material suficiente para que la partida tenga gracia. */
export function hayApuesta(mundoActual) {
  return rondasDisponibles(mundoActual).length >= MINIMO_PARA_JUGAR
}

/**
 * La siguiente ronda: una que no haya salido ya, si queda alguna.
 *
 * Cuando se acaban las nuevas se vuelve a empezar con todas, que es mejor que
 * quedarse sin juego. Devuelve null si no hay ninguna disponible.
 */
export function elegirRonda(mundoActual, yaVistas = [], sorteo = Math.random) {
  const posibles = rondasDisponibles(mundoActual)
  if (!posibles.length) return null

  const frescas = posibles.filter((ronda) => !yaVistas.includes(ronda.id))
  const donde = frescas.length ? frescas : posibles

  const cual = Math.floor(sorteo() * donde.length)
  return donde[Math.min(Math.max(cual, 0), donde.length - 1)]
}
