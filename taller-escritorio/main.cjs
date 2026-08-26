// Proceso principal de la app de escritorio (Fase 0: la espina dorsal).
//
// Hace tres cosas:
//   1. Arranca un Vite de VERDAD, en proceso, contra el proyecto de la alumna.
//   2. Abre la ventana con la interfaz del taller.
//   3. Da al renderer un puente estrecho para leer y escribir sus ficheros.
//
// CommonJS (.cjs) a propósito: el repo es "type": "module", y Electron va más
// fino en CJS. Los paquetes que solo existen en ESM (vite, plugin-vue) se
// cargan con import() dinámico, que funciona igual desde CJS.

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs/promises')

// Para la Fase 0, el proyecto de la alumna vive dentro del repo, así Vite
// resuelve `vue` subiendo hasta node_modules sin tener que duplicarlo. En el
// empaquetado final se copiará a la carpeta de datos del usuario con su propio
// node_modules.
const PROYECTO = path.join(__dirname, 'proyecto-alumna')

let servidorVite = null
let urlVista = ''

async function arrancarVite() {
  const { createServer } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default

  servidorVite = await createServer({
    root: PROYECTO,
    configFile: false,
    logLevel: 'warn',
    plugins: [vue()],
    // strictPort: si el 5199 estuviera ocupado, que falle claro en vez de
    // saltar a otro puerto y dejar la vista previa apuntando a la nada.
    server: { host: '127.0.0.1', port: 5199, strictPort: true },
  })

  await servidorVite.listen()
  const puerto = servidorVite.config.server.port
  urlVista = `http://127.0.0.1:${puerto}/`
  console.log('[taller] Vite en', urlVista)
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
      // La vista previa va en un <webview> apuntando al Vite local.
      webviewTag: true,
    },
  })

  ventana.loadFile(path.join(__dirname, 'indice.html'))
  return ventana
}

// El puente: el renderer solo puede tocar ficheros DENTRO del proyecto, nunca
// del disco entero. Cada ruta se normaliza y se comprueba que no se escapa.
function rutaSegura(ruta) {
  const absoluta = path.resolve(PROYECTO, String(ruta || ''))
  if (absoluta !== PROYECTO && !absoluta.startsWith(PROYECTO + path.sep)) {
    throw new Error(`Ruta fuera del proyecto: ${ruta}`)
  }
  return absoluta
}

app.whenReady().then(async () => {
  await arrancarVite()

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

  ipcMain.handle('taller:url-vista', () => urlVista)

  crearVentana()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana()
  })
})

app.on('window-all-closed', async () => {
  if (servidorVite) await servidorVite.close().catch(() => {})
  if (process.platform !== 'darwin') app.quit()
})
