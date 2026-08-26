import { describe, expect, it } from 'vitest'
import {
  atributo,
  cambiadoRespectoA,
  comoMucho,
  comprobarCss,
  comprobarHtml,
  comprobarTodo,
  declara,
  declaraAlguna,
  dentro,
  enMedia,
  existeFichero,
  hay,
  hayRegla,
  sinRepetir,
  textoDeAlMenos,
} from '../src/contenido/mundos/comprobaciones.js'

// De estos ladrillos van a salir cientos de pasos, así que un fallo aquí es un
// fallo repetido cien veces.

const conHtml = (html) => ({ 'index.html': html })
const conCss = (css) => ({ 'css/estilos.css': css })

describe('comprobarHtml', () => {
  const comprobar = comprobarHtml({
    requisitos: [hay('article'), dentro('article', 'h2')],
    exito: 'Perfecto.',
  })

  it('se supera cuando todo encaja', () => {
    const r = comprobar(conHtml('<article><h2>Hola</h2></article>'))
    expect(r.superado).toBe(true)
    expect(r.mensaje).toBe('Perfecto.')
  })

  // Los requisitos van en orden a propósito: primero lo básico.
  it('gana el primer requisito que falla', () => {
    const r = comprobar(conHtml('<p>nada</p>'))
    expect(r.superado).toBe(false)
    expect(r.mensaje).toContain('article')
  })

  it('el mensaje de éxito puede depender del documento', () => {
    const conNombre = comprobarHtml({
      requisitos: [hay('h1')],
      exito: (doc) => `Pone «${doc.querySelector('h1').textContent}».`,
    })
    expect(conNombre(conHtml('<h1>Sombreros</h1>')).mensaje).toContain('Sombreros')
  })

  it('con basura no revienta', () => {
    for (const basura of [{}, conHtml(''), conHtml(null), conHtml('<<<')]) {
      expect(() => comprobar(basura)).not.toThrow()
      expect(comprobar(basura).superado).toBe(false)
    }
  })
})

describe('requisitos de HTML', () => {
  it('hay cuenta y avisa de cuántos faltan', () => {
    const tres = comprobarHtml({
      requisitos: [hay('article', { minimo: 3, pocos: (n, m) => `van ${n} de ${m}` })],
      exito: 'ok',
    })
    expect(tres(conHtml('<article>a</article>')).mensaje).toBe('van 1 de 3')
    expect(tres(conHtml('<article>a</article><article>b</article><article>c</article>')).superado).toBe(true)
  })

  it('hay con conTexto no cuenta los vacíos', () => {
    const con = comprobarHtml({ requisitos: [hay('h2', { conTexto: true })], exito: 'ok' })
    expect(con(conHtml('<h2></h2>')).superado).toBe(false)
    expect(con(conHtml('<h2>   </h2>')).superado).toBe(false)
    expect(con(conHtml('<h2>algo</h2>')).superado).toBe(true)
  })

  it('comoMucho limita por arriba', () => {
    const uno = comprobarHtml({
      requisitos: [comoMucho('main', 1, (n) => `hay ${n} y solo cabe uno`)],
      exito: 'ok',
    })
    expect(uno(conHtml('<main>a</main>')).superado).toBe(true)
    expect(uno(conHtml('<main>a</main><main>b</main>')).mensaje).toBe('hay 2 y solo cabe uno')
  })

  // Lo que hace útil el mensaje: distinguir "no existe" de "está fuera".
  it('dentro distingue el que falta del que está fuera', () => {
    const c = comprobarHtml({
      requisitos: [dentro('article', 'p', { falta: 'no hay p', fuera: 'el p está fuera' })],
      exito: 'ok',
    })
    expect(c(conHtml('<article></article>')).mensaje).toBe('no hay p')
    expect(c(conHtml('<article></article><p>suelto</p>')).mensaje).toBe('el p está fuera')
    expect(c(conHtml('<article><p>dentro</p></article>')).superado).toBe(true)
  })

  it('textoDeAlMenos mide de verdad', () => {
    const c = comprobarHtml({
      requisitos: [textoDeAlMenos('p', 20, { corto: (n, m) => `${n} de ${m}` })],
      exito: 'ok',
    })
    expect(c(conHtml('<p>corto</p>')).mensaje).toBe('5 de 20')
    expect(c(conHtml('<p>esto ya tiene bastantes caracteres</p>')).superado).toBe(true)
  })

  it('cambiadoRespectoA detecta que sigue igual', () => {
    const c = comprobarHtml({
      requisitos: [cambiadoRespectoA('title', 'Cambia esto', { igual: 'sigue igual' })],
      exito: 'ok',
    })
    expect(c(conHtml('<title>Cambia esto</title>')).mensaje).toBe('sigue igual')
    expect(c(conHtml('<title>Lo mío</title>')).superado).toBe(true)
    expect(c(conHtml('<title></title>')).superado).toBe(false)
  })

  it('atributo comprueba existencia y patrón', () => {
    const c = comprobarHtml({
      requisitos: [
        atributo('link', 'href', { patron: /estilos\.css$/, malo: (v) => `apunta a ${v}` }),
      ],
      exito: 'ok',
    })
    expect(c(conHtml('<link href="css/estilos.css">')).superado).toBe(true)
    expect(c(conHtml('<link href="otro.css">')).mensaje).toBe('apunta a otro.css')
    expect(c(conHtml('<link>')).superado).toBe(false)
  })

  it('sinRepetir caza el copia y pega', () => {
    const c = comprobarHtml({
      requisitos: [sinRepetir('h2', { mensaje: 'repetidos' })],
      exito: 'ok',
    })
    expect(c(conHtml('<h2>A</h2><h2>a</h2>')).mensaje).toBe('repetidos')
    expect(c(conHtml('<h2>A</h2><h2>B</h2>')).superado).toBe(true)
  })

  it('existeFichero distingue el que falta del vacío', () => {
    const c = comprobarHtml({
      requisitos: [existeFichero('app.js', { falta: 'no existe', vacio: 'está vacío' })],
      exito: 'ok',
    })
    expect(c({}).mensaje).toBe('no existe')
    expect(c({ 'app.js': '   ' }).mensaje).toBe('está vacío')
    expect(c({ 'app.js': 'const a = 1' }).superado).toBe(true)
  })
})

