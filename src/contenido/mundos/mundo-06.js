// Mundo 6 — Repartir el espacio.
//
// Flex y grid, y cuando cada uno. Arranca donde acabo el 5: las fichas ya
// tienen su caja bien puesta, pero siguen en columna desperdiciando pantalla.
//
// Las comprobaciones usan motor/leer-css.js y no expresiones regulares, para
// que un salto de linea de mas o un comentario en medio no tumben un paso que
// esta bien resuelto.
//
// Dialogos originales, en el registro de los personajes.

import { leerCss, reglasPara, tieneAlguna, valorDe } from '../../motor/leer-css.js'
import { buscarTodos, leerHtml } from '../../motor/leer-html.js'

const HTML_BASE = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
    <link rel="stylesheet" href="css/estilos.css">
  </head>
  <body>

    <h1>Sombreros</h1>

    <main class="rejilla">
      <article>
        <h2>El de siempre</h2>
        <p>Marrón, con el ala vencida por el lado izquierdo.</p>
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
`

const CSS_BASE = `* {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  background: #fbfaf7;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
}

article {
  padding: 1rem;
  border: 1px solid #ddd;
}

/* La rejilla va aquí debajo. */
`

const cssDe = (ficheros) => leerCss(ficheros?.['css/estilos.css'] || ficheros?.['estilos.css'] || '')

const tocaRejilla = (regla) => /(^|[\s>+~])\.rejilla($|[\s>+~:,.])/.test(` ${regla.selector} `)

// Una sola columna: "1fr", "100%", "minmax(0, 1fr)". Lo que no vale es seguir
// con repeat() o con varias medidas separadas por espacios.
function esUnaSolaColumna(valor) {
  if (/repeat\s*\(/i.test(valor)) return false
  return valor.trim().split(/\s+(?![^(]*\))/).length === 1
}

export default {
  numero: 6,
  acto: 'Que se vea bien',
  titulo: 'Mundo 6 · Repartir el espacio',

  entradilla: {
    quien: 'wayne',
    texto:
      'Tres sombreros, uno debajo de otro, ocupando una tira estrecha y dejando media pantalla vacía. ' +
      'Es como colgar tres cuadros en fila en una pared de diez metros. Se puede. Queda raro.',
  },

  ficheros: { 'index.html': HTML_BASE, 'css/estilos.css': CSS_BASE },

  solucion: {
    'index.html': HTML_BASE,
    'css/estilos.css': `${CSS_BASE}
.rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}

