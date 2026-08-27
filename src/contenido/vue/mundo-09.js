// Mundo 9 (Vue) — Eventos: botones que hacen cosas.
//
// Segundo mundo del Acto III. Con los datos en su sitio, entra la otra mitad
// de la reactividad: el usuario. @click escucha, una función cambia el dato, y
// la página se repinta. Se construye el contador de "me lo quedo" del catálogo.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import {
  comprobarVue,
  plantillaContiene,
  scriptContiene,
  scriptDeclara,
  scriptDefine,
  scriptImporta,
  scriptLlama,
} from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, ordenar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'

const meLoQuedo = ref(0)
</script>

<template>
  <main>
    <h1>El Sombrero</h1>
    <p>Sombreros que te quedarías: {{ meLoQuedo }}</p>
    <button>Me lo quedo</button>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #b06a2c;
  border-radius: 0.4rem;
  background: #f7f1e6;
  cursor: pointer;
}
</style>
`

export default {
  numero: 9,
  acto: 'Datos',
  titulo: 'Mundo 9 · Botones que hacen cosas',

  entradilla: {
    quien: 'wayne',
    texto:
      'Ese botón de ahí no hace nada. Pulsa, pulsa… nada. Hoy le damos trabajo: escuchar el clic, ' +
      'llamar a una función, y que la función cambie el dato. El dato avisa, la página se repinta, ' +
      'y de repente tienes una aplicación en vez de un cartel.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'

const meLoQuedo = ref(0)

function quedarse() {
  meLoQuedo.value = meLoQuedo.value + 1
}

function soltar() {
  if (meLoQuedo.value > 0) meLoQuedo.value = meLoQuedo.value - 1
}
</script>

<template>
  <main>
    <h1>El Sombrero</h1>
    <p>Sombreros que te quedarías: {{ meLoQuedo }}</p>
    <button @click="quedarse">Me lo quedo</button>
    <button @click="soltar">Mejor no</button>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #b06a2c;
  border-radius: 0.4rem;
  background: #f7f1e6;
  cursor: pointer;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'Escuchar, ejecutar, repintar',
    cuerpo: `El mundo pasado montaste la mitad del circuito: dato → página. Hoy la otra mitad: **persona → dato**. Con las dos, el círculo se cierra y la página está viva.

