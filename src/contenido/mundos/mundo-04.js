// Mundo 4 — El navegador ya tiene opiniones.
//
// El mundo de la cascada. Es donde se resuelve el "no me hace caso" que hace
// que la gente odie el CSS antes de entenderlo, y por eso el ultimo paso es
// ganar una pelea de especificidad a mano, sin !important.
//
// Dialogos originales, en el registro de los personajes.

import {
  comparaEspecificidad,
  leerCss,
  llevaImportante,
  reglasPara,
  valorDe,
} from '../../motor/leer-css.js'
import { buscarTodos, leerHtml } from '../../motor/leer-html.js'

// Esta regla viene sembrada y es la rival del ultimo paso.
const REGLA_RIVAL = 'article p'

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

const CSS_BASE = `/* Esto ya viene escrito. No lo borres: en el último paso
   te va a hacer falta que siga aquí. */
article p {
  color: #777777;
}
`

const cssDe = (ficheros) => leerCss(ficheros?.['css/estilos.css'] || ficheros?.['estilos.css'] || '')

export default {
  numero: 4,
  acto: 'Que se vea bien',
  titulo: 'Mundo 4 · El navegador ya opina',

  entradilla: {
    quien: 'wayne',
    texto:
      'El navegador ya ha decidido cómo se ve tu página sin preguntarte. Los títulos grandes, los enlaces azules, ' +
      'todo eso lo ha puesto él. Tú no partes de cero: partes de discutir con alguien que ya tiene opinión.',
  },

  ficheros: { 'index.html': HTML_BASE, 'css/estilos.css': CSS_BASE },

  solucion: {
    'index.html': HTML_BASE.replace(
      '      <article>\n        <h2>El de siempre</h2>',
      '      <article class="destacado">\n        <h2>El de siempre</h2>',
    ),
    'css/estilos.css': `${CSS_BASE}
body {
  font-family: system-ui, sans-serif;
  background: #fbfaf7;
}

h2 {
  color: #8a5a2b;
}

.destacado {
  border: 2px solid #d8b26a;
}

.destacado p {
  color: #333333;
}
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'La cascada, o por qué tu CSS no hace caso',
    cuerpo: `Antes de que escribas una sola línea de CSS, tu página ya tiene estilos. Los títulos ya salen grandes, los enlaces ya salen azules y subrayados, y los párrafos ya tienen separación entre ellos.

Eso no lo has hecho tú: cada navegador trae su propia hoja de estilos por defecto. Tu CSS no parte de un lienzo en blanco, parte de discutir con esa hoja.

**Cuando dos reglas dicen cosas distintas.** Antes o después vas a escribir dos reglas que afectan a lo mismo y dicen cosas contrarias. El navegador no se bloquea ni elige al azar: aplica tres criterios, **por este orden**.

1. **¿Alguna lleva \`!important\`?** Si solo una, gana esa. Y ya está.
2. **¿Cuál es más específica?** Aquí se decide casi todo.
3. **Si empatan, gana la última escrita.** Por eso a veces mover una regla dos líneas abajo lo arregla todo.

**La especificidad, que es la que importa.** Se cuenta en tres casillas:

- Una casilla para los **identificadores** (\`#cabecera\`)
- Una para las **clases**, atributos y pseudoclases (\`.destacado\`, \`[href]\`, \`:hover\`)
- Una para las **etiquetas** y pseudoelementos (\`p\`, \`article\`, \`::before\`)

Y aquí está la parte que casi nadie tiene clara: **no se suman**. Se comparan casilla por casilla, de izquierda a derecha, y la primera diferencia decide. Una sola clase gana a cualquier cantidad de etiquetas:

    .destacado          ->  0 ids, 1 clase, 0 etiquetas   GANA
    html body main article p  ->  0 ids, 0 clases, 5 etiquetas

Cinco etiquetas pierden contra una clase. No es que "5 sea menos que 10": es que la casilla de las clases se mira antes, y ahí hay un 1 contra un 0. Se acabó la comparación.

**El ejemplo que vas a vivir hoy.** Tienes escrito \`article p { color: #777 }\`. Si añades \`p { color: negro }\`, no pasa nada: \`article p\` tiene dos etiquetas y \`p\` tiene una, así que gana la primera. Para ganarle necesitas subir de casilla, y para eso hace falta una clase.

**Sobre \`!important\`.** Existe y funciona, y por eso es peligroso: apaga el fuego tirando el edificio. En cuanto pones uno, el siguiente problema solo se arregla con otro \`!important\`, y acabas con una hoja de estilos donde ya no manda la lógica sino quién gritó más fuerte. Úsalo cuando estés peleando con CSS de otra persona que no puedes tocar. En tu propio CSS, casi nunca.

**Cómo saber qué está ganando.** No lo adivines. Pincha con el botón derecho sobre el elemento, "Inspeccionar", y en el panel de estilos verás todas las reglas que le afectan, con las perdedoras **tachadas**. Esa lista tachada es la respuesta a la mayoría de los "no me hace caso".`,
  },

  pasos: [
    {
      id: '4-1',
      titulo: 'Tu primera regla',
      enunciado:
        'En <code>css/estilos.css</code>, escribe una regla para <code>body</code> que le ponga una <code>font-family</code> y un <code>background</code>. Se escribe: selector, llave, propiedad, dos puntos, valor, punto y coma, llave de cierre.',
      pista: 'Así: <code>body { font-family: system-ui, sans-serif; background: #fbfaf7; }</code>',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)

        if (!reglasPara(reglas, 'body').length) {
          return { superado: false, mensaje: 'Todavía no hay ninguna regla para body.' }
        }
        if (!valorDe(reglas, 'body', 'font-family')) {
          return { superado: false, mensaje: 'A body le falta la font-family.' }
        }
        if (!valorDe(reglas, 'body', 'background') && !valorDe(reglas, 'body', 'background-color')) {
          return { superado: false, mensaje: 'Le falta el background. Ponle un color de fondo.' }
        }

        return {
          superado: true,
          mensaje: 'Toda la página ha cambiado de golpe, aunque solo hayas nombrado body. Eso es que se hereda.',
        }
      },
    },

    {
      id: '4-2',
      titulo: 'Selecciona por etiqueta',
      enunciado:
        'Ahora ponles color a los nombres de los sombreros: escribe una regla para <code>h2</code> con una propiedad <code>color</code>. Fíjate en que afecta a los tres a la vez, sin que hayas dicho cuál.',
      pista: 'Un selector de etiqueta es el nombre a secas, sin punto ni almohadilla: <code>h2 { color: … }</code>',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)
        const color = valorDe(reglas, 'h2', 'color')

        if (!reglasPara(reglas, 'h2').length) {
          return { superado: false, mensaje: 'No hay ninguna regla que seleccione h2.' }
        }
        if (!color) {
          return { superado: false, mensaje: 'La regla de h2 existe, pero no declara color.' }
        }

        return { superado: true, mensaje: 'Los tres a la vez. Un selector de etiqueta no distingue: los coge todos.' }
      },
    },

    {
      id: '4-3',
      titulo: 'Selecciona solo uno',
      enunciado:
        'Para tocar <strong>un</strong> sombrero y no los tres hace falta marcarlo. En el HTML, añade <code>class="destacado"</code> a uno de los <code>&lt;article&gt;</code>. Luego, en el CSS, escribe una regla <code>.destacado</code> que le ponga un <code>border</code>.',
      pista: 'En el HTML: <code>&lt;article class="destacado"&gt;</code>. En el CSS el punto es lo que significa "clase": <code>.destacado { border: 2px solid #d8b26a; }</code>',
      comprobar(ficheros) {
        const doc = leerHtml(ficheros?.['index.html'] || '')
        const marcados = buscarTodos(doc, 'article.destacado')

        if (!marcados.length) {
          return {
            superado: false,
            mensaje: 'Ningún <article> tiene class="destacado" en el HTML.',
          }
        }
        if (marcados.length > 1) {
          return {
            superado: false,
            mensaje: `Hay ${marcados.length} artículos con la clase. La gracia era distinguir uno solo.`,
          }
        }

        const reglas = cssDe(ficheros)
        if (!reglasPara(reglas, '.destacado').length) {
          return { superado: false, mensaje: 'La clase está en el HTML, pero el CSS no tiene ninguna regla .destacado.' }
        }
        if (!valorDe(reglas, '.destacado', 'border') && !valorDe(reglas, '.destacado', 'border-width')) {
          return { superado: false, mensaje: 'La regla .destacado no declara ningún border.' }
        }

        return { superado: true, mensaje: 'Uno de los tres, y los otros sin enterarse. Para eso están las clases.' }
      },
    },

    {
      id: '4-4',
      titulo: 'Gana la pelea',
      enunciado:
        'Arriba del fichero está <code>article p { color: #777777 }</code>, que pone gris la descripción de las tres fichas. Haz que la del sombrero destacado tenga <strong>otro color</strong>. Con una regla más específica: <strong>no vale <code>!important</code></strong>.',
      pista: 'Necesitas subir de casilla. <code>article p</code> son dos etiquetas y cero clases; una regla que incluya <code>.destacado</code> y llegue al <code>p</code> tiene una clase, y eso gana.',
      comprobar(ficheros) {
        const reglas = cssDe(ficheros)

        const rival = reglas.find((regla) => regla.selector === REGLA_RIVAL)
        if (!rival) {
          return {
            superado: false,
            mensaje: 'Has borrado la regla "article p". Vuelve a ponerla: la gracia del paso es ganarle, no quitarla de en medio.',
          }
        }

        // Reglas que declaran color y llegan a un <p>.
        const candidatas = reglas.filter(
          (regla) =>
            regla.selector !== REGLA_RIVAL &&
            regla.declaraciones.color &&
            /(^|[\s>+~])p($|[\s>+~:,.])/.test(` ${regla.selector} `),
        )

        if (!candidatas.length) {
          return { superado: false, mensaje: 'No hay ninguna regla nueva que le ponga color a un <p>.' }
        }

        const conImportante = candidatas.find((regla) => llevaImportante(regla, 'color'))
        if (conImportante) {
          return {
            superado: false,
            mensaje: `"${conImportante.selector}" gana con !important, que es hacer trampas. Quítalo y gana por especificidad.`,
          }
        }

        const ganadora = candidatas.find((regla) => comparaEspecificidad(regla.selector, REGLA_RIVAL) > 0)
        if (!ganadora) {
          const intento = candidatas[0]
          return {
            superado: false,
            mensaje: `"${intento.selector}" no le gana a "article p": necesitas una clase en el selector, no más etiquetas.`,
          }
        }

        if (ganadora.declaraciones.color.trim() === rival.declaraciones.color.trim()) {
          return { superado: false, mensaje: 'Tu regla gana, pero le pone exactamente el mismo color. No se nota nada.' }
        }

        return {
          superado: true,
          mensaje: `"${ganadora.selector}" le gana a "article p" por tener una clase. Así se resuelve el "no me hace caso".`,
        }
      },
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Lo que acabas de hacer es el noventa por ciento de los problemas de CSS que vas a tener. No es que la regla esté mal escrita: ' +
      'es que hay otra ganándole. Cuando te pase, abre el inspector y busca la línea tachada. Ahí está siempre la respuesta.',
  },
}
