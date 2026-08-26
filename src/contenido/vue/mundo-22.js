// Mundo 22 (Vue) — La cesta inmortal: persistencia y pantalla propia.
//
// Cierra el Acto VI. El store aprende a recordar (localStorage en el state
// inicial + una action persistir llamada desde cada cambio, con try/catch) y
// la cesta estrena pantalla: ruta /cesta, vista con listado, quitar por id y
// estado vacío. El patrón es EXACTAMENTE el del propio taller.
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
`

const CESTA_SEMBRADA = `import { defineStore } from 'pinia'

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
`

const MAIN_SEMBRADO = `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'

createApp(App).use(router).use(createPinia()).mount('#app')
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
`

const DATOS_SEMBRADOS = `export const sombreros = [
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
]
`

export default {
  numero: 22,
  acto: 'Estado compartido',
  titulo: 'Mundo 22 · La cesta inmortal',

  entradilla: {
    quien: 'wayne',
    texto:
      'Llena la cesta y recarga. Vacía, ¿verdad? Una tienda que olvida la cesta es una tienda que pierde ventas: dato comprobado ' +
      'y sufrido. Hoy el almacén aprende a escribir en el disco del navegador con el MISMO patrón que ya usaste en el mundo 14, ' +
      'y de paso la cesta se gana su propia pantalla, con su ruta y su botón de quitar. Después de esto, inmortal.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
    'src/stores/cesta.js': CESTA_SEMBRADA,
    'src/main.js': MAIN_SEMBRADO,
    'src/router.js': ROUTER_SEMBRADO,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/views/CatalogoVista.vue': CATALOGO_SEMBRADO,
    'src/datos/sombreros.js': DATOS_SEMBRADOS,
  },

  solucion: {
    'src/main.js': MAIN_SEMBRADO,
    'src/views/InicioVista.vue': INICIO_SEMBRADO,
    'src/views/CatalogoVista.vue': CATALOGO_SEMBRADO,
    'src/datos/sombreros.js': DATOS_SEMBRADOS,
    'src/stores/cesta.js': `import { defineStore } from 'pinia'

function leerGuardado() {
  try {
    return JSON.parse(localStorage.getItem('cesta') || '[]')
  } catch {
    return []
  }
}

export const usarCesta = defineStore('cesta', {
  state: () => ({
    lineas: leerGuardado(),
  }),

  getters: {
    cuantos: (state) => state.lineas.length,
    total: (state) => state.lineas.reduce((suma, linea) => suma + linea.precio, 0),
  },

  actions: {
    persistir() {
      localStorage.setItem('cesta', JSON.stringify(this.lineas))
    },
    meter(sombrero) {
      this.lineas.push(sombrero)
      this.persistir()
    },
    quitar(indice) {
      this.lineas.splice(indice, 1)
      this.persistir()
    },
    vaciar() {
      this.lineas = []
      this.persistir()
    },
  },
})
`,
    'src/router.js': `import { createRouter, createWebHistory } from 'vue-router'
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
`,
    'src/views/CestaVista.vue': `<script setup>
import { usarCesta } from '../stores/cesta.js'

const cesta = usarCesta()
</script>

