// Formateador minimo para las lecciones de Wax y el glosario de Steris.
//
// No es Markdown ni pretende serlo: es el subconjunto que se usa de verdad al
// escribir una leccion. Meter una libreria entera de Markdown para esto seria
// cargar 50 KB para resolver cuatro casos.
//
// El texto es nuestro, no del alumno, pero se escapa igual. Si algun dia una
// leccion se genera desde otro sitio, esto ya esta bien hecho.

export function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Negrita con **, codigo con acentos graves. Se aplica despues de escapar, asi
// que lo que se inserta aqui es marcado nuestro, nunca del texto original.
function enLinea(texto) {
  return escapar(texto)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

const ES_CODIGO = /^(?: {4}|\t)/
const ES_LISTA = /^\s*[-*]\s+/
const ES_NUMERADA = /^\s*\d+\.\s+/

function bloqueDeCodigo(lineas) {
  const codigo = lineas.map((linea) => linea.replace(/^(?: {4}|\t)/, '')).join('\n')
  return `<pre><code>${escapar(codigo)}</code></pre>`
}

function bloqueDeLista(lineas, numerada) {
  const etiqueta = numerada ? 'ol' : 'ul'
  const puntos = lineas
    .map((linea) => linea.replace(numerada ? ES_NUMERADA : ES_LISTA, ''))
    .map((linea) => `<li>${enLinea(linea)}</li>`)
    .join('')
  return `<${etiqueta}>${puntos}</${etiqueta}>`
}

export function formatear(texto) {
  const bloques = String(texto ?? '').split(/\n\s*\n/)

  return bloques
    .map((bloque) => {
      const lineas = bloque.split('\n').filter((linea) => linea.trim() !== '')
      if (!lineas.length) return ''

      if (lineas.every((linea) => ES_CODIGO.test(linea))) return bloqueDeCodigo(lineas)
      if (lineas.every((linea) => ES_NUMERADA.test(linea))) return bloqueDeLista(lineas, true)
      if (lineas.every((linea) => ES_LISTA.test(linea))) return bloqueDeLista(lineas, false)

      // Un parrafo normal: los saltos de linea sueltos se funden, como en
      // Markdown, porque en el fuente estan solo para no pasarse de ancho.
      return `<p>${enLinea(lineas.join(' '))}</p>`
    })
    .filter(Boolean)
    .join('\n')
}
