// Leer el <script> de verdad, no buscar palabras en él.
//
// Las comprobaciones del taller nacieron con expresiones regulares sobre el
// texto del script, y eso las hacía laxas de una forma que se nota enseguida:
//
//   // const sombreros = ref([])     ← un comentario colaba
//   const nota = 'usa ref([]) aquí'  ← una cadena colaba
//
// Aquí se parsea con acorn y se pregunta al árbol. Un comentario es un
// comentario y una cadena es una cadena: ni uno ni otra declaran nada.
//
// Todo devuelve datos, no mensajes: los mensajes son cosa de comprobaciones.js.

import { parse } from 'acorn'

const OPCIONES = { ecmaVersion: 'latest', sourceType: 'module', locations: true }

/**
 * Parsea el script. Nunca lanza: si no compila, lo dice.
 *   → { ok, arbol, error, linea }
 */
export function analizar(codigo) {
  const texto = String(codigo || '')
  if (!texto.trim()) return { ok: false, arbol: null, error: 'el script está vacío', linea: null }

  try {
    return { ok: true, arbol: parse(texto, OPCIONES), error: null, linea: null }
  } catch (fallo) {
    return {
      ok: false,
      arbol: null,
      error: String(fallo.message || fallo).replace(/\s*\(\d+:\d+\)\s*$/, ''),
      linea: fallo.loc ? fallo.loc.line : null,
    }
  }
}

/**
 * El código sin comentarios ni contenido de cadenas, para cuando de verdad
 * hace falta buscar texto (una opción como `{ deep: true }`, por ejemplo).
 * Se sustituye por espacios, así las posiciones no se mueven.
 *
 * Si el script no compila se devuelve tal cual: es lo honesto, y quien llame
 * ya decidirá qué hacer.
 */
export function sinComentariosNiCadenas(codigo) {
  return borrar(codigo, { comentarios: true, cadenas: true })
}

/**
 * El código sin comentarios, pero CON el contenido de las cadenas.
 *
 * Es la que usan las búsquedas de texto del taller: mata la trampa del
 * comentario (que era la que colaba de verdad) y sigue permitiendo buscar
 * cosas que viven dentro de cadenas, como `from 'vue'` o `'sombrero'`.
 */
export function sinComentarios(codigo) {
  return borrar(codigo, { comentarios: true, cadenas: false })
}

// Sustituye por espacios lo que se quiera borrar, manteniendo las posiciones
// (así los números de línea y columna siguen valiendo).
function borrar(codigo, { comentarios, cadenas }) {
  const texto = String(codigo || '')
  const huecos = []

  let arbol
  try {
    arbol = parse(texto, {
      ...OPCIONES,
      onComment: (_bloque, _cuerpo, desde, hasta) => {
        if (comentarios) huecos.push([desde, hasta])
      },
    })
  } catch {
    // Si no compila se devuelve tal cual: es lo honesto mientras se escribe.
    return texto
  }

  if (cadenas) {
    recorrer(arbol, (nodo) => {
      if (nodo.type === 'Literal' && typeof nodo.value === 'string') {
        huecos.push([nodo.start, nodo.end])
      }
      if (nodo.type === 'TemplateElement') huecos.push([nodo.start, nodo.end])
    })
  }

  const letras = [...texto]
  for (const [desde, hasta] of huecos) {
    for (let i = desde; i < hasta && i < letras.length; i += 1) {
      if (letras[i] !== '\n') letras[i] = ' '
    }
  }
  return letras.join('')
}

/** Recorre el árbol entero llamando a `visita` en cada nodo. */
export function recorrer(nodo, visita) {
  if (!nodo || typeof nodo !== 'object') return

  if (Array.isArray(nodo)) {
    for (const hijo of nodo) recorrer(hijo, visita)
    return
  }

  if (typeof nodo.type === 'string') visita(nodo)

  for (const clave of Object.keys(nodo)) {
    if (clave === 'type' || clave === 'loc' || clave === 'start' || clave === 'end') continue
    recorrer(nodo[clave], visita)
  }
}

// El nombre completo de lo que se llama: `ref`, `sombreros.value.push`,
// `localStorage.setItem`. Sirve para preguntar por llamadas con punto.
function nombreDe(nodo) {
  if (!nodo) return ''
  if (nodo.type === 'Identifier') return nodo.name
  if (nodo.type === 'ThisExpression') return 'this'
  if (nodo.type === 'MemberExpression') {
    const objeto = nombreDe(nodo.object)
    const propiedad = nodo.computed ? '[]' : nombreDe(nodo.property)
    return objeto && propiedad ? `${objeto}.${propiedad}` : objeto || propiedad
  }
  if (nodo.type === 'CallExpression') return nombreDe(nodo.callee)
  return ''
}

/**
 * Las variables declaradas, con lo que las inicializa.
 *   → [{ nombre, tipo: 'const'|'let'|'var', llamando, argumentos, esFuncion }]
 * donde `llamando` es el nombre de la función que la inicializa (ref, computed,
 * defineProps…) o null.
 */
