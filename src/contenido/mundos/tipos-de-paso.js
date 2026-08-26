// Tipos de paso que no son escribir código.
//
// El documento de diseño lo dice claro: no todo puede ser teclear, y hacen
// falta al menos cuatro tipos distintos por mundo para que no cansen. Estos son
// además los que permiten llegar al volumen: un paso de elegir o de ordenar se
// escribe en veinte líneas, uno de código en cuarenta.
//
// La regla de todos ellos: **cada opción explica por qué**, incluidas las
// equivocadas. Un "prueba otra vez" no enseña nada; un "no, y esto es lo que
// estás confundiendo" sí.
//
// Todos devuelven un paso con la misma forma (id, titulo, enunciado, comprobar)
// para que el resto del taller no tenga que distinguirlos.

const sinRespuesta = { superado: false, mensaje: 'Contesta y vuelve a comprobar.' }

/**
 * Elegir una opción entre varias.
 *   opciones: [{ texto, correcta?, porque }]
 */
export function eleccion({ id, titulo, enunciado, pista = null, codigo = null, opciones }) {
  const correcta = opciones.findIndex((opcion) => opcion.correcta)
  if (correcta === -1) throw new Error(`El paso ${id} no tiene ninguna opción correcta`)
  if (opciones.filter((o) => o.correcta).length > 1) {
    throw new Error(`El paso ${id} tiene más de una opción correcta`)
  }
  if (opciones.some((o) => !o.porque)) {
    throw new Error(`El paso ${id} tiene opciones sin explicación`)
  }

  return {
    id,
    tipo: 'eleccion',
    titulo,
    enunciado,
    pista,
    codigo,
    opciones: opciones.map(({ texto, porque }) => ({ texto, porque })),
    respuestaCorrecta: correcta,

    comprobar(_ficheros, respuesta) {
      if (respuesta === null || respuesta === undefined) return sinRespuesta

      const elegida = opciones[respuesta]
      if (!elegida) return { superado: false, mensaje: 'Esa opción no existe. Elige una de la lista.' }

      return { superado: Boolean(elegida.correcta), mensaje: elegida.porque }
    },
  }
}

/**
 * Varias afirmaciones, cada una verdadera o falsa.
 *
 * Es el tipo más rentable para repasar: en un solo paso se tocan cinco ideas de
 * mundos anteriores. Y se supera solo acertando TODAS, así que no vale ir a
 * medias.
 *
 *   afirmaciones: [{ texto, cierto, porque }]
 */
export function verdaderoFalso({ id, titulo, enunciado, pista = null, afirmaciones }) {
  if (afirmaciones.some((a) => typeof a.cierto !== 'boolean' || !a.porque)) {
    throw new Error(`El paso ${id} tiene afirmaciones sin "cierto" o sin explicación`)
  }

  return {
    id,
    tipo: 'verdadero-falso',
    titulo,
    enunciado,
    pista,
    afirmaciones: afirmaciones.map(({ texto }) => ({ texto })),
    respuestaCorrecta: afirmaciones.map((a) => a.cierto),

    comprobar(_ficheros, respuesta) {
      if (!Array.isArray(respuesta) || respuesta.some((v) => v === null || v === undefined)) {
        return { superado: false, mensaje: 'Falta contestar alguna. Marca todas y vuelve a comprobar.' }
      }

      const falladas = afirmaciones
        .map((a, i) => ({ ...a, indice: i, acertada: respuesta[i] === a.cierto }))
        .filter((a) => !a.acertada)

      if (!falladas.length) {
        return { superado: true, mensaje: 'Las cinco bien. Eso es tenerlo asentado, no recordarlo de refilón.' }
      }

      const primera = falladas[0]
      return {
        superado: false,
        mensaje:
          falladas.length === 1
            ? `Una mal, la ${primera.indice + 1}. ${primera.porque}`
            : `Van ${falladas.length} mal. Empecemos por la ${primera.indice + 1}: ${primera.porque}`,
      }
    },
  }
}

/**
 * Poner unas líneas en el orden correcto.
 *
 *   lineas: [...]  (en el orden BUENO; se enseñan revueltas)
 */
