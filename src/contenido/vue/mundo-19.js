// Mundo 19 (Vue) — El router: varias pantallas.
//
// Abre el Acto V. La app deja de ser una página: nace src/views/, se define el
// router (createRouter + createWebHistory), main.js lo engancha con use(), y
// App.vue pasa a ser el marco con <RouterView> y <RouterLink>. Es el mundo más
// "de arquitectura" hasta ahora: cuatro ficheros tocados con sentido.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  ficheroContiene,
  plantillaContiene,
  scriptContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>El Sombrero</h1>
    <p>Bienvenida a la tienda. Aquí irán las pantallas.</p>
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
import { ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
])
</script>

<template>
  <section>
    <h2>El catálogo</h2>
    <ul>
      <li v-for="s in sombreros" :key="s.id">{{ s.nombre }} — {{ s.precio }} €</li>
    </ul>
  </section>
</template>

<style scoped>
</style>
`

export default {
  numero: 19,
  acto: 'Varias pantallas',
  titulo: 'Mundo 19 · El router y las views',

  entradilla: {
    quien: 'wax',
    texto:
      'Toda web seria tiene varias pantallas: la portada, el catálogo, el contacto. Y en una app Vue no se hacen con ' +
      'ficheros html sueltos, sino con un router: un mapa que dice qué componente se enseña en cada dirección. ' +
      'Hoy montas ese mapa. Es el mundo con más piezas del taller, y el que te deja una app de verdad.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/views/CatalogoVista.vue': CATALOGO_SEMBRADO,
  },

  solucion: {
    'src/App.vue': `<script setup>
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
`,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/views/CatalogoVista.vue': CATALOGO_SEMBRADO,
    'src/router.js': `import { createRouter, createWebHistory } from 'vue-router'
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
`,
    'src/main.js': `import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'

