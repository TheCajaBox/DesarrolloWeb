// Lo que comparten las dos Armonías: la del servidor (Workers AI) y la local
// de la app de escritorio (sin internet).
//
// Vive aquí, y no en servidor/armonia.js, porque el detector de "dame la
// solución" y el tapador de código tienen que comportarse EXACTAMENTE igual en
// los dos sitios. Dos copias divergentes de esto serían dos personajes
// distintos con el mismo nombre.
//
// Sin dependencias: lo importa un Worker de Cloudflare y también el navegador.

// Sin esto los patrones no valen para nada: están escritos sin acentos, y en
// español se escribe "solución" con tilde, "código" con tilde y "cuál" con
// tilde. "Dame la solución" pasaba el filtro solo por llevar acento.
//
// La clase \p{M} son las marcas diacríticas que deja suelto el normalize.
export function sinAcentos(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

// Peticiones que no merecen gastar Neurons (ni, en local, una respuesta seria):
// se cortan antes de todo lo demás.
const PIDE_SOLUCION = [
  /\b(dame|damelo|escribeme|hazme|ponme|dime)\b[^?]{0,40}\b(la\s+)?(solucion|respuesta|codigo)\b/i,
  /\bcomo\s+(se\s+)?(hace|resuelve)\s+(el\s+)?(ejercicio|paso|reto)\b/i,
  /\bresuelve(me)?(lo)?\b/i,
  /\bcopia(me)?\s+el\s+codigo\b/i,
  /\bcual\s+es\s+la\s+respuesta\b/i,
]

export function pareceQuePideSolucion(texto) {
  const llano = sinAcentos(texto)
  return PIDE_SOLUCION.some((patron) => patron.test(llano))
}

// Las tres formas que tiene Armonía de decir que no. No es un "prueba otra
// vez": cada una devuelve la pelota con una pregunta.
export const NEGATIVAS = [
  'Eso no te lo voy a dar, y no es por fastidiar: si te lo escribo yo, el paso se cierra y tu sigues igual. Cuentame que has intentado y por donde se te ha torcido.',
  'La solucion no. Pero dime que crees que deberia pasar y que pasa en realidad, y desde ahi tiramos.',
  'No. Te propongo otra cosa: explicame con tus palabras que se supone que tiene que hacer ese trozo. Muchas veces el fallo aparece solo al decirlo en voz alta.',
]

// Aunque el modelo se venga arriba y suelte código, aquí se tapa mientras el
// paso siga abierto.
export function taparCodigo(texto) {
  return String(texto || '')
    .replace(/```[\s\S]*?```/g, '\n_(Aqui habia codigo. No mientras el paso siga abierto.)_\n')
    .replace(/(?:^|\n)(?: {4}|\t)[^\n]+(?:\n(?: {4}|\t)[^\n]+)*/g, '\n_(Aqui habia codigo.)_\n')
}
