// Proceso principal de la app de escritorio.
//
// Arranca DOS Vite en proceso:
//   1. El del proyecto de la alumna (lo que ella construye) → vista previa.
//   2. El de la interfaz del taller (mapa, lecciones, editor, Wayne).
// Y abre la ventana con la interfaz, dándole un puente estrecho para leer y
// escribir los ficheros del proyecto.
//
// CommonJS (.cjs): el repo es "type": "module" y Electron va más fino en CJS.
// Vite y su plugin (solo ESM) se cargan con import() dinámico.

const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('node:path')
const fs = require('node:fs/promises')
const fsSinc = require('node:fs')
const { pideInternet, avisoDeInternet } = require('./politica-terminal.cjs')

const RAIZ = path.join(__dirname, '..')
const PLANTILLA = path.join(__dirname, 'proyecto-alumna')

// En desarrollo, el proyecto de la alumna vive en el repo. Empaquetada la app,
// el repo es de solo lectura, así que el proyecto se muda a la carpeta de
// datos de usuario y se siembra desde la plantilla en el primer arranque.
const PROYECTO = app.isPackaged
  ? path.join(app.getPath('userData'), 'proyecto-alumna')
  : PLANTILLA

function prepararProyecto() {
  if (!app.isPackaged) return
  if (fsSinc.existsSync(path.join(PROYECTO, 'index.html'))) return

  // Primer arranque: copiar la plantilla (sin node_modules) y enlazar los
  // módulos empaquetados con una unión de directorios, para que Vite resuelva
  // vue/vue-router/pinia sin instalar nada.
  fsSinc.cpSync(PLANTILLA, PROYECTO, {
    recursive: true,
    filter: (origen) => !origen.includes('node_modules'),
  })

  const enlace = path.join(PROYECTO, 'node_modules')
  if (!fsSinc.existsSync(enlace)) {
    fsSinc.symlinkSync(path.join(RAIZ, 'node_modules'), enlace, 'junction')
  }
}

let viteAlumna = null
let viteInterfaz = null
let urlVistaAlumna = ''
let urlInterfaz = ''

async function arrancarVites() {
  // El directorio de trabajo de una app instalada lo pone Windows, y puede ser
  // cualquiera. Cualquier ruta relativa (de aquí o de una configuración de
  // Vite) se resolvería contra él. Se fija a la raíz de la app y así deja de
  // ser una variable.
  try {
    process.chdir(RAIZ)
  } catch {
    /* si no se puede, las rutas de abajo ya son absolutas */
  }

  const { createServer } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default

  // 1. El proyecto de la alumna (lo que se ve en la vista previa).
  viteAlumna = await createServer({
    root: PROYECTO,
    configFile: false,
    logLevel: 'warn',
    plugins: [vue()],
    server: { host: '127.0.0.1', port: 5199, strictPort: true },
  })
  await viteAlumna.listen()
  urlVistaAlumna = `http://127.0.0.1:${viteAlumna.config.server.port}/`

  // 2. La interfaz del taller (usa su propia configuración del repo). El `root`
  // se pasa además aquí, absoluto: es la carpeta que se sirve, y no puede
  // depender de dónde se haya arrancado el proceso.
  viteInterfaz = await createServer({
    configFile: path.join(RAIZ, 'vite.escritorio.js'),
    root: path.join(RAIZ, 'paginas', 'escritorio'),
    logLevel: 'warn',
    server: { host: '127.0.0.1', port: 5280, strictPort: true },
  })
  await viteInterfaz.listen()
  urlInterfaz = `http://127.0.0.1:${viteInterfaz.config.server.port}/`

  // Comprobación de arranque: si la página que va a cargar la ventana no
  // existe, se dice AQUÍ. Antes esto se manifestaba como una ventana negra sin
  // ninguna explicación, que es la peor forma de fallar.
  const indice = path.join(RAIZ, 'paginas', 'escritorio', 'index.html')
  if (!fsSinc.existsSync(indice)) {
    throw new Error(`No encuentro la página de la interfaz en ${indice}`)
  }

  console.log('[taller] proyecto en', urlVistaAlumna)
  console.log('[taller] interfaz en', urlInterfaz)
}

// Un registro de arranque en fichero. Una app instalada no tiene consola: sin
// esto, cuando algo falla lo único que se ve es una ventana negra y hay que
// adivinar. Vive en la carpeta de datos, junto al proyecto.
function apuntar(mensaje) {
  const linea = `[${new Date().toISOString()}] ${mensaje}\n`
  try {
    fsSinc.appendFileSync(path.join(app.getPath('userData'), 'arranque.log'), linea)
  } catch {
    /* si no se puede escribir, al menos queda en la consola */
  }
  console.log(mensaje)
}

