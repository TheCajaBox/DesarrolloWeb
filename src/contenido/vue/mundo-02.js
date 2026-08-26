// Mundo 2 (Vue) — El template es HTML: texto y estructura.
//
// Segundo mundo del Acto I. Sigue todo dentro de App.vue, en el bloque
// <template>, que es HTML puro. Aquí se llena de estructura: listas, jerarquía
// de títulos, énfasis, una cita. Nada de lógica todavía; se aprende a decir las
// cosas con las etiquetas correctas, que es la mitad de saber HTML.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, dentro, hay } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'
import { buscarTodos, textoDe } from '../../motor/leer-html.js'

// El componente de partida: lo que dejó el Mundo 1, un título y un párrafo. A
// partir de aquí se le da cuerpo.
const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>
    <p>Una colección pequeña y con muy poco criterio.</p>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`

export default {
  numero: 2,
  acto: 'Un componente',
  titulo: 'Mundo 2 · El template es HTML',

  entradilla: {
    quien: 'wax',
    texto:
      'El template no es "código de Vue": es HTML, el mismo que sostiene toda la web. ' +
      'Y HTML no va de que se vea bonito, va de decir qué es cada cosa. Un título es un título, ' +
      'una lista es una lista. Hoy le pones huesos a la página antes de vestirla.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>
    <p>Una colección pequeña y con muy poco criterio, pero con <strong>mucho</strong> cariño.</p>

    <h2>El catálogo</h2>
    <ul>
      <li>Bombín de fieltro</li>
      <li>Panamá de verano</li>
      <li>Gorra de leñador</li>
    </ul>

    <h2>Cómo elegir uno</h2>
    <ol>
      <li>Mírate la cabeza en un espejo sin miedo.</li>
      <li>Elige el que menos te haga dudar.</li>
    </ol>

    <blockquote>Un sombrero no tapa la cabeza: la <em>presenta</em>.</blockquote>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Etiquetas que significan algo',
    cuerpo: `El HTML que va dentro del \`<template>\` no describe cómo se ve algo, sino **qué es**. Esa distinción es la que separa a quien pega etiquetas de quien sabe HTML.

**Los títulos tienen rango.** \`<h1>\` es el título principal de la página, y solo debería haber uno. \`<h2>\` son las secciones grandes, \`<h3>\` las de dentro, y así hasta \`<h6>\`. No se eligen por tamaño —"quiero que esto sea más pequeño, uso h3"—, se eligen por jerarquía: un \`<h3>\` cuelga de un \`<h2>\`, que cuelga del \`<h1>\`. Si lo haces bien, un lector de pantalla puede recorrer tu página como un índice. Si lo haces por tamaño, esa persona se pierde.

**Las listas dicen "esto va junto".** Hay dos que usarás siempre. \`<ul>\` es una lista **sin orden**: sirve para un conjunto donde da igual el orden (los sombreros del catálogo). \`<ol>\` es una lista **ordenada**: sirve cuando el orden importa (los pasos para elegir uno). Las dos se llenan con \`<li>\`, un \`<li>\` por elemento. El navegador te pone los puntos o los números solo; tú solo dices qué es cada cosa.

**El énfasis también significa.** \`<strong>\` marca algo **importante**, no solo "en negrita". \`<em>\` marca énfasis, un cambio de tono al leer, no solo "en cursiva". Se ven en negrita y cursiva porque es la costumbre, pero lo que estás diciendo es "esto pesa" y "esto se lee distinto". Un buscador y un lector de pantalla lo entienden así.

**Y una etiqueta para citar:** \`<blockquote>\` envuelve una cita, un texto que no es tuyo o que quieres destacar aparte.

**La regla de oro del HTML:** elige la etiqueta por lo que la cosa **es**, no por cómo quieres que se vea. El aspecto es cosa del CSS, y llega en el acto siguiente. Si aciertas con la etiqueta, el CSS luego te lo agradece; si no, acabas peleándote con los dos.`,
  },

  pasos: [
    {
      id: '2-1',
      titulo: 'Una lista de sombreros',
      enunciado:
        'Debajo del primer párrafo, dentro del <code>&lt;main&gt;</code>, escribe una lista <strong>sin orden</strong> con <code>&lt;ul&gt;</code> y, dentro, al menos <strong>tres</strong> sombreros, cada uno en su <code>&lt;li&gt;</code>.',
      pista: 'La estructura es <code>&lt;ul&gt;</code>, y dentro varios <code>&lt;li&gt;Nombre&lt;/li&gt;</code>. Los puntos los pone el navegador solo.',
      comprobar: comprobarVue({
        template: [
          hay('ul', { falta: 'Todavía no hay ninguna lista <ul> en el template.' }),
          dentro('ul', 'li', {
            minimo: 3,
            pocos: (n) => `La lista tiene ${n} sombrero${n === 1 ? '' : 's'} y hacen falta 3. Añade más <li>.`,
            fuera: 'Hay <li> sueltos, pero tienen que ir dentro del <ul>.',
          }),
        ],
        exito: 'Una lista de verdad: el navegador le pone los puntos y tú solo has dicho qué va junto.',
      }),
    },

    eleccion({
      id: '2-2',
      titulo: '¿Con orden o sin orden?',
      enunciado: 'Vas a listar los pasos para ponerte un sombrero, y el orden importa: primero cogerlo, luego ponértelo. ¿Qué lista usas?',
      pista: 'Una de las dos numera los elementos porque el orden cuenta.',
      opciones: [
        {
          texto: 'Una <ol>, la lista ordenada: el orden es parte de la información.',
          correcta: true,
          porque: 'Eso es. Cuando el orden significa algo (pasos, un ranking, una receta), <ol> lo dice y encima numera sola.',
        },
        {
          texto: 'Una <ul>, la lista sin orden: total, se ven casi igual.',
          porque: 'Se parecen a la vista, pero <ul> dice "da igual el orden". Para unos pasos eso es mentir sobre lo que es.',
        },
        {
          texto: 'Varios <p> numerados a mano: 1. …, 2. …',
          porque: 'Funciona a la vista, pero no es una lista para el navegador ni para un lector de pantalla. Y renumerar a mano es un dolor.',
        },
      ],
    }),

    {
      id: '2-3',
      titulo: 'Los pasos, en orden',
      enunciado:
        'Añade ahora una lista <strong>ordenada</strong> con <code>&lt;ol&gt;</code> y al menos <strong>dos</strong> pasos dentro, cada uno en su <code>&lt;li&gt;</code>. Fíjate en que la numeración sale sola.',
      pista: 'Igual que la <code>&lt;ul&gt;</code>, pero con <code>&lt;ol&gt;</code>. No escribas tú los números.',
      comprobar: comprobarVue({
        template: [
          hay('ol', { falta: 'Falta la lista ordenada <ol>.' }),
          dentro('ol', 'li', {
            minimo: 2,
            pocos: (n) => `La <ol> tiene ${n} paso${n === 1 ? '' : 's'} y hacen falta 2.`,
            fuera: 'Los <li> de los pasos tienen que ir dentro de la <ol>.',
          }),
        ],
        exito: 'Ahí tienes las dos listas. Misma etiqueta hija, <li>, pero <ul> y <ol> dicen cosas distintas.',
      }),
    },

    completar({
      id: '2-4',
      titulo: 'Las piezas de una lista',
      enunciado: 'Completa la estructura de una lista sin orden con tres elementos (sin los ángulos).',
      pista: 'La etiqueta de fuera envuelve; la de dentro se repite una vez por elemento.',
      plantilla: `<___>
  <___>Bombín</___>
  <li>Panamá</li>
  <li>Gorra</li>
</___>`,
      huecos: [
        { respuestas: ['ul'], porque: 'La lista sin orden se abre con <ul>.' },
        { respuestas: ['li'], porque: 'Cada elemento va en un <li>.' },
        { respuestas: ['li'], porque: 'Y se cierra con </li>.' },
        { respuestas: ['ul'], porque: 'La lista entera se cierra con </ul>.' },
      ],
    }),

    {
      id: '2-5',
      titulo: 'Marca lo que importa',
      enunciado:
        'En algún párrafo, envuelve una palabra clave en <code>&lt;strong&gt;</code> (algo importante) y otra en <code>&lt;em&gt;</code> (un cambio de tono). Pueden ir en el mismo párrafo o en párrafos distintos.',
      pista: 'Se envuelve así: <code>con &lt;strong&gt;mucho&lt;/strong&gt; cariño</code>. La palabra sigue en su sitio, solo la rodeas.',
      comprobar: comprobarVue({
        template: [
          hay('strong', { conTexto: true, falta: 'Todavía no hay ningún <strong> con texto dentro.' }),
          hay('em', { conTexto: true, falta: 'Falta un <em> con texto. Marca una palabra con énfasis.' }),
        ],
        exito: 'Importante con <strong>, tono con <em>. No es negrita y cursiva por capricho: es significado.',
      }),
    },

    verdaderoFalso({
      id: '2-6',
      titulo: 'Cierto o falso: qué significan',
      enunciado: 'Cinco frases sobre etiquetas con significado. Márcalas todas.',
      pista: 'La idea de fondo: la etiqueta dice qué ES la cosa, no cómo se ve.',
      afirmaciones: [
        { texto: 'Solo debería haber un <h1> por página, el título principal.', cierto: true, porque: 'Cierto. El <h1> es la cabecera de todo; lo demás cuelga de él con <h2>, <h3>…' },
        { texto: 'Se elige <h3> en vez de <h2> porque quieres el texto más pequeño.', cierto: false, porque: 'Falso: los títulos se eligen por jerarquía, no por tamaño. El tamaño se ajusta con CSS.' },
        { texto: '<ul> es para conjuntos sin orden; <ol> para cuando el orden importa.', cierto: true, porque: 'Cierto, y esa diferencia es información, no adorno.' },
        { texto: '<strong> solo sirve para poner texto en negrita.', cierto: false, porque: 'Falso: <strong> marca importancia. Que se vea en negrita es la costumbre, no su razón de ser.' },
        { texto: 'El navegador pone los puntos y los números de las listas solo.', cierto: true, porque: 'Cierto: tú dices qué es cada cosa con <li>, y él se encarga de la viñeta.' },
      ],
    }),

    {
      id: '2-7',
      titulo: 'Secciones y una cita',
      enunciado:
        'Organiza la página: añade al menos un <code>&lt;h2&gt;</code> como título de sección, y una cita con <code>&lt;blockquote&gt;</code> con algo de texto dentro.',
      pista: '<code>&lt;h2&gt;</code> es un subtítulo bajo el <code>&lt;h1&gt;</code>. <code>&lt;blockquote&gt;</code> envuelve una frase citada.',
      comprobar: comprobarVue({
        template: [
          hay('h2', { conTexto: true, falta: 'Falta un <h2> con texto que titule una sección.' }),
          hay('blockquote', { conTexto: true, falta: 'Falta una cita con <blockquote> y texto dentro.' }),
        ],
        exito: 'Con secciones y una cita, la página ya se lee como un documento, no como un montón de líneas.',
      }),
    },

    ordenar({
      id: '2-8',
      titulo: 'La jerarquía de un documento',
      enunciado: 'Ordena estas etiquetas de más general a más concreta en la jerarquía de títulos.',
      pista: 'Cuál manda sobre cuál: el título de toda la página va arriba del todo.',
      lineas: [
        '<h1> — el título de toda la página',
        '<h2> — una sección grande',
        '<h3> — un apartado dentro de la sección',
      ],
      porque: 'Esa es la escalera: <h1> manda, <h2> cuelga de él, <h3> cuelga del <h2>. Bien hecha, tu página tiene un índice automático.',
    }),

    emparejar({
      id: '2-9',
      titulo: 'Cada etiqueta con su trabajo',
      enunciado: 'Une cada etiqueta con lo que significa.',
      pista: 'Piensa en qué ES la cosa, no en cómo se pinta.',
      pares: [
        { izquierda: '<ol>', derecha: 'una lista donde el orden importa' },
        { izquierda: '<strong>', derecha: 'algo importante dentro del texto', porque: '<strong> es importancia, no solo negrita.' },
        { izquierda: '<blockquote>', derecha: 'una cita destacada aparte' },
        { izquierda: '<h2>', derecha: 'el título de una sección' },
      ],
      porque: 'Cada etiqueta tiene un trabajo. Acertarlo es lo que hace que el HTML signifique algo, no solo que se vea.',
    }),

    {
      id: '2-10',
      titulo: 'Una página con estructura',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja tu <code>App.vue</code> con <strong>toda</strong> la estructura a la vez: un <code>&lt;h2&gt;</code> de sección, una <code>&lt;ul&gt;</code> con al menos <strong>tres</strong> <code>&lt;li&gt;</code>, una <code>&lt;ol&gt;</code> con al menos <strong>dos</strong> <code>&lt;li&gt;</code>, y en algún sitio un <code>&lt;strong&gt;</code> y un <code>&lt;blockquote&gt;</code>. Es tu catálogo, escrito con las etiquetas que tocan.',
      comprobar: comprobarVue({
        template: [
          hay('h2', { conTexto: true, falta: 'Falta al menos un <h2> de sección.' }),
          dentro('ul', 'li', { minimo: 3, pocos: (n) => `La <ul> lleva ${n} de 3 elementos.` }),
          dentro('ol', 'li', { minimo: 2, pocos: (n) => `La <ol> lleva ${n} de 2 pasos.` }),
          hay('strong', { conTexto: true, falta: 'Falta un <strong> marcando algo importante.' }),
          hay('blockquote', { conTexto: true, falta: 'Falta una cita con <blockquote>.' }),
          (doc) => {
            const items = buscarTodos(doc, 'li').map((n) => textoDe(n).toLowerCase()).filter(Boolean)
            return new Set(items).size < 4 ? 'Varios <li> repiten texto. Que cada uno diga algo distinto.' : null
          },
        ],
        exito:
          'Una página entera con la etiqueta correcta en cada sitio. Esto, tal cual, es HTML profesional; y lo has escrito dentro de un componente Vue.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Fíjate en que no has tocado ni un color y la página ya tiene sentido: se sabe qué es un título, qué es una lista, qué es una cita. ' +
      'Eso es el esqueleto. Lo de vestirlo viene ahora, y es mucho más divertido cuando el esqueleto está derecho.',
  },
}
