// Mundo 20 (Vue) — Rutas con parámetro: una dirección por sombrero.
//
// Cierra el Acto V. La ruta dinámica /sombrero/:id, useRoute para leer el
// parámetro, el enlace con :to compuesto, find para localizar el objeto y el
// caso "no existe". La app ya navega como una tienda de verdad.
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
  <header class="cabecera">
    <h1>El Sombrero</h1>
    <nav>
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/catalogo">Catálogo</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem;
}

nav {
  display: flex;
  gap: 1rem;
}

main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`

const ROUTER_SEMBRADO = `import { createRouter, createWebHistory } from 'vue-router'
import InicioVista from './views/InicioVista.vue'
import CatalogoVista from './views/CatalogoVista.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InicioVista },
    { path: '/catalogo', component: CatalogoVista },
  ],
})

export default router
`

const INICIO_SEMBRADO = `<script setup>
</script>

<template>
  <section>
    <h2>Bienvenida</h2>
    <p>Sombreros elegidos con poco criterio y mucho cariño.</p>
  </section>
</template>

<style scoped>
</style>
`

const CATALOGO_SEMBRADO = `<script setup>
import { sombreros } from '../datos/sombreros.js'
</script>

<template>
  <section>
    <h2>El catálogo</h2>
    <ul>
      <li v-for="s in sombreros" :key="s.id">
        {{ s.nombre }} — {{ s.precio }} €
      </li>
    </ul>
  </section>
</template>

<style scoped>
</style>
`

const DATOS_SEMBRADOS = `// Los datos del catálogo, en su propio fichero: así cualquier vista puede
// importarlos sin duplicar nada.
export const sombreros = [
  { id: 1, nombre: 'Bombín de fieltro', precio: 42, historia: 'Serio por fuera, blando por dentro.' },
  { id: 2, nombre: 'Panamá de verano', precio: 35, historia: 'Para fingir vacaciones un martes.' },
  { id: 3, nombre: 'Gorra de leñador', precio: 18, historia: 'Nunca vio un bosque, lo disimula.' },
]
`

export default {
  numero: 20,
  acto: 'Varias pantallas',
  titulo: 'Mundo 20 · Una dirección por sombrero',

  entradilla: {
    quien: 'wayne',
    texto:
      'En toda tienda que se precie, cada producto tiene su propia dirección: /sombrero/1, /sombrero/2… ¿Vas a escribir una ruta ' +
      'por cada sombrero, a mano, para siempre? No: vas a escribir UNA ruta con un hueco, /sombrero/:id, y el hueco lo rellena ' +
      'quien navega. Es el último truco del router, y de los buenos.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
    'src/router.js': ROUTER_SEMBRADO,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/views/CatalogoVista.vue': CATALOGO_SEMBRADO,
    'src/datos/sombreros.js': DATOS_SEMBRADOS,
  },

  solucion: {
    'src/App.vue': APP_SEMBRADA,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/datos/sombreros.js': DATOS_SEMBRADOS,
    'src/router.js': `import { createRouter, createWebHistory } from 'vue-router'
import InicioVista from './views/InicioVista.vue'
import CatalogoVista from './views/CatalogoVista.vue'
import SombreroVista from './views/SombreroVista.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InicioVista },
    { path: '/catalogo', component: CatalogoVista },
    { path: '/sombrero/:id', component: SombreroVista },
  ],
})

export default router
`,
    'src/views/CatalogoVista.vue': `<script setup>
import { sombreros } from '../datos/sombreros.js'
</script>

<template>
  <section>
    <h2>El catálogo</h2>
    <ul>
      <li v-for="s in sombreros" :key="s.id">
        <RouterLink :to="'/sombrero/' + s.id">{{ s.nombre }}</RouterLink>
        — {{ s.precio }} €
      </li>
    </ul>
  </section>
</template>

<style scoped>
</style>
`,
    'src/views/SombreroVista.vue': `<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { sombreros } from '../datos/sombreros.js'

const ruta = useRoute()

const sombrero = computed(() =>
  sombreros.find((s) => s.id === Number(ruta.params.id)),
)
</script>

<template>
  <section v-if="sombrero">
    <h2>{{ sombrero.nombre }}</h2>
    <p>{{ sombrero.historia }}</p>
    <p><strong>{{ sombrero.precio }} €</strong></p>
    <RouterLink to="/catalogo">← Volver al catálogo</RouterLink>
  </section>

  <section v-else>
    <h2>Ese sombrero no existe</h2>
    <p>O se lo ha llevado alguien con mucha prisa.</p>
    <RouterLink to="/catalogo">Ver el catálogo</RouterLink>
  </section>
</template>

