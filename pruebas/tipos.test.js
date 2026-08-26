import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TIPOS, tipoDe } from '../servidor/tipos.js'

// El Service Worker no puede importar nada: se sirve tal cual, sin pasar por
// el empaquetador. Por eso lleva su propia copia de esta tabla. Esta prueba
// existe para que las dos copias no se separen sin que nadie se entere.
// Desde la raiz del proyecto, no desde import.meta.url: con el entorno de
// pruebas en happy-dom, import.meta.url deja de ser una URL de fichero.
const RUTA_SW = resolve(process.cwd(), 'taller-estatico/sw-vista-previa.js')

function tiposDelServiceWorker() {
  const fuente = readFileSync(RUTA_SW, 'utf8')
  const bloque = fuente.match(/const TIPOS = \{([\s\S]*?)\n\}/)
  if (!bloque) throw new Error('No se encuentra la tabla TIPOS en el Service Worker')

  const tabla = {}
  for (const linea of bloque[1].split('\n')) {
    const par = linea.match(/^\s*([a-z0-9]+):\s*'([^']+)',?\s*$/)
    if (par) tabla[par[1]] = par[2]
  }
  return tabla
}

describe('tabla de tipos MIME', () => {
  it('el Service Worker tiene exactamente los mismos tipos que el servidor', () => {
    const delSw = tiposDelServiceWorker()
    expect(Object.keys(delSw).length).toBeGreaterThan(10)
    expect(delSw).toEqual(TIPOS)
  })
})

describe('tipoDe', () => {
  it('acierta con las extensiones conocidas', () => {
    expect(tipoDe('index.html')).toBe('text/html; charset=utf-8')
    expect(tipoDe('css/estilos.css')).toBe('text/css; charset=utf-8')
    expect(tipoDe('app.js')).toBe('text/javascript; charset=utf-8')
  })

  it('no le importan las mayusculas', () => {
    expect(tipoDe('FOTO.PNG')).toBe('image/png')
  })

  it('ante la duda, no dice que es texto', () => {
    // Importa: mandar HTML como text/plain rompe la pagina, pero mandar algo
    // desconocido como HTML es un agujero de seguridad.
    expect(tipoDe('cosa.rara')).toBe('application/octet-stream')
    expect(tipoDe('LICENCIA')).toBe('application/octet-stream')
  })
})
