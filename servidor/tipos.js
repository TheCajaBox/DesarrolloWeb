// Tipos MIME por extension.
//
// Existe una tercera copia de esta tabla en taller-estatico/sw-vista-previa.js,
// que no puede importar nada porque se sirve sin pasar por el empaquetador.
// La prueba de pruebas/tipos.test.js verifica que no se separen.

export const TIPOS = {
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

export function tipoDe(ruta) {
  const nombre = String(ruta).split('/').pop() || ''
  const extension = nombre.includes('.') ? nombre.split('.').pop().toLowerCase() : ''
  return TIPOS[extension] || 'application/octet-stream'
}