<style scoped>
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Rutas dinámicas: el hueco en la dirección',
    cuerpo: `Tres sombreros, tres direcciones… ¿tres rutas? No: **una ruta con parámetro**. Es la técnica con la que una tienda de un millón de productos tiene un solo fichero de ficha.

**1. La ruta con hueco.** En el mapa:

\`\`\`
{ path: '/sombrero/:id', component: SombreroVista }
\`\`\`

Los dos puntos de \`:id\` marcan un **parámetro**: esa posición de la dirección es variable. \`/sombrero/1\`, \`/sombrero/2\`, \`/sombrero/999\`: todas casan con esta ruta, y el valor queda guardado con el nombre \`id\`.

**2. Leer el parámetro: \`useRoute\`.** Dentro de la vista:

\`\`\`
import { useRoute } from 'vue-router'

const ruta = useRoute()
// ruta.params.id  →  '2' si estás en /sombrero/2
\`\`\`

\`useRoute()\` te da la dirección actual como objeto, con sus \`params\` dentro. **Detalle traicionero:** lo que viene de la dirección es siempre TEXTO. \`ruta.params.id\` es \`'2'\`, con comillas, no \`2\`. Y como tus ids son números, la comparación \`s.id === ruta.params.id\` fallaría en silencio (el \`===\` no perdona tipos distintos). La conversión explícita lo arregla: \`Number(ruta.params.id)\`.

**3. Encontrar el objeto: \`find\`.**

\`\`\`
const sombrero = computed(() =>
  sombreros.find((s) => s.id === Number(ruta.params.id)),
)
\`\`\`

\`find\` es el primo de \`filter\` que devuelve **el primer elemento** que cumple (o \`undefined\` si ninguno). Para "el sombrero con este id", find. Envuelto en computed, si la dirección cambia, el sombrero se re-busca solo.

**4. El caso que olvida todo el mundo: no existe.** ¿Y si alguien teclea \`/sombrero/999\`? \`find\` devuelve \`undefined\`, y sin defensa tu vista peta con el clásico "cannot read properties of undefined". La defensa ya la conoces del Mundo 10:

\`\`\`
<section v-if="sombrero"> … la ficha … </section>
<section v-else> Ese sombrero no existe. </section>
\`\`\`

Tratar el caso vacío no es opcional: es la diferencia entre una app y una demo.

**5. Enlaces compuestos.** En el catálogo, cada nombre enlaza a su ficha. La dirección se construye con el dato, así que el \`to\` va atado con los dos puntos de siempre:

\`\`\`
<RouterLink :to="'/sombrero/' + s.id">{{ s.nombre }}</RouterLink>
\`\`\`

\`:to\` con expresión: el texto \`'/sombrero/'\` más el id. (De paso: los datos se han mudado a \`src/datos/sombreros.js\` con un \`export const\`, para que catálogo y ficha importen LA MISMA lista. Un dato, un dueño, ¿te suena?)

**El broche:** navega del catálogo a una ficha, cambia el id en la barra de direcciones, prueba uno que no exista. Todo responde. Eso es una app con URLs de verdad: cada pantalla es enlazable, compartible y con vuelta atrás. Lo que el usuario espera sin saber que lo espera.`,
  },

  pasos: [
    {
      id: '20-1',
      titulo: 'La ruta con hueco',
      enunciado:
        'En <code>router.js</code>: crea la vista <code>src/views/SombreroVista.vue</code> (de momento con un <code>&lt;h2&gt;Ficha&lt;/h2&gt;</code> vale), impórtala, y añade al mapa la ruta <code>{ path: \'/sombrero/:id\', component: SombreroVista }</code>.',
      pista: 'Los dos puntos de :id son literales en el path: marcan el trozo variable de la dirección.',
      comprobar: comprobarVue({
        template: [
          (_doc, ficheros) =>
            ficheros?.['src/views/SombreroVista.vue'] === undefined
              ? 'Falta crear src/views/SombreroVista.vue.'
              : null,
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/sombrero\/:id['"]/, "Falta la ruta { path: '/sombrero/:id', … } en el mapa."),
          ficheroContiene('src/router.js', /import\s+SombreroVista\s+from/, 'router.js tiene que importar SombreroVista.'),
        ],
        exito: 'Una ruta, infinitas direcciones: /sombrero/1, /sombrero/2… todas caen en tu vista nueva.',
      }),
    },

    {
      id: '20-2',
      titulo: 'Leer el parámetro',
      enunciado:
        'En <code>SombreroVista.vue</code>: importa <code>useRoute</code> de <code>vue-router</code> y los datos de <code>../datos/sombreros.js</code>. Con <code>useRoute()</code> y un computed, busca el sombrero: <code>sombreros.find((s) =&gt; s.id === Number(ruta.params.id))</code>.',
      pista: 'Tres imports (useRoute, computed, sombreros), const ruta = useRoute(), y el find con su Number(): el parámetro llega como texto.',
      comprobar: comprobarVue({
        fichero: 'src/views/SombreroVista.vue',
        script: [
          (script) =>
            /import\s*\{[^}]*useRoute[^}]*\}\s*from\s*['"]vue-router['"]/.test(script)
              ? null
              : 'Falta el import de useRoute desde vue-router.',
          (script) => (/useRoute\s*\(\s*\)/.test(script) ? null : 'Falta const ruta = useRoute().'),
          (script) => (/sombreros\.find\s*\(/.test(script) ? null : 'Falta el find sobre los sombreros.'),
          (script) =>
            /Number\s*\(\s*\w+\.params\.id\s*\)/.test(script)
              ? null
              : 'El parámetro llega como TEXTO: compáralo con Number(ruta.params.id).',
        ],
        exito: 'La vista ya sabe qué sombrero le piden, con el texto de la dirección convertido a número. El gazapo clásico, esquivado.',
      }),
    },

    eleccion({
      id: '20-3',
      titulo: 'El tipo del parámetro',
      enunciado: 'Estás en <code>/sombrero/2</code>. Sin el <code>Number()</code>, ¿qué devuelve <code>sombreros.find((s) =&gt; s.id === ruta.params.id)</code>?',
      pista: '¿Qué compara el ===? ¿El número 2 y el texto \'2\' son iguales para él?',
      opciones: [
        {
          texto: 'undefined: el === compara 2 con \'2\', tipos distintos, nunca iguales.',
          correcta: true,
          porque: 'Exacto, y lo peor es que falla EN SILENCIO: sin error, solo "no encontrado". Por eso la conversión explícita es sagrada con parámetros de ruta.',
        },
        {
          texto: 'El sombrero 2: JavaScript convierte solo.',
          porque: 'Con == (doble) convertiría, y por eso el doble está mal visto. El === (el correcto) exige mismo tipo, y texto ≠ número.',
        },
        {
          texto: 'Un error en la consola señalando la línea.',
          porque: 'Ojalá: sería más fácil de encontrar. No hay error, solo un undefined silencioso. Los peores bugs son los mudos.',
        },
      ],
    }),

    {
      id: '20-4',
      titulo: 'La ficha, con defensa',
      enunciado:
        'El template de <code>SombreroVista</code>: si el sombrero existe (<code>v-if="sombrero"</code>), su nombre, su historia y su precio; si no (<code>v-else</code>), un «no existe» digno con enlace de vuelta al catálogo.',
      pista: 'Dos <section>, una con v-if y otra con v-else. En la vista previa, prueba /sombrero/999 en la barra de direcciones.',
      comprobar: comprobarVue({
        fichero: 'src/views/SombreroVista.vue',
        template: [
          plantillaContiene(/v-if\s*=\s*["']sombrero["']/, 'Falta el v-if="sombrero" que protege la ficha.'),
          plantillaContiene(/v-else(?![-\w])/, 'Falta el v-else con el caso «no existe».'),
          plantillaContiene(/\{\{\s*sombrero\.nombre\s*\}\}/, 'La ficha tiene que enseñar {{ sombrero.nombre }}.'),
          plantillaContiene(/\{\{\s*sombrero\.precio\s*\}\}/, 'Y su precio.'),
        ],
        exito: 'Ficha con paracaídas: el id inventado ya no rompe nada, ofrece una salida. Eso es trato profesional al error.',
      }),
    },

    {
      id: '20-5',
      titulo: 'Los enlaces del catálogo',
      enunciado:
        'En <code>CatalogoVista.vue</code>, convierte cada nombre en enlace a su ficha: <code>&lt;RouterLink :to="\'/sombrero/\' + s.id"&gt;{{ s.nombre }}&lt;/RouterLink&gt;</code>.',
      pista: 'El :to lleva dos puntos porque la dirección se CONSTRUYE con el dato: texto fijo + id.',
      comprobar: comprobarVue({
        fichero: 'src/views/CatalogoVista.vue',
        template: [
          plantillaContiene(
            /:to\s*=\s*["']\s*['"]\/sombrero\/['"]\s*\+\s*\w+\.id\s*["']|:to\s*=\s*["']`\/sombrero\/\$\{\s*\w+\.id\s*\}`["']/,
            "A cada nombre le falta su :to=\"'/sombrero/' + s.id\".",
          ),
        ],
        exito: 'Del catálogo a cualquier ficha con un clic, y cada ficha con su dirección propia, enlazable y compartible.',
      }),
    },

    verdaderoFalso({
      id: '20-6',
      titulo: 'Cierto o falso: rutas dinámicas',
      enunciado: 'Cinco frases sobre parámetros. Todas.',
      pista: 'El hueco, el texto, el find y la defensa.',
      afirmaciones: [
        { texto: 'Una ruta /sombrero/:id atiende infinitas direcciones con un solo componente.', cierto: true, porque: 'Cierto: el :id es el hueco, y su valor llega en ruta.params.' },
        { texto: 'ruta.params.id llega como número si la dirección lleva un número.', cierto: false, porque: 'Falso: de la dirección TODO llega como texto. Number() antes de comparar con ===.' },
        { texto: 'find devuelve el primer elemento que cumple, o undefined.', cierto: true, porque: 'Cierto: y ese posible undefined es justo lo que obliga a la defensa con v-if.' },
        { texto: 'Si el id no existe, es aceptable que la vista pete: nadie visita ids inventados.', cierto: false, porque: 'Falso: enlaces viejos, erratas, gente curiosa… el caso vacío SIEMPRE llega. Trátalo.' },
        { texto: ':to con dos puntos permite construir la dirección con datos.', cierto: true, porque: 'Cierto: es el v-bind de siempre, aplicado al to del RouterLink.' },
      ],
    }),

    completar({
      id: '20-7',
      titulo: 'La ficha de memoria',
      enunciado: 'Completa el circuito del parámetro: el hueco en el mapa, la lectura y la conversión.',
      pista: 'Los dos puntos del path, la función de la dirección actual, y el traductor de texto a número.',
      plantilla: `{ path: '/sombrero/___', component: SombreroVista }

const ruta = ___()
const sombrero = computed(() =>
  sombreros.find((s) => s.id === ___(ruta.params.id)),
)`,
      huecos: [
        { respuestas: [':id'], porque: 'Los dos puntos marcan el hueco: :id.' },
        { respuestas: ['useRoute'], porque: 'useRoute() da la dirección actual con sus params.' },
        { respuestas: ['Number'], porque: 'Number() convierte el texto del parámetro al número del id.' },
      ],
    }),

    ordenar({
      id: '20-8',
      titulo: 'Del clic a la ficha',
      enunciado: 'Ordena el viaje completo: del enlace del catálogo a la ficha pintada.',
      pista: 'Enlace compuesto, mapa con hueco, lectura, búsqueda, defensa.',
      lineas: [
        "Clic en el RouterLink con :to=\"'/sombrero/' + s.id\"",
        'La dirección pasa a /sombrero/2 sin recargar',
        'El router casa /sombrero/:id y monta SombreroVista',
        'useRoute() entrega params.id, que Number() convierte',
        'find localiza el objeto y el v-if decide ficha o «no existe»',
      ],
      porque: 'Enlace → dirección → mapa → parámetro → búsqueda → defensa. Seis eslabones que juntos son "la página de producto", el pan de toda tienda.',
    }),

    {
      id: '20-9',
      titulo: 'La tienda navegable',
      sintesis: true,
      enunciado:
        'Sin pistas. El acto completo en marcha: la ruta <code>/sombrero/:id</code> en el mapa, <code>SombreroVista</code> con <code>useRoute</code> + <code>Number</code> + <code>find</code> + defensa <code>v-if/v-else</code> y enlace de vuelta, y el catálogo enlazando cada sombrero con su <code>:to</code> compuesto. Recorre la tienda entera desde la vista previa.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/sombrero\/:id['"]/, 'Falta la ruta /sombrero/:id.'),
          ficheroContiene('src/views/SombreroVista.vue', /useRoute\s*\(\s*\)/, 'SombreroVista necesita useRoute().'),
          ficheroContiene('src/views/SombreroVista.vue', /Number\s*\(\s*\w+\.params\.id\s*\)/, 'Falta la conversión Number(ruta.params.id).'),
          ficheroContiene('src/views/SombreroVista.vue', /v-else(?![-\w])/, 'Falta la defensa v-else del «no existe».'),
          ficheroContiene('src/views/CatalogoVista.vue', /:to\s*=/, 'El catálogo tiene que enlazar cada sombrero con :to.'),
        ],
        exito:
          'Inicio, catálogo, ficha por sombrero, error tratado, y cada pantalla con su dirección. Estructuralmente, tu app ya es una tienda online navegable. El acto que viene resuelve el dato compartido: Pinia.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Con el router cerrado, mira lo que tienes: pantallas, direcciones limpias, parámetros y errores tratados. Pero hay una grieta: ' +
      'los datos van en un fichero suelto y cada vista los importa por su cuenta. Cuando dos pantallas tengan que COMPARTIR estado vivo (la cesta, claro), hará falta algo mejor. Se llama Pinia, y es el próximo acto.',
  },
}
