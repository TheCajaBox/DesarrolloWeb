// Tipos de paso que no son escribir código.
//
// El documento de diseño lo dice claro: no todo puede ser teclear. Hay mundos
// —qué es un servidor, cómo llega una web a internet— donde lo que hay que
// hacer es entender, y comprobar que se ha entendido.
//
// La regla de estos pasos: **cada opción explica por qué**, incluidas las
// equivocadas. Un "no, prueba otra vez" no enseña nada; un "no, y esto es lo
// que confundes" sí.

/**
 * Un paso de elegir entre varias opciones.
 *
 *   opciones: [{ texto, correcta?, porque }]
 *
 * Devuelve un paso con la misma forma que los demás (id, titulo, enunciado,
 * comprobar), para que el resto del taller no tenga que distinguirlos.
 */
export function eleccion({ id, titulo, enunciado, pista = null, opciones }) {
  const correcta = opciones.findIndex((opcion) => opcion.correcta)
  if (correcta === -1) throw new Error(`El paso ${id} no tiene ninguna opción correcta`)
  if (opciones.filter((opcion) => opcion.correcta).length > 1) {
    throw new Error(`El paso ${id} tiene más de una opción correcta`)
  }
  if (opciones.some((opcion) => !opcion.porque)) {
    throw new Error(`El paso ${id} tiene opciones sin explicación`)
  }

  return {
    id,
    tipo: 'eleccion',
    titulo,
    enunciado,
    pista,
    opciones: opciones.map(({ texto, porque }) => ({ texto, porque })),
    // Para las pruebas: cuál es la buena, sin enseñársela a nadie.
    respuestaCorrecta: correcta,

    comprobar(_ficheros, respuesta) {
      if (respuesta === null || respuesta === undefined) {
        return { superado: false, mensaje: 'Elige una de las opciones y vuelve a comprobar.' }
      }

      const elegida = opciones[respuesta]
      if (!elegida) {
        return { superado: false, mensaje: 'Esa opción no existe. Elige una de la lista.' }
      }

      return { superado: Boolean(elegida.correcta), mensaje: elegida.porque }
    },
  }
}

export const esDeEleccion = (paso) => paso?.tipo === 'eleccion'
