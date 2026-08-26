// Mundo 14 (Vue) — watch, onMounted y recordar: cierra el Acto III.
//
// Séptimo y último mundo del acto de datos. Dos herramientas de nivel
// intermedio: onMounted (hacer algo cuando el componente arranca) y watch
// (reaccionar a un cambio con efectos, no con derivados). Juntas resuelven el
// clásico "que la web recuerde": guardar en localStorage y recuperar al abrir.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, scriptContiene } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

const APP_SEMBRADA = `<script setup>
import { computed, ref } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
])

const favoritos = ref([])

function alternarFavorito(id) {
  if (favoritos.value.includes(id)) {
    favoritos.value = favoritos.value.filter((f) => f !== id)
  } else {
    favoritos.value.push(id)
  }
}
</script>

<template>
  <main>
    <h1>El catálogo</h1>
    <p>Favoritos: {{ favoritos.length }}</p>

    <section class="catalogo">
      <article v-for="sombrero in sombreros" :key="sombrero.id" class="ficha">
        <h2>{{ sombrero.nombre }}</h2>
        <p>{{ sombrero.precio }} €</p>
        <button @click="alternarFavorito(sombrero.id)">
          {{ favoritos.includes(sombrero.id) ? '★ Favorito' : '☆ Marcar' }}
        </button>
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
  numero: 14,
  acto: 'Datos',
  titulo: 'Mundo 14 · Que la web recuerde',

  entradilla: {
    quien: 'wayne',
    texto:
      'Marca un favorito y recarga la página. Puf: se ha olvidado. Toda tu reactividad vive en la memoria de la pestaña, ' +
      'y la memoria de la pestaña dura lo que dura la pestaña. Hoy le ponemos remedio con dos herramientas nuevas: ' +
      'una que actúa al arrancar y otra que vigila los cambios. Al final, tus favoritos sobrevivirán a la recarga.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const sombreros = ref([
  { id: 1, nombre: 'Bombín de fieltro', precio: 42 },
  { id: 2, nombre: 'Panamá de verano', precio: 35 },
  { id: 3, nombre: 'Gorra de leñador', precio: 18 },
])

const favoritos = ref([])

function alternarFavorito(id) {
  if (favoritos.value.includes(id)) {
    favoritos.value = favoritos.value.filter((f) => f !== id)
  } else {
    favoritos.value.push(id)
  }
}

onMounted(() => {
  const guardados = localStorage.getItem('favoritos')
  if (guardados) favoritos.value = JSON.parse(guardados)
})

watch(
  favoritos,
  (nuevos) => {
    localStorage.setItem('favoritos', JSON.stringify(nuevos))
  },
  { deep: true },
)
</script>

<template>
  <main>
    <h1>El catálogo</h1>
    <p>Favoritos: {{ favoritos.length }}</p>

    <section class="catalogo">
      <article v-for="sombrero in sombreros" :key="sombrero.id" class="ficha">
        <h2>{{ sombrero.nombre }}</h2>
        <p>{{ sombrero.precio }} €</p>
        <button @click="alternarFavorito(sombrero.id)">
          {{ favoritos.includes(sombrero.id) ? '★ Favorito' : '☆ Marcar' }}
        </button>
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
    titulo: 'onMounted, watch y el almacén del navegador',
    cuerpo: `Tres piezas nuevas, y con ellas cierras el acto de los datos sabiendo hacer algo que parece de web grande: recordar entre visitas.

