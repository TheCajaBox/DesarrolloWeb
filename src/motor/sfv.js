// Sistema de ficheros virtual.
//
// Es lo que el alumno ve como "su carpeta de proyecto". Por debajo son filas
// en IndexedDB, pero se comporta como un sistema de ficheros: hay rutas con
// barras, hay carpetas, y el Service Worker lo sirve como si fuera un disco.

import {
  borrarFichero,
  borrarProyecto,
  escribirFichero,
  leerFichero,
  listarFicheros,
} from './bd-navegador.js'

export class ErrorDeRuta extends Error {}

// Normaliza y, sobre todo, impide salirse del proyecto. Sin esto, un
// `../../otro-proyecto/index.html` leeria ficheros ajenos.
export function normalizarRuta(entrada) {
  const bruta = String(entrada ?? '').trim().replace(/\\/g, '/')
  if (!bruta) throw new ErrorDeRuta('La ruta no puede estar vacia')

  const partes = []
  for (const parte of bruta.split('/')) {
    if (parte === '' || parte === '.') continue
    if (parte === '..') throw new ErrorDeRuta('No se puede subir por encima del proyecto')
    // Solo lo que de verdad no puede ir en un nombre de fichero:
    // caracteres de control y los que Windows prohibe. Guiones, guiones
    // bajos y espacios pasan, que son normalisimos en nombres reales.
    if (/[<>:"|?*\u0000-\u001f]/.test(parte)) {
      throw new ErrorDeRuta(`"${parte}" tiene caracteres que no valen en un nombre de fichero`)
    }
    partes.push(parte)
  }

  if (!partes.length) throw new ErrorDeRuta('La ruta no lleva a ningun sitio')
  const ruta = partes.join('/')
  if (ruta.length > 200) throw new ErrorDeRuta('Esa ruta es larguisima')
  return ruta
}

export function extensionDe(ruta) {
  const nombre = ruta.split('/').pop() || ''
  return nombre.includes('.') ? nombre.split('.').pop().toLowerCase() : ''
}

export const listar = (proyecto) => listarFicheros(proyecto)

export async function leer(proyecto, ruta) {
  const fichero = await leerFichero(proyecto, normalizarRuta(ruta))
  return fichero ? fichero.contenido : null
}

export async function existe(proyecto, ruta) {
  return (await leerFichero(proyecto, normalizarRuta(ruta))) != null
}

export async function guardar(proyecto, ruta, contenido) {
  return escribirFichero(proyecto, normalizarRuta(ruta), String(contenido ?? ''))
}

export async function crear(proyecto, ruta, contenido = '') {
  const limpia = normalizarRuta(ruta)
  if (await existe(proyecto, limpia)) throw new ErrorDeRuta(`Ya existe ${limpia}`)
  return escribirFichero(proyecto, limpia, String(contenido))
}

export async function borrar(proyecto, ruta) {
  return borrarFichero(proyecto, normalizarRuta(ruta))
}

export async function renombrar(proyecto, desde, hasta) {
  const origen = normalizarRuta(desde)
  const destino = normalizarRuta(hasta)
  if (origen === destino) return

  const fichero = await leerFichero(proyecto, origen)
  if (!fichero) throw new ErrorDeRuta(`No existe ${origen}`)
  if (await existe(proyecto, destino)) throw new ErrorDeRuta(`Ya existe ${destino}`)

  await escribirFichero(proyecto, destino, fichero.contenido, fichero.binario)
  await borrarFichero(proyecto, origen)
}

// Crea los ficheros que falten, y SOLO los que falten.
//
// Esto es una regla, no una optimizacion: el proyecto es de quien lo escribe.
// Un mundo nuevo puede necesitar que exista un fichero, pero jamas puede pisar
// lo que ya hay dentro. Antes esto reemplazaba el proyecto entero al cambiar de
// mundo, y eso convertia el taller en ejercicios sueltos en vez de en una web
// tuya que va creciendo.
//
// Devuelve las rutas que ha tenido que crear.
export async function sembrar(proyecto, ficheros) {
  const creados = []

  for (const [ruta, contenido] of Object.entries(ficheros)) {
    const limpia = normalizarRuta(ruta)
    if (await existe(proyecto, limpia)) continue

    await escribirFichero(proyecto, limpia, contenido)
    creados.push(limpia)
  }

  return creados
}

// Deja el proyecto EXACTAMENTE con estos ficheros, borrando lo que no esté.
//
// Solo se usa al adoptar la copia de la nube: ahí sí queremos que el navegador
// quede idéntico a lo guardado, incluidos los ficheros que se borraron desde
// otro sitio. Nunca al cambiar de mundo.
export async function reemplazar(proyecto, ficheros) {
  await borrarProyecto(proyecto)

  for (const [ruta, contenido] of Object.entries(ficheros)) {
    await escribirFichero(proyecto, normalizarRuta(ruta), contenido)
  }
}

// Devuelve unos ficheros concretos a su contenido original. Es destructivo, y
// por eso solo se llama desde una accion explicita ("volver a empezar este
// mundo"). Lo que la persona haya creado por su cuenta no se toca.
export async function restaurar(proyecto, ficheros) {
  for (const [ruta, contenido] of Object.entries(ficheros)) {
    await escribirFichero(proyecto, normalizarRuta(ruta), contenido)
  }
}

// Convierte la lista plana de rutas en el arbol que dibuja el panel lateral.
export function construirArbol(ficheros) {
  const raiz = { nombre: '', tipo: 'carpeta', ruta: '', hijos: [] }

  for (const fichero of ficheros) {
    const partes = fichero.ruta.split('/')
    let nodo = raiz

    partes.forEach((parte, indice) => {
      const esHoja = indice === partes.length - 1
      const ruta = partes.slice(0, indice + 1).join('/')
      let siguiente = nodo.hijos.find((hijo) => hijo.nombre === parte)

      if (!siguiente) {
        siguiente = esHoja
          ? { nombre: parte, tipo: 'fichero', ruta, extension: extensionDe(parte) }
          : { nombre: parte, tipo: 'carpeta', ruta, hijos: [] }
        nodo.hijos.push(siguiente)
      }

      nodo = siguiente
    })
  }

  // Carpetas antes que ficheros, y dentro de cada grupo por orden alfabetico.
  const ordenar = (nodo) => {
    if (!nodo.hijos) return nodo
    nodo.hijos.sort((a, b) =>
      a.tipo === b.tipo ? a.nombre.localeCompare(b.nombre) : a.tipo === 'carpeta' ? -1 : 1,
    )
    nodo.hijos.forEach(ordenar)
    return nodo
  }

  return ordenar(raiz)
}

export async function arbol(proyecto) {
  return construirArbol(await listar(proyecto))
}
