// Reparar el proyecto de la alumna cuando un fichero no es lo que dice ser.
//
// El taller no pisa nunca lo que ella escribe: es su proyecto. Pero hay un caso
// en el que sí hay que intervenir, y pasó de verdad: un fallo al cambiar de
// fichero escribió el contenido de index.html DENTRO de App.vue. Con eso, el
// proyecto no compila y el taller no arranca en el mundo 1, y quien lo sufre no
// tiene forma de saber qué ha pasado ni cómo salir.
//
// La regla de la reparación, para no convertir esto en "el taller me borra
// cosas": solo se repara un fichero cuando NO puede ser obra de nadie, es
// decir, cuando su contenido es de otro tipo de fichero (un .vue que empieza
// por <!doctype html>). Un .vue a medias, con errores o vacío se respeta: eso
// es alguien trabajando.

// Qué tiene que parecer cada fichero de la plantilla.
const ESPERADO = {
  'src/App.vue': {
    // No es un documento HTML: eso es el rastro de un fallo, no algo escrito.
    noPuedeSer: /^\s*<!doctype\s+html/i,
    que: 'un componente de Vue',
  },
  'index.html': {
    noPuedeSer: /^\s*<script setup>/i,
    que: 'la página HTML que monta la aplicación',
  },
  'src/main.js': {
    noPuedeSer: /^\s*<!doctype\s+html|^\s*<template[\s>]/i,
    que: 'el arranque de la aplicación',
  },
}

/**
 * Revisa un fichero y dice si hay que reponerlo.
 *   → { hayQueReponer, porque }
 */
function revisar(ruta, contenido) {
  const regla = ESPERADO[ruta]
  if (!regla) return { hayQueReponer: false, porque: null }

  const texto = String(contenido ?? '')

  // Vacío o casi: puede ser alguien empezando de cero. No se toca.
  if (texto.trim().length < 3) return { hayQueReponer: false, porque: null }

  // El ÚNICO motivo para reponer: el fichero contiene inequívocamente otro
  // tipo de fichero. Un documento HTML dentro de un .vue no lo escribe nadie
  // por gusto; es el rastro de un fallo.
  //
  // Se quedó fuera a propósito una comprobación de "esto no se parece a lo que
  // debería": la primera versión daba por roto un .vue con solo <style>, que es
  // raro pero legítimo. Ante la duda, no se toca: un fichero a medias, con
  // errores o con una forma extraña es alguien trabajando, y el proyecto es
  // suyo.
  if (regla.noPuedeSer.test(texto)) {
    return {
      hayQueReponer: true,
      porque: `${ruta} tiene dentro otro tipo de fichero, y debería ser ${regla.que}`,
    }
  }

  return { hayQueReponer: false, porque: null }
}

/**
 * Repara el proyecto copiando de la plantilla solo los ficheros que no son lo
 * que dicen ser. Devuelve la lista de lo reparado, para dejarlo apuntado.
 *
 * Se le pasan las funciones de fichero (leer, escribir, existe) para que esto
 * se pueda probar sin tocar el disco.
 */
function repararProyecto({ leer, escribir, existe, plantilla, proyecto, apuntar = () => {} }) {
  const reparados = []

  for (const ruta of Object.keys(ESPERADO)) {
    const suyo = proyecto(ruta)
    const original = plantilla(ruta)

    if (!existe(suyo) || !existe(original)) continue

    const { hayQueReponer, porque } = revisar(ruta, leer(suyo))
    if (!hayQueReponer) continue

    // Lo roto se guarda al lado antes de reponerlo: si resulta que había algo
    // aprovechable, no se ha perdido.
    const copia = `${suyo}.roto`
    try {
      if (!existe(copia)) escribir(copia, leer(suyo))
    } catch {
      /* si no se puede guardar la copia, se repara igual: lo otro no compila */
    }

    escribir(suyo, leer(original))
    reparados.push({ ruta, porque })
    apuntar(`reparado: ${porque} (lo anterior quedó en ${ruta}.roto)`)
  }

  return reparados
}

module.exports = { ESPERADO, revisar, repararProyecto }
