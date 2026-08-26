// Mundo 15 (Vue) — El primer componente propio.
//
// Abre el Acto IV. App.vue está lleno, y la salida profesional es partirlo:
// nace src/components/FichaSombrero.vue, se importa y se usa como etiqueta.
// Primer mundo multi-fichero: la alumna crea un fichero nuevo en el árbol.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, existeFichero, scriptContiene } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
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
  numero: 15,
  acto: 'Componentes que hablan',
  titulo: 'Mundo 15 · Tu primer componente',

  entradilla: {
    quien: 'wayne',
    texto:
      'Tu App.vue engorda que da gusto: datos, rejilla, fichas, estilos… todo en un fichero. Funciona, pero huele a cajón desastre. ' +
      'Hoy haces lo que hace todo el mundo cuando la casa se queda pequeña: construir habitaciones. ' +
      'Vas a crear tu primer componente hijo, con su fichero y todo. Momento solemne. Bueno, más o menos.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
  },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'
import FichaSombrero from './components/FichaSombrero.vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
])
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <section class="catalogo">
      <FichaSombrero v-for="sombrero in sombreros" :key="sombrero.id" />
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
</style>
`,
    'src/components/FichaSombrero.vue': `<script setup>
</script>

<template>
  <article class="ficha">
    <h2>Un sombrero</h2>
    <p>Precio por decidir</p>
  </article>
</template>

