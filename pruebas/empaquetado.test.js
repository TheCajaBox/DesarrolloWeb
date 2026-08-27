import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Pruebas del arranque de la app EMPAQUETADA.
//
// Existen por un fallo concreto: `root: 'paginas/escritorio'` en la
// configuración de Vite. En relativo, Vite lo resuelve contra el directorio de
// trabajo del proceso. Lanzando la app desde la carpeta del repo funcionaba;
// instalada, el directorio lo pone Windows, no existía esa carpeta, y la
// ventana salía EN NEGRO con un 404 silencioso.
//
// Una ruta relativa en el arranque de una app instalada es una bomba de
// relojería. Estas pruebas la desactivan.

const config = readFileSync('vite.escritorio.js', 'utf8')
const main = readFileSync('taller-escritorio/main.cjs', 'utf8')

describe('la configuración de la interfaz no depende del directorio de trabajo', () => {
  it('el root es absoluto, no una ruta relativa', () => {
    const asignacion = config.match(/root:\s*([^\n]+)/)
    expect(asignacion, 'no encuentro el root en vite.escritorio.js').toBeTruthy()

    const valor = asignacion[1]
    // Una cadena literal que no empieza por unidad ni por / es relativa.
    expect(
      /^['"`]/.test(valor.trim()),
      `root está puesto como cadena literal (${valor.trim()}): tiene que calcularse con fileURLToPath`,
    ).toBe(false)
    expect(valor).toMatch(/fileURLToPath|resolve|__dirname/)
  })

  it('los alias y el fs.allow también son absolutos', () => {
    expect(config).toMatch(/alias:\s*\{\s*'@':\s*fileURLToPath/)
    expect(config).toMatch(/fs:\s*\{\s*allow:\s*\[fileURLToPath/)
  })
})

describe('el proceso principal fija su terreno', () => {
  it('fija el directorio de trabajo a la raíz de la app', () => {
    expect(main).toMatch(/process\.chdir\(RAIZ\)/)
  })

  it('pasa el root de la interfaz absoluto, sin confiar en la configuración', () => {
    expect(main).toMatch(/root:\s*path\.join\(RAIZ,\s*'paginas',\s*'escritorio'\)/)
  })

  it('comprueba que la página de la interfaz existe antes de cargarla', () => {
    expect(main).toMatch(/existsSync\(indice\)/)
  })
})

describe('un fallo de arranque nunca deja la ventana en negro', () => {
  it('el arranque va dentro de un try/catch', () => {
    expect(main).toMatch(/try\s*\{[\s\S]*arrancarVites\(\)[\s\S]*\}\s*catch/)
  })

  it('hay una pantalla de fallo que se carga si algo se rompe', () => {
    expect(main).toMatch(/function mostrarFallo/)
    expect(main).toMatch(/mostrarFallo\(ventana, error\)/)
    expect(main).toMatch(/no ha podido arrancar/i)
  })

  it('el arranque queda apuntado en un fichero de registro', () => {
    expect(main).toMatch(/arranque\.log/)
    expect(main).toMatch(/apuntar\(`FALLO AL ARRANCAR/)
  })
})

// Esta tanda existe porque empaqueté una plantilla corrupta: el App.vue del
// proyecto de la alumna contenía el HTML del index.html, así que la app
// instalada arrancaba y el mundo 1 estaba roto desde el primer segundo. Nadie
// mira el contenido de los ficheros de una plantilla… hasta que pasa.
describe('la plantilla del proyecto de la alumna es válida', () => {
  const leer = (ruta) => readFileSync(`taller-escritorio/mi-web/${ruta}`, 'utf8')

  it('App.vue es un componente de verdad, no otra cosa', () => {
    const app = leer('src/App.vue')

    expect(app, 'App.vue empieza por <!doctype html>: tiene dentro un HTML').not.toMatch(
      /^\s*<!doctype/i,
    )
    expect(app, 'a App.vue le falta el <template>').toMatch(/<template>/)
    expect(app).toMatch(/<\/template>/)
    expect(app, 'a App.vue le falta el <script setup>').toMatch(/<script setup>/)
  })

  it('index.html es un HTML con su punto de montaje y su main.js', () => {
    const html = leer('index.html')

    expect(html).toMatch(/^\s*<!doctype html>/i)
    expect(html, 'falta el <div id="app"> donde monta Vue').toMatch(/id="app"/)
    expect(html).toMatch(/src\/main\.js/)
  })

  it('main.js monta la aplicación', () => {
    const main = leer('src/main.js')

    expect(main).toMatch(/createApp/)
    expect(main).toMatch(/mount\(\s*['"]#app['"]\s*\)/)
    expect(main).toMatch(/App\.vue/)
  })

  it('cada fichero tiene la forma de su extensión', () => {
    // Un .vue no puede empezar por <!doctype, y un .html no puede llevar
    // <script setup>. Si alguna vez se cruzan, es que algo los ha escrito
    // encima el uno del otro.
    expect(leer('src/App.vue')).not.toMatch(/<!doctype/i)
    expect(leer('index.html')).not.toMatch(/<script setup>/)
  })
})

describe('el empaquetado incluye lo que la app necesita servir', () => {
  const paquete = JSON.parse(readFileSync('package.json', 'utf8'))
  const ficheros = paquete.build?.files || []

  it('incluye la página de la interfaz, el código y la configuración', () => {
    const texto = ficheros.join(' ')
    expect(texto).toMatch(/paginas\/escritorio/)
    expect(texto).toMatch(/src/)
    expect(texto).toMatch(/vite\.escritorio\.js/)
    expect(texto).toMatch(/taller-escritorio/)
  })

  it('vite y su plugin son dependencias de producción: la app los usa al arrancar', () => {
    expect(paquete.dependencies?.vite, 'vite tiene que estar en dependencies').toBeTruthy()
    expect(paquete.dependencies?.['@vitejs/plugin-vue']).toBeTruthy()
  })

  it('monaco también: es el editor', () => {
    expect(paquete.dependencies?.['monaco-editor']).toBeTruthy()
  })
})
