// Mundo 24 (Vue) — Cuando el servidor dice que no: errores y HTTP.
//
// Segundo mundo del Acto VII. La petición del mundo anterior se blinda:
// try/catch/finally, respuesta.ok y los códigos HTTP (200, 404, 500...), el
// tercer estado de la interfaz (error con reintentar), y el vocabulario de las
// APIs REST (GET/POST/PUT/DELETE) que hablará cualquier servidor del futuro.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const APP_SEMBRADA = `<script setup>
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
`

const JSON_SEMBRADO = `[
  { "id": 1, "nombre": "Bombín de fieltro", "precio": 42 },
  { "id": 2, "nombre": "Panamá de verano", "precio": 35 },
  { "id": 3, "nombre": "Gorra de leñador", "precio": 18 }
]
`

export default {
  numero: 24,
  acto: 'El servidor',
  titulo: 'Mundo 24 · Cuando el servidor dice que no',

  entradilla: {
    quien: 'wayne',
    texto:
      'Tu petición del mundo pasado es optimista: da por hecho que el servidor contesta y contesta bien. En el mundo real ' +
      'los servidores se caen, las redes se cortan y las direcciones se equivocan. Prueba a cambiar el fetch a /sombreros-mal.json ' +
      'y mira la consola: eso rojo que ves es lo que hoy vamos a domesticar.',
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
const error = ref(null)

async function pedirSombreros() {
  cargando.value = true
  error.value = null

  try {
    const respuesta = await fetch('/sombreros.json')
    if (!respuesta.ok) {
      throw new Error('El servidor respondió ' + respuesta.status)
    }
    sombreros.value = await respuesta.json()
  } catch (fallo) {
    error.value = 'No se pudo cargar el catálogo. ' + fallo.message
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  pedirSombreros()
})
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <p v-if="cargando">Cargando sombreros…</p>

    <div v-else-if="error" class="fallo">
      <p>{{ error }}</p>
      <button @click="pedirSombreros">Reintentar</button>
    </div>

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

.fallo {
  border: 1px solid #a03e2d;
  border-radius: 0.6rem;
  padding: 1rem 1.2rem;
  color: #a03e2d;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'HTTP, códigos y el tercer estado',
    cuerpo: `Cada petición HTTP es una conversación con reglas. Conocerlas es lo que separa "me sale un error rojo" de "sé exactamente qué ha pasado".

**Los códigos de estado.** Toda respuesta llega con un número de tres cifras que resume cómo fue:

