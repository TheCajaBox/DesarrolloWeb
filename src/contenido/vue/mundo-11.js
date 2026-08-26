// Mundo 11 (Vue) — v-for: el catálogo sale de una lista.
//
// Cuarto mundo del Acto III, y el momento estrella del temario: las seis
// fichas escritas a mano se convierten en UN array de objetos y UNA ficha con
// v-for. Entran los arrays, los objetos, el :key, y push para añadir.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, scriptContiene } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'
</script>

<template>
  <main>
    <h1>El catálogo</h1>

    <section class="catalogo">
      <article class="ficha">
        <h2>Bombín de fieltro</h2>
        <p>42 €</p>
      </article>
      <article class="ficha">
        <h2>Panamá de verano</h2>
        <p>35 €</p>
      </article>
      <article class="ficha">
        <h2>Gorra de leñador</h2>
        <p>18 €</p>
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
  numero: 11,
  acto: 'Datos',
  titulo: 'Mundo 11 · Listas que se pintan solas',

  entradilla: {
    quien: 'wayne',
    texto:
      'Mira ese template: tres fichas casi idénticas, copiadas a mano. ¿Y si mañana hay cincuenta sombreros? ¿Copiar cincuenta veces? ' +
      'No. Hoy los sombreros se van a vivir a una lista en el script, y en el template queda UNA ficha que se repite sola. ' +
      'Es el mundo más importante del taller. No exagero, y mira que exagero.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
  { id: 4, nombre: 'Boina clásica', precio: 22 },
])

function estrenar() {
  const siguiente = sombreros.value.length + 1
  sombreros.value.push({ id: siguiente, nombre: 'Sombrero misterioso ' + siguiente, precio: 30 })
}
</script>

