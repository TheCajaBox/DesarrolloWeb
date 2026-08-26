// Mundo 10 (Vue) — v-if, v-else y v-show: enseñar según los datos.
//
// Tercer mundo del Acto III. La página empieza a decidir qué enseña: el cartel
// de "agotado", el aviso de la cesta vacía, el botón que solo aparece si toca.
// v-if quita del todo; v-show esconde; :disabled apaga. Y el dato manda.
//
// Dialogos originales, en el registro de los personajes. Nada de los libros.

import { comprobarVue, scriptContiene } from '../mundos/comprobaciones.js'
import { completar, eleccion, emparejar, verdaderoFalso } from '../mundos/tipos-de-paso.js'

function plantillaContiene(patron, mensaje) {
  return (_doc, _ficheros, partido) => (patron.test(partido?.template || '') ? null : mensaje)
}

const APP_SEMBRADA = `<script setup>
import { ref } from 'vue'

const enCesta = ref(0)

function meter() {
  enCesta.value += 1
}
</script>

<template>
  <main>
    <h1>El Sombrero</h1>
    <p>En la cesta: {{ enCesta }}</p>
    <button @click="meter">A la cesta</button>
    <p>La cesta está vacía.</p>
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

export default {
  numero: 10,
  acto: 'Datos',
  titulo: 'Mundo 10 · La página decide',

  entradilla: {
    quien: 'wayne',
    texto:
      'Ese cartel de "la cesta está vacía" es mentira en cuanto metes algo, y ahí sigue, tan campante. ' +
      'Hoy la página aprende a decidir: esto se enseña si pasa tal cosa, esto otro si no. ' +
      'La condición la pone el dato, no tú con unas tijeras.',
  },

  ficheros: { 'src/App.vue': APP_SEMBRADA },

  solucion: {
    'src/App.vue': `<script setup>
import { ref } from 'vue'

const enCesta = ref(0)
const LIMITE = 5

function meter() {
  if (enCesta.value < LIMITE) enCesta.value += 1
}

function vaciar() {
  enCesta.value = 0
}
</script>

<template>
  <main>
    <h1>El Sombrero</h1>

    <p v-if="enCesta === 0">La cesta está vacía. De momento.</p>
    <p v-else>En la cesta: {{ enCesta }}</p>

    <p v-if="enCesta >= LIMITE" class="aviso">No te caben más sombreros en la cabeza.</p>

    <button @click="meter" :disabled="enCesta >= LIMITE">A la cesta</button>
    <button v-if="enCesta > 0" @click="vaciar">Vaciar</button>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
}

.aviso {
  color: #a03e2d;
  font-weight: 600;
}
</style>
`,
  },

  apunte: {
    quien: 'wax',
    titulo: 'v-if, v-else y compañía',
    cuerpo: `Hasta ahora, todo lo que escribías en el template salía en pantalla, siempre. Hoy entra la condición: trozos de página que existen **solo si** los datos dicen que sí.