**1. Se escucha con \`@click\`.**

\`\`\`
<button @click="quedarse">Me lo quedo</button>
\`\`\`

La arroba es la forma corta de \`v-on:\`, la directiva de Vue para **escuchar eventos**. \`@click="quedarse"\` significa: "cuando hagan clic en este botón, llama a la función \`quedarse\`". Fíjate en que va **sin paréntesis**: le estás dando a Vue el nombre de la función para que la llame él cuando toque, no llamándola tú ahora. (Con paréntesis también funciona, y hace falta cuando pasas argumentos: \`@click="quitar(3)"\`. Pero la forma base es el nombre a secas.)

**2. La función se declara en el script.**

\`\`\`
function quedarse() {
  meLoQuedo.value = meLoQuedo.value + 1
}
\`\`\`

Una función es un bloque de código con nombre que se ejecuta cuando alguien lo llama. Esta lee el valor actual del ref (\`meLoQuedo.value\`), le suma uno y lo vuelve a guardar. Como estamos **en el script**, el \`.value\` es obligatorio: es la regla del mundo pasado, y aquí es donde más se olvida. Hay un atajo que verás mucho: \`meLoQuedo.value += 1\` (o \`++\`) hace lo mismo en menos letras.

**3. Y el circuito completo:** clic → \`@click\` llama a \`quedarse\` → la función cambia el dato → el ref avisa a Vue → la página repinta el \`{{ meLoQuedo }}\`. Tú no has tocado el HTML en ningún momento. Has cambiado **el dato**, y la página ha ido detrás. Esa disciplina —tocar datos, nunca la página— es lo que hace que las apps de Vue no se conviertan en un plato de espaguetis.

**Más eventos que clics.** \`@click\` es el primero, pero la arroba escucha lo que sea: \`@input\` (cada tecla en un campo), \`@submit\` (enviar un formulario), \`@mouseover\` (pasar el ratón), \`@keyup.enter\` (soltar la tecla Enter; eso del punto es un **modificador**, un filtro que Vue te regala). Otro modificador que usarás pronto: \`@submit.prevent\` evita que el formulario recargue la página, que es su comportamiento antiguo de fábrica.

**Lógica dentro de la función.** Las funciones pueden decidir. ¿Que el contador no baje de cero?

\`\`\`
function soltar() {
  if (meLoQuedo.value > 0) meLoQuedo.value -= 1
}
\`\`\`

El \`if\` ejecuta la línea solo si la condición es verdad. Las reglas del negocio —"no hay contadores negativos", "máximo diez por cliente"— viven ahí, en las funciones, no en el HTML.`,
  },

  pasos: [
    {
      id: '9-1',
      titulo: 'La función que suma',
      enunciado:
        'En el script, debajo del ref, declara la función: <code>function quedarse() { meLoQuedo.value += 1 }</code> (o con <code>= meLoQuedo.value + 1</code>, como prefieras).',
      pista: 'Recuerda el .value: en el script el ref se toca por dentro. Sin .value, no funciona.',
      comprobar: comprobarVue({
        script: [
          scriptDefine('quedarse', { falta: 'Falta declarar la función quedarse en el script.' }),
          scriptContiene(/meLoQuedo\.value\s*(\+=|\+\+|=\s*meLoQuedo\.value\s*\+)/, {
            falta: 'La función tiene que sumar 1 al dato: meLoQuedo.value += 1. No olvides el .value.',
          }),
        ],
        exito: 'La función está lista. Ahora solo falta que alguien la llame… y ese alguien va a ser el botón.',
      }),
    },

    {
      id: '9-2',
      titulo: 'Conecta el botón',
      enunciado:
        'En el template, engancha el evento: <code>&lt;button @click="quedarse"&gt;</code>. Guarda y pulsa el botón en la vista previa: el contador sube.',
      pista: 'Es un atributo más del botón: <code>@click="quedarse"</code>, con el nombre de la función sin paréntesis.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(
            /@click\s*=\s*["']quedarse/,
            'Al botón le falta el @click="quedarse".',
          ),
        ],
        exito: 'Clic → función → dato → página. Acabas de cerrar el circuito de la reactividad. Dale unas cuantas veces, que es gratis.',
      }),
    },

    eleccion({
      id: '9-3',
      titulo: 'Con o sin paréntesis',
      enunciado: 'En <code>@click="quedarse"</code> la función va sin paréntesis. ¿Por qué?',
      pista: '¿Quién llama a la función, tú al escribir la línea, o Vue cuando pase algo?',
      opciones: [
        {
          texto: 'Le das a Vue el NOMBRE de la función para que la llame él en cada clic.',
          correcta: true,
          porque: 'Eso es: tú entregas la función, Vue la ejecuta cuando ocurra el evento. Los paréntesis solo hacen falta para pasar argumentos: @click="quitar(3)".',
        },
        {
          texto: 'Es una errata de Vue que se mantiene por costumbre.',
          porque: 'No: es intencional y significa algo. El nombre entrega la función; los paréntesis la ejecutarían.',
        },
        {
          texto: 'Con paréntesis daría error de compilación siempre.',
          porque: 'No da error: @click="quedarse()" también funciona (Vue lo envuelve). La diferencia importa para entender qué estás entregando, y para pasar argumentos.',
        },
      ],
    }),

    {
      id: '9-4',
      titulo: 'El botón de arrepentirse',
      enunciado:
        'Añade un segundo botón «Mejor no» con su función <code>soltar</code> que <strong>reste</strong> 1… pero solo si el contador está por encima de cero. Un <code>if</code> lo vigila.',
      pista: 'La función: <code>function soltar() { if (meLoQuedo.value &gt; 0) meLoQuedo.value -= 1 }</code>. Y el botón nuevo con <code>@click="soltar"</code>.',
      comprobar: comprobarVue({
        script: [
          scriptDefine('soltar', { falta: 'Falta la función soltar en el script.' }),
          scriptContiene(/if\s*\(\s*meLoQuedo\.value\s*>\s*0\s*\)/, {
            falta: 'A soltar le falta el if (meLoQuedo.value > 0) que impide bajar de cero.',
          }),
        ],
        template: [
          plantillaContiene(/@click\s*=\s*["']soltar/, 'Falta el segundo botón con @click="soltar".'),
        ],
        exito: 'Sube, baja, y nunca por debajo de cero. Esa regla vive en la función, que es donde viven las reglas.',
      }),
    },

    verdaderoFalso({
      id: '9-5',
      titulo: 'Cierto o falso: eventos',
      enunciado: 'Cinco frases sobre @click y las funciones. Todas.',
      pista: 'Quién escucha, quién cambia el dato, y el dichoso .value.',
      afirmaciones: [
        { texto: '@click es la forma corta de v-on:click.', cierto: true, porque: 'Cierto: la arroba es el atajo de v-on, la directiva de escuchar eventos.' },
        { texto: 'Dentro de una función del script, el ref se cambia sin .value.', cierto: false, porque: 'Falso: en el script SIEMPRE .value. Es el despiste número uno de Vue.' },
        { texto: 'El circuito es: clic → función → cambia el dato → Vue repinta.', cierto: true, porque: 'Cierto, y fíjate en que la página nunca se toca a mano: se tocan los datos.' },
        { texto: '@click solo funciona en botones.', cierto: false, porque: 'Falso: puedes escuchar clics en cualquier elemento. Otra cosa es que el botón sea lo correcto para "acciones".' },
        { texto: '@submit.prevent evita que el formulario recargue la página.', cierto: true, porque: 'Cierto: .prevent es un modificador que le quita al navegador su comportamiento antiguo de fábrica.' },
      ],
    }),

    completar({
      id: '9-6',
      titulo: 'El circuito de memoria',
      enunciado: 'Completa el contador mínimo: el evento, el .value y la conexión.',
      pista: 'La directiva del clic, la propiedad para tocar el ref, y el nombre de la función en el botón.',
      plantilla: `function sumar() {
  contador.___ += 1
}

// en el template:
// <button ___="sumar">+1</button>`,
      huecos: [
        { respuestas: ['value'], porque: 'En el script, el ref se toca por su .value.' },
        { respuestas: ['@click', 'v-on:click'], porque: '@click (o v-on:click) escucha el clic y llama a la función.' },
      ],
    }),

    ordenar({
      id: '9-7',
      titulo: 'Un clic, por dentro',
      enunciado: 'Ordena lo que pasa desde que la persona pulsa hasta que ve el cambio.',
      pista: 'Es la cadena del mundo pasado, con el clic delante.',
      lineas: [
        'La persona pulsa el botón',
        '@click llama a la función quedarse',
        'La función cambia el dato: meLoQuedo.value += 1',
        'El ref avisa a Vue',
        'Vue repinta el {{ meLoQuedo }} del template',
      ],
      porque: 'Clic, función, dato, aviso, repintado. Cada botón de cada app Vue del mundo hace exactamente este viaje.',
    }),

    emparejar({
      id: '9-8',
      titulo: 'Eventos y modificadores',
      enunciado: 'Une cada escuchador con lo que escucha.',
      pista: 'Uno es el clic, otro las teclas, otro el envío, y el último filtra una tecla concreta.',
      pares: [
        { izquierda: '@click', derecha: 'un clic en el elemento' },
        { izquierda: '@input', derecha: 'cada cambio en un campo de texto' },
        { izquierda: '@submit.prevent', derecha: 'el envío del formulario, sin recargar', porque: 'El .prevent le quita al navegador la recarga de fábrica.' },
        { izquierda: '@keyup.enter', derecha: 'soltar la tecla Enter' },
      ],
      porque: 'La arroba escucha cualquier evento, y los modificadores (.prevent, .enter) filtran sin que escribas los ifs a mano.',
    }),

    {
      id: '9-9',
      titulo: 'El contador completo',
      sintesis: true,
      enunciado:
        'Sin pistas. Deja el componente con el circuito entero: el ref <code>meLoQuedo</code>, la función <code>quedarse</code> que suma, la función <code>soltar</code> que resta con su <code>if</code> de no bajar de cero, un botón con <code>@click="quedarse"</code> y otro con <code>@click="soltar"</code>, y el <code>{{ meLoQuedo }}</code> a la vista.',
      comprobar: comprobarVue({
        script: [
          scriptDeclara('meLoQuedo', { llamando: 'ref', falta: 'Falta el ref meLoQuedo.' }),
          scriptDefine('quedarse', { falta: 'Falta la función quedarse.' }),
          scriptDefine('soltar', { falta: 'Falta la función soltar.' }),
          scriptContiene(/if\s*\(\s*meLoQuedo\.value\s*>\s*0\s*\)/, { falta: 'A soltar le falta el if que impide bajar de cero.' }),
        ],
        template: [
          plantillaContiene(/@click\s*=\s*["']quedarse/, 'Falta el botón con @click="quedarse".'),
          plantillaContiene(/@click\s*=\s*["']soltar/, 'Falta el botón con @click="soltar".'),
          plantillaContiene(/\{\{\s*meLoQuedo\s*\}\}/, 'Falta enseñar {{ meLoQuedo }}.'),
        ],
        exito:
          'Una aplicación de verdad: datos, botones, reglas. Pequeña, sí. Pero el patrón que acabas de montar es el mismo de cualquier app grande: solo cambia el número de datos y botones.',
      }),
    },
  ],

  cierre: {
    quien: 'wax',
    texto:
      'Quédate con la disciplina, que vale más que la sintaxis: los eventos llaman a funciones, las funciones cambian datos, y la página va sola detrás. ' +
      'Nunca toques la página a mano. Si respetas eso, tus aplicaciones crecerán sin enredarse. Lo siguiente: enseñar y ocultar cosas según los datos.',
  },
}
