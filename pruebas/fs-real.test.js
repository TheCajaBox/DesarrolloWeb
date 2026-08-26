// Pruebas del adaptador de ficheros reales, contra un puente de mentira en
// memoria. Verifican que se comporta igual que el sistema virtual (mismas
// firmas, mismas garantías), sin necesitar Electron ni disco.

import { beforeEach, describe, expect, it } from 'vitest'
import {
  arbol,
  borrar,
  crear,
  existe,
  guardar,
  leer,
  listar,
  reemplazar,
  renombrar,
  restaurar,
  sembrar,
  usarPuente,
} from '../src/motor/fs-real.js'

// Un puente en memoria con la misma superficie que window.taller.
function puenteFalso(inicial = {}) {
  const ficheros = new Map(Object.entries(inicial))
  return {
    ficheros,
    listar: async () => [...ficheros.keys()],
    leer: async (ruta) => (ficheros.has(ruta) ? ficheros.get(ruta) : null),
    escribir: async (ruta, contenido) => {
      ficheros.set(ruta, String(contenido))
      return true
    },
    borrar: async (ruta) => {
      ficheros.delete(ruta)
      return true
    },
    renombrar: async (desde, hasta) => {
      ficheros.set(hasta, ficheros.get(desde))
      ficheros.delete(desde)
      return true
    },
  }
}

let puente

beforeEach(() => {
  puente = puenteFalso()
  usarPuente(puente)
})

describe('lectura y escritura básicas', () => {
  it('guarda y lee', async () => {
    await guardar(null, 'src/App.vue', '<template></template>')
    expect(await leer(null, 'src/App.vue')).toBe('<template></template>')
  })

  it('existe distingue lo que hay de lo que no', async () => {
    await guardar(null, 'a.txt', 'x')
    expect(await existe(null, 'a.txt')).toBe(true)
    expect(await existe(null, 'b.txt')).toBe(false)
  })

  it('normaliza la ruta al escribir y al leer', async () => {
    await guardar(null, '/src//App.vue', 'x')
    // Se guarda normalizada, así que se encuentra sin la barra inicial.
    expect(await leer(null, 'src/App.vue')).toBe('x')
  })

  it('listar devuelve ruta y contenido, ordenado', async () => {
    await guardar(null, 'b.txt', 'B')
    await guardar(null, 'a.txt', 'A')
    const lista = await listar()
    expect(lista.map((f) => f.ruta)).toEqual(['a.txt', 'b.txt'])
    expect(lista[0].contenido).toBe('A')
  })
})

describe('crear, borrar, renombrar', () => {
  it('crear falla si ya existe', async () => {
    await crear(null, 'a.txt', '1')
    await expect(crear(null, 'a.txt', '2')).rejects.toThrow(/existe/i)
    expect(await leer(null, 'a.txt')).toBe('1')
  })

  it('borrar quita el fichero', async () => {
    await guardar(null, 'a.txt', 'x')
    await borrar(null, 'a.txt')
    expect(await existe(null, 'a.txt')).toBe(false)
  })

  it('renombrar mueve el contenido', async () => {
    await guardar(null, 'viejo.txt', 'x')
    await renombrar(null, 'viejo.txt', 'nuevo.txt')
    expect(await existe(null, 'viejo.txt')).toBe(false)
    expect(await leer(null, 'nuevo.txt')).toBe('x')
  })

  it('renombrar falla si el origen no existe o el destino ya existe', async () => {
    await guardar(null, 'a.txt', 'A')
    await guardar(null, 'b.txt', 'B')
    await expect(renombrar(null, 'noexiste.txt', 'c.txt')).rejects.toThrow(/no existe/i)
    await expect(renombrar(null, 'a.txt', 'b.txt')).rejects.toThrow(/existe/i)
  })

  it('no valida rutas que se salen del proyecto', async () => {
    await expect(guardar(null, '../fuera.txt', 'x')).rejects.toThrow()
  })
})

describe('sembrar (crea solo lo que falta)', () => {
  it('crea los que no están y respeta los que sí', async () => {
    await guardar(null, 'src/App.vue', 'MÍO')
    const creados = await sembrar(null, {
      'src/App.vue': 'PLANTILLA',
      'src/main.js': 'arranque',
    })

    // App.vue existía: no se toca. main.js se crea.
    expect(creados).toEqual(['src/main.js'])
    expect(await leer(null, 'src/App.vue')).toBe('MÍO')
    expect(await leer(null, 'src/main.js')).toBe('arranque')
  })
})

describe('restaurar (devuelve ficheros concretos a su estado)', () => {
  it('sobreescribe los que se le pasan, deja el resto', async () => {
    await guardar(null, 'src/App.vue', 'destrozado')
    await guardar(null, 'mis-notas.txt', 'cosas mías')

    await restaurar(null, { 'src/App.vue': 'ORIGINAL' })

    expect(await leer(null, 'src/App.vue')).toBe('ORIGINAL')
    expect(await leer(null, 'mis-notas.txt')).toBe('cosas mías')
  })
})

describe('reemplazar (deja exactamente estos ficheros)', () => {
  it('borra lo que no está en el conjunto nuevo', async () => {
    await guardar(null, 'viejo.txt', 'x')
    await guardar(null, 'src/App.vue', 'a')

    await reemplazar(null, { 'src/App.vue': 'b', 'nuevo.txt': 'y' })

    const rutas = (await listar()).map((f) => f.ruta)
    expect(rutas).not.toContain('viejo.txt')
    expect(rutas).toContain('src/App.vue')
    expect(rutas).toContain('nuevo.txt')
    expect(await leer(null, 'src/App.vue')).toBe('b')
  })
})

describe('árbol', () => {
  it('construye el árbol de carpetas a partir de los ficheros', async () => {
    await guardar(null, 'src/App.vue', '')
    await guardar(null, 'src/components/Ficha.vue', '')
    await guardar(null, 'index.html', '')

    const raiz = await arbol()
    const src = raiz.hijos.find((h) => h.nombre === 'src')
    expect(src.tipo).toBe('carpeta')
    expect(src.hijos.map((h) => h.nombre)).toContain('components')
  })
})

describe('sin puente', () => {
  it('avisa claro si se usa fuera de la app de escritorio', async () => {
    usarPuente(null)
    await expect(guardar(null, 'a.txt', 'x')).rejects.toThrow(/escritorio/i)
  })
})
