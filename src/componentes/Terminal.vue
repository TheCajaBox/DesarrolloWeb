<script setup>
// La terminal integrada. xterm.js —el mismo terminal que lleva VS Code— con
// procesos de verdad detrás: lo que se escribe aquí lo ejecuta el proceso
// principal sobre la carpeta del proyecto.
//
// xterm pinta y captura teclas, pero no trae edición de línea: el prompt, el
// borrado, el historial con las flechas y el Ctrl+C se implementan aquí. Son
// las cuatro cosas que uno espera de una terminal, y sin ellas no se trabaja.
//
// Los códigos de control van por nombre (ESC, CTRL_C…) y no como caracteres
// literales: un carácter invisible en el código fuente es una bomba, porque
// cualquier editor o copiar-pegar se lo lleva sin que se vea.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { usarColeccion } from '../almacen/coleccion.js'
import { sombreroDelComando } from '../motor/escondites.js'

const emitir = defineEmits(['ejecutando'])

const coleccion = usarColeccion()

const contenedor = ref(null)

let term = null
let ajustar = null
let darseDeBaja = null
let observador = null

// ---- Códigos de control y color ----
const ESC = String.fromCharCode(27)
const CTRL_C = String.fromCharCode(3)
const BORRAR = String.fromCharCode(127)
const ARRIBA = `${ESC}[A`
const ABAJO = `${ESC}[B`

const COLOR = {
  fin: `${ESC}[0m`,
  negrita: `${ESC}[1m`,
  tenue: `${ESC}[90m`,
  rojo: `${ESC}[31m`,
  verde: `${ESC}[32m`,
  amarillo: `${ESC}[33m`,
  azul: `${ESC}[36m`,
}

const pintar = (color, texto) => `${COLOR[color]}${texto}${COLOR.fin}`
const PROMPT = `${pintar('amarillo', '>')} `

// ---- Estado de la línea que se está escribiendo ----
let linea = ''
let corriendo = false
const historial = []
let enHistorial = -1

function escribirPrompt() {
  term.write(`\r\n${PROMPT}`)
}

// Los comandos del taller, para que la primera vez no haya que adivinar.
const SUGERENCIAS = [
  ['npm run build', 'compila tu web a dist/, como en producción'],
  ['npm test', 'pasa las pruebas automáticas del proyecto'],
  ['node -v', 'la versión de Node que estás usando'],
  ['git status', 'qué has cambiado desde el último commit'],
]

function bienvenida(donde) {
  term.writeln(pintar('negrita', 'La terminal del taller'))
  term.writeln(pintar('tenue', donde.proyecto))
  term.writeln(pintar('tenue', `node ${donde.node} · electron ${donde.electron}`))
  term.writeln('')
  term.writeln('Ejecuta comandos de verdad sobre tu proyecto. Para empezar:')
  for (const [comando, para] of SUGERENCIAS) {
    term.writeln(`  ${pintar('azul', comando.padEnd(16))} ${pintar('tenue', para)}`)
  }
  term.writeln('')
  term.writeln(pintar('tenue', 'Ctrl+C para parar lo que corra · flechas arriba y abajo para repetir'))
}

async function ejecutar(comando) {
  const limpio = comando.trim()
  if (!limpio) {
    escribirPrompt()
    return
  }

  historial.unshift(limpio)
  enHistorial = -1

  // Algunas órdenes valen algo más que su salida.
  const premio = sombreroDelComando(limpio)
  if (premio) coleccion.encontrar(premio)

  corriendo = true
  emitir('ejecutando', true)
  term.write('\r\n')

  const resultado = await window.taller.terminal.ejecutar(limpio)

  if (!resultado?.ok) {
    term.writeln(pintar('rojo', resultado?.error || 'No se ha podido ejecutar.'))
    corriendo = false
    emitir('ejecutando', false)
    escribirPrompt()
  }
}

