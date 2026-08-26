/* Service Worker de la vista previa.
 *
 * Sirve en /vista/<proyecto>/... los ficheros que el alumno esta escribiendo,
 * leyendolos de IndexedDB. Eso hace que su proyecto se comporte como una web
 * de verdad: las rutas relativas entre ficheros funcionan, la vista previa
 * tiene URL propia y se puede abrir en otra pestana.
 *
 * Un iframe con srcdoc no sirve aqui: no resuelve <link href="estilos.css">
 * porque no hay ninguna nocion de "directorio" contra la que resolverlo.
 *
 * OJO: este fichero NO pasa por Vite (vive en la carpeta de estaticos y se
 * sirve tal cual), asi que no puede importar nada de src/. La lectura de
 * IndexedDB y la tabla de tipos MIME estan duplicadas a proposito respecto a
 * src/motor/. Hay una prueba que verifica que las dos copias no divergen.
 */

const NOMBRE_BD = 'sombrero-taller'
const VERSION_BD = 1
const ALMACEN_FICHEROS = 'ficheros'
const PREFIJO = '/vista/'
const ESPERA_API_MS = 10000
const ULTIMA_CLAVE = '￿'

const TIPOS = {
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  ico: 'image/x-icon',
  txt: 'text/plain; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  woff2: 'font/woff2',
}

function tipoDe(ruta) {
  const ext = ruta.includes('.') ? ruta.split('.').pop().toLowerCase() : ''
  return TIPOS[ext] || 'application/octet-stream'
}

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()))

function abrirBd() {
  return new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(NOMBRE_BD, VERSION_BD)
    peticion.onsuccess = () => resolver(peticion.result)
    peticion.onerror = () => rechazar(peticion.error)
    // El Service Worker nunca deberia crear el esquema: de eso se encarga el
    // editor. Si llega aqui primero, lo crea vacio para no romper nada.
    peticion.onupgradeneeded = () => {
      const bd = peticion.result
      if (!bd.objectStoreNames.contains(ALMACEN_FICHEROS)) {
        bd.createObjectStore(ALMACEN_FICHEROS, { keyPath: ['proyecto', 'ruta'] })
      }
    }
  })
}

async function leerFichero(proyecto, ruta) {
  const bd = await abrirBd()
  return new Promise((resolver, rechazar) => {
    const peticion = bd
      .transaction(ALMACEN_FICHEROS, 'readonly')
      .objectStore(ALMACEN_FICHEROS)
      .get([proyecto, ruta])
    peticion.onsuccess = () => resolver(peticion.result || null)
    peticion.onerror = () => rechazar(peticion.error)
  })
}

async function listarRutas(proyecto) {
  const bd = await abrirBd()
  return new Promise((resolver, rechazar) => {
    const rango = IDBKeyRange.bound([proyecto], [proyecto, ULTIMA_CLAVE])
    const peticion = bd
      .transaction(ALMACEN_FICHEROS, 'readonly')
      .objectStore(ALMACEN_FICHEROS)
      .getAllKeys(rango)
    peticion.onsuccess = () => resolver((peticion.result || []).map((clave) => clave[1]))
    peticion.onerror = () => rechazar(peticion.error)
  })
}

function sinCache(cabeceras) {
  // La vista previa cambia con cada pulsacion; cachear aqui solo da disgustos.
  cabeceras.set('Cache-Control', 'no-store, must-revalidate')
  return cabeceras
}

function respuesta(contenido, tipo, estado = 200) {
  return new Response(contenido, {
    status: estado,
    headers: sinCache(new Headers({ 'Content-Type': tipo })),
  })
}

