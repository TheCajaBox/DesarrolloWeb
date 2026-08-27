// Comprobaciones reutilizables para los pasos de escribir código.
//
// Existen por una razón de cuentas: escrita a mano, cada comprobación son unas
// cuarenta líneas, y con trescientos pasos eso son doce mil líneas de lógica
// casi repetida. Con estos ladrillos, un paso son ocho.
//
// El principio no cambia: se comprueba lo que el navegador ENTENDIÓ (con
// DOMParser) o lo que el motor de CSS lee, nunca el texto fuente. Y cada
// requisito trae su propio mensaje, porque el mensaje es la mitad del
// ejercicio.

import { buscarTodos, leerHtml, textoDe } from '../../motor/leer-html.js'
import { leerCss, reglasPara, tieneAlguna, valorDe } from '../../motor/leer-css.js'
import { estiloDe, partirVue } from '../../motor/leer-vue.js'
// El <script> se lee parseándolo, no buscando palabras: ver motor/leer-script.js.
import {
  analizar,
  cuerpoDe,
  funciones,
  importa,
  llamadas,
  sinComentarios,
  variables,
} from '../../motor/leer-script.js'

// ---------------------------------------------------------------------------
// Armadores
// ---------------------------------------------------------------------------

/**
 * Una comprobación sobre el HTML. Los requisitos se evalúan en orden y gana el
 * primero que falle, así los mensajes van de lo más básico a lo más fino.
 */
export function comprobarHtml({ fichero = 'index.html', requisitos, exito }) {
  if (!exito) throw new Error('comprobarHtml necesita un mensaje de éxito')

  return (ficheros) => {
    const doc = leerHtml(ficheros?.[fichero] || '')

    for (const requisito of requisitos) {
      const problema = requisito(doc, ficheros)
      if (problema) return { superado: false, mensaje: problema }
    }

    return { superado: true, mensaje: typeof exito === 'function' ? exito(doc) : exito }
  }
}

/** Una comprobación sobre el CSS. Busca la hoja en cualquiera de las rutas. */
export function comprobarCss({
  ficheros: rutas = ['css/estilos.css', 'estilos.css'],
  requisitos,
  exito,
}) {
  if (!exito) throw new Error('comprobarCss necesita un mensaje de éxito')

  return (ficheros) => {
    const ruta = rutas.find((r) => ficheros?.[r] !== undefined)
    const reglas = leerCss(ficheros?.[ruta] || '')

    for (const requisito of requisitos) {
      const problema = requisito(reglas, ficheros)
      if (problema) return { superado: false, mensaje: problema }
    }

    return { superado: true, mensaje: typeof exito === 'function' ? exito(reglas) : exito }
  }
}

/**
 * Una comprobación sobre un fichero .vue. Lo parte y enruta cada requisito a su
 * bloque: los de `template` corren contra el HTML de la plantilla, los de
 * `estilo` contra el CSS del <style>, los de `script` contra el texto del
 * <script>.
 *
 * Si el .vue no compila, se dice con el error real del parser de Vue —el mismo
 * que vería en la vista previa— en vez de un mensaje inventado.
 */
