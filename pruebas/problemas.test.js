// El panel de problemas, contra un Vite de verdad.
//
// Aquí no vale comprobar que las funciones se llaman: lo que puede fallar es
// que Vite no mande los errores por donde creo, o que cambie el nombre del
// canal en una versión. Así que se levanta un servidor de Vite real sobre un
// proyecto con un fichero roto a propósito, se le pide ese fichero, y se mira
// si el enganche lo ha visto.
//
// Si Vite cambia de sitio esa información, esta prueba se pone roja y el panel
// no llega a la app enseñando «nada roto» con la vista previa en llamas.

import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { escucharProblemas, limpiarError, relativaA } from '../taller-escritorio/problemas.cjs'

const ROTO = `<template>
  <p>{{ sin cerrar </p>
</template>
`

const BUENO = `<template>
  <p>hola</p>
</template>
`

describe('acortar la ruta del error', () => {
  it('la deja relativa al proyecto', () => {
    expect(relativaA('/casa/proyecto', '/casa/proyecto/src/App.vue')).toBe('src/App.vue')
  })

  it('se apaña con las barras de Windows', () => {
    expect(relativaA('C:\\datos\\proyecto', 'C:\\datos\\proyecto\\src\\App.vue')).toBe('src/App.vue')
  })

  it('y con las dos mezcladas, que es lo que hace Vite', () => {
    expect(relativaA('C:\\datos\\proyecto', 'C:/datos/proyecto/src/App.vue')).toBe('src/App.vue')
  })

  it('lo de fuera del proyecto se deja como está', () => {
    expect(relativaA('/casa/proyecto', '/otra/parte/cosa.js')).toBe('/otra/parte/cosa.js')
  })

  it('sin ruta, texto vacío y sin reventar', () => {
    expect(relativaA('/casa', null)).toBe('')
    expect(relativaA('', undefined)).toBe('')
  })
})

describe('quedarse con lo justo del error', () => {
  it('coge mensaje, sitio y trozo señalado', () => {
    const limpio = limpiarError(
      {
        message: 'Element is missing end tag',
        id: '/casa/proyecto/src/App.vue',
        loc: { line: 2, column: 3 },
        frame: '  1 | <template>',
        plugin: { algo: 'que no viaja por el IPC' },
      },
      '/casa/proyecto',
    )

    expect(limpio).toEqual({
      mensaje: 'Element is missing end tag',
      fichero: 'src/App.vue',
      linea: 2,
      columna: 3,
      trozo: '  1 | <template>',
    })
  })

  it('sin error, nada', () => {
    expect(limpiarError(null, '/casa')).toBeNull()
  })

  it('un error pelado también sirve', () => {
    const limpio = limpiarError({ message: 'algo' }, '/casa')
    expect(limpio.mensaje).toBe('algo')
    expect(limpio.linea).toBeNull()
    expect(limpio.trozo).toBeNull()
  })
})

describe('con un Vite de verdad', () => {
  let carpeta
  let servidor
  let puerto
  const vistos = []

  beforeAll(async () => {
    carpeta = mkdtempSync(path.join(tmpdir(), 'problemas-'))
    mkdirSync(path.join(carpeta, 'src'), { recursive: true })
    writeFileSync(path.join(carpeta, 'src/App.vue'), ROTO, 'utf8')
    writeFileSync(path.join(carpeta, 'index.html'), '<!doctype html><div id="app"></div>', 'utf8')

    servidor = await createServer({
      root: carpeta,
      configFile: false,
      logLevel: 'silent',
      plugins: [vue()],
      server: { host: '127.0.0.1', port: 0 },
    })

    escucharProblemas(servidor, { carpeta, alCambiar: (p) => vistos.push(p) })
    await servidor.listen()
    puerto = servidor.config.server.port || servidor.httpServer.address().port
  }, 30000)

  afterAll(async () => {
    try {
      await servidor?.close()
    } catch {
      /* da igual */
    }
    try {
      rmSync(carpeta, { recursive: true, force: true })
    } catch {
      /* Windows tarda en soltar */
    }
  })

  it('pilla el error de un componente que no compila', async () => {
    // Pedir el fichero roto hace que Vite lo intente compilar y falle.
    await fetch(`http://127.0.0.1:${puerto}/src/App.vue`).catch(() => {})

    // El aviso viaja por el canal de recarga, que no es la respuesta HTTP.
    await new Promise((listo) => setTimeout(listo, 500))

    const problema = vistos.find((p) => p !== null)
    expect(problema, 'Vite no ha mandado el error por donde se le escucha').toBeTruthy()
    expect(problema.mensaje.length).toBeGreaterThan(3)
  }, 20000)

  it('y dice en qué fichero, en corto', async () => {
    const problema = vistos.find((p) => p !== null)
    expect(problema.fichero).toBe('src/App.vue')
  })

  it('el enganche no se come los envíos: la recarga sigue funcionando', () => {
    // Si el envío original no se llamara, el HMR dejaría de existir y la vista
    // previa no se actualizaría nunca. Sería un desastre silencioso.
    const enviados = []
    const falso = {
      hot: {
        send(...args) {
          enviados.push(args[0])
        },
      },
    }

    const soltar = escucharProblemas(falso, { alCambiar: () => {} })
    falso.hot.send({ type: 'update', updates: [] })
    soltar()

    expect(enviados).toHaveLength(1)
    expect(enviados[0].type).toBe('update')
  })

  it('un aviso raro no revienta nada', () => {
    const falso = { hot: { send: () => {} } }
    escucharProblemas(falso, { alCambiar: () => {} })

    expect(() => falso.hot.send(null)).not.toThrow()
    expect(() => falso.hot.send({ type: 'error' })).not.toThrow()
  })

  it('un servidor sin canal no rompe el arranque', () => {
    expect(() => escucharProblemas({}, {})).not.toThrow()
    expect(() => escucharProblemas(null, {})).not.toThrow()
  })
})