export function variables(codigo) {
  const { ok, arbol } = analizar(codigo)
  if (!ok) return []

  const encontradas = []

  recorrer(arbol, (nodo) => {
    if (nodo.type !== 'VariableDeclaration') return

    for (const declarador of nodo.declarations) {
      if (declarador.id?.type !== 'Identifier') continue

      const init = declarador.init
      const esFuncion =
        init?.type === 'ArrowFunctionExpression' || init?.type === 'FunctionExpression'

      encontradas.push({
        nombre: declarador.id.name,
        tipo: nodo.kind,
        llamando: init?.type === 'CallExpression' ? nombreDe(init.callee) : null,
        argumentos: init?.type === 'CallExpression' ? init.arguments : [],
        esFuncion,
        init,
      })
    }
  })

  return encontradas
}

/** Los nombres de las funciones declaradas, sean `function x()` o `const x = () =>`. */
export function funciones(codigo) {
  const { ok, arbol } = analizar(codigo)
  if (!ok) return []

  const nombres = new Set()

  recorrer(arbol, (nodo) => {
    if (nodo.type === 'FunctionDeclaration' && nodo.id?.name) nombres.add(nodo.id.name)
  })

  for (const variable of variables(codigo)) {
    if (variable.esFuncion) nombres.add(variable.nombre)
  }

  // Los métodos de un objeto (las actions de un store de Pinia, por ejemplo).
  recorrer(arbol, (nodo) => {
    if (nodo.type !== 'Property') return
    const esFuncion =
      nodo.value?.type === 'FunctionExpression' || nodo.value?.type === 'ArrowFunctionExpression'
    if (esFuncion && nodo.key?.name) nombres.add(nodo.key.name)
  })

  return [...nombres]
}

/** Todas las llamadas del script, por su nombre completo con puntos. */
export function llamadas(codigo) {
  const { ok, arbol } = analizar(codigo)
  if (!ok) return []

  const encontradas = []
  recorrer(arbol, (nodo) => {
    if (nodo.type === 'CallExpression' || nodo.type === 'NewExpression') {
      const nombre = nombreDe(nodo.callee)
      if (nombre) encontradas.push({ nombre, argumentos: nodo.arguments, nodo })
    }
  })
  return encontradas
}

/** ¿Se llama a esto en alguna parte? Acepta 'ref' o 'localStorage.setItem'. */
export function llama(codigo, nombre) {
  return llamadas(codigo).some((llamada) => llamada.nombre === nombre)
}

/** Los imports: [{ de, nombres, porDefecto }]. */
export function importaciones(codigo) {
  const { ok, arbol } = analizar(codigo)
  if (!ok) return []

  const encontradas = []
  recorrer(arbol, (nodo) => {
    if (nodo.type !== 'ImportDeclaration') return

    encontradas.push({
      de: String(nodo.source.value || ''),
      nombres: nodo.specifiers
        .filter((e) => e.type === 'ImportSpecifier')
        .map((e) => e.imported.name),
      porDefecto:
        nodo.specifiers.find((e) => e.type === 'ImportDefaultSpecifier')?.local.name || null,
    })
  })
  return encontradas
}

/** ¿Se importa `nombre` desde `de`? Si `nombre` va vacío, basta que se importe algo de ahí. */
export function importa(codigo, nombre, de) {
  return importaciones(codigo).some((entrada) => {
    if (de && !coincideRuta(entrada.de, de)) return false
    if (!nombre) return true
    return entrada.nombres.includes(nombre) || entrada.porDefecto === nombre
  })
}

// './stores/cesta.js' y '../stores/cesta' son la misma intención: se compara
// el final de la ruta sin extensión.
function coincideRuta(escrita, buscada) {
  const limpia = (ruta) => String(ruta || '').replace(/\.[jt]s$/, '').replace(/^\.\/+|^(\.\.\/)+/, '')
  return limpia(escrita) === limpia(buscada) || limpia(escrita).endsWith(limpia(buscada))
}

/**
 * El cuerpo (como texto) de una función declarada con ese nombre, para
 * preguntar qué hace por dentro. Devuelve null si no existe.
 */
export function cuerpoDe(codigo, nombre) {
  const texto = String(codigo || '')
  const { ok, arbol } = analizar(texto)
  if (!ok) return null

  let cuerpo = null

  recorrer(arbol, (nodo) => {
    if (cuerpo) return

    const esDeclaracion = nodo.type === 'FunctionDeclaration' && nodo.id?.name === nombre
    const esPropiedad =
      nodo.type === 'Property' &&
      nodo.key?.name === nombre &&
      (nodo.value?.type === 'FunctionExpression' || nodo.value?.type === 'ArrowFunctionExpression')
    const esVariable =
      nodo.type === 'VariableDeclarator' &&
      nodo.id?.name === nombre &&
      (nodo.init?.type === 'ArrowFunctionExpression' || nodo.init?.type === 'FunctionExpression')

    if (esDeclaracion) cuerpo = texto.slice(nodo.body.start, nodo.body.end)
    else if (esPropiedad) cuerpo = texto.slice(nodo.value.body.start, nodo.value.body.end)
    else if (esVariable) cuerpo = texto.slice(nodo.init.body.start, nodo.init.body.end)
  })

  return cuerpo
}
