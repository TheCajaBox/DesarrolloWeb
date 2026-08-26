// Puente entre la pagina del taller y el Service Worker que sirve la vista
// previa.
//
// Hace dos cosas: registrar el Service Worker, y atender las peticiones a
// /api/ que el Service Worker no puede resolver por su cuenta porque el
// backend del alumno (y su SQLite) viven aqui, en la pagina.

const RUTA_SERVICIO = '/sw-vista-previa.js'

let registro = null
let atenderApi = null

export function hayServiceWorker() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

// Sin Service Worker no hay vista previa multifichero. Pasa en navegacion
// privada de algunos navegadores y siempre que la pagina no sea segura.
export function motivoSinServicio() {
  if (!hayServiceWorker()) return 'Este navegador no admite Service Workers.'
  if (!self.isSecureContext) return 'La vista previa necesita HTTPS (o localhost).'
  return null
}

export async function registrarServicio() {
  const motivo = motivoSinServicio()
  if (motivo) throw new Error(motivo)
  if (registro) return registro

  registro = await navigator.serviceWorker.register(RUTA_SERVICIO, { scope: '/' })
  // Que empiece a mandar ya, sin esperar a recargar la pagina.
  await navigator.serviceWorker.ready
  escuchar()
  return registro
}

export function urlDeVista(proyecto, ruta = '') {
  const limpia = String(ruta).replace(/^\/+/, '')
  return `/vista/${encodeURIComponent(proyecto)}/${limpia}`
}

// El shim que ejecuta el codigo del alumno se registra aqui. Recibe un objeto
// con la peticion y devuelve { estado, cabeceras, cuerpo }.
export function alRecibirPeticionApi(manejador) {
  atenderApi = manejador
}

let escuchando = false

function escuchar() {
  if (escuchando || !hayServiceWorker()) return
  escuchando = true

  navigator.serviceWorker.addEventListener('message', async (evento) => {
    const datos = evento.data
    if (!datos || datos.tipo !== 'peticion-api') return

    const puerto = evento.ports && evento.ports[0]
    if (!puerto) return

    if (!atenderApi) {
      puerto.postMessage({
        estado: 501,
        cabeceras: { 'Content-Type': 'application/json; charset=utf-8' },
        cuerpo: JSON.stringify({
          error: 'sin_backend',
          mensaje: 'Todavia no has escrito ningun backend. Eso llega en el Mundo 7.',
        }),
      })
      return
    }

    try {
      const respuesta = await atenderApi(datos)
      puerto.postMessage({
        estado: respuesta.estado ?? 200,
        cabeceras: respuesta.cabeceras ?? { 'Content-Type': 'application/json; charset=utf-8' },
        cuerpo: respuesta.cuerpo ?? '',
      })
    } catch (error) {
      // Que el alumno vea su propio error, no un 500 mudo.
      puerto.postMessage({
        estado: 500,
        cabeceras: { 'Content-Type': 'application/json; charset=utf-8' },
        cuerpo: JSON.stringify({
          error: 'peto_tu_codigo',
          mensaje: String(error && error.message ? error.message : error),
        }),
      })
    }
  })
}

// Fuerza a la vista previa a recargarse. La llama el editor tras guardar.
export function refrescar(marco) {
  if (!marco) return
  // Reasignar el src es mas fiable que contentWindow.location.reload(), que
  // en algunos navegadores choca con las politicas de origen del iframe.
  const url = new URL(marco.src, self.location.origin)
  url.searchParams.set('recarga', String(Date.now()))
  marco.src = url.pathname + url.search
}
