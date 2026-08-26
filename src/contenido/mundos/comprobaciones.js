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

  return (ficheros) => {
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

    for (const requisito of script) {
      const problema = requisito(partido.script || '', ficheros, partido)
      if (problema) return { superado: false, mensaje: problema }
    }

    return { superado: true, mensaje: typeof exito === 'function' ? exito(partido) : exito }
  }
}

/**
 * Requisito de <script>: que aparezca algo. Empieza simple (busca un patrón en
 * el texto del script). Cuando haga falta afinar, se cambia por un análisis con
 * acorn sin tocar los mundos que lo usen.
 */
export function scriptContiene(patron, { falta } = {}) {
  return (script) => {
    if (!patron.test(String(script || ''))) {
      return falta || 'Al <script> le falta algo que este paso pide.'
    }
    return null
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
