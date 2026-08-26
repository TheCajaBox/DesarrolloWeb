// Mundo 5 — El modelo de cajas.
//
// Padding contra margin, y la sorpresa de box-sizing. Es el mundo que evita
// que la persona pase meses moviendo numeros al azar hasta que "queda bien".
//
// Dialogos originales, en el registro de los personajes.

import { leerCss, reglasPara, tieneAlguna, valorDe } from '../../motor/leer-css.js'

const HTML_BASE = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>El catálogo</title>
    <link rel="stylesheet" href="css/estilos.css">
  </head>
  <body>

    <h1>Sombreros</h1>

    <main>
      <article>
        <h2>El de siempre</h2>
        <p>Marrón, con el ala vencida por el lado izquierdo.</p>
      </article>

      <article>
        <h2>Hongo de contable</h2>
        <p>Duro, redondo y respetable.</p>
      </article>

      <article>
        <h2>El de las bodas</h2>
        <p>Gris perla, impecable, con una mancha detrás.</p>
      </article>
    </main>

  </body>
</html>
`

const CSS_BASE = `body {
  font-family: system-ui, sans-serif;
  background: #fbfaf7;
  max-width: 44rem;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
}

/* Las fichas van aquí debajo. */
`

const cssDe = (ficheros) => leerCss(ficheros?.['css/estilos.css'] || ficheros?.['estilos.css'] || '')

// Un valor de anchura que sea una medida concreta, no un porcentaje ni auto.
const MEDIDA_FIJA = /^\s*\d+(\.\d+)?\s*(rem|em|px|ch)\s*$/i

export default {
  numero: 5,
  acto: 'Que se vea bien',
  titulo: 'Mundo 5 · El modelo de cajas',

  entradilla: {
    quien: 'wayne',
    texto:
      'Todo lo que ves en una página es una caja rectangular. Todo. Esa frase suena a poco y es la que te va a ahorrar ' +
      'las tardes de mover números al azar hasta que la cosa quede más o menos.',
  },

  ficheros: { 'index.html': HTML_BASE, 'css/estilos.css': CSS_BASE },

  solucion: {
    'index.html': HTML_BASE,
    'css/estilos.css': `${CSS_BASE}
