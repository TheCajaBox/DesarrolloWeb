// Mundo 34 — Vite, el entorno y el build de verdad.
//
// Segundo del Acto X: configurar la herramienta (vite.config.js con el plugin,
// los alias y el base), las variables de entorno (import.meta.env, VITE_, y
// qué NUNCA se pone ahí), y la carga diferida de rutas, que es la
// optimización con más efecto y menos esfuerzo que existe en una SPA.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  ficheroContiene,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const VITE_SEMBRADO = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})
`

const ROUTER_SEMBRADO = `import { createRouter, createWebHistory } from 'vue-router'
import InicioVista from './views/InicioVista.vue'
import CatalogoVista from './views/CatalogoVista.vue'
import CestaVista from './views/CestaVista.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InicioVista },
    { path: '/catalogo', component: CatalogoVista },
    { path: '/cesta', component: CestaVista },
  ],
})

export default router
`

const APP_SEMBRADA = `<script setup>
</script>

<template>
  <main>
    <h1>Mi tienda</h1>
    <p>El nombre de la tienda debería salir de la configuración.</p>
    <RouterView />
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

const VISTA = `<script setup>
</script>

<template>
  <section>
    <h2>Una pantalla</h2>
  </section>
</template>

<style scoped>
</style>
`

export default {
  numero: 34,
  acto: 'Compilar y preparar',
  titulo: 'Mundo 34 · Vite, el entorno y el build',

  entradilla: {
    quien: 'wax',
    texto:
      'Vite ha estado trabajando para ti treinta y tres mundos sin que le dijeras nada. Hoy abres su configuración ' +
      'y decides tú: qué plugins usa, cómo se acortan las rutas de tus imports, qué datos cambian entre tu máquina y ' +
      'producción, y —esto es lo bueno— cómo hacer que tu web cargue solo el trozo que se está mirando.',
  },

  ficheros: {
    'vite.config.js': VITE_SEMBRADO,
    'src/App.vue': APP_SEMBRADA,
    'src/router.js': ROUTER_SEMBRADO,
    'src/views/InicioVista.vue': VISTA,
    'src/views/CatalogoVista.vue': VISTA,
    'src/views/CestaVista.vue': VISTA,
  },

  solucion: {
    'src/views/InicioVista.vue': VISTA,
    'src/views/CatalogoVista.vue': VISTA,
    'src/views/CestaVista.vue': VISTA,
    'vite.config.js': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
})
`,
    '.env': `VITE_NOMBRE_TIENDA=El Sombrero de Wayne
`,
    '.env.example': `VITE_NOMBRE_TIENDA=El nombre que se ve en la cabecera
`,
    '.gitignore': `node_modules/
dist/
.env
`,
    'src/App.vue': `<script setup>
const nombre = import.meta.env.VITE_NOMBRE_TIENDA
</script>