export function comprobarVue({
  fichero = 'src/App.vue',
  template = [],
  estilo = [],
  script = [],
  exito,
  errorParser,
}) {
  if (!exito) throw new Error('comprobarVue necesita un mensaje de éxito')

  const comprobador = (ficheros) => {
    const partido = partirVue(ficheros?.[fichero] || '')

    if (partido.errores.length) {
      const primero = partido.errores[0]
      return {
        superado: false,
        mensaje: errorParser
          ? errorParser(primero)
          : `Tu componente no compila: ${primero}. Míralo en la vista previa, que Vue te señala la línea.`,
      }
    }

    const doc = leerHtml(partido.template || '')
    for (const requisito of template) {
      const problema = requisito(doc, ficheros, partido)
      if (problema) return { superado: false, mensaje: problema }
    }

    const reglas = leerCss(estiloDe(partido))
    for (const requisito of estilo) {
      const problema = requisito(reglas, ficheros, partido)
      if (problema) return { superado: false, mensaje: problema }
    }

    // A los requisitos de script se les da el código SIN COMENTARIOS. Así
    // ninguna comprobación —ni las de aquí ni las escritas a mano en un
    // mundo— puede aprobarse con la respuesta comentada. El original sigue
    // disponible en `partido` para quien lo necesite.
    const codigo = sinComentarios(partido.script || '')
    for (const requisito of script) {
      const problema = requisito(codigo, ficheros, partido)
      if (problema) return { superado: false, mensaje: problema }
    }

    return { superado: true, mensaje: typeof exito === 'function' ? exito(partido) : exito }
  }

  // Qué bloques mira este paso. Lo usan las pruebas antitrampas para saber
  // cuáles deben dejar de aprobarse si la respuesta se comenta.
  comprobador.fichero = fichero
  comprobador.usaTemplate = template.length > 0
  comprobador.usaEstilo = estilo.length > 0
  comprobador.usaScript = script.length > 0

  return comprobador
}

/**
 * Requisito de <script>: que aparezca algo. Empieza simple (busca un patrón en
 * el texto del script). Cuando haga falta afinar, se cambia por un análisis con
 * acorn sin tocar los mundos que lo usen.
 */
export function scriptContiene(patron, { falta } = {}) {
  return (script) => {
    // Se busca en el código SIN comentarios ni contenido de cadenas. Antes no
    // era así, y por eso estas dos líneas aprobaban un paso:
    //
    //   // const sombreros = ref([])
    //   const nota = 'aquí va un ref([])'
    //
    // Un comentario no declara nada. Las cadenas SÍ se conservan: hay pasos
    // que buscan legítimamente dentro de ellas (`from 'vue'`). Para lo que de
    // verdad importa —declaraciones, llamadas, imports— están los requisitos
    // de AST de más abajo, que no se dejan engañar por nada.
    const limpio = sinComentarios(String(script || ''))

    if (!patron.test(limpio)) {
      return falta || 'Al <script> le falta algo que este paso pide.'
    }
    return null
  }
}

// ---------------------------------------------------------------------------
// Requisitos de <script> que preguntan al ÁRBOL, no al texto
// ---------------------------------------------------------------------------
//
// Estos no se dejan engañar ni por comentarios, ni por cadenas, ni por un
// nombre parecido metido en medio de otra palabra. Cuando un paso pide "declara
// un ref llamado sombreros", esto comprueba exactamente eso.

/**
 * Que exista una variable con ese nombre y, si se pide, inicializada llamando a
 * algo concreto (ref, computed, defineStore…).
 *   scriptDeclara('sombreros', { llamando: 'ref', con: 'array' })
 */
export function scriptDeclara(nombre, { llamando, con, falta, malo } = {}) {
  return (script) => {
    const encontradas = variables(script)
    const suya = encontradas.find((v) => v.nombre === nombre)

    if (!suya) {
      const otras = encontradas.map((v) => v.nombre).filter(Boolean)
      return (
        falta ||
        `No encuentro ninguna variable llamada «${nombre}» en el script.${
          otras.length ? ` Tienes: ${otras.slice(0, 6).join(', ')}.` : ''
        }`
      )
    }

    if (llamando && suya.llamando !== llamando) {
      return (
        malo ||
        `«${nombre}» existe, pero no se crea con ${llamando}(…)${
          suya.llamando ? `, sino con ${suya.llamando}(…)` : ''
        }.`
      )
    }

    if (con) {
      const primero = suya.argumentos[0]
      const esperado = {
        array: 'ArrayExpression',
        objeto: 'ObjectExpression',
        texto: 'Literal',
        numero: 'Literal',
        funcion: ['ArrowFunctionExpression', 'FunctionExpression'],
      }[con]

      const tipos = Array.isArray(esperado) ? esperado : [esperado]
      const encaja =
        primero &&
        tipos.includes(primero.type) &&
        (con !== 'array' || primero.type === 'ArrayExpression') &&
        (con !== 'texto' || typeof primero.value === 'string') &&
        (con !== 'numero' || typeof primero.value === 'number')

      if (!encaja) {
        return malo || `A «${nombre}» hay que pasarle ${con === 'array' ? 'un array' : `un ${con}`}.`
      }
    }

    return null
  }
}

