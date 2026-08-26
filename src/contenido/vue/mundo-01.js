// Mundo 1 (Vue) — Esto es App.vue.
//
// El primero del temario nuevo. Todo ocurre dentro de un componente Vue de
// verdad: la plantilla ES html, el estilo ES css, el script ES javascript. No
// se salta nada, se aprende en el sitio donde se usa.
//
// Se comprueba con comprobarVue, que parte el .vue y enruta cada requisito a su
// bloque. Si el componente no compila, sale el error real de Vue.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, hay, textoDeAlMenos } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, verdaderoFalso } from '../mundos/tipos-de-paso.js'
import { partirVue } from '../../motor/leer-vue.js'
import { buscarTodos, leerHtml, textoDe, textoDel } from '../../motor/leer-html.js'

const H1_SEMBRADO = 'Cambia esto'

// El componente sembrado. Es exactamente el proyecto que sirve Vite, así que la
// vista previa de la alumna arranca mostrando esto.
const APP_SEMBRADA = `<script setup>
// Aqui va la logica del componente. De momento, nada.
</script>

<template>
  <main>
    <h1>Cambia esto</h1>
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

// Un h1 con texto propio, distinto del sembrado. Recibe el `doc` del template
// ya parseado, que es lo que comprobarVue le pasa a cada requisito de template.
function h1Cambiado(doc) {
  const t = textoDel(doc, 'h1')
  if (!t) return 'El <h1> del template se ha quedado sin texto, o ya no está.'
  if (t === H1_SEMBRADO) return 'Sigue diciendo «Cambia esto». Pon lo que tú quieras.'
  return null
}

export default {
  numero: 1,
  acto: 'Un componente',
  titulo: 'Mundo 1 · Esto es App.vue',

  entradilla: {
    quien: 'wayne',
    texto:
      'Bienvenida a tu primera aplicación. Todo lo que ves a la derecha sale de un solo fichero: App.vue. ' +
      'No es magia, es un componente. Y un componente es un papel con tres cajones. Ya verás.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
</script>

<template>
  <main>
    <h1>Sombreros que merecen la pena</h1>
    <p>Una colección pequeña y con muy poco criterio.</p>
    <p>Puede que crezca. O puede que no. Ya se verá.</p>
    <h2>Cómo se lee esto</h2>
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
    titulo: 'Qué es un componente',
    cuerpo: `Todo lo que ves a la derecha sale de un fichero: \`App.vue\`. Ese es el componente principal de tu aplicación, y de él cuelga todo lo demás.

Un componente Vue es un fichero con extensión \`.vue\` y tres cajones. Cada cajón guarda una cosa distinta, y —esto es lo importante— **cada uno es un lenguaje que ya vas a ir aprendiendo aquí mismo**:

**El cajón \`<template>\`: lo que se ve.** Dentro va HTML. Etiquetas, texto, estructura. Cuando escribes \`<h1>Hola</h1>\` aquí, aparece un título en la página. Todo el HTML que existe funciona dentro del template.

**El cajón \`<style>\`: cómo se ve.** Dentro va CSS. Colores, tamaños, márgenes. Y fíjate en la palabra \`scoped\` que hay al lado: significa que ese estilo **solo afecta a este componente**, no al resto de la aplicación. Es una de las mejores ideas de Vue, y ya volveremos a ella.

**El cajón \`<script setup>\`: la lógica.** Dentro va JavaScript. Aquí es donde el componente piensa: guarda datos, reacciona a lo que hace la persona, decide qué mostrar. De momento está vacío, y no pasa nada: un componente puede vivir sin lógica.

**El orden no importa, pero la costumbre sí.** Casi todo el mundo los escribe en el orden script, template, style. No es obligatorio; es que leerlo siempre igual ayuda.

**Lo que casi todo el mundo entiende mal al empezar:** que Vue es "otra cosa" distinta de HTML, CSS y JavaScript. No lo es. Vue es una forma de juntar esos tres en una caja reutilizable. Si aprendes a manejar un componente, estás aprendiendo los tres lenguajes a la vez, en el sitio donde de verdad se usan.

**Y una tranquilidad:** el fichero que tú tocas es el que se ejecuta. Guardas, y la página de la derecha se actualiza sola, al instante. Eso que hace la magia por debajo se llama Vite, y ya lo iremos conociendo. Por ahora: tú escribe, y mira.`,
  },

  pasos: [
    {
      id: '1-1',
      titulo: 'Cámbiale el nombre',
      enunciado:
        'A la derecha, el texto grande sale del <code>&lt;h1&gt;</code> que hay dentro del bloque <code>&lt;template&gt;</code> de <code>App.vue</code>. Ahora dice <strong>Cambia esto</strong>. Búscalo, escribe lo que quieras, y mira cómo la vista previa cambia sola.',
      pista: 'Solo el texto de en medio, entre <code>&lt;h1&gt;</code> y <code>&lt;/h1&gt;</code>. No toques las etiquetas.',
      comprobar: comprobarVue({
        template: [h1Cambiado],
        exito: (partido) => {
          const t = textoDel(leerHtml(partido.template), 'h1')
          return `Ya pone «${t}», y lo has cambiado tú en un componente Vue de verdad. Sin instalar nada.`
        },
      }),
    },

    eleccion({
      id: '1-2',
      titulo: 'Los tres cajones',
      enunciado:
        'Un componente <code>.vue</code> tiene tres bloques. ¿Cuál de estas parejas está bien emparejada?',
      pista: 'Piensa en qué lenguaje va dentro de cada uno.',
      opciones: [
        {
          texto: 'template = HTML (lo que se ve), style = CSS (cómo se ve), script = JavaScript (la lógica).',
          correcta: true,
          porque:
            'Exacto. Y por eso aprender a manejar un componente es aprender los tres lenguajes a la vez, en el sitio donde se usan.',
        },
        {
          texto: 'template = la lógica, script = lo que se ve, style = los datos.',
          porque:
            'Al revés: lo que se ve va en template, y la lógica en script. El style no guarda datos, guarda el aspecto.',
        },
        {
          texto: 'Los tres bloques hacen lo mismo, es solo una cuestión de orden.',
          porque:
            'No: cada uno guarda una cosa distinta y un lenguaje distinto. Meter CSS en el template no funciona.',
        },
        {
          texto: 'template y script son de Vue; style es HTML normal.',
          porque:
            'Los tres son parte del componente Vue. Y el style es CSS, no HTML. El HTML va en el template.',
        },
      ],
    }),

    {
      id: '1-3',
      titulo: 'Añade una descripción',
      enunciado:
        'Debajo del <code>&lt;h1&gt;</code>, dentro del mismo <code>&lt;main&gt;</code>, escribe un párrafo con <code>&lt;p&gt;</code> describiendo tu catálogo. Al menos quince caracteres.',
      pista: 'Un párrafo se abre con <code>&lt;p&gt;</code> y se cierra con <code>&lt;/p&gt;</code>. Va en el template, después del <code>&lt;/h1&gt;</code>.',
      comprobar: comprobarVue({
        template: [
          hay('p', { conTexto: true, falta: 'Todavía no hay ningún <p> con texto en el template.' }),
          textoDeAlMenos('p', 15, {
            corto: (n, m) => `El párrafo tiene ${n} caracteres y hacen falta ${m}. Cuenta algo más.`,
          }),
        ],
        exito: 'Un título y una descripción. Eso ya es una página, dentro de tu componente.',
      }),
    },

    completar({
      id: '1-4',
      titulo: 'Los nombres de los bloques',
      enunciado: 'Rellena los huecos con el nombre de cada bloque de un componente (sin los ángulos).',
      pista: 'Son los tres cajones de la lección: el de la lógica, el de lo que se ve y el del aspecto.',
      plantilla: `<___ setup>  ... la lógica
<___>        ... lo que se ve
<___ scoped> ... cómo se ve`,
      huecos: [
        { respuestas: ['script'], porque: 'La lógica va en el bloque script.' },
        { respuestas: ['template'], porque: 'Lo que se ve va en el bloque template.' },
        {
          respuestas: ['style'],
          porque: 'El aspecto va en el bloque style. Y ese "scoped" hace que solo afecte a este componente.',
        },
      ],
    }),

    {
      id: '1-5',
      titulo: 'Y un segundo párrafo',
      enunciado:
        'Añade otro <code>&lt;p&gt;</code>, con un texto distinto del primero. Fíjate en que se apilan, uno debajo del otro, sin que hayas dicho nada.',
      pista: 'Copiar el que tienes y cambiarle el texto vale perfectamente.',
      comprobar: comprobarVue({
        template: [
          hay('p', {
            minimo: 2,
            conTexto: true,
            pocos: (n) => `Llevas ${n} párrafo${n === 1 ? '' : 's'} con texto. Hacen falta 2.`,
          }),
          (doc) => {
            const textos = buscarTodos(doc, 'p').map((p) => textoDe(p).toLowerCase()).filter(Boolean)
            return new Set(textos).size < 2 ? 'Los dos párrafos dicen lo mismo. Cámbiale el texto a uno.' : null
          },
        ],
        exito: 'Dos párrafos apilados. El template los coloca solos, en el orden en que los escribes.',
      }),
    },

    emparejar({
      id: '1-6',
      titulo: 'Qué va en cada bloque',
      enunciado: 'Une cada trozo de código con el bloque donde tiene que ir.',
      pista: 'Una etiqueta va en el template, una regla de color en el style, una variable en el script.',
      pares: [
        { izquierda: '<h1>Sombreros</h1>', derecha: 'template' },
        { izquierda: 'color: brown;', derecha: 'style' },
        {
          izquierda: "const titulo = ref('x')",
          derecha: 'script',
          porque: 'Una variable es lógica, y la lógica vive en el script.',
        },
      ],
      porque: 'Cada trozo tiene su cajón. Meter una etiqueta en el style, o una regla de CSS en el template, no funciona.',
    }),

    verdaderoFalso({
      id: '1-7',
      titulo: 'Repaso: cierto o falso',
      enunciado: 'Cuatro afirmaciones sobre lo que has visto. Marca cada una.',
      pista: 'Si dudas, vuelve a la lección de Wax.',
      afirmaciones: [
        {
          texto: 'El HTML que escribes en el template es HTML normal y corriente.',
          cierto: true,
          porque: 'Cierto. El template es HTML; por eso lo que aprendas aquí sirve en cualquier web.',
        },
        {
          texto: 'Un componente no funciona si el bloque <script> está vacío.',
          cierto: false,
          porque: 'Falso: un componente puede vivir sin lógica. El tuyo lleva el script vacío y funciona.',
        },
        {
          texto: 'El "scoped" del style hace que ese CSS solo afecte a este componente.',
          cierto: true,
          porque: 'Cierto, y es una de las mejores ideas de Vue: el estilo no se escapa a otros componentes.',
        },
        {
          texto: 'Vue es algo completamente distinto de HTML, CSS y JavaScript.',
          cierto: false,
          porque: 'Falso: Vue es una forma de juntar esos tres en una caja reutilizable, no un sustituto.',
        },
      ],
    }),

    {
      id: '1-8',
      titulo: 'Un componente completo',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja tu <code>App.vue</code> con <strong>todo</strong> a la vez en el template: un <code>&lt;h1&gt;</code> tuyo, al menos <strong>dos párrafos</strong> distintos, y un <code>&lt;h2&gt;</code> con un subtítulo. Es la primera vez que juntas lo aprendido en un solo componente.',
      comprobar: comprobarVue({
        template: [
          h1Cambiado,
          (doc) => {
            const parrafos = buscarTodos(doc, 'p').filter((p) => textoDe(p).length >= 10)
            if (parrafos.length < 2) return `Faltan párrafos: llevas ${parrafos.length} de 2.`
            const distintos = new Set(parrafos.map((p) => textoDe(p).toLowerCase()))
            return distintos.size < 2 ? 'Los párrafos dicen lo mismo. Que sean distintos.' : null
          },
          hay('h2', { conTexto: true, falta: 'Falta el <h2> con un subtítulo.' }),
        ],
        exito:
          'Ahí está: un componente entero, escrito por ti, con su estructura completa. Ya sabes leer y tocar cualquier App.vue.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Y ya está tu primer componente. Fíjate en lo que no ha pasado: nada ha explotado, no has instalado nada raro, ' +
      'y cada vez que guardabas, la cosa de la derecha te hacía caso. Así se trabaja de verdad. Lo demás son más cajones.',
  },
}
