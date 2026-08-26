// Mundo 13 (Vue) — v-model: el buscador del catálogo.
//
// Sexto mundo del Acto III. La persona escribe, el dato se entera: v-model ata
// un campo de texto a un ref en las dos direcciones. Combinado con el computed
// del mundo anterior sale el buscador en vivo, la joya del acto. Y un
// formulario con @submit.prevent para añadir sombreros.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, scriptContiene } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

const APP_SEMBRADA = `<script setup>
import { computed, ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
  { id: 4, nombre: 'Boina clásica', precio: 22 },
])
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <section class="catalogo">
      <article v-for="sombrero in sombreros" :key="sombrero.id" class="ficha">
        <h2>{{ sombrero.nombre }}</h2>
        <p>{{ sombrero.precio }} €</p>
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

export default {
  numero: 13,
  acto: 'Datos',
  titulo: 'Mundo 13 · El buscador en vivo',

  entradilla: {
    quien: 'wayne',
    texto:
      'Hoy montas la pieza que más impresiona a las visitas: escribes "bo" en una caja y el catálogo se queda solo con el bombín y la boina, ' +
      'al instante, tecla a tecla. Y lo mejor es que ya tienes el 80%: el buscador es un ref, un v-model y el computed del mundo pasado dándose la mano.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { computed, ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
  { id: 4, nombre: 'Boina clásica', precio: 22 },
])

const busqueda = ref('')
const nuevoNombre = ref('')

const encontrados = computed(() =>
  sombreros.value.filter((sombrero) =>
    sombrero.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  ),
)

function anadir() {
  const nombre = nuevoNombre.value.trim()
  if (!nombre) return
  sombreros.value.push({ id: sombreros.value.length + 1, nombre, precio: 30 })
  nuevoNombre.value = ''
}
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <input v-model="busqueda" type="search" placeholder="Busca un sombrero…" />
    <p v-if="encontrados.length === 0">Nada con «{{ busqueda }}». Prueba otra cosa.</p>

    <section class="catalogo">
      <article v-for="sombrero in encontrados" :key="sombrero.id" class="ficha">
        <h2>{{ sombrero.nombre }}</h2>
        <p>{{ sombrero.precio }} €</p>
      </article>
    </section>

    <form @submit.prevent="anadir">
      <input v-model="nuevoNombre" placeholder="Un sombrero nuevo" />
      <button type="submit">Añadir</button>
    </form>
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
    titulo: 'v-model, o el dato en las dos direcciones',
    cuerpo: `Hasta ahora el tráfico iba en un sentido: del dato a la página. Los formularios necesitan el contrario —de los dedos de la persona al dato— y Vue lo resuelve con una directiva que hace ambos a la vez:

\`\`\`
const busqueda = ref('')

<input v-model="busqueda" placeholder="Busca un sombrero…" />
\`\`\`

**\`v-model\` ata el campo y el ref en las dos direcciones.** La persona teclea → \`busqueda\` cambia. El script cambia \`busqueda.value\` → el campo se actualiza. Un solo lazo, sin escuchar \`@input\` a mano ni leer el campo con trucos. Empieza en \`ref('')\` —texto vacío— porque el campo empieza vacío.

**El buscador: v-model + computed.** Aquí se junta todo lo del acto:

\`\`\`
const encontrados = computed(() =>
  sombreros.value.filter((s) =>
    s.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  ),
)
\`\`\`

Léelo por capas: \`includes\` pregunta si un texto contiene a otro. Los dos \`toLowerCase()\` pasan todo a minúsculas antes de comparar, para que "Bo" encuentre "bombín" (sin eso, mayúsculas y minúsculas no casan, y el buscador parece roto). \`filter\` se queda con los que responden sí. Y \`computed\` observa: como el cálculo usa \`busqueda\`, **cada tecla lo dispara** y el v-for repinta. Persona → v-model → dato → computed → v-for → pantalla. La cadena entera, tecla a tecla, y tú no has escrito ni un "actualizar".

**Detalle fino:** cuando la búsqueda está vacía, \`includes('')\` responde sí a todo, así que el catálogo completo se enseña solo. El caso "sin filtro" funciona gratis, sin un if aparte.

**El formulario de añadir.** Para entradas que se confirman (no como el buscador, que es continuo), el HTML tiene \`<form>\`:

\`\`\`
<form @submit.prevent="anadir">
  <input v-model="nuevoNombre" placeholder="Un sombrero nuevo" />
  <button type="submit">Añadir</button>
</form>
\`\`\`

El \`<form>\` agrupa; el botón \`type="submit"\` lo envía (y Enter también, gratis). \`@submit.prevent\` escucha el envío y el \`.prevent\` cancela la recarga de página que el navegador hace de fábrica —herencia de los años noventa que en una app Vue no quieres jamás—.

**Y la función valida antes de tocar los datos:**

\`\`\`
function anadir() {
  const nombre = nuevoNombre.value.trim()
  if (!nombre) return
  sombreros.value.push({ id: sombreros.value.length + 1, nombre, precio: 30 })
  nuevoNombre.value = ''
}
\`\`\`

\`trim()\` recorta espacios por los lados; \`if (!nombre) return\` corta en seco si quedó vacío (un \`return\` temprano: la función se va sin hacer nada). Solo entonces el push. Y al final, \`nuevoNombre.value = ''\` limpia el campo… **a través del dato**, claro: v-model trabaja en las dos direcciones, y esa es la gracia.`,
  },

  pasos: [
    {
      id: '13-1',
      titulo: 'La caja de búsqueda',
      enunciado:
        'Crea el ref del buscador, <code>const busqueda = ref(\'\')</code>, y ponle encima del catálogo un <code>&lt;input v-model="busqueda" placeholder="Busca un sombrero…" /&gt;</code>.',
      pista: 'El ref empieza con texto vacío: ref(\'\'). El input se ata con v-model="busqueda".',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+busqueda\s*=\s*ref\s*\(\s*['"`]{2}\s*\)|const\s+busqueda\s*=\s*ref\s*\(\s*['"]['"]\s*\)/, {
            falta: "Falta const busqueda = ref('') en el script.",
          }),
        ],
        template: [
          plantillaContiene(/v-model\s*=\s*["']busqueda["']/, 'Al input le falta el v-model="busqueda".'),
        ],
        exito: 'Campo y dato, atados en las dos direcciones. Escribe algo y el ref ya lo sabe (aunque todavía no se note).',
      }),
    },

    {
      id: '13-2',
      titulo: 'El filtro que busca',
      enunciado:
        'El computed <code>encontrados</code>: filtra <code>sombreros</code> quedándote los que su <code>nombre</code> contenga la búsqueda, con <code>toLowerCase()</code> en los dos lados y <code>includes</code>. Y cambia el <code>v-for</code> a <code>encontrados</code>.',
      pista: 'La pregunta del filter: <code>s.nombre.toLowerCase().includes(busqueda.value.toLowerCase())</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+encontrados\s*=\s*computed\s*\(/, { falta: 'Falta const encontrados = computed(…).' }),
          scriptContiene(/\.filter\s*\(/, { falta: 'encontrados tiene que usar filter.' }),
          scriptContiene(/toLowerCase\s*\(\s*\)[\s\S]*?includes\s*\(|includes\s*\([\s\S]*?toLowerCase/, {
            falta: 'La comparación necesita toLowerCase() e includes para ignorar mayúsculas.',
          }),
        ],
        template: [
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+encontrados\s*["']/, 'El v-for tiene que recorrer encontrados.'),
        ],
        exito: 'Escribe «bo» en la caja. Bombín y boina. Tecla a tecla, sin botón de buscar. Esa cadena la has montado tú.',
      }),
    },

    eleccion({
      id: '13-3',
      titulo: 'Por qué las minúsculas',
      enunciado: 'Sin los <code>toLowerCase()</code>, buscar «bo» no encuentra «Bombín». ¿Por qué?',
      pista: 'Para un ordenador, ¿«B» y «b» son la misma letra?',
      opciones: [
        {
          texto: 'Porque para includes, «B» y «b» son caracteres distintos: hay que normalizar antes de comparar.',
          correcta: true,
          porque: 'Exacto. Pasar los dos lados a minúsculas antes de comparar es la normalización mínima de todo buscador.',
        },
        {
          texto: 'Porque includes solo funciona con minúsculas.',
          porque: 'includes funciona con cualquier texto; simplemente compara carácter a carácter, y «B» no es «b».',
        },
        {
          texto: 'Es un bug de Vue con las mayúsculas.',
          porque: 'Vue ni pincha ni corta aquí: es cómo comparan los textos en JavaScript (y en casi todo lenguaje).',
        },
      ],
    }),

    {
      id: '13-4',
      titulo: 'Cuando no hay nada',
      enunciado:
        'Si buscas «zapato», la rejilla se queda vacía y sin explicación. Añade el aviso: <code>&lt;p v-if="encontrados.length === 0"&gt;Nada con «{{ busqueda }}»…&lt;/p&gt;</code>.',
      pista: 'La condición es que el array filtrado esté vacío: encontrados.length === 0. Y dentro puedes interpolar la búsqueda.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(
            /v-if\s*=\s*["']encontrados\.length\s*===?\s*0["']/,
            'Falta el aviso con v-if="encontrados.length === 0".',
          ),
          plantillaContiene(/\{\{\s*busqueda\s*\}\}/, 'El aviso queda mejor enseñando {{ busqueda }} dentro.'),
        ],
        exito: 'Estado vacío con mensaje: el detalle que separa una interfaz cuidada de una que se queda muda.',
      }),
    },

    verdaderoFalso({
      id: '13-5',
      titulo: 'Cierto o falso: formularios',
      enunciado: 'Cinco frases sobre v-model y los formularios. Todas.',
      pista: 'Dos direcciones, prevent, y validar antes de tocar datos.',
      afirmaciones: [
        { texto: 'v-model trabaja en las dos direcciones: teclado→dato y dato→campo.', cierto: true, porque: 'Cierto: es su gracia. Limpiar el campo es tan fácil como vaciar el ref.' },
        { texto: 'El .prevent de @submit.prevent hace que el formulario se envíe dos veces.', cierto: false, porque: 'Falso: .prevent CANCELA el comportamiento de fábrica (la recarga de página). No duplica nada, evita.' },
        { texto: 'includes(\'\') devuelve verdadero para cualquier texto.', cierto: true, porque: 'Cierto, y por eso el buscador vacío enseña el catálogo entero gratis.' },
        { texto: 'La validación (trim, campo no vacío) va en el template.', cierto: false, porque: 'Falso: las reglas viven en la función del script. El template enseña; el script decide.' },
        { texto: 'El botón type="submit" y la tecla Enter disparan el mismo @submit.', cierto: true, porque: 'Cierto: el form unifica las dos entradas. Enter gratis es una de sus ventajas.' },
      ],
    }),

    completar({
      id: '13-6',
      titulo: 'El formulario de memoria',
      enunciado: 'Completa el formulario que no recarga: la directiva del campo, el evento con su modificador, y el tipo del botón.',
      pista: 'Atar el input, escuchar el envío sin recarga, marcar el botón que envía.',
      plantilla: `<form @submit.___="anadir">
  <input ___="nuevoNombre" placeholder="Un sombrero nuevo" />
  <button type="___">Añadir</button>
</form>`,
      huecos: [
        { respuestas: ['prevent'], porque: '.prevent cancela la recarga de fábrica del formulario.' },
        { respuestas: ['v-model'], porque: 'v-model ata el campo al ref nuevoNombre.' },
        { respuestas: ['submit'], porque: 'type="submit" hace que el botón (y Enter) envíen el formulario.' },
      ],
    }),

    {
      id: '13-7',
      titulo: 'Alta de sombreros',
      enunciado:
        'El formulario de verdad: un ref <code>nuevoNombre</code>, un <code>&lt;form @submit.prevent="anadir"&gt;</code> con su input atado y su botón <code>type="submit"</code>, y la función <code>anadir</code> que valide con <code>trim()</code>, corte si está vacío, haga el <code>push</code> y limpie el campo.',
      pista: 'La función del apunte de Wax, tal cual: trim, if (!nombre) return, push, y nuevoNombre.value = \'\'.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+nuevoNombre\s*=\s*ref\s*\(/, { falta: 'Falta el ref nuevoNombre.' }),
          scriptContiene(/function\s+anadir\s*\(|const\s+anadir\s*=/, { falta: 'Falta la función anadir.' }),
          scriptContiene(/\.trim\s*\(\s*\)/, { falta: 'anadir tiene que limpiar espacios con trim().' }),
          scriptContiene(/if\s*\(\s*!\s*\w+\s*\)\s*return/, { falta: 'Falta el corte si quedó vacío: if (!nombre) return.' }),
          scriptContiene(/sombreros\.value\.push\s*\(/, { falta: 'Falta el push al array.' }),
          scriptContiene(/nuevoNombre\.value\s*=\s*['"]['"]/, { falta: "Al final, limpia el campo: nuevoNombre.value = ''." }),
        ],
        template: [
          plantillaContiene(/@submit\.prevent\s*=\s*["']anadir/, 'Al form le falta @submit.prevent="anadir".'),
          plantillaContiene(/v-model\s*=\s*["']nuevoNombre["']/, 'Al input del alta le falta v-model="nuevoNombre".'),
        ],
        exito: 'Alta con validación: ni vacíos ni espacios disfrazados entran en tu catálogo. Y el campo se limpia solo a través del dato.',
      }),
    },

    ordenar({
      id: '13-8',
      titulo: 'Una tecla, por dentro',
      enunciado: 'Ordena lo que pasa desde que la persona pulsa una letra en el buscador hasta que ve la rejilla nueva.',
      pista: 'Es la cadena de siempre, con v-model en la puerta.',
      lineas: [
        'La persona teclea una letra en el input',
        'v-model actualiza el ref busqueda',
        'El computed encontrados se recalcula (depende de busqueda)',
        'El v-for repinta la rejilla con los que quedan',
      ],
      porque: 'Teclado → dato → derivado → pantalla. Cuatro eslabones que ya conoces por separado; el buscador solo los encadena.',
    }),

    {
      id: '13-9',
      titulo: 'El catálogo interactivo',
      sintesis: true,
      enunciado:
        'Sin pistas. Todo junto y funcionando: el buscador (<code>busqueda</code> + <code>v-model</code> + computed <code>encontrados</code> con <code>toLowerCase</code>/<code>includes</code>), el <code>v-for</code> sobre <code>encontrados</code>, el aviso de «nada encontrado», y el alta completa (<code>form</code> con <code>@submit.prevent</code>, <code>trim</code>, corte por vacío, <code>push</code> y limpieza del campo).',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+busqueda\s*=\s*ref\s*\(/, { falta: 'Falta el ref busqueda.' }),
          scriptContiene(/const\s+encontrados\s*=\s*computed\s*\(/, { falta: 'Falta el computed encontrados.' }),
          scriptContiene(/toLowerCase/, { falta: 'La comparación necesita toLowerCase.' }),
          scriptContiene(/if\s*\(\s*!\s*\w+\s*\)\s*return/, { falta: 'La validación del alta necesita su corte por vacío.' }),
          scriptContiene(/sombreros\.value\.push\s*\(/, { falta: 'Falta el push del alta.' }),
        ],
        template: [
          plantillaContiene(/v-model\s*=\s*["']busqueda["']/, 'Falta el v-model del buscador.'),
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+encontrados\s*["']/, 'El v-for tiene que recorrer encontrados.'),
          plantillaContiene(/v-if\s*=\s*["']encontrados\.length\s*===?\s*0["']/, 'Falta el aviso de nada encontrado.'),
          plantillaContiene(/@submit\.prevent\s*=/, 'Falta el form con @submit.prevent.'),
        ],
        exito:
          'Buscador en vivo, estado vacío con mensaje, alta validada. Esto ya no es un ejercicio: es el catálogo interactivo que cualquier tienda pequeña firmaría. Y el acto que viene lo va a partir en componentes.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Repasa el acto entero: datos con ref, eventos, condiciones, listas, derivados y formularios. Con esas seis piezas se construye ' +
      'prácticamente cualquier interfaz. Lo que falta no es más piezas: es orden. Tu App.vue empieza a estar lleno, y de dividirlo en componentes va el siguiente acto.',
  },
}
