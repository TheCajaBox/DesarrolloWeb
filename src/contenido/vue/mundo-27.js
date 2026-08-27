// Mundo 27 (Vue) — El examen del sombrerero: retos sin guía.
//
// Cierra el temario. No hay técnica nueva: hay seis retos de construcción
// sobre la tienda completa (router + Pinia + views), enunciados como los
// pediría un cliente, sin pistas de sintaxis. Si salen, la alumna no ha
// aprendido Vue: sabe Vue.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  ficheroContiene,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { eleccion } from '../mundos/tipos-de-paso.js'

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
      <RouterLink to="/cesta">🧺 {{ cesta.cuantos }}</RouterLink>
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

main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
`

const CESTA_SEMBRADA = `import { defineStore } from 'pinia'

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

// Ojo: esta portada llega con dos descuidos a propósito (un v-html y un v-for
// sin :key), que el reto de revisión de calidad obliga a cazar.
const INICIO_SEMBRADO = `<script setup>
const lemas = ['Con poco criterio', 'Con mucho cariño', 'Sin prisa ninguna']
</script>

<template>
  <section>
    <h2>Bienvenida</h2>
    <p v-html="'Sombreros <em>elegidos a mano</em>, uno a uno.'"></p>
    <ul>
      <li v-for="lema in lemas">{{ lema }}</li>
    </ul>
  </section>
</template>

<style scoped>
</style>
`

const INICIO_LIMPIO = `<script setup>
const lemas = ['Con poco criterio', 'Con mucho cariño', 'Sin prisa ninguna']
</script>

<template>
  <section>
    <h2>Bienvenida</h2>
    <p>Sombreros <em>elegidos a mano</em>, uno a uno.</p>
    <ul>
      <li v-for="lema in lemas" :key="lema">{{ lema }}</li>
    </ul>
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

const CESTA_VISTA_SEMBRADA = `<script setup>
import { usarCesta } from '../stores/cesta.js'

const cesta = usarCesta()
</script>

<template>
  <section v-if="cesta.cuantos === 0">
    <h2>La cesta está vacía</h2>
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
  </section>
</template>

<style scoped>
</style>
`

const DATOS_SEMBRADOS = `export const sombreros = [
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
  { id: 4, nombre: 'Boina clásica', precio: 22 },
]
`

const FICHEROS_BASE = {
  'src/App.vue': APP_SEMBRADA,
  'src/main.js': MAIN_SEMBRADO,
  'src/router.js': ROUTER_SEMBRADO,
  'src/stores/cesta.js': CESTA_SEMBRADA,
  'src/views/InicioVista.vue': INICIO_SEMBRADO,
  'src/views/CatalogoVista.vue': CATALOGO_SEMBRADO,
  'src/views/CestaVista.vue': CESTA_VISTA_SEMBRADA,
  'src/datos/sombreros.js': DATOS_SEMBRADOS,
}

export default {
  numero: 27,
  acto: 'Publicar',
  titulo: 'Mundo 27 · El examen del sombrerero',

  entradilla: {
    quien: 'wayne',
    texto:
      'Se acabaron los apuntes. Tienes delante la tienda completa y seis encargos, redactados como te los pediría un cliente: ' +
      'sin sintaxis, sin pistas, solo lo que quiere ver funcionando. Todo lo que hace falta lo has hecho ya, repartido en ' +
      'veintiséis mundos. Demuéstrate que se quedó. Yo miro desde aquí, y hoy no pienso soplar.',
  },

  ficheros: FICHEROS_BASE,

  solucion: {
    ...FICHEROS_BASE,
    'src/views/InicioVista.vue': INICIO_LIMPIO,
    'src/router.js': `import { createRouter, createWebHistory } from 'vue-router'
import InicioVista from './views/InicioVista.vue'
import CatalogoVista from './views/CatalogoVista.vue'
import CestaVista from './views/CestaVista.vue'
import SobreVista from './views/SobreVista.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InicioVista },
    { path: '/catalogo', component: CatalogoVista },
    { path: '/cesta', component: CestaVista },
    { path: '/sobre', component: SobreVista },
  ],
})

export default router
`,
    'src/views/SobreVista.vue': `<script setup>
</script>

<template>
  <section>
    <h2>Sobre esta tienda</h2>
    <p>Una tienda hecha a mano, componente a componente, mientras aprendía Vue de verdad.</p>
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
      <RouterLink to="/sobre">Sobre</RouterLink>
      <RouterLink to="/cesta">🧺 {{ cesta.cuantos }}</RouterLink>
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