/** Que exista una función con ese nombre (declarada, flecha o método). */
export function scriptDefine(nombre, { falta } = {}) {
  return (script) => {
    const nombres = funciones(script)
    if (nombres.includes(nombre)) return null
    return (
      falta ||
      `Falta la función «${nombre}»${
        nombres.length ? `. Tienes: ${nombres.slice(0, 6).join(', ')}.` : ' en el script.'
      }`
    )
  }
}

/**
 * Que se llame a algo. Acepta nombre simple ('ref') o con punto
 * ('localStorage.setItem'). Con `dentroDe` se exige que la llamada esté dentro
 * de una función concreta.
 */
export function scriptLlama(nombre, { dentroDe, veces, falta } = {}) {
  return (script) => {
    const texto = dentroDe ? cuerpoDe(script, dentroDe) : String(script || '')

    if (dentroDe && texto === null) {
      return `Falta la función «${dentroDe}».`
    }

    const encontradas = llamadas(texto).filter((l) => l.nombre === nombre)

    if (!encontradas.length) {
      return (
        falta ||
        `No veo ninguna llamada a ${nombre}(…)${dentroDe ? ` dentro de «${dentroDe}»` : ''}.`
      )
    }

    if (veces && encontradas.length < veces) {
      return `${nombre}(…) aparece ${encontradas.length} vez${
        encontradas.length === 1 ? '' : 'es'
      } y hacen falta ${veces}.`
    }

    return null
  }
}

/** Que se importe ese nombre desde ese sitio. */
export function scriptImporta(nombre, de, { falta } = {}) {
  return (script) => {
    if (importa(script, nombre, de)) return null
    return falta || `Falta el import de ${nombre}${de ? ` desde '${de}'` : ''}.`
  }
}

// ---------------------------------------------------------------------------
// Buscar en la plantilla y en otros ficheros
// ---------------------------------------------------------------------------
//
// Estos dos estaban copiados a mano en diecinueve mundos, cada uno con su
// versión. Ahora viven aquí y quitan los comentarios antes de buscar: comentar
// la respuesta no puede aprobar un paso.

/** Quita comentarios de JS, de HTML y de CSS, conservando las posiciones. */
export function sinComentariosDeNada(texto) {
  const fuente = String(texto || '')

  // Los de HTML y CSS se pueden quitar con seguridad: en HTML y en CSS no hay
  // cadenas donde `<!--` o `/*` signifiquen otra cosa que un comentario.
  const aEspacios = (todo) => todo.replace(/[^\n]/g, ' ')
  let limpio = fuente
    .replace(/<!--[\s\S]*?-->/g, aEspacios)
    .replace(/\/\*[\s\S]*?\*\//g, aEspacios)

  // Y los de JavaScript, con el parser, solo dentro del bloque <script>.
  const bloque = limpio.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (bloque) {
    const dentro = bloque[1]
    const desde = limpio.indexOf(dentro)
    limpio = limpio.slice(0, desde) + sinComentarios(dentro) + limpio.slice(desde + dentro.length)
  } else {
    limpio = sinComentarios(limpio)
  }

  return limpio
}

/**
 * Que la PLANTILLA del .vue contenga algo. Se busca sobre el texto de la
 * plantilla (las llaves dobles y las directivas no sobreviven al DOMParser),
 * sin sus comentarios.
 */
export function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) =>
    patron.test(sinComentariosDeNada(partido?.template || '')) ? null : mensaje
}

/**
 * Que OTRO fichero del proyecto contenga algo. Para los mundos de varios
 * ficheros: el hijo, el router, el store, main.js.
 */
export function ficheroContiene(ruta, patron, mensaje) {
  return (_doc, ficheros) => {
    const contenido = ficheros?.[ruta]
    if (contenido === undefined) return `Falta el fichero ${ruta}.`
    return patron.test(sinComentariosDeNada(contenido)) ? null : mensaje
  }
}