article {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 40rem) {
  .rejilla {
    grid-template-columns: 1fr;
  }
}
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Flex y grid: cuál de los dos y por qué',
    cuerpo: `Durante años, colocar cosas en una página fue una tortura. Se usaban tablas para maquetar, y luego floats, que estaban pensados para otra cosa completamente distinta. Hoy hay dos herramientas hechas para esto, y con saber cuál usar tienes casi todo resuelto.

**La diferencia, en una frase.** Flex reparte en **una** dirección. Grid reparte en **dos**.

Cuando te preguntes cuál toca, hazte esta pregunta: ¿lo que estoy colocando es una fila, o es una cuadrícula?

- Una barra de navegación, los botones de un formulario, un icono junto a un texto: **una fila**. Flex.
- Un catálogo de fichas, una galería de fotos, un tablero: **una cuadrícula**. Grid.

**Cómo funcionan los dos.** En ambos casos, la propiedad se le pone al **contenedor**, no a los hijos. Eso ya es distinto de casi todo lo demás en CSS, y confunde al principio: para colocar las fichas no se toca la ficha, se toca la caja que las contiene.

Con grid, la propiedad clave es \`grid-template-columns\`, que dice cuántas columnas hay y cuánto mide cada una:

    grid-template-columns: 1fr 1fr 1fr;

Eso son tres columnas iguales. La unidad \`fr\` significa "fracción del espacio sobrante", y es propia de grid: \`1fr 2fr\` hace que la segunda sea el doble de ancha que la primera.

**La que de verdad vas a usar.** Escribir "tres columnas" a mano tiene un problema: en un móvil siguen siendo tres, y quedan del ancho de un sello. Esto lo resuelve solo:

    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));

Se lee así: repite columnas, las que quepan, y que cada una mida al menos 15rem pero pueda estirarse a repartirse lo que sobre. En una pantalla ancha salen cuatro; en una estrecha, una. Sin escribir ni una media query.

**\`gap\`, y por qué se acabó pelearse con los márgenes.** Dentro de un grid o un flex, la separación entre elementos se pone con \`gap\`. Solo separa **entre** ellos, nunca por los bordes de fuera, que es justo lo que quieres y lo que con márgenes costaba tanto conseguir. Y no colapsa: si dices 1rem, es 1rem.

**Alinear.** Las dos propiedades que se usan constantemente:

- \`justify-content\` — coloca a lo largo del eje principal (en flex por defecto, el horizontal).
- \`align-items\` — coloca en el eje perpendicular.

Con \`display: flex\` y esas dos en \`center\`, cualquier cosa queda centrada en su caja. Eso, que hoy son dos líneas, durante quince años fue una pregunta recurrente en internet.

**Se pueden anidar, y se hace.** Una rejilla de fichas, y cada ficha por dentro un flex en columna para que el título, la descripción y el botón se ordenen. Es lo normal: grid para la página, flex para lo de dentro.

**Sobre las media queries.** Sirven para decir "cuando la pantalla mida menos de tanto, haz esto otro":

    @media (max-width: 40rem) {
      .rejilla { grid-template-columns: 1fr; }
    }

Un consejo que ahorra trabajo: escribe primero cómo se ve en estrecho y añade luego lo que cambia en ancho. Se llama "móvil primero", y funciona porque una pantalla estrecha te obliga a decidir qué es realmente importante. Al revés, lo que suele pasar es que intentas encajar a la fuerza un diseño de escritorio en un sitio donde no cabe.`,
  },

  pasos: [
    {
      id: '6-1',
      titulo: 'Ponlas en rejilla',
      enunciado:
        'Asegúrate de que tus fichas están dentro de un <code>&lt;main class="rejilla"&gt;</code> —si el <code>&lt;main&gt;</code> lo pusiste en el Mundo 2, solo hay que añadirle la clase—. Luego dale <code>display: grid</code>, reparte el espacio con <code>grid-template-columns</code> y separa las fichas con <code>gap</code>.',
      pista: 'Para columnas que se adaptan solas: <code>grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr))</code>.',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)
        const doc = leerHtml(ficheros?.['index.html'] || '')

        if (!buscarTodos(doc, 'main.rejilla').length) {
          return {
            superado: false,
            mensaje: buscarTodos(doc, 'main').length
              ? 'Tienes un <main>, pero sin class="rejilla". Añádesela: es a lo que apuntará el CSS.'
              : 'Falta el <main class="rejilla"> envolviendo las fichas. Sin contenedor no hay rejilla que valga.',
          }
        }

        const display = valorDe(reglas, '.rejilla', 'display')
        if (!display) {
          return { superado: false, mensaje: 'A .rejilla no le has dado ningún display.' }
        }
        if (!/grid/.test(display)) {
          return { superado: false, mensaje: `.rejilla tiene "display: ${display}". Para una cuadrícula quieres grid.` }
        }

        if (!valorDe(reglas, '.rejilla', 'grid-template-columns')) {
          return {
            superado: false,
            mensaje: 'Es una rejilla, pero de una sola columna: falta grid-template-columns diciendo cuántas quieres.',
          }
        }

        if (!tieneAlguna(reglas, '.rejilla', ['gap', 'grid-gap', 'column-gap', 'row-gap'])) {
          return {
            superado: false,
            mensaje: 'Las fichas se tocan. Sepáralas con gap, que es lo que existe para eso dentro de una rejilla.',
          }
        }

        if (buscarTodos(doc, 'article').length < 3) {
          return { superado: false, mensaje: 'Se han perdido fichas por el camino: tienen que seguir siendo tres.' }
        }

        return { superado: true, mensaje: 'Varias columnas y aire entre ellas. Eso ya es un catálogo.' }
      },
    },

    {
      id: '6-2',
      titulo: 'Ordena por dentro',
      enunciado:
        'Ahora lo de dentro de cada ficha. Dale a <code>article</code> un <code>display: flex</code> con <code>flex-direction: column</code> y su propio <code>gap</code>. Grid para la página, flex para lo de dentro: así se hace de verdad.',
      pista: 'Van en la misma regla de <code>article</code> que ya tienes, junto al padding y el borde.',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)

        if (!reglasPara(reglas, 'article').length) {
          return { superado: false, mensaje: 'No hay ninguna regla para article.' }
        }

        const display = valorDe(reglas, 'article', 'display')
        if (!display || !/flex/.test(display)) {
          return {
            superado: false,
            mensaje: display
              ? `article tiene "display: ${display}". Aquí quieres flex.`
              : 'A article le falta el display: flex.',
          }
        }

        const direccion = valorDe(reglas, 'article', 'flex-direction')
        if (!direccion || !/column/i.test(direccion)) {
          return {
            superado: false,
            mensaje: direccion
              ? `La dirección es "${direccion}", que pondría el título al lado de la descripción. Quieres column.`
              : 'Falta flex-direction: column. Por defecto, flex coloca en fila.',
          }
        }

        if (!tieneAlguna(reglas, 'article', ['gap', 'row-gap'])) {
          return { superado: false, mensaje: 'Falta el gap dentro de la ficha, para separar el título de la descripción.' }
        }

        return { superado: true, mensaje: 'Una rejilla por fuera y un flex por dentro. Eso es lo normal.' }
      },
    },

    {
      id: '6-3',
      titulo: 'Que sobreviva a un móvil',
      enunciado:
        'En una pantalla estrecha, varias columnas dejan las fichas del ancho de un sello. Añade una <code>@media (max-width: …)</code> que pase <code>.rejilla</code> a una sola columna. Estrecha la vista previa para verlo.',
      pista: 'Dentro del @media hay que repetir el selector: <code>@media (max-width: 40rem) { .rejilla { grid-template-columns: 1fr; } }</code>',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)
        const enMedia = reglas.filter((regla) => regla.condicion)

        if (!enMedia.length) {
          return { superado: false, mensaje: 'No hay ninguna @media en el fichero.' }
        }

        const estrecha = enMedia.filter((regla) => /max-width/i.test(regla.condicion))
        if (!estrecha.length) {
          return {
            superado: false,
            mensaje: 'Hay una @media, pero no es de max-width. Para "cuando la pantalla sea estrecha" necesitas max-width.',
          }
        }

        const deRejilla = estrecha.filter(tocaRejilla)
        if (!deRejilla.length) {
          return { superado: false, mensaje: 'Dentro de la @media no hay ninguna regla para .rejilla.' }
        }

        const columnas = deRejilla
          .map((regla) => regla.declaraciones['grid-template-columns'])
          .filter(Boolean)
          .pop()

        if (!columnas) {
          return {
            superado: false,
            mensaje: 'La regla está, pero no cambia grid-template-columns, que es lo que hay que reducir.',
          }
        }

        if (!esUnaSolaColumna(columnas)) {
          return {
            superado: false,
            mensaje: `En el móvil sigues pidiendo varias columnas ("${columnas}"). Ahí solo cabe una.`,
          }
        }

        return {
          superado: true,
          mensaje: 'Estrecha la vista previa y míralo: es exactamente lo que hará un teléfono.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en lo que no has tocado: el HTML. La estructura era la misma antes y después de colocarlo todo. ' +
      'Eso es lo que se gana separando qué es cada cosa de cómo se ve, y es la razón de que sean dos ficheros y no uno.',
  },
}
