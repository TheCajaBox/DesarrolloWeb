// Dónde están escondidos los sombreros, en forma de reglas.
//
// Las reglas viven aquí y no dentro de los componentes por dos motivos: para
// poder apretarlas con pruebas de verdad (un premio que se da solo, o que no se
// da nunca, es peor que no tenerlo), y para que nadie que abra un componente se
// encuentre el escondite de frente.
//
// Todas son funciones puras: entra texto, salen identificadores. Ninguna toca
// el almacén ni el reloj.

// El mundo donde se explica que cada elemento de una lista quiere su `:key`.
// Ponerlo ANTES de eso es lo que tiene mérito; después ya te lo han contado.
const MUNDO_DE_LA_LLAVE = 11

/**
 * El texto de los comentarios de un fichero, sea .vue, .js, .css o .html.
 *
 * Se buscan los tres tipos que puede haber: los de HTML, los de línea y los de
 * bloque. Devuelve solo lo que hay DENTRO de los comentarios, para que escribir
 * una palabra en el código normal no cuente.
 */
export function comentariosDe(codigo) {
  const texto = String(codigo || '')
  const trozos = []

  for (const patron of [/<!--([\s\S]*?)-->/g, /\/\*([\s\S]*?)\*\//g, /\/\/(.*)$/gm]) {
    for (const encaje of texto.matchAll(patron)) trozos.push(encaje[1])
  }

  return trozos.join('\n')
}

/**
 * Si en el código hay una lista pintada con su llave puesta.
 *
 * Se comprueba etiqueta a etiqueta: el `v-for` y el `:key` tienen que estar en
 * el MISMO elemento. Tenerlos en dos sitios distintos no vale, y además es
 * justo el error que se comete al aprender esto.
 */
export function hayListaConLlave(codigo) {
  const texto = String(codigo || '')

  for (const encaje of texto.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const etiqueta = encaje[0]
    if (!/\sv-for\s*=/.test(etiqueta)) continue
    if (/\s(:key|v-bind:key)\s*=/.test(etiqueta)) return true
  }

  return false
}

/**
 * Los sombreros que se ganan por lo que hay escrito en un fichero.
 *
 * Devuelve una lista de identificadores; el almacén ya se encarga de ignorar
 * los que ya estuvieran encontrados, así que esto se puede llamar cada vez que
 * se teclea sin miedo a repetir la fiesta.
 */
export function sombrerosEnElCodigo(codigo, { mundoActual = 1 } = {}) {
  const hallados = []

  // Hablarle al fichero. Solo cuenta dentro de un comentario: es la gracia.
  if (/hay\s+alguien/i.test(comentariosDe(codigo))) {
    hallados.push('sombrero-de-dentro')
  }

  if (mundoActual < MUNDO_DE_LA_LLAVE && hayListaConLlave(codigo)) {
    hallados.push('sombrero-de-la-llave')
  }

  return hallados
}

/**
 * El sombrero que se gana escribiendo cierto comando en la terminal, si es que
 * alguno. Un comando, un sombrero como mucho.
 */
export function sombreroDelComando(comando) {
  const orden = String(comando || '').trim()

  // Comprobar que lo que has hecho no rompe nada es media profesión.
  if (/^(npm\s+(test|run\s+test)|npx\s+vitest|vitest)(\s|$)/i.test(orden)) {
    return 'bombin-de-la-terminal'
  }

  // Un guiño a los otros gatos, los de las croquetas.
  if (/^(gato|gatos|gatito|croqueta|croquetas|miau)(\s|$)/i.test(orden)) {
    return 'sombrero-del-gato'
  }

  return null
}

/**
 * El sombrero que se gana por algo que ha visto el proceso principal.
 *
 * El nombre que llega es de lo que ha pasado ('devtools'), no del premio: así
 * el proceso principal no sabe nada de sombreros y las reglas siguen viviendo
 * todas en este fichero.
 */
export function sombreroDeLoQuePasa(que) {
  if (que === 'devtools') return 'gorra-de-las-tripas'
  return null
}
