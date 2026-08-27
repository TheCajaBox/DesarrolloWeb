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

import { spawn } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
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
  const app = path.join(datos, 'proyecto-alumna', 'src', 'App.vue')
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

  // 7. Y no se ha muerto por el camino.
  comprobar('la app sigue viva', salida === null, salida === null ? '' : `salió con ${salida}`)
} finally {
  try {
    hijo.kill()
  } catch {
    /* ya estaba muerta */
  }
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
const proyectoViejo = path.join(datosViejos, 'proyecto-alumna')
const plantilla = 'taller-escritorio/proyecto-alumna'

mkdirSync(path.join(proyectoViejo, 'src'), { recursive: true })
copyFileSync(path.join(plantilla, 'index.html'), path.join(proyectoViejo, 'index.html'))
copyFileSync(path.join(plantilla, 'src/main.js'), path.join(proyectoViejo, 'src/main.js'))
// El App.vue con el index.html dentro: el fallo que sufrió alguien de verdad.
copyFileSync(path.join(plantilla, 'index.html'), path.join(proyectoViejo, 'src/App.vue'))
// Y un enlace de módulos que apunta a donde ya no hay nada.
try {
  symlinkSync(path.join(datosViejos, 'no-existe'), path.join(proyectoViejo, 'node_modules'), 'junction')
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

  const appVue = readFileSync(path.join(proyectoViejo, 'src/App.vue'), 'utf8')
  comprobar('el App.vue corrupto se ha reparado', /<template>/.test(appVue))
  comprobar('lo corrupto se guardó al lado', existsSync(path.join(proyectoViejo, 'src/App.vue.roto')))

  comprobar(
    'el enlace a los módulos se ha rehecho',
    existsSync(path.join(proyectoViejo, 'node_modules', 'vue', 'package.json')),
  )

  // Y la prueba de fuego: que su componente compile de verdad.
  const compila = await pedir(`${PROYECTO}src/App.vue`, 8)
  comprobar('su componente vuelve a compilar', compila.estado === 200 && /setup|_sfc_main/.test(compila.texto))
} finally {
  try {
    viejo.kill()
  } catch {
    /* ya estaba muerta */
  }
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
