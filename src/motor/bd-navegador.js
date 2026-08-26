// Acceso a IndexedDB: el unico sitio donde viven los ficheros del alumno.
//
// Por que IndexedDB y no postMessage: el Service Worker que sirve la vista
// previa necesita leer los ficheros por su cuenta. Los Service Workers se
// duermen y se reinician cuando el navegador quiere, y la vista previa puede
// abrirse en una pestana que no es la del editor. Un almacen compartido y
// persistente sobrevive a todo eso; un canal de mensajes, no.

export const NOMBRE_BD = 'sombrero-taller'
export const VERSION_BD = 1
export const ALMACEN_FICHEROS = 'ficheros'

let promesaBd = null

export function abrirBd() {
  if (promesaBd) return promesaBd

  promesaBd = new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(NOMBRE_BD, VERSION_BD)

    peticion.onupgradeneeded = () => {
      const bd = peticion.result
      if (!bd.objectStoreNames.contains(ALMACEN_FICHEROS)) {
        // Clave compuesta: un mismo fichero puede existir en varios proyectos.
        bd.createObjectStore(ALMACEN_FICHEROS, { keyPath: ['proyecto', 'ruta'] })
      }
    }

    peticion.onsuccess = () => resolver(peticion.result)
    peticion.onerror = () => rechazar(peticion.error)
    peticion.onblocked = () => rechazar(new Error('IndexedDB bloqueada por otra pestana'))
  })

  return promesaBd
}

function transaccion(bd, modo) {
  return bd.transaction(ALMACEN_FICHEROS, modo).objectStore(ALMACEN_FICHEROS)
}

function esperar(peticion) {
  return new Promise((resolver, rechazar) => {
    peticion.onsuccess = () => resolver(peticion.result)
    peticion.onerror = () => rechazar(peticion.error)
  })
}

export async function leerFichero(proyecto, ruta) {
  const bd = await abrirBd()
  return esperar(transaccion(bd, 'readonly').get([proyecto, ruta]))
}

export async function escribirFichero(proyecto, ruta, contenido, binario = false) {
  const bd = await abrirBd()
  const registro = { proyecto, ruta, contenido, binario, actualizado: Date.now() }
  await esperar(transaccion(bd, 'readwrite').put(registro))
  return registro
}

export async function borrarFichero(proyecto, ruta) {
  const bd = await abrirBd()
  return esperar(transaccion(bd, 'readwrite').delete([proyecto, ruta]))
}

// Todos los ficheros de un proyecto. El rango se apoya en que la clave es
// [proyecto, ruta]: acotando el primer elemento salen solo los de ese proyecto.
export async function listarFicheros(proyecto) {
  const bd = await abrirBd()
  const rango = IDBKeyRange.bound([proyecto], [proyecto, '￿'])
  const filas = await esperar(transaccion(bd, 'readonly').getAll(rango))
  return filas.sort((a, b) => a.ruta.localeCompare(b.ruta))
}

export async function borrarProyecto(proyecto) {
  const bd = await abrirBd()
  const rango = IDBKeyRange.bound([proyecto], [proyecto, '￿'])
  return esperar(transaccion(bd, 'readwrite').delete(rango))
}
