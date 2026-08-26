// Utilidades de texto para buscar y comparar en español.
//
// Existe por un fallo concreto: los patrones que detectaban "dame la solución"
// estaban escritos sin acentos, así que la versión con tilde —o sea, la que
// escribe cualquiera— se colaba entera.
//
// Se comparte entre el navegador y el Worker para que las dos mitades entiendan
// lo mismo por "igual".

// El rango ̀-ͯ son las marcas de acento que NFD separa de su letra.
// Escrito con escapes a propósito: con los caracteres literales, el fuente es
// ilegible y cualquier round-trip de codificación lo corrompe en silencio.
const MARCAS_DE_ACENTO = /[̀-ͯ]/g

/** "canción" -> "cancion". Deja el resto igual, incluidas las mayúsculas. */
export function sinAcentos(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(MARCAS_DE_ACENTO, '')
}

/** Para comparar y buscar: sin acentos, en minúsculas y sin espacios de sobra. */
export function normalizar(texto) {
  return sinAcentos(texto).toLowerCase().trim()
}

/** Si `aguja` aparece en `pajar`, ignorando acentos y mayúsculas. */
export function contiene(pajar, aguja) {
  const a = normalizar(aguja)
  return a ? normalizar(pajar).includes(a) : true
}