- **2xx: bien.** El famoso \`200 OK\`. Lo que pediste, ahí va.
- **3xx: te reenvío.** La cosa está en otra dirección; el navegador suele seguirla solo.
- **4xx: TÚ te has equivocado.** \`404 Not Found\` (esa dirección no existe), \`400\` (petición mal formada), \`401/403\` (no tienes permiso). El clásico 404 lo has visto mil veces: ahora sabes que la culpa es de quien pide.
- **5xx: EL SERVIDOR se ha roto.** \`500\` y familia. Tu petición estaba bien; el otro lado, no.

**La trampa de fetch que hay que saberse:** un 404 o un 500 **no lanzan error**. Para fetch, "el servidor contestó" ya es éxito, aunque contestara "no existe". Si no lo compruebas, tu código intentará leer el JSON de una página de error. La comprobación es \`respuesta.ok\` (true solo con códigos 2xx):

\`\`\`
if (!respuesta.ok) {
  throw new Error('El servidor respondió ' + respuesta.status)
}
\`\`\`

\`throw\` lanza un error a propósito, que el catch de abajo recogerá. Convierte el "no" del servidor en un error como los demás. ¿Y cuándo lanza error fetch por sí solo? Cuando **ni siquiera hay respuesta**: sin red, servidor inalcanzable. Dos familias de fallo, un solo catch.

**try/catch/finally: la petición blindada.**

\`\`\`
try {
  // el camino feliz
} catch (fallo) {
  error.value = 'No se pudo cargar. ' + fallo.message
} finally {
  cargando.value = false
}
\`\`\`

El \`try/catch\` ya lo usaste con JSON.parse en el Mundo 22; aquí protege la petición entera. La pieza nueva es **\`finally\`: se ejecuta SIEMPRE**, salga bien o mal. Y es el sitio perfecto para apagar \`cargando\`: si lo apagas solo en el camino feliz, un fallo deja la página en "Cargando…" para siempre —el bug del spinner eterno, un clásico doloroso—.

**El tercer estado.** Tu interfaz tenía dos (cargando, contenido); toda interfaz conectada tiene TRES:

\`\`\`
<p v-if="cargando">Cargando…</p>
<div v-else-if="error">{{ error }} <button @click="pedirSombreros">Reintentar</button></div>
<section v-else> … el catálogo … </section>
\`\`\`

Cargando, error, contenido: el trío \`v-if / v-else-if / v-else\` del Mundo 10, en su uso más universal. Y el botón de **reintentar** vuelve a llamar a la misma función —que por eso empieza reseteando \`cargando\` y \`error\`—: al usuario no se le deja en un callejón.

**El vocabulario que viene: REST.** Hasta ahora solo LEES datos (\`GET\`, el verbo por defecto de fetch). Las APIs de verdad hablan más verbos: \`POST\` (crear), \`PUT\` (reemplazar), \`DELETE\` (borrar). Una **API REST** es un servidor organizado así: \`GET /sombreros\` lista, \`POST /sombreros\` crea, \`DELETE /sombreros/2\` borra el 2. Tu fetch ya sabe hablarlos todos (con su segundo parámetro); el próximo mundo te lleva de visita al otro lado: qué hay detrás de esas direcciones.`,
  },

  pasos: [
    {
      id: '24-1',
      titulo: 'El tercer ref',
      enunciado: 'Añade el estado que falta: <code>const error = ref(null)</code>. Vacío (null) mientras todo va bien.',
      pista: 'null significa "no hay error". Cuando algo falle, esta caja llevará el mensaje.',
      comprobar: comprobarVue({
        script: [
          (script) =>
            /const\s+error\s*=\s*ref\s*\(\s*null\s*\)/.test(script)
              ? null
              : 'Falta const error = ref(null) en el script.',
        ],
        exito: 'Cargando, datos, error: los tres estados tienen ya su caja. Ahora, a rellenarlas con cabeza.',
      }),
    },

    {
      id: '24-2',
      titulo: 'Blinda la petición',
      enunciado:
        'Envuelve el cuerpo de <code>pedirSombreros</code> en <code>try/catch/finally</code>: el catch guarda el mensaje en <code>error.value</code> (con <code>fallo.message</code>), y el <code>finally</code> apaga <code>cargando</code> pase lo que pase. La función debe empezar reseteando: <code>cargando.value = true; error.value = null</code>.',
      pista: 'La estructura del apunte. El finally sustituye al apagado que tenías en el camino feliz.',
      comprobar: comprobarVue({
        script: [
          (script) => (/try\s*\{/.test(script) ? null : 'Falta el try alrededor de la petición.'),
          (script) =>
            /catch\s*\(\s*\w+\s*\)\s*\{[\s\S]*?error\.value\s*=/.test(script)
              ? null
              : 'El catch tiene que guardar el mensaje en error.value.',
          (script) =>
            /finally\s*\{[\s\S]*?cargando\.value\s*=\s*false/.test(script)
              ? null
              : 'El finally tiene que apagar cargando (así no hay spinner eterno).',
          (script) =>
            /error\.value\s*=\s*null/.test(script)
              ? null
              : 'La función debe empezar limpiando: error.value = null (si no, un reintento exitoso seguiría enseñando el error viejo).',
        ],
        exito: 'Petición blindada: el fallo se captura, el mensaje se guarda, y cargando se apaga SIEMPRE. Adiós al spinner eterno.',
      }),
    },

    {
      id: '24-3',
      titulo: 'El no del servidor',
      enunciado:
        'fetch no considera error un 404. Dentro del try, tras el fetch: <code>if (!respuesta.ok) { throw new Error(\'El servidor respondió \' + respuesta.status) }</code>.',
      pista: 'respuesta.ok es true solo con códigos 2xx. El throw convierte el "no" en un error que tu catch ya sabe tratar.',
      comprobar: comprobarVue({
        script: [
          (script) =>
            /if\s*\(\s*!\s*\w+\.ok\s*\)/.test(script)
              ? null
              : 'Falta el if (!respuesta.ok) tras el fetch.',
          (script) =>
            /throw\s+new\s+Error\s*\(/.test(script) ? null : 'Dentro del if, lanza el error: throw new Error(…).',
          (script) =>
            /\.status/.test(script) ? null : 'Incluye el código en el mensaje: respuesta.status (así sabrás si fue 404 o 500).',
        ],
        exito: 'Ahora un 404 y un servidor caído acaban en el mismo catch, cada uno con su mensaje. Dos familias de fallo, una defensa.',
      }),
    },

    {
      id: '24-4',
      titulo: 'El tercer estado, visible',
      enunciado:
        'En el template, entre la carga y el catálogo: <code>&lt;div v-else-if="error" class="fallo"&gt;</code> con el mensaje <code>{{ error }}</code> y un botón <code>@click="pedirSombreros"</code> de Reintentar. Dale a <code>.fallo</code> un estilo que se note (borde o color de aviso).',
      pista: 'El orden importa: v-if="cargando", v-else-if="error", v-else. Pruébalo rompiendo la dirección del fetch.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/v-else-if\s*=\s*["']error["']/, 'Falta el bloque v-else-if="error" entre la carga y el catálogo.'),
          plantillaContiene(/\{\{\s*error\s*\}\}/, 'El bloque tiene que enseñar el mensaje: {{ error }}.'),
          plantillaContiene(/@click\s*=\s*["']pedirSombreros/, 'Falta el botón de Reintentar con @click="pedirSombreros".'),
        ],
        estilo: [
          (reglas) =>
            reglas.some((r) => /\.fallo/.test(r.selector))
              ? null
              : 'Dale estilo al aviso: una regla .fallo en el style.',
        ],
        exito: 'Rompe el fetch a propósito (/sombreros-mal.json), guarda, y mira: mensaje claro y botón de salida. Arréglalo y reintenta. Eso es una app adulta.',
      }),
    },

    eleccion({
      id: '24-5',
      titulo: 'Leer un código',
      enunciado: 'Tu petición vuelve con un <code>404</code>. ¿Qué ha pasado?',
      pista: 'Las familias: 2xx, 4xx, 5xx. ¿De quién es la culpa en cada una?',
      opciones: [
        {
          texto: 'La dirección que pediste no existe: el error es del lado que pide (4xx).',
          correcta: true,
          porque: 'Eso es: 404 = Not Found. Revisa la URL, que el servidor está perfectamente y te está diciendo "eso no está aquí".',
        },
        {
          texto: 'El servidor se ha roto por dentro.',
          porque: 'Eso sería un 5xx (500 y familia). El 404 dice otra cosa: el servidor está bien, lo que pides no existe.',
        },
        {
          texto: 'Todo fue bien: 404 es una variante del 200.',
          porque: 'Para fetch casi (no lanza error), y por eso hay que mirar respuesta.ok. Pero no: 404 es un "no encontrado" en toda regla.',
        },
      ],
    }),

    verdaderoFalso({
      id: '24-6',
      titulo: 'Cierto o falso: fallos con clase',
      enunciado: 'Cinco frases sobre errores HTTP. Todas.',
      pista: 'La trampa del fetch, el finally, y quién tiene la culpa en cada familia.',
      afirmaciones: [
        { texto: 'fetch lanza error automáticamente cuando el servidor responde 404.', cierto: false, porque: 'Falso, y es LA trampa: para fetch, contestar ya es éxito. respuesta.ok y throw son tu trabajo.' },
        { texto: 'El finally se ejecuta tanto si el try salió bien como si saltó el catch.', cierto: true, porque: 'Cierto: por eso es el sitio del cargando.value = false. Pase lo que pase, la espera termina.' },
        { texto: 'Los códigos 4xx señalan un problema en quien pide; los 5xx, en el servidor.', cierto: true, porque: 'Cierto: 4xx mira tu petición, 5xx compadece al servidor.' },
        { texto: 'Un buen estado de error incluye una salida, como un botón de reintentar.', cierto: true, porque: 'Cierto: el mensaje sin salida es un callejón. Reintentar cuesta un botón y salva la experiencia.' },
        { texto: 'Si el reintento va bien, no hace falta limpiar el error viejo: se borra solo.', cierto: false, porque: 'Falso: error.value = null al empezar la función, o el mensaje viejo se queda pegado sobre datos nuevos.' },
      ],
    }),

    emparejar({
      id: '24-7',
      titulo: 'Los verbos de una API',
      enunciado: 'Une cada verbo HTTP con lo que hace en una API REST.',
      pista: 'Leer, crear, reemplazar, borrar.',
      pares: [
        { izquierda: 'GET /sombreros', derecha: 'leer la lista' },
        { izquierda: 'POST /sombreros', derecha: 'crear uno nuevo', porque: 'POST envía datos para crear; es el verbo de los formularios.' },
        { izquierda: 'PUT /sombreros/2', derecha: 'reemplazar el 2' },
        { izquierda: 'DELETE /sombreros/2', derecha: 'borrar el 2' },
      ],
      porque: 'GET lee, POST crea, PUT reemplaza, DELETE borra. Con ese vocabulario se lee la documentación de cualquier API del mundo.',
    }),

    completar({
      id: '24-8',
      titulo: 'El blindaje de memoria',
      enunciado: 'Completa la petición blindada: la comprobación, el lanzamiento y el siempre.',
      pista: 'La propiedad del éxito, la palabra que lanza, y el bloque que nunca falta.',
      plantilla: `try {
  const r = await fetch('/sombreros.json')
  if (!r.___) {
    ___ new Error('Respondió ' + r.status)
  }
  sombreros.value = await r.json()
} catch (fallo) {
  error.value = fallo.message
} ___ {
  cargando.value = false
}`,
      huecos: [
        { respuestas: ['ok'], porque: 'respuesta.ok es true solo con códigos 2xx.' },
        { respuestas: ['throw'], porque: 'throw lanza el error a propósito, para que el catch lo recoja.' },
        { respuestas: ['finally'], porque: 'finally corre siempre: el sitio de apagar la espera.' },
      ],
    }),

    {
      id: '24-9',
      titulo: 'La petición a prueba de todo',
      sintesis: true,
      enunciado:
        'Sin pistas. La versión definitiva: los tres refs (con <code>error = ref(null)</code>), la función que resetea al entrar, el <code>try</code> con su <code>if (!respuesta.ok)</code> + <code>throw</code>, el <code>catch</code> que guarda, el <code>finally</code> que apaga, y el template con los TRES estados (cargando / error con Reintentar / catálogo). Rompe la URL, mira el error, arréglala, reintenta.',
      comprobar: comprobarVue({
        script: [
          (script) => (/const\s+error\s*=\s*ref\s*\(\s*null\s*\)/.test(script) ? null : 'Falta el ref error.'),
          (script) => (/if\s*\(\s*!\s*\w+\.ok\s*\)/.test(script) ? null : 'Falta la comprobación respuesta.ok.'),
          (script) => (/throw\s+new\s+Error/.test(script) ? null : 'Falta el throw del "no" del servidor.'),
          (script) => (/finally\s*\{[\s\S]*?cargando\.value\s*=\s*false/.test(script) ? null : 'Falta el finally apagando cargando.'),
          (script) => (/error\.value\s*=\s*null/.test(script) ? null : 'Falta limpiar el error al reintentar.'),
        ],
        template: [
          plantillaContiene(/v-else-if\s*=\s*["']error["']/, 'Falta el estado de error en el template.'),
          plantillaContiene(/@click\s*=\s*["']pedirSombreros/, 'Falta el botón de Reintentar.'),
        ],
        exito:
          'Tres estados, códigos entendidos, fallos con salida. Tu página ya trata al servidor como lo que es: alguien que a veces no está. Lo siguiente: asomarse al otro lado del cable.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en la proporción: el camino feliz eran cuatro líneas; el blindaje, otras tantas. Esa mitad "extra" es la que distingue ' +
      'el software profesional: no brilla en la demo, pero es la que aguanta el martes a las nueve cuando el servidor tose. ' +
      'Y ahora la pregunta buena: ¿qué HAY exactamente al otro lado? Servidores, APIs y bases de datos. Pasa al siguiente.',
  },
}
