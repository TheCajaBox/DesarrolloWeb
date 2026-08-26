// Ejecuta el JavaScript que escribe el alumno, de verdad, contra su propio
// HTML.
//
// El principio del temario es "ejecutar y mirar el resultado, no adivinar".
// Comprobar JavaScript leyendo el texto con expresiones regulares seria
// mentira: aprobaria codigo que no funciona y suspenderia codigo que si.
//
// Aqui se construye un documento con su HTML, se le pasa su script, y despues
// se mira que ha quedado. Es exactamente lo que va a ver en la vista previa.
//
// El problema serio de ejecutar codigo ajeno en el hilo principal es el bucle
// infinito: no hay forma de interrumpir codigo sincrono una vez arranca. Por
// eso el codigo se instrumenta antes: se le mete un contador dentro de cada
// bucle, y al pasarse revienta con un error que se puede explicar.

import { parse } from 'acorn'

export const LIMITE_VUELTAS = 200000

export class ErrorDeCodigo extends Error {
  constructor(mensaje, { linea = null, tipo = 'ejecucion' } = {}) {
    super(mensaje)
    this.name = 'ErrorDeCodigo'
    this.linea = linea
    this.tipo = tipo
  }
}

const TIPOS_DE_BUCLE = ['WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForOfStatement', 'ForInStatement']

// Recorre el arbol sin dependencias extra: acorn-walk seria otro paquete para
// algo que aqui son veinte lineas.
function recorrer(nodo, visitar) {
  if (!nodo || typeof nodo.type !== 'string') return
  visitar(nodo)

  for (const clave of Object.keys(nodo)) {
    if (clave === 'type' || clave === 'start' || clave === 'end') continue
    const valor = nodo[clave]
    if (Array.isArray(valor)) valor.forEach((hijo) => recorrer(hijo, visitar))
    else if (valor && typeof valor.type === 'string') recorrer(valor, visitar)
  }
}

// Mete el contador dentro de cada bucle. Se hace pegando texto usando las
// posiciones que da el AST, en vez de regenerar el codigo: asi el resultado
// sigue siendo el codigo del alumno, con sus numeros de linea intactos.
export function instrumentar(codigo) {
  let arbol
  try {
    arbol = parse(codigo, { ecmaVersion: 2022, locations: true })
  } catch (error) {
    throw new ErrorDeCodigo(error.message, { linea: error.loc?.line ?? null, tipo: 'sintaxis' })
  }

  const inserciones = []

  recorrer(arbol, (nodo) => {
    if (!TIPOS_DE_BUCLE.includes(nodo.type)) return
    const cuerpo = nodo.body
    if (!cuerpo) return

    if (cuerpo.type === 'BlockStatement') {
      // Justo despues de la llave de apertura.
      inserciones.push({ posicion: cuerpo.start + 1, texto: '__vuelta();' })
    } else {
      // Bucle de una sola sentencia sin llaves: se envuelve.
      inserciones.push({ posicion: cuerpo.start, texto: '{__vuelta();' })
      inserciones.push({ posicion: cuerpo.end, texto: '}' })
    }
  })

  inserciones.sort((a, b) => b.posicion - a.posicion)

  let salida = codigo
  for (const { posicion, texto } of inserciones) {
    salida = salida.slice(0, posicion) + texto + salida.slice(posicion)
  }

  return salida
}

function crearContador(limite) {
  let vueltas = 0
  return () => {
    vueltas += 1
    if (vueltas > limite) {
      throw new ErrorDeCodigo(
        `Tu código ha dado más de ${limite.toLocaleString('es')} vueltas. Casi seguro que hay un bucle que no termina nunca.`,
        { tipo: 'bucle' },
      )
    }
  }
}

/**
 * Ejecuta el codigo contra un documento ya construido.
 *
 * Devuelve lo que ha pasado: lo que se imprimio por consola, si reventó, y el
 * propio documento para poder mirarlo despues.
 */