<style scoped>
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
    titulo: 'Partir la aplicación en componentes',
    cuerpo: `Tu \`App.vue\` ya hace demasiadas cosas, y ese es el momento exacto en que un proyecto de verdad se parte en piezas. La pieza de Vue ya la conoces —el componente, el fichero \`.vue\` con sus tres bloques— porque llevas quince mundos viviendo dentro de uno. La novedad es que puede haber **muchos**, y que se montan unos dentro de otros como muñecas rusas.

**Dónde viven.** La convención universal es la carpeta \`src/components/\`, y el nombre en PascalCase (palabras pegadas con mayúscula inicial): \`FichaSombrero.vue\`, \`BarraBusqueda.vue\`. Dos palabras mejor que una, para no chocar con etiquetas HTML nativas.

**Cómo se crea.** Un componente hijo es un \`.vue\` normal y corriente:

\`\`\`
<script setup>
</script>

<template>
  <article class="ficha">
    <h2>Un sombrero</h2>
  </article>
</template>

<style scoped>
.ficha { … }
</style>
\`\`\`

Fíjate en que el \`<style scoped>\` viaja CON la ficha: el componente se lleva su aspecto puesto. Allá donde lo uses, se verá igual, y sus reglas no mancharán a nadie. Es el scoped del Mundo 4 pagando dividendos.

**Cómo se usa.** Dos pasos en el padre:

\`\`\`
<script setup>
import FichaSombrero from './components/FichaSombrero.vue'
</script>

<template>
  <FichaSombrero />
</template>
\`\`\`

El \`import\` lo trae (la ruta \`./components/…\` es relativa al fichero que importa, y la extensión \`.vue\` se escribe). Y en el template, el componente **es una etiqueta**: \`<FichaSombrero />\`, con mayúsculas y auto-cerrada si no lleva nada dentro. Puedes ponerla una vez, veinte, o dentro de un \`v-for\`: cada aparición es una **copia independiente** del componente, con sus propios datos si los tuviera.

**El árbol.** Con esto tu aplicación deja de ser un fichero y pasa a ser un **árbol**: \`App.vue\` en la raíz, hijos debajo, hijos de hijos más abajo. Toda app Vue es esto, y las grandes tienen cientos de nodos. Se lee de arriba abajo: quién contiene a quién.

**Una cosa que verás enseguida:** tu ficha nueva dice "Un sombrero" en las tres copias, porque el hijo todavía no sabe QUÉ sombrero es. El padre tiene los datos y el hijo la plantilla, y aún no se hablan. Ese es exactamente el tema del próximo mundo (las props: datos que bajan del padre al hijo). Hoy toca el esqueleto: crear, importar, usar.`,
  },

  pasos: [
    {
      id: '15-1',
      titulo: 'Nace el fichero',
      enunciado:
        'En el árbol de ficheros (botón «Nuevo fichero»), crea <code>src/components/FichaSombrero.vue</code> con sus tres bloques: un <code>&lt;script setup&gt;</code> vacío, un <code>&lt;template&gt;</code> con un <code>&lt;article class="ficha"&gt;</code> (dentro un <code>&lt;h2&gt;</code> con algo), y un <code>&lt;style scoped&gt;</code>.',
      pista: 'El nombre exacto importa: src/components/FichaSombrero.vue, con mayúsculas de PascalCase. Copia dentro la estructura de cualquier .vue.',
      comprobar: comprobarVue({
        fichero: 'src/components/FichaSombrero.vue',
        template: [
          (_doc, ficheros) => {
            const hijo = ficheros?.['src/components/FichaSombrero.vue']
            if (hijo === undefined) {
              return 'Todavía no existe src/components/FichaSombrero.vue. Créalo desde el árbol de ficheros.'
            }
            if (!/<style\s+scoped/.test(hijo)) return 'Al componente le falta su <style scoped> (aunque esté vacío).'
            return null
          },
          plantillaContiene(/<article/, 'Al template del componente le falta el <article class="ficha">.'),
          plantillaContiene(/<h2/, 'Ponle un <h2> dentro del article.'),
        ],
        exito: 'Tu primer componente hijo existe. Ahora mismo nadie lo usa: está en el banquillo, esperando el import.',
      }),
    },

    eleccion({
      id: '15-2',
      titulo: 'El nombre correcto',
      enunciado: '¿Cuál es el buen nombre para el componente de la barra de búsqueda?',
      pista: 'PascalCase y dos palabras, para no chocar con el HTML nativo.',
      opciones: [
        {
          texto: 'BarraBusqueda.vue — PascalCase, dos palabras.',
          correcta: true,
          porque: 'Eso es: mayúscula inicial en cada palabra, y compuesto para que jamás se confunda con una etiqueta HTML.',
        },
        {
          texto: 'barrabusqueda.vue — todo en minúsculas, más cómodo.',
          porque: 'La convención de Vue es PascalCase: distingue a golpe de vista un componente (<BarraBusqueda>) de una etiqueta (<input>).',
        },
        {
          texto: 'Input.vue — corto y al grano.',
          porque: 'Una sola palabra y encima chocando con <input>, que existe en HTML. Receta para confusiones.',
        },
      ],
    }),

    {
      id: '15-3',
      titulo: 'Impórtalo en App.vue',
      enunciado:
        'Abre <code>src/App.vue</code> y, en el script, trae al hijo: <code>import FichaSombrero from \'./components/FichaSombrero.vue\'</code>.',
      pista: 'La ruta es relativa a App.vue (./components/…) y lleva la extensión .vue. Va junto al otro import.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/import\s+FichaSombrero\s+from\s+['"]\.\/components\/FichaSombrero\.vue['"]/, {
            falta: "Falta el import FichaSombrero from './components/FichaSombrero.vue' en App.vue.",
          }),
        ],
        exito: 'Importado. App.vue ya conoce a su hijo; solo falta ponerlo en la plantilla.',
      }),
    },

    {
      id: '15-4',
      titulo: 'Úsalo como etiqueta',
      enunciado:
        'En el template de App.vue, sustituye el <code>&lt;article&gt;</code> del v-for por tu componente: <code>&lt;FichaSombrero v-for="sombrero in sombreros" :key="sombrero.id" /&gt;</code>.',
      pista: 'El componente es una etiqueta con su nombre: <FichaSombrero />. El v-for y el :key se le ponen igual que a cualquier elemento.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/<FichaSombrero[\s/>]/, 'El template de App.vue aún no usa <FichaSombrero />.'),
          plantillaContiene(/<FichaSombrero[^>]*v-for\s*=/, 'Ponle el v-for al propio <FichaSombrero>.'),
          plantillaContiene(/<FichaSombrero[^>]*:key\s*=/, 'No pierdas el :key en el v-for del componente.'),
        ],
        exito: 'Tres copias de tu componente en pantalla. Dicen todas lo mismo, sí: el hijo aún no sabe qué sombrero es. Eso es el próximo mundo.',
      }),
    },

    verdaderoFalso({
      id: '15-5',
      titulo: 'Cierto o falso: componentes',
      enunciado: 'Cinco frases sobre partir la app en piezas. Todas.',
      pista: 'El árbol, el scoped que viaja, y las copias independientes.',
      afirmaciones: [
        { texto: 'Un componente hijo es un fichero .vue normal, con sus tres bloques.', cierto: true, porque: 'Cierto: no hay ficheros de dos categorías. App.vue y FichaSombrero.vue son la misma clase de cosa.' },
        { texto: 'Para usar un hijo hace falta importarlo y ponerlo como etiqueta.', cierto: true, porque: 'Cierto: import en el script, <NombreDelComponente /> en el template. Dos pasos, siempre.' },
        { texto: 'El <style scoped> del hijo puede romper los estilos del padre.', cierto: false, porque: 'Falso: scoped encierra las reglas en su componente. El hijo viaja con su aspecto y no mancha.' },
        { texto: 'Cada <FichaSombrero /> del template es una copia independiente.', cierto: true, porque: 'Cierto: veinte etiquetas son veinte instancias, cada una con su propio estado si lo tuviera.' },
        { texto: 'La ruta del import es relativa a la raíz del disco duro.', cierto: false, porque: 'Falso: es relativa al fichero que importa. Desde App.vue: ./components/FichaSombrero.vue.' },
      ],
    }),

    completar({
      id: '15-6',
      titulo: 'Los dos pasos, de memoria',
      enunciado: 'Completa el uso de un componente hijo desde el padre.',
      pista: 'La palabra que trae, la carpeta convencional, y la etiqueta.',
      plantilla: `___ BarraBusqueda from './___/BarraBusqueda.vue'

// y en el template:
// <___ />`,
      huecos: [
        { respuestas: ['import'], porque: 'import trae el componente al script del padre.' },
        { respuestas: ['components'], porque: 'La convención: los hijos viven en src/components/.' },
        { respuestas: ['BarraBusqueda'], porque: 'En el template, el componente es una etiqueta con su propio nombre.' },
      ],
    }),

    ordenar({
      id: '15-7',
      titulo: 'De cajón desastre a árbol',
      enunciado: 'Ordena los pasos para extraer una pieza de App.vue a su propio componente.',
      pista: 'Crear, mover, importar, usar.',
      lineas: [
        'Crear el fichero en src/components/ con nombre PascalCase',
        'Mover al hijo su template y su style scoped',
        'Importarlo en el script del padre',
        'Sustituir el HTML del padre por la etiqueta del componente',
      ],
      porque: 'Crear, mover, importar, usar: la refactorización más repetida del mundo Vue. La harás tantas veces que tendrá memoria muscular.',
    }),

    emparejar({
      id: '15-8',
      titulo: 'Quién es quién en el árbol',
      enunciado: 'Une cada pieza del árbol de componentes con su papel.',
      pista: 'Raíz, hijo, carpeta, etiqueta.',
      pares: [
        { izquierda: 'App.vue', derecha: 'la raíz: el componente que contiene todo' },
        { izquierda: 'src/components/', derecha: 'la carpeta convencional de los hijos' },
        { izquierda: '<FichaSombrero />', derecha: 'una instancia del componente en un template', porque: 'Cada etiqueta crea una copia viva e independiente.' },
        { izquierda: 'import … from …', derecha: 'la línea que conecta padre e hijo' },
      ],
      porque: 'Raíz, carpeta, etiqueta, import: el vocabulario del árbol. Toda app Vue, de la más chica a la más bestia, es este dibujo.',
    }),

    {
      id: '15-9',
      titulo: 'La mudanza completa',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja la casa ordenada: <code>FichaSombrero.vue</code> existiendo en <code>src/components/</code> con su <code>&lt;article&gt;</code>, su <code>&lt;h2&gt;</code> y su <code>&lt;style scoped&gt;</code> con la regla <code>.ficha</code> (llévate el estilo de la ficha del padre al hijo); y <code>App.vue</code> importándolo y usándolo con su <code>v-for</code> y su <code>:key</code>.',
      comprobar: comprobarVue({
        template: [
          (_doc, ficheros) => {
            const hijo = ficheros?.['src/components/FichaSombrero.vue']
            if (hijo === undefined) return 'Falta el fichero src/components/FichaSombrero.vue.'
            if (!/<article/.test(hijo)) return 'Al hijo le falta su <article>.'
            if (!/<h2/.test(hijo)) return 'Al hijo le falta su <h2>.'
            if (!/<style\s+scoped/.test(hijo)) return 'El hijo tiene que llevar su <style scoped>.'
            if (!/\.ficha\s*\{/.test(hijo)) return 'Múdale al hijo la regla .ficha: su aspecto viaja con él.'
            return null
          },
          plantillaContiene(/<FichaSombrero[^>]*v-for\s*=/, 'App.vue tiene que usar <FichaSombrero> con su v-for.'),
          plantillaContiene(/<FichaSombrero[^>]*:key\s*=/, 'Y con su :key.'),
        ],
        script: [
          scriptContiene(/import\s+FichaSombrero\s+from/, { falta: 'App.vue necesita el import de FichaSombrero.' }),
        ],
        exito:
          'App.vue delgado y un hijo con su aspecto a cuestas. Acabas de hacer tu primera refactorización a componentes, que es la habilidad que separa los proyectos que crecen de los que se derrumban.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Tu aplicación ya es un árbol: App.vue arriba, FichaSombrero debajo. Pequeño, pero árbol. Ahora el problema evidente: ' +
      'las tres fichas dicen lo mismo porque el hijo no sabe qué sombrero le toca. Los datos del padre tienen que bajar. De eso van las props, y van ya.',
  },
}
