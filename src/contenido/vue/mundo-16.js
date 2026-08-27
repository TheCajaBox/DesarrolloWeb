// Mundo 16 (Vue) — Props: los datos bajan.
//
// Segundo mundo del Acto IV. El hijo declara qué necesita (defineProps), el
// padre se lo pasa como atributos atados (:sombrero="sombrero"), y las fichas
// por fin dicen cada una lo suyo. Se cubre también el flujo unidireccional:
// las props se leen, no se tocan.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  ficheroContiene,
  plantillaContiene,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const APP_SEMBRADA = `<script setup>
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
`

const FICHA_SEMBRADA = `<script setup>
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
`

export default {
  numero: 16,
  acto: 'Componentes que hablan',
  titulo: 'Mundo 16 · Los datos bajan: props',

  entradilla: {
    quien: 'wax',
    texto:
      'Tres fichas idénticas: el hijo tiene la plantilla pero no los datos. La solución tiene nombre: props. ' +
      'El hijo declara qué necesita recibir, el padre se lo pasa al usarlo, y cada copia se rellena con lo suyo. ' +
      'Es el mecanismo número uno de comunicación en Vue, y hoy lo dominas.',
  },

  ficheros: {
    'src/App.vue': APP_SEMBRADA,
    'src/components/FichaSombrero.vue': FICHA_SEMBRADA,
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
      <FichaSombrero
        v-for="sombrero in sombreros"
        :key="sombrero.id"
        :sombrero="sombrero"
      />
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
const props = defineProps({
  sombrero: { type: Object, required: true },
})
</script>

<template>
  <article class="ficha">
    <h2>{{ sombrero.nombre }}</h2>
    <p>{{ sombrero.precio }} €</p>
    <p v-if="sombrero.precio < 30" class="ganga">¡Ganga!</p>
  </article>
</template>

<style scoped>
.ficha {
  background: #f7f1e6;
  padding: 1.2rem;
  border: 1px solid #d8c9ad;
  border-radius: 0.6rem;
}

.ganga {
  color: #86a95e;
  font-weight: 700;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Props: el contrato entre padre e hijo',
    cuerpo: `Una prop es un dato que el padre le pasa al hijo. El mecanismo tiene dos mitades, una en cada fichero, y juntas forman un contrato.

**Mitad 1: el hijo declara qué acepta.** En el script del hijo:

\`\`\`
const props = defineProps({
  sombrero: { type: Object, required: true },
})
\`\`\`

\`defineProps\` es especial: no se importa (Vue la conoce dentro de \`<script setup>\`), y declara las entradas del componente. Aquí dice: "acepto una prop llamada \`sombrero\`, que debe ser un objeto (\`type: Object\`), y es obligatoria (\`required: true\`)". Esa declaración con tipo y obligatoriedad no es burocracia: si el padre se equivoca —olvida pasarla, pasa un texto—, Vue avisa por consola señalando el error. Es documentación que vigila. Los tipos que usarás: \`String\`, \`Number\`, \`Boolean\`, \`Array\`, \`Object\`. Y para las opcionales, un valor por defecto: \`{ type: Number, default: 0 }\`.

**En el template del hijo, la prop se usa como cualquier dato:**

\`\`\`
<h2>{{ sombrero.nombre }}</h2>
<p v-if="sombrero.precio < 30">¡Ganga!</p>
\`\`\`

Interpolaciones, condiciones, lo que quieras: una prop es un dato de solo lectura con todos los derechos.

**Mitad 2: el padre la pasa al usar el componente.**

\`\`\`
<FichaSombrero
  v-for="sombrero in sombreros"
  :key="sombrero.id"
  :sombrero="sombrero"
/>
\`\`\`

Los dos puntos de \`:sombrero="sombrero"\` son el \`v-bind\` del Mundo 10: atan la prop a una **expresión** (aquí, la variable del v-for). Sin ellos, \`sombrero="sombrero"\` pasaría el TEXTO "sombrero", nueve letras, no el objeto. Regla mnemotécnica: **¿dato? dos puntos. ¿texto literal? sin ellos.** Como cada vuelta del v-for pasa SU objeto, cada copia del hijo recibe el suyo: por fin las tres fichas dicen cosas distintas.

**La regla de oro: las props bajan, y solo bajan.** El hijo LEE sus props, jamás las modifica (\`sombrero.precio = 10\` dentro del hijo es un anti-patrón que Vue te reprochará). ¿Por qué tanta seriedad? Porque si cualquier hijo pudiera manosear los datos del padre, con veinte componentes ya no sabrías quién cambió qué, y depurar sería arqueología. El flujo unidireccional —datos bajan por props, avisos suben por eventos— mantiene un solo dueño por dato. La mitad que sube (los emits) es el próximo mundo.

**Piénsalo como una función.** Un componente con props es como una función con parámetros: \`FichaSombrero(sombrero)\` → una ficha pintada. Mismo molde, distinto material, resultado distinto. Esa es la esencia de la reutilización.`,
  },

  pasos: [
    {
      id: '16-1',
      titulo: 'El hijo declara',
      enunciado:
        'En el script de <code>FichaSombrero.vue</code>, declara la prop: <code>const props = defineProps({ sombrero: { type: Object, required: true } })</code>.',
      pista: 'defineProps no se importa: dentro de script setup, Vue ya la conoce. El objeto de dentro describe cada prop.',
      comprobar: comprobarVue({
        fichero: 'src/components/FichaSombrero.vue',
        script: [
          (script) =>
            /defineProps\s*\(/.test(script) ? null : 'Al script del hijo le falta defineProps({ … }).',
          (script) =>
            /sombrero\s*:\s*\{[^}]*type\s*:\s*Object/.test(script)
              ? null
              : 'La prop sombrero tiene que declararse con type: Object.',
          (script) =>
            /required\s*:\s*true/.test(script) ? null : 'Márcala como obligatoria: required: true.',
        ],
        exito: 'Contrato firmado por parte del hijo: "acepto un objeto sombrero, y sin él no trabajo". Ahora el padre tiene que cumplirlo.',
      }),
    },

    {
      id: '16-2',
      titulo: 'El hijo la usa',
      enunciado:
        'En el template del hijo, sustituye los textos fijos: el <code>&lt;h2&gt;</code> enseña <code>{{ sombrero.nombre }}</code> y el párrafo <code>{{ sombrero.precio }} €</code>.',
      pista: 'La prop se usa como cualquier dato: interpolación con su nombre y el punto para entrar al objeto.',
      comprobar: comprobarVue({
        fichero: 'src/components/FichaSombrero.vue',
        template: [
          plantillaContiene(/\{\{\s*sombrero\.nombre\s*\}\}/, 'El h2 del hijo tiene que enseñar {{ sombrero.nombre }}.'),
          plantillaContiene(/\{\{\s*sombrero\.precio\s*\}\}/, 'El párrafo tiene que enseñar {{ sombrero.precio }}.'),
        ],
        exito: 'El hijo ya pinta lo que le llegue. Fíjate en la vista previa: ahora mismo llega… nada. Consola del navegador: Vue está avisando de la prop obligatoria que falta.',
      }),
    },

    {
      id: '16-3',
      titulo: 'El padre cumple',
      enunciado:
        'En <code>App.vue</code>, pásale a cada copia su objeto: añade <code>:sombrero="sombrero"</code> al <code>&lt;FichaSombrero&gt;</code> del v-for. Y mira la vista previa: cada ficha, con lo suyo.',
      pista: 'Con los dos puntos delante: :sombrero="sombrero". El primero es el nombre de la prop; el segundo, la variable del v-for.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(
            /<FichaSombrero[^>]*:sombrero\s*=\s*["']sombrero["']/,
            'Al <FichaSombrero> del v-for le falta :sombrero="sombrero".',
          ),
        ],
        exito: 'Bombín, panamá, gorra: cada copia con sus datos. Mismo molde, distinto material. Eso son las props.',
      }),
    },

    eleccion({
      id: '16-4',
      titulo: 'Los dos puntos, otra vez',
      enunciado: 'Si escribes <code>sombrero="sombrero"</code> SIN los dos puntos, ¿qué recibe el hijo?',
      pista: '¿Atributo atado a una expresión, o atributo de texto de toda la vida?',
      opciones: [
        {
          texto: 'El texto literal "sombrero": nueve letras, no el objeto.',
          correcta: true,
          porque: 'Exacto: sin los dos puntos es un atributo HTML normal, texto fijo. Con ellos, Vue evalúa la expresión y pasa el objeto.',
        },
        {
          texto: 'El objeto igualmente: Vue es listo y lo deduce.',
          porque: 'No deduce: los dos puntos son precisamente la señal de "esto es una expresión". Sin señal, texto.',
        },
        {
          texto: 'Nada: da error de compilación.',
          porque: 'No hay error, que es lo traicionero: el hijo recibe un texto donde esperaba un objeto, y el aviso llega después, por consola.',
        },
      ],
    }),

    {
      id: '16-5',
      titulo: 'La etiqueta de ganga',
      enunciado:
        'El hijo puede decidir con sus props: añade en su template <code>&lt;p v-if="sombrero.precio &lt; 30" class="ganga"&gt;¡Ganga!&lt;/p&gt;</code> y dale a <code>.ganga</code> un estilo en su <code>&lt;style scoped&gt;</code>.',
      pista: 'El v-if usa la prop como cualquier dato. La regla .ganga va en el style del HIJO: su aspecto viaja con él.',
      comprobar: comprobarVue({
        fichero: 'src/components/FichaSombrero.vue',
        template: [
          plantillaContiene(/v-if\s*=\s*["']sombrero\.precio\s*<\s*30["']/, 'Falta el v-if="sombrero.precio < 30" en el hijo.'),
        ],
        estilo: [
          (reglas) =>
            reglas.some((r) => /\.ganga/.test(r.selector))
              ? null
              : 'Falta la regla .ganga en el style scoped del hijo.',
        ],
        exito: 'La gorra grita ¡Ganga! y las demás callan: el hijo decide con los datos que le bajan. Lógica local, datos del padre.',
      }),
    },

    verdaderoFalso({
      id: '16-6',
      titulo: 'Cierto o falso: props',
      enunciado: 'Cinco frases sobre el contrato de las props. Todas.',
      pista: 'Bajan, se declaran, no se tocan.',
      afirmaciones: [
        { texto: 'defineProps se usa sin importarlo dentro de script setup.', cierto: true, porque: 'Cierto: es una macro del compilador. Vue la reconoce ahí dentro sin import.' },
        { texto: 'El hijo puede modificar sus props si lo necesita.', cierto: false, porque: 'Falso: las props son de solo lectura. Si el hijo quiere un cambio, lo PIDE con un evento (próximo mundo).' },
        { texto: 'type y required hacen que Vue avise por consola si el padre se equivoca.', cierto: true, porque: 'Cierto: la declaración vigila. Prop que falta o de tipo equivocado, aviso al canto.' },
        { texto: 'Cada copia de un v-for recibe el mismo objeto en su prop.', cierto: false, porque: 'Falso: cada vuelta del v-for pasa SU objeto. Por eso cada ficha pinta lo suyo.' },
        { texto: 'Un componente con props es como una función con parámetros.', cierto: true, porque: 'Cierto, y es la mejor forma de pensarlo: mismo molde, distinto material.' },
      ],
    }),

    completar({
      id: '16-7',
      titulo: 'El contrato de memoria',
      enunciado: 'Completa las dos mitades del contrato: la declaración del hijo y el pase del padre.',
      pista: 'La macro que declara, el tipo objeto, y el prefijo que ata.',
      plantilla: `// en el hijo:
const props = ___({
  sombrero: { type: ___, required: true },
})

// en el padre:
// <FichaSombrero ___sombrero="sombrero" />`,
      huecos: [
        { respuestas: ['defineProps'], porque: 'defineProps declara las entradas del componente.' },
        { respuestas: ['Object'], porque: 'El sombrero entero es un objeto: type: Object.' },
        { respuestas: [':', 'v-bind:'], porque: 'Los dos puntos (v-bind) atan la prop a la expresión, no al texto.' },
      ],
    }),

    ordenar({
      id: '16-8',
      titulo: 'El viaje de un dato',
      enunciado: 'Ordena el viaje del dato desde el array del padre hasta la pantalla.',
      pista: 'Array, vuelta del bucle, prop, template del hijo.',
      lineas: [
        'El array sombreros vive en App.vue',
        'El v-for saca un sombrero en cada vuelta',
        ':sombrero="sombrero" se lo pasa a la copia del hijo',
        'El hijo lo declara con defineProps y lo recibe',
        'Su template lo pinta: {{ sombrero.nombre }}',
      ],
      porque: 'Array → v-for → prop → defineProps → template. El dato baja por el árbol sin perder el hilo. Así fluyen TODAS las apps Vue.',
    }),

    {
      id: '16-9',
      titulo: 'Las fichas de verdad',
      sintesis: true,
      enunciado:
        'Sin pistas. El contrato completo: el hijo con <code>defineProps</code> (type Object, required), pintando <code>{{ sombrero.nombre }}</code>, <code>{{ sombrero.precio }}</code> y la ganga condicional con su estilo; el padre pasando <code>:sombrero="sombrero"</code> en el v-for. Tres fichas, tres contenidos, un solo molde.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/<FichaSombrero[^>]*:sombrero\s*=\s*["']sombrero["']/, 'El padre tiene que pasar :sombrero="sombrero".'),
          ficheroContiene('src/components/FichaSombrero.vue', /defineProps\s*\(/, 'Al hijo le falta defineProps.'),
          ficheroContiene('src/components/FichaSombrero.vue', /required\s*:\s*true/, 'La prop del hijo tiene que ser required.'),
          ficheroContiene('src/components/FichaSombrero.vue', /\{\{\s*sombrero\.nombre\s*\}\}/, 'El hijo tiene que pintar {{ sombrero.nombre }}.'),
          ficheroContiene('src/components/FichaSombrero.vue', /v-if\s*=\s*["']sombrero\.precio\s*<\s*30["']/, 'Falta la ganga condicional en el hijo.'),
          ficheroContiene('src/components/FichaSombrero.vue', /\.ganga\s*\{/, 'Falta la regla .ganga en el style del hijo.'),
        ],
        exito:
          'Contrato completo y funcionando: datos que bajan declarados y vigilados, hijo que pinta y decide, padre que manda. La mitad descendente de la comunicación está dominada. Ahora, la que sube.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Fíjate qué limpio queda: el padre tiene los datos, el hijo tiene el molde, y la frontera es una lista de props declarada. ' +
      'Cualquiera que abra FichaSombrero.vue sabe en dos segundos qué necesita para funcionar. Pero oye, ¿y si el hijo quiere avisar de algo al padre? Ajá. Mañana… bueno, ahora.',
  },
}