**\`v-if\`: existe o no existe.**

\`\`\`
<p v-if="enCesta === 0">La cesta está vacía.</p>
\`\`\`

Se lee: "este párrafo solo existe si \`enCesta\` es exactamente cero". Dentro de las comillas va una **condición**, una expresión que da verdadero o falso. Las escribirás a docenas: \`===\` (igual a), \`!==\` (distinto de), \`>\`, \`<\`, \`>=\`, \`<=\`. Ojo al triple igual: en JavaScript, \`=\` asigna y \`===\` compara. Confundirlos es un clásico.

**\`v-else\`: lo contrario, sin repetir la condición.**

\`\`\`
<p v-if="enCesta === 0">La cesta está vacía.</p>
<p v-else>En la cesta: {{ enCesta }}</p>
\`\`\`

El \`v-else\` va en el elemento **inmediatamente siguiente** al del \`v-if\` (esa es su única regla: pegados, sin nada en medio) y se enseña cuando la condición del \`v-if\` es falsa. Hay un tercero, \`v-else-if\`, para encadenar más casos: "si cero, esto; si menos de tres, esto otro; si no, aquello".

**\`v-show\`: esconder en vez de quitar.** Hace casi lo mismo a la vista, pero por dentro es distinto: \`v-if\` **quita el elemento del documento** (no existe, ni se ve ni ocupa); \`v-show\` lo deja en el documento pero **lo esconde con CSS** (\`display: none\`). ¿Cuál usar? \`v-if\` cuando la condición cambia poco (una sección entera que casi nunca se abre); \`v-show\` cuando cambia todo el rato (un menú que abre y cierra sin parar), porque esconder y enseñar es más barato que destruir y reconstruir. Si dudas, \`v-if\` y a otra cosa.

**\`:disabled\`: apagar en vez de ocultar.** A veces no quieres que el botón desaparezca, sino que se quede pero apagado:

\`\`\`
<button :disabled="enCesta >= LIMITE">A la cesta</button>
\`\`\`

Esos dos puntos delante son \`v-bind\`, la directiva que **ata un atributo a una expresión**: el atributo \`disabled\` del botón vale lo que diga la condición, y se actualiza solo cuando el dato cambie. Sin los dos puntos, \`disabled="…"\` sería un texto fijo; con ellos, es un dato vivo. Este \`:\` te lo vas a encontrar en todas partes: \`:src\`, \`:href\`, \`:class\`… es la manera de que cualquier atributo dependa de los datos.

**La idea de fondo, otra vez la misma:** tú no enseñas ni ocultas nada a mano. Describes las condiciones —"este aviso existe si la cesta está llena"— y son los **datos** los que encienden y apagan. La página es un espejo de los datos, siempre.`,
  },

  pasos: [
    {
      id: '10-1',
      titulo: 'El cartel sincero',
      enunciado:
        'Ponle la condición al cartel: <code>&lt;p v-if="enCesta === 0"&gt;La cesta está vacía…&lt;/p&gt;</code>. Guarda, mete un sombrero en la vista previa, y mira cómo el cartel desaparece.',
      pista: 'v-if va como un atributo del p, con la condición entre comillas. Triple igual para comparar.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(
            /v-if\s*=\s*["']enCesta\s*===?\s*0["']/,
            'Al párrafo de la cesta vacía le falta el v-if="enCesta === 0".',
          ),
        ],
        exito: 'El cartel ya solo existe cuando es verdad. La condición lo enciende y lo apaga; tú ya no pintas nada a mano.',
      }),
    },

    {
      id: '10-2',
      titulo: 'Y si no, la cuenta',
      enunciado:
        'Justo debajo, en el elemento siguiente, añade el contrario: <code>&lt;p v-else&gt;En la cesta: {{ enCesta }}&lt;/p&gt;</code>. Uno u otro, nunca los dos.',
      pista: 'v-else no lleva condición (es "en caso contrario") y su elemento va PEGADO al del v-if.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(/v-else(?![-\w])/, 'Falta el párrafo con v-else justo después del v-if.'),
          plantillaContiene(/\{\{\s*enCesta\s*\}\}/, 'El párrafo del v-else tiene que enseñar {{ enCesta }}.'),
        ],
        exito: 'Vacía o con cuenta: la página elige sola el mensaje verdadero. Eso son dos estados y cero mentiras.',
      }),
    },

    eleccion({
      id: '10-3',
      titulo: 'v-if contra v-show',
      enunciado: 'Un menú desplegable se abre y se cierra decenas de veces por sesión. ¿Qué le pones?',
      pista: '¿Compensa destruir y reconstruir algo que cambia todo el rato?',
      opciones: [
        {
          texto: 'v-show: queda en el documento, escondido con CSS, y alternar es baratísimo.',
          correcta: true,
          porque: 'Eso es: para cambios frecuentes, esconder gana a destruir. v-show paga una vez y alterna gratis.',
        },
        {
          texto: 'v-if: que no exista cuando está cerrado.',
          porque: 'Funcionaría, pero cada apertura reconstruye el menú entero. Para algo que alterna sin parar, v-show es más barato.',
        },
        {
          texto: 'Da exactamente igual, hacen lo mismo.',
          porque: 'A la vista sí; por dentro no: v-if quita del documento, v-show esconde con display: none. La diferencia se nota en cosas que alternan mucho.',
        },
      ],
    }),

    {
      id: '10-4',
      titulo: 'El límite de la cabeza',
      enunciado:
        'Nadie lleva seis sombreros a la vez. En el script, crea <code>const LIMITE = 5</code>, y en <code>meter</code> añade el <code>if</code> para no pasar del límite. Luego, un aviso en el template: <code>&lt;p v-if="enCesta &gt;= LIMITE"&gt;No te caben más…&lt;/p&gt;</code>.',
      pista: 'LIMITE es una constante normal, sin ref: no cambia. El if de meter: <code>if (enCesta.value &lt; LIMITE)</code>.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+LIMITE\s*=\s*\d+/, { falta: 'Falta const LIMITE = 5 en el script.' }),
          scriptContiene(/if\s*\(\s*enCesta\.value\s*<\s*LIMITE\s*\)/, {
            falta: 'A meter le falta el if (enCesta.value < LIMITE) que respeta el límite.',
          }),
        ],
        template: [
          plantillaContiene(/v-if\s*=\s*["']enCesta\s*>=\s*LIMITE["']/, 'Falta el aviso con v-if="enCesta >= LIMITE".'),
        ],
        exito: 'Regla en la función, aviso en el template, y el dato de árbitro. Cada pieza en su capa: así se hace.',
      }),
    },

    {
      id: '10-5',
      titulo: 'El botón se apaga',
      enunciado:
        'Mejor todavía: cuando la cesta esté llena, que el botón se quede pero apagado. Átale el atributo: <code>:disabled="enCesta &gt;= LIMITE"</code>.',
      pista: 'Los dos puntos delante de disabled son v-bind: atan el atributo a la condición. Sin ellos sería texto fijo.',
      comprobar: comprobarVue({
        template: [
          plantillaContiene(
            /:disabled\s*=\s*["']enCesta\s*>=\s*LIMITE["']|v-bind:disabled\s*=\s*["']enCesta\s*>=\s*LIMITE["']/,
            'Al botón le falta :disabled="enCesta >= LIMITE".',
          ),
        ],
        exito: 'Botón vivo pero obediente: los datos lo encienden y lo apagan. Ese : (v-bind) sirve para atar cualquier atributo.',
      }),
    },

    verdaderoFalso({
      id: '10-6',
      titulo: 'Cierto o falso: condiciones',
      enunciado: 'Cinco frases sobre v-if y sus parientes. Todas.',
      pista: 'Quitar contra esconder, comparar contra asignar.',
      afirmaciones: [
        { texto: 'v-if quita el elemento del documento; v-show lo esconde con CSS.', cierto: true, porque: 'Cierto, y esa es toda la diferencia entre ambos.' },
        { texto: 'El elemento con v-else puede ir en cualquier parte del template.', cierto: false, porque: 'Falso: tiene que ir inmediatamente después del elemento con v-if, pegado a él.' },
        { texto: 'En una condición, === compara y = asigna.', cierto: true, porque: 'Cierto: confundirlos es el error clásico. En condiciones, triple igual.' },
        { texto: ':disabled="condicion" apaga el botón cuando la condición es verdadera.', cierto: true, porque: 'Cierto: los dos puntos atan el atributo al dato, y se actualiza solo.' },
        { texto: 'Para un panel que se abre y cierra constantemente, v-if es más eficiente que v-show.', cierto: false, porque: 'Falso: v-if destruye y reconstruye cada vez; para alternancia frecuente, v-show es el barato.' },
      ],
    }),

    completar({
      id: '10-7',
      titulo: 'Los tres estados de una tienda',
      enunciado: 'Completa el clásico de toda tienda: cargando, vacío, o contenido (solo las directivas).',
      pista: 'La primera condición, la segunda condición encadenada, y el "si no".',
      plantilla: `<p ___="cargando">Cargando el catálogo…</p>
<p ___="total === 0">No hay sombreros todavía.</p>
<p ___>Tenemos {{ total }} sombreros.</p>`,
      huecos: [
        { respuestas: ['v-if'], porque: 'La primera condición se abre con v-if.' },
        { respuestas: ['v-else-if'], porque: 'v-else-if encadena: solo se mira si la anterior fue falsa.' },
        { respuestas: ['v-else'], porque: 'v-else recoge todo lo demás, sin condición.' },
      ],
    }),

    emparejar({
      id: '10-8',
      titulo: 'Herramienta y situación',
      enunciado: 'Une cada herramienta con su mejor caso de uso.',
      pista: 'Existir, alternar, apagar, atar.',
      pares: [
        { izquierda: 'v-if', derecha: 'una sección que casi nunca cambia de estado' },
        { izquierda: 'v-show', derecha: 'un panel que alterna constantemente', porque: 'Esconder con CSS es más barato que reconstruir cada vez.' },
        { izquierda: ':disabled', derecha: 'un botón que se queda, pero apagado' },
        { izquierda: ':src', derecha: 'una imagen cuya ruta sale de un dato' },
      ],
      porque: 'v-if decide existencia, v-show visibilidad, y los dos puntos atan atributos. Tres herramientas, tres matices.',
    }),

    {
      id: '10-9',
      titulo: 'La cesta que piensa',
      sintesis: true,
      enunciado:
        'Sin pistas. La cesta completa: el cartel de vacía con <code>v-if</code>, la cuenta con <code>v-else</code>, el <code>LIMITE</code> en el script con su <code>if</code> en <code>meter</code>, el aviso de lleno con <code>v-if</code>, el botón con <code>:disabled</code>… y un botón nuevo «Vaciar» (función <code>vaciar</code> que ponga el contador a 0) que <strong>solo exista</strong> si hay algo en la cesta.',
      comprobar: comprobarVue({
        script: [
          scriptContiene(/const\s+LIMITE\s*=\s*\d+/, { falta: 'Falta const LIMITE en el script.' }),
          scriptContiene(/function\s+vaciar\s*\(|const\s+vaciar\s*=/, { falta: 'Falta la función vaciar.' }),
          scriptContiene(/enCesta\.value\s*=\s*0/, { falta: 'vaciar tiene que dejar la cesta a cero: enCesta.value = 0.' }),
        ],
        template: [
          plantillaContiene(/v-if\s*=\s*["']enCesta\s*===?\s*0["']/, 'Falta el cartel de vacía con v-if.'),
          plantillaContiene(/v-else(?![-\w])/, 'Falta el v-else con la cuenta.'),
          plantillaContiene(/:disabled\s*=|v-bind:disabled\s*=/, 'Falta el :disabled del botón de meter.'),
          plantillaContiene(/v-if\s*=\s*["']enCesta\s*>\s*0["'][^>]*@click\s*=\s*["']vaciar|@click\s*=\s*["']vaciar["'][^>]*v-if\s*=\s*["']enCesta\s*>\s*0/, 'El botón Vaciar necesita las dos cosas: @click="vaciar" y v-if="enCesta > 0".'),
        ],
        exito:
          'Una interfaz que dice la verdad en todo momento: carteles, límites, botones que aparecen y se apagan cuando toca. Todo gobernado por un único dato. Así se diseña de verdad.',
      }),
    },
  ],

  cierre: {
    quien: 'wayne',
    texto:
      'Cuenta los estados que maneja tu cesta: vacía, con cosas, llena. Tres caminos, y no has escrito ni una sola línea que toque la página: ' +
      'solo condiciones. Cuando el catálogo tenga cien sombreros y veinte reglas, esto es lo que te salvará. Siguiente parada: listas que se pintan solas.',
  },
}
