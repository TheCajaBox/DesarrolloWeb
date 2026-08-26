// Lógica de la ventana (Fase 0). Sin framework a propósito: esto solo tiene que
// probar la espina dorsal. La interfaz de verdad (el taller Vue entero) entra
// en la Fase 1.
//
// Flujo:
//   - Al abrir, lee src/App.vue en el editor y apunta la vista previa al Vite.
//   - Al teclear, guarda en disco (con retardo). Vite ve el cambio y recarga
//     la vista previa solo, por HMR. No recargamos nada a mano.
//   - "Comprobar" lee el fichero, mira el <h1> del template, y Wayne reacciona.

const RUTA = 'src/App.vue'
const TEXTO_SEMBRADO = 'Cambia esto'

const $codigo = document.getElementById('codigo')
const $guardado = document.getElementById('guardado')
const $vista = document.getElementById('vista')
const $url = document.getElementById('url')
const $veredicto = document.getElementById('veredicto')
const $wayne = document.getElementById('wayne-dice')

// Saca el texto del primer <h1> del bloque <template>. Se comprueba lo que el
// navegador entendería, no el texto suelto: se parsea de verdad.
function h1DelTemplate(fuente) {
  const bloque = String(fuente).match(/<template>([\s\S]*?)<\/template>/i)
  if (!bloque) return null
  const doc = new DOMParser().parseFromString(bloque[1], 'text/html')
  const h1 = doc.querySelector('h1')
  return h1 ? h1.textContent.trim() : null
}

function dice(texto) {
  $wayne.textContent = texto
}

async function arrancar() {
  // La URL ya la lleva el webview en el HTML. Aquí solo la mostramos en la
  // barra, y avisamos si la carga falla, para no quedarnos en blanco sin saber
  // por qué.
  const url = await window.taller.urlVista()
  $url.textContent = url

  $vista.addEventListener('did-fail-load', (e) => {
    if (e.errorCode === -3) return // navegación abortada, benigna
    $url.textContent = `no carga (${e.errorCode})`
  })

  const contenido = await window.taller.leer(RUTA)
  $codigo.value = contenido ?? ''
}

let reloj = null
$codigo.addEventListener('input', () => {
  $guardado.textContent = 'guardando…'
  clearTimeout(reloj)
  reloj = setTimeout(async () => {
    await window.taller.escribir(RUTA, $codigo.value)
    $guardado.textContent = 'guardado'
    // No tocamos la vista previa: Vite la recarga solo por HMR.
  }, 400)
})

document.getElementById('comprobar').addEventListener('click', async () => {
  // Guardar lo pendiente antes de comprobar.
  clearTimeout(reloj)
  await window.taller.escribir(RUTA, $codigo.value)
  $guardado.textContent = 'guardado'

  const h1 = h1DelTemplate($codigo.value)

  if (h1 === null) {
    $veredicto.className = 'veredicto mal'
    $veredicto.textContent = 'No encuentro ningún <h1> dentro del <template>. ¿Lo has borrado sin querer?'
    dice('Ojo, que se te ha ido el h1. Sin él la página no tiene título.')
    return
  }
  if (!h1) {
    $veredicto.className = 'veredicto mal'
    $veredicto.textContent = 'El <h1> está, pero vacío. Escribe algo dentro.'
    dice('Un título en blanco es como un sombrero sin cabeza: técnicamente existe, pero no sirve.')
    return
  }
  if (h1 === TEXTO_SEMBRADO) {
    $veredicto.className = 'veredicto mal'
    $veredicto.textContent = 'Sigue diciendo «Cambia esto». Pon lo que tú quieras.'
    dice('Te lo está pidiendo el propio texto, hombre. Cámbialo.')
    return
  }

  $veredicto.className = 'veredicto bien'
  $veredicto.textContent = `Ahora pone «${h1}», y lo has cambiado tú en un componente Vue de verdad.`
  dice(`«${h1}». Me gusta. Y fíjate: has tocado tu primer componente y no ha explotado nada. Buena señal.`)
})

arrancar()