function escapar(texto) {
  return String(texto).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

function paginaDeError(titulo, cuerpo) {
  return [
    '<!doctype html><html lang="es"><meta charset="utf-8">',
    '<title>' + escapar(titulo) + '</title>',
    '<style>',
    '  body { font: 16px/1.6 system-ui, sans-serif; background: #1b1a17; color: #e8e2d4;',
    '         margin: 0; display: grid; place-items: center; min-height: 100vh; }',
    '  main { max-width: 32rem; padding: 2rem; }',
    '  h1 { font-size: 1.3rem; margin: 0 0 .5rem; color: #d8b26a; }',
    '  code { background: #2a2823; padding: .1em .4em; border-radius: 3px; }',
    '  p.dice { border-left: 3px solid #d8b26a; padding-left: 1rem; font-style: italic; opacity: .85; }',
    '</style>',
    '<main><h1>' + escapar(titulo) + '</h1>' + cuerpo + '</main></html>',
  ].join('\n')
}

function json(datos, estado) {
  return respuesta(JSON.stringify(datos), 'application/json; charset=utf-8', estado)
}

// Las peticiones a /api/ las atiende el codigo que el alumno ha escrito, y ese
// codigo se ejecuta en el editor (que es quien tiene SQLite cargado). El
// Service Worker no puede resolverlas solo: se las pasa al editor y espera.
async function delegarEnEditor(proyecto, peticion) {
  const clientes = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  // El propio previsualizador tambien es un cliente; hay que descartarlo.
  const editor = clientes.find((cliente) => !new URL(cliente.url).pathname.startsWith(PREFIJO))

  if (!editor) {
    return json(
      {
        error: 'editor_cerrado',
        mensaje: 'Tu backend corre dentro del taller. Si cierras esa pestana, no queda nadie que atienda esta llamada.',
      },
      503,
    )
  }

  const cuerpo = ['GET', 'HEAD'].includes(peticion.method) ? null : await peticion.text()

  return new Promise((resolver) => {
    const canal = new MessageChannel()

    const reloj = setTimeout(() => {
      canal.port1.onmessage = null
      resolver(
        json(
          {
            error: 'sin_respuesta',
            mensaje: 'Tu handler ha tardado mas de 10 segundos. Lo mas probable es que se haya quedado en un bucle.',
          },
          504,
        ),
      )
    }, ESPERA_API_MS)

    canal.port1.onmessage = (evento) => {
      clearTimeout(reloj)
      const r = evento.data || {}
      resolver(
        new Response(r.cuerpo == null ? '' : r.cuerpo, {
          status: r.estado || 200,
          headers: sinCache(new Headers(r.cabeceras || { 'Content-Type': 'application/json; charset=utf-8' })),
        }),
      )
    }

    editor.postMessage(
      {
        tipo: 'peticion-api',
        proyecto,
        metodo: peticion.method,
        url: peticion.url,
        cabeceras: Object.fromEntries(peticion.headers),
        cuerpo,
      },
      [canal.port2],
    )
  })
}

async function atender(peticion) {
  const url = new URL(peticion.url)
  const resto = decodeURIComponent(url.pathname.slice(PREFIJO.length))
  const barra = resto.indexOf('/')
  const proyecto = barra === -1 ? resto : resto.slice(0, barra)
  let ruta = barra === -1 ? '' : resto.slice(barra + 1)

  if (!proyecto) {
    return respuesta(
      paginaDeError('Falta el proyecto', '<p>La direccion tiene que ser <code>/vista/&lt;proyecto&gt;/</code>.</p>'),
      'text/html; charset=utf-8',
      400,
    )
  }

  if (ruta.startsWith('api/')) return delegarEnEditor(proyecto, peticion)

  // Un directorio (o la raiz) sirve su index.html, como cualquier servidor.
  if (ruta === '' || ruta.endsWith('/')) ruta += 'index.html'

  let fichero = await leerFichero(proyecto, ruta)

  // Cortesia habitual: /acerca prueba tambien /acerca.html y /acerca/index.html
  if (!fichero && !ruta.includes('.')) {
    fichero = (await leerFichero(proyecto, ruta + '.html')) || (await leerFichero(proyecto, ruta + '/index.html'))
  }

  if (!fichero) {
    const rutas = await listarRutas(proyecto)
    const lista = rutas.length
      ? '<p>En este proyecto tienes:</p><ul>' + rutas.map((r) => '<li><code>' + escapar(r) + '</code></li>').join('') + '</ul>'
      : '<p>Este proyecto no tiene ningun fichero todavia.</p>'

    return respuesta(
      paginaDeError(
        'Aqui no hay nada',
        '<p>No existe <code>' + escapar(ruta) + '</code>.</p>' +
          lista +
          '<p class="dice">&mdash; Wayne: he mirado en los bolsillos y nada. Y mira que yo encuentro cosas.</p>',
      ),
      'text/html; charset=utf-8',
      404,
    )
  }

  const contenido = fichero.binario
    ? Uint8Array.from(atob(fichero.contenido), (caracter) => caracter.charCodeAt(0))
    : fichero.contenido

  return respuesta(contenido, tipoDe(ruta))
}

self.addEventListener('fetch', (evento) => {
  const url = new URL(evento.request.url)
  // Todo lo que no sea la vista previa sigue su camino sin que lo toquemos.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(PREFIJO)) return

  evento.respondWith(
    atender(evento.request).catch((error) =>
      respuesta(
        paginaDeError('Se ha roto la vista previa', '<p><code>' + escapar(error && error.message) + '</code></p>'),
        'text/html; charset=utf-8',
        500,
      ),
    ),
  )
})
