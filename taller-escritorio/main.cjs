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

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs/promises')

const RAIZ = path.join(__dirname, '..')
const PROYECTO = path.join(__dirname, 'proyecto-alumna')

let viteAlumna = null
let viteInterfaz = null
let urlVistaAlumna = ''
let urlInterfaz = ''

async function arrancarVites() {
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

  // 2. La interfaz del taller (usa su propia configuración del repo).
  viteInterfaz = await createServer({
    configFile: path.join(RAIZ, 'vite.escritorio.js'),
    logLevel: 'warn',
    server: { host: '127.0.0.1', port: 5280, strictPort: true },
  })
  await viteInterfaz.listen()
  urlInterfaz = `http://127.0.0.1:${viteInterfaz.config.server.port}/`

  console.log('[taller] proyecto en', urlVistaAlumna)
  console.log('[taller] interfaz en', urlInterfaz)
}

function crearVentana() {
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

  ventana.loadURL(urlInterfaz)
  return ventana
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
  await arrancarVites()

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
        if (entrada.name === 'node_modules' || entrada.name.startsWith('.')) continue
        const rel = prefijo ? `${prefijo}/${entrada.name}` : entrada.name
        if (entrada.isDirectory()) await recorrer(path.join(dir, entrada.name), rel)
        else salida.push(rel)
      }
    }
    await recorrer(PROYECTO, '')
    return salida
  })

  ipcMain.handle('taller:url-vista', () => urlVistaAlumna)

  crearVentana()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana()
  })
})

app.on('window-all-closed', async () => {
  if (viteAlumna) await viteAlumna.close().catch(() => {})
  if (viteInterfaz) await viteInterfaz.close().catch(() => {})
  if (process.platform !== 'darwin') app.quit()
})
