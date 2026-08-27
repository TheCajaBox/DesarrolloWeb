// Mirar por dentro la app EMPAQUETADA, en Electron de verdad.
//
// El panel de problemas y la consola dependen del IPC y del webview: en el
// navegador no existe ninguno de los dos, así que ahí no se puede comprobar
// nada. Aquí se arranca la app con el depurador abierto y se le pregunta al
// renderer directamente.
//
// Ojo con las comprobaciones: si el panel no existe, `innerText` es undefined,
// y «undefined no contiene "Nada roto"» daría por bueno justo el caso peor. Por
// eso todas exigen que HAYA texto antes de mirar lo que dice.

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const APP = 'instalador/win-unpacked/El Sombrero de Wayne.exe'
const PUERTO = 9333

const pausa = (ms) => new Promise((r) => setTimeout(r, ms))

const datos = mkdtempSync(path.join(tmpdir(), 'mirar-'))
const proyecto = path.join(datos, 'mi-web')

const hijo = spawn(
  path.resolve(APP),
  [`--user-data-dir=${datos}`, `--remote-debugging-port=${PUERTO}`],
  { cwd: process.env.SystemRoot || 'C:\\Windows', stdio: 'ignore' },
)

let ws = null
let siguienteId = 1
const esperando = new Map()

async function conectar() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json()
      const pagina = lista.find((t) => t.type === 'page' && t.url.includes('5280'))
      if (pagina) {
        ws = new WebSocket(pagina.webSocketDebuggerUrl)
        await new Promise((listo, fallo) => {
          ws.onopen = listo
          ws.onerror = fallo
        })
        ws.onmessage = (evento) => {
          const dato = JSON.parse(evento.data)
          const espera = esperando.get(dato.id)
          if (espera) {
            esperando.delete(dato.id)
            espera(dato)
          }
        }
        return true
      }
    } catch {
      /* todavía no */
    }
    await pausa(1000)
  }
  return false
}

function evaluar(expresion) {
  const id = siguienteId++
  return new Promise((listo) => {
    esperando.set(id, (dato) => listo(dato.result?.result?.value))
    ws.send(
      JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression: expresion, awaitPromise: true, returnByValue: true },
      }),
    )
  })
}

const pulsar = (texto) =>
  evaluar(
    `[...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(texto)})?.click()`,
  )

const leer = (selector) =>
  evaluar(`document.querySelector(${JSON.stringify(selector)})?.innerText`)

const resultados = []
const comprobar = (que, bien, detalle = '') => {
  resultados.push(bien)
  console.log(`${bien ? '  ok  ' : ' FALLA'} ${que}${detalle ? ` — ${detalle}` : ''}`)
}

try {
  if (!(await conectar())) throw new Error('no he podido conectar con el renderer')
  await pausa(3000)

  // La app abre en el mapa: hay que entrar al taller para ver nada de esto.
  await pulsar('Taller')
  await pausa(2500)

  // 1. Las pestañas de ficheros y los tres paneles de abajo.
  const tira = (await leer('.tira')) || ''
  comprobar('la tira tiene pestañas de ficheros', tira.includes('.vue') || tira.includes('.html'), tira.replace(/\n/g, ' | '))
  comprobar(
    'y los tres paneles de abajo',
    tira.includes('Terminal') && tira.includes('Problemas') && tira.includes('Consola'),
  )

  // 2. El panel de problemas, con todo bien.
  await pulsar('Problemas')
  await pausa(800)
  const tranquilo = (await leer('.problemas')) || ''
  comprobar('sin errores dice que no hay nada roto', tranquilo.includes('Nada roto'), tranquilo || 'sin panel')

  // 3. Se rompe su App.vue A PROPÓSITO, en el disco, como si lo escribiera ella.
  writeFileSync(path.join(proyecto, 'src/App.vue'), '<template>\n  <p>{{ sin cerrar </p>\n', 'utf8')
  await pausa(4000)

  const roto = (await leer('.problemas')) || ''
  comprobar(
    'el panel se entera de que algo no compila',
    roto.length > 0 && !roto.includes('Nada roto'),
    roto.replace(/\n/g, ' | ').slice(0, 170) || 'sin panel',
  )
  comprobar('y dice en qué fichero', roto.includes('App.vue'))

  // 4. Se arregla y el panel se calla.
  writeFileSync(
    path.join(proyecto, 'src/App.vue'),
    '<template>\n  <p>arreglado</p>\n</template>\n',
    'utf8',
  )
  await pausa(4000)

  const otraVez = (await leer('.problemas')) || ''
  comprobar('al arreglarlo, el panel se calla', otraVez.includes('Nada roto'), otraVez || 'sin panel')

  // 5. La consola de la vista previa.
  await pulsar('Consola')
  await pausa(800)
  const consola = (await leer('.consola')) || ''
  comprobar('el panel de consola se pinta', consola.includes('mensaje'), consola.replace(/\n/g, ' | ').slice(0, 120))
} catch (fallo) {
  comprobar(`la comprobación ha reventado: ${fallo.message}`, false)
} finally {
  try {
    ws?.close()
  } catch {
    /* da igual */
  }
  spawnSync('taskkill', ['/PID', String(hijo.pid), '/T', '/F'], { stdio: 'ignore' })
}

const fallos = resultados.filter((r) => !r).length
console.log(fallos ? `\n${fallos} fallos\n` : `\n${resultados.length} comprobaciones, todas bien\n`)
process.exit(fallos ? 1 : 0)
