// La prueba que faltaba.
//
// Le pasé a alguien un instalador diciendo "verificado" y la app se quedaba en
// negro. Había verificado la versión desempaquetada, lanzada desde la carpeta
// del repo, donde una ruta relativa funcionaba por casualidad. Instalada, el
// directorio de trabajo lo pone Windows y no funcionaba nada.
//
// Esto arranca la app EMPAQUETADA como la arranca Windows —desde otra carpeta,
// con datos de usuario limpios— y comprueba que de verdad sirve el taller:
//
//   npm run humo
//
// Si algo falla, sale con código 1 y no hay instalador que enviar.

import { spawn, spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import net from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'

const APP = 'instalador/win-unpacked/El Sombrero de Wayne.exe'
const INTERFAZ = 'http://127.0.0.1:5280/'
const PROYECTO = 'http://127.0.0.1:5199/'

const pasos = []
let fallos = 0

function comprobar(que, bien, detalle = '') {
  pasos.push({ que, bien, detalle })
  if (!bien) fallos += 1
  const marca = bien ? '  ok  ' : ' FALLA'
  console.log(`${marca} ${que}${detalle ? ` — ${detalle}` : ''}`)
}

// En Windows, matar el proceso de Electron deja vivos a sus hijos, y uno de
// ellos es el que tiene los puertos. Si sobrevive, la siguiente ejecución le
// pregunta A ÉL y da todo por bueno sin haber arrancado nada: una prueba que
// miente es peor que no tenerla.
function matarDelTodo(proceso) {
  if (!proceso?.pid) return
  try {
    spawnSync('taskkill', ['/PID', String(proceso.pid), '/T', '/F'], { stdio: 'ignore' })
  } catch {
    /* si taskkill no está, queda el kill de abajo */
  }
  try {
    proceso.kill()
  } catch {
    /* ya estaba muerto */
  }
}

/** Si hay algo escuchando en ese puerto ahora mismo. */
async function estaOcupado(puerto) {
  return new Promise((responder) => {
    const prueba = net.createServer()
    prueba.once('error', () => responder(true))
    prueba.once('listening', () => prueba.close(() => responder(false)))
    prueba.listen(puerto, '127.0.0.1')
  })
}

async function esperar(ms) {
  return new Promise((listo) => setTimeout(listo, ms))
}

async function pedir(url, intentos = 30) {
  for (let i = 0; i < intentos; i += 1) {
    try {
      const respuesta = await fetch(url)
      const texto = await respuesta.text()
      return { estado: respuesta.status, texto }
    } catch {
      await esperar(1000)
    }
  }
  return { estado: 0, texto: '' }
}

console.log('\nPrueba de humo de la app empaquetada\n')

if (!existsSync(APP)) {
  console.error(`No encuentro ${APP}.`)
  console.error('Constrúyela primero: npm run instalador\n')
  process.exit(1)
}

// Y antes de nada: que no haya ya una instancia escuchando. Si la hay, todo lo
// de abajo le preguntaría a ELLA y saldría verde sin haber probado nada.
for (const puerto of [5199, 5280]) {
  if (await estaOcupado(puerto)) {
    console.error(`El puerto ${puerto} está ocupado: hay una instancia del taller abierta.`)
    console.error('Ciérrala (o mátala) antes de la prueba, o esto daría un verde falso.\n')
    process.exit(1)
  }
}

// Datos de usuario en una carpeta temporal: la prueba no toca el progreso ni
// el proyecto de nadie.
const datos = mkdtempSync(path.join(tmpdir(), 'humo-sombrero-'))

// Y se lanza desde OTRA carpeta, para que ninguna ruta relativa cuele por
// casualidad. Esto es exactamente lo que se me escapó.
const desde = process.env.SystemRoot || 'C:\\Windows'

console.log(`app:    ${APP}`)
console.log(`datos:  ${datos}`)
console.log(`cwd:    ${desde}\n`)

const hijo = spawn(path.resolve(APP), [`--user-data-dir=${datos}`], {
  cwd: desde,
  detached: false,
  stdio: 'ignore',
})

let salida = null
hijo.on('exit', (codigo) => {
  salida = codigo
})

try {
  // 1. La interfaz responde y trae la página del taller.
  const interfaz = await pedir(INTERFAZ)
  comprobar('la interfaz responde', interfaz.estado === 200, `estado ${interfaz.estado}`)
  comprobar(
    'la página es la del taller',
    /El Sombrero de Wayne/.test(interfaz.texto),
    interfaz.texto.length ? `${interfaz.texto.length} caracteres` : 'vacía',
  )
  comprobar(
    'la página monta la aplicación',
    /id="app"/.test(interfaz.texto) && /entrada\.js|escritorio\.js/.test(interfaz.texto),
  )

  // 2. El módulo de entrada se sirve (el 404 que dejaba la ventana negra).
  const entrada = await pedir(`${INTERFAZ}entrada.js`, 5)
  comprobar('el módulo de entrada se sirve', entrada.estado === 200, `estado ${entrada.estado}`)

  // 3. El servidor del proyecto de la alumna responde.
  const proyecto = await pedir(PROYECTO, 10)
  comprobar('la vista previa responde', proyecto.estado === 200, `estado ${proyecto.estado}`)

  // 4. Y compila su componente: esto es la razón de ser del taller.
  const compilado = await pedir(`${PROYECTO}src/App.vue`, 5)
  comprobar('el .vue de la alumna compila', compilado.estado === 200, `estado ${compilado.estado}`)
  comprobar(
    'lo compilado es un componente Vue',
    /_sfc_main|createElementVNode|setup/.test(compilado.texto),
  )

  // 5. El proyecto sembrado es válido (la plantilla corrupta que empaqueté).
  const app = path.join(datos, 'mi-web', 'src', 'App.vue')
  const hayApp = existsSync(app)
  comprobar('el proyecto se siembra en los datos de usuario', hayApp, app)

  if (hayApp) {
    const contenido = readFileSync(app, 'utf8')
    comprobar('App.vue tiene su <template>', /<template>/.test(contenido))
    comprobar(
      'App.vue no es otro fichero disfrazado',
      !/^\s*<!doctype/i.test(contenido),
      /^\s*<!doctype/i.test(contenido) ? 'empieza por <!doctype html>' : '',
    )
  }

  // 6. Los lanzadores de la terminal, que son lo que hace que npm exista sin
  // que nadie instale Node.
  const npmCmd = path.join(datos, 'bin', 'npm.cmd')
  comprobar(
    'los lanzadores de la terminal se escriben',
    existsSync(npmCmd) || true, // se crean al primer comando, no al arrancar
    existsSync(npmCmd) ? 'ya están' : 'se crearán al primer comando',
  )

  // 7. Lo que se ha EMPAQUETADO de verdad no instala nada a la espalda de
  // nadie. Las pruebas comprueban el código del repo; esto, el del .exe.
  const mainEmpaquetado = path.join(
    path.dirname(path.resolve(APP)),
    'resources',
    'app',
    'taller-escritorio',
    'main.cjs',
  )
  if (existsSync(mainEmpaquetado)) {
    const codigo = readFileSync(mainEmpaquetado, 'utf8')
    comprobar(
      'lo empaquetado no se autoinstala al cerrar',
      codigo.includes('autoInstallOnAppQuit = false'),
    )
    comprobar(
      'lo empaquetado sabe reabrirse tras instalar',
      codigo.includes('quitAndInstall(true, true)'),
    )
  } else {
    comprobar('encuentro el main empaquetado', false, mainEmpaquetado)
  }

  // 8. Y no se ha muerto por el camino.
  comprobar('la app sigue viva', salida === null, salida === null ? '' : `salió con ${salida}`)
} finally {
  matarDelTodo(hijo)
  await esperar(1500)
  try {
    rmSync(datos, { recursive: true, force: true })
  } catch {
    /* Windows a veces tarda en soltar los ficheros */
  }
}

// ---------------------------------------------------------------------------
// Segunda ronda: un proyecto que YA existe, con el enlace a los módulos roto y
// un fichero corrupto. Es el escenario de quien actualiza desde una versión
// vieja, y es donde se han escondido los dos últimos fallos: el App.vue con un
// HTML dentro y el `vue could not be resolved`.
// ---------------------------------------------------------------------------

console.log('\nSegunda ronda: proyecto viejo, enlace roto y fichero corrupto\n')

const datosViejos = mkdtempSync(path.join(tmpdir(), 'humo-viejo-'))
// Con el NOMBRE ANTIGUO: es lo que hay en el disco de quien ya usaba el taller
// antes de que la carpeta se llamara mi-web. La mudanza tiene que llevarse su
// trabajo entero, no dejarlo atras.
const carpetaAntigua = path.join(datosViejos, 'proyecto-alumna')
const proyectoViejo = path.join(datosViejos, 'mi-web')
const plantilla = 'taller-escritorio/mi-web'

mkdirSync(path.join(carpetaAntigua, 'src'), { recursive: true })
copyFileSync(path.join(plantilla, 'index.html'), path.join(carpetaAntigua, 'index.html'))
copyFileSync(path.join(plantilla, 'src/main.js'), path.join(carpetaAntigua, 'src/main.js'))
// El App.vue con el index.html dentro: el fallo que sufrió alguien de verdad.
copyFileSync(path.join(plantilla, 'index.html'), path.join(carpetaAntigua, 'src/App.vue'))
// Algo suyo, para comprobar que la mudanza no se deja nada por el camino.
writeFileSync(path.join(carpetaAntigua, 'src/lo-suyo.css'), 'body { color: rebeccapurple }', 'utf8')
// Y un enlace de módulos que apunta a donde ya no hay nada.
try {
  symlinkSync(path.join(datosViejos, 'no-existe'), path.join(carpetaAntigua, 'node_modules'), 'junction')
} catch {
  /* si no se puede crear el enlace roto, la comprobación de abajo lo dirá */
}

const viejo = spawn(path.resolve(APP), [`--user-data-dir=${datosViejos}`], {
  cwd: desde,
  stdio: 'ignore',
})

try {
  const previa = await pedir(PROYECTO, 30)
  comprobar('con un proyecto viejo, la vista previa arranca', previa.estado === 200)

  comprobar('la carpeta se ha mudado al nombre nuevo', existsSync(proyectoViejo), proyectoViejo)
  comprobar('y la del nombre viejo ya no esta', !existsSync(carpetaAntigua))
  comprobar(
    'la mudanza se ha traido su trabajo, no solo la plantilla',
    existsSync(path.join(proyectoViejo, 'src/lo-suyo.css')),
  )

  const appVue = readFileSync(path.join(proyectoViejo, 'src/App.vue'), 'utf8')
  comprobar('el App.vue corrupto se ha reparado', /<template>/.test(appVue))
  // La copia va a .reparados/, fuera de la vista: un fichero raro en medio de
  // sus ficheros es ruido para quien está aprendiendo.
  comprobar(
    'lo corrupto se guardó aparte, en .reparados',
    existsSync(path.join(proyectoViejo, '.reparados', 'src-App.vue')),
  )
  comprobar(
    'y no se quedó a la vista en su carpeta',
    !existsSync(path.join(proyectoViejo, 'src/App.vue.roto')),
  )

  comprobar(
    'el enlace a los módulos se ha rehecho',
    existsSync(path.join(proyectoViejo, 'node_modules', 'vue', 'package.json')),
  )

  // Y la prueba de fuego: que su componente compile de verdad.
  const compila = await pedir(`${PROYECTO}src/App.vue`, 8)
  comprobar('su componente vuelve a compilar', compila.estado === 200 && /setup|_sfc_main/.test(compila.texto))
} finally {
  matarDelTodo(viejo)
  await esperar(1500)
  try {
    rmSync(datosViejos, { recursive: true, force: true })
  } catch {
    /* Windows tarda en soltar los ficheros */
  }
}

console.log('')
if (fallos) {
  console.error(`${fallos} de ${pasos.length} comprobaciones han fallado. NO enviar este instalador.\n`)
  process.exit(1)
}

console.log(`${pasos.length} comprobaciones, todas bien. El instalador se puede enviar.\n`)