<template>
  <main>
    <h1>{{ nombre }}</h1>
    <RouterView />
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
    'src/router.js': `import { createRouter, createWebHistory } from 'vue-router'
import InicioVista from './views/InicioVista.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InicioVista },
    { path: '/catalogo', component: () => import('./views/CatalogoVista.vue') },
    { path: '/cesta', component: () => import('./views/CestaVista.vue') },
  ],
})

export default router
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Configurar la herramienta y partir el resultado',
    cuerpo: `**\`vite.config.js\`: la configuración.** Vive en la raíz y exporta la configuración envuelta en \`defineConfig\` (que no hace magia: solo da autocompletado).

\`\`\`
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5173 },
})
\`\`\`

Tres cosas, y cada una resuelve un problema real:

- **\`plugins: [vue()]\`** es lo que enseña a Vite a entender los \`.vue\`. Sin ese plugin, tus componentes son ficheros de texto que nadie sabe compilar. Estaba puesto desde el principio; ahora sabes quién hacía el trabajo.
- **\`resolve.alias\`** inventa atajos para las rutas. Con \`'@'\` apuntando a \`src\`, un \`import Ficha from '../../../components/Ficha.vue'\` se escribe \`import Ficha from '@/components/Ficha.vue'\`, y deja de romperse cada vez que mueves el fichero.
- **\`server.port\`** fija el puerto de desarrollo. Y \`base\` cambia la ruta pública, que hace falta si publicas en un subdirectorio tipo \`usuario.github.io/mi-tienda/\`.

**Las variables de entorno: lo que cambia de una máquina a otra.** La dirección de la API, el nombre de la tienda, una clave pública. Se declaran en un fichero \`.env\` en la raíz:

\`\`\`
VITE_NOMBRE_TIENDA=El Sombrero de Wayne
\`\`\`

Y se leen con \`import.meta.env.VITE_NOMBRE_TIENDA\`. **El prefijo \`VITE_\` es obligatorio**: Vite solo expone al navegador las que lo llevan, precisamente para que no se escape otra cosa por accidente.

**Y aquí la advertencia más importante del acto: en un \`.env\` de front-end NO hay secretos.** Todo lo que expones acaba **dentro del JavaScript** que se descarga el navegador: cualquiera abre las herramientas de desarrollo y lo lee. Sirve para configuración (direcciones, nombres, claves públicas de servicios diseñadas para ser públicas). Las contraseñas, los tokens de administración y las claves privadas de API viven en el **servidor**, y de ahí no salen. Si alguna vez te ves poniendo una clave secreta en un \`.env\` de Vite, lo que hay que cambiar es la arquitectura, no el fichero.

Dos costumbres que van con esto: **el \`.env\` no se sube al repositorio** (va en el \`.gitignore\`), y sí se sube un **\`.env.example\`** con las claves y sin los valores, para que quien clone el proyecto sepa qué tiene que rellenar.

**El build y la carga diferida.** \`npm run build\` empaqueta todo en \`dist/\`. Por defecto, **un solo fichero de JavaScript con TODA la aplicación**: quien entra a la portada se descarga también el catálogo, la cesta y lo demás, aunque no los visite nunca. En una SPA eso se arregla partiendo el resultado por rutas, y se hace cambiando una línea del mapa del router:

\`\`\`
// antes: se importa arriba, y entra en el paquete principal
import CatalogoVista from './views/CatalogoVista.vue'
{ path: '/catalogo', component: CatalogoVista }

// después: se importa cuando se visita
{ path: '/catalogo', component: () => import('./views/CatalogoVista.vue') }
\`\`\`

Ese \`() => import(...)\` es un **import dinámico**: una función que Vite reconoce y que hace que esa vista salga en su **propio fichero**, descargado solo cuando alguien entra en \`/catalogo\`. En el build lo verás: varios ficheros en vez de uno. La portada pasa a pesar lo que pesa la portada.

**¿Qué se deja sin diferir?** La primera pantalla, la que se ve al entrar: diferirla añade una espera justo donde más se nota.`,
  },

  pasos: [
    {
      id: '34-1',
      titulo: 'El plugin que entiende los .vue',
      enunciado:
        'En <code>vite.config.js</code>, importa el plugin de Vue y ponlo en <code>plugins</code>: <code>import vue from \'@vitejs/plugin-vue\'</code> y <code>plugins: [vue()]</code>.',
      pista: 'El import va arriba, junto al de defineConfig. Y ojo: en el array se llama con paréntesis, vue().',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene(
            'vite.config.js',
            /import\s+vue\s+from\s+['"]@vitejs\/plugin-vue['"]/,
            "A vite.config.js le falta el import: import vue from '@vitejs/plugin-vue'.",
          ),
          ficheroContiene(
            'vite.config.js',
            /plugins\s*:\s*\[[^\]]*vue\s*\(\s*\)/,
            'El plugin hay que ponerlo en plugins: [vue()], llamándolo con paréntesis.',
          ),
        ],
        exito:
          'Ese plugin es el que convierte tus tres bloques en un componente de verdad. Llevaba trabajando desde el mundo 1; ahora lo has puesto tú.',
      }),
    },

    {
      id: '34-2',
      titulo: 'Un atajo para las rutas',
      enunciado:
        'Añade el alias <code>@</code> apuntando a <code>src</code>, dentro de <code>resolve.alias</code>. Con eso se acaban los imports con <code>../../..</code>.',
      pista:
        "Necesitas <code>import { fileURLToPath, URL } from 'node:url'</code> y la línea <code>'@': fileURLToPath(new URL('./src', import.meta.url))</code>.",
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene(
            'vite.config.js',
            /resolve\s*:\s*\{[\s\S]*alias\s*:/,
            'Falta el bloque resolve: { alias: { … } } en la configuración.',
          ),
          ficheroContiene('vite.config.js', /['"]@['"]\s*:/, "Falta el alias '@' dentro de alias."),
          ficheroContiene(
            'vite.config.js',
            /fileURLToPath|path\.resolve|__dirname/,
            "El alias tiene que apuntar a una ruta absoluta: usa fileURLToPath(new URL('./src', import.meta.url)).",
          ),
        ],
        exito:
          "Ahora '@/componentes/Ficha.vue' funciona desde cualquier profundidad, y mover un fichero deja de romper diez imports.",
      }),
    },

    eleccion({
      id: '34-3',
      titulo: 'Qué NO va en un .env',
      enunciado: 'Tu tienda necesita cobrar. ¿Qué haces con la clave SECRETA de la pasarela de pago?',
      pista: '¿Quién puede leer el JavaScript que se descarga el navegador?',
      opciones: [
        {
          texto: 'No va en el front-end: vive en el servidor, y el navegador le pide a él que cobre.',
          correcta: true,
          porque:
            'Exacto. Todo lo que pones en un .env de Vite acaba dentro del JavaScript descargado: F12 y ahí está. Las claves secretas viven en el servidor, sin excepción.',
        },
        {
          texto: 'En el .env con el prefijo VITE_, y el .env en el .gitignore.',
          porque:
            'El .gitignore evita subirla al repositorio, pero no lo importante: el prefijo VITE_ la mete en el paquete que descarga cualquiera. Sigue siendo pública.',
        },
        {
          texto: 'En el .env sin el prefijo VITE_, así queda oculta.',
          porque:
            'Sin el prefijo, Vite no la expone al navegador… y entonces tu código del navegador tampoco puede usarla. La operación tiene que hacerla el servidor.',
        },
      ],
    }),

    {
      id: '34-4',
      titulo: 'El nombre, desde el entorno',
      enunciado:
        'Crea el fichero <code>.env</code> con <code>VITE_NOMBRE_TIENDA=</code> y el nombre que quieras, y en <code>App.vue</code> lee esa variable (<code>import.meta.env.VITE_NOMBRE_TIENDA</code>) para pintarla en el <code>&lt;h1&gt;</code>.',
      pista:
        'En el .env no se usan comillas ni punto y coma: <code>VITE_NOMBRE_TIENDA=El Sombrero de Wayne</code>. En el script: <code>const nombre = import.meta.env.VITE_NOMBRE_TIENDA</code>.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene(
            '.env',
            /VITE_NOMBRE_TIENDA\s*=\s*\S/,
            'Falta el fichero .env con VITE_NOMBRE_TIENDA= y un valor.',
          ),
          plantillaContiene(
            /\{\{\s*nombre\s*\}\}/,
            'El h1 tiene que pintar {{ nombre }}, la variable leída del entorno.',
          ),
        ],
        script: [
          (script) =>
            /import\.meta\.env\.VITE_NOMBRE_TIENDA/.test(script)
              ? null
              : 'En el script falta leer import.meta.env.VITE_NOMBRE_TIENDA.',
        ],
        exito:
          'El nombre ya no está escrito en el código: viene de la configuración, y puede cambiar por máquina sin tocar un componente.',
      }),
    },

    {
      id: '34-5',
      titulo: 'Lo que se sube y lo que no',
      enunciado:
        'Dos costumbres que van juntas: un <code>.gitignore</code> que ignore <code>node_modules/</code>, <code>dist/</code> y <code>.env</code>; y un <code>.env.example</code> con la clave <code>VITE_NOMBRE_TIENDA</code> pero <strong>sin</strong> tu valor, para que quien clone sepa qué rellenar.',
      pista:
        'El .gitignore es una línea por patrón. El .env.example lleva la clave con un valor de ejemplo o una explicación.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene('.gitignore', /node_modules/, 'El .gitignore tiene que ignorar node_modules/.'),
          ficheroContiene(
            '.gitignore',
            /^\s*dist\/?\s*$/m,
            'El .gitignore tiene que ignorar dist/ (es resultado: se regenera con un comando).',
          ),
          ficheroContiene('.gitignore', /^\s*\.env\s*$/m, 'El .gitignore tiene que ignorar .env.'),
          ficheroContiene(
            '.env.example',
            /VITE_NOMBRE_TIENDA\s*=/,
            'Falta el .env.example con la clave VITE_NOMBRE_TIENDA.',
          ),
          (_doc, ficheros) => {
            const ejemplo = String(ficheros?.['.env.example'] || '')
            const real = String(ficheros?.['.env'] || '')
            const valorReal = (real.match(/VITE_NOMBRE_TIENDA\s*=\s*(.+)/) || [])[1]?.trim()
            if (!valorReal) return null
            return ejemplo.includes(valorReal)
              ? 'El .env.example lleva tu valor de verdad. Ahí va la clave con un ejemplo, no el valor real: el ejemplo SÍ se sube al repositorio.'
              : null
          },
        ],
        exito:
          'El .env se queda en tu máquina y el .env.example documenta qué hace falta. Esa pareja está en todos los proyectos serios.',
      }),
    },

    {
      id: '34-6',
      titulo: 'Que no se descargue lo que no se mira',
      enunciado:
        'En <code>router.js</code>, deja <code>InicioVista</code> importada arriba (es la primera pantalla) y cambia las otras dos a carga diferida: <code>component: () =&gt; import(\'./views/CatalogoVista.vue\')</code>.',
      pista:
        'Quita sus imports de arriba y pon la función en el componente. Al compilar, cada una saldrá en su propio fichero.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene(
            'src/router.js',
            /component\s*:\s*\(\s*\)\s*=>\s*import\s*\(\s*['"][^'"]*CatalogoVista\.vue['"]\s*\)/,
            "El catálogo tiene que cargarse en diferido: component: () => import('./views/CatalogoVista.vue').",
          ),
          ficheroContiene(
            'src/router.js',
            /component\s*:\s*\(\s*\)\s*=>\s*import\s*\(\s*['"][^'"]*CestaVista\.vue['"]\s*\)/,
            'La cesta también en diferido.',
          ),
          (_doc, ficheros) => {
            const router = String(ficheros?.['src/router.js'] || '')
            return /^import\s+CatalogoVista\s/m.test(router)
              ? 'CatalogoVista sigue importada arriba: si se importa arriba entra en el paquete principal, y la carga diferida no sirve de nada. Quita ese import.'
              : null
          },
          (_doc, ficheros) => {
            const router = String(ficheros?.['src/router.js'] || '')
            return /import\s+InicioVista\s+from/.test(router)
              ? null
              : 'Deja InicioVista importada arriba: es la primera pantalla, y diferirla añade espera donde más se nota.'
          },
        ],
        exito:
          'Portada al entrar; catálogo y cesta solo si se visitan. Es la optimización con más efecto y menos esfuerzo de una SPA: una línea por ruta.',
      }),
    },

    verdaderoFalso({
      id: '34-7',
      titulo: 'Cierto o falso: configuración y entorno',
      enunciado: 'Cinco frases sobre Vite, el entorno y el build. Todas.',
      pista: 'Los secretos, el prefijo, y qué hace el import dinámico.',
      afirmaciones: [
        {
          texto: 'Una variable con prefijo VITE_ acaba dentro del JavaScript que descarga el navegador.',
          cierto: true,
          porque: 'Cierto: por eso ahí no van secretos, solo configuración pública.',
        },
        {
          texto: 'Poner el .env en el .gitignore hace que sus valores sean secretos.',
          cierto: false,
          porque:
            'Falso: evita subirlos al repositorio, pero las VITE_ siguen viajando al navegador dentro del build.',
        },
        {
          texto: 'Sin @vitejs/plugin-vue, Vite no sabe compilar un .vue.',
          cierto: true,
          porque: 'Cierto: ese plugin es el traductor de los tres bloques.',
        },
        {
          texto: 'component: () => import(...) hace que esa vista salga en su propio fichero.',
          cierto: true,
          porque: 'Cierto: Vite reconoce el import dinámico y parte el resultado por ahí.',
        },
        {
          texto: 'Conviene diferir también la primera pantalla, para que el arranque pese menos.',
          cierto: false,
          porque:
            'Falso: la primera pantalla se necesita YA. Diferirla añade una espera justo donde más se nota.',
        },
      ],
    }),

    completar({
      id: '34-8',
      titulo: 'La variable del entorno',
      enunciado: 'Completa cómo se declara y cómo se lee una variable de entorno en Vite.',
      pista: 'El prefijo obligatorio, y el objeto por el que se leen.',
      plantilla: `# en el fichero .env
___NOMBRE_TIENDA=El Sombrero

// en el componente
const nombre = import.meta.___.VITE_NOMBRE_TIENDA`,
      huecos: [
        { respuestas: ['VITE_', 'vite_'], porque: 'Sin el prefijo VITE_, Vite no la expone al navegador.' },
        { respuestas: ['env'], porque: 'Se leen por import.meta.env.' },
      ],
    }),

    ordenar({
      id: '34-9',
      titulo: 'Qué hace el build',
      enunciado: 'Ordena lo que ocurre al ejecutar npm run build.',
      pista: 'Leer la configuración, compilar, partir, escribir.',
      lineas: [
        'Vite lee vite.config.js y carga sus plugins',
        'El plugin de Vue compila cada .vue a JavaScript',
        'Los import dinámicos parten el resultado en varios ficheros',
        'Todo se minifica y se escribe en dist/, con nombres con hash',
      ],
      porque:
        'Configuración, compilación, partición, escritura. Y los nombres con hash son los que permiten cachear para siempre: si el contenido cambia, cambia el nombre.',
    }),

    emparejar({
      id: '34-10',
      titulo: 'Cada ajuste, su problema',
      enunciado: 'Une cada opción de configuración con el problema que resuelve.',
      pista: 'Compilar .vue, acortar rutas, publicar en subcarpeta, cambiar de máquina.',
      pares: [
        { izquierda: 'plugins: [vue()]', derecha: 'entender los ficheros .vue' },
        { izquierda: "resolve.alias '@'", derecha: 'acabar con los ../../.. de los imports' },
        {
          izquierda: 'base: "/mi-tienda/"',
          derecha: 'publicar en un subdirectorio',
          porque: 'Sin eso, las rutas de los recursos apuntan a la raíz del dominio y no cargan.',
        },
        { izquierda: 'import.meta.env.VITE_…', derecha: 'lo que cambia de una máquina a otra' },
      ],
      porque:
        'Cada ajuste existe porque alguien se dio de cabeza con ese problema. Ahora los reconoces antes de dártela tú.',
    }),

    {
      id: '34-11',
      titulo: 'El proyecto configurado',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja todo en su sitio: <code>vite.config.js</code> con el plugin de Vue y el alias <code>@</code>; <code>.env</code> con <code>VITE_NOMBRE_TIENDA</code> y <code>App.vue</code> leyéndola; <code>.env.example</code> sin tu valor; <code>.gitignore</code> con <code>node_modules/</code>, <code>dist/</code> y <code>.env</code>; y el router con la portada arriba y las otras dos rutas en diferido.',
      comprobar: comprobarVue({
        fichero: 'src/App.vue',
        template: [
          ficheroContiene('vite.config.js', /plugins\s*:\s*\[[^\]]*vue\s*\(\s*\)/, 'Falta el plugin de Vue.'),
          ficheroContiene('vite.config.js', /['"]@['"]\s*:/, "Falta el alias '@'."),
          ficheroContiene('.env', /VITE_NOMBRE_TIENDA\s*=\s*\S/, 'Falta el .env con la variable.'),
          ficheroContiene('.env.example', /VITE_NOMBRE_TIENDA\s*=/, 'Falta el .env.example.'),
          ficheroContiene('.gitignore', /node_modules/, 'El .gitignore no ignora node_modules/.'),
          ficheroContiene('.gitignore', /^\s*\.env\s*$/m, 'El .gitignore no ignora .env.'),
          ficheroContiene(
            'src/router.js',
            /\(\s*\)\s*=>\s*import\s*\(/,
            'El router no tiene ninguna ruta en carga diferida.',
          ),
          plantillaContiene(/\{\{\s*nombre\s*\}\}/, 'El h1 tiene que pintar el nombre del entorno.'),
        ],
        script: [
          (script) =>
            /import\.meta\.env\.VITE_NOMBRE_TIENDA/.test(script)
              ? null
              : 'App.vue tiene que leer la variable del entorno.',
        ],
        exito:
          'Herramienta configurada, entorno separado del código, secretos donde deben estar y el paquete partido por rutas. Esto ya no es «me funciona en mi máquina»: es un proyecto preparado.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Quédate con la frase del acto, que es la que más disgustos evita: en el front-end no hay secretos. Todo lo que le das al navegador ' +
      'es público, por muchos ficheros ocultos que uses. Lo demás de hoy —el alias, el entorno, la carga diferida— son comodidad y velocidad. Pero eso es criterio.',
  },
}
