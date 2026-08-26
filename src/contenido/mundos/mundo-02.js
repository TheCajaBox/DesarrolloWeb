// Mundo 2 — Etiquetas: decir qué es cada cosa.
//
// Aqui empieza el catalogo de sombreros de verdad. Se pasa de "escribir texto"
// a "marcar que es cada trozo de texto", que es el salto conceptual gordo del
// HTML. Todo lo demas del temario se apoya en que esto se entienda.
//
// Dialogos originales, en el registro de los personajes.

import { buscarTodos, dentroDe, leerHtml, textoDe, textoDel } from '../../motor/leer-html.js'

const fichasCompletas = (doc) =>
  buscarTodos(doc, 'article').filter(
    (ficha) => textoDe(ficha.querySelector('h2')) && textoDe(ficha.querySelector('p')),
  )

export default {
  numero: 2,
  acto: 'Qué es todo esto',
  titulo: 'Mundo 2 · Decir qué es cada cosa',

  entradilla: {
    quien: 'wayne',
    texto:
      'Vamos a montar un catálogo de sombreros. Y antes de que preguntes: sí, hacía falta. ' +
      'La gente lleva sombreros toda su vida sin pararse a pensar en ninguno, y así nos va.',
  },

  ficheros: {
    'index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
  </head>
  <body>

    <h1>Sombreros</h1>

    <!-- Aquí debajo va tu primera ficha. -->

  </body>
</html>
`,
  },

  // Solución de referencia: solo la usan las pruebas, para verificar que el
  // mundo se puede terminar de verdad.
  solucion: {
    'index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
  </head>
  <body>

    <h1>Sombreros</h1>

    <main>
      <article>
        <h2>El de siempre</h2>
        <p>Marrón, con el ala vencida por el lado izquierdo. No es el mejor del mundo.</p>
      </article>

      <article>
        <h2>Hongo de contable</h2>
        <p>Duro, redondo y respetable. Te lo pones y te hablan de impuestos.</p>
      </article>

      <article>
        <h2>El de las bodas</h2>
        <p>Gris perla, impecable, con una mancha detrás que no ha visto nadie.</p>
      </article>
    </main>

  </body>
</html>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Una etiqueta no dibuja: significa',
    cuerpo: `Esto es lo primero que hay que quitarse de la cabeza: las etiquetas no sirven para que las cosas se vean de una manera.

\`<h1>\` no significa "ponme esto grande y en negrita". Significa "esto es el título principal de esta página". Que salga grande es una consecuencia, y una que cambiaremos en cuanto lleguemos al CSS.

La diferencia parece filosófica y es tremendamente práctica. Tres motivos:

1. **Quien no ve la pantalla.** Un lector de pantalla anuncia los encabezados y permite saltar de uno a otro para orientarse, igual que tú recorres una página con la vista buscando los títulos. Si usaste \`<h1>\` porque querías letra grande, esa persona oye "título principal" donde solo había un adorno, y se pierde.
2. **Quien no eres tú.** Los buscadores, los lectores de artículos, los programas que resumen páginas: todos leen la estructura, ninguno mira los tamaños.
3. **Tú, dentro de seis meses.** Un documento bien etiquetado se entiende de un vistazo. Uno lleno de \`<div>\` hay que leerlo entero para saber qué es cada cosa.

**Las que vas a usar constantemente:**

- \`<h1>\` a \`<h6>\` — encabezados, por orden de importancia. Un \`<h1>\` por página. No se saltan niveles: después de un \`<h2>\` no viene un \`<h4>\`.
- \`<p>\` — un párrafo de texto.
- \`<article>\` — algo que tiene sentido por sí solo. La prueba: si lo sacas de la página y lo pegas en otro sitio, ¿sigue significando algo? Una ficha de sombrero, sí. Un menú de navegación, no.
- \`<section>\` — una parte de un todo, normalmente con su encabezado. Un capítulo.
- \`<main>\` — el contenido principal. Uno por página, y no incluye la cabecera ni el pie.
- \`<ul>\` y \`<li>\` — una lista y sus elementos.

**Y la que sobra:** \`<div>\`. Un \`<div>\` no significa nada. Existe para cuando necesitas envolver algo por motivos de maquetación y ninguna etiqueta con significado encaja. Es legítimo usarlo. Lo que no es legítimo es usarlo cuando sí había una que encajaba.

**Ejemplo trabajado.** Una ficha de sombrero, mal:

    <div>
      <div>El de siempre</div>
      <div>Marrón, con el ala vencida.</div>
    </div>

Se ve. Funciona. Y no dice absolutamente nada sobre qué es. Bien:

    <article>
      <h2>El de siempre</h2>
      <p>Marrón, con el ala vencida.</p>
    </article>

Mismo resultado en pantalla, con la diferencia de que ahora cualquiera —una persona, un programa, tú mismo— sabe que eso es una ficha, que tiene un título y que tiene una descripción.

**Cómo elegir cuando dudes.** Pregúntate qué es ese trozo, en voz alta, sin usar palabras de aspecto. Si la respuesta es "un título", es un encabezado. Si es "una cosa entera con sentido propio", es un \`<article>\`. Si la única respuesta que se te ocurre es "una caja para poder moverla", entonces sí, es un \`<div>\`.`,
  },

  pasos: [
    {
      id: '2-1',
      titulo: 'La primera ficha',
      enunciado:
        'Debajo del comentario, escribe un <code>&lt;article&gt;</code> y, dentro, un <code>&lt;h2&gt;</code> con el nombre de un sombrero. El que quieras: real, inventado o robado.',
      pista: 'Una dentro de otra: <code>&lt;article&gt;&lt;h2&gt;Nombre&lt;/h2&gt;&lt;/article&gt;</code>. El <code>&lt;h2&gt;</code> va entre la apertura y el cierre del <code>&lt;article&gt;</code>.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')

        if (!buscarTodos(doc, 'article').length) {
          return { superado: false, mensaje: 'Todavía no hay ningún <article>.' }
        }

        const encabezados = dentroDe(doc, 'article', 'h2').filter((h) => textoDe(h))
        if (!encabezados.length) {
          if (buscarTodos(doc, 'h2').some((h) => textoDe(h))) {
            return {
              superado: false,
              mensaje: 'Hay un <h2> con texto, pero está fuera del <article>. Tiene que ir dentro.',
            }
          }
          return { superado: false, mensaje: 'Falta el <h2> con el nombre dentro del <article>.' }
        }

        return {
          superado: true,
          mensaje: `«${textoDe(encabezados[0])}». Anotado. Ya tienes una ficha.`,
        }
      },
    },

    {
      id: '2-2',
      titulo: 'Descríbelo',
      enunciado:
        'Un nombre solo no es un catálogo. Añade <strong>dentro del mismo <code>&lt;article&gt;</code></strong> un <code>&lt;p&gt;</code> describiendo el sombrero, con al menos veinte caracteres.',
      pista: 'Va después del <code>&lt;/h2&gt;</code> pero antes del <code>&lt;/article&gt;</code>.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')

        if (!buscarTodos(doc, 'article').length) {
          return { superado: false, mensaje: 'Primero necesitas el <article> del paso anterior.' }
        }

        const parrafos = dentroDe(doc, 'article', 'p').filter((p) => textoDe(p))
        if (!parrafos.length) {
          if (buscarTodos(doc, 'p').some((p) => textoDe(p))) {
            return {
              superado: false,
              mensaje: 'El <p> está fuera del <article>. La descripción es parte de la ficha, así que va dentro.',
            }
          }
          return { superado: false, mensaje: 'No hay ningún <p> con texto dentro del <article>.' }
        }

        const texto = textoDe(parrafos[0])
        if (texto.length < 20) {
          return {
            superado: false,
            mensaje: `Se queda corto: ${texto.length} caracteres de los 20 que pide. Cuéntame más de ese sombrero.`,
          }
        }

        return { superado: true, mensaje: 'Eso ya es una ficha de catálogo en condiciones.' }
      },
    },

    {
      id: '2-3',
      titulo: 'Que sean tres',
      enunciado:
        'Un catálogo con un sombrero no es un catálogo, es una foto. Repite la ficha hasta tener <strong>tres</strong> <code>&lt;article&gt;</code>, cada uno con su nombre y su descripción, y que no se llamen igual.',
      pista: 'Copiar y pegar y cambiar el texto. En el Mundo 8 veremos por qué a la larga esto no escala, pero hoy vale.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')
        const todas = buscarTodos(doc, 'article')
        const completas = fichasCompletas(doc)

        if (todas.length < 3) {
          return {
            superado: false,
            mensaje: `Llevas ${todas.length} ficha${todas.length === 1 ? '' : 's'} de las 3 que hacen falta.`,
          }
        }
        if (completas.length < 3) {
          return {
            superado: false,
            mensaje: `Hay ${todas.length} fichas, pero solo ${completas.length} tienen nombre y descripción.`,
          }
        }

        const nombres = completas.map((ficha) => textoDe(ficha.querySelector('h2')).toLowerCase())
        if (new Set(nombres).size < 3) {
          return { superado: false, mensaje: 'Hay nombres repetidos. Que cada sombrero sea distinto.' }
        }

        return { superado: true, mensaje: 'Tres sombreros. Esto ya empieza a parecerse a algo.' }
      },
    },

    {
      id: '2-4',
      titulo: 'Agrúpalas',
      enunciado:
        'Las tres fichas son el contenido principal de la página, pero ahora mismo están sueltas dentro del <code>&lt;body&gt;</code>. Envuélvelas en un <code>&lt;main&gt;</code>, todas juntas y sin meter dentro el <code>&lt;h1&gt;</code>.',
      pista: 'Abres <code>&lt;main&gt;</code> justo antes del primer <code>&lt;article&gt;</code> y lo cierras justo después del último.',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros['index.html'] || '')

        const contenedores = buscarTodos(doc, 'main')
        if (!contenedores.length) {
          return { superado: false, mensaje: 'Todavía no hay ningún <main>.' }
        }
        if (contenedores.length > 1) {
          return {
            superado: false,
            mensaje: `Hay ${contenedores.length} <main>. Solo puede haber uno por página: es el contenido principal, y solo hay uno.`,
          }
        }

        const dentro = dentroDe(doc, 'main', 'article').length
        const total = buscarTodos(doc, 'article').length

        if (dentro < total) {
          return {
            superado: false,
            mensaje: `${dentro} de ${total} fichas están dentro del <main>. Faltan por meter ${total - dentro}.`,
          }
        }
        if (dentro < 3) {
          return { superado: false, mensaje: 'Se han perdido fichas: tienen que seguir siendo tres.' }
        }

        if (dentroDe(doc, 'main', 'h1').length) {
          return {
            superado: false,
            mensaje: 'El <h1> se ha colado dentro del <main>. El título de la página no es contenido principal: es la cabecera.',
          }
        }

        if (!textoDel(doc, 'h1')) {
          return { superado: false, mensaje: 'Se ha perdido el <h1>.' }
        }

        return {
          superado: true,
          mensaje: 'Ahora hay una caja con las tres dentro. Eso va a hacer falta antes de lo que crees.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en que la página se ve casi igual que al empezar. No has cambiado el aspecto: has cambiado lo que la página dice de sí misma. ' +
      'Eso no se nota hoy. Se nota cuando alguien la lee con un lector de pantalla, cuando un buscador la indexa, ' +
      'y cuando dentro de un año tengas que tocarla y sepas qué es cada cosa sin leerla entera.',
  },
}
