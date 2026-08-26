// Mundo 21 (Vue) — Pinia: la cesta que comparten todas las pantallas.
//
// Abre el Acto VI. El problema real: la cesta tiene que verse desde el
// catálogo (botón añadir), desde la cabecera (contador) y desde su propia
// pantalla. Props y emits no llegan tan lejos. Un store de Pinia con state,
// getters y actions lo resuelve, y main.js lo engancha con use(createPinia()).
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

function ficheroContiene(ruta, patron, mensaje) {
  return (_doc, ficheros) => {
    const contenido = ficheros?.[ruta]
    if (contenido === undefined) return `Falta el fichero ${ruta}.`
    return patron.test(String(contenido)) ? null : mensaje
  }
}

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

const MAIN_SEMBRADO = `import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'

createApp(App).use(router).mount('#app')
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
        <button>A la cesta</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
</style>
`

const DATOS_SEMBRADOS = `export const sombreros = [
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
]
`

export default {
  numero: 21,
  acto: 'Estado compartido',
  titulo: 'Mundo 21 · La cesta de todos: Pinia',

  entradilla: {
    quien: 'wayne',
    texto:
      'Piensa en la cesta: el botón de añadir está en el catálogo, el contador en la cabecera, y la lista en su futura pantalla. ' +
      'Tres sitios lejanos, un mismo dato. ¿Props para arriba y para abajo cruzando media app? Ni de broma. ' +
      'Para los datos que son de TODOS existe el almacén compartido. Se llama Pinia, y es oficial de Vue.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
    'src/main.js': MAIN_SEMBRADO,
    'src/router.js': ROUTER_SEMBRADO,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/views/CatalogoVista.vue': CATALOGO_SEMBRADO,
    'src/datos/sombreros.js': DATOS_SEMBRADOS,
  },

  solucion: {
    'src/router.js': ROUTER_SEMBRADO,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/datos/sombreros.js': DATOS_SEMBRADOS,
    'src/stores/cesta.js': `import { defineStore } from 'pinia'

export const usarCesta = defineStore('cesta', {
  state: () => ({
    lineas: [],
  }),

  getters: {
    cuantos: (state) => state.lineas.length,
    total: (state) => state.lineas.reduce((suma, linea) => suma + linea.precio, 0),
  },

  actions: {
    meter(sombrero) {
      this.lineas.push(sombrero)
    },
    vaciar() {
      this.lineas = []
    },
  },
})
`,
    'src/main.js': `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'

createApp(App).use(router).use(createPinia()).mount('#app')
`,
    'src/views/CatalogoVista.vue': `<script setup>
import { sombreros } from '../datos/sombreros.js'
import { usarCesta } from '../stores/cesta.js'

const cesta = usarCesta()
</script>

<template>
  <section>
    <h2>El catálogo</h2>
    <ul>
      <li v-for="s in sombreros" :key="s.id">
        {{ s.nombre }} — {{ s.precio }} €
        <button @click="cesta.meter(s)">A la cesta</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
</style>
`,
    'src/App.vue': `<script setup>
import { usarCesta } from './stores/cesta.js'

const cesta = usarCesta()
</script>

<template>
  <header class="cabecera">
    <h1>El Sombrero</h1>
    <nav>
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink to="/catalogo">Catálogo</RouterLink>
      <span class="contador">🧺 {{ cesta.cuantos }} · {{ cesta.total }} €</span>
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
  align-items: center;
}

.contador {
  font-variant-numeric: tabular-nums;
}

main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Pinia: un almacén para los datos de todos',
    cuerpo: `Props y emits funcionan de padre a hijo. Pero la cesta la necesitan tres componentes que ni se conocen: el catálogo, la cabecera y la futura pantalla de cesta. Pasar el dato escalando por el árbol —hijo a padre a otro hijo— tiene hasta nombre despectivo: *prop drilling*, taladrar con props. La solución adulta es sacar ese dato del árbol y ponerlo en un **almacén global**: Pinia, la librería oficial de estado de Vue.

**Un store se define en su fichero**, por convención en \`src/stores/\`:

\`\`\`
import { defineStore } from 'pinia'

export const usarCesta = defineStore('cesta', {
  state: () => ({
    lineas: [],
  }),

  getters: {
    cuantos: (state) => state.lineas.length,
    total: (state) => state.lineas.reduce((suma, l) => suma + l.precio, 0),
  },

  actions: {
    meter(sombrero) {
      this.lineas.push(sombrero)
    },
    vaciar() {
      this.lineas = []
    },
  },
})
\`\`\`

Mira las tres secciones, porque **ya las conoces con otros nombres**:

- **\`state\`** es una función que devuelve los datos iniciales. Son los \`ref\` del store, sus datos vivos. (¿Por qué función y no objeto? Para que cada arranque estrene datos limpios.)
- **\`getters\`** son los **computed** del store: valores derivados del state, siempre al día. Ese \`reduce\` nuevo: recorre el array acumulando —aquí, sumando precios— y es el hermano formal del bucle de sumar que ya escribiste.
- **\`actions\`** son las **funciones** que cambian el state. Dentro de ellas, \`this\` es el propio store: \`this.lineas.push(...)\`. Toda modificación del almacén pasa por aquí: así, cuando algo cambie raro, sabrás que el culpable está en esta lista corta.

**Se instala una vez, en main.js:**

\`\`\`
import { createPinia } from 'pinia'

createApp(App).use(router).use(createPinia()).mount('#app')
\`\`\`

El mismo \`use()\` del router: los plugins de la app se encadenan.

**Y se usa desde CUALQUIER componente,** esté donde esté en el árbol:

\`\`\`
import { usarCesta } from '../stores/cesta.js'

const cesta = usarCesta()
\`\`\`

A partir de ahí: \`cesta.lineas\` (state), \`cesta.cuantos\` y \`cesta.total\` (getters), \`cesta.meter(s)\` (action). Sin \`.value\`, sin props, sin emits. Y aquí la magia que lo justifica todo: el catálogo llama a \`cesta.meter(s)\`… **y el contador de la cabecera se actualiza**, aunque catálogo y cabecera no se conozcan de nada. Comparten el almacén, no el árbol.

**¿Cuándo store y cuándo ref local?** La pregunta del acto: si el dato lo usa UN componente (el texto de un buscador, un desplegable abierto), ref local y a correr. Si lo necesitan **varias pantallas o componentes lejanos** (la cesta, la sesión de usuario, los favoritos), store. Empezar local y ascender a store cuando haga falta es el camino sano; llenarlo todo de stores desde el día uno, el barroco innecesario.

**Un secreto de la casa:** este mismo taller que estás usando lleva sus propios stores de Pinia —el progreso, los ficheros, hasta la memoria de Wayne—. Estás aprendiendo la herramienta con la que está hecho tu profesor.`,
  },

  pasos: [
    {
      id: '21-1',
      titulo: 'El almacén de la cesta',
      enunciado:
        'Crea <code>src/stores/cesta.js</code> con el store del apunte: <code>defineStore(\'cesta\', …)</code> con su <code>state</code> (el array <code>lineas</code>), sus <code>getters</code> (<code>cuantos</code> y <code>total</code> con <code>reduce</code>) y sus <code>actions</code> (<code>meter</code> y <code>vaciar</code>), exportado como <code>usarCesta</code>.',
      pista: 'Fichero nuevo. Cópialo del apunte entendiendo cada sección: state = datos, getters = computed, actions = funciones.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/stores/cesta.js', /import\s*\{[^}]*defineStore[^}]*\}\s*from\s*['"]pinia['"]/, 'Al store le falta el import de defineStore desde pinia.'),
          ficheroContiene('src/stores/cesta.js', /export\s+const\s+usarCesta\s*=\s*defineStore\s*\(\s*['"]cesta['"]/, "Falta export const usarCesta = defineStore('cesta', …)."),
          ficheroContiene('src/stores/cesta.js', /state\s*:\s*\(\s*\)\s*=>\s*\(\s*\{[\s\S]*?lineas\s*:\s*\[\s*\]/, 'El state tiene que ser una función que devuelva { lineas: [] }.'),
          ficheroContiene('src/stores/cesta.js', /cuantos\s*:/, 'Falta el getter cuantos.'),
          ficheroContiene('src/stores/cesta.js', /total\s*:[\s\S]*?reduce\s*\(/, 'El getter total tiene que sumar con reduce.'),
          ficheroContiene('src/stores/cesta.js', /meter\s*\([\s\S]*?this\.lineas\.push/, 'La action meter tiene que hacer this.lineas.push(…).'),
        ],
        exito: 'Un almacén con sus tres pisos: datos, derivados y acciones. Ahora hay que enchufarlo a la aplicación.',
      }),
    },

    {
      id: '21-2',
      titulo: 'Enchufa Pinia',
      enunciado:
        'En <code>main.js</code>: importa <code>createPinia</code> de <code>pinia</code> y encadénalo: <code>createApp(App).use(router).use(createPinia()).mount(\'#app\')</code>.',
      pista: 'Igual que hiciste con el router: import arriba, use() en la cadena.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/main.js', /import\s*\{[^}]*createPinia[^}]*\}\s*from\s*['"]pinia['"]/, 'A main.js le falta el import de createPinia.'),
          ficheroContiene('src/main.js', /\.use\s*\(\s*createPinia\s*\(\s*\)\s*\)/, 'Falta el .use(createPinia()) en la cadena.'),
        ],
        exito: 'Pinia instalada. Todos los componentes de la app pueden abrir el almacén cuando quieran.',
      }),
    },

    {
      id: '21-3',
      titulo: 'El catálogo mete',
      enunciado:
        'En <code>CatalogoVista.vue</code>: importa <code>usarCesta</code>, abre el store (<code>const cesta = usarCesta()</code>) y dale trabajo al botón: <code>@click="cesta.meter(s)"</code>.',
      pista: 'El import viene de ../stores/cesta.js. La action se llama directamente desde el template: cesta.meter(s), con la s del v-for.',
      comprobar: comprobarVue({
        fichero: 'src/views/CatalogoVista.vue',
        script: [
          (script) =>
            /import\s*\{[^}]*usarCesta[^}]*\}\s*from\s*['"]\.\.\/stores\/cesta(\.js)?['"]/.test(script)
              ? null
              : 'A CatalogoVista le falta el import de usarCesta.',
          (script) => (/const\s+cesta\s*=\s*usarCesta\s*\(\s*\)/.test(script) ? null : 'Falta abrir el store: const cesta = usarCesta().'),
        ],
        template: [
          plantillaContiene(/@click\s*=\s*["']cesta\.meter\(\s*\w+\s*\)/, 'Al botón le falta @click="cesta.meter(s)".'),
        ],
        exito: 'El catálogo ya alimenta la cesta. Nadie lo ve todavía… porque el contador vive en otro componente. Sigue.',
      }),
    },

    {
      id: '21-4',
      titulo: 'La cabecera cuenta',
      enunciado:
        'En <code>App.vue</code>: abre el mismo store y añade al <code>&lt;nav&gt;</code> el contador: <code>🧺 {{ cesta.cuantos }} · {{ cesta.total }} €</code>. Luego ve al catálogo en la vista previa y mete sombreros: la cabecera se entera.',
      pista: 'Mismo par de líneas en el script de App.vue (import + usarCesta()). Los getters se leen como propiedades: cesta.cuantos.',
      comprobar: comprobarVue({
        script: [
          (script) =>
            /import\s*\{[^}]*usarCesta[^}]*\}\s*from\s*['"]\.\/stores\/cesta(\.js)?['"]/.test(script)
              ? null
              : 'A App.vue le falta el import de usarCesta.',
          (script) => (/const\s+cesta\s*=\s*usarCesta\s*\(\s*\)/.test(script) ? null : 'Falta const cesta = usarCesta() en App.vue.'),
        ],
        template: [
          plantillaContiene(/\{\{\s*cesta\.cuantos\s*\}\}/, 'Falta enseñar {{ cesta.cuantos }} en la cabecera.'),
          plantillaContiene(/\{\{\s*cesta\.total\s*\}\}/, 'Y el {{ cesta.total }}.'),
        ],
        exito: 'Ahí está: pulsas en una pantalla y se entera la cabecera. Dos componentes que no se conocen, un almacén en común.',
      }),
    },

    eleccion({
      id: '21-5',
      titulo: '¿Store o ref local?',
      enunciado: 'El texto del buscador del catálogo, que solo usa esa vista, ¿dónde debería vivir?',
      pista: '¿Cuántos componentes lo necesitan?',
      opciones: [
        {
          texto: 'En un ref local de CatalogoVista: solo lo usa ella.',
          correcta: true,
          porque: 'Eso es. Dato de un solo componente, ref local. El store es para lo compartido; inflarlo con datos locales es ruido.',
        },
        {
          texto: 'En el store, como todo: así está "ordenado".',
          porque: 'Tentador, pero no: un store lleno de datos que solo usa un componente es más difícil de leer, no más ordenado. Local primero, store cuando haga falta compartir.',
        },
        {
          texto: 'En localStorage, que es lo más persistente.',
          porque: 'localStorage es persistencia entre visitas, no organización del estado. Un buscador ni siquiera quiere sobrevivir a la recarga.',
        },
      ],
    }),

    verdaderoFalso({
      id: '21-6',
      titulo: 'Cierto o falso: el almacén',
      enunciado: 'Cinco frases sobre Pinia. Todas.',
      pista: 'state/getters/actions, y quién puede abrir el store.',
      afirmaciones: [
        { texto: 'Los getters de un store son como computed: derivados siempre al día.', cierto: true, porque: 'Cierto: misma idea, mismo comportamiento, otra casa.' },
        { texto: 'Cualquier componente, esté donde esté, puede abrir el store con usarCesta().', cierto: true, porque: 'Cierto: esa es la gracia. El almacén vive fuera del árbol de componentes.' },
        { texto: 'El state de un store se declara como objeto directo: state: { lineas: [] }.', cierto: false, porque: 'Falso: es una FUNCIÓN que devuelve el objeto: state: () => ({ … }). Datos limpios en cada arranque.' },
        { texto: 'Dentro de una action, this es el propio store.', cierto: true, porque: 'Cierto: this.lineas, this.vaciar()… el store hablándose a sí mismo.' },
        { texto: 'Con Pinia instalada, los props y emits quedan obsoletos.', cierto: false, porque: 'Falso: siguen siendo el canal correcto entre padre e hijo directos. El store es para lo que cruza el árbol.' },
      ],
    }),

    completar({
      id: '21-7',
      titulo: 'El store de memoria',
      enunciado: 'Completa el esqueleto de un almacén: la función que define, la sección de datos y el this de las acciones.',
      pista: 'La función de pinia, la sección inicial, y quién es this dentro de una action.',
      plantilla: `export const usarCesta = ___('cesta', {
  ___: () => ({ lineas: [] }),
  actions: {
    meter(sombrero) {
      ___.lineas.push(sombrero)
    },
  },
})`,
      huecos: [
        { respuestas: ['defineStore'], porque: 'defineStore crea el almacén, con su nombre único.' },
        { respuestas: ['state'], porque: 'state es la función que devuelve los datos iniciales.' },
        { respuestas: ['this'], porque: 'Dentro de una action, this es el propio store.' },
      ],
    }),

    ordenar({
      id: '21-8',
      titulo: 'Un clic que cruza la app',
      enunciado: 'Ordena el viaje: del botón del catálogo al contador de la cabecera.',
      pista: 'Action, state, getter, template. Sin props por el camino.',
      lineas: [
        'Clic en «A la cesta» dentro de CatalogoVista',
        'La action cesta.meter(s) hace this.lineas.push(s)',
        'El state lineas cambia en el almacén compartido',
        'Los getters cuantos y total se recalculan',
        'La cabecera de App.vue repinta su {{ cesta.cuantos }}',
      ],
      porque: 'Action → state → getters → templates suscritos. El dato cruza la app sin tocar el árbol de componentes: para eso está el almacén.',
    }),

    {
      id: '21-9',
      titulo: 'La cesta compartida',
      sintesis: true,
      enunciado:
        'Sin pistas. El almacén completo en marcha: <code>stores/cesta.js</code> con state/getters/actions (y el <code>reduce</code> en el total), <code>main.js</code> con <code>use(createPinia())</code>, el catálogo metiendo con <code>cesta.meter(s)</code> y la cabecera enseñando <code>cesta.cuantos</code> y <code>cesta.total</code>. Métele tres sombreros y mira la cabecera.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/stores/cesta.js', /defineStore\s*\(\s*['"]cesta['"]/, 'Falta el store de la cesta.'),
          ficheroContiene('src/stores/cesta.js', /reduce\s*\(/, 'El getter total necesita su reduce.'),
          ficheroContiene('src/main.js', /\.use\s*\(\s*createPinia\s*\(\s*\)\s*\)/, 'main.js tiene que instalar Pinia.'),
          ficheroContiene('src/views/CatalogoVista.vue', /cesta\.meter\s*\(/, 'El catálogo tiene que llamar a cesta.meter(s).'),
          plantillaContiene(/\{\{\s*cesta\.cuantos\s*\}\}/, 'La cabecera tiene que enseñar cesta.cuantos.'),
          plantillaContiene(/\{\{\s*cesta\.total\s*\}\}/, 'Y cesta.total.'),
        ],
        exito:
          'Estado compartido de verdad: un almacén, tres pisos, componentes lejanos sincronizados sin conocerse. Es la pieza que faltaba para pensar aplicaciones enteras.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en el mapa completo de decisiones que ya manejas: dato de un componente → ref. Derivado → computed. De padre a hijo → prop. ' +
      'De hijo a padre → emit. De toda la app → store. Cinco preguntas, cinco respuestas. Falta un detalle mundano: la cesta se vacía al recargar. El próximo mundo la hace inmortal.',
  },
}
