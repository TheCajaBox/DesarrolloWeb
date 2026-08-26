// Pruebas del almacén del taller, contra una IndexedDB de verdad (simulada).
//
// La regla que verifican, y es la más importante del taller: **el proyecto es
// de quien lo escribe**. Un mundo nuevo puede necesitar que exista un fichero,
// pero jamás puede pisar lo que ya hay dentro.
//
// Antes esto no era así: cambiar de mundo reemplazaba el proyecto entero, y eso
// convertía el taller en ejercicios sueltos en vez de en una web propia que va
// creciendo. Estas pruebas están para que no vuelva a pasar.

import 'fake-indexeddb/auto'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usarTaller } from '../src/almacen/taller.js'
import { listar } from '../src/motor/sfv.js'
import mundo01 from '../src/contenido/mundos/mundo-01.js'
import mundo13 from '../src/contenido/mundos/mundo-13.js'

const contenidoDe = async (proyecto, ruta) => {
  const ficheros = await listar(proyecto)
  return ficheros.find((f) => f.ruta === ruta)?.contenido ?? null
}

describe('almacen del taller', () => {
  let taller

  beforeEach(() => {
    setActivePinia(createPinia())
    taller = usarTaller()
    // Cada prueba con su propio proyecto: así no se pisan entre ellas.
    taller.proyecto = `p${Math.floor(Math.random() * 1e9)}`
  })

  it('siembra los ficheros que faltan y abre el index', async () => {
    const creados = await taller.sembrar(mundo01.ficheros)

    expect(creados).toContain('index.html')
    expect(taller.rutaActiva).toBe('index.html')
    expect(taller.borrador).toContain('Cambia esto')
  })

  // ---- La regla ----

  it('NO sobrescribe un fichero que ya existe', async () => {
    await taller.sembrar(mundo01.ficheros)

    taller.escribir('<h1>esto lo he escrito yo</h1>')
    await taller.guardarYa()

    const creados = await taller.sembrar(mundo01.ficheros)

    expect(creados, 'ha vuelto a crear un fichero que ya estaba').toEqual([])
    expect(await contenidoDe(taller.proyecto, 'index.html')).toBe('<h1>esto lo he escrito yo</h1>')
  })

  it('al cambiar de mundo, tu trabajo sigue ahí', async () => {
    await taller.sembrar(mundo01.ficheros)
    taller.escribir('<h1>mi catálogo de sombreros</h1>')
    await taller.guardarYa()

    // Cambiar al mundo 13 solo añade lo suyo.
    const creados = await taller.sembrar(mundo13.ficheros)

    expect(await contenidoDe(taller.proyecto, 'index.html')).toBe(
      '<h1>mi catálogo de sombreros</h1>',
    )
    expect(creados).toContain('api.js')
    expect(creados).not.toContain('index.html')
  })

  it('lo que creaste en un mundo anterior no desaparece', async () => {
    await taller.sembrar(mundo13.ficheros)
    await taller.crear('mis-notas.txt', 'cosas mías')

    await taller.sembrar(mundo01.ficheros)

    const rutas = taller.ficheros.map((f) => f.ruta)
    expect(rutas).toContain('mis-notas.txt')
    expect(rutas).toContain('api.js')
  })

  it('cambiar de mundo sin ficheros nuevos no mueve el editor', async () => {
    await taller.sembrar(mundo01.ficheros)
    await taller.crear('otro.html', '<p>hola</p>')
    await taller.abrir('otro.html')

    await taller.sembrar(mundo01.ficheros)

    expect(taller.rutaActiva, 'el editor ha saltado a otro fichero').toBe('otro.html')
  })

  // ---- Lo destructivo, que es explícito ----

  it('restaurar devuelve los ficheros del mundo a su estado inicial', async () => {
    await taller.sembrar(mundo01.ficheros)
    taller.escribir('<h1>destrozado</h1>')
    await taller.guardarYa()

    await taller.restaurar(mundo01.ficheros)

    expect(await contenidoDe(taller.proyecto, 'index.html')).toContain('Cambia esto')
  })

  it('restaurar NO borra lo que hayas creado tú aparte', async () => {
    await taller.sembrar(mundo01.ficheros)
    await taller.crear('mis-notas.txt', 'cosas mías')

    await taller.restaurar(mundo01.ficheros)

    expect(taller.ficheros.map((f) => f.ruta)).toContain('mis-notas.txt')
    expect(await contenidoDe(taller.proyecto, 'mis-notas.txt')).toBe('cosas mías')
  })

  // Este era el fallo original: `abrir()` empieza guardando lo pendiente, así
  // que el borrador viejo se escribía encima de lo recién restaurado.
  it('al restaurar, el borrador viejo no vuelve a escribirse encima', async () => {
    await taller.sembrar(mundo01.ficheros)
    taller.escribir('<h1>lo viejo</h1>')

    await taller.restaurar(mundo01.ficheros)

    expect(await contenidoDe(taller.proyecto, 'index.html')).not.toContain('lo viejo')
    expect(await contenidoDe(taller.proyecto, 'index.html')).toContain('Cambia esto')
  })

  // ---- Lo demás ----

  it('escribir y guardar deja el contenido en disco', async () => {
    await taller.sembrar(mundo01.ficheros)

    taller.escribir('<h1>mío</h1>')
    await taller.guardarYa()

    expect(await contenidoDe(taller.proyecto, 'index.html')).toBe('<h1>mío</h1>')
  })

  it('cambiar de fichero guarda lo que había sin perderlo', async () => {
    await taller.sembrar(mundo13.ficheros)
    await taller.abrir('index.html')

    taller.escribir('<h1>cambiado a mano</h1>')
    await taller.abrir('app.js')

    expect(await contenidoDe(taller.proyecto, 'index.html')).toBe('<h1>cambiado a mano</h1>')
    expect(taller.rutaActiva).toBe('app.js')
  })

  it('descartarBorrador deja el editor sin nada pendiente', async () => {
    await taller.sembrar(mundo01.ficheros)
    taller.escribir('esto se va a tirar')

    taller.descartarBorrador()

    expect(taller.rutaActiva).toBeNull()
    expect(taller.borrador).toBe('')
    expect(taller.guardando).toBe(false)
    expect(await contenidoDe(taller.proyecto, 'index.html')).toContain('Cambia esto')
  })

  it('crear, renombrar y borrar', async () => {
    await taller.sembrar(mundo01.ficheros)

    await taller.crear('notas.txt', 'apuntes')
    expect(taller.ficheros.map((f) => f.ruta)).toContain('notas.txt')

    await taller.renombrar('notas.txt', 'docs/notas.txt')
    expect(await contenidoDe(taller.proyecto, 'docs/notas.txt')).toBe('apuntes')

    await taller.borrar('docs/notas.txt')
    expect(taller.ficheros.map((f) => f.ruta)).not.toContain('docs/notas.txt')
  })

  it('crear un fichero con nombre invalido deja el error a la vista', async () => {
    await taller.sembrar(mundo01.ficheros)

    await expect(taller.crear('../fuera.txt')).rejects.toThrow()
    expect(taller.error).toBeTruthy()
  })

  it('la revision sube con cada cambio, para que la vista previa recargue', async () => {
    await taller.sembrar(mundo01.ficheros)
    const antes = taller.revision

    taller.escribir('otra cosa')
    await taller.guardarYa()

    expect(taller.revision).toBeGreaterThan(antes)
  })
})
