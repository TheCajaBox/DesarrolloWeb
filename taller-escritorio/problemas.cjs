// Los errores de compilación del proyecto, para el panel de problemas.
//
// Vite ya los tiene: se los manda a la página por el canal de recarga en
// caliente para pintar ese cartel rojo que tapa la pantalla. El cartel está
// bien, pero se va solo al siguiente cambio y no deja rastro.
//
// Así que se escucha ese mismo canal —envolviendo el `send` del servidor, que
// es nuestro— y se copia lo que pase por él. Nada de leerlo de la página, ni
// de compilar otra vez por nuestra cuenta para ver qué falla: esto ES lo que
// Vite dice, no una segunda opinión que podría no coincidir con lo que ella ve.
//
// Vive fuera de main.cjs y sin tocar electron para poder probarlo con un Vite
// de verdad, que es la única forma de saber si esto funciona.

/**
 * La ruta que da Vite, en corto y relativa a la carpeta del proyecto.
 *
 * Vite mezcla separadores según de dónde venga la ruta, así que se normalizan
 * los dos lados a barra normal antes de comparar. Sin expresiones regulares:
 * una barra invertida dentro de una clase de caracteres es justo el sitio
 * donde se escapa mal y nadie se entera.
 */
function relativaA(carpeta, ruta) {
  const aBarras = (texto) => String(texto || '').split('\\').join('/')

  const normal = aBarras(ruta)
  const base = aBarras(carpeta)
  if (!base || !normal.startsWith(base)) return normal

  const corta = normal.slice(base.length)
  return corta.startsWith('/') ? corta.slice(1) : corta
}

/** Lo justo de un error de Vite, sin objetos que no viajan por el IPC. */
function limpiarError(err, carpeta) {
  if (!err) return null

  const donde = err.id || (err.loc && err.loc.file) || ''

  return {
    mensaje: String(err.message || 'Error al compilar'),
    fichero: relativaA(carpeta, donde),
    linea: (err.loc && err.loc.line) ?? null,
    columna: (err.loc && err.loc.column) ?? null,
    trozo: err.frame ? String(err.frame) : null,
  }
}

/**
 * Se engancha al canal de recarga de un servidor de Vite y avisa de lo que no
 * compila.
 *
 * `alCambiar` recibe el problema, o `null` cuando vuelve a compilar. Devuelve
 * una función para soltar el enganche y dejar el servidor como estaba.
 */
function escucharProblemas(servidor, { alCambiar, carpeta = '' } = {}) {
  const canal = servidor && (servidor.hot || servidor.ws)
  if (!canal || typeof canal.send !== 'function') return () => {}

  const enviarDeVerdad = canal.send.bind(canal)
  let ultimo = null

  const avisar = (problema) => {
    ultimo = problema
    if (typeof alCambiar === 'function') alCambiar(problema)
  }

  canal.send = (...args) => {
    // Pase lo que pase aquí, el envío sigue: llevarse por delante la recarga en
    // caliente por culpa de un panel informativo sería un pésimo negocio.
    try {
      const aviso = args[0]

      if (aviso && aviso.type === 'error') {
        avisar(limpiarError(aviso.err, carpeta))
      } else if (aviso && (aviso.type === 'update' || aviso.type === 'full-reload')) {
        // Un cambio que Vite acepta significa que lo de antes ya compila.
        if (ultimo) avisar(null)
      }
    } catch {
      /* nunca romper el HMR */
    }

    return enviarDeVerdad(...args)
  }

  return () => {
    canal.send = enviarDeVerdad
  }
}

module.exports = { escucharProblemas, limpiarError, relativaA }
