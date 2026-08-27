// Mundo 8 (Vue) — El primer dato: ref y las llaves dobles.
//
// Abre el Acto III. Hasta ahora el template era una foto: todo escrito a mano.
// Aquí aparece la idea central de Vue: los datos viven en el script, el
// template los muestra con {{ }}, y cuando el dato cambia, la página cambia
// sola. Reactividad. La alumna crea sus primeros ref y los interpola.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  plantillaContiene,
  scriptContiene,
  scriptDeclara,
  scriptDefine,
  scriptImporta,
  scriptLlama,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

// Requisito de template como texto: las llaves dobles y las directivas no
// sobreviven bien al DOMParser, así que se buscan sobre el texto crudo.
const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>El Sombrero</h1>
    <p>Sombreros en el catálogo: 3</p>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}
</style>
`

export default {
  numero: 8,
  acto: 'Datos',
  titulo: 'Mundo 8 · El primer dato',

  entradilla: {
    quien: 'wayne',
    texto:
      'Hasta hoy, si querías cambiar ese "3" de la página, ibas y lo reescribías a mano. A partir de hoy, no: ' +
      'el número vive en una variable, el template lo enseña, y cuando la variable cambie, la página se entera sola. ' +
      'Suena a poco. Es el truco sobre el que está montado todo Vue.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'

const titulo = ref('El Sombrero')
const enCatalogo = ref(3)
const abierto = ref(true)
</script>

<template>
  <main>
    <h1>{{ titulo }}</h1>
    <p>Sombreros en el catálogo: {{ enCatalogo }}</p>
    <p>De los caros: {{ enCatalogo - 1 }}</p>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'ref, las llaves dobles y la reactividad',
    cuerpo: `Este es el mundo donde Vue deja de ser "una forma de organizar HTML y CSS" y enseña su verdadera razón de ser. Tres piezas:

**1. El dato se declara en el script con \`ref\`.**

\`\`\`
import { ref } from 'vue'

const enCatalogo = ref(3)
\`\`\`

La primera línea trae la función \`ref\` desde Vue (los \`import\` van siempre arriba del script). La segunda crea un **dato reactivo**: una caja que guarda el 3 y que, además, avisa a Vue cuando cambie. Eso de "avisa" es la clave, y enseguida verás por qué.

**2. El template lo muestra con llaves dobles.**

\`\`\`
<p>Sombreros en el catálogo: {{ enCatalogo }}</p>
\`\`\`

Las \`{{ }}\` se llaman **interpolación**: donde las pongas, Vue escribe el valor actual del dato. Ya no hay un "3" escrito a mano; hay una ventana que enseña lo que haya en la variable. Dentro de las llaves cabe una expresión entera: \`{{ enCatalogo - 1 }}\`, \`{{ titulo.toUpperCase() }}\`… pero la regla de estilo es mantenerlas simples.

**3. Cuando el dato cambia, la página cambia. Sola.**

Esto es la **reactividad**, y es el corazón de Vue: tú cambias \`enCatalogo.value = 4\` en el script, y todos los sitios del template que lo muestran se actualizan al instante, sin que toques el DOM, sin buscar el elemento, sin reescribir nada. Vue lleva la cuenta de qué depende de qué.

**El detalle del \`.value\`, que confunde a todo el mundo una vez** (y solo una, si lo lees con calma): dentro del **script**, un ref es una caja, y para tocar lo de dentro escribes \`enCatalogo.value\`. En el **template**, Vue desenvuelve la caja por ti: escribes \`{{ enCatalogo }}\` a secas. Script → con \`.value\`. Template → sin él. Cuando te salga un \`[object Object]\` raro o un "no cambia nada", el noventa por ciento de las veces es esto.

**¿Y por qué no una variable normal?** Porque una \`const n = 3\` no avisa a nadie al cambiar. Vue no se enteraría, y la página se quedaría vieja. \`ref\` es una variable con timbre: cada cambio llama al timbre y Vue repinta lo que toque.

**Tipos de dato que caben en un ref:** los que ya conoces de cualquier lenguaje. Un texto (\`ref('El Sombrero')\`), un número (\`ref(3)\`), un booleano —verdadero o falso— (\`ref(true)\`), y más adelante listas y objetos. El catálogo entero acabará viviendo en uno.`,
  },

  pasos: [
    {
      id: '8-1',
      titulo: 'Importa la herramienta',
      enunciado:
        'En el <code>&lt;script setup&gt;</code>, primera línea: trae <code>ref</code> desde Vue con <code>import { ref } from \'vue\'</code>.',
      pista: 'Va dentro del bloque script, arriba del todo. Las llaves de {  ref  } son parte de la sintaxis.',
      comprobar: comprobarVue({
        script: [
          scriptImporta('ref', 'vue', {
            falta: "Falta el import: la línea import { ref } from 'vue' en el script.",
          }),
        ],
        exito: 'Herramienta importada. Ya puedes crear datos reactivos en este componente.',
      }),
    },

    {
      id: '8-2',
      titulo: 'El primer ref',
      enunciado:
        'Debajo del import, crea tu primer dato: <code>const enCatalogo = ref(3)</code>. Un número que a partir de ahora vive en el script.',
      pista: 'Una constante normal cuyo valor es ref(3): <code>const enCatalogo = ref(3)</code>.',
      comprobar: comprobarVue({
        script: [
          scriptDeclara('enCatalogo', {
            llamando: 'ref',
            con: 'numero',
            falta: 'Falta la línea const enCatalogo = ref(3) en el script.',
            malo: 'enCatalogo tiene que crearse con ref() y un número dentro.',
          }),
        ],
        exito: 'Un dato reactivo: una caja con un 3 dentro y un timbre que avisa a Vue cuando cambie.',
      }),
    },

    {
      id: '8-3',
      titulo: 'Enséñalo con llaves',
      enunciado:
        'En el template, el "3" sigue escrito a mano. Sustitúyelo por la interpolación: <code>{{ enCatalogo }}</code>. Guarda y comprueba que la página enseña lo mismo… pero ahora sale del dato.',
      pista: 'Cambia <code>: 3</code> por <code>: {{ enCatalogo }}</code>. Las llaves dobles enseñan el valor actual.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(
            /\{\{\s*enCatalogo\s*\}\}/,
            'El template aún no interpola {{ enCatalogo }}. Sustituye el número escrito a mano.',
          ),
        ],
        exito: 'Mismo aspecto, mundo distinto: el número ya no está en la página, está en el dato. Cambia el ref(3) por ref(7) y mira la vista previa.',
      }),
    },

    eleccion({
      id: '8-4',
      titulo: 'El asunto del .value',
      enunciado: 'Tienes <code>const precio = ref(42)</code>. Quieres subirlo a 45 <strong>desde el script</strong>. ¿Cómo?',
      pista: 'Dentro del script, el ref es una caja. ¿Cómo se toca lo de dentro de una caja?',
      opciones: [
        {
          texto: 'precio.value = 45 — en el script, el ref se toca por su .value.',
          correcta: true,
          porque: 'Eso es. Script → con .value. Template → sin él (Vue lo desenvuelve). Grábatelo y te ahorras el error más común de Vue.',
        },
        {
          texto: 'precio = 45 — es una variable, se asigna y ya.',
          porque: 'Dos problemas: es const (no se puede reasignar) y machacarías la caja entera en vez de cambiar lo de dentro. Es precio.value = 45.',
        },
        {
          texto: '{{ precio = 45 }} en el template.',
          porque: 'El template es para ENSEÑAR datos, no para asignarlos. Los cambios se hacen en el script (o con eventos, que llegan en el próximo mundo).',
        },
      ],
    }),

    {
      id: '8-5',
      titulo: 'El título también es un dato',
      enunciado:
        'Crea otro ref, esta vez con texto: <code>const titulo = ref(\'El Sombrero\')</code> (o el nombre que le quieras dar a tu web). Y en el template, cambia el contenido del <code>&lt;h1&gt;</code> por <code>{{ titulo }}</code>.',
      pista: 'El texto va entre comillas dentro del ref. Luego el h1 queda así: <code>&lt;h1&gt;{{ titulo }}&lt;/h1&gt;</code>.',
      comprobar: comprobarVue({
        script: [
          scriptDeclara('titulo', {
            llamando: 'ref',
            con: 'texto',
            falta: "Falta const titulo = ref('…') con un texto dentro.",
          }),
        ],
        template: [
          plantillaContiene(/\{\{\s*titulo\s*\}\}/, 'El template aún no enseña {{ titulo }}.'),
        ],
        exito: 'Título y número: los dos viven en el script. El template ya solo es un escaparate de tus datos.',
      }),
    },

    verdaderoFalso({
      id: '8-6',
      titulo: 'Cierto o falso: la reactividad',
      enunciado: 'Cinco frases sobre ref y las llaves dobles. Todas.',
      pista: 'Script con .value, template sin él, y el timbre que avisa.',
      afirmaciones: [
        { texto: 'ref crea un dato que avisa a Vue cuando cambia.', cierto: true, porque: 'Cierto: esa es la reactividad. Sin el aviso, la página se quedaría vieja.' },
        { texto: 'En el template hay que escribir {{ enCatalogo.value }}.', cierto: false, porque: 'Falso: en el template Vue desenvuelve el ref solo. El .value es para el script.' },
        { texto: 'Dentro de {{ }} cabe una expresión, como {{ precio * 2 }}.', cierto: true, porque: 'Cierto, aunque conviene mantenerlas simples y dejar los cálculos gordos para el script.' },
        { texto: 'Una const normal (sin ref) también actualiza la página al cambiar.', cierto: false, porque: 'Falso: una variable normal no tiene timbre. Vue no se entera y la página no se repinta.' },
        { texto: 'Los import van arriba del script, antes de usarse.', cierto: true, porque: 'Cierto: primero traes la herramienta, luego la usas. Es la convención de todo JavaScript moderno.' },
      ],
    }),

    completar({
      id: '8-7',
      titulo: 'La receta del dato',
      enunciado: 'Completa el camino entero de un dato: importar, crear, enseñar.',
      pista: 'La función que se importa, la palabra que declara, y lo que envuelve al dato en el template.',
      plantilla: `import { ___ } from 'vue'

const precio = ___(42)

// y en el template:
// <p>Precio: {{ ___ }}</p>`,
      huecos: [
        { respuestas: ['ref'], porque: 'Se importa ref desde vue.' },
        { respuestas: ['ref'], porque: 'ref(42) crea la caja reactiva con el 42 dentro.' },
        { respuestas: ['precio'], porque: 'En el template va el nombre a secas: {{ precio }}, sin .value.' },
      ],
    }),

    ordenar({
      id: '8-8',
      titulo: 'Qué pasa cuando un dato cambia',
      enunciado: 'Ordena la cadena de la reactividad, de la causa al efecto.',
      pista: 'Empieza en el script y acaba en la pantalla.',
      lineas: [
        'El script cambia el dato: enCatalogo.value = 4',
        'El ref avisa a Vue de que ha cambiado',
        'Vue localiza qué partes del template dependen de él',
        'La página se repinta, solo en esas partes',
      ],
      porque: 'Esa cadena es Vue entero: tú tocas el dato, él toca la página. Nunca al revés, y nunca a mano.',
    }),

    emparejar({
      id: '8-9',
      titulo: 'Cada pieza en su sitio',
      enunciado: 'Une cada trozo con lo que es.',
      pista: 'Importar, crear, tocar desde el script, enseñar en el template.',
      pares: [
        { izquierda: "import { ref } from 'vue'", derecha: 'traer la herramienta' },
        { izquierda: 'const n = ref(3)', derecha: 'crear el dato reactivo' },
        { izquierda: 'n.value = 4', derecha: 'cambiarlo desde el script', porque: 'En el script, siempre por el .value.' },
        { izquierda: '{{ n }}', derecha: 'enseñarlo en el template' },
      ],
      porque: 'Importar, crear, cambiar, enseñar: el ciclo de vida completo de un dato en Vue. Lo harás tantas veces que te saldrá solo.',
    }),

    {
      id: '8-10',
      titulo: 'Una página que sale de los datos',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja el componente con: el import de <code>ref</code>, al menos <strong>dos</strong> refs (<code>titulo</code> con texto y <code>enCatalogo</code> con número), el <code>&lt;h1&gt;</code> enseñando <code>{{ titulo }}</code>, el párrafo enseñando <code>{{ enCatalogo }}</code>, y en algún sitio una interpolación con una <strong>expresión</strong> (por ejemplo <code>{{ enCatalogo - 1 }}</code>).',
      comprobar: comprobarVue({
        script: [
          scriptImporta('ref', 'vue', { falta: 'Falta el import de ref.' }),
          scriptDeclara('titulo', { llamando: 'ref', falta: 'Falta el ref de titulo.' }),
          scriptDeclara('enCatalogo', { llamando: 'ref', falta: 'Falta el ref de enCatalogo.' }),
        ],
        template: [
          plantillaContiene(/\{\{\s*titulo\s*\}\}/, 'El template no enseña {{ titulo }}.'),
          plantillaContiene(/\{\{\s*enCatalogo\s*\}\}/, 'El template no enseña {{ enCatalogo }}.'),
          plantillaContiene(
            /\{\{\s*[^}]*[-+*/][^}]*\}\}/,
            'Falta una interpolación con expresión, tipo {{ enCatalogo - 1 }}.',
          ),
        ],
        exito:
          'La página entera sale de los datos: cambia un ref y todo lo que depende de él se mueve. Acabas de cruzar la puerta de la programación reactiva.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Prueba una cosa antes de irte: cambia el ref(3) por ref(9) y guarda. ¿Ves? No has tocado el HTML y la página se ha puesto al día sola. ' +
      'Ahora imagina eso con un botón que sume, con una lista entera, con un buscador… No lo imagines mucho, que es justo lo que viene.',
  },
}
