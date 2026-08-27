// Mundo 23 (Vue) — fetch: pedir datos a un servidor.
//
// Abre el Acto VII. Los sombreros dejan de estar escritos en el código y pasan
// a un fichero JSON que se pide por la red con fetch + async/await, desde
// onMounted, con su estado de carga. El primer contacto con lo asíncrono.
//
// El JSON vive en public/sombreros.json: en un proyecto Vite, lo de public/
// se sirve tal cual, así que fetch('/sombreros.json') es una petición HTTP
// de verdad, aunque todo ocurra en tu máquina.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  ficheroContiene,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <section class="catalogo">
      <p>Aquí irán los sombreros… cuando lleguen del servidor.</p>
    </section>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`

const JSON_SEMBRADO = `[
  { "id": 1, "nombre": "Bombín de fieltro", "precio": 42 },
  { "id": 2, "nombre": "Panamá de verano", "precio": 35 },
  { "id": 3, "nombre": "Gorra de leñador", "precio": 18 },
  { "id": 4, "nombre": "Boina clásica", "precio": 22 }
]
`

export default {
  numero: 23,
  acto: 'El servidor',
  titulo: 'Mundo 23 · Pedir datos: fetch',

  entradilla: {
    quien: 'wax',
    texto:
      'Hasta hoy, los sombreros estaban escritos dentro del código. En una tienda real viven en un servidor, y la página los PIDE ' +
      'al arrancar. Ese pedir tiene una peculiaridad que lo cambia todo: tarda. Milisegundos o segundos, pero tarda. ' +
      'Programar con esperas se llama asincronía, y hoy le pierdes el miedo con fetch y await.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
    'public/sombreros.json': JSON_SEMBRADO,
  },

  solucion: {
    'public/sombreros.json': JSON_SEMBRADO,
    'src/App.vue': `<script setup>
import { onMounted, ref } from 'vue'

const sombreros = ref([])
const cargando = ref(true)

async function pedirSombreros() {
  const respuesta = await fetch('/sombreros.json')
  const datos = await respuesta.json()
  sombreros.value = datos
  cargando.value = false
}

onMounted(() => {
  pedirSombreros()
})
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <p v-if="cargando">Cargando sombreros…</p>

    <section v-else class="catalogo">
      <article v-for="s in sombreros" :key="s.id" class="ficha">
        <h2>{{ s.nombre }}</h2>
        <p>{{ s.precio }} €</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.catalogo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}