createApp(App).use(router).mount('#app')
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'El router: un mapa de pantallas',
    cuerpo: `Una app Vue es **una sola página** que se disfraza de muchas: la dirección del navegador cambia, pero nunca se recarga; lo que cambia es qué componente ocupa el hueco central. La pieza que dirige ese baile es **vue-router**, la librería oficial de rutas. Cuatro piezas, cuatro ficheros:

**1. Las views: pantallas son componentes.** Un componente que hace de pantalla completa se llama **vista**, y por convención vive en \`src/views/\` con el sufijo Vista (o View): \`InicioVista.vue\`, \`CatalogoVista.vue\`. Por dentro son componentes normales; la carpeta solo comunica su papel: estos son pantallas, los de \`components/\` son piezas.

**2. El mapa: \`src/router.js\`.**

\`\`\`
import { createRouter, createWebHistory } from 'vue-router'
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
\`\`\`

Lo importante es \`routes\`: una lista de parejas **dirección → componente**. "En \`/\`, enseña InicioVista; en \`/catalogo\`, CatalogoVista". El \`createWebHistory()\` le dice al router que use direcciones limpias de navegador. Y el \`export default\` publica el router para que otro fichero lo importe: es la pareja del \`import\` que llevas usando desde el Mundo 8 —lo que un fichero exporta, otro lo importa—.

**3. El enganche: \`main.js\`.** La app tiene que adoptar el router:

\`\`\`
import router from './router.js'

createApp(App).use(router).mount('#app')
\`\`\`

\`use(...)\` instala un plugin en la aplicación. Es la primera vez que tocas \`main.js\` desde que empezó el taller, y así debe ser: ahí solo van los enganches globales.

**4. El marco: \`App.vue\` cambia de papel.** Ya no es "la página": es el **marco común** a todas las pantallas. Lo que se repite en todas (la cabecera, el menú) se queda; donde antes iba el contenido, va el hueco del router:

\`\`\`
<RouterView />
\`\`\`

Ahí aterriza la vista que toque según la dirección. Y los enlaces del menú no son \`<a>\` normales, sino:

\`\`\`
<RouterLink to="/catalogo">Catálogo</RouterLink>
\`\`\`

¿Por qué no un \`<a href>\`? Porque el \`<a>\` **recarga la página entera** (adiós datos en memoria, adiós fluidez), mientras que \`RouterLink\` cambia la vista al instante, sin recarga. Por fuera se ve igual; por dentro es la diferencia entre una web del 2005 y una app. RouterView y RouterLink no se importan: al instalar el router con \`use()\`, quedan disponibles en todos los templates.

**El dibujo completo:** la dirección cambia → el router consulta su mapa → la vista ganadora se monta en el \`<RouterView>\` → el marco (cabecera, menú) ni se inmuta. Bienvenida a las aplicaciones de una sola página.`,
  },

  pasos: [
    {
      id: '19-1',
      titulo: 'El mapa de rutas',
      enunciado:
        'Crea <code>src/router.js</code>: importa <code>createRouter</code> y <code>createWebHistory</code> de <code>vue-router</code>, importa las dos vistas de <code>./views/</code>, define las rutas <code>/</code> → InicioVista y <code>/catalogo</code> → CatalogoVista, y termina con <code>export default router</code>.',
      pista: 'El fichero entero está en la lección de Wax: cópialo con calma entendiendo cada línea. Las vistas ya existen en src/views/.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/router.js', /import\s*\{[^}]*createRouter[^}]*\}\s*from\s*['"]vue-router['"]/, 'A router.js le falta el import de createRouter desde vue-router.'),
          ficheroContiene('src/router.js', /createWebHistory\s*\(/, 'Falta el createWebHistory() en la configuración.'),
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/['"]\s*,\s*component\s*:\s*InicioVista/, "Falta la ruta { path: '/', component: InicioVista }."),
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/catalogo['"]\s*,\s*component\s*:\s*CatalogoVista/, "Falta la ruta { path: '/catalogo', component: CatalogoVista }."),
          ficheroContiene('src/router.js', /export\s+default\s+router/, 'Al final, export default router: sin él, nadie puede importarlo.'),
        ],
        exito: 'El mapa existe: dos direcciones, dos pantallas. Ahora la app tiene que adoptarlo.',
      }),
    },

    {
      id: '19-2',
      titulo: 'El enganche en main.js',
      enunciado:
        'Abre <code>src/main.js</code> (la primera vez que lo tocas): importa el router y engánchalo con <code>use</code>: <code>createApp(App).use(router).mount(\'#app\')</code>.',
      pista: 'Dos cambios: el import de \'./router.js\' arriba, y el .use(router) encadenado antes del .mount.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/main.js', /import\s+router\s+from\s+['"]\.\/router(\.js)?['"]/, 'A main.js le falta el import del router.'),
          ficheroContiene('src/main.js', /\.use\s*\(\s*router\s*\)/, 'Falta el .use(router) en la cadena de createApp.'),
        ],
        exito: 'Router instalado en la aplicación. RouterView y RouterLink ya existen en todos tus templates.',
      }),
    },

    {
      id: '19-3',
      titulo: 'El hueco de las pantallas',
      enunciado:
        'En <code>App.vue</code>, sustituye el párrafo de bienvenida por el hueco del router: <code>&lt;RouterView /&gt;</code> dentro del <code>&lt;main&gt;</code>. Guarda y mira la vista previa: debería aparecer la vista de Inicio.',
      pista: 'Una etiqueta auto-cerrada: <RouterView />. No hay que importarla: la instaló el use(router).',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/<RouterView\s*\/?>|<router-view\s*\/?>/, 'A App.vue le falta el <RouterView />.'),
        ],
        exito: 'La bienvenida que ves ya no está en App.vue: es InicioVista aterrizando en el hueco. El marco y el contenido, separados.',
      }),
    },

    {
      id: '19-4',
      titulo: 'El menú que no recarga',
      enunciado:
        'Añade en App.vue una cabecera con un <code>&lt;nav&gt;</code> y dos <code>&lt;RouterLink&gt;</code>: <code>to="/"</code> (Inicio) y <code>to="/catalogo"</code> (Catálogo). Pruébalos: la pantalla cambia sin parpadeo.',
      pista: 'La forma: <code>&lt;RouterLink to="/catalogo"&gt;Catálogo&lt;/RouterLink&gt;</code>. Es to, no href.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/<RouterLink\s+to\s*=\s*["']\/["']|<router-link\s+to\s*=\s*["']\/["']/, 'Falta el RouterLink a "/" (Inicio).'),
          plantillaContiene(/<RouterLink\s+to\s*=\s*["']\/catalogo["']|<router-link\s+to\s*=\s*["']\/catalogo["']/, 'Falta el RouterLink a "/catalogo".'),
        ],
        exito: 'Navega: Inicio, Catálogo, Inicio otra vez. Ni una recarga. Eso que acabas de montar se llama SPA, y es como se hacen las apps hoy.',
      }),
    },

    eleccion({
      id: '19-5',
      titulo: 'RouterLink contra <a>',
      enunciado: '¿Por qué el menú usa <code>&lt;RouterLink&gt;</code> en vez de un <code>&lt;a href&gt;</code> de toda la vida?',
      pista: '¿Qué le pasa a la página (y a tus datos en memoria) con cada uno?',
      opciones: [
        {
          texto: 'El <a> recarga la página entera; RouterLink cambia la vista al instante y los datos sobreviven.',
          correcta: true,
          porque: 'Exacto: la recarga destruye y reconstruye todo. RouterLink solo cambia el componente del hueco. Fluidez y estado intacto.',
        },
        {
          texto: 'El <a> está prohibido en Vue.',
          porque: 'No está prohibido: para enlaces a OTROS sitios web sigue siendo el correcto. RouterLink es para moverse DENTRO de tu app.',
        },
        {
          texto: 'Son idénticos, RouterLink es solo la moda.',
          porque: 'Por fuera se parecen; por dentro uno recarga y el otro no. La diferencia es toda la gracia de una SPA.',
        },
      ],
    }),

    verdaderoFalso({
      id: '19-6',
      titulo: 'Cierto o falso: el router',
      enunciado: 'Cinco frases sobre el mapa de pantallas. Todas.',
      pista: 'Views, mapa, use, hueco.',
      afirmaciones: [
        { texto: 'Una vista es un componente normal que hace de pantalla y vive en src/views/.', cierto: true, porque: 'Cierto: la carpeta comunica el papel, no cambia la naturaleza.' },
        { texto: 'Cada pantalla de una app Vue es un fichero .html distinto.', cierto: false, porque: 'Falso: es UNA página; el router cambia el componente del hueco sin recargar.' },
        { texto: 'routes es una lista de parejas dirección → componente.', cierto: true, porque: 'Cierto: ese es el mapa entero. Dirección que casa, componente que se monta.' },
        { texto: 'RouterView hay que importarlo en cada componente que lo use.', cierto: false, porque: 'Falso: el use(router) de main.js lo deja disponible en todos los templates.' },
        { texto: 'export default publica algo de un fichero para que otro lo importe.', cierto: true, porque: 'Cierto: exportar e importar son las dos caras de mover piezas entre ficheros.' },
      ],
    }),

    completar({
      id: '19-7',
      titulo: 'El mapa de memoria',
      enunciado: 'Completa el corazón del router: la historia, una ruta y el enganche.',
      pista: 'La función del historial limpio, la clave de la dirección, y el método que instala.',
      plantilla: `const router = createRouter({
  history: ___(),
  routes: [
    { ___: '/catalogo', component: CatalogoVista },
  ],
})

// en main.js:
// createApp(App).___(router).mount('#app')`,
      huecos: [
        { respuestas: ['createWebHistory'], porque: 'createWebHistory() da direcciones limpias de navegador.' },
        { respuestas: ['path'], porque: 'path es la dirección que activa la ruta.' },
        { respuestas: ['use'], porque: 'use(router) instala el plugin en la aplicación.' },
      ],
    }),

    ordenar({
      id: '19-8',
      titulo: 'Qué pasa al pulsar un enlace',
      enunciado: 'Ordena lo que ocurre desde el clic en «Catálogo» hasta ver la pantalla.',
      pista: 'Enlace, dirección, mapa, hueco. Y sin recargas por ningún lado.',
      lineas: [
        'Clic en <RouterLink to="/catalogo">',
        'La dirección del navegador cambia a /catalogo (sin recargar)',
        'El router busca /catalogo en su lista de routes',
        'CatalogoVista se monta dentro del <RouterView>',
        'El marco (cabecera y menú) sigue como estaba',
      ],
      porque: 'Enlace → dirección → mapa → hueco, con el marco impasible. Esa es la coreografía de toda SPA, y la acabas de dirigir tú.',
    }),

    {
      id: '19-9',
      titulo: 'La app de varias pantallas',
      sintesis: true,
      enunciado:
        'Sin pistas. Todo el circuito: <code>router.js</code> con sus dos rutas y su <code>export default</code>, <code>main.js</code> con el <code>use(router)</code>, y <code>App.vue</code> como marco con su <code>&lt;nav&gt;</code> de dos <code>&lt;RouterLink&gt;</code> y su <code>&lt;RouterView /&gt;</code>. Navega entre pantallas para comprobarlo tú misma.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/router.js', /createRouter\s*\(/, 'Falta router.js con su createRouter.'),
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/catalogo['"]/, 'Falta la ruta /catalogo en el mapa.'),
          ficheroContiene('src/router.js', /export\s+default\s+router/, 'router.js tiene que exportar el router.'),
          ficheroContiene('src/main.js', /\.use\s*\(\s*router\s*\)/, 'main.js tiene que instalar el router con use().'),
          plantillaContiene(/<RouterView\s*\/?>|<router-view\s*\/?>/, 'App.vue necesita su <RouterView />.'),
          plantillaContiene(/<RouterLink[^>]*to\s*=\s*["']\/catalogo["']|<router-link[^>]*to\s*=\s*["']\/catalogo["']/, 'Falta el enlace del menú al catálogo.'),
        ],
        exito:
          'Una aplicación con pantallas: mapa de rutas, marco común y navegación instantánea. Estructuralmente, esto ya es como las apps que usas a diario. La guinda: pantallas con parámetro, en el próximo mundo.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Date el gusto: Inicio, Catálogo, Inicio, Catálogo. ¿Has visto parpadear algo? Yo tampoco. La cabecera quieta, el contenido bailando, ' +
      'y la dirección de arriba cambiando como si nada. Cuatro ficheros bien avenidos. Ahora imagina una ficha por sombrero, cada una con su dirección… No lo imagines: pasa página.',
  },
}