/** Que el script compile. Da el error real y la línea. */
export function scriptCompila({ falta } = {}) {
  return (script) => {
    const { ok, error, linea } = analizar(script)
    if (ok) return null
    return (
      falta ||
      `El script no compila: ${error}${linea ? ` (línea ${linea} del bloque script)` : ''}.`
    )
  }
}

/** Encadena comprobaciones ya armadas. Útil cuando un paso toca HTML y CSS. */
export function comprobarTodo(...comprobaciones) {
  return async (ficheros, respuesta) => {
    for (const comprobar of comprobaciones) {
      const resultado = await comprobar(ficheros, respuesta)
      if (!resultado.superado) return resultado
    }
    // El mensaje bueno es el del último: es el que cierra el paso.
    const ultimo = comprobaciones[comprobaciones.length - 1]
    return ultimo(ficheros, respuesta)
  }
}

// ---------------------------------------------------------------------------
// Requisitos de HTML
// ---------------------------------------------------------------------------

const cuenta = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`

/** Que existan al menos `minimo` elementos que encajen, con texto si se pide. */
export function hay(selector, { minimo = 1, conTexto = false, falta, pocos } = {}) {
  return (doc) => {
    let encontrados = buscarTodos(doc, selector)
    if (conTexto) encontrados = encontrados.filter((nodo) => textoDe(nodo))

    if (!encontrados.length) {
      return falta || `Todavía no hay ningún ${selector}${conTexto ? ' con texto' : ''}.`
    }
    if (encontrados.length < minimo) {
      return pocos
        ? pocos(encontrados.length, minimo)
        : `Llevas ${cuenta(encontrados.length, 'de ' + minimo, 'de ' + minimo)}.`
    }
    return null
  }
}

/** Que no haya más de `maximo`. Sirve para "solo puede haber un <main>". */
export function comoMucho(selector, maximo, mensaje) {
  return (doc) => {
    const cuantos = buscarTodos(doc, selector).length
    if (cuantos > maximo) {
      return typeof mensaje === 'function' ? mensaje(cuantos) : mensaje
    }
    return null
  }
}

/** Que el hijo esté DENTRO del padre, no suelto por ahí. */
export function dentro(padre, hijo, { minimo = 1, conTexto = true, falta, fuera } = {}) {
  return (doc) => {
    let dentroDe = buscarTodos(doc, `${padre} ${hijo}`)
    if (conTexto) dentroDe = dentroDe.filter((nodo) => textoDe(nodo))

    if (dentroDe.length >= minimo) return null

    // Distinguir "no existe" de "existe pero está fuera" es la diferencia
    // entre un mensaje útil y uno que no dice nada.
    let sueltos = buscarTodos(doc, hijo)
    if (conTexto) sueltos = sueltos.filter((nodo) => textoDe(nodo))

    if (sueltos.length && !dentroDe.length) {
      return fuera || `Hay un ${hijo}, pero está fuera del ${padre}. Tiene que ir dentro.`
    }
    return falta || `Falta un ${hijo} con texto dentro del ${padre}.`
  }
}

/** Que el texto de un elemento tenga al menos tantos caracteres. */
export function textoDeAlMenos(selector, minimo, { falta, corto } = {}) {
  return (doc) => {
    const nodo = buscarTodos(doc, selector).find((n) => textoDe(n))
    if (!nodo) return falta || `No encuentro ningún ${selector} con texto.`

    const largo = textoDe(nodo).length
    if (largo < minimo) {
      return corto
        ? corto(largo, minimo)
        : `Se queda corto: ${largo} caracteres de los ${minimo} que pide.`
    }
    return null
  }
}

/** Que el texto haya cambiado respecto a lo que venía sembrado. */
export function cambiadoRespectoA(selector, original, { falta, igual } = {}) {
  return (doc) => {
    const nodo = buscarTodos(doc, selector)[0]
    const texto = textoDe(nodo)

    if (!texto) return falta || `El ${selector} se ha quedado sin texto, o ya no está.`
    if (texto === original) return igual || `Sigue diciendo «${original}». Pon otra cosa.`
    return null
  }
}

/** Que un atributo exista y, si se pide, encaje con un patrón. */
export function atributo(selector, nombre, { patron, falta, malo } = {}) {
  return (doc) => {
    const nodo = buscarTodos(doc, selector)[0]
    if (!nodo) return falta || `No encuentro ningún ${selector}.`

    const valor = nodo.getAttribute(nombre)
    if (valor === null) return falta || `A ${selector} le falta el atributo ${nombre}.`

    if (patron && !patron.test(valor)) {
      return typeof malo === 'function'
        ? malo(valor)
        : malo || `El ${nombre} vale "${valor}" y no es lo que se pide.`
    }
    return null
  }
}

/** Que todos los elementos que encajen tengan texto distinto entre sí. */
export function sinRepetir(selector, { mensaje } = {}) {
  return (doc) => {
    const textos = buscarTodos(doc, selector)
      .map((nodo) => textoDe(nodo).toLowerCase())
      .filter(Boolean)

    if (new Set(textos).size < textos.length) {
      return mensaje || 'Hay textos repetidos. Que cada uno sea distinto.'
    }
    return null
  }
}

/** Que exista un fichero, y con contenido. */
export function existeFichero(ruta, { falta, vacio } = {}) {
  return (_doc, ficheros) => {
    const contenido = ficheros?.[ruta]
    if (contenido === undefined) return falta || `No existe ningún fichero llamado ${ruta}.`
    if (!String(contenido).trim()) return vacio || `El fichero ${ruta} existe pero está vacío.`
    return null
  }
}

// ---------------------------------------------------------------------------
// Requisitos de CSS
// ---------------------------------------------------------------------------

/** Que haya alguna regla para ese selector. */
export function hayRegla(selector, { falta } = {}) {
  return (reglas) => {
    if (!reglasPara(reglas, selector).length) {
      return falta || `Todavía no hay ninguna regla para ${selector}.`
    }
    return null
  }
}

/** Que se declare una propiedad, y si se pide que su valor encaje. */
export function declara(selector, propiedad, { patron, falta, malo } = {}) {
  return (reglas) => {
    const valor = valorDe(reglas, selector, propiedad)
    if (!valor) return falta || `A ${selector} le falta ${propiedad}.`

    if (patron && !patron.test(valor)) {
      return typeof malo === 'function'
        ? malo(valor)
        : malo || `${selector} tiene "${propiedad}: ${valor}", que no es lo que hace falta aquí.`
    }
    return null
  }
}

/** Que se declare al menos una de varias. Sirve para padding / padding-top. */
export function declaraAlguna(selector, propiedades, { falta } = {}) {
  return (reglas) => {
    if (!tieneAlguna(reglas, selector, propiedades)) {
      return falta || `A ${selector} le falta ${propiedades[0]}.`
    }
    return null
  }
}

/** Que haya una regla dentro de una @media, y que toque a ese selector. */
export function enMedia(selector, propiedad, { condicion = /max-width/i, falta, malo } = {}) {
  const patronSelector = new RegExp(
    `(^|[\\s>+~])${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[\\s>+~:,.])`,
  )

  return (reglas) => {
    const dentroDeMedia = reglas.filter((regla) => regla.condicion)
    if (!dentroDeMedia.length) return falta || 'No hay ninguna @media en el fichero.'

    const buenas = dentroDeMedia.filter((regla) => condicion.test(regla.condicion))
    if (!buenas.length) {
      return 'Hay una @media, pero no con la condición que pide el paso.'
    }

    const delSelector = buenas.filter((regla) => patronSelector.test(` ${regla.selector} `))
    if (!delSelector.length) {
      return `Dentro de la @media no hay ninguna regla para ${selector}.`
    }

    const valor = delSelector.map((regla) => regla.declaraciones[propiedad]).filter(Boolean).pop()
    if (!valor) return `La regla está, pero no cambia ${propiedad}.`

    return malo ? malo(valor) : null
  }
}
