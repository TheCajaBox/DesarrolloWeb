// Lo que el taller recuerda entre sesiones, en un solo sitio.
//
// Todo acceso a localStorage va envuelto: en navegación privada, con el
// almacenamiento bloqueado o en algunos contextos, leer o escribir LANZA. Una
// preferencia que no se puede guardar no es motivo para que la aplicación no
// arranque.

const CLAVES = {
  paneles: 'sombrero-paneles',
  mundo: 'sombrero-mundo',
  // Qué mundo sembró los ficheros que hay ahora mismo en disco. Sirve para
  // detectar el desajuste entre "estoy en el mundo 3" y "los ficheros son del
  // mundo 13", que era desconcertante.
  sembrado: 'sombrero-mundo-sembrado',
}

function leer(clave, porDefecto = null) {
  try {
    const bruto = localStorage.getItem(CLAVES[clave])
    return bruto === null ? porDefecto : JSON.parse(bruto)
  } catch {
    return porDefecto
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(CLAVES[clave], JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

export const leerPaneles = () => leer('paneles', null)
export const guardarPaneles = (valor) => escribir('paneles', valor)

export const leerMundo = () => {
  const valor = leer('mundo', null)
  return Number.isInteger(valor) ? valor : null
}
export const guardarMundo = (numero) => escribir('mundo', Number(numero))

export const leerSembrado = () => {
  const valor = leer('sembrado', null)
  return Number.isInteger(valor) ? valor : null
}
export const guardarSembrado = (numero) => escribir('sembrado', Number(numero))