**onMounted: al arrancar el componente.** Los componentes tienen un ciclo de vida: nacen, viven, mueren. \`onMounted\` te deja engancharte al nacimiento:

\`\`\`
import { onMounted } from 'vue'

onMounted(() => {
  // esto corre UNA vez, cuando el componente ya está en pantalla
})
\`\`\`

Es el sitio para todo lo que necesita hacerse una vez al principio: recuperar datos guardados, pedir cosas a un servidor (eso llega en el Acto VII), arrancar un reloj. No lo confundas con "escribir código suelto en el script": el código suelto corre mientras Vue construye el componente; \`onMounted\`, cuando ya está montado y visible.

**watch: vigilar un dato para hacer efectos.** Ya conoces computed, que deriva un VALOR. \`watch\` es su primo de acción: vigila un dato y, cuando cambia, ejecuta un EFECTO —guardar, avisar, escribir en consola—:

\`\`\`
import { watch } from 'vue'

watch(favoritos, (nuevos) => {
  localStorage.setItem('favoritos', JSON.stringify(nuevos))
}, { deep: true })
\`\`\`

La función recibe el valor nuevo (y el viejo, si lo pides como segundo parámetro). El \`{ deep: true }\` del final importa cuando vigilas arrays u objetos: sin él, watch solo salta si el array se REEMPLAZA entero; con él, también si cambia por dentro (un push, por ejemplo). **¿computed o watch?** La pregunta correcta es: ¿quiero un valor nuevo (computed) o quiero que pase algo (watch)? Derivar → computed. Efecto → watch. Si usas watch para calcular valores, casi siempre querías computed.

**localStorage: el cajón del navegador.** Cada web tiene un pequeño almacén persistente en el navegador, que sobrevive a recargas y cierres:

\`\`\`
localStorage.setItem('favoritos', texto)   // guardar
localStorage.getItem('favoritos')          // leer (o null si no hay nada)
\`\`\`

Solo guarda TEXTO, y ahí entran dos traductores que usarás toda la vida: \`JSON.stringify(dato)\` convierte cualquier array u objeto en texto, y \`JSON.parse(texto)\` lo reconstruye. JSON es, además, el idioma en el que hablan las APIs del Acto VII, así que esto es un dos por uno.

**El patrón completo, que memorizarás por útil:**

1. **Al arrancar** (\`onMounted\`): lee del localStorage, y si había algo, \`JSON.parse\` y al ref.
2. **A cada cambio** (\`watch\` con \`deep\`): \`JSON.stringify\` y al localStorage.

Con esas dos costuras, el dato vive en la memoria (rápido, reactivo) y duerme en el disco (persistente). La recarga ya no borra nada. Y de paso: es EXACTAMENTE lo que hace este taller para acordarse de tu progreso.`,
  },

  pasos: [
    {
      id: '14-1',
      titulo: 'Importa el par nuevo',
      enunciado: 'Amplía el import de Vue con las dos herramientas de hoy: <code>onMounted</code> y <code>watch</code>.',
      pista: 'La línea queda: <code>import { computed, onMounted, ref, watch } from \'vue\'</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/import\s*\{[^}]*\bonMounted\b[^}]*\}\s*from\s*['"]vue['"]/, { falta: 'Falta onMounted en el import.' }),
          scriptContiene(/import\s*\{[^}]*\bwatch\b[^}]*\}\s*from\s*['"]vue['"]/, { falta: 'Falta watch en el import.' }),
        ],
        exito: 'Ciclo de vida y vigilancia, importados. Vamos a coserlos al almacén del navegador.',
      }),
    },

    eleccion({
      id: '14-2',
      titulo: '¿computed o watch?',
      enunciado: 'Quieres que cada vez que cambien los favoritos, se GUARDEN en el disco del navegador. ¿Herramienta?',
      pista: '¿Buscas un valor derivado, o que ocurra una acción?',
      opciones: [
        {
          texto: 'watch: guardar es un EFECTO, algo que pasa, no un valor que se deriva.',
          correcta: true,
          porque: 'Eso es. computed responde "cuánto/cuáles"; watch hace cosas cuando algo cambia. Guardar, avisar, registrar: watch.',
        },
        {
          texto: 'computed: se recalcula solo cuando cambian los favoritos.',
          porque: 'computed deriva valores y no debe tener efectos secundarios (guardar, escribir). Para actuar sobre un cambio está watch.',
        },
        {
          texto: 'Un setInterval que guarde cada segundo, por si acaso.',
          porque: 'Guardar a ciegas cada segundo es despilfarro y aun así puede perder el último cambio. watch guarda exactamente cuando hay algo nuevo.',
        },
      ],
    }),

    {
      id: '14-3',
      titulo: 'Guardar a cada cambio',
      enunciado:
        'El watch que guarda: vigila <code>favoritos</code> y a cada cambio ejecuta <code>localStorage.setItem(\'favoritos\', JSON.stringify(nuevos))</code>. No olvides el <code>{ deep: true }</code>: es un array y cambia por dentro.',
      pista: 'La forma: <code>watch(favoritos, (nuevos) =&gt; { … }, { deep: true })</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/watch\s*\(\s*favoritos/, { falta: 'Falta el watch(favoritos, …).' }),
          scriptContiene(/localStorage\.setItem\s*\(\s*['"]favoritos['"]/, {
            falta: "Dentro del watch falta localStorage.setItem('favoritos', …).",
          }),
          scriptContiene(/JSON\.stringify\s*\(/, { falta: 'localStorage solo guarda texto: hace falta JSON.stringify.' }),
          scriptContiene(/deep\s*:\s*true/, { falta: 'Al watch de un array le falta { deep: true } para ver los cambios por dentro.' }),
        ],
        exito: 'Cada estrella que marques queda escrita en el disco del navegador, al momento. La mitad del patrón está hecha.',
      }),
    },

    {
      id: '14-4',
      titulo: 'Recuperar al arrancar',
      enunciado:
        'La otra mitad: un <code>onMounted</code> que lea <code>localStorage.getItem(\'favoritos\')</code> y, <strong>si había algo</strong>, lo pase por <code>JSON.parse</code> y lo meta en <code>favoritos.value</code>. Luego marca estrellas y recarga la vista previa: siguen ahí.',
      pista: 'Dentro: <code>const guardados = localStorage.getItem(\'favoritos\'); if (guardados) favoritos.value = JSON.parse(guardados)</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/onMounted\s*\(/, { falta: 'Falta el onMounted(…).' }),
          scriptContiene(/localStorage\.getItem\s*\(\s*['"]favoritos['"]/, { falta: "Dentro falta localStorage.getItem('favoritos')." }),
          scriptContiene(/JSON\.parse\s*\(/, { falta: 'Lo guardado es texto: hace falta JSON.parse para reconstruir el array.' }),
          scriptContiene(/if\s*\(\s*\w+\s*\)/, { falta: 'Protege la lectura con un if: la primera visita no hay nada guardado (getItem da null).' }),
        ],
        exito: 'Recarga y compruébalo: las estrellas sobreviven. Guardar al cambiar, leer al arrancar: el patrón completo de la persistencia.',
      }),
    },

    verdaderoFalso({
      id: '14-5',
      titulo: 'Cierto o falso: memoria',
      enunciado: 'Cinco frases sobre el ciclo de vida y el almacén. Todas.',
      pista: 'Cuándo corre onMounted, qué guarda localStorage, y el deep.',
      afirmaciones: [
        { texto: 'onMounted corre una vez, cuando el componente ya está en pantalla.', cierto: true, porque: 'Cierto: es el gancho del arranque, ideal para recuperar datos.' },
        { texto: 'localStorage puede guardar arrays y objetos directamente.', cierto: false, porque: 'Falso: solo texto. JSON.stringify al guardar y JSON.parse al leer hacen de traductores.' },
        { texto: 'Sin { deep: true }, un watch sobre un array no salta con un push.', cierto: true, porque: 'Cierto: sin deep solo ve reemplazos enteros. Con deep, también los cambios por dentro.' },
        { texto: 'localStorage se borra al recargar la página.', cierto: false, porque: 'Falso: justamente su gracia es que sobrevive a recargas y cierres. Lo que se borra al recargar es la memoria de la pestaña (tus refs).' },
        { texto: 'getItem devuelve null si nunca se guardó nada con esa clave.', cierto: true, porque: 'Cierto, y por eso la lectura se protege con un if antes del JSON.parse.' },
      ],
    }),

    completar({
      id: '14-6',
      titulo: 'El patrón de memoria, de memoria',
      enunciado: 'Completa las dos costuras de la persistencia: el traductor de ida, el de vuelta y el gancho del arranque.',
      pista: 'De array a texto, de texto a array, y la función del nacimiento.',
      plantilla: `watch(favoritos, (n) => {
  localStorage.setItem('favoritos', JSON.___(n))
}, { deep: true })

___(() => {
  const g = localStorage.getItem('favoritos')
  if (g) favoritos.value = JSON.___(g)
})`,
      huecos: [
        { respuestas: ['stringify'], porque: 'stringify convierte el array en texto para poder guardarlo.' },
        { respuestas: ['onMounted'], porque: 'onMounted engancha la lectura al arranque del componente.' },
        { respuestas: ['parse'], porque: 'parse reconstruye el array desde el texto guardado.' },
      ],
    }),

    emparejar({
      id: '14-7',
      titulo: 'Las herramientas del acto',
      enunciado: 'El repaso del Acto III entero: une cada herramienta con su pregunta.',
      pista: 'Son las seis piezas que llevas usando siete mundos.',
      pares: [
        { izquierda: 'ref', derecha: 'guardar un dato que avisa al cambiar' },
        { izquierda: 'computed', derecha: 'derivar un valor que se mantiene al día' },
        { izquierda: 'watch', derecha: 'ejecutar un efecto cuando algo cambia', porque: 'Valor nuevo → computed. Acción → watch. La distinción del acto.' },
        { izquierda: 'onMounted', derecha: 'hacer algo una vez, al arrancar' },
      ],
      porque: 'ref guarda, computed deriva, watch actúa, onMounted arranca. Con v-model y los eventos, son la caja de herramientas completa de los datos.',
    }),

    {
      id: '14-8',
      titulo: 'Favoritos con memoria',
      sintesis: true,
      enunciado:
        'Sin pistas. El cierre del acto: los imports de <code>onMounted</code> y <code>watch</code>, el <code>watch</code> de <code>favoritos</code> guardando con <code>JSON.stringify</code> y <code>{ deep: true }</code>, el <code>onMounted</code> recuperando con <code>getItem</code> + <code>if</code> + <code>JSON.parse</code>, y el contador <code>{{ favoritos.length }}</code> a la vista. Marca, recarga, comprueba: la web recuerda.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/import\s*\{[^}]*\bonMounted\b[^}]*\}/, { falta: 'Falta el import de onMounted.' }),
          scriptContiene(/watch\s*\(\s*favoritos/, { falta: 'Falta el watch de favoritos.' }),
          scriptContiene(/JSON\.stringify\s*\(/, { falta: 'Falta JSON.stringify al guardar.' }),
          scriptContiene(/deep\s*:\s*true/, { falta: 'Falta el { deep: true }.' }),
          scriptContiene(/onMounted\s*\(/, { falta: 'Falta el onMounted.' }),
          scriptContiene(/JSON\.parse\s*\(/, { falta: 'Falta JSON.parse al recuperar.' }),
        ],
        template: [
          plantillaContiene(/\{\{\s*favoritos\.length\s*\}\}/, 'Falta el contador {{ favoritos.length }}.'),
        ],
        exito:
          'La web recuerda. Con esto cierras el Acto III: datos, eventos, condiciones, listas, derivados, formularios y persistencia. Es el corazón de Vue, y late en tu catálogo. El siguiente acto pone orden: componentes.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Fíjate en la simetría del patrón: watch escribe cuando algo cambia, onMounted lee cuando algo nace. Entre los dos, el dato ' +
      'nunca se pierde. Y un secreto: este taller usa exactamente ese patrón para recordar tu progreso. Ya sabes leer nuestra propia tramoya.',
  },
}