function alTeclear(dato) {
  // Ctrl+C: para el proceso, o limpia la línea si no hay nada corriendo.
  if (dato === CTRL_C) {
    if (corriendo) {
      window.taller.terminal.parar()
      term.write('^C')
      return
    }
    linea = ''
    term.write('^C')
    escribirPrompt()
    return
  }

  // Mientras corre un comando, lo que se teclea va a su entrada.
  if (corriendo) {
    window.taller.terminal.escribir(dato)
    return
  }

  if (dato === '\r') {
    const comando = linea
    linea = ''
    ejecutar(comando)
    return
  }

  if (dato === BORRAR) {
    if (linea.length) {
      linea = linea.slice(0, -1)
      term.write('\b \b')
    }
    return
  }

  // Historial con las flechas.
  if (dato === ARRIBA || dato === ABAJO) {
    if (!historial.length) return

    enHistorial =
      dato === ARRIBA
        ? Math.min(enHistorial + 1, historial.length - 1)
        : Math.max(enHistorial - 1, -1)

    const nueva = enHistorial === -1 ? '' : historial[enHistorial]
    // Se borra la línea entera y se pinta la del historial.
    term.write(`\r${ESC}[K${PROMPT}${nueva}`)
    linea = nueva
    return
  }

  // El resto de secuencias de control se ignoran: no hay movimiento de cursor
  // dentro de la línea, y así no se descoloca lo que se ve de lo que se cree
  // que hay escrito.
  if (dato.startsWith(ESC)) return

  linea += dato
  term.write(dato)
}

onMounted(async () => {
  term = new Terminal({
    fontFamily: 'Cascadia Code, JetBrains Mono, Consolas, monospace',
    fontSize: 13,
    lineHeight: 1.3,
    cursorBlink: true,
    convertEol: true,
    theme: {
      background: '#161512',
      foreground: '#e8e2d4',
      cursor: '#dfb96f',
      selectionBackground: '#3d3628',
      black: '#161512',
      red: '#c06840',
      green: '#86a95e',
      yellow: '#dfb96f',
      blue: '#6f9bb5',
      magenta: '#a986c0',
      cyan: '#5fae9e',
      white: '#e8e2d4',
    },
  })

  ajustar = new FitAddon()
  term.loadAddon(ajustar)
  term.open(contenedor.value)
  ajustar.fit()

  observador = new ResizeObserver(() => {
    try {
      ajustar.fit()
    } catch {
      /* el panel puede estar oculto mientras se arrastra */
    }
  })
  observador.observe(contenedor.value)

  // Sin puente (en el navegador, verificando la interfaz) no hay procesos que
  // ejecutar: se dice, en vez de fingir que funciona.
  if (!window.taller?.terminal) {
    term.writeln(pintar('amarillo', 'La terminal necesita la aplicación de escritorio.'))
    term.writeln(pintar('tenue', 'Aquí, en el navegador, no hay procesos que ejecutar.'))
    return
  }

  darseDeBaja = window.taller.terminal.alSalir(({ tipo, texto }) => {
    if (tipo === 'fin') {
      corriendo = false
      emitir('ejecutando', false)
      const codigo = Number(texto)
      term.write(
        codigo === 0
          ? `\r\n${pintar('verde', 'hecho')}`
          : `\r\n${pintar('rojo', `terminó con código ${codigo}`)}`,
      )
      escribirPrompt()
      return
    }

    // La salida de error no siempre es un fallo (npm escribe avisos ahí), así
    // que se pinta distinta pero sin alarmar.
    if (tipo === 'error') {
      term.write(pintar('tenue', texto))
      return
    }

    term.write(texto)
  })

  bienvenida(await window.taller.terminal.donde())
  escribirPrompt()

  term.onData(alTeclear)
})

onBeforeUnmount(() => {
  if (darseDeBaja) darseDeBaja()
  if (observador) observador.disconnect()
  if (term) term.dispose()
})
</script>

<template>
  <div class="terminal">
    <div ref="contenedor" class="lienzo"></div>
  </div>
</template>

<style scoped>
.terminal {
  height: 100%;
  min-height: 0;
  background: #161512;
  padding: 0.5rem 0.2rem 0.2rem 0.6rem;
  box-sizing: border-box;
}

.lienzo {
  height: 100%;
  min-height: 0;
}

:deep(.xterm) {
  height: 100%;
}

:deep(.xterm-viewport) {
  background: transparent !important;
}
</style>