describe('comprobarCss', () => {
  it('encuentra la hoja en cualquiera de las rutas', () => {
    const c = comprobarCss({ requisitos: [hayRegla('body')], exito: 'ok' })
    expect(c({ 'css/estilos.css': 'body { color: red }' }).superado).toBe(true)
    expect(c({ 'estilos.css': 'body { color: red }' }).superado).toBe(true)
    expect(c({}).superado).toBe(false)
  })

  it('declara comprueba propiedad y valor', () => {
    const c = comprobarCss({
      requisitos: [declara('.rejilla', 'display', { patron: /grid/, malo: (v) => `tiene ${v}` })],
      exito: 'ok',
    })
    expect(c(conCss('.rejilla { display: grid }')).superado).toBe(true)
    expect(c(conCss('.rejilla { display: flex }')).mensaje).toBe('tiene flex')
    expect(c(conCss('.rejilla { gap: 1rem }')).superado).toBe(false)
  })

  it('declaraAlguna acepta las variantes', () => {
    const c = comprobarCss({
      requisitos: [declaraAlguna('article', ['padding', 'padding-top', 'padding-block'])],
      exito: 'ok',
    })
    expect(c(conCss('article { padding: 1rem }')).superado).toBe(true)
    expect(c(conCss('article { padding-block: 1rem }')).superado).toBe(true)
    expect(c(conCss('article { margin: 1rem }')).superado).toBe(false)
  })

  it('enMedia mira dentro de la consulta y valida el valor', () => {
    const c = comprobarCss({
      requisitos: [
        enMedia('.rejilla', 'grid-template-columns', {
          malo: (v) => (/repeat/.test(v) ? `sigue con ${v}` : null),
        }),
      ],
      exito: 'ok',
    })

    expect(c(conCss('.rejilla { display: grid }')).mensaje).toContain('@media')
    expect(
      c(conCss('@media (min-width: 40rem) { .rejilla { grid-template-columns: 1fr } }')).mensaje,
    ).toContain('condición')
    expect(
      c(conCss('@media (max-width: 40rem) { body { margin: 0 } }')).mensaje,
    ).toContain('.rejilla')
    expect(
      c(conCss('@media (max-width: 40rem) { .rejilla { grid-template-columns: repeat(2, 1fr) } }'))
        .mensaje,
    ).toContain('sigue con')
    expect(
      c(conCss('@media (max-width: 40rem) { .rejilla { grid-template-columns: 1fr } }')).superado,
    ).toBe(true)
  })
})

describe('comprobarTodo', () => {
  const html = comprobarHtml({ requisitos: [hay('article')], exito: 'html bien' })
  const css = comprobarCss({ requisitos: [hayRegla('article')], exito: 'y css bien' })
  const ambas = comprobarTodo(html, css)

  it('falla en la primera que no pase', async () => {
    const r = await ambas({ 'index.html': '<p>x</p>' })
    expect(r.superado).toBe(false)
    expect(r.mensaje).toContain('article')
  })

  it('se supera cuando pasan todas, con el mensaje de la última', async () => {
    const r = await ambas({
      'index.html': '<article>a</article>',
      'css/estilos.css': 'article { padding: 1rem }',
    })
    expect(r.superado).toBe(true)
    expect(r.mensaje).toBe('y css bien')
  })
})
