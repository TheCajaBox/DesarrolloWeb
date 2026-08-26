// Diálogos propios en lugar de los del navegador.
//
// `window.confirm` y `window.prompt` funcionan, y se ven exactamente como en
// 2001: tipografía del sistema, botones grises, y un cartel que no tiene nada
// que ver con la página. Además bloquean el hilo, así que ninguna animación
// sigue corriendo mientras están abiertos.
//
// La API es la misma de siempre —preguntar algo y esperar la respuesta— pero
// con promesas, así que quien llama casi no cambia:
//
//   if (await preguntar({ texto: '¿Seguro?' })) { ... }
//   const nombre = await pedirTexto({ etiqueta: 'Nombre', valor: 'a.html' })

import { ref } from 'vue'

// Un solo diálogo a la vez. Dos diálogos apilados no significan nada.
export const abierto = ref(null)

let resolver = null

function abrir(config) {
  // Si ya había uno, se cierra en falso: el nuevo manda.
  if (resolver) resolver(config.tipo === 'texto' ? null : false)

  return new Promise((res) => {
    resolver = res
    abierto.value = config
  })
}

function cerrar(valor) {
  const responder = resolver
  resolver = null
  abierto.value = null
  if (responder) responder(valor)
}

/** Sí o no. Devuelve true si se confirma. */
export function preguntar({
  titulo = '¿Seguimos?',
  texto = '',
  confirmar = 'Sí, adelante',
  cancelar = 'Déjalo',
  peligro = false,
} = {}) {
  return abrir({ tipo: 'confirmar', titulo, texto, confirmar, cancelar, peligro })
}

/** Pide un texto. Devuelve la cadena, o null si se cancela. */
export function pedirTexto({
  titulo = 'Escribe',
  texto = '',
  etiqueta = '',
  valor = '',
  confirmar = 'Vale',
  cancelar = 'Déjalo',
} = {}) {
  return abrir({ tipo: 'texto', titulo, texto, etiqueta, valor, confirmar, cancelar })
}

/** Solo informa. Se cierra y punto. */
export function avisar({ titulo = 'Un momento', texto = '', confirmar = 'Entendido' } = {}) {
  return abrir({ tipo: 'aviso', titulo, texto, confirmar })
}

export function aceptar(valor) {
  cerrar(valor)
}

export function descartar() {
  cerrar(abierto.value?.tipo === 'texto' ? null : false)
}