.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Asincronía: programar con esperas',
    cuerpo: `Todo lo que has escrito hasta hoy era **instantáneo**: cambias un ref, la página responde, sin esperas. Pedir algo por la red rompe esa comodidad: la petición sale, viaja, y la respuesta llega **cuando llega**. JavaScript no se queda congelado esperando (sería una página muerta); sigue con lo suyo y retoma tu código cuando hay respuesta. A eso se le llama **asincronía**, y tiene su gramática:

**fetch: la función de pedir.**

\`\`\`
const respuesta = await fetch('/sombreros.json')
const datos = await respuesta.json()
\`\`\`

\`fetch(direccion)\` lanza una petición HTTP —la misma clase de petición que hace el navegador cuando visitas una página—. Pero no devuelve los datos: devuelve una **promesa**, un "te lo daré cuando lo tenga". La palabra \`await\` es la que espera a que la promesa se cumpla y te entrega el valor de verdad. Dos awaits, porque hay dos esperas: una para la respuesta (las cabeceras llegan primero) y otra para leer su cuerpo como JSON (\`respuesta.json()\` también es asíncrono).

**async: el permiso para usar await.** \`await\` solo puede vivir dentro de una función marcada como \`async\`:

\`\`\`
async function pedirSombreros() {
  const respuesta = await fetch('/sombreros.json')
  const datos = await respuesta.json()
  sombreros.value = datos
  cargando.value = false
}
\`\`\`

Se lee de arriba abajo, como código normal —esa es la gracia de async/await: la asincronía con cara de secuencia—. Pide, espera, convierte, guarda en el ref… y la reactividad de siempre pinta el catálogo. Los datos llegaron por la red y entraron por la misma puerta que todos: un ref.

**¿Cuándo pedir? Al arrancar: \`onMounted\`.** El del Mundo 14, en su papel estelar: el componente se monta, la petición sale. Es EL patrón de carga de datos de Vue, lo verás en todos los proyectos.

**El estado de carga, que no es opcional.** Entre que la petición sale y los datos llegan hay un hueco de tiempo en el que tu página está… ¿cómo? Sin esto, en blanco y muda:

\`\`\`
const cargando = ref(true)   // empieza cargando

<p v-if="cargando">Cargando sombreros…</p>
<section v-else> … el catálogo … </section>
\`\`\`

Empieza en \`true\`, y la función lo apaga cuando los datos están. En tu máquina el hueco dura un parpadeo; con una red lenta, segundos. Diseñar ese hueco es parte del oficio.

**¿Y el JSON?** Ya lo conoces del Mundo 14: el idioma de texto para datos. Un fichero \`.json\` es eso mismo: tu \`public/sombreros.json\` es un array de objetos en texto plano, con comillas dobles en las claves (regla de JSON). En un proyecto Vite, lo que pongas en \`public/\` se sirve tal cual en la raíz: \`fetch('/sombreros.json')\` es una petición HTTP real. Hoy responde tu propio servidor de desarrollo; el día de mañana, cambias la dirección por la de una API de verdad y el código es EL MISMO. Eso es lo bonito: ya sabes hablar con servidores.`,
  },

  pasos: [
    {
      id: '23-1',
      titulo: 'Los refs de la espera',
      enunciado:
        'En el script de App.vue: los dos refs del patrón, <code>const sombreros = ref([])</code> (vacío: aún no hay datos) y <code>const cargando = ref(true)</code> (empezamos esperando). Con sus imports.',
      pista: 'Importa ref y onMounted de vue (el onMounted lo usarás enseguida).',
      comprobar: comprobarVue({
        script: [
          (script) =>
            /const\s+sombreros\s*=\s*ref\s*\(\s*\[\s*\]\s*\)/.test(script)
              ? null
              : 'Falta const sombreros = ref([]) — vacío, porque aún no han llegado.',
          (script) =>
            /const\s+cargando\s*=\s*ref\s*\(\s*true\s*\)/.test(script)
              ? null
              : 'Falta const cargando = ref(true) — la página nace esperando.',
        ],
        exito: 'El terreno preparado: un sitio para los datos y una bandera para la espera.',
      }),
    },

    {
      id: '23-2',
      titulo: 'La función que pide',
      enunciado:
        'La función asíncrona: <code>async function pedirSombreros()</code> con sus dos <code>await</code> (el <code>fetch(\'/sombreros.json\')</code> y el <code>respuesta.json()</code>), guardando en <code>sombreros.value</code> y apagando <code>cargando</code>.',
      pista: 'Las cuatro líneas del apunte, en orden: fetch, json, guardar, apagar la bandera.',
      comprobar: comprobarVue({
        script: [
          (script) =>
            /async\s+function\s+pedirSombreros|const\s+pedirSombreros\s*=\s*async/.test(script)
              ? null
              : 'La función tiene que ser async: async function pedirSombreros().',
          (script) =>
            /await\s+fetch\s*\(\s*['"]\/sombreros\.json['"]\s*\)/.test(script)
              ? null
              : "Falta el await fetch('/sombreros.json').",
          (script) =>
            /await\s+\w+\.json\s*\(\s*\)/.test(script)
              ? null
              : 'Falta el segundo await: respuesta.json() también es asíncrono.',
          (script) =>
            /sombreros\.value\s*=/.test(script) ? null : 'Los datos tienen que acabar en sombreros.value.',
          (script) =>
            /cargando\.value\s*=\s*false/.test(script) ? null : 'Al final, apaga la bandera: cargando.value = false.',
        ],
        exito: 'Pedir, esperar, convertir, guardar, avisar. La coreografía completa de una petición, legible de arriba abajo.',
      }),
    },

    {
      id: '23-3',
      titulo: 'Dispara al montar',
      enunciado: 'Engancha la petición al arranque: <code>onMounted(() =&gt; { pedirSombreros() })</code>.',
      pista: 'El gancho del Mundo 14. El componente se monta, la petición sale.',
      comprobar: comprobarVue({
        script: [
          (script) =>
            /onMounted\s*\(\s*(\(\s*\)\s*=>[\s\S]*?pedirSombreros|pedirSombreros)/.test(script)
              ? null
              : 'Falta el onMounted que llame a pedirSombreros().',
        ],
        exito: 'Petición disparada al nacer. Es EL patrón de carga de Vue: montar → pedir → pintar.',
      }),
    },

    {
      id: '23-4',
      titulo: 'La espera visible',
      enunciado:
        'El template del patrón: <code>&lt;p v-if="cargando"&gt;Cargando sombreros…&lt;/p&gt;</code> y el catálogo en el <code>v-else</code>, con su v-for de fichas (nombre y precio) recorriendo <code>sombreros</code>.',
      pista: 'Mientras cargando sea true, el mensaje; cuando la función lo apague, el catálogo.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/v-if\s*=\s*["']cargando["']/, 'Falta el mensaje de carga con v-if="cargando".'),
          plantillaContiene(/v-else(?![-\w])/, 'Falta el v-else con el catálogo.'),
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+sombreros/, 'Falta el v-for sobre sombreros.'),
        ],
        exito: 'Guarda y mira la vista previa: un parpadeo de «Cargando…» y el catálogo aparece. Acaba de viajar por HTTP, aunque no haya salido de tu máquina.',
      }),
    },

    eleccion({
      id: '23-5',
      titulo: 'Qué espera el await',
      enunciado: '¿Por qué <code>const datos = fetch(\'/sombreros.json\')</code> SIN await no funciona?',
      pista: '¿Qué devuelve fetch en el instante en que lo llamas?',
      opciones: [
        {
          texto: 'Porque fetch devuelve una promesa (un "te lo daré"), no los datos; el await es quien espera el valor real.',
          correcta: true,
          porque: 'Exacto: sin await, datos sería la promesa misma, un objeto raro que no es tu array. await desenvuelve el regalo cuando llega.',
        },
        {
          texto: 'Porque a fetch le falta un segundo parámetro obligatorio.',
          porque: 'fetch con solo la dirección es perfectamente válido (hace un GET). El problema es no esperar lo que devuelve.',
        },
        {
          texto: 'Funciona igual: await es decorativo.',
          porque: 'Ojalá: la mitad de los bugs de principiante con fetch son exactamente esto. Sin await, tienes una promesa donde esperabas datos.',
        },
      ],
    }),

    verdaderoFalso({
      id: '23-6',
      titulo: 'Cierto o falso: asincronía',
      enunciado: 'Cinco frases sobre fetch y las esperas. Todas.',
      pista: 'Promesas, async, y el hueco de la carga.',
      afirmaciones: [
        { texto: 'await solo puede usarse dentro de una función async.', cierto: true, porque: 'Cierto: async marca la función como "puede esperar", y eso habilita los await de dentro.' },
        { texto: 'Mientras un await espera, la página entera se congela.', cierto: false, porque: 'Falso: esa es la gracia. La función se pausa, pero la página sigue viva y responde.' },
        { texto: 'Hacen falta dos await: uno para la respuesta y otro para leer el JSON.', cierto: true, porque: 'Cierto: las cabeceras llegan primero, el cuerpo después. Dos esperas, dos await.' },
        { texto: 'El estado de carga es un adorno para redes lentas ajenas.', cierto: false, porque: 'Falso: el hueco SIEMPRE existe; en tu máquina dura poco, en el mundo real no. Diseñarlo es parte del trabajo.' },
        { texto: 'En Vite, lo que pones en public/ se sirve tal cual desde la raíz.', cierto: true, porque: 'Cierto: por eso fetch(\'/sombreros.json\') encuentra tu fichero. Es una petición HTTP de verdad.' },
      ],
    }),

    completar({
      id: '23-7',
      titulo: 'La petición de memoria',
      enunciado: 'Completa el esqueleto de toda petición de datos.',
      pista: 'El permiso, la espera, y la segunda espera del cuerpo.',
      plantilla: `___ function pedir() {
  const respuesta = ___ fetch('/sombreros.json')
  const datos = await respuesta.___()
  sombreros.value = datos
}`,
      huecos: [
        { respuestas: ['async'], porque: 'async da permiso para usar await dentro.' },
        { respuestas: ['await'], porque: 'await espera la promesa del fetch y entrega la respuesta.' },
        { respuestas: ['json'], porque: '.json() lee el cuerpo y lo convierte; también con su await.' },
      ],
    }),

    ordenar({
      id: '23-8',
      titulo: 'La vida de una petición',
      enunciado: 'Ordena lo que pasa desde que se abre la página hasta que se ve el catálogo.',
      pista: 'Montar, pedir, esperar enseñando algo, llegar, pintar.',
      lineas: [
        'El componente se monta y onMounted dispara pedirSombreros()',
        'fetch lanza la petición HTTP y la función se pausa en el await',
        'Mientras, el template enseña «Cargando…» (cargando es true)',
        'La respuesta llega y respuesta.json() la convierte en array',
        'sombreros.value se llena, cargando se apaga y el v-else pinta el catálogo',
      ],
      porque: 'Montar → pedir → esperar visible → llegar → pintar. Este ciclo es el arranque de prácticamente todas las apps conectadas del mundo.',
    }),

    {
      id: '23-9',
      titulo: 'El catálogo servido',
      sintesis: true,
      enunciado:
        'Sin pistas. El patrón entero: los refs <code>sombreros</code> ([]) y <code>cargando</code> (true), la función <code>async</code> con sus dos <code>await</code> que guarda y apaga, el <code>onMounted</code> que la dispara, y el template con la espera visible y el catálogo en v-else. Los datos, llegando por HTTP desde <code>public/sombreros.json</code>.',
      comprobar: comprobarVue({
        script: [
          (script) => (/const\s+cargando\s*=\s*ref\s*\(\s*true\s*\)/.test(script) ? null : 'Falta cargando = ref(true).'),
          (script) => (/async/.test(script) ? null : 'Falta la función async.'),
          (script) => (/await\s+fetch\s*\(/.test(script) ? null : 'Falta el await fetch.'),
          (script) => (/await\s+\w+\.json\s*\(\s*\)/.test(script) ? null : 'Falta el await del .json().'),
          (script) => (/onMounted\s*\(/.test(script) ? null : 'Falta el onMounted.'),
          (script) => (/cargando\.value\s*=\s*false/.test(script) ? null : 'Falta apagar cargando al terminar.'),
        ],
        template: [
          plantillaContiene(/v-if\s*=\s*["']cargando["']/, 'Falta la espera visible.'),
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+sombreros/, 'Falta el catálogo con su v-for.'),
        ],
        exito:
          'Datos pedidos por la red, espera diseñada, catálogo pintado. El código que has escrito funcionaría igual contra una API en la otra punta del mundo: solo cambiaría la dirección. Falta un detalle: ¿y si la petición FALLA? Siguiente mundo.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Ha pasado algo grande y casi ni se ha notado: tus datos ya no viven en el código, viven fuera, y tu página los pide como piden ' +
      'las de verdad. El «Cargando…» ese que has puesto lo has visto mil veces en otras webs; ahora sabes quién lo pinta y por qué. ' +
      'Lo que no hemos tocado: ¿y si el servidor dice que no? Mañana… es decir, ahora.',
  },
}