<template>
  <main>
    <h1>El catálogo</h1>
    <p>{{ sombreros.length }} sombreros en la percha.</p>
    <button @click="estrenar">Estrenar sombrero</button>

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
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Arrays, objetos y v-for',
    cuerpo: `Este mundo junta tres piezas de JavaScript con una directiva de Vue, y el resultado es la técnica con la que están hechas todas las tiendas, redes y listados que has visto en tu vida.

**El objeto: una cosa con sus propiedades.**

\`\`\`
{ id: 1, nombre: 'Bombín de fieltro', precio: 42 }
\`\`\`

Un objeto agrupa datos que van juntos, con nombre cada uno: \`nombre\`, \`precio\`, \`id\`. Se accede con el punto: \`sombrero.nombre\`, \`sombrero.precio\`. Piensa en él como la ficha de cartón de un archivo: una unidad con sus campos.

**El array: la caja de las fichas.**

\`\`\`
const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
])
\`\`\`

Los corchetes \`[ ]\` guardan una lista ordenada. Aquí, una lista de objetos: **el catálogo entero es UN dato**. Cosas útiles que ya sabe hacer: \`sombreros.value.length\` (cuántos hay), \`sombreros.value.push(otro)\` (añadir al final), y más adelante \`filter\` y \`map\`, que son las que mandan.

**v-for: una plantilla, muchas copias.**

\`\`\`
<article v-for="sombrero in sombreros" :key="sombrero.id" class="ficha">
  <h2>{{ sombrero.nombre }}</h2>
  <p>{{ sombrero.precio }} €</p>
</article>
\`\`\`

Se lee: "por cada \`sombrero\` dentro de \`sombreros\`, pinta un \`<article>\` como este". La variable \`sombrero\` la inventas tú ahí mismo, y dentro del elemento vale como cualquier dato: \`{{ sombrero.nombre }}\`. Tres objetos en el array → tres fichas. Cincuenta → cincuenta. **Una sola plantilla.**

**El \`:key\`, que no es adorno.** Vue exige (y con razón) que cada copia lleve \`:key\` con un valor **único y estable**: \`:key="sombrero.id"\`. ¿Para qué? Cuando la lista cambie —se añade, se borra, se reordena—, Vue usa la key para saber **qué ficha es cuál** y mover solo lo que toca en vez de repintarlo todo. Por eso el id: es único y no cambia. Usar la posición en la lista como key es la trampa clásica: al borrar el primero, todas las posiciones bailan y Vue se lía. Id de la cosa, siempre que lo tengas.

**Y ahora, lo mágico: la lista es reactiva.** \`sombreros.value.push({...})\` añade un objeto… y aparece una ficha nueva en pantalla, sola. No hay ningún "añadir elemento al HTML": has cambiado el dato, y el v-for se ha puesto al día. Cincuenta sombreros nuevos son cincuenta \`push\`, cero cambios en el template. Esa separación —los datos son la verdad, la página los refleja— es la que llevas practicando tres mundos, y aquí es donde paga de verdad.`,
  },

  pasos: [
    {
      id: '11-1',
      titulo: 'El catálogo se hace dato',
      enunciado:
        'En el script, crea el array de objetos: <code>const sombreros = ref([...])</code> con al menos <strong>tres</strong> sombreros, cada uno con <code>id</code>, <code>nombre</code> y <code>precio</code>.',
      pista: 'Cada sombrero es un objeto entre llaves: <code>{ id: 1, nombre: \'Bombín\', precio: 42 }</code>, separados por comas, dentro de los corchetes del array.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+sombreros\s*=\s*ref\s*\(\s*\[/, {
            falta: 'Falta const sombreros = ref([ … ]) con el array dentro.',
          }),
          scriptContiene(/id\s*:\s*\d+[\s\S]*?nombre\s*:\s*['"`][\s\S]*?precio\s*:\s*\d+/, {
            falta: 'Cada sombrero necesita sus tres campos: id, nombre y precio.',
          }),
          (script) => {
            const cuantos = (String(script).match(/nombre\s*:/g) || []).length
            return cuantos < 3 ? `El array lleva ${cuantos} sombrero${cuantos === 1 ? '' : 's'} y hacen falta 3.` : null
          },
        ],
        exito: 'El catálogo entero en un solo dato. Ahora mismo la página no lo enseña; eso es exactamente lo siguiente.',
      }),
    },

    {
      id: '11-2',
      titulo: 'Una ficha para gobernarlas todas',
      enunciado:
        'Borra las fichas repetidas del template y deja UNA con el v-for: <code>&lt;article v-for="sombrero in sombreros" :key="sombrero.id" class="ficha"&gt;</code>, enseñando dentro <code>{{ sombrero.nombre }}</code> y <code>{{ sombrero.precio }}</code>.',
      pista: 'La variable "sombrero" la inventas en el propio v-for. El :key="sombrero.id" es obligatorio y va en el mismo elemento.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+sombreros\s*["']/, 'Falta el v-for="sombrero in sombreros" en la ficha.'),
          plantillaContiene(/:key\s*=\s*["']\s*\w+\.id\s*["']/, 'Al v-for le falta el :key="sombrero.id".'),
          plantillaContiene(/\{\{\s*\w+\.nombre\s*\}\}/, 'La ficha tiene que enseñar {{ sombrero.nombre }}.'),
          plantillaContiene(/\{\{\s*\w+\.precio\s*\}\}/, 'La ficha tiene que enseñar {{ sombrero.precio }}.'),
        ],
        exito: 'Una plantilla, todas las fichas. Añade un objeto más al array y guarda: aparece solo. Pruébalo, que engancha.',
      }),
    },

    eleccion({
      id: '11-3',
      titulo: 'El porqué del :key',
      enunciado: '¿Para qué necesita Vue el <code>:key</code> en cada elemento del v-for?',
      pista: 'Piensa en qué pasa cuando la lista cambia de orden o pierde un elemento.',
      opciones: [
        {
          texto: 'Para identificar cada copia y, cuando la lista cambie, mover solo lo que toca.',
          correcta: true,
          porque: 'Eso es: la key es el DNI de cada ficha. Con ella, Vue reordena y borra con precisión en vez de repintar a ciegas.',
        },
        {
          texto: 'Es decorativo: quita un aviso de la consola y ya.',
          porque: 'El aviso existe porque la key importa: sin ella, Vue puede reciclar elementos equivocados y verás fichas con datos cruzados.',
        },
        {
          texto: 'Sirve para ordenar la lista alfabéticamente.',
          porque: 'La key no ordena nada: identifica. El orden lo decide el array.',
        },
      ],
    }),

    {
      id: '11-4',
      titulo: 'La cuenta, de regalo',
      enunciado:
        'Encima del catálogo, enseña cuántos hay: <code>&lt;p&gt;{{ sombreros.length }} sombreros en la percha.&lt;/p&gt;</code>. El array ya sabe contarse.',
      pista: '.length es la propiedad de todo array con su tamaño. En el template, sin .value.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/\{\{\s*sombreros\.length\s*\}\}/, 'Falta enseñar {{ sombreros.length }}.'),
        ],
        exito: 'La cuenta sale del array y se actualiza sola con cada cambio. Nada que mantener a mano.',
      }),
    },

    {
      id: '11-5',
      titulo: 'Estrenar sombrero',
      enunciado:
        'Un botón «Estrenar sombrero» con una función <code>estrenar</code> que haga <code>push</code> de un objeto nuevo al array (con su id, nombre y precio). Púlsalo en la vista previa y mira nacer la ficha.',
      pista: 'La función: <code>sombreros.value.push({ id: 5, nombre: \'…\', precio: 30 })</code>. Y el botón con @click="estrenar".',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/function\s+estrenar\s*\(|const\s+estrenar\s*=/, { falta: 'Falta la función estrenar.' }),
          scriptContiene(/sombreros\.value\.push\s*\(/, { falta: 'estrenar tiene que hacer sombreros.value.push({ … }).' }),
        ],
        template: [
          plantillaContiene(/@click\s*=\s*["']estrenar/, 'Falta el botón con @click="estrenar".'),
        ],
        exito: 'push al array y la ficha aparece: ni una línea de HTML nuevo. La lista es la verdad; la página, su espejo.',
      }),
    },

    verdaderoFalso({
      id: '11-6',
      titulo: 'Cierto o falso: listas',
      enunciado: 'Cinco frases sobre arrays, objetos y v-for. Todas.',
      pista: 'El array es la verdad; la key es el DNI.',
      afirmaciones: [
        { texto: 'sombrero.nombre accede a la propiedad nombre del objeto.', cierto: true, porque: 'Cierto: el punto entra en el objeto. Objeto con campos, punto para leerlos.' },
        { texto: 'Para añadir una ficha hay que escribir su HTML en el template.', cierto: false, porque: 'Falso, y es LA lección: se añade el objeto al array (push) y el v-for pinta la ficha solo.' },
        { texto: 'La key debe ser única y estable; el id del objeto es ideal.', cierto: true, porque: 'Cierto: única para distinguir, estable para que no baile al reordenar.' },
        { texto: 'Usar la posición del elemento como key es una buena costumbre.', cierto: false, porque: 'Falso: al borrar o reordenar, las posiciones cambian y Vue confunde las fichas. Id de la cosa.' },
        { texto: 'sombreros.length se actualiza solo cuando el array cambia.', cierto: true, porque: 'Cierto: el array es reactivo, y todo lo que dependa de él (la cuenta, las fichas) va detrás.' },
      ],
    }),

    completar({
      id: '11-7',
      titulo: 'El v-for de memoria',
      enunciado: 'Completa la ficha repetida: la directiva, la palabra del medio y la key.',
      pista: 'Directiva de repetir, la preposición del bucle, y el atributo-DNI.',
      plantilla: `<article ___="sombrero ___ sombreros" :___="sombrero.id">
  <h2>{{ sombrero.nombre }}</h2>
</article>`,
      huecos: [
        { respuestas: ['v-for'], porque: 'v-for repite el elemento por cada valor de la lista.' },
        { respuestas: ['in', 'of'], porque: 'La forma habitual es "sombrero in sombreros" (of también vale).' },
        { respuestas: ['key'], porque: ':key identifica cada copia. Sin ella, Vue pinta a ciegas.' },
      ],
    }),

    ordenar({
      id: '11-8',
      titulo: 'De cero a catálogo',
      enunciado: 'Ordena los pasos para montar un listado que se pinta solo, del primero al último.',
      pista: 'Primero el dato, luego la plantilla, luego el DNI, y al final los cambios.',
      lineas: [
        'Declarar el array de objetos en un ref',
        'Escribir UNA ficha con v-for="s in lista"',
        'Ponerle :key="s.id" a la ficha',
        'Añadir y borrar con push y filter: la página va sola',
      ],
      porque: 'Dato, plantilla, key, cambios. Ese es el orden natural, y el que repetirás en cada listado que montes.',
    }),

    emparejar({
      id: '11-9',
      titulo: 'Vocabulario de listas',
      enunciado: 'Une cada pieza con lo que es.',
      pista: 'Caja, ficha, tamaño, añadir.',
      pares: [
        { izquierda: '[ ] con objetos dentro', derecha: 'el array: la lista ordenada' },
        { izquierda: '{ id, nombre, precio }', derecha: 'el objeto: una cosa con sus campos' },
        { izquierda: '.length', derecha: 'cuántos elementos hay' },
        { izquierda: '.push(otro)', derecha: 'añadir al final', porque: 'push mete el objeto al final del array, y la vista se entera sola.' },
      ],
      porque: 'Array, objeto, length, push: el vocabulario mínimo de las listas. Con filter y map, que ya llegan, tendrás el completo.',
    }),

    {
      id: '11-10',
      titulo: 'El catálogo vivo',
      sintesis: true,
      enunciado:
        'Sin pistas. El catálogo final: array <code>sombreros</code> con al menos <strong>cuatro</strong> objetos completos (id, nombre, precio), UNA ficha con <code>v-for</code> y <code>:key="sombrero.id"</code> enseñando nombre y precio, la cuenta con <code>{{ sombreros.length }}</code>, y el botón «Estrenar» haciendo <code>push</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+sombreros\s*=\s*ref\s*\(\s*\[/, { falta: 'Falta el array sombreros en un ref.' }),
          (script) => {
            const cuantos = (String(script).match(/nombre\s*:/g) || []).length
            return cuantos < 4 ? `El array lleva ${cuantos} sombreros y hacen falta 4.` : null
          },
          scriptContiene(/sombreros\.value\.push\s*\(/, { falta: 'Falta el push de estrenar.' }),
        ],
        template: [
          plantillaContiene(/v-for\s*=\s*["']\s*\w+\s+in\s+sombreros\s*["']/, 'Falta el v-for="sombrero in sombreros" en la ficha.'),
          plantillaContiene(/:key\s*=\s*["']\s*\w+\.id\s*["']/, 'Falta el :key="sombrero.id".'),
          plantillaContiene(/\{\{\s*sombreros\.length\s*\}\}/, 'Falta la cuenta con sombreros.length.'),
          plantillaContiene(/@click\s*=\s*["']estrenar/, 'Falta el botón de estrenar.'),
        ],
        exito:
          'Un catálogo que vive en los datos: se cuenta solo, se pinta solo, crece con un push. Esta técnica es la columna vertebral de cualquier aplicación que enseñe cosas. Y ya es tuya.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Hazte esta pregunta con cada web que visites a partir de hoy: ¿dónde está el array? Porque lo hay. La lista de vídeos, los mensajes, los productos: ' +
      'todo son arrays con un v-for delante (o su equivalente). Ya piensas como quien las construye. Ahora vamos a derivar datos de datos: computed.',
  },
}