// Si el arranque se rompe, la ventana lo DICE. Con el error, dónde está el
// registro y qué hacer. Nunca en negro.
function mostrarFallo(ventana, error) {
  const registro = path.join(app.getPath('userData'), 'arranque.log')
  const pagina = `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<style>
  body { margin: 0; padding: 3rem 2.5rem; background: #161512; color: #e8e2d4;
         font: 15px/1.6 system-ui, sans-serif; }
  h1 { font-size: 1.35rem; margin: 0 0 0.4rem; color: #dfb96f; }
  p { max-width: 44rem; color: #b8b0a0; }
  pre { background: #211e1a; border: 1px solid #3a352c; border-radius: 8px;
        padding: 1rem; white-space: pre-wrap; color: #e0a98f; max-width: 44rem; }
  code { color: #dfb96f; }
</style></head>
<body>
  <h1>El taller no ha podido arrancar</h1>
  <p>No es culpa tuya y no se ha perdido nada de tu trabajo. Esto es lo que ha pasado:</p>
  <pre>${String(error && error.stack ? error.stack : error).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])}</pre>
  <p>Cierra la ventana y vuelve a abrir la aplicación. Si sigue igual, manda el
     fichero <code>${registro}</code>, que ahí está apuntado todo.</p>
</body></html>`

  ventana.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(pagina)}`)
}

function crearVentana({ enBlanco = false } = {}) {
  const ventana = new BrowserWindow({
    width: 1440,
    height: 920,
    backgroundColor: '#161512',
    title: 'El Sombrero de Wayne',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  })

  if (!enBlanco) ventana.loadURL(urlInterfaz)
  return ventana
}

// ---------------------------------------------------------------------------
// Actualizaciones automáticas
// ---------------------------------------------------------------------------
//
// La app comprueba si hay una versión nueva publicada en las releases del
// repositorio, se la descarga en segundo plano y la instala al cerrar. Así un
// arreglo llega solo, sin volver a pasar un instalador de 134 MB a mano.
//
// Sin interrumpir: nada de ventanas modales a mitad de una lección. Se avisa
// en la interfaz y se aplica cuando ella cierra la aplicación.
function vigilarActualizaciones(ventana) {
  if (!app.isPackaged) {
    apuntar('actualizaciones: en desarrollo no se comprueban')
    return
  }

  let updater
  try {
    updater = require('electron-updater').autoUpdater
  } catch (fallo) {
    apuntar(`actualizaciones: no disponibles (${fallo.message})`)
    return
  }

  updater.autoDownload = true
  // Que la instale al salir, no a media faena.
  updater.autoInstallOnAppQuit = true
  updater.logger = { info: apuntar, warn: apuntar, error: apuntar, debug: () => {} }

  const avisar = (estado, datos = {}) => {
    if (!ventana.isDestroyed()) ventana.webContents.send('taller:actualizacion', { estado, ...datos })
  }

  updater.on('update-available', (info) => {
    apuntar(`actualizaciones: hay versión ${info?.version}`)
    avisar('bajando', { version: info?.version })
  })

  updater.on('update-not-available', () => apuntar('actualizaciones: ya estás al día'))

  updater.on('download-progress', (progreso) => {
    avisar('bajando', { porcentaje: Math.round(progreso?.percent || 0) })
  })

  updater.on('update-downloaded', (info) => {
    apuntar(`actualizaciones: ${info?.version} lista, se instalará al cerrar`)
    avisar('lista', { version: info?.version })
  })

  updater.on('error', (fallo) => {
    // Sin conexión es lo normal en esta app: no es un error que contar a nadie.
    apuntar(`actualizaciones: ${fallo?.message || fallo}`)
  })

  // Un poco después de arrancar, para no competir con la carga del taller.
  setTimeout(() => {
    updater.checkForUpdates().catch(() => {})
  }, 8000)
}

// ---------------------------------------------------------------------------
// La terminal
// ---------------------------------------------------------------------------
//
// Ejecuta comandos DE VERDAD sobre el proyecto de la alumna: npm run build,
// npm test, git status. No es una imitación con respuestas preparadas.
//
// El problema a resolver: en su máquina no hay Node ni npm instalados. Pero
// Electron ES Node por dentro, así que con ELECTRON_RUN_AS_NODE=1 su propio
// ejecutable hace de intérprete. Se escriben dos lanzadores (`node` y `npm`)
// en una carpeta que se añade al PATH del proceso hijo, y a partir de ahí
// `npm run build` en la terminal es el npm de verdad, con el package.json de
// verdad.

function prepararLanzadores() {
  const bin = path.join(app.getPath('userData'), 'bin')
  fsSinc.mkdirSync(bin, { recursive: true })

  const npmCli = path.join(RAIZ, 'node_modules', 'npm', 'bin', 'npm-cli.js')

  // %~dp0 es la carpeta del propio .cmd; %* son los argumentos tal cual.
  fsSinc.writeFileSync(
    path.join(bin, 'node.cmd'),
    ['@echo off', 'set ELECTRON_RUN_AS_NODE=1', `"${process.execPath}" %*`].join('\r\n'),
  )

  fsSinc.writeFileSync(
    path.join(bin, 'npm.cmd'),
    [
      '@echo off',
      'set ELECTRON_RUN_AS_NODE=1',
      `"${process.execPath}" "${npmCli}" %*`,
    ].join('\r\n'),
  )

  return { bin, hayNpm: fsSinc.existsSync(npmCli) }
}

let enMarcha = null

function ejecutarEnTerminal(ventana, comando) {
  if (enMarcha) return { ok: false, error: 'Ya hay un comando en marcha. Párralo con Ctrl+C.' }

  const deRed = pideInternet(comando)
  if (deRed) {
    apuntar(`terminal: bloqueado por red · ${comando}`)
    if (!ventana.isDestroyed()) {
      ventana.webContents.send('terminal:salida', {
        tipo: 'aviso',
        texto: avisoDeInternet(comando, deRed.que, PROYECTO),
      })
      ventana.webContents.send('terminal:salida', { tipo: 'fin', texto: '1' })
    }
    return { ok: true, bloqueado: true }
  }

  const { spawn } = require('node:child_process')
  const { bin } = prepararLanzadores()

  const entorno = {
    ...process.env,
    // Los lanzadores primero: así `npm` y `node` son los de la app aunque no
    // haya nada instalado en el sistema.
    PATH: `${bin}${path.delimiter}${process.env.PATH || ''}`,
    // npm en color no se lee bien en xterm sin pty; se le pide texto plano.
    FORCE_COLOR: '0',
    NO_UPDATE_NOTIFIER: '1',
  }

  const hijo = spawn(comando, {
    cwd: PROYECTO,
    env: entorno,
    shell: true,
    windowsHide: true,
  })

  enMarcha = hijo

  const mandar = (tipo, texto) => {
    if (!ventana.isDestroyed()) ventana.webContents.send('terminal:salida', { tipo, texto })
  }

  hijo.stdout.on('data', (trozo) => mandar('salida', trozo.toString()))
  hijo.stderr.on('data', (trozo) => mandar('error', trozo.toString()))

  hijo.on('error', (fallo) => {
    mandar('error', `No se ha podido ejecutar: ${fallo.message}\r\n`)
  })

  hijo.on('close', (codigo) => {
    enMarcha = null
    mandar('fin', String(codigo ?? 0))
  })

  return { ok: true }
}

// El renderer solo puede tocar ficheros DENTRO del proyecto de la alumna.
function rutaSegura(ruta) {
  const absoluta = path.resolve(PROYECTO, String(ruta || ''))
  if (absoluta !== PROYECTO && !absoluta.startsWith(PROYECTO + path.sep)) {
    throw new Error(`Ruta fuera del proyecto: ${ruta}`)
  }
  return absoluta
}

app.whenReady().then(async () => {
  // La ventana se abre PRIMERO, con un aviso de que está arrancando. Así, si
  // algo falla, hay dónde contarlo (y si tarda, se ve que está trabajando).
  const ventana = crearVentana({ enBlanco: true })
  ventana.loadURL(
    'data:text/html;charset=utf-8,' +
      encodeURIComponent(
        '<!doctype html><html lang="es"><head><meta charset="utf-8"><style>' +
          'body{margin:0;height:100vh;display:grid;place-content:center;background:#161512;' +
          'color:#b8b0a0;font:15px system-ui,sans-serif;text-align:center}' +
          'b{color:#dfb96f;font-weight:600}</style></head><body><div>' +
          '<p><b>El Sombrero de Wayne</b></p><p>Preparando el taller…</p>' +
          '</div></body></html>',
      ),
  )

  try {
    apuntar(`arrancando · versión ${app.getVersion()} · empaquetada: ${app.isPackaged}`)
    apuntar(`raíz: ${RAIZ}`)
    apuntar(`proyecto: ${PROYECTO}`)

    prepararProyecto()
    await arrancarVites()
    apuntar(`interfaz lista en ${urlInterfaz}`)
    ventana.loadURL(urlInterfaz)
    vigilarActualizaciones(ventana)
  } catch (error) {
    apuntar(`FALLO AL ARRANCAR: ${error && error.stack ? error.stack : error}`)
    mostrarFallo(ventana, error)
    return
  }

  ipcMain.handle('taller:leer', async (_e, ruta) => {
    try {
      return await fs.readFile(rutaSegura(ruta), 'utf8')
    } catch {
      return null
    }
  })

  ipcMain.handle('taller:escribir', async (_e, ruta, contenido) => {
    const destino = rutaSegura(ruta)
    await fs.mkdir(path.dirname(destino), { recursive: true })
    await fs.writeFile(destino, String(contenido), 'utf8')
    return true
  })

  ipcMain.handle('taller:borrar', async (_e, ruta) => {
    await fs.rm(rutaSegura(ruta), { force: true })
    return true
  })

  ipcMain.handle('taller:renombrar', async (_e, desde, hasta) => {
    const destino = rutaSegura(hasta)
    await fs.mkdir(path.dirname(destino), { recursive: true })
    await fs.rename(rutaSegura(desde), destino)
    return true
  })

  ipcMain.handle('taller:listar', async () => {
    const salida = []
    async function recorrer(dir, prefijo) {
      for (const entrada of await fs.readdir(dir, { withFileTypes: true })) {
        // node_modules y dist (la carpeta exportada) no son parte del trabajo
        // de la alumna: ni se listan ni se comprueban.
        if (entrada.name === 'node_modules' || entrada.name === 'dist' || entrada.name.startsWith('.'))
          continue
        const rel = prefijo ? `${prefijo}/${entrada.name}` : entrada.name
        if (entrada.isDirectory()) await recorrer(path.join(dir, entrada.name), rel)
        else salida.push(rel)
      }
    }
    await recorrer(PROYECTO, '')
    return salida
  })

  ipcMain.handle('taller:url-vista', () => urlVistaAlumna)

  // ---- Terminal ----
  ipcMain.handle('terminal:ejecutar', (evento, comando) => {
    const suya = BrowserWindow.fromWebContents(evento.sender)
    apuntar(`terminal: ${comando}`)
    return ejecutarEnTerminal(suya, String(comando || ''))
  })

  // Lo que se teclea mientras un comando está corriendo (una respuesta a una
  // pregunta, por ejemplo).
  ipcMain.handle('terminal:escribir', (_e, texto) => {
    if (!enMarcha) return false
    enMarcha.stdin.write(String(texto))
    return true
  })

  // Ctrl+C.
  ipcMain.handle('terminal:parar', () => {
    if (!enMarcha) return false
    enMarcha.kill()
    return true
  })

  // Para la primera línea de la terminal: dónde está el proyecto y con qué
  // versiones trabaja.
  ipcMain.handle('terminal:donde', () => ({
    proyecto: PROYECTO,
    node: process.versions.node,
    electron: process.versions.electron,
  }))

  // Exportar: el build real de Vite sobre el proyecto de la alumna. Deja la
  // web empaquetada en dist/ y abre la carpeta para que la vea.
  let exportando = false
  ipcMain.handle('taller:exportar', async () => {
    if (exportando) return { ok: false, error: 'Ya hay una exportación en marcha.' }
    exportando = true
    try {
      const { build } = await import('vite')
      const vue = (await import('@vitejs/plugin-vue')).default
      const destino = path.join(PROYECTO, 'dist')

      await build({
        root: PROYECTO,
        configFile: false,
        logLevel: 'warn',
        plugins: [vue()],
        build: { outDir: destino, emptyOutDir: true },
      })

      shell.openPath(destino)
      return { ok: true, ruta: destino }
    } catch (fallo) {
      return { ok: false, error: fallo.message }
    } finally {
      exportando = false
    }
  })

  // La ventana ya está abierta desde el principio de este bloque, con la
  // interfaz cargada: aquí no se crea otra.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana()
  })
})

app.on('window-all-closed', async () => {
  if (viteAlumna) await viteAlumna.close().catch(() => {})
  if (viteInterfaz) await viteInterfaz.close().catch(() => {})
  if (process.platform !== 'darwin') app.quit()
})