main {
  font-family: system-ui, sans-serif;
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

@media (max-width: 40rem) {
  .cabecera {
    flex-direction: column;
    gap: 0.6rem;
  }
}
</style>
`,
    'src/views/CatalogoVista.vue': `<script setup>
import { computed, ref } from 'vue'
import { sombreros } from '../datos/sombreros.js'
import { usarCesta } from '../stores/cesta.js'

const cesta = usarCesta()
const busqueda = ref('')

const encontrados = computed(() =>
  sombreros.filter((s) => s.nombre.toLowerCase().includes(busqueda.value.toLowerCase())),
)

const gangas = computed(() => sombreros.filter((s) => s.precio < 30).length)
</script>

<template>
  <section>
    <h2>El catálogo</h2>
    <p>{{ gangas }} gangas por debajo de 30 €.</p>
    <input v-model="busqueda" type="search" placeholder="Busca un sombrero…" />

    <p v-if="encontrados.length === 0">Nada con «{{ busqueda }}».</p>
    <ul>
      <li v-for="s in encontrados" :key="s.id">
        {{ s.nombre }} — {{ s.precio }} €
        <button @click="cesta.meter(s)">A la cesta</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
</style>
`,
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
    masCaro: (state) => state.lineas.reduce((caro, linea) => (linea.precio > (caro?.precio || 0) ? linea : caro), null),
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
    'src/views/CestaVista.vue': `<script setup>
import { usarCesta } from '../stores/cesta.js'

const cesta = usarCesta()
</script>

<template>
  <section v-if="cesta.cuantos === 0">
    <h2>La cesta está vacía</h2>
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
    <p v-if="cesta.masCaro">El capricho: {{ cesta.masCaro.nombre }}.</p>
    <button @click="cesta.vaciar()">Vaciar la cesta</button>
  </section>
</template>

<style scoped>
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Cómo se trabaja sin apuntes',
    cuerpo: `Hoy no hay lección de sintaxis: hay método. Porque trabajar de verdad es esto —un encargo en cristiano y una página en blanco—, y el método es lo que convierte el vértigo en lista de tareas.

**1. Traduce el encargo a piezas conocidas.** "Quiero una página Sobre nosotros" no es una técnica nueva: es una vista + una ruta + un enlace, el trío del Mundo 19. "Que se vea cuántas gangas hay" es un computed con filter (Mundo 12). Todo encargo razonable se descompone en piezas que ya tienes; la habilidad senior es VER la descomposición rápido. Practícala en cada reto de hoy: antes de teclear, di en voz alta qué piezas son.

**2. Decide dónde vive cada cosa.** El mapa de decisiones del taller, completo, para consulta:

- ¿Dato de un solo componente? **ref local**.
- ¿Se deriva de otros datos? **computed**.
- ¿Lo comparten pantallas lejanas? **store de Pinia** (y si debe sobrevivir, persistido por su dueño).
- ¿Baja de padre a hijo? **prop**. ¿Sube? **emit**. ¿Es contenido libre? **slot**.
- ¿Es una pantalla? **vista + ruta**. ¿Con variable en la dirección? **:parámetro**.
- ¿Viene de fuera? **fetch en onMounted**, con sus tres estados y su try/catch.

Ese mapa cabe en una tarjeta y resuelve el 90% de las dudas de arquitectura de cualquier proyecto Vue.

**3. Trabaja en pasos que compilan.** No escribas veinte minutos sin guardar: haz el cambio más pequeño que se pueda comprobar, guarda, mira la vista previa, sigue. Si algo se rompe, el culpable está en las últimas tres líneas, no en un pajar. Esta disciplina —pasos cortos, comprobación constante— es la diferencia práctica entre avanzar y dar vueltas.

**4. Cuando te atasques, lee el error de verdad.** Los errores de Vue dicen el fichero, la línea y muchas veces la solución. "Property was accessed but not defined": te falta declarar algo que el template usa. "Failed to resolve import": la ruta del import está mal escrita. Leer despacio el error ahorra más tiempo que cualquier otra técnica de esta lista.

**5. Y al terminar cada reto, la pregunta de calidad:** ¿lo he puesto donde lo buscaría alguien que no soy yo? Una vista en views/, un store en stores/, la persistencia en su dueño, el estilo en su componente. El orden no es estética: es lo que permite que el proyecto crezca sin doler.

Seis retos te esperan. Ninguno usa nada que no hayas hecho. Método, calma, y a por ellos.`,
  },

  pasos: [
    {
      id: '27-1',
      titulo: 'Encargo: la página «Sobre»',
      enunciado:
        'El cliente quiere una página «Sobre esta tienda» que cuente su historia: accesible en <code>/sobre</code>, con su título y al menos un párrafo con sustancia, y enlazada desde el menú de la cabecera. Nada más… y nada menos.',
      comprobar: comprobarVue({
        template: [
          (_doc, ficheros) =>
            ficheros?.['src/views/SobreVista.vue'] === undefined
              ? 'No hay ninguna vista nueva para la página Sobre (src/views/SobreVista.vue).'
              : null,
          ficheroContiene('src/views/SobreVista.vue', /<h2[\s>]/, 'A la vista Sobre le falta su título.'),
          ficheroContiene('src/views/SobreVista.vue', /<p[\s>][^<]{20,}/, 'El párrafo de la historia necesita algo de sustancia (20 caracteres al menos).'),
          ficheroContiene('src/router.js', /path\s*:\s*['"]\/sobre['"]/, 'La ruta /sobre no está en el mapa.'),
          plantillaContiene(/to\s*=\s*["']\/sobre["']/, 'Falta el enlace a /sobre en el menú de App.vue.'),
        ],
        exito: 'Vista, ruta, enlace: el trío completo, de memoria. El cliente tiene su página.',
      }),
    },

    {
      id: '27-2',
      titulo: 'Encargo: el buscador del catálogo',
      enunciado:
        'El catálogo crece y el cliente quiere buscar: una caja de texto que filtre los sombreros por nombre en vivo, ignorando mayúsculas, con el listado recorriendo el resultado filtrado y un mensaje decente cuando no haya coincidencias.',
      comprobar: comprobarVue({
        fichero: 'src/views/CatalogoVista.vue',
        script: [
          (script) => (/const\s+busqueda\s*=\s*ref\s*\(/.test(script) ? null : 'Hace falta un ref para el texto de búsqueda.'),
          (script) => (/computed\s*\(/.test(script) ? null : 'El filtrado en vivo pide un computed.'),
          (script) => (/\.filter\s*\(/.test(script) ? null : 'El computed tiene que filtrar los sombreros.'),
          (script) => (/toLowerCase/.test(script) ? null : 'Ignorar mayúsculas: toLowerCase en los dos lados de la comparación.'),
        ],
        template: [
          plantillaContiene(/v-model\s*=\s*["']busqueda["']/, 'La caja tiene que atarse con v-model="busqueda".'),
          plantillaContiene(/v-if\s*=\s*["']\w+\.length\s*===?\s*0["']/, 'Falta el mensaje para cuando no hay coincidencias.'),
        ],
        exito: 'v-model, computed, filter, estado vacío: el buscador de manual, montado sin manual.',
      }),
    },

    {
      id: '27-3',
      titulo: 'Encargo: el contador de gangas',
      enunciado:
        'Marketing pide presumir de precios: sobre el listado del catálogo, un texto tipo «3 gangas por debajo de 30 €», con la cuenta calculada de los datos (si mañana cambian los precios, el número se corrige solo).',
      comprobar: comprobarVue({
        fichero: 'src/views/CatalogoVista.vue',
        script: [
          (script) =>
            /const\s+gangas\s*=\s*computed\s*\(/.test(script)
              ? null
              : 'La cuenta tiene que ser un computed llamado gangas (derivada, no escrita a mano).',
          (script) => (/precio\s*<\s*30/.test(script) ? null : 'La condición de ganga: precio < 30.'),
        ],
        template: [plantillaContiene(/\{\{\s*gangas\s*\}\}/, 'Falta enseñar {{ gangas }} en el catálogo.')],
        exito: 'Derivado, no duplicado: el número se defiende solo contra futuros cambios de precio. Así se piensa.',
      }),
    },

    {
      id: '27-4',
      titulo: 'Encargo: el capricho de la cesta',
      enunciado:
        'En la pantalla de la cesta, cuando haya líneas, el cliente quiere ver cuál es «el capricho»: el sombrero MÁS CARO de la cesta, con su nombre. La lógica, donde corresponde: un getter nuevo del store llamado <code>masCaro</code>.',
      comprobar: comprobarVue({
        template: [
          ficheroContiene('src/stores/cesta.js', /masCaro\s*:/, 'El getter masCaro tiene que vivir en el store de la cesta.'),
          ficheroContiene('src/views/CestaVista.vue', /masCaro/, 'La vista de la cesta tiene que enseñar el capricho.'),
        ],
        exito: 'Un getter nuevo en el dueño del dato y una vista que lo pinta: la arquitectura, respetada hasta el final.',
      }),
    },

    {
      id: '27-5',
      titulo: 'Encargo: que quepa en un móvil',
      enunciado:
        'El cliente lo mira todo desde el teléfono y la cabecera se le amontona. En el estilo de <code>App.vue</code>, una <code>@media</code> de pantalla estrecha (<code>max-width</code>) que recoloque la cabecera (por ejemplo, apilándola en columna con <code>flex-direction</code>).',
      comprobar: comprobarVue({
        estilo: [
          (reglas) => {
            const enMedia = reglas.filter((r) => r.condicion && /max-width/i.test(r.condicion))
            if (!enMedia.length) return 'No hay ninguna @media (max-width: …) en App.vue.'
            const tocaCabecera = enMedia.some((r) => /\.cabecera|nav/.test(r.selector))
            return tocaCabecera ? null : 'La @media está, pero no toca a la cabecera (o a su nav).'
          },
        ],
        exito: 'La cabecera se recoloca cuando la pantalla aprieta. El cliente del teléfono, atendido.',
      }),
    },

    {
      id: '27-6',
      titulo: 'Encargo final: revisión de calidad',
      enunciado:
        'Antes de entregar, el repaso del perfeccionista: ni un <code>v-html</code> en todo el proyecto, todos los <code>v-for</code> con su <code>:key</code>, y la persistencia de la cesta intacta (leerGuardado con try/catch y persistir en las actions). Revisa fichero a fichero; esto es lo que haría un lead antes del deploy.',
      comprobar: comprobarVue({
        template: [
          (_doc, ficheros) => {
            const vues = Object.entries(ficheros || {}).filter(([ruta]) => ruta.endsWith('.vue'))
            const conVhtml = vues.find(([, contenido]) => /v-html/.test(String(contenido)))
            return conVhtml ? `Hay un v-html en ${conVhtml[0]}: con contenido de usuarios, jamás.` : null
          },
          (_doc, ficheros) => {
            for (const [ruta, contenido] of Object.entries(ficheros || {})) {
              if (!ruta.endsWith('.vue')) continue
              const texto = String(contenido || '')
              const vfors = texto.match(/<[^>]*v-for\s*=[^>]*>/g) || []
              const sinKey = vfors.find((etiqueta) => !/:key\s*=|v-bind:key\s*=/.test(etiqueta))
              if (sinKey) return `En ${ruta} hay un v-for sin :key. Todos lo llevan.`
            }
            return null
          },
          ficheroContiene('src/stores/cesta.js', /try\s*\{[\s\S]*?JSON\.parse/, 'La lectura blindada del store no puede faltar.'),
          ficheroContiene('src/stores/cesta.js', /this\.persistir\s*\(\s*\)/, 'Las actions tienen que seguir persistiendo.'),
        ],
        exito: 'Revisión pasada: sin agujeros, sin keys perdidas, con la memoria a salvo. Esto ya no es un ejercicio: es una entrega.',
      }),
    },

    eleccion({
      id: '27-7',
      titulo: 'La última pregunta',
      enunciado: 'Mañana el cliente pide algo que no has hecho nunca (un carrusel, un mapa, un chat). ¿Cuál es el primer movimiento correcto?',
      pista: 'Es el método del apunte, aplicado a lo desconocido.',
      opciones: [
        {
          texto: 'Descomponerlo en piezas: qué datos necesita, dónde viven, qué componentes lo pintan… y buscar solo lo que de verdad sea nuevo.',
          correcta: true,
          porque: 'Ese es el oficio: lo desconocido casi siempre es un 80% de piezas que ya dominas más un 20% que se aprende sobre la marcha. Ya sabes trabajar así. Enhorabuena, sombrerera.',
        },
        {
          texto: 'Decir que no se puede hasta hacer otro curso entero.',
          porque: 'Con el mapa de decisiones que ya tienes, casi todo se descompone en piezas conocidas. El curso ya lo llevas puesto.',
        },
        {
          texto: 'Copiar el primer código que aparezca y pegarlo hasta que compile.',
          porque: 'Pegar sin descomponer es deuda: cuando falle (fallará), no sabrás por dónde. Entender las piezas primero; copiar con criterio, después.',
        },
      ],
    }),
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Se acabó, y no te ha soplado nadie. Mírala: pantallas, buscador, cesta con memoria, responsive, revisada y lista para publicar. ' +
      'La hiciste tú, mundo a mundo, fallo a fallo. Ha sido un placer mirar por encima de tu hombro. El sombrero… quédatelo. Te queda mejor que a mí.',
  },
}