export function ordenar({ id, titulo, enunciado, pista = null, lineas, porque }) {
  if (lineas.length < 3) throw new Error(`El paso ${id} necesita al menos tres líneas`)
  if (!porque) throw new Error(`El paso ${id} no explica por qué ese orden`)

  // Se revuelven de forma fija, sin azar: así el paso es siempre el mismo y las
  // pruebas son deterministas. Basta con que no coincida con el orden bueno.
  const revueltas = lineas.map((texto, i) => ({ texto, original: i }))
  const mezcla = [...revueltas.slice(1).reverse(), revueltas[0]]

  return {
    id,
    tipo: 'ordenar',
    titulo,
    enunciado,
    pista,
    // Lo que se le enseña, ya desordenado.
    piezas: mezcla.map((p) => p.texto),
    respuestaCorrecta: lineas.map((texto) => mezcla.findIndex((p) => p.texto === texto)),

    comprobar(_ficheros, respuesta) {
      if (!Array.isArray(respuesta) || respuesta.length !== lineas.length) return sinRespuesta

      const puestas = respuesta.map((indice) => mezcla[indice]?.texto)
      const primerFallo = puestas.findIndex((texto, i) => texto !== lineas[i])

      if (primerFallo === -1) return { superado: true, mensaje: porque }

      return {
        superado: false,
        mensaje: `La posición ${primerFallo + 1} no es la que toca. Ahí debería ir «${lineas[primerFallo]}».`,
      }
    },
  }
}

/**
 * Rellenar huecos en un trozo de código.
 *
 *   plantilla: 'article { ___: 1rem; }'
 *   huecos: [{ respuestas: ['padding'], porque }]
 *
 * Cada `___` de la plantilla es un hueco, en orden.
 */
export function completar({ id, titulo, enunciado, pista = null, plantilla, huecos }) {
  const cuantos = (plantilla.match(/___/g) || []).length
  if (cuantos !== huecos.length) {
    throw new Error(`El paso ${id} tiene ${cuantos} huecos y ${huecos.length} respuestas`)
  }
  if (huecos.some((h) => !h.respuestas?.length || !h.porque)) {
    throw new Error(`El paso ${id} tiene huecos sin respuestas o sin explicación`)
  }

  const normaliza = (texto) => String(texto ?? '').trim().toLowerCase()

  return {
    id,
    tipo: 'completar',
    titulo,
    enunciado,
    pista,
    plantilla,
    cuantosHuecos: cuantos,
    respuestaCorrecta: huecos.map((h) => h.respuestas[0]),

    comprobar(_ficheros, respuesta) {
      if (!Array.isArray(respuesta) || respuesta.some((v) => !String(v ?? '').trim())) {
        return { superado: false, mensaje: 'Quedan huecos por rellenar.' }
      }

      const fallo = huecos.findIndex(
        (hueco, i) => !hueco.respuestas.map(normaliza).includes(normaliza(respuesta[i])),
      )

      if (fallo === -1) {
        return { superado: true, mensaje: huecos[huecos.length - 1].porque }
      }

      return {
        superado: false,
        mensaje: `El hueco ${fallo + 1} no es «${String(respuesta[fallo]).trim()}». ${huecos[fallo].porque}`,
      }
    },
  }
}

/**
 * Emparejar dos columnas.
 *
 *   pares: [{ izquierda, derecha, porque? }]
 */
export function emparejar({ id, titulo, enunciado, pista = null, pares, porque }) {
  if (pares.length < 3) throw new Error(`El paso ${id} necesita al menos tres parejas`)
  if (!porque) throw new Error(`El paso ${id} no explica el conjunto`)

  // La columna derecha se enseña en otro orden, fijo y determinista.
  const derechas = [...pares.map((p) => p.derecha)].reverse()

  return {
    id,
    tipo: 'emparejar',
    titulo,
    enunciado,
    pista,
    izquierdas: pares.map((p) => p.izquierda),
    derechas,
    respuestaCorrecta: pares.map((p) => derechas.indexOf(p.derecha)),

    comprobar(_ficheros, respuesta) {
      if (!Array.isArray(respuesta) || respuesta.some((v) => v === null || v === undefined)) {
        return { superado: false, mensaje: 'Quedan parejas por hacer.' }
      }

      const fallo = pares.findIndex((par, i) => derechas[respuesta[i]] !== par.derecha)
      if (fallo === -1) return { superado: true, mensaje: porque }

      return {
        superado: false,
        mensaje:
          pares[fallo].porque ||
          `«${pares[fallo].izquierda}» no va con eso. Repásalo y prueba otra vez.`,
      }
    },
  }
}

export const TIPOS_SIN_CODIGO = ['eleccion', 'verdadero-falso', 'ordenar', 'completar', 'emparejar']

export const esDeEntender = (paso) => TIPOS_SIN_CODIGO.includes(paso?.tipo)
