import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// La actualización toca la única cosa que no se puede deshacer desde dentro de
// la app: cerrarla. Antes se instalaba sola al salir, sin decir nada, y eso es
// de mala educación con quien está a mitad de una lección.
//
// El proceso principal no se puede importar aquí (requiere electron de verdad),
// así que estas pruebas leen su código y comprueban las invariantes. Suena
// tosco, pero es lo que cazó el `root` relativo que dejaba la ventana en negro.

const main = readFileSync('taller-escritorio/main.cjs', 'utf8')
const puente = readFileSync('taller-escritorio/preload.cjs', 'utf8')
const shell = readFileSync('src/AppEscritorio.vue', 'utf8')
const tarjeta = readFileSync('src/componentes/AvisoActualizacion.vue', 'utf8')

describe('la app no se cierra sola', () => {
  it('no instala al salir por su cuenta', () => {
    expect(main).toMatch(/autoInstallOnAppQuit\s*=\s*false/)
    expect(main).not.toMatch(/autoInstallOnAppQuit\s*=\s*true/)
  })

  it('sí descarga en segundo plano, que eso no molesta', () => {
    expect(main).toMatch(/autoDownload\s*=\s*true/)
  })
})

describe('instalar cuando ella lo pide', () => {
  it('el proceso principal expone la orden', () => {
    expect(main).toMatch(/ipcMain\.handle\(\s*'taller:instalar-actualizacion'/)
  })

  it('el puente la ofrece a la interfaz', () => {
    expect(puente).toMatch(/instalarActualizacion:\s*\(\)\s*=>\s*ipcRenderer\.invoke\(\s*'taller:instalar-actualizacion'/)
  })

  it('instala en silencio y vuelve a abrir la app', () => {
    // Los dos argumentos son lo que convierte «se cierra» en «se cierra y
    // vuelve»: sin el segundo, ella se queda mirando el escritorio.
    expect(main).toMatch(/quitAndInstall\(\s*true\s*,\s*true\s*\)/)
  })

  it('no llama a quitAndInstall dentro del propio manejador del IPC', () => {
    // quitAndInstall cierra ventanas; hacerlo en el hilo del IPC deja la
    // llamada colgada sin responder nunca y la interfaz esperando.
    expect(main).toMatch(/setImmediate\(\(\)\s*=>\s*updater\.quitAndInstall/)
  })

  it('no promete un reinicio si no hay nada descargado', () => {
    const manejador = main.slice(
      main.indexOf("ipcMain.handle('taller:instalar-actualizacion'"),
      main.indexOf("ipcMain.handle('taller:instalar-actualizacion'") + 400,
    )
    expect(manejador).toMatch(/hayActualizacionLista/)
    expect(manejador).toMatch(/ok:\s*false/)
  })

  it('la bandera se pone solo cuando la descarga ha terminado', () => {
    const descargada = main.slice(
      main.indexOf("updater.on('update-downloaded'"),
      main.indexOf("updater.on('error'"),
    )
    expect(descargada).toMatch(/hayActualizacionLista\s*=\s*true/)
  })
})

describe('lo que ve ella', () => {
  it('la tarjeta solo sale cuando hay algo que decidir', () => {
    // Mientras baja no se interrumpe a nadie: nada de «voy por el 12%».
    expect(shell).toMatch(/if \(estado !== 'lista'\) return/)
  })

  it('hay botón de instalar y botón de dejarlo para luego', () => {
    expect(tarjeta).toMatch(/Instalar y reabrir/)
    expect(tarjeta).toMatch(/@click="emitir\('luego'\)"/)
  })

  it('dice lo que va a pasar antes de que pase', () => {
    expect(tarjeta).toMatch(/se cierra y vuelve a abrirse/)
  })

  it('si no había nada que instalar, lo dice en vez de esperar eternamente', () => {
    expect(tarjeta).toMatch(/resultado\?\.ok/)
    expect(tarjeta).toMatch(/fallo\.value =/)
  })

  it('los botones se bloquean mientras cierra, para no pulsar dos veces', () => {
    expect(tarjeta).toMatch(/:disabled="instalando"/)
  })
})

describe('una sola copia abierta', () => {
  // Esto no es teoría. Al actualizar, alguien abrió la aplicación mientras el
  // instalador silencioso cambiaba los ficheros: arrancó la copia vieja, el
  // instalador se la llevó por delante, y pareció que se cerraba sola.
  //
  // Con los puertos fijos, dos copias no pueden convivir de ninguna manera.
  it('la segunda copia no arranca: se lo dice a la primera', () => {
    expect(main).toMatch(/requestSingleInstanceLock\(\)/)
    expect(main).toMatch(/app\.on\(\s*'second-instance'/)
  })

  it('y la primera sale al frente en vez de quedarse escondida', () => {
    const aviso = main.slice(
      main.indexOf("app.on('second-instance'"),
      main.indexOf("app.on('second-instance'") + 400,
    )
    expect(aviso).toMatch(/focus\(\)/)
    expect(aviso).toMatch(/restore\(\)/)
  })

  it('los puertos siguen siendo fijos, que es lo que obliga a todo esto', () => {
    expect(main).toMatch(/strictPort:\s*true/)
  })
})
