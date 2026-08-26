// Adaptador de ficheros reales, para la app de escritorio.
//
// Tiene EXACTAMENTE la misma interfaz que motor/sfv.js (el sistema de ficheros
// virtual sobre IndexedDB del taller web), pero por debajo lee y escribe en el
// disco de verdad, a través del puente que expone Electron (`window.taller`).
//
// Que las firmas coincidan es lo que permite que `almacen/taller.js` no note el
// cambio: solo cambia de qué módulo importa. El parámetro `proyecto`, que en el
// taller web separaba varios proyectos en IndexedDB, aquí se ignora: en el
// escritorio hay un solo proyecto, que es la carpeta real.
//
// Las funciones puras (normalizar rutas, construir el árbol) se reutilizan tal
// cual de sfv.js: no hay motivo para duplicarlas.

import { ErrorDeRuta, construirArbol, extensionDe, normalizarRuta } from './sfv.js'

export { ErrorDeRuta, construirArbol, extensionDe, normalizarRuta }

// El puente contra el que trabaja. Por defecto el de Electron; en las pruebas
// se inyecta uno de mentira con usarPuente().
let puente = typeof window !== 'undefined' && window.taller ? window.taller : null

export function usarPuente(nuevo) {
  puente = nuevo
}

function conPuente() {
  if (puente) return puente
  // Si no se inyectó uno, se busca el de Electron en el momento de usarlo (no
  // al cargar el módulo): así da igual el orden en que arranquen las cosas.
  if (typeof window !== 'undefined' && window.taller) return window.taller
  throw new Error('fs-real: no hay puente. ¿Se está usando fuera de la app de escritorio?')
}

export async function listar() {
  const p = conPuente()
  const rutas = await p.listar()

  const registros = []
  for (const ruta of rutas) {
    registros.push({
      ruta,
      contenido: (await p.leer(ruta)) ?? '',
      binario: false,
      actualizado: 0,
    })
  }

  return registros.sort((a, b) => a.ruta.localeCompare(b.ruta))
}

export async function leer(_proyecto, ruta) {
  return conPuente().leer(normalizarRuta(ruta))
}

export async function existe(_proyecto, ruta) {
  return (await conPuente().leer(normalizarRuta(ruta))) != null
}

export async function guardar(_proyecto, ruta, contenido) {
  await conPuente().escribir(normalizarRuta(ruta), String(contenido ?? ''))
}

export async function crear(_proyecto, ruta, contenido = '') {
  const limpia = normalizarRuta(ruta)
  if (await existe(null, limpia)) throw new ErrorDeRuta(`Ya existe ${limpia}`)
  await conPuente().escribir(limpia, String(contenido))
}

export async function borrar(_proyecto, ruta) {
  await conPuente().borrar(normalizarRuta(ruta))
}

export async function renombrar(_proyecto, desde, hasta) {
  const origen = normalizarRuta(desde)
  const destino = normalizarRuta(hasta)
  if (origen === destino) return

  if (!(await existe(null, origen))) throw new ErrorDeRuta(`No existe ${origen}`)
  if (await existe(null, destino)) throw new ErrorDeRuta(`Ya existe ${destino}`)

  await conPuente().renombrar(origen, destino)
}

// Crea solo lo que falte, sin pisar nada. La regla del proyecto es de quien lo
// escribe: un mundo puede necesitar que exista un fichero, no reescribírtelo.
export async function sembrar(_proyecto, ficheros) {
  const creados = []
  for (const [ruta, contenido] of Object.entries(ficheros)) {
    const limpia = normalizarRuta(ruta)
    if (await existe(null, limpia)) continue
    await conPuente().escribir(limpia, contenido)
    creados.push(limpia)
  }
  return creados
}

// Devuelve unos ficheros concretos a su contenido original. Destructivo y
// explícito ("volver a empezar este mundo"); solo toca los que se le pasan.
export async function restaurar(_proyecto, ficheros) {
  for (const [ruta, contenido] of Object.entries(ficheros)) {
    await conPuente().escribir(normalizarRuta(ruta), contenido)
  }
}

// Deja el proyecto EXACTAMENTE con estos ficheros, borrando lo que no esté.
// Solo se usa al adoptar una copia entera; nunca al cambiar de mundo.
export async function reemplazar(_proyecto, ficheros) {
  const p = conPuente()
  const nuevos = new Set(Object.keys(ficheros).map((r) => normalizarRuta(r)))

  for (const ruta of await p.listar()) {
    if (!nuevos.has(ruta)) await p.borrar(ruta)
  }
  for (const [ruta, contenido] of Object.entries(ficheros)) {
    await p.escribir(normalizarRuta(ruta), contenido)
  }
}

export async function arbol() {
  return construirArbol(await listar())
}
