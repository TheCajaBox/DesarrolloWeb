// Un lector de CSS pequeno pero honrado.
//
// Las comprobaciones de los mundos de CSS podrian hacerse con expresiones
// regulares, pero dan falsos negativos a la primera de cambio: cambia el
// alumno un salto de linea, mete un comentario, escribe `grid-template-columns`
// con dos espacios, y el paso deja de superarse aunque este bien.
//
// Esto lee la estructura: reglas, selectores y declaraciones. No pretende ser
// un motor de CSS (no calcula cascada ni especificidad); solo responder a
// "que declaraciones hay escritas y donde".

function quitarComentarios(texto) {
  return String(texto || '').replace(/\/\*[\s\S]*?\*\//g, '')
}

function partirDeclaraciones(bloque) {
  const declaraciones = {}

  for (const trozo of bloque.split(';')) {
    const corte = trozo.indexOf(':')
    if (corte === -1) continue

    const propiedad = trozo.slice(0, corte).trim().toLowerCase()
    const valor = trozo.slice(corte + 1).trim()
    if (propiedad && valor) declaraciones[propiedad] = valor
  }

  return declaraciones
}

// Devuelve una lista plana de reglas. Las que estan dentro de un @media
// llevan `condicion` con el texto de la consulta.
export function leerCss(texto, condicion = null) {
  const fuente = quitarComentarios(texto)
  const reglas = []

  let i = 0
  while (i < fuente.length) {
    const abre = fuente.indexOf('{', i)
    if (abre === -1) break

    const encabezado = fuente.slice(i, abre).trim()

    // Buscar la llave de cierre que le corresponde, contando anidamiento.
    let profundidad = 1
    let j = abre + 1
    while (j < fuente.length && profundidad > 0) {
      if (fuente[j] === '{') profundidad += 1
      else if (fuente[j] === '}') profundidad -= 1
      j += 1
    }

    // Si el bloque se quedo sin cerrar (el alumno esta escribiendo, o se le
    // ha olvidado la llave), el cuerpo llega hasta el final: no hay que
    // descontar el `}` que no existe.
    const cerrado = profundidad === 0
    const cuerpo = fuente.slice(abre + 1, cerrado ? j - 1 : j)

    if (encabezado.startsWith('@')) {
      // Las at-rule con bloques dentro (@media, @supports) se recorren; las
      // que no (@import, @charset) no llegan aqui porque no tienen llaves.
      if (/^@(media|supports|layer|container)/i.test(encabezado)) {
        reglas.push(...leerCss(cuerpo, encabezado))
      }
    } else if (encabezado) {
      for (const selector of encabezado.split(',')) {
        const limpio = selector.trim().replace(/\s+/g, ' ')
        if (limpio) {
          reglas.push({ selector: limpio, declaraciones: partirDeclaraciones(cuerpo), condicion })
        }
      }
    }

    i = j
  }

  return reglas
}

// Reglas cuyo selector menciona ese elemento o clase. `article` encuentra
// `article`, `.ficha article` y `article:hover`, pero no `.articulos`.
export function reglasPara(reglas, objetivo) {
  const escapado = String(objetivo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patron = new RegExp(`(^|[\\s>+~(])${escapado}($|[\\s>+~:,.\\[)])`)

  return reglas.filter((regla) => patron.test(regla.selector) || regla.selector === objetivo)
}

// El valor declarado para una propiedad en cualquier regla que afecte a ese
// objetivo. Devuelve el ultimo, que es el que suele ganar.
export function valorDe(reglas, objetivo, propiedad) {
  const candidatas = reglasPara(reglas, objetivo)
    .map((regla) => regla.declaraciones[propiedad.toLowerCase()])
    .filter(Boolean)

  return candidatas.length ? candidatas[candidatas.length - 1] : null
}

// Como valorDe, pero mirando tambien las abreviadas. `padding-top` no esta
// declarado si el alumno escribio `padding: 1rem`, pero el efecto es el mismo.
export function tieneAlguna(reglas, objetivo, propiedades) {
  return propiedades.some((propiedad) => valorDe(reglas, objetivo, propiedad) !== null)
}

export function selectores(reglas) {
  return [...new Set(reglas.map((regla) => regla.selector))]
}

// Especificidad de un selector, como [ids, clases, elementos].
//
// Es el numero que decide quien gana cuando dos reglas dicen cosas distintas
// sobre lo mismo. Se compara por posiciones, de izquierda a derecha: un solo
// id gana a mil clases, y una sola clase gana a mil etiquetas. No es una suma.
//
// No cubre `:where()` (que vale cero) ni `:is()` (que vale lo de dentro),
// porque en el temario no aparecen. Si algun dia aparecen, se amplia aqui.
export function especificidad(selector) {
  let resto = String(selector || '')

  // Los pseudoelementos cuentan como elemento, y hay que sacarlos antes para
  // que los dos puntos no se confundan con una pseudoclase.
  const pseudoElementos = (resto.match(/::[\w-]+/g) || []).length
  resto = resto.replace(/::[\w-]+/g, ' ')

  const ids = (resto.match(/#[\w-]+/g) || []).length
  resto = resto.replace(/#[\w-]+/g, ' ')

  // Clases, atributos y pseudoclases pesan lo mismo.
  const clases = (resto.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+(?:\([^)]*\))?/g) || []).length
  resto = resto.replace(/\.[\w-]+|\[[^\]]*\]|:[\w-]+(?:\([^)]*\))?/g, ' ')

  // Lo que quede y parezca un nombre de etiqueta. El `*` no cuenta.
  const elementos = (resto.match(/\b[a-zA-Z][\w-]*/g) || []).length

  return [ids, clases, elementos + pseudoElementos]
}

// Devuelve 1 si `a` gana, -1 si gana `b`, 0 si empatan. En caso de empate
// manda la que se haya escrito despues, pero eso lo decide quien llame.
export function comparaEspecificidad(a, b) {
  const uno = especificidad(a)
  const otro = especificidad(b)

  for (let i = 0; i < 3; i += 1) {
    if (uno[i] !== otro[i]) return uno[i] > otro[i] ? 1 : -1
  }
  return 0
}

export function llevaImportante(regla, propiedad) {
  const valor = regla?.declaraciones?.[String(propiedad).toLowerCase()]
  return /!\s*important/i.test(String(valor || ''))
}
