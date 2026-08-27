// Las pestañas de ficheros.
//
// Parecen decoración, pero tocan lo más delicado del taller: cambiar de
// fichero. Ahí ya vivió un fallo de pérdida de datos (el contenido de uno
// escrito encima de otro), así que aquí se comprueba que cerrar pestañas no
// pierde nada de lo escrito ni deja el editor apuntando a un sitio que no es.

import 'fake-indexeddb/auto'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usarTaller } from '../src/almacen/taller.js'
import { listar } from '../src/motor/sfv.js'

const contenidoDe = async (proyecto, ruta) => {
  const ficheros = await listar(proyecto)
  return ficheros.find((f) => f.ruta === ruta)?.contenido ?? null
}

describe('las pestañas de ficheros', () => {
  let taller

  beforeEach(async () => {
    setActivePinia(createPinia())
    taller = usarTaller()
    taller.proyecto = `p${Math.floor(Math.random() * 1e9)}`

    await taller.sembrar({
      'index.html': '<!doctype html><html></html>',
      'src/App.vue': '<template><p>uno</p></template>',
      'src/otro.js': 'export const dos = 2',
    })
  })

  it('abrir un fichero le pone pestaña', async () => {
    await taller.abrir('src/App.vue')
    expect(taller.abiertos).toContain('src/App.vue')
  })

  it('abrir el mismo dos veces no lo duplica', async () => {
    await taller.abrir('src/App.vue')
    await taller.abrir('src/otro.js')
    await taller.abrir('src/App.vue')

    expect(taller.abiertos.filter((r) => r === 'src/App.vue')).toHaveLength(1)
  })

  it('las pestañas guardan el orden en que se abrieron', async () => {
    await taller.abrir('src/otro.js')
    await taller.abrir('src/App.vue')

    // index.html lo abre sembrar(), así que va primero.
    expect(taller.abiertos).toEqual(['index.html', 'src/otro.js', 'src/App.vue'])
  })

  it('cerrar una que no es la activa no cambia de fichero', async () => {
    await taller.abrir('src/otro.js')
    await taller.abrir('src/App.vue')

    await taller.cerrarPestana('src/otro.js')

    expect(taller.rutaActiva).toBe('src/App.vue')
    expect(taller.abiertos).not.toContain('src/otro.js')
  })

  it('al cerrar la activa se pasa a la de la derecha', async () => {
    await taller.abrir('src/App.vue')
    await taller.abrir('src/otro.js')
    // Vuelta a la del medio, que es la que se va a cerrar.
    await taller.abrir('src/App.vue')

    await taller.cerrarPestana('src/App.vue')

    expect(taller.rutaActiva).toBe('src/otro.js')
  })

  it('y si era la última de la fila, a la de la izquierda', async () => {
    await taller.abrir('src/App.vue')
    await taller.abrir('src/otro.js')

    await taller.cerrarPestana('src/otro.js')

    expect(taller.rutaActiva).toBe('src/App.vue')
  })

  it('cerrar la última deja el editor sin fichero, no con uno a medias', async () => {
    for (const ruta of [...taller.abiertos]) await taller.cerrarPestana(ruta)

    expect(taller.abiertos).toEqual([])
    expect(taller.rutaActiva).toBeNull()
    expect(taller.borrador).toBe('')
  })

  // ---- Lo que de verdad importa ----

  it('cerrar una pestaña NO borra el fichero', async () => {
    await taller.abrir('src/App.vue')
    await taller.cerrarPestana('src/App.vue')

    expect(await contenidoDe(taller.proyecto, 'src/App.vue')).not.toBeNull()
    expect(taller.ficheros.some((f) => f.ruta === 'src/App.vue')).toBe(true)
  })

  it('cerrar una pestaña guarda antes lo que estuviera sin guardar', async () => {
    await taller.abrir('src/App.vue')
    taller.escribir('<template><p>lo mio</p></template>')

    await taller.cerrarPestana('src/App.vue')

    expect(await contenidoDe(taller.proyecto, 'src/App.vue')).toContain('lo mio')
  })

  it('cerrar la última también guarda antes de vaciar el editor', async () => {
    // Este es el que puede perder trabajo: se suelta el borrador y, si no se
    // ha guardado justo antes, lo último escrito se va con él.
    await taller.abrir('src/otro.js')
    await taller.cerrarPestana('index.html')
    await taller.cerrarPestana('src/App.vue')

    taller.escribir('export const dos = 22')
    await taller.cerrarPestana('src/otro.js')

    expect(taller.rutaActiva).toBeNull()
    expect(await contenidoDe(taller.proyecto, 'src/otro.js')).toContain('22')
  })

  it('borrar un fichero le quita la pestaña', async () => {
    await taller.abrir('src/otro.js')
    await taller.borrar('src/otro.js')

    expect(taller.abiertos).not.toContain('src/otro.js')
  })

  it('renombrar mantiene la pestaña, con el nombre nuevo y en su sitio', async () => {
    await taller.abrir('src/otro.js')
    const donde = taller.abiertos.indexOf('src/otro.js')

    await taller.renombrar('src/otro.js', 'src/renombrado.js')

    expect(taller.abiertos).not.toContain('src/otro.js')
    expect(taller.abiertos.indexOf('src/renombrado.js')).toBe(donde)
    expect(taller.rutaActiva).toBe('src/renombrado.js')
  })

  it('cerrar algo que no está abierto no hace nada', async () => {
    await taller.abrir('src/App.vue')
    const antes = [...taller.abiertos]

    await taller.cerrarPestana('src/no-existe.js')

    expect(taller.abiertos).toEqual(antes)
    expect(taller.rutaActiva).toBe('src/App.vue')
  })
})