export function ejecutar(codigo, documento, { limite = LIMITE_VUELTAS, extras = {}, capturar = null } = {}) {
  const consola = []
  const registrar = (nivel) => (...partes) => {
    consola.push({
      nivel,
      texto: partes
        .map((parte) => {
          if (typeof parte === 'string') return parte
          try {
            return JSON.stringify(parte)
          } catch {
            return String(parte)
          }
        })
        .join(' '),
    })
  }

  const falsaConsola = {
    log: registrar('log'),
    info: registrar('info'),
    warn: registrar('aviso'),
    error: registrar('error'),
  }

  let error = null
  let capturado

  try {
    let cuerpo = instrumentar(codigo)

    // `capturar` permite mirar una variable que ha declarado el alumno, para
    // poder comprobar sus datos y no solo lo que se ve en pantalla. Se anade
    // un return al final del cuerpo de la funcion; si la variable no existe,
    // devuelve undefined en vez de reventar.
    if (capturar) {
      cuerpo += `\n;return typeof ${capturar} === "undefined" ? undefined : ${capturar};`
    }

    // `fetch` siempre esta definido, aunque nadie lo pase: si no, el codigo
    // del alumno usaria el del navegador y saldria a la red de verdad. Por
    // defecto contesta 404 a todo, que es inofensivo y ademas es la verdad.
    const conFetch = 'fetch' in extras ? extras : { ...extras, fetch: crearFetchFalso({}) }

    const nombres = ['document', 'console', '__vuelta', ...Object.keys(conFetch)]
    const valores = [documento, falsaConsola, crearContador(limite), ...Object.values(conFetch)]

    // eslint-disable-next-line no-new-func
    const fabricar = new Function(...nombres, `"use strict";\n${cuerpo}`)
    capturado = fabricar(...valores)
  } catch (fallo) {
    error =
      fallo instanceof ErrorDeCodigo
        ? fallo
        : new ErrorDeCodigo(fallo?.message ? String(fallo.message) : String(fallo), {
            tipo: fallo?.name === 'SyntaxError' ? 'sintaxis' : 'ejecucion',
          })
  }

  return { consola, error, documento, capturado }
}

// Lo que se imprimio por consola, en texto plano y sin niveles.
export function lineasDeConsola(resultado) {
  return (resultado?.consola || []).map((entrada) => entrada.texto)
}

/**
 * Monta la pagina del alumno (su HTML mas su JavaScript) y la deja lista para
 * mirarla. Es lo que usan los mundos de JavaScript para comprobar.
 *
 * Despues de ejecutar, dispara DOMContentLoaded: mucha gente envuelve su
 * codigo en ese evento, y sin esto pareceria que su codigo no hace nada.
 */
export function ejecutarPagina(html, codigo, opciones = {}) {
  const documento = new DOMParser().parseFromString(String(html ?? ''), 'text/html')
  const resultado = ejecutar(String(codigo ?? ''), documento, opciones)

  if (!resultado.error) {
    try {
      documento.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }))
    } catch {
      // Si el entorno no deja disparar eventos, se sigue: lo que no use
      // DOMContentLoaded funciona igual.
    }
  }

  return resultado
}

/**
 * Un `fetch` que sirve los ficheros del propio proyecto del alumno.
 *
 * Es lo que permite ensenar carga de datos de verdad sin salir del navegador:
 * su codigo escribe `fetch("sombreros.json")` exactamente como lo escribiria
 * en produccion, y aqui se le responde con su fichero. Cuando pida algo que no
 * existe, recibe un 404 de verdad, con su `ok` a false.
 */
export function crearFetchFalso(ficheros = {}) {
  return function fetchFalso(recurso) {
    const ruta = String(recurso || '').replace(/^\.?\//, '').split('?')[0]
    const contenido = ficheros[ruta]

    if (contenido === undefined) {
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: ruta,
        text: () => Promise.resolve(''),
        json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
      })
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      url: ruta,
      text: () => Promise.resolve(String(contenido)),
      json: () =>
        new Promise((resolver, rechazar) => {
          try {
            resolver(JSON.parse(String(contenido)))
          } catch (error) {
            // El mismo error que daria el navegador con un JSON mal escrito.
            rechazar(new SyntaxError(error.message))
          }
        }),
    })
  }
}

// Deja que se resuelvan las promesas pendientes del codigo del alumno. Hace
// falta porque `ejecutar` es sincrono: arranca el codigo y vuelve, pero un
// fetch termina despues.
export async function dejarQueTermine(vueltas = 8) {
  for (let i = 0; i < vueltas; i += 1) {
    await new Promise((resolver) => setTimeout(resolver, 0))
  }
}

// Pulsa un elemento y devuelve si existia. Se usa para comprobar que los
// manejadores de eventos del alumno hacen algo de verdad.
export function pulsar(documento, selector) {
  const elemento = documento?.querySelector?.(selector)
  if (!elemento) return false

  try {
    elemento.click()
  } catch {
    elemento.dispatchEvent(new Event('click', { bubbles: true }))
  }
  return true
}
