// Lectura del HTML del alumno, con el parser del navegador.
//
// Decision importante: se comprueba lo que el navegador ENTENDIO, no lo que se
// escribio. Si alguien deja un <article> sin cerrar, el navegador lo cierra
// solo y pinta algo; lo honrado es comprobar contra ese resultado, porque es
// lo que la persona esta viendo en la vista previa.
//
// Es la misma idea que en critica-esquema.js, que lee la base con PRAGMA en
// vez de analizar el CREATE TABLE: preguntarle al motor, no adivinar.
//
// Nada de expresiones regulares sobre el fuente: un salto de linea, un
// atributo de mas o un comentario en medio no pueden tumbar un paso resuelto.

export function leerHtml(texto) {
  const parser = new DOMParser()
  return parser.parseFromString(String(texto ?? ''), 'text/html')
}

// Texto visible, ya sin etiquetas y con los espacios normalizados igual que
// hace el navegador al pintarlo.
export function textoDe(nodo) {
  if (!nodo) return ''
  return String(nodo.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function buscar(doc, selector) {
  try {
    return doc.querySelector(selector)
  } catch {
    return null
  }
}

export function buscarTodos(doc, selector) {
  try {
    return [...doc.querySelectorAll(selector)]
  } catch {
    return []
  }
}

export function contar(doc, selector) {
  return buscarTodos(doc, selector).length
}

// Texto del primer elemento que encaje. Cadena vacia si no hay ninguno o si
// esta vacio, que para el caso viene a ser lo mismo.
export function textoDel(doc, selector) {
  return textoDe(buscar(doc, selector))
}

// Si un elemento tiene contenido de verdad, y no solo espacios.
export function tieneTexto(doc, selector) {
  return textoDel(doc, selector).length > 0
}

// Elementos que contienen a otro. Sirve para "un <p> DENTRO del <article>".
export function dentroDe(doc, contenedor, hijo) {
  return buscarTodos(doc, `${contenedor} ${hijo}`)
}

export function atributo(doc, selector, nombre) {
  const nodo = buscar(doc, selector)
  return nodo ? nodo.getAttribute(nombre) : null
}