article {
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  width: 20rem;
  box-sizing: border-box;
}
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'El modelo de cajas, y por qué margin no es padding',
    cuerpo: `Todo lo que ves en una página es una caja rectangular. Absolutamente todo: un párrafo, una imagen, una palabra suelta dentro de un \`<span>\`. No hay otra forma de que el navegador coloque nada.

Cuando algo "no se pone donde quiero", casi siempre es que no tienes claro dónde empieza y dónde acaba su caja.

**Las cuatro capas.** De dentro afuera: el **contenido**, el **padding**, el **borde** y el **margen**.

    ┌─────────────────────────────┐  <- margen (fuera, transparente)
    │ ┌─────────────────────────┐ │  <- borde
    │ │        padding          │ │
    │ │   ┌─────────────────┐   │ │
    │ │   │    contenido    │   │ │
    │ │   └─────────────────┘   │ │
    │ └─────────────────────────┘ │
    └─────────────────────────────┘

**Padding contra margin.** Es la confusión número uno y se quita con una frase: el padding está **dentro** del borde y el margen **fuera**.

De ahí sale todo lo demás. Si le pones fondo a la caja, el padding se pinta de ese color; el margen no, porque ya no es la caja. Por eso:

- Para separar el texto del borde de su ficha: **padding**.
- Para separar dos fichas entre sí: **margin**.

**La trampa que hace odiar el CSS.** Por defecto, \`width: 300px\` mide **solo el contenido**. Si además pones \`padding: 20px\` y \`border: 1px\`, la caja acaba ocupando 342 píxeles en pantalla:

    300  contenido
    + 20 padding izquierdo
    + 20 padding derecho
    +  1 borde izquierdo
    +  1 borde derecho
    ---
    342  de ancho real

Pediste 300 y ocupa 342. Y si esa caja estaba dentro de otra de 320, se sale, y no entiendes por qué.

La solución cabe en tres líneas y es lo primero que escribe casi todo el mundo en un proyecto nuevo:

    * {
      box-sizing: border-box;
    }

Con eso, \`width: 300px\` significa 300 píxeles contando borde y padding: el contenido se encoge para que la caja mida lo que pediste. Que es lo que creías haber pedido desde el principio.

El \`*\` significa "todos los elementos". Se pone así, de una vez, porque querer lo contrario es rarísimo.

**El colapso de márgenes.** Dos márgenes verticales que se tocan **se funden en uno**, y gana el mayor. Si un elemento tiene 20px abajo y el siguiente 30px arriba, la separación es 30, no 50.

Parece un error la primera vez y no lo es: evita que un documento con muchos párrafos acumule separaciones absurdas. Solo pasa en vertical, solo entre elementos normales, y **no pasa dentro de una rejilla ni de un flex**: ahí manda \`gap\`, que sí suma lo que dices.

**Cómo verlo en vez de adivinarlo.** Botón derecho, "Inspeccionar", y en el panel de estilos hay un dibujo del modelo de cajas con los cuatro números de ese elemento. Pasa el ratón por encima y el navegador te pinta cada capa de un color sobre la página. Deja de ser abstracto en diez segundos.`,
  },

  pasos: [
    {
      id: '5-1',
      titulo: 'Dale aire por dentro',
      enunciado:
        'El texto de las fichas va pegado al borde. En <code>css/estilos.css</code>, dale a <code>article</code> un <code>padding</code> y un <code>border</code> para ver dónde acaba cada una.',
      pista: '<code>article { padding: 1rem; border: 1px solid #ddd; }</code>',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)

        if (!reglasPara(reglas, 'article').length) {
          return { superado: false, mensaje: 'Todavía no hay ninguna regla para article.' }
        }
        if (!tieneAlguna(reglas, 'article', ['padding', 'padding-top', 'padding-block', 'padding-inline'])) {
          return { superado: false, mensaje: 'Falta el padding: el texto sigue tocando el borde.' }
        }
        if (!tieneAlguna(reglas, 'article', ['border', 'border-width', 'border-style'])) {
          return { superado: false, mensaje: 'Falta el border, que es lo que deja ver dónde acaba la caja.' }
        }

        return { superado: true, mensaje: 'Ese hueco de dentro es el padding. Está dentro del borde, fíjate.' }
      },
    },

    {
      id: '5-2',
      titulo: 'Y aire por fuera',
      enunciado:
        'Las tres fichas se tocan entre sí. Sepáralas con <code>margin-bottom</code>. Fíjate en la diferencia: el padding no las separaba, porque el padding es de dentro.',
      pista: '<code>margin-bottom: 1rem</code> en la misma regla de <code>article</code>. Es el hueco de fuera del borde.',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)

        if (!tieneAlguna(reglas, 'article', ['padding', 'padding-top', 'padding-block', 'padding-inline'])) {
          return { superado: false, mensaje: 'Se ha perdido el padding del paso anterior.' }
        }

        if (!tieneAlguna(reglas, 'article', ['margin', 'margin-bottom', 'margin-block', 'margin-block-end'])) {
          return {
            superado: false,
            mensaje: 'Falta el margen. Si has puesto más padding esperando separarlas, prueba: no funciona, porque el padding va por dentro.',
          }
        }

        return {
          superado: true,
          mensaje: 'Dentro padding, fuera margin. Con eso ya no te vuelves a confundir.',
        }
      },
    },

    {
      id: '5-3',
      titulo: 'La caja que mide de más',
      enunciado:
        'Ponle a <code>article</code> una anchura concreta, por ejemplo <code>width: 20rem</code>. Ahora mídela en el inspector: ocupa más de 20rem, porque el padding y el borde se suman por fuera. Arréglalo con <code>box-sizing: border-box</code>, para que 20rem signifique 20rem de verdad.',
      pista: 'Puedes ponerlo solo en <code>article</code>, o de una vez para todo con <code>* { box-sizing: border-box; }</code>, que es lo que se hace normalmente.',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)

        const ancho = valorDe(reglas, 'article', 'width')
        if (!ancho) {
          return { superado: false, mensaje: 'A article todavía no le has puesto ninguna width.' }
        }
        if (!MEDIDA_FIJA.test(ancho)) {
          return {
            superado: false,
            mensaje: `La anchura es "${ancho}". Para ver el efecto hace falta una medida concreta, como 20rem: con porcentajes o auto no se aprecia.`,
          }
        }

        // Vale en article, o en el universal, que es como se hace de verdad.
        const universal = reglas.find(
          (regla) => regla.selector === '*' && /border-box/i.test(regla.declaraciones['box-sizing'] || ''),
        )
        const enArticle = /border-box/i.test(valorDe(reglas, 'article', 'box-sizing') || '')

        if (!universal && !enArticle) {
          const cualquiera = valorDe(reglas, 'article', 'box-sizing')
          return {
            superado: false,
            mensaje: cualquiera
              ? `Tienes "box-sizing: ${cualquiera}". El que hace que la anchura incluya padding y borde es border-box.`
              : 'Falta el box-sizing: border-box. Ahora mismo tu ficha mide 20rem más el padding más el borde.',
          }
        }

        if (!tieneAlguna(reglas, 'article', ['padding', 'padding-top', 'padding-block', 'padding-inline'])) {
          return { superado: false, mensaje: 'Sin padding no se nota la diferencia. Devuélvelo y vuelve a mirar.' }
        }

        return {
          superado: true,
          mensaje: universal
            ? 'Y puesto en el * , que es como se hace en cualquier proyecto de verdad.'
            : 'Ahora 20rem son 20rem. Cuando lo pongas en el * te ahorrarás este susto para siempre.',
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Si te llevas una sola cosa de aquí, que sea esta: cuando algo no encaje, no muevas números al azar. ' +
      'Abre el inspector, mira el dibujo de la caja y comprueba cuál de las cuatro capas está midiendo lo que no crees.',
  },
}