<template>
  <section v-if="cesta.cuantos === 0">
    <h2>La cesta está vacía</h2>
    <p>De momento. El catálogo hace milagros.</p>
    <RouterLink to="/catalogo">Ir al catálogo</RouterLink>
  </section>

  <section v-else>
    <h2>Tu cesta</h2>
    <ul>
      <li v-for="(linea, indice) in cesta.lineas" :key="indice">
        {{ linea.nombre }} — {{ linea.precio }} €
        <button @click="cesta.quitar(indice)">Quitar</button>
      </li>
    </ul>
    <p><strong>Total: {{ cesta.total }} €</strong></p>
    <button @click="cesta.vaciar()">Vaciar la cesta</button>
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
      <RouterLink to="/cesta" class="contador">🧺 {{ cesta.cuantos }} · {{ cesta.total }} €</RouterLink>
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
    titulo: 'Un store que recuerda (y su pantalla)',
    cuerpo: `El patrón de persistencia lo aprendiste en el Mundo 14: guardar al cambiar, leer al arrancar. Hoy lo mudas a su sitio definitivo —**dentro del store**— porque el dueño del dato debe ser también el dueño de su memoria. Si cada componente guardara la cesta por su cuenta, volveríamos al caos que Pinia vino a evitar.

**Leer al arrancar: en el state inicial.** El state es una función, ¿recuerdas? Pues que trabaje:

\`\`\`
function leerGuardado() {
  try {
    return JSON.parse(localStorage.getItem('cesta') || '[]')
  } catch {
    return []
  }
}

state: () => ({
  lineas: leerGuardado(),
})
\`\`\`

Dos detalles de oficio aquí. El \`|| '[]'\`: si nunca se guardó nada, \`getItem\` da \`null\`, y el \`||\` lo sustituye por un array vacío en texto, listo para el parse. Y el **\`try/catch\`**: si lo guardado está corrupto (pasa: extensiones, medias escrituras, manos traviesas), \`JSON.parse\` lanza un error; el \`catch\` lo captura y devuelve el array vacío en vez de reventar la app entera al arrancar. Blindar las lecturas de fuera es marca de profesional: nunca confíes en que lo que entra está bien formado.

**Guardar al cambiar: una action \`persistir\`.**

\`\`\`
persistir() {
  localStorage.setItem('cesta', JSON.stringify(this.lineas))
},
meter(sombrero) {
  this.lineas.push(sombrero)
  this.persistir()
},
\`\`\`

Cada action que toque las líneas termina llamando a \`this.persistir()\` (las actions pueden llamarse entre sí: \`this\` es el store). ¿Por qué así y no un watch? Un watch también valdría; pero con la persistencia dentro de las actions, el store es **autosuficiente**: te lo llevas a otro proyecto y recuerda solo, sin cables externos. Este es, literalmente, el patrón de los stores de este taller.

**La action nueva: \`quitar\`.**

\`\`\`
quitar(indice) {
  this.lineas.splice(indice, 1)
  this.persistir()
},
\`\`\`

\`splice(indice, 1)\` saca 1 elemento en esa posición del array. ¿Y de dónde sale el índice? Del v-for, que sabe contarse:

\`\`\`
<li v-for="(linea, indice) in cesta.lineas" :key="indice">
\`\`\`

La forma con paréntesis \`(linea, indice)\` te da el elemento Y su posición. Y fíjate: aquí el \`:key\` es el índice, no un id. ¿No habíamos dicho que el índice como key es mala idea? En general sí; pero la cesta puede llevar el MISMO sombrero dos veces (dos ids iguales, ¡keys duplicadas!), y entre dos males, el índice es aquí el menor. Saber cuándo romper una regla también es saberla.

**La pantalla:** una ruta \`/cesta\` nueva en el mapa, una \`CestaVista\` con su estado vacío (v-if, como siempre) y su listado con botones de quitar, y el contador de la cabecera convertido en \`RouterLink\` a \`/cesta\` —los contadores que no llevan a ningún sitio frustran—. Nada nuevo: estás COMBINANDO. Y esa es la señal de que el temario se acaba: ya no aprendes piezas, construyes con ellas.`,
  },

  pasos: [
    {
      id: '22-1',
      titulo: 'Leer al arrancar, blindado',
      enunciado:
        'En <code>stores/cesta.js</code>: la función <code>leerGuardado()</code> con su <code>try/catch</code>, su <code>JSON.parse</code> y su <code>|| \'[]\'</code>, y el state estrenándola: <code>lineas: leerGuardado()</code>.',
      pista: 'La función va arriba del defineStore, tal cual está en el apunte. El catch devuelve [] y salva el arranque.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/stores/cesta.js', /function\s+leerGuardado\s*\(|const\s+leerGuardado\s*=/, 'Falta la función leerGuardado en el store.'),
          ficheroContiene('src/stores/cesta.js', /try\s*\{[\s\S]*?JSON\.parse[\s\S]*?\}\s*catch/, 'La lectura necesita su try/catch alrededor del JSON.parse.'),
          ficheroContiene('src/stores/cesta.js', /getItem\s*\(\s*['"]cesta['"]\s*\)\s*\|\|\s*['"]\[\]['"]/, "Falta el || '[]' para la primera visita (getItem da null)."),
          ficheroContiene('src/stores/cesta.js', /lineas\s*:\s*leerGuardado\s*\(\s*\)/, 'El state tiene que estrenar la función: lineas: leerGuardado().'),
        ],
        exito: 'El almacén arranca leyendo el disco, y ni un dato corrupto lo tumba. Lecturas de fuera, siempre blindadas.',
      }),
    },

    {
      id: '22-2',
      titulo: 'Guardar en cada cambio',
      enunciado:
        'La action <code>persistir()</code> (setItem + JSON.stringify de <code>this.lineas</code>), y las llamadas <code>this.persistir()</code> al final de <code>meter</code> y de <code>vaciar</code>.',
      pista: 'Las actions se llaman entre sí con this. Toda action que toque lineas debe terminar persistiendo.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/stores/cesta.js', /persistir\s*\(\s*\)\s*\{[\s\S]*?setItem\s*\(\s*['"]cesta['"][\s\S]*?JSON\.stringify/, 'Falta la action persistir con su setItem y su stringify.'),
          ficheroContiene('src/stores/cesta.js', /push\s*\([\s\S]*?\)[\s\S]*?this\.persistir\s*\(\s*\)/, 'meter tiene que llamar a this.persistir() tras el push.'),
          ficheroContiene('src/stores/cesta.js', /lineas\s*=\s*\[\s*\][\s\S]*?this\.persistir\s*\(\s*\)/, 'vaciar también tiene que persistir.'),
        ],
        exito: 'Mete un sombrero y recarga: sigue ahí. El store ya es autosuficiente: cambia y recuerda sin ayuda de nadie.',
      }),
    },

    eleccion({
      id: '22-3',
      titulo: 'El porqué del try/catch',
      enunciado: 'Si lo guardado en localStorage está corrupto y NO hay try/catch, ¿qué pasa al arrancar la app?',
      pista: '¿Dónde se llama a leerGuardado()? En el state inicial, o sea, en el arranque…',
      opciones: [
        {
          texto: 'JSON.parse lanza un error en pleno arranque y la app entera no llega a montarse.',
          correcta: true,
          porque: 'Exacto: un error en el state inicial es un error de arranque, lo peor que hay. El catch lo convierte en "empiezas con la cesta vacía", que es un mal menor razonable.',
        },
        {
          texto: 'Nada: JSON.parse devuelve null con datos malos.',
          porque: 'Ojalá: JSON.parse no devuelve null, LANZA un error. Por eso hay que capturarlo.',
        },
        {
          texto: 'Vue lo detecta y repara los datos.',
          porque: 'Vue no sabe ni qué guardaste ni cómo repararlo. La defensa es tuya, y se llama try/catch.',
        },
      ],
    }),

    {
      id: '22-4',
      titulo: 'La ruta y la pantalla',
      enunciado:
        'Crea <code>src/views/CestaVista.vue</code> (abre el store y de momento enseña <code>{{ cesta.total }}</code>) y añade la ruta <code>/cesta</code> al mapa con su import.',
      pista: 'Lo mismo que hiciste en el mundo 19: vista nueva + import + entrada en routes.',
      comprobar: comprobarVue({
        template: [
          (_doc, ficheros) =>
            ficheros?.['src/views/CestaVista.vue'] === undefined ? 'Falta crear src/views/CestaVista.vue.' : null,
          ficheroContiene('src/views/CestaVista.vue', /usarCesta\s*\(\s*\)/, 'CestaVista tiene que abrir el store con usarCesta().'),
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/cesta['"]/, 'Falta la ruta /cesta en el mapa.'),
          ficheroContiene('src/router.js', /import\s+CestaVista\s+from/, 'router.js tiene que importar CestaVista.'),
        ],
        exito: 'La cesta tiene casa propia con dirección: /cesta. Ahora, a amueblarla.',
      }),
    },

    {
      id: '22-5',
      titulo: 'El listado con quitar',
      enunciado:
        'En <code>CestaVista</code>: el v-for con índice —<code>(linea, indice) in cesta.lineas</code>—, cada línea con su nombre, precio y botón <code>@click="cesta.quitar(indice)"</code>. Y en el store, la action <code>quitar(indice)</code> con <code>splice(indice, 1)</code> y su persistir.',
      pista: 'La forma con paréntesis del v-for te da la posición. splice(indice, 1) saca ese elemento del array.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/views/CestaVista.vue', /v-for\s*=\s*["']\s*\(\s*\w+\s*,\s*\w+\s*\)\s+in\s+cesta\.lineas/, 'El v-for necesita la forma con índice: (linea, indice) in cesta.lineas.'),
          ficheroContiene('src/views/CestaVista.vue', /cesta\.quitar\s*\(\s*\w+\s*\)/, 'Falta el botón con cesta.quitar(indice).'),
          ficheroContiene('src/stores/cesta.js', /quitar\s*\(\s*\w+\s*\)\s*\{[\s\S]*?splice\s*\(\s*\w+\s*,\s*1\s*\)[\s\S]*?persistir/, 'Al store le falta la action quitar con splice y persistir.'),
        ],
        exito: 'Quitas una línea, el contador baja, el disco se entera. Tres capas coordinadas por una action.',
      }),
    },

    {
      id: '22-6',
      titulo: 'El estado vacío y el enlace',
      enunciado:
        'Remata: en CestaVista, el caso vacío (<code>v-if="cesta.cuantos === 0"</code> con mensaje y enlace al catálogo, <code>v-else</code> con el listado). Y en App.vue, convierte el contador en <code>&lt;RouterLink to="/cesta"&gt;</code>.',
      pista: 'El patrón del mundo 10, con datos del store. Los contadores que no llevan a ningún sitio frustran: enlázalo.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/views/CestaVista.vue', /v-if\s*=\s*["']cesta\.cuantos\s*===?\s*0["']/, 'Falta el caso vacío con v-if="cesta.cuantos === 0".'),
          ficheroContiene('src/views/CestaVista.vue', /v-else(?![-\w])/, 'Falta el v-else con el listado.'),
          plantillaContiene(/<RouterLink[^>]*to\s*=\s*["']\/cesta["']|<router-link[^>]*to\s*=\s*["']\/cesta["']/, 'El contador de la cabecera tiene que ser un RouterLink a /cesta.'),
        ],
        exito: 'Cesta vacía con salida amable, contador que lleva a su pantalla. Los detalles que hacen que una app se sienta cuidada.',
      }),
    },

    verdaderoFalso({
      id: '22-7',
      titulo: 'Cierto o falso: el store que recuerda',
      enunciado: 'Cinco frases sobre persistencia en el almacén. Todas.',
      pista: 'Quién guarda, cuándo se lee, y las keys de la cesta.',
      afirmaciones: [
        { texto: 'La persistencia de un dato compartido pertenece a su store, no a los componentes.', cierto: true, porque: 'Cierto: el dueño del dato es el dueño de su memoria. Los componentes ni se enteran.' },
        { texto: 'JSON.parse devuelve null cuando el texto está corrupto.', cierto: false, porque: 'Falso: LANZA un error. De ahí el try/catch; sin él, adiós arranque.' },
        { texto: 'Las actions pueden llamarse entre sí con this.', cierto: true, porque: 'Cierto: this.persistir() desde meter es exactamente eso.' },
        { texto: 'En la cesta, usar el índice como :key es defendible porque puede haber ids repetidos.', cierto: true, porque: 'Cierto: dos bombines son dos líneas con el mismo id. Entre keys duplicadas y el índice, gana el índice.' },
        { texto: 'splice(indice, 1) devuelve una copia del array sin tocar el original.', cierto: false, porque: 'Falso: splice MUTA el array original (por eso dispara la reactividad y persistimos justo después). La que no toca es filter.' },
      ],
    }),

    completar({
      id: '22-8',
      titulo: 'El blindaje de memoria',
      enunciado: 'Completa la lectura blindada del arranque.',
      pista: 'Intentar, el respaldo para la primera vez, y qué devolver si explota.',
      plantilla: `function leerGuardado() {
  ___ {
    return JSON.parse(localStorage.getItem('cesta') || '___')
  } catch {
    return ___
  }
}`,
      huecos: [
        { respuestas: ['try'], porque: 'try intenta; si algo lanza un error dentro, el catch lo recoge.' },
        { respuestas: ['[]'], porque: "El respaldo '[]' cubre la primera visita, cuando getItem da null." },
        { respuestas: ['[]'], porque: 'Si lo guardado está corrupto, mejor cesta vacía que app rota.' },
      ],
    }),

    {
      id: '22-9',
      titulo: 'La tienda que recuerda',
      sintesis: true,
      enunciado:
        'Sin pistas. El acto completo: el store con <code>leerGuardado</code> (try/catch) en el state, <code>persistir</code> llamada desde <code>meter</code>, <code>quitar</code> (splice) y <code>vaciar</code>; la ruta <code>/cesta</code>; la vista con caso vacío, listado con índice, quitar y total; y el contador-enlace en la cabecera. Llena la cesta, recarga, quita una línea. Todo debe sobrevivir y cuadrar.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/stores/cesta.js', /try\s*\{[\s\S]*?JSON\.parse/, 'Falta la lectura blindada en el store.'),
          ficheroContiene('src/stores/cesta.js', /quitar\s*\([\s\S]*?splice/, 'Falta la action quitar con su splice.'),
          ficheroContiene('src/stores/cesta.js', /push[\s\S]*?this\.persistir\s*\(/, 'meter tiene que persistir.'),
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/cesta['"]/, 'Falta la ruta /cesta.'),
          ficheroContiene('src/views/CestaVista.vue', /v-if\s*=\s*["']cesta\.cuantos\s*===?\s*0["']/, 'Falta el caso vacío en CestaVista.'),
          ficheroContiene('src/views/CestaVista.vue', /cesta\.quitar\s*\(/, 'Falta el quitar en el listado.'),
          plantillaContiene(/to\s*=\s*["']\/cesta["']/, 'El contador tiene que enlazar a /cesta.'),
        ],
        exito:
          'Una cesta compartida, persistente, con pantalla, altas, bajas y estados vacíos. Esto es un carrito de tienda real, con la arquitectura de los de verdad. El acto que viene sale de casa: el servidor.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Dos actos de datos bien cerrados: los locales en refs, los compartidos en stores, y los que deben sobrevivir, persistidos por su dueño. ' +
      'Hasta ahora todo vive en TU navegador. Pero los datos de una tienda de verdad viven en un servidor, y hablar con servidores es otro deporte: asíncrono. Nos vemos en el Acto VII.',
  },
}
