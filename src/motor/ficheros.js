// El taller pide sus ficheros a través de aquí, y este módulo elige el backend
// según dónde se esté ejecutando:
//
//   - App de escritorio (Electron, con window.taller): disco real (fs-real.js).
//   - Navegador (sin window.taller): el sistema de ficheros virtual sobre
//     IndexedDB de siempre (sfv.js).
//
// Las dos implementaciones tienen la misma interfaz a propósito, así que el
// resto del taller importa de aquí y no se entera de cuál hay debajo. Es la
// pieza que permite que la misma interfaz sirva para la web y para el escritorio.

import * as sfv from './sfv.js'
import * as fsReal from './fs-real.js'

export const esEscritorio = typeof window !== 'undefined' && Boolean(window.taller)

const impl = esEscritorio ? fsReal : sfv

export const normalizarRuta = sfv.normalizarRuta
export const extensionDe = sfv.extensionDe
export const construirArbol = sfv.construirArbol
export const ErrorDeRuta = sfv.ErrorDeRuta

export const listar = impl.listar
export const leer = impl.leer
export const existe = impl.existe
export const guardar = impl.guardar
export const crear = impl.crear
export const borrar = impl.borrar
export const renombrar = impl.renombrar
export const sembrar = impl.sembrar
export const restaurar = impl.restaurar
export const reemplazar = impl.reemplazar
export const arbol = impl.arbol
